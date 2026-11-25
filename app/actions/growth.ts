'use server'

import {randomBytes} from 'node:crypto'
import {normalizePublicUrl} from '@/lib/audit/url'
import {
  GROWTH_DIAGNOSTIC_CENTS,
  GROWTH_KEYS,
  GROWTH_QUIZ_SLUG,
  GROWTH_REPORT_CENTS,
} from '@/lib/growth/config'
import {generateAndDeliverGrowthReport} from '@/lib/growth/fulfillment'
import {metaEventId, sendMetaEvent} from '@/lib/growth/metaCapi'
import {diagnosticOfferState} from '@/lib/growth/payments'
import {scoreGrowthQuiz} from '@/lib/growth/scoring'
import {
  findGrowthReportByToken,
  growthStoreConfigured,
  insertGrowthReport,
  updateGrowthReport,
  type GrowthAnswer,
  type GrowthReportStatus,
  type GrowthSource,
} from '@/lib/growth/store'
import {getStripe} from '@/lib/payments/stripe'
import {answerLabel, questionAnswerKey} from '@/lib/quiz/dynamic'
import {apiVersion, dataset, projectId} from '@/sanity/lib/api'
import {quizBySlugQuery} from '@/sanity/lib/queries'
import {token as sanityToken} from '@/sanity/lib/token'
import {createClient} from 'next-sanity'
import {headers} from 'next/headers'

/**
 * Checkout and report actions for the Business Growth Analysis.
 *
 * Nothing the browser sends is trusted for price or score: the published quiz
 * is fetched again and the answers are scored here, and both prices come from
 * lib/growth/config. The browser only ever receives a Stripe URL to go to.
 */

export type GrowthCheckoutResult =
  | {ok: true; url: string; eventId: string}
  | {ok: false; message: string}

const UNAVAILABLE =
  'Checkout is not available right now. Email hello@createdbysalt.com and we will sort it out.'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_TEXT_LENGTH = 1000

const readClient = createClient({projectId, dataset, apiVersion, token: sanityToken, useCdn: false})

async function requestOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (process.env.NODE_ENV === 'production') return configured || 'https://www.createdbysalt.com'
  const host = (await headers()).get('host')
  if (!host || !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) {
    return configured || 'https://www.createdbysalt.com'
  }
  return `http://${host}`
}

function cleanSource(source: GrowthSource | undefined): GrowthSource | null {
  if (!source || typeof source !== 'object') return null
  const clean = (v: unknown) => (typeof v === 'string' ? v.slice(0, 200) : undefined)
  return {
    utmSource: clean(source.utmSource),
    utmMedium: clean(source.utmMedium),
    utmCampaign: clean(source.utmCampaign),
    referrer: clean(source.referrer),
    landingPath: clean(source.landingPath),
  }
}

export async function startGrowthReportCheckout(input: {
  email: string
  answers: Record<string, string>
  source?: GrowthSource
  marketingConsent?: boolean
}): Promise<GrowthCheckoutResult> {
  try {
    const stripe = getStripe()
    if (!stripe || !growthStoreConfigured()) return {ok: false, message: UNAVAILABLE}

    const email = (input.email || '').trim().slice(0, 254)
    if (!EMAIL_REGEX.test(email)) return {ok: false, message: 'Please enter a valid email address.'}

    const quiz = await readClient.fetch(quizBySlugQuery, {slug: GROWTH_QUIZ_SLUG})
    if (!quiz) return {ok: false, message: UNAVAILABLE}

    // Only known question keys, as plain strings, length-capped.
    const raw = input.answers && typeof input.answers === 'object' ? input.answers : {}
    const answers: Record<string, string> = {}
    const stored: GrowthAnswer[] = []
    for (const question of quiz.questions ?? []) {
      const key = questionAnswerKey(question)
      const value = raw[key]
      if (typeof value !== 'string' || value.length === 0) continue
      answers[key] = value.slice(0, MAX_TEXT_LENGTH)
      const option = question.options?.find((o) => o._key === answers[key])
      stored.push({
        key,
        label: question.prompt ?? key,
        answer: answerLabel(question, answers[key]),
        optionKey: option?._key ?? null,
      })
    }

    const result = scoreGrowthQuiz(quiz, answers)
    if (result.stages.length === 0) {
      return {ok: false, message: 'Please finish the quiz first, then come back to this step.'}
    }

    const labelFor = (key: string) => stored.find((a) => a.key === key)?.answer ?? null
    const reportToken = randomBytes(24).toString('base64url')
    const marketingConsent = input.marketingConsent === true

    const row = await insertGrowthReport({
      token: reportToken,
      email,
      first_name: labelFor(GROWTH_KEYS.firstName)?.slice(0, 80) ?? null,
      business_name: labelFor(GROWTH_KEYS.businessName)?.slice(0, 160) ?? null,
      business_type: labelFor(GROWTH_KEYS.businessType),
      website_url: normalizePublicUrl(answers[GROWTH_KEYS.website]),
      answers: stored,
      scores: {
        score: result.score,
        band: result.band?.label ?? null,
        stages: result.stages,
        weakest: result.weakest?.label ?? null,
        foundation: result.foundation,
      },
      fit: result.fit,
      source: cleanSource(input.source),
      marketing_consent: marketingConsent,
      amount_cents: GROWTH_REPORT_CENTS,
    })

    const origin = await requestOrigin()
    const reportPath = `/growth-analysis/report/${encodeURIComponent(reportToken)}`
    const label = 'Business Growth Analysis'
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      ui_mode: 'hosted_page',
      success_url: `${origin}${reportPath}?paid=1`,
      cancel_url: `${origin}/quiz/${GROWTH_QUIZ_SLUG}`,
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: GROWTH_REPORT_CENTS,
            product_data: {
              name: label,
              description:
                'A written review of where your practice is losing people, with a 30-day plan.',
            },
          },
        },
      ],
      metadata: {kind: 'growth_report', growth_report_id: row.id},
      payment_intent_data: {
        description: label,
        receipt_email: email,
        metadata: {kind: 'growth_report', growth_report_id: row.id},
      },
    })
    if (!session.url) return {ok: false, message: UNAVAILABLE}

    await updateGrowthReport(row.id, {stripe_checkout_session_id: session.id})

    const eventId = metaEventId(row.id, 'report-checkout')
    await sendMetaEvent({
      name: 'InitiateCheckout',
      eventId,
      email,
      consent: marketingConsent,
      valueCents: GROWTH_REPORT_CENTS,
      contentName: label,
      sourceUrl: `${origin}/quiz/${GROWTH_QUIZ_SLUG}`,
    })

    return {ok: true, url: session.url, eventId}
  } catch (error) {
    console.error('[growth] report checkout failed', error)
    return {ok: false, message: 'Something went wrong. Please try again.'}
  }
}

export async function startDiagnosticCheckout(reportToken: string): Promise<GrowthCheckoutResult> {
  try {
    const stripe = getStripe()
    if (!stripe || !growthStoreConfigured()) return {ok: false, message: UNAVAILABLE}

    const row = await findGrowthReportByToken(String(reportToken || '').slice(0, 120))
    if (!row) return {ok: false, message: 'We could not find that report.'}

    const state = diagnosticOfferState(row)
    if (state === 'purchased') return {ok: false, message: 'You already have the Diagnostic.'}
    if (state === 'expired') return {ok: false, message: 'The Black Friday price has ended.'}
    if (state !== 'available') return {ok: false, message: UNAVAILABLE}

    const origin = await requestOrigin()
    const reportPath = `/growth-analysis/report/${encodeURIComponent(row.token)}`
    const label = 'Revenue Diagnostic, Black Friday price'
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      ui_mode: 'hosted_page',
      success_url: `${origin}${reportPath}?diagnostic=1`,
      cancel_url: `${origin}${reportPath}#offer`,
      customer_email: row.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: GROWTH_DIAGNOSTIC_CENTS,
            product_data: {
              name: label,
              description:
                'One week. We go through your real numbers and hand you a 30-day plan. Full refund if we are not the right fit.',
            },
          },
        },
      ],
      metadata: {kind: 'growth_diagnostic', growth_report_id: row.id},
      payment_intent_data: {
        description: label,
        receipt_email: row.email,
        metadata: {kind: 'growth_diagnostic', growth_report_id: row.id},
      },
    })
    if (!session.url) return {ok: false, message: UNAVAILABLE}

    // Never step on a Diagnostic that was paid while this checkout was opening.
    await updateGrowthReport(
      row.id,
      {diagnostic_session_id: session.id, diagnostic_status: 'open'},
      'or=(diagnostic_status.is.null,diagnostic_status.eq.open)',
    )

    const eventId = metaEventId(row.id, 'diagnostic-checkout')
    await sendMetaEvent({
      name: 'InitiateCheckout',
      eventId,
      email: row.email,
      consent: row.marketing_consent,
      valueCents: GROWTH_DIAGNOSTIC_CENTS,
      contentName: 'Revenue Diagnostic',
      sourceUrl: `${origin}${reportPath}`,
    })

    return {ok: true, url: session.url, eventId}
  } catch (error) {
    console.error('[growth] diagnostic checkout failed', error)
    return {ok: false, message: 'Something went wrong. Please try again.'}
  }
}

/**
 * Called by the "still working" screen. The webhook normally writes the
 * report, and this is the second way in if that run was cut short. The claim
 * inside makes a double run impossible.
 */
export async function ensureGrowthReport(
  reportToken: string,
): Promise<{status: GrowthReportStatus | 'missing'}> {
  try {
    const row = await findGrowthReportByToken(String(reportToken || '').slice(0, 120))
    if (!row) return {status: 'missing'}
    if (row.status === 'open' || row.status === 'ready') return {status: row.status}
    const outcome = await generateAndDeliverGrowthReport(row.id)
    if (outcome === 'ready') return {status: 'ready'}
    if (outcome === 'failed') return {status: 'failed'}
    return {status: row.status}
  } catch (error) {
    console.error('[growth] ensure report failed', error)
    return {status: 'failed'}
  }
}
