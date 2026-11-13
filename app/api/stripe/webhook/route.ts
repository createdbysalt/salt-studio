import {handleGrowthCheckoutEvent, isGrowthSession} from '@/lib/growth/fulfillment'
import {expireOtherSessions} from '@/lib/payments/sessions'
import {getStripe, stripeIsLive, stripeWebhookSecret} from '@/lib/payments/stripe'
import {
  findPaymentBySessionId,
  forgetPaymentEvent,
  paymentsStoreConfigured,
  recordPaymentEvent,
  updatePayment,
} from '@/lib/proposal/acceptances'
import {decideFulfillment, type CheckoutEventKind} from '@/lib/proposal/fulfillment'
import {sendPaidProposalEmailsForPayment} from '@/lib/proposal/paidEmails'
import {receiptUrlForPayment, receiptUrlForPaymentIntent} from '@/lib/proposal/stripeReceipt'
import {apiVersion, dataset, projectId} from '@/sanity/lib/api'
import {createClient} from 'next-sanity'
import {after, NextResponse} from 'next/server'
import type Stripe from 'stripe'

export const runtime = 'nodejs'
// Room for a growth report to be written after the response has gone out.
export const maxDuration = 300

const HANDLED: ReadonlySet<string> = new Set<CheckoutEventKind>([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'checkout.session.expired',
])

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, {status})
}

/** Keeps the Studio readable. The Supabase row stays the authority. */
async function markProposalPaid(proposalId: string) {
  const token = process.env.SANITY_API_WRITE_TOKEN
  if (!token) return
  const client = createClient({projectId, dataset, apiVersion, token, useCdn: false})
  await client.patch(proposalId).set({status: 'paid'}).commit()
}

/** A quiet note to the studio that someone signed and then walked away. */
async function reportAbandonedPayment(proposalId: string, amountCents: number) {
  const key = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_EMAIL
  const from = process.env.RESEND_FROM_EMAIL
  if (!key || !to || !from) return
  const amount = (amountCents / 100).toLocaleString('en-US', {style: 'currency', currency: 'USD'})
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({
        from,
        to,
        subject: `Unfinished payment on ${proposalId}`,
        text: `A client signed ${proposalId} and left the ${amount} first payment unfinished. Their checkout page has expired, and the proposal is still open for them to pay.`,
      }),
    })
  } catch (error) {
    console.error('[stripe webhook] could not send the abandoned payment notice', error)
  }
}

/**
 * Stripe calls this. The signature is checked on the raw body, the event
 * id is recorded once, and the amount is compared to the frozen payment
 * before any status changes. The return page never marks anything paid.
 */
export async function POST(request: Request) {
  const stripe = getStripe()
  const secret = stripeWebhookSecret()
  if (!stripe || !secret || !paymentsStoreConfigured()) {
    return json(503, {ok: false, error: 'payments_not_configured'})
  }

  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')
  if (!signature) return json(400, {ok: false, error: 'missing_signature'})

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret)
  } catch {
    return json(400, {ok: false, error: 'invalid_signature'})
  }

  if (!HANDLED.has(event.type)) return json(200, {ok: true, ignored: event.type})

  const session = event.data.object as Stripe.Checkout.Session

  // Business Growth Analysis purchases ($25 report, $1,000 Diagnostic) are
  // marked by metadata and have their own rows. The slow part, writing the
  // report, runs after Stripe has its answer.
  if (isGrowthSession(session)) {
    const outcome = await handleGrowthCheckoutEvent(event, session, stripeIsLive())
    if (outcome.followUp) after(outcome.followUp)
    return json(outcome.status, outcome.body)
  }

  const payment = await findPaymentBySessionId(session.id)
  if (!payment) {
    // Not one of ours. Acknowledge so Stripe stops retrying, and leave a trace.
    await recordPaymentEvent(event.id, null, event.type)
    return json(200, {ok: true, ignored: 'unknown_session'})
  }

  const fresh = await recordPaymentEvent(event.id, payment.id, event.type)
  if (!fresh) {
    if (payment.status === 'paid') {
      const refreshedReceipt = await receiptUrlForPayment(stripe, payment)
      if (refreshedReceipt && !payment.stripe_receipt_url) {
        await updatePayment(payment.id, {stripe_receipt_url: refreshedReceipt}).catch(
          () => undefined,
        )
      }
      await sendPaidProposalEmailsForPayment({
        paymentId: payment.id,
        receiptUrl: refreshedReceipt,
        liveMode: stripeIsLive(),
        forceSendFailure:
          !stripeIsLive() && request.headers.get('x-proposal-email-test-failure') === '1',
      }).catch((error) => {
        console.error('[stripe webhook] could not retry pending proposal emails', error)
      })
    }
    return json(200, {ok: true, ignored: 'duplicate_event'})
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
    {amountCents: payment.amount_cents, currency: payment.currency, status: payment.status},
    stripeIsLive(),
  )

  if (decision.kind === 'refuse') {
    console.error(`[stripe webhook] refused ${event.id} for ${session.id}: ${decision.reason}`)
    return json(400, {ok: false, error: 'refused', reason: decision.reason})
  }
  if (decision.kind === 'ignore') return json(200, {ok: true, ignored: decision.reason})

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : (session.payment_intent?.id ?? null)
  const customerId =
    typeof session.customer === 'string' ? session.customer : (session.customer?.id ?? null)
  const receiptUrl =
    decision.status === 'paid' ? await receiptUrlForPaymentIntent(stripe, paymentIntentId) : null

  try {
    await updatePayment(payment.id, {
      status: decision.status,
      stripe_payment_intent_id: paymentIntentId ?? payment.stripe_payment_intent_id,
      stripe_customer_id: customerId ?? payment.stripe_customer_id,
      stripe_receipt_url: receiptUrl ?? payment.stripe_receipt_url,
      paid_at: decision.status === 'paid' ? new Date().toISOString() : payment.paid_at,
    })
  } catch (error) {
    // The event id was recorded first. Forget it and fail, so Stripe's retry is processed.
    console.error(`[stripe webhook] could not update payment ${payment.id}`, error)
    await forgetPaymentEvent(event.id).catch(() => undefined)
    return json(500, {ok: false, error: 'update_failed'})
  }

  // One payment settles the first step, so any other checkout page still
  // open for this proposal must stop being payable. Two live sessions, say
  // one left on a laptop and one on a phone, could otherwise both be paid.
  if (decision.status === 'paid' || decision.status === 'processing') {
    await expireOtherSessions(stripe, payment.proposal_id, payment.id)
  }

  if (decision.status === 'paid') {
    try {
      await markProposalPaid(payment.proposal_id)
    } catch (error) {
      // The Supabase row is already paid. Studio catching up is best effort.
      console.error('[stripe webhook] could not mark the proposal paid in Sanity', error)
    }
    await sendPaidProposalEmailsForPayment({
      paymentId: payment.id,
      receiptUrl,
      liveMode: stripeIsLive(),
      forceSendFailure:
        !stripeIsLive() && request.headers.get('x-proposal-email-test-failure') === '1',
    }).catch((error) => {
      console.error('[stripe webhook] could not send proposal paid emails', error)
    })
  }

  if (decision.status === 'expired') {
    await reportAbandonedPayment(payment.proposal_id, payment.amount_cents)
  }

  return json(200, {ok: true, status: decision.status})
}
