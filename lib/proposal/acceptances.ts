import 'server-only'
import {createHash} from 'node:crypto'
import {supabaseConfig, supabaseRequest} from '@/lib/onboarding/supabase'
import type {FrozenAddress, FrozenAgreementDocument} from '@/lib/proposal/frozenDocument'
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
  signer_legal_name: string | null
  signer_address: FrozenAddress | null
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
  msa_pdf_sha256: string | null
  msa_pdf_bytes_base64: string | null
  msa_pdf_filename: string | null
  msa_pdf_content_type: string | null
  msa_pdf_missing_reason: string | null
  agreed_document: FrozenAgreementDocument | null
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
  stripe_receipt_url: string | null
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
    signer_legal_name: string | null
    signer_address: FrozenAddress | null
    first_cents: number
    kickoff_date: string | null
    same_day_percent: number | null
  } | null
}

const PAYMENT_COLUMNS =
  'id,acceptance_id,proposal_id,step_index,method,stripe_checkout_session_id,stripe_payment_intent_id,stripe_customer_id,stripe_receipt_url,amount_cents,currency,status,expires_at,paid_at,created_at,updated_at'

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
    `/rest/v1/proposal_payments?proposal_id=${eq(proposalId)}&select=${PAYMENT_COLUMNS},proposal_acceptances(selection_key,signer_name,signer_email,signer_legal_name,signer_address,first_cents,kickoff_date,same_day_percent)&order=created_at.desc&limit=1`,
  )
  return rows[0] ?? null
}

const ACCEPTANCE_COLUMNS =
  'id,proposal_id,token_hash,signer_name,signer_email,signer_legal_name,signer_address,client_name,package_id,package_name,addon_ids,selection_key,kickoff_date,same_day_percent,total_cents,first_cents,steps,schedule_name,msa_version,msa_pdf_sha256,msa_pdf_bytes_base64,msa_pdf_filename,msa_pdf_content_type,msa_pdf_missing_reason,agreed_document,agreed_text_sha256,ip,user_agent,created_at'

/** The signature already on file for this proposal, if there is one. */
export async function latestAcceptanceForProposal(proposalId: string) {
  if (!paymentsStoreConfigured()) return null
  const rows = await supabaseRequest<AcceptanceRow[]>(
    `/rest/v1/proposal_acceptances?proposal_id=${eq(proposalId)}&select=${ACCEPTANCE_COLUMNS}&order=created_at.desc&limit=1`,
  )
  return rows[0] ?? null
}

/** Open checkout rows for a proposal, so a finished payment can close the rest. */
export async function openCheckoutPayments(proposalId: string, exceptId: string) {
  const rows = await supabaseRequest<PaymentRow[]>(
    `/rest/v1/proposal_payments?proposal_id=${eq(proposalId)}&status=eq.open&method=eq.checkout&id=neq.${encodeURIComponent(exceptId)}&select=${PAYMENT_COLUMNS}`,
  )
  return rows
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

export async function findAcceptanceById(id: string): Promise<AcceptanceRow | null> {
  const rows = await supabaseRequest<AcceptanceRow[]>(
    `/rest/v1/proposal_acceptances?id=${eq(id)}&select=${ACCEPTANCE_COLUMNS}&limit=1`,
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
      | 'stripe_receipt_url'
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
      | 'status'
      | 'stripe_payment_intent_id'
      | 'stripe_customer_id'
      | 'stripe_receipt_url'
      | 'paid_at'
      | 'expires_at'
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

export type ProposalEmailKind = 'signed_docs' | 'studio_notice'
export type ProposalEmailStatus = 'pending' | 'claimed' | 'sent' | 'failed'

export type ProposalEmailRow = {
  id: string
  payment_id: string
  acceptance_id: string
  kind: ProposalEmailKind
  status: ProposalEmailStatus
  to_email: string | null
  resend_id: string | null
  idempotency_key: string
  error: string | null
  claimed_at: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
}

const EMAIL_COLUMNS =
  'id,payment_id,acceptance_id,kind,status,to_email,resend_id,idempotency_key,error,claimed_at,sent_at,created_at,updated_at'

export async function ensureProposalEmail(input: {
  paymentId: string
  acceptanceId: string
  kind: ProposalEmailKind
  toEmail: string | null
  idempotencyKey: string
}) {
  const rows = await supabaseRequest<ProposalEmailRow[]>(
    '/rest/v1/proposal_emails?on_conflict=payment_id,kind',
    {
      method: 'POST',
      headers: {Prefer: 'resolution=ignore-duplicates,return=representation'},
      body: JSON.stringify({
        payment_id: input.paymentId,
        acceptance_id: input.acceptanceId,
        kind: input.kind,
        to_email: input.toEmail,
        idempotency_key: input.idempotencyKey,
      }),
    },
  )
  if (rows[0]) return rows[0]
  const existing = await supabaseRequest<ProposalEmailRow[]>(
    `/rest/v1/proposal_emails?payment_id=${eq(input.paymentId)}&kind=${eq(input.kind)}&select=${EMAIL_COLUMNS}&limit=1`,
  )
  const row = existing[0]
  if (!row) throw new Error(`Email ${input.kind} for ${input.paymentId} was not stored.`)
  return row
}

export async function claimProposalEmail(id: string) {
  const rows = await supabaseRequest<ProposalEmailRow[]>(
    `/rest/v1/proposal_emails?id=${eq(id)}&status=in.(pending,failed)&select=${EMAIL_COLUMNS}`,
    {
      method: 'PATCH',
      headers: {Prefer: 'return=representation'},
      body: JSON.stringify({
        status: 'claimed',
        claimed_at: new Date().toISOString(),
        error: null,
      }),
    },
  )
  return rows[0] ?? null
}

export async function resetStaleClaimedProposalEmails(minutes = 15) {
  const cutoff = new Date(Date.now() - minutes * 60_000).toISOString()
  await supabaseRequest<ProposalEmailRow[]>(
    `/rest/v1/proposal_emails?status=eq.claimed&claimed_at=lt.${encodeURIComponent(cutoff)}&select=${EMAIL_COLUMNS}`,
    {
      method: 'PATCH',
      headers: {Prefer: 'return=representation'},
      body: JSON.stringify({status: 'pending', error: 'stale_claim_released'}),
    },
  )
}

export async function markProposalEmailSent(id: string, resendId: string | null) {
  const rows = await supabaseRequest<ProposalEmailRow[]>(
    `/rest/v1/proposal_emails?id=${eq(id)}&select=${EMAIL_COLUMNS}`,
    {
      method: 'PATCH',
      headers: {Prefer: 'return=representation'},
      body: JSON.stringify({
        status: 'sent',
        resend_id: resendId,
        error: null,
        sent_at: new Date().toISOString(),
      }),
    },
  )
  if (!rows[0]) throw new Error(`Email ${id} was not marked sent.`)
  return rows[0]
}

export async function markProposalEmailFailed(id: string, error: string) {
  const rows = await supabaseRequest<ProposalEmailRow[]>(
    `/rest/v1/proposal_emails?id=${eq(id)}&select=${EMAIL_COLUMNS}`,
    {
      method: 'PATCH',
      headers: {Prefer: 'return=representation'},
      body: JSON.stringify({status: 'pending', error}),
    },
  )
  if (!rows[0]) throw new Error(`Email ${id} was not marked pending.`)
  return rows[0]
}

export async function pendingProposalEmails(limit = 25) {
  await resetStaleClaimedProposalEmails()
  return supabaseRequest<ProposalEmailRow[]>(
    `/rest/v1/proposal_emails?status=in.(pending,failed)&select=${EMAIL_COLUMNS}&order=created_at.asc&limit=${limit}`,
  )
}

export async function paidPaymentsMissingStudioEmail(limit = 25) {
  const payments = await supabaseRequest<PaymentRow[]>(
    `/rest/v1/proposal_payments?status=eq.paid&proposal_id=neq.preview&select=${PAYMENT_COLUMNS}&order=paid_at.desc.nullslast,updated_at.desc&limit=${limit}`,
  )
  const paymentIds = payments.map((payment) => payment.id)
  if (paymentIds.length === 0) return []
  const rows = await supabaseRequest<ProposalEmailRow[]>(
    `/rest/v1/proposal_emails?payment_id=in.(${paymentIds.map(encodeURIComponent).join(',')})&kind=eq.studio_notice&select=${EMAIL_COLUMNS}`,
  )
  const paymentsWithStudioNotice = new Set(rows.map((row) => row.payment_id))
  return payments.filter((payment) => !paymentsWithStudioNotice.has(payment.id))
}
