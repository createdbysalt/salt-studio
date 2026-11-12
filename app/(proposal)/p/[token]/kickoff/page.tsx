import {ProposalKickoff} from '@/components/ProposalKickoff'
import {getStripe} from '@/lib/payments/stripe'
import {latestPaymentForProposal, type LatestPayment} from '@/lib/proposal/acceptances'
import {kickoffLink} from '@/lib/proposal/kickoff'
import {isDevPreview, isProposalUnlocked, loadProposal} from '@/lib/proposal/load'
import {proposalIsAccepted} from '@/lib/proposal/quote'
import type {Metadata} from 'next'
import {stegaClean} from 'next-sanity'
import {notFound, redirect} from 'next/navigation'

type Props = {
  params: Promise<{token: string}>
  searchParams: Promise<{session_id?: string | string[]}>
}

/**
 * Stripe sends them straight back here, which can beat the webhook. This
 * asks Stripe directly so the page opens, while the webhook stays the one
 * thing that writes `paid`.
 */
async function checkoutState(sessionId: string | undefined, proposalId: string) {
  if (!sessionId) return null
  const stripe = getStripe()
  if (!stripe) return null
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.metadata?.proposal_id !== proposalId) return null
    if (session.status !== 'complete') return null
    return session.payment_status === 'paid' ? ('paid' as const) : ('processing' as const)
  } catch {
    return null
  }
}

function clean(value: string | null | undefined) {
  return stegaClean(value ?? '').trim()
}

export const metadata: Metadata = {
  title: 'Book your kickoff',
  robots: {index: false, follow: false},
}

/**
 * The kickoff booking page. Same gate as the proposal, and only once the
 * first payment is confirmed. Before that it sends them back to sign.
 */
export default async function ProposalKickoffRoute({params, searchParams}: Props) {
  const {token} = await params
  const {session_id: sessionParam} = await searchParams
  const sessionId = Array.isArray(sessionParam) ? sessionParam[0] : sessionParam
  const proposalPath = `/p/${encodeURIComponent(token)}`
  if (!(await isProposalUnlocked(token))) redirect(proposalPath)

  const proposal = await loadProposal(token)
  if (!proposal?._id) notFound()

  let payment: LatestPayment | null = null
  try {
    payment = await latestPaymentForProposal(proposal._id)
  } catch (error) {
    console.error('[kickoff] could not read the payment state', error)
  }
  // The development preview is for looking at the page. A real client still
  // has to pay before this calendar opens. A bank debit that is processing
  // counts: the signature is recorded and the call should not wait days.
  const fromRow =
    payment?.status === 'paid'
      ? ('paid' as const)
      : payment?.status === 'processing'
        ? ('processing' as const)
        : payment?.status === 'pending_wire'
          ? ('wire' as const)
          : null
  // Ask Stripe only when the row cannot answer yet: no row at all, or the
  // row is still open on this very session. A failed or expired row must
  // never be overridden by a session that merely reached Stripe.
  const rowCanBeAheadOfUs =
    !payment ||
    (payment.status === 'open' &&
      sessionId != null &&
      payment.stripe_checkout_session_id === sessionId)
  const state = fromRow ?? (rowCanBeAheadOfUs ? await checkoutState(sessionId, proposal._id) : null)
  const open = isDevPreview(token) || proposalIsAccepted(proposal) || state != null
  if (!open) redirect(`${proposalPath}#investment`)
  const paymentState = state ?? 'paid'

  const signed = (proposal.sections ?? []).find(
    (section) => section._type === 'proposalSignedSection' && section.enabled !== false,
  )
  const base = signed && 'kickoffUrl' in signed ? clean(signed.kickoffUrl) : ''
  const acceptance = payment?.proposal_acceptances ?? null
  // No date: the call should happen in the next day or two, so Cal.com opens
  // on the earliest slot. The project start they chose is shown as context.
  const link = kickoffLink(base, {
    date: null,
    name: acceptance?.signer_name || clean(proposal.signerName) || null,
    email: acceptance?.signer_email || clean(proposal.signerEmail) || null,
  })
  if (!link) redirect(`${proposalPath}#signed`)

  const clientName = clean(proposal.clientDisplayName) || 'You'

  return (
    <ProposalKickoff
      clientName={clientName}
      calLink={link.calLink}
      fallbackHref={link.href}
      paymentState={paymentState}
      intro="Grab the earliest time that works for you, ideally in the next day or two. The sooner we talk, the sooner the work starts."
      name={acceptance?.signer_name || clean(proposal.signerName) || null}
      email={acceptance?.signer_email || clean(proposal.signerEmail) || null}
    />
  )
}
