import {getStripe, stripeIsLive, stripeWebhookSecret} from '@/lib/payments/stripe'
import {
  findPaymentBySessionId,
  forgetPaymentEvent,
  paymentsStoreConfigured,
  recordPaymentEvent,
  updatePayment,
} from '@/lib/proposal/acceptances'
import {decideFulfillment, type CheckoutEventKind} from '@/lib/proposal/fulfillment'
import {apiVersion, dataset, projectId} from '@/sanity/lib/api'
import {createClient} from 'next-sanity'
import {NextResponse} from 'next/server'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

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
  const payment = await findPaymentBySessionId(session.id)
  if (!payment) {
    // Not one of ours. Acknowledge so Stripe stops retrying, and leave a trace.
    await recordPaymentEvent(event.id, null, event.type)
    return json(200, {ok: true, ignored: 'unknown_session'})
  }

  const fresh = await recordPaymentEvent(event.id, payment.id, event.type)
  if (!fresh) return json(200, {ok: true, ignored: 'duplicate_event'})

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

  try {
    await updatePayment(payment.id, {
      status: decision.status,
      stripe_payment_intent_id: paymentIntentId ?? payment.stripe_payment_intent_id,
      stripe_customer_id: customerId ?? payment.stripe_customer_id,
      paid_at: decision.status === 'paid' ? new Date().toISOString() : payment.paid_at,
    })
  } catch (error) {
    // The event id was recorded first. Forget it and fail, so Stripe's retry is processed.
    console.error(`[stripe webhook] could not update payment ${payment.id}`, error)
    await forgetPaymentEvent(event.id).catch(() => undefined)
    return json(500, {ok: false, error: 'update_failed'})
  }

  if (decision.status === 'paid') {
    try {
      await markProposalPaid(payment.proposal_id)
    } catch (error) {
      // The Supabase row is already paid. Studio catching up is best effort.
      console.error('[stripe webhook] could not mark the proposal paid in Sanity', error)
    }
  }

  return json(200, {ok: true, status: decision.status})
}
