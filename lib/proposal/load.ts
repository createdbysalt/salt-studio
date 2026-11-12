import 'server-only'
import {
  previewProofPicks,
  previewProposal,
  withPreviewProofProjects,
} from '@/components/proposalPreview'
import {PROPOSAL_GATE_COOKIE, verifyProposalGate} from '@/lib/proposal/gate'
import {sanityFetch} from '@/sanity/lib/live'
import {previewProofProjectsQuery, proposalByTokenQuery} from '@/sanity/lib/queries'
import {cookies, draftMode} from 'next/headers'

/**
 * Loading a proposal by its link key. The page and the payment action use
 * the same functions, so what is rendered and what is charged come from
 * the same document.
 */

export function isDevPreview(token: string) {
  return process.env.NODE_ENV === 'development' && token === 'preview'
}

/** Studio draft mode skips the password. The preview link uses the same gate. */
export async function isProposalUnlocked(token: string) {
  if ((await draftMode()).isEnabled) return true
  const cookieStore = await cookies()
  return verifyProposalGate(token, cookieStore.get(PROPOSAL_GATE_COOKIE)?.value)
}

export async function loadProposal(token: string, cardCount?: number) {
  const {data} = await sanityFetch({
    query: proposalByTokenQuery,
    params: {key: token},
    stega: false,
  })
  if (data?._id) return data
  if (isDevPreview(token)) {
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
