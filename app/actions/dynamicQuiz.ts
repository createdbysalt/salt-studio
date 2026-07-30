'use server'

import {answerLabel, questionAnswerKey, scoreDynamicQuiz} from '@/lib/quiz/dynamic'
import {apiVersion, dataset, projectId} from '@/sanity/lib/api'
import {quizBySlugQuery} from '@/sanity/lib/queries'
import {createClient} from 'next-sanity'
import {Resend} from 'resend'

/**
 * Service quiz submission (/quiz/[slug]) — the Sanity-driven counterpart of
 * app/actions/quiz.ts (the hardcoded Salt Score). Same graceful-degradation
 * pattern: missing RESEND_API_KEY or SANITY_API_WRITE_TOKEN downgrades to
 * console logging instead of failing the visitor.
 *
 * The published quiz document is re-fetched here and the score recomputed
 * from raw answers, so a tampered client can't store a fake result. The
 * submission lands in the Leads pipeline with status "new".
 */

export type DynamicQuizSubmissionInput = {
  quizSlug: string
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

export type DynamicQuizSubmissionState = {
  success: boolean
  message: string
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Plain published-content client — no stega, no draft mode. Server actions
// don't participate in live revalidation, so sanityFetch isn't the tool here.
const readClient = createClient({projectId, dataset, apiVersion, useCdn: true})

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

function sanitizeSource(source: DynamicQuizSubmissionInput['source']) {
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

export async function submitDynamicQuiz(
  input: DynamicQuizSubmissionInput,
): Promise<DynamicQuizSubmissionState> {
  try {
    // Honeypot: real visitors never see this field. Pretend success so bots don't adapt.
    if (input.company) {
      return {success: true, message: 'Thanks!'}
    }

    const email = (input.email || '').trim()
    if (!EMAIL_REGEX.test(email)) {
      return {success: false, message: 'Please enter a valid email address.'}
    }

    const slug = typeof input.quizSlug === 'string' ? input.quizSlug.slice(0, 96) : ''
    const quiz = await readClient.fetch(quizBySlugQuery, {slug})
    if (!quiz) {
      return {success: false, message: 'This quiz is no longer available.'}
    }

    // Only accept known question keys, as plain strings, length-capped.
    const rawAnswers = input.answers && typeof input.answers === 'object' ? input.answers : {}
    const answers: Record<string, string> = {}
    for (const question of quiz.questions ?? []) {
      const value = rawAnswers[questionAnswerKey(question)]
      if (typeof value === 'string' && value.length > 0) {
        answers[questionAnswerKey(question)] = value.slice(0, MAX_TEXT_LENGTH)
      }
    }

    const result = scoreDynamicQuiz(quiz, answers)
    const submittedAt = new Date().toISOString()
    const source = sanitizeSource(input.source)

    const workflowAnswers = (quiz.questions ?? [])
      .filter((q) => answers[questionAnswerKey(q)])
      .map((q) => ({
        _key: questionAnswerKey(q),
        key: questionAnswerKey(q),
        label: q.prompt ?? '',
        answer: answerLabel(q, answers[questionAnswerKey(q)]),
      }))

    // Store in Sanity (best effort — a storage failure shouldn't lose the lead
    // if email still goes out, so failures are logged, not thrown).
    if (writeClient) {
      try {
        await writeClient.create({
          _type: 'quizSubmission',
          status: 'new',
          quiz: {_type: 'reference', _ref: quiz._id},
          quizTitle: quiz.title ?? slug,
          email,
          submittedAt,
          workflowAnswers,
          score: result.score,
          scoreBand: result.band?.label ?? undefined,
          topWorkflows: result.topAreas,
          waitlistOptIn: Boolean(input.waitlistOptIn),
          source,
        })
      } catch (error) {
        console.error('Quiz submission: Sanity write failed', error)
      }
    } else {
      console.warn('SANITY_API_WRITE_TOKEN not configured. Quiz submission not stored.')
    }

    const contactEmail = process.env.CONTACT_EMAIL
    if (resend && contactEmail) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
      const resultLine = [result.band?.label, `score ${result.score}`].filter(Boolean).join(' · ')
      const lines = [
        `Quiz: ${quiz.title ?? slug} (/quiz/${slug})`,
        `Email: ${email}`,
        `Result: ${resultLine}`,
        `Top areas: ${result.topAreas.join(', ') || '—'}`,
        `Salt waitlist: ${input.waitlistOptIn ? 'yes' : 'no'}`,
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
        subject: `${quiz.title ?? 'Quiz'}: ${email} (${resultLine})`,
        text: lines.join('\n'),
      })
      if (error) {
        console.error('Quiz submission: Resend error', error)
      }
    } else {
      console.warn('Resend not configured. Quiz submission logged only:', {email, slug, result})
    }

    return {success: true, message: 'Thanks!'}
  } catch (error) {
    console.error('Quiz submission error:', error)
    return {success: false, message: 'Something went wrong. Please try again.'}
  }
}
