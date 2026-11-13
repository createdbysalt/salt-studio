import {GROWTH_DIAGNOSTIC_CENTS, GROWTH_DIAGNOSTIC_DEADLINE} from '@/lib/growth/config'
import type {PaymentFacts} from '@/lib/proposal/fulfillment'

/**
 * The pure rules around the two purchases on a growth report row, kept apart
 * from Stripe and Supabase so they can be tested. The webhook feeds
 * growthPaymentFacts into the same decideFulfillment the proposals use.
 */

export type GrowthPurchase = 'report' | 'diagnostic'

type RowFacts = {
  status: string
  amount_cents: number
  currency: string
  diagnostic_status: string | null
}

/** What we expect Stripe to have charged, and whether it is already settled. */
export function growthPaymentFacts(row: RowFacts, purchase: GrowthPurchase): PaymentFacts {
  if (purchase === 'report') {
    return {
      amountCents: row.amount_cents,
      currency: row.currency,
      status: row.status === 'open' ? 'open' : 'paid',
    }
  }
  return {
    amountCents: GROWTH_DIAGNOSTIC_CENTS,
    currency: row.currency,
    status: row.diagnostic_status === 'paid' ? 'paid' : 'open',
  }
}

export type DiagnosticOfferState = 'available' | 'purchased' | 'expired' | 'locked'

/**
 * The Black Friday price belongs to people who bought the report, until the
 * deadline. Locked means the report itself is not paid for yet.
 */
export function diagnosticOfferState(row: RowFacts, now: Date = new Date()): DiagnosticOfferState {
  if (row.diagnostic_status === 'paid') return 'purchased'
  if (row.status === 'open') return 'locked'
  if (now.getTime() >= new Date(GROWTH_DIAGNOSTIC_DEADLINE).getTime()) return 'expired'
  return 'available'
}
