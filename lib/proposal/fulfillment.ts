/**
 * The decision a Stripe Checkout event turns into. Pure, so it is testable
 * without Stripe or Supabase. The webhook route applies the result.
 */

export type CheckoutEventKind =
  | 'checkout.session.completed'
  | 'checkout.session.async_payment_succeeded'
  | 'checkout.session.async_payment_failed'
  | 'checkout.session.expired'

export type CheckoutSessionFacts = {
  id: string
  amountTotal: number | null
  currency: string | null
  paymentStatus: 'paid' | 'unpaid' | 'no_payment_required' | string
  paymentIntentId: string | null
  customerId: string | null
  livemode: boolean
}

export type PaymentFacts = {
  amountCents: number
  currency: string
  status: string
}

export type FulfillmentDecision =
  | {kind: 'refuse'; reason: string}
  | {kind: 'ignore'; reason: string}
  | {kind: 'set'; status: 'paid' | 'processing' | 'failed' | 'expired'}

export function decideFulfillment(
  event: CheckoutEventKind,
  session: CheckoutSessionFacts,
  payment: PaymentFacts,
  expectLive: boolean,
): FulfillmentDecision {
  if (session.livemode !== expectLive) {
    return {kind: 'refuse', reason: 'livemode does not match this environment'}
  }
  if (payment.status === 'paid') return {kind: 'ignore', reason: 'already paid'}

  if (event === 'checkout.session.expired') {
    return payment.status === 'open'
      ? {kind: 'set', status: 'expired'}
      : {kind: 'ignore', reason: 'session expired after a payment started'}
  }

  if (session.amountTotal !== payment.amountCents) {
    return {
      kind: 'refuse',
      reason: `amount_total ${session.amountTotal} does not match the frozen ${payment.amountCents}`,
    }
  }
  if ((session.currency ?? '').toLowerCase() !== payment.currency.toLowerCase()) {
    return {
      kind: 'refuse',
      reason: `currency ${session.currency} does not match ${payment.currency}`,
    }
  }

  if (event === 'checkout.session.async_payment_failed') return {kind: 'set', status: 'failed'}
  if (event === 'checkout.session.async_payment_succeeded') return {kind: 'set', status: 'paid'}

  // checkout.session.completed: a card is paid now, a bank debit is still processing.
  if (session.paymentStatus === 'paid') return {kind: 'set', status: 'paid'}
  return {kind: 'set', status: 'processing'}
}
