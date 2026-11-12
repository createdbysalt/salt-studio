import 'server-only'
import type {ProposalDocument} from '@/components/ProposalPage'
import {
  agreedTextHash,
  latestAcceptanceForProposal,
  latestPaymentForProposal,
  type AcceptanceRow,
  type LatestPayment,
} from '@/lib/proposal/acceptances'
import {isDevPreview, isProposalUnlocked, loadProposal} from '@/lib/proposal/load'
import {
  honoredPercent,
  proposalIsAccepted,
  proposalIsExpired,
  quoteInputs,
  quoteSelection,
  resolveProposalSelection,
  selectionKey,
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
  /** The signature to reuse, when the terms have not moved. */
  reuseAcceptance: AcceptanceRow | null
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
  if (proposalIsAccepted(proposal)) return {ok: false, error: 'This proposal is already signed.'}

  // A signature on file keeps its own terms alive, but only for the exact
  // thing it signed. Checked further down, once there is a selection to
  // compare against: anything else is a new deal at today's prices.
  const signed = await latestAcceptanceForProposal(proposal._id)

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
  const inputs = quoteInputs(proposal)
  const live = quoteSelection(inputs, selection)
  if (!live) return {ok: false, error: 'Choose a package first.'}

  const pkg = (proposal.packages ?? []).find((item) => item._id === live.packageId)
  if (!pkg) return {ok: false, error: 'Choose a package first.'}
  const addOns = (proposal.addOns ?? []).filter((item) =>
    live.addOns.some((chosen) => chosen.id === item._id),
  )
  const agreedHash = agreedTextFor(proposal, pkg, addOns)

  // Re-price at the percent on the signature and keep it only when that
  // reproduces, to the cent, the deal they actually signed. A different
  // package or add-on cannot inherit an expired discount this way.
  const sameDeal =
    signed != null &&
    signed.selection_key === selectionKey(selection) &&
    signed.agreed_text_sha256 === agreedHash
  const frozen = sameDeal
    ? quoteSelection({...inputs, percent: honoredPercent(inputs.percent, signed)}, selection)
    : null
  const honorsSignature =
    frozen != null &&
    signed != null &&
    frozen.totalCents === signed.total_cents &&
    frozen.firstCents === signed.first_cents
  const quote = honorsSignature && frozen ? frozen : live

  // Only the signed deal outlives the proposal. Anything else is too late.
  if (proposalIsExpired(proposal) && !honorsSignature) {
    return {ok: false, error: 'This proposal has expired. Write back and a new one can go out.'}
  }

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
    agreedHash,
    latest,
    // One signature per deal. Clicking pay again after walking away reuses
    // it; changing the selection or the price is a new signature.
    reuseAcceptance: honorsSignature ? signed : null,
  }
}
