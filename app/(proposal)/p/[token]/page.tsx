import {ProposalPage, resolveProposalSelection} from '@/components/ProposalPage'
import {
  previewProofPicks,
  previewProposal,
  withPreviewProofProjects,
} from '@/components/proposalPreview'
import {sanityFetch} from '@/sanity/lib/live'
import {
  footerLegalPagesQuery,
  previewProofProjectsQuery,
  proposalByTokenQuery,
  settingsQuery,
} from '@/sanity/lib/queries'
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

function previewCardCount(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value
  const count = Number(raw)
  if (count === 2 || count === 4) return count
  return undefined
}

async function loadProposal(token: string, cardCount?: number) {
  const {data} = await sanityFetch({
    query: proposalByTokenQuery,
    params: {key: token},
    stega: false,
  })
  if (data?._id) return data
  if (process.env.NODE_ENV === 'development' && token === 'preview') {
    const preview = previewProposal(cardCount)
    const {data: projects} = await sanityFetch({
      query: previewProofProjectsQuery,
      params: {slugs: previewProofPicks.map((pick) => pick.slug)},
      stega: false,
    })
    return withPreviewProofProjects(preview, projects ?? [])
  }
  return null
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {token} = await params
  const proposal = await loadProposal(token)
  const name = proposal?.clientDisplayName?.trim()

  return {
    title: name ? `Proposal for ${name}` : 'Proposal',
    robots: {index: false, follow: false},
  }
}

export default async function ProposalRoute({params, searchParams}: Props) {
  const {token} = await params
  const query = await searchParams
  const [proposal, {data: settings}, {data: legalPages}] = await Promise.all([
    loadProposal(token, previewCardCount(query.cards)),
    sanityFetch({query: settingsQuery, stega: false}),
    sanityFetch({query: footerLegalPagesQuery, stega: false}),
  ])
  if (!proposal?._id) notFound()

  return (
    <ProposalPage
      token={token}
      proposal={proposal}
      selection={resolveProposalSelection(proposal, query)}
      settings={settings}
      legalPages={legalPages}
    />
  )
}
