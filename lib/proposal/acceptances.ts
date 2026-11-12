import 'server-only'
import {createHash} from 'node:crypto'
import {supabaseConfig, supabaseRequest} from '@/lib/onboarding/supabase'
import type {QuoteStep} from '@/lib/proposal/quote'

/**
 * Supabase rows for proposal acceptances and payments. Service role only,
 * through the same REST helper the private portal uses.
 */

export type PaymentStatus = 'open' | 'processing' | 'paid' | 'failed' | 'pending_wire' | 'expired'
export type PaymentMethod = 'checkout' | 'wire'

export type AcceptanceRow = {
  id: string
  proposal_id: string
  token_hash: string
  signer_name: string
  signer_email: string
  client_name: string | null
  package_id: string
  package_name: string | null
  addon_ids: string[]
  selection_key: string
  kickoff_date: string | null
  same_day_percent: number | null
  total_cents: number
  first_cents: number
  steps: QuoteStep[]
  schedule_name: string | null
  msa_version: string | null
  agreed_text_sha256: string
  ip: string | null
  user_agent: string | null
  created_at: string
}

export type PaymentRow = {
  id: string
  acceptance_id: string
  proposal_id: string
  step_index: number
  method: PaymentMethod
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
  stripe_customer_id: string | null
  amount_cents: number
  currency: string
  status: PaymentStatus
  expires_at: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

/** The latest payment for a proposal, with the bits of its acceptance the page needs. */
export type LatestPayment = PaymentRow & {
  proposal_acceptances: {
    selection_key: string
    signer_name: string
    signer_email: string
    first_cents: number
    kickoff_date: string | null
  } | null
}

const PAYMENT_COLUMNS =
  'id,acceptance_id,proposal_id,step_index,method,stripe_checkout_session_id,stripe_payment_intent_id,stripe_customer_id,amount_cents,currency,status,expires_at,paid_at,created_at,updated_at'

export function paymentsStoreConfigured() {
  return supabaseConfig() !== null
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * One hash over the exact text the signer agreed to, so the record stands
 * even after the Sanity documents are edited.
 */
export function agreedTextHash(parts: Array<string | null | undefined>) {
  const hash = createHash('sha256')
  for (const part of parts) {
    hash.update(part ?? '')
    hash.update('\u0000')
  }
  return hash.digest('hex')
}

function eq(value: string) {
  return `eq.${encodeURIComponent(value)}`
}

export async function latestPaymentForProposal(proposalId: string): Promise<LatestPayment | null> {
  if (!paymentsStoreConfigured()) return null
  const rows = await supabaseRequest<LatestPayment[]>(
    `/rest/v1/proposal_payments?proposal_id=${eq(proposalId)}&select=${PAYMENT_COLUMNS},proposal_acceptances(selection_key,signer_name,signer_email,first_cents,kickoff_date)&order=created_at.desc&limit=1`,
  )
  return rows[0] ?? null
}

export async function findPaymentBySessionId(sessionId: string): Promise<PaymentRow | null> {
  const rows = await supabaseRequest<PaymentRow[]>(
    `/rest/v1/proposal_payments?stripe_checkout_session_id=${eq(sessionId)}&select=${PAYMENT_COLUMNS}&limit=1`,
  )
  return rows[0] ?? null
}

export async function findPaymentById(id: string): Promise<PaymentRow | null> {
  const rows = await supabaseRequest<PaymentRow[]>(
    `/rest/v1/proposal_payments?id=${eq(id)}&select=${PAYMENT_COLUMNS}&limit=1`,
  )
  return rows[0] ?? null
}

export type NewAcceptance = Omit<AcceptanceRow, 'id' | 'created_at'>

export async function insertAcceptance(input: NewAcceptance): Promise<AcceptanceRow> {
  const rows = await supabaseRequest<AcceptanceRow[]>('/rest/v1/proposal_acceptances', {
    method: 'POST',
    headers: {Prefer: 'return=representation'},
    body: JSON.stringify(input),
  })
  const row = rows[0]
  if (!row) throw new Error('The acceptance was not stored.')
  return row
}

export type NewPayment = Pick<
  PaymentRow,
  'acceptance_id' | 'proposal_id' | 'step_index' | 'method' | 'amount_cents' | 'currency' | 'status'
> &
  Partial<
    Pick<
      PaymentRow,
      | 'stripe_checkout_session_id'
      | 'stripe_payment_intent_id'
      | 'stripe_customer_id'
      | 'expires_at'
    >
  >

export async function insertPayment(input: NewPayment): Promise<PaymentRow> {
  const rows = await supabaseRequest<PaymentRow[]>('/rest/v1/proposal_payments', {
    method: 'POST',
    headers: {Prefer: 'return=representation'},
    body: JSON.stringify(input),
  })
  const row = rows[0]
  if (!row) throw new Error('The payment was not stored.')
  return row
}

export async function updatePayment(
  id: string,
  patch: Partial<
    Pick<
      PaymentRow,
      'status' | 'stripe_payment_intent_id' | 'stripe_customer_id' | 'paid_at' | 'expires_at'
    >
  >,
) {
  // return=representation: the shared helper parses JSON, and a 204 has none.
  const rows = await supabaseRequest<PaymentRow[]>(`/rest/v1/proposal_payments?id=${eq(id)}`, {
    method: 'PATCH',
    headers: {Prefer: 'return=representation'},
    body: JSON.stringify(patch),
  })
  if (rows.length === 0) throw new Error(`Payment ${id} was not updated.`)
}

/** Removes a recorded event so Stripe's retry is processed again. */
export async function forgetPaymentEvent(eventId: string) {
  await supabaseRequest<unknown[]>(`/rest/v1/proposal_payment_events?event_id=${eq(eventId)}`, {
    method: 'DELETE',
    headers: {Prefer: 'return=representation'},
  })
}

/**
 * Records a Stripe event id. Returns false when that id was already
 * recorded, which means the event was handled before and must be skipped.
 */
export async function recordPaymentEvent(eventId: string, paymentId: string | null, type: string) {
  const rows = await supabaseRequest<Array<{event_id: string}>>(
    '/rest/v1/proposal_payment_events?on_conflict=event_id',
    {
      method: 'POST',
      headers: {Prefer: 'resolution=ignore-duplicates,return=representation'},
      body: JSON.stringify({event_id: eventId, payment_id: paymentId, event_type: type}),
    },
  )
  return rows.length > 0
}
