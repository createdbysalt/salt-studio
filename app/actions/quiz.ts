'use server'

import {createClient} from 'next-sanity'
import {Resend} from 'resend'

import {apiVersion, dataset, projectId} from '@/sanity/lib/api'
import {
  OPENER_QUESTIONS,
  WEBSITE_QUESTION,
  questionsForTrack,
  resolveTrack,
} from '@/lib/quiz/config'
import {scoreQuiz} from '@/lib/quiz/scoring'

/**
 * Salt Score quiz submission — stores the lead in Sanity and emails it to the
 * studio inbox. Mirrors the graceful-degradation pattern of
 * app/actions/contact.ts: a missing RESEND_API_KEY or SANITY_API_WRITE_TOKEN
 * downgrades to console logging instead of failing the visitor.
 *
 * The score is recomputed server-side from raw answers, so a tampered client
 * can display whatever it wants but can't store a fake score.
 *
 * Required environment variables (see .env.example):
 * - SANITY_API_WRITE_TOKEN: token with create permission for quizSubmission
 * - RESEND_API_KEY / CONTACT_EMAIL / RESEND_FROM_EMAIL: same as contact form
 */

export type QuizSubmissionInput = {
  email: string
  answers: Record<string, string>
  waitlistOptIn: boolean
  /** Honeypot — must be empty; bots fill every field. */
  company?: string
  source?: {
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    referrer?: string
    landingPath?: string
  }
}

export type QuizSubmissionState = {
  success: boolean
  message: string
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const writeClient = process.env.SANITY_API_WRITE_TOKEN
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    })
  : null

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_TEXT_LENGTH = 1000

function sanitizeSource(source: QuizSubmissionInput['source']) {
  if (!source) return undefined
  const clean = (v: string | undefined) => (typeof v === 'string' ? v.slice(0, 200) : undefined)
  return {
    utmSource: clean(source.utmSource),
    utmMedium: clean(source.utmMedium),
    utmCampaign: clean(source.utmCampaign),
    referrer: clean(source.referrer),
    landingPath: clean(source.landingPath),
  }
}

export async function submitQuiz(input: QuizSubmissionInput): Promise<QuizSubmissionState> {
  try {
    // Honeypot: real visitors never see this field.
    if (input.company) {
      // Pretend success so bots don't adapt.
      return {success: true, message: 'Thanks!'}
    }

    const email = (input.email || '').trim()
    if (!EMAIL_REGEX.test(email)) {
      return {success: false, message: 'Please enter a valid email address.'}
    }

    const rawAnswers = input.answers && typeof input.answers === 'object' ? input.answers : {}
    // Only accept known question keys, as plain strings, length-capped.
    const track = resolveTrack(rawAnswers)
    const knownQuestions = [...OPENER_QUESTIONS, ...questionsForTrack(track), WEBSITE_QUESTION]
    const answers: Record<string, string> = {}
    for (const question of knownQuestions) {
      const value = rawAnswers[question.key]
      if (typeof value === 'string' && value.length > 0) {
        answers[question.key] = value.slice(0, MAX_TEXT_LENGTH)
      }
    }

    const result = scoreQuiz(track, answers)
    const submittedAt = new Date().toISOString()
    const source = sanitizeSource(input.source)

    const workflowAnswers = questionsForTrack(track)
      .filter((q) => answers[q.key])
      .map((q) => ({
        _key: q.key,
        key: q.key,
        label: q.label,
        answer: q.options?.find((o) => o.value === answers[q.key])?.label ?? answers[q.key],
      }))

    // Store in Sanity (best effort — a storage failure shouldn't lose the lead
    // if email still goes out, so failures are logged, not thrown).
    if (writeClient) {
      try {
        await writeClient.create({
          _type: 'quizSubmission',
          email,
          submittedAt,
          track,
          businessType: answers.businessType,
          teamSize: answers.teamSize,
          neverAgain: answers.neverAgain,
          workflowAnswers,
          websiteFlag: answers.websiteFlag,
          score: result.track === 'solo' ? result.hours : undefined,
          scoreBand: result.track === 'org' ? result.band : undefined,
          topWorkflows: result.topWorkflows,
          waitlistOptIn: Boolean(input.waitlistOptIn),
          source,
        })
      } catch (error) {
        console.error('Quiz submission: Sanity write failed', error)
      }
    } else {
      console.warn('SANITY_API_WRITE_TOKEN not configured. Quiz submission not stored.')
    }

    // Email notification — the "never again" answer leads the subject line
    // because it's the field Gabriella needs to see daily.
    const contactEmail = process.env.CONTACT_EMAIL
    if (resend && contactEmail) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
      const resultLine =
        result.track === 'solo'
          ? `~${result.hours} hrs/week automatable`
          : `${result.band} automation potential`
      const lines = [
        `Email: ${email}`,
        `Track: ${track}`,
        `Result: ${resultLine}`,
        `Top workflows: ${result.topWorkflows.join(', ') || '—'}`,
        `Business type: ${answers.businessType || '—'}`,
        `Team size: ${answers.teamSize || '—'}`,
        `Website part of the problem: ${answers.websiteFlag || '—'}`,
        `Salt waitlist: ${input.waitlistOptIn ? 'yes' : 'no'}`,
        '',
        `“Pay to never do again”: ${answers.neverAgain || '—'}`,
        '',
        ...workflowAnswers.map((a) => `${a.label} — ${a.answer}`),
        '',
        source
          ? `Source: ${[source.utmSource, source.utmMedium, source.utmCampaign, source.referrer].filter(Boolean).join(' / ') || 'direct'}`
          : 'Source: unknown',
      ]

      const {error} = await resend.emails.send({
        from: fromEmail,
        to: contactEmail,
        replyTo: email,
        subject: `Salt Score: ${answers.neverAgain ? `"${answers.neverAgain.slice(0, 60)}"` : email} (${resultLine})`,
        text: lines.join('\n'),
      })
      if (error) {
        console.error('Quiz submission: Resend error', error)
      }
    } else {
      console.warn('Resend not configured. Quiz submission logged only:', {email, track, result})
    }

    return {success: true, message: 'Thanks!'}
  } catch (error) {
    console.error('Quiz submission error:', error)
    return {success: false, message: 'Something went wrong. Please try again.'}
  }
}
