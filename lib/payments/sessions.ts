import 'server-only'
import {openCheckoutPayments, updatePayment} from '@/lib/proposal/acceptances'
import type Stripe from 'stripe'

/**
 * Leaves exactly one payable checkout page per proposal.
 *
 * Called when a payment lands, and whenever a new session is opened: a
 * client who signs, goes to pay, comes back and picks a different package
 * would otherwise still have the old page open at the old price.
 */
export async function expireOtherSessions(stripe: Stripe, proposalId: string, keepId: string) {
  try {
    const others = await openCheckoutPayments(proposalId, keepId)
    for (const row of others) {
      if (row.stripe_checkout_session_id) {
        await stripe.checkout.sessions.expire(row.stripe_checkout_session_id).catch(() => undefined)
      }
      await updatePayment(row.id, {status: 'expired'}).catch(() => undefined)
    }
    return others.length
  } catch (error) {
    console.error('[payments] could not expire the other open sessions', error)
    return 0
  }
}
