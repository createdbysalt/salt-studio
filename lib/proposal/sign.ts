import 'server-only'
import type {ProposalDocument} from '@/components/ProposalPage'
import {
  agreedTextHash,
  latestPaymentForProposal,
  type LatestPayment,
} from '@/lib/proposal/acceptances'
import {isDevPreview, isProposalUnlocked, loadProposal} from '@/lib/proposal/load'
import {
  proposalIsAccepted,
  proposalIsExpired,
  quoteProposal,
  resolveProposalSelection,
  type ProposalQuote,
  type ProposalSelection,
} from '@/lib/proposal/quote'
import {stegaClean} from 'next-sanity'

/**
 * Everything the signing actions check before any row is written or any
 * Stripe call is made. One place, so paying by card and paying by wire
 * refuse the same things.
 */

export type SigningRefusal = {ok: false; error: string}

export type SigningContext = {
  ok: true
  proposal: ProposalDocument
  selection: ProposalSelection
  quote: ProposalQuote
  signerName: string
  signerEmail: string
  packageName: string
  clientName: string
  agreedHash: string
  latest: LatestPayment | null
}

const MIN_NAME = 2

function clean(value: string | null | undefined) {
  return stegaClean(value ?? '').trim()
}

type Block = {
  _type?: string
  children?: Array<{text?: string}>
  style?: string
  listItem?: string
}

/** Plain text of portable text, enough to hash what was shown. */
export function plainText(blocks: unknown): string {
  if (!Array.isArray(blocks)) return ''
  return (blocks as Block[])
    .map((block) => {
      const prefix = block.listItem
        ? '- '
        : block.style && block.style !== 'normal'
          ? `${block.style}: `
          : ''
      const text = (block.children ?? []).map((child) => child.text ?? '').join('')
      return `${prefix}${text}`
    })
    .join('\n')
}

export function agreedTextFor(
  proposal: ProposalDocument,
  pkg: NonNullable<ProposalDocument['packages']>[number],
  addOns: NonNullable<ProposalDocument['addOns']>,
) {
  const sow = (proposal.sections ?? []).find((section) => section._type === 'proposalSowSection')
  const standing = sow && 'body' in sow ? sow.body : null
  return agreedTextHash([
    clean(pkg.name),
    plainText(pkg.scope),
    (pkg.includedItems ?? []).map((item) => clean(item)).join('\n'),
    ...addOns.flatMap((addOn) => [clean(addOn.name), clean(addOn.line), plainText(addOn.scope)]),
    plainText(standing),
    clean(proposal.msa?.version),
    plainText(proposal.msa?.body),
  ])
}

export async function prepareSigning(
  token: string,
  formData: FormData,
): Promise<SigningContext | SigningRefusal> {
  if (token === 'preview' && !isDevPreview(token)) {
    return {ok: false, error: 'This proposal is no longer available.'}
  }
  if (!(await isProposalUnlocked(token))) {
    return {ok: false, error: 'This proposal is locked. Enter the password first.'}
  }

  const proposal = await loadProposal(token)
  if (!proposal?._id) return {ok: false, error: 'This proposal is no longer available.'}
  if (proposalIsExpired(proposal)) {
    return {ok: false, error: 'This proposal has expired. Write back and a new one can go out.'}
  }
  if (proposalIsAccepted(proposal)) return {ok: false, error: 'This proposal is already signed.'}

  const signerName = String(formData.get('signerName') ?? '').trim()
  if (signerName.length < MIN_NAME || signerName.length > 200) {
    return {ok: false, error: 'Type your full name to sign.'}
  }
  if (formData.get('agree') !== 'yes') {
    return {ok: false, error: 'Tick the box to agree to the scope and the agreement.'}
  }

  const signerEmail = clean(proposal.signerEmail)
  if (!signerEmail || !signerEmail.includes('@')) {
    return {
      ok: false,
      error: 'This proposal has no signer email yet. Write back and we will fix it.',
    }
  }

  const selection = resolveProposalSelection(proposal, {
    package: String(formData.get('package') ?? ''),
    addon: formData.getAll('addon').map((value) => String(value)),
    kickoff: String(formData.get('kickoff') ?? ''),
  })
  const quote = quoteProposal(proposal, selection)
  if (!quote) return {ok: false, error: 'Choose a package first.'}

  const pkg = (proposal.packages ?? []).find((item) => item._id === quote.packageId)
  if (!pkg) return {ok: false, error: 'Choose a package first.'}
  const addOns = (proposal.addOns ?? []).filter((item) =>
    quote.addOns.some((chosen) => chosen.id === item._id),
  )

  const latest = await latestPaymentForProposal(proposal._id)
  if (latest?.status === 'paid') return {ok: false, error: 'This proposal is already paid.'}
  if (latest?.status === 'processing' || latest?.status === 'pending_wire') {
    return {ok: false, error: 'A payment is already on its way for this proposal.'}
  }

  return {
    ok: true,
    proposal,
    selection,
    quote,
    signerName,
    signerEmail,
    packageName: clean(pkg.name),
    clientName: clean(proposal.clientDisplayName) || clean(proposal.clientLegalName),
    agreedHash: agreedTextFor(proposal, pkg, addOns),
    latest,
  }
}
