'use server'

import {expireOtherSessions} from '@/lib/payments/sessions'
import {getStripe} from '@/lib/payments/stripe'
import {
  hashToken,
  insertAcceptance,
  insertPayment,
  latestPaymentForProposal,
  paymentsStoreConfigured,
  updatePayment,
  type NewAcceptance,
  type PaymentStatus,
} from '@/lib/proposal/acceptances'
import {
  PROPOSAL_GATE_COOKIE,
  PROPOSAL_GATE_MAX_AGE,
  proposalGateCookiePath,
  proposalPasswordsMatch,
  signProposalGate,
} from '@/lib/proposal/gate'
import {isDevPreview, isProposalUnlocked} from '@/lib/proposal/load'
import {formatCents, selectionKey} from '@/lib/proposal/quote'
import {prepareSigning, type SigningContext} from '@/lib/proposal/sign'
import {sanityFetchLive as sanityFetch} from '@/sanity/lib/live'
import {proposalGateIdentityQuery} from '@/sanity/lib/queries'
import {revalidatePath} from 'next/cache'
import {cookies, headers} from 'next/headers'
import {redirect} from 'next/navigation'

const ALLOWED_QUERY = new Set(['package', 'addon', 'kickoff', 'cards'])
const SESSION_MINUTES = 30
const WIRE_FROM_CENTS = 1_000_000

function safeSearch(search: string) {
  const raw = search.startsWith('?') ? search.slice(1) : search
  const incoming = new URLSearchParams(raw)
  const safe = new URLSearchParams()
  for (const [key, value] of incoming) {
    if (ALLOWED_QUERY.has(key) && value.length > 0 && value.length < 200) safe.append(key, value)
  }
  const query = safe.toString()
  return query ? `?${query}` : ''
}

export async function unlockProposal(
  token: string,
  search: string,
  _previous: {ok: false; error: string} | null,
  formData: FormData,
): Promise<{ok: false; error: string}> {
  const expected = process.env.PROPOSAL_GATE_PASSWORD
  const submitted = String(formData.get('password') ?? '')
  const path = proposalGateCookiePath(token)
  if (!expected || !path || !proposalPasswordsMatch(submitted, expected)) {
    return {ok: false, error: 'That password is not right.'}
  }

  const value = signProposalGate(token)
  if (!value) return {ok: false, error: 'That password is not right.'}

  const cookieStore = await cookies()
  cookieStore.set(PROPOSAL_GATE_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path,
    maxAge: PROPOSAL_GATE_MAX_AGE,
  })

  redirect(`/p/${encodeURIComponent(token)}${safeSearch(search)}`)
}

/**
 * The latest payment status for a proposal, polled by the sign form after
 * Stripe reports the payment complete. Gate-checked like everything else.
 * Reads only the slim identity query, not the whole proposal.
 */
export async function proposalPaymentStatus(
  token: string,
): Promise<{status: PaymentStatus | null}> {
  if (!(await isProposalUnlocked(token))) return {status: null}
  let proposalId: string | null = null
  if (isDevPreview(token)) {
    proposalId = 'preview'
  } else {
    const {data} = await sanityFetch({
      query: proposalGateIdentityQuery,
      params: {key: token},
      stega: false,
    })
    proposalId = data?._id ?? null
  }
  if (!proposalId) return {status: null}
  try {
    const latest = await latestPaymentForProposal(proposalId)
    return {status: latest?.status ?? null}
  } catch {
    return {status: null}
  }
}

export type SignActionState =
  | {ok: true; url: string; amountCents: number}
  | {ok: true; wire: true}
  | {ok: false; error: string}
  | null

const NOT_READY = 'Payments are not switched on yet. Write back and we will take it from here.'

/**
 * Where Stripe sends them back to. A Host header is something the caller
 * controls, so outside development this is the configured site URL and
 * nothing else. Otherwise a crafted header could point the return at
 * another domain, carrying the proposal key with it.
 */
async function requestOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (process.env.NODE_ENV === 'production') {
    return configured || 'https://www.createdbysalt.com'
  }
  const list = await headers()
  const host = list.get('host')
  if (!host || !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) {
    return configured || 'https://www.createdbysalt.com'
  }
  return `http://${host}`
}

async function requestFacts() {
  const list = await headers()
  const forwarded = list.get('x-forwarded-for')
  return {
    ip: forwarded ? forwarded.split(',')[0]?.trim() || null : (list.get('x-real-ip') ?? null),
    userAgent: list.get('user-agent'),
  }
}

/**
 * The signature for this attempt. It is written once per set of terms, so
 * walking away and coming back does not record signing twice.
 */
async function acceptanceFor(token: string, context: SigningContext) {
  return context.reuseAcceptance ?? (await writeAcceptance(token, context))
}

async function writeAcceptance(token: string, context: SigningContext) {
  const {ip, userAgent} = await requestFacts()
  const {proposal, selection, quote} = context
  const row: NewAcceptance = {
    proposal_id: proposal._id,
    token_hash: hashToken(token),
    signer_name: context.signerName,
    signer_email: context.signerEmail,
    client_name: context.clientName || null,
    package_id: quote.packageId,
    package_name: context.packageName || null,
    addon_ids: quote.addOns.map((item) => item.id),
    selection_key: selectionKey(selection),
    kickoff_date: selection.kickoffDate,
    same_day_percent: quote.percent,
    total_cents: quote.totalCents,
    first_cents: quote.firstCents,
    steps: quote.steps,
    // The split actually applied to the package they chose, which is the
    // package's own when it sets one. Reading it off the proposal here would
    // have recorded the wrong plan on the signed row.
    schedule_name: quote.scheduleName ?? proposal.paymentSchedule?.name ?? null,
    msa_version: proposal.msa?.version ?? null,
    agreed_text_sha256: context.agreedHash,
    ip,
    user_agent: userAgent,
  }
  return insertAcceptance(row)
}

/**
 * Signs the proposal and starts the first payment.
 *
 * The browser sends ids, a name, and the agreement. The amount is recomputed
 * here from the proposal document with the same quote the page used, frozen
 * on an acceptance row, and only then handed to Stripe. The webhook is what
 * marks it paid.
 */
export async function signProposal(
  token: string,
  _previous: SignActionState,
  formData: FormData,
): Promise<SignActionState> {
  const context = await prepareSigning(token, formData)
  if (!context.ok) return context

  if (!paymentsStoreConfigured()) return {ok: false, error: NOT_READY}

  const intent = String(formData.get('intent') ?? 'checkout')
  if (intent === 'wire') return requestWire(token, context)
  return beginCheckout(token, context)
}

async function requestWire(token: string, context: SigningContext): Promise<SignActionState> {
  if (context.quote.firstCents < WIRE_FROM_CENTS) {
    return {ok: false, error: `Wire is available from ${formatCents(WIRE_FROM_CENTS)}.`}
  }
  const acceptance = await acceptanceFor(token, context)
  await insertPayment({
    acceptance_id: acceptance.id,
    proposal_id: acceptance.proposal_id,
    step_index: 0,
    method: 'wire',
    amount_cents: acceptance.first_cents,
    currency: 'usd',
    status: 'pending_wire',
  })
  revalidatePath(`/p/${encodeURIComponent(token)}`)
  return {ok: true, wire: true}
}

async function beginCheckout(token: string, context: SigningContext): Promise<SignActionState> {
  const stripe = getStripe()
  if (!stripe) return {ok: false, error: NOT_READY}

  const {quote, latest} = context
  const key = selectionKey(context.selection)

  // A second click with the same selection reuses the open session.
  if (
    latest &&
    latest.method === 'checkout' &&
    latest.status === 'open' &&
    latest.stripe_checkout_session_id &&
    latest.amount_cents === quote.firstCents &&
    latest.proposal_acceptances?.selection_key === key &&
    latest.expires_at &&
    new Date(latest.expires_at).getTime() > Date.now()
  ) {
    // The id can be gone, or belong to the other mode after a key change.
    // Either way the answer is the same: open a fresh session.
    const session = await stripe.checkout.sessions
      .retrieve(latest.stripe_checkout_session_id)
      .catch(() => null)
    if (session?.status === 'open' && session.url) {
      return {ok: true, url: session.url, amountCents: quote.firstCents}
    }
    await updatePayment(latest.id, {status: 'expired'}).catch(() => undefined)
  }

  const acceptance = await acceptanceFor(token, context)

  const existing = await stripe.customers.list({email: context.signerEmail, limit: 1})
  const customer =
    existing.data[0] ??
    (await stripe.customers.create({
      email: context.signerEmail,
      name: context.clientName || context.signerName,
      metadata: {proposal_id: acceptance.proposal_id},
    }))

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MINUTES * 60
  const label = `First payment, ${context.clientName || context.signerName}, ${context.packageName}`
  const origin = await requestOrigin()
  const path = `/p/${encodeURIComponent(token)}`
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    // Stripe's own page: a full screen built for a phone, and it carries the
    // branding set in the Stripe Dashboard. They come back to the kickoff.
    ui_mode: 'hosted_page',
    success_url: `${origin}${path}/kickoff?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${path}#investment`,
    customer: customer.id,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: acceptance.first_cents,
          product_data: {
            name: label,
            description:
              quote.steps.length > 1
                ? `${quote.steps[0]?.percent}% of ${formatCents(quote.totalCents)}. The rest is invoiced later.`
                : undefined,
          },
        },
      },
    ],
    metadata: {acceptance_id: acceptance.id, proposal_id: acceptance.proposal_id, step_index: '0'},
    payment_intent_data: {
      description: label,
      metadata: {acceptance_id: acceptance.id, proposal_id: acceptance.proposal_id},
    },
    expires_at: expiresAt,
  })

  if (!session.url) {
    return {ok: false, error: 'Stripe did not open a payment page. Try again in a moment.'}
  }

  const row = await insertPayment({
    acceptance_id: acceptance.id,
    proposal_id: acceptance.proposal_id,
    step_index: 0,
    method: 'checkout',
    stripe_checkout_session_id: session.id,
    stripe_customer_id: customer.id,
    amount_cents: acceptance.first_cents,
    currency: 'usd',
    status: 'open',
    expires_at: new Date(expiresAt * 1000).toISOString(),
  })

  // Changing the package or an add-on starts a new session. The old page
  // must stop being payable, or they could still pay the old price for a
  // selection they have moved on from.
  await expireOtherSessions(stripe, acceptance.proposal_id, row.id)

  return {ok: true, url: session.url, amountCents: acceptance.first_cents}
}
