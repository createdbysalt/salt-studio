import 'server-only'
import {GROWTH_DIAGNOSTIC_DEADLINE_LABEL} from '@/lib/growth/config'
import {diagnosticOfferState} from '@/lib/growth/payments'
import type {GrowthReportRow} from '@/lib/growth/store'
import {Resend} from 'resend'

/**
 * The three emails around a paid report: the buyer's link, and two notices to
 * the studio. Missing Resend config downgrades to a log line, the same way
 * the quiz actions do, so a mail problem never loses a paid report.
 */

function client() {
  return process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
}

function from() {
  return process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
}

export function growthSiteOrigin() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.createdbysalt.com').replace(/\/$/, '')
}

export function growthReportUrl(token: string) {
  return `${growthSiteOrigin()}/growth-analysis/report/${encodeURIComponent(token)}`
}

function answersBlock(row: GrowthReportRow) {
  return row.answers.map((a) => `${a.label}: ${a.answer}`).join('\n')
}

function sourceLine(row: GrowthReportRow) {
  const s = row.source
  const parts = [s?.utmSource, s?.utmMedium, s?.utmCampaign, s?.referrer].filter(Boolean)
  return `Source: ${parts.join(' / ') || 'direct'}`
}

async function send(message: {to: string; subject: string; text: string; replyTo?: string}) {
  const resend = client()
  if (!resend) {
    console.warn('[growth] Resend not configured. Email not sent:', message.subject)
    return false
  }
  const {error} = await resend.emails.send({from: from(), ...message})
  if (error) {
    console.error('[growth] Resend error', error)
    return false
  }
  return true
}

/** The buyer's email. Returns true when it was handed to Resend. */
export function sendReportReadyEmail(row: GrowthReportRow) {
  const name = row.first_name ? `Hi ${row.first_name},` : 'Hi,'
  const business = row.business_name ? ` for ${row.business_name}` : ''
  const lines = [
    name,
    '',
    `Your Business Growth Analysis${business} is ready:`,
    growthReportUrl(row.token),
    '',
    'It names the one place you are most likely losing people, gives a read on each step from being found to follow-up, and ends with a 30-day plan in the order to do it. To keep a copy, open it and use Print, then Save as PDF.',
    '',
    'It is yours to keep and act on, whether or not we ever talk.',
  ]
  if (diagnosticOfferState(row) === 'available') {
    lines.push(
      '',
      `One more thing. Because you picked this up during Black Friday, our one-week Revenue Diagnostic is $1,000 for you instead of $1,500, through ${GROWTH_DIAGNOSTIC_DEADLINE_LABEL}. The details are at the end of your report.`,
    )
  }
  lines.push('', 'Matheus', 'Salt Studio')

  return send({
    to: row.email,
    replyTo: process.env.CONTACT_EMAIL,
    subject: 'Your Business Growth Analysis is ready',
    text: lines.join('\n'),
  })
}

/** Tells the studio a report was bought, and whether it was written. */
export function sendReportNotice(row: GrowthReportRow, outcome: 'ready' | 'failed') {
  const to = process.env.CONTACT_EMAIL
  if (!to) return Promise.resolve(false)
  const who = row.business_name || row.email
  return send({
    to,
    replyTo: row.email,
    subject:
      outcome === 'ready'
        ? `Growth report sold: ${who} (score ${row.scores.score})`
        : `Growth report FAILED to generate: ${who}`,
    text: [
      outcome === 'ready'
        ? 'A $25 Business Growth Analysis was paid for and delivered.'
        : `A $25 Business Growth Analysis was paid for but the report did not generate. The buyer sees a "still working" page, and opening it retries. Error: ${row.report_error ?? 'unknown'}`,
      '',
      `Report: ${growthReportUrl(row.token)}`,
      `Email: ${row.email}`,
      `Business: ${row.business_name ?? ''} (${row.business_type ?? 'type not given'})`,
      `Website: ${row.website_url ?? 'none given'}`,
      `Score: ${row.scores.score}${row.scores.band ? `, ${row.scores.band}` : ''}`,
      `Weakest stage: ${row.scores.weakest ?? ''}`,
      `Diagnostic fit: ${row.fit ? 'yes' : 'no'}`,
      sourceLine(row),
      '',
      answersBlock(row),
    ].join('\n'),
  })
}

/** Tells the studio someone bought the $1,000 Diagnostic from their report. */
export function sendDiagnosticNotice(row: GrowthReportRow) {
  const to = process.env.CONTACT_EMAIL
  if (!to) return Promise.resolve(false)
  const who = row.business_name || row.email
  return send({
    to,
    replyTo: row.email,
    subject: `Revenue Diagnostic sold ($1,000): ${who}${row.fit ? '' : ' (outside the fit rule)'}`,
    text: [
      'A report buyer paid $1,000 for the Revenue Diagnostic at the Black Friday price.',
      row.fit
        ? 'They match the fit rule.'
        : 'They are OUTSIDE the fit rule (revenue, client value or business type). Decide whether to deliver or refund.',
      '',
      `Name: ${row.first_name ?? ''}`,
      `Email: ${row.email}`,
      `Business: ${row.business_name ?? ''} (${row.business_type ?? 'type not given'})`,
      `Website: ${row.website_url ?? 'none given'}`,
      `Their report: ${growthReportUrl(row.token)}`,
      `Score: ${row.scores.score}, weakest stage: ${row.scores.weakest ?? ''}`,
      sourceLine(row),
      '',
      answersBlock(row),
    ].join('\n'),
  })
}
