import {ProposalKickoff} from '@/components/ProposalKickoff'
import {latestPaymentForProposal, type LatestPayment} from '@/lib/proposal/acceptances'
import {kickoffLink} from '@/lib/proposal/kickoff'
import {isProposalUnlocked, loadProposal} from '@/lib/proposal/load'
import {proposalIsAccepted} from '@/lib/proposal/quote'
import type {Metadata} from 'next'
import {stegaClean} from 'next-sanity'
import {notFound, redirect} from 'next/navigation'

type Props = {params: Promise<{token: string}>}

function clean(value: string | null | undefined) {
  return stegaClean(value ?? '').trim()
}

function dateLabel(date: string | null) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', {month: 'long', day: 'numeric', year: 'numeric'}).format(
    new Date(Date.UTC(year, month - 1, day, 12)),
  )
}

export const metadata: Metadata = {
  title: 'Book your kickoff',
  robots: {index: false, follow: false},
}

/**
 * The kickoff booking page. Same gate as the proposal, and only once the
 * first payment is confirmed. Before that it sends them back to sign.
 */
export default async function ProposalKickoffRoute({params}: Props) {
  const {token} = await params
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
  const paid = proposalIsAccepted(proposal) || payment?.status === 'paid'
  if (!paid) redirect(`${proposalPath}#investment`)

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
      token={token}
      clientName={clientName}
      calLink={link.calLink}
      fallbackHref={link.href}
      heading="Let's book the kickoff call."
      intro="Grab the earliest time that works for you, ideally in the next day or two. The sooner we talk, the sooner the work starts."
      dateLabel={dateLabel(acceptance?.kickoff_date ?? proposal.kickoffOptions?.[0]?.date ?? null)}
      name={acceptance?.signer_name || clean(proposal.signerName) || null}
      email={acceptance?.signer_email || clean(proposal.signerEmail) || null}
    />
  )
}
