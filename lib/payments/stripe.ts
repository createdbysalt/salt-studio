import 'server-only'
import Stripe from 'stripe'

let cached: Stripe | null = null

export function stripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY
  return key && key.length > 0 ? key : null
}

export function stripeWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  return secret && secret.length > 0 ? secret : null
}

/** True when the configured key is a live key. The webhook checks events against this. */
export function stripeIsLive() {
  return stripeSecretKey()?.includes('_live_') === true
}

/** Server-only Stripe client. Null when no key is configured. */
export function getStripe() {
  const key = stripeSecretKey()
  if (!key) return null
  if (!cached) {
    cached = new Stripe(key, {
      appInfo: {name: 'Salt Studio proposals', url: 'https://www.createdbysalt.com'},
    })
  }
  return cached
}
