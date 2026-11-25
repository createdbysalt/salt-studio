import 'server-only'
import {GROWTH_DIAGNOSTIC_CENTS} from '@/lib/growth/config'
import {
  growthReportUrl,
  sendDiagnosticNotice,
  sendReportNotice,
  sendReportReadyEmail,
} from '@/lib/growth/emails'
import {metaEventId, sendMetaEvent} from '@/lib/growth/metaCapi'
import {growthPaymentFacts, type GrowthPurchase} from '@/lib/growth/payments'
import {writeGrowthReport} from '@/lib/growth/report'
import {readSite} from '@/lib/growth/site'
import {
  claimGrowthGeneration,
  findGrowthReportById,
  findGrowthReportBySession,
  updateGrowthReport,
  type GrowthReportRow,
} from '@/lib/growth/store'
import {forgetPaymentEvent, recordPaymentEvent} from '@/lib/proposal/acceptances'
import {decideFulfillment, type CheckoutEventKind} from '@/lib/proposal/fulfillment'
import type Stripe from 'stripe'

/**
 * What happens after Stripe says a growth purchase was paid. The webhook
 * route hands growth sessions here. Marking the row paid is quick and done
 * before the webhook answers; writing the report takes a minute or two and
 * runs after the response, and again from the report page if it has to.
 */

/**
 * Writes and delivers one report. Safe to call from several places at once:
 * only the caller that wins the claim does the work.
 */
export async function generateAndDeliverGrowthReport(id: string) {
  const claimed = await claimGrowthGeneration(id)
  if (!claimed) return 'skipped' as const

  let row: GrowthReportRow
  try {
    const site = await readSite(claimed.website_url)
    const {report, model} = await writeGrowthReport(claimed, site)
    const ready = await updateGrowthReport(id, {
      status: 'ready',
      report,
      report_model: model,
      report_error: null,
    })
    row = ready ?? {...claimed, status: 'ready' as const, report}
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[growth] report ${id} failed`, error)
    const failed = await updateGrowthReport(id, {
      status: 'failed',
      report_error: message.slice(0, 500),
    }).catch(() => null)
    await sendReportNotice(failed ?? {...claimed, report_error: message}, 'failed').catch(
      () => false,
    )
    return 'failed' as const
  }

  // The report is saved. From here nothing may mark it failed again: a mail
  // problem must not cause a rewrite of a report the buyer can already read.
  try {
    const delivered = await sendReportReadyEmail(row)
    if (delivered) await updateGrowthReport(id, {delivered_at: new Date().toISOString()})
    await sendReportNotice(row, 'ready')
  } catch (error) {
    console.error(`[growth] report ${id} is ready but delivery hit an error`, error)
  }
  return 'ready' as const
}

/** The row a growth session belongs to: by session id, else by the id in its metadata. */
async function findRowForSession(session: Stripe.Checkout.Session) {
  const bySession = await findGrowthReportBySession(session.id)
  if (bySession) return bySession
  // An earlier checkout page for the same row. Opening checkout again replaces
  // the stored session id, but the older page can still be paid.
  const id = session.metadata?.growth_report_id
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return null
  const row = await findGrowthReportById(id)
  if (!row) return null
  const purchase = session.metadata?.kind === 'growth_diagnostic' ? 'diagnostic' : 'report'
  return {row, purchase: purchase as GrowthPurchase}
}

export type GrowthWebhookOutcome = {
  status: number
  body: Record<string, unknown>
  /** Slow work to run after the webhook has answered Stripe. */
  followUp?: () => Promise<unknown>
}

export function isGrowthSession(session: Stripe.Checkout.Session) {
  const kind = session.metadata?.kind
  return kind === 'growth_report' || kind === 'growth_diagnostic'
}

export async function handleGrowthCheckoutEvent(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
  expectLive: boolean,
): Promise<GrowthWebhookOutcome> {
  const found = await findRowForSession(session)
  if (!found) {
    await recordPaymentEvent(event.id, null, event.type)
    return {status: 200, body: {ok: true, ignored: 'unknown_growth_session'}}
  }
  const {row, purchase} = found

  const fresh = await recordPaymentEvent(event.id, null, event.type)
  if (!fresh) {
    // A redelivery. If the report was paid for but never written, try again.
    const stuck = purchase === 'report' && (row.status === 'paid' || row.status === 'failed')
    return {
      status: 200,
      body: {ok: true, ignored: 'duplicate_event'},
      followUp: stuck ? () => generateAndDeliverGrowthReport(row.id) : undefined,
    }
  }

  const decision = decideFulfillment(
    event.type as CheckoutEventKind,
    {
      id: session.id,
      amountTotal: session.amount_total,
      currency: session.currency,
      paymentStatus: session.payment_status,
      paymentIntentId:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
      customerId:
        typeof session.customer === 'string' ? session.customer : (session.customer?.id ?? null),
      livemode: event.livemode,
    },
    growthPaymentFacts(row, purchase),
    expectLive,
  )

  if (decision.kind === 'refuse') {
    console.error(`[growth webhook] refused ${event.id} for ${session.id}: ${decision.reason}`)
    // Someone may have paid and got nothing. A person has to look at this one.
    return {
      status: 400,
      body: {ok: false, error: 'refused', reason: decision.reason},
      followUp: () =>
        sendReportNotice(
          {...row, report_error: `Stripe ${purchase} payment was refused: ${decision.reason}`},
          'failed',
        ),
    }
  }
  if (decision.kind === 'ignore') return {status: 200, body: {ok: true, ignored: decision.reason}}
  // Expired, failed or still processing: the row stays as it is.
  if (decision.status !== 'paid') return {status: 200, body: {ok: true, noted: decision.status}}

  const paidAt = new Date().toISOString()
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : (session.payment_intent?.id ?? null)

  // If the row cannot be saved, forget the event so Stripe's retry is treated
  // as new. Otherwise the retry would look like a duplicate and the buyer
  // would stay unpaid for good.
  const save = async (patch: Partial<GrowthReportRow>, onlyIf = '') => {
    try {
      return {row: await updateGrowthReport(row.id, patch, onlyIf)}
    } catch (error) {
      console.error(`[growth webhook] could not save ${event.id}`, error)
      await forgetPaymentEvent(event.id).catch(() => undefined)
      return null
    }
  }
  const retryLater: GrowthWebhookOutcome = {status: 500, body: {ok: false, error: 'store_failed'}}

  if (purchase === 'report') {
    const saved = await save(
      {
        status: 'paid',
        paid_at: paidAt,
        stripe_payment_intent_id: paymentIntentId,
        stripe_checkout_session_id: session.id,
      },
      'status=eq.open',
    )
    if (!saved) return retryLater
    if (!saved.row) return {status: 200, body: {ok: true, ignored: 'already paid'}}
    return {
      status: 200,
      body: {ok: true, status: 'paid', purchase},
      followUp: async () => {
        await sendMetaEvent({
          name: 'Purchase',
          eventId: metaEventId(row.id, 'report-purchase'),
          email: row.email,
          consent: row.marketing_consent,
          valueCents: row.amount_cents,
          contentName: 'Business Growth Analysis',
          sourceUrl: growthReportUrl(row.token),
        })
        await generateAndDeliverGrowthReport(row.id)
      },
    }
  }

  const saved = await save({
    diagnostic_status: 'paid',
    diagnostic_paid_at: paidAt,
    diagnostic_session_id: session.id,
  })
  if (!saved) return retryLater
  const paid = saved.row
  return {
    status: 200,
    body: {ok: true, status: 'paid', purchase},
    followUp: async () => {
      const latest = paid ?? (await findGrowthReportById(row.id)) ?? row
      await sendDiagnosticNotice(latest)
      await sendMetaEvent({
        name: 'Purchase',
        eventId: metaEventId(row.id, 'diagnostic-purchase'),
        email: row.email,
        consent: row.marketing_consent,
        valueCents: GROWTH_DIAGNOSTIC_CENTS,
        contentName: 'Revenue Diagnostic',
        sourceUrl: growthReportUrl(row.token),
      })
    },
  }
}
