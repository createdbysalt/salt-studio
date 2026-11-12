import {ProposalGate} from '@/components/ProposalGate'
import {ProposalPage, type ProposalPaymentView} from '@/components/ProposalPage'
import {previewProposal} from '@/components/proposalPreview'
import {latestPaymentForProposal} from '@/lib/proposal/acceptances'
import {isDevPreview, isProposalUnlocked, loadProposal} from '@/lib/proposal/load'
import {resolveProposalSelection} from '@/lib/proposal/quote'
import {sanityFetch} from '@/sanity/lib/live'
import {footerLegalPagesQuery, proposalGateIdentityQuery, settingsQuery} from '@/sanity/lib/queries'
import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

type Props = {
  params: Promise<{token: string}>
  searchParams: Promise<{
    package?: string | string[]
    addon?: string | string[]
    kickoff?: string | string[]
    cards?: string | string[]
  }>
}

type ProposalQuery = Props['searchParams'] extends Promise<infer Query> ? Query : never

function previewCardCount(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value
  const count = Number(raw)
  if (count === 2 || count === 4) return count
  return undefined
}

function gateSearch(query: ProposalQuery) {
  const params = new URLSearchParams()
  const add = (key: string, value: string | string[] | undefined) => {
    if (!value) return
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item)
      return
    }
    params.set(key, value)
  }
  add('package', query.package)
  add('addon', query.addon)
  add('kickoff', query.kickoff)
  add('cards', query.cards)
  const search = params.toString()
  return search ? `?${search}` : ''
}

async function loadClientName(token: string) {
  if (isDevPreview(token)) return previewProposal().clientDisplayName?.trim() || null
  const {data} = await sanityFetch({
    query: proposalGateIdentityQuery,
    params: {key: token},
    stega: false,
  })
  const name = data?.clientDisplayName?.trim()
  if (!data?._id || !name) return null
  return name
}

/** The latest payment, or null when the store is not configured or empty. */
async function loadPayment(proposalId: string): Promise<ProposalPaymentView | null> {
  try {
    const row = await latestPaymentForProposal(proposalId)
    if (!row) return null
    return {
      status: row.status,
      method: row.method,
      amountCents: row.amount_cents,
      signerName: row.proposal_acceptances?.signer_name ?? null,
      signerEmail: row.proposal_acceptances?.signer_email ?? null,
      kickoffDate: row.proposal_acceptances?.kickoff_date ?? null,
    }
  } catch (error) {
    console.error('[proposal] could not read the payment state', error)
    return null
  }
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {token} = await params
  const name = await loadClientName(token)

  return {
    title: name ? `Proposal for ${name}` : 'Proposal',
    robots: {index: false, follow: false},
  }
}

export default async function ProposalRoute({params, searchParams}: Props) {
  const {token} = await params
  const query = await searchParams
  if (!(await isProposalUnlocked(token))) {
    const name = await loadClientName(token)
    if (!name) notFound()
    return (
      <>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.getElementById('proposal-open-boot')?.remove();document.getElementById('proposal-open')?.remove();document.documentElement.style.overflow='';",
          }}
        />
        <ProposalGate token={token} clientName={name} search={gateSearch(query)} />
      </>
    )
  }

  const [proposal, {data: settings}, {data: legalPages}] = await Promise.all([
    loadProposal(token, previewCardCount(query.cards)),
    sanityFetch({query: settingsQuery, stega: false}),
    sanityFetch({query: footerLegalPagesQuery, stega: false}),
  ])
  if (!proposal?._id) notFound()

  const payment = await loadPayment(proposal._id)

  return (
    <ProposalPage
      token={token}
      proposal={proposal}
      selection={resolveProposalSelection(proposal, query)}
      payment={payment}
      settings={settings}
      legalPages={legalPages}
    />
  )
}
