import 'server-only'
import type {PaymentRow} from '@/lib/proposal/acceptances'
import type Stripe from 'stripe'

export async function receiptUrlForPaymentIntent(stripe: Stripe, paymentIntentId: string | null) {
  if (!paymentIntentId) return null
  const intent = await stripe.paymentIntents
    .retrieve(paymentIntentId, {expand: ['latest_charge']})
    .catch(() => null)
  const charge = intent?.latest_charge
  if (charge && typeof charge !== 'string') return charge.receipt_url ?? null
  return null
}

export async function receiptUrlForPayment(stripe: Stripe, payment: PaymentRow) {
  if (payment.stripe_receipt_url) return payment.stripe_receipt_url
  if (payment.stripe_payment_intent_id) {
    return receiptUrlForPaymentIntent(stripe, payment.stripe_payment_intent_id)
  }
  if (!payment.stripe_checkout_session_id) return null
  const session = await stripe.checkout.sessions
    .retrieve(payment.stripe_checkout_session_id)
    .catch(() => null)
  const intentId =
    typeof session?.payment_intent === 'string'
      ? session.payment_intent
      : (session?.payment_intent?.id ?? null)
  return receiptUrlForPaymentIntent(stripe, intentId)
}
