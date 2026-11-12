import 'server-only'
import type {ProposalDocument} from '@/components/ProposalPage'
import {
  latestAcceptanceForProposal,
  latestPaymentForProposal,
  type AcceptanceRow,
  type LatestPayment,
} from '@/lib/proposal/acceptances'
import {agreedTextFor, plainText} from '@/lib/proposal/agreementText'
import type {PdfBlock} from '@/lib/proposal/documentPdf'
import {
  acceptanceDocumentHash,
  buildFrozenAgreementDocument,
  type FrozenAddress,
  type FrozenAgreementDocument,
  type FrozenMsaPdf,
} from '@/lib/proposal/frozenDocument'
import {isDevPreview, isProposalUnlocked, loadProposal} from '@/lib/proposal/load'
import {freezeMsaPdf} from '@/lib/proposal/msaPdf'
import {
  honoredPercent,
  matchesSignedFigures,
  proposalIsAccepted,
  proposalIsExpired,
  quoteInputs,
  quoteSelection,
  resolveProposalSelection,
  sameSignedDeal,
  selectionKey,
  type ProposalQuote,
  type ProposalSelection,
} from '@/lib/proposal/quote'
import {validateSigningFields} from '@/lib/proposal/signingFields'
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
  signerLegalName: string
  signerAddress: FrozenAddress
  packageName: string
  clientName: string
  agreedHash: string
  agreedDocument: FrozenAgreementDocument | null
  msaPdf: FrozenMsaPdf | null
  latest: LatestPayment | null
  /** The signature to reuse, when the terms have not moved. */
  reuseAcceptance: AcceptanceRow | null
}

function clean(value: string | null | undefined) {
  return stegaClean(value ?? '').trim()
}

type Block = {
  _type?: string
  children?: Array<{text?: string}>
  style?: string
  listItem?: string
}

function dateLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', {dateStyle: 'long', timeZone: 'UTC'}).format(date)
}

function formatAddress(address: FrozenAddress) {
  return address.lines.join(', ')
}

function portableBlocksToPdf(blocks: unknown): PdfBlock[] {
  if (!Array.isArray(blocks)) return []
  return (blocks as Block[]).flatMap((block): PdfBlock[] => {
    const text = (block.children ?? [])
      .map((child) => child.text ?? '')
      .join('')
      .trim()
    if (!text) return []
    if (block.listItem) return [{kind: 'bullet' as const, text, marker: '•'}]
    if (block.style && block.style !== 'normal') return [{kind: 'heading' as const, text}]
    return [{kind: 'paragraph' as const, text}]
  })
}

function signedSowBlocks(input: {
  proposal: ProposalDocument
  pkg: NonNullable<ProposalDocument['packages']>[number]
  addOns: NonNullable<ProposalDocument['addOns']>
  selection: ProposalSelection
  signerName: string
  signerLegalName: string
  signerAddress: FrozenAddress
  signerEmail: string
  acceptedAt: string
  quote: ProposalQuote
  msaVersion: string | null
  agreedHash: string | null
  ip: string | null
}) {
  const sow = (input.proposal.sections ?? []).find(
    (section) => section._type === 'proposalSowSection',
  )
  const standing = sow && 'body' in sow ? sow.body : null
  const blocks: PdfBlock[] = [
    {kind: 'kicker', text: 'Salt Studio'},
    {kind: 'title', text: 'Signed Statement of Work'},
    {kind: 'note', text: `Client legal name: ${input.signerLegalName}`},
    {kind: 'note', text: `Mailing address: ${formatAddress(input.signerAddress)}`},
    {kind: 'note', text: `Signed date: ${dateLabel(input.acceptedAt)}`},
    {kind: 'heading', text: 'Parties'},
    {
      kind: 'paragraph',
      text: `This Statement of Work is between Salt Studio and ${input.signerLegalName}.`,
    },
    {kind: 'heading', text: input.pkg.name ? clean(input.pkg.name) : 'Selected package'},
    ...portableBlocksToPdf(input.pkg.scope),
    ...(input.pkg.includedItems ?? [])
      .map((item) => clean(item))
      .filter(Boolean)
      .map((text): PdfBlock => ({kind: 'bullet', text, marker: '•'})),
  ]

  for (const addOn of input.addOns) {
    const name = clean(addOn.name)
    if (name) blocks.push({kind: 'heading', text: name})
    blocks.push(...portableBlocksToPdf(addOn.scope))
    const line = clean(addOn.line)
    if (line) blocks.push({kind: 'bullet', text: line, marker: '•'})
  }

  blocks.push(
    {kind: 'heading', text: 'Standing terms'},
    ...portableBlocksToPdf(standing),
    {kind: 'heading', text: 'Fees and payment steps'},
    {kind: 'paragraph', text: `Total fee: ${money(input.quote.totalCents)}.`},
    {kind: 'paragraph', text: `Payment made now: ${money(input.quote.firstCents)}.`},
    ...input.quote.steps.map(
      (step): PdfBlock => ({
        kind: 'bullet',
        marker: '•',
        text: `${step.percent}% (${money(step.amountCents)}) — ${step.trigger}`,
      }),
    ),
  )

  blocks.push(
    {kind: 'heading', text: 'Kickoff date'},
    {
      kind: 'paragraph',
      text: `Selected kickoff date: ${input.selection.kickoffDate ?? 'Not selected'}.`,
    },
    {kind: 'heading', text: 'Acceptance block'},
    {kind: 'paragraph', text: `Accepted by: ${input.signerName}`},
    {kind: 'paragraph', text: `Email: ${input.signerEmail}`},
    {kind: 'paragraph', text: `Accepted at: ${input.acceptedAt}`},
    {kind: 'paragraph', text: `IP address: ${input.ip ?? 'Not recorded'}`},
    {kind: 'paragraph', text: `MSA version: ${input.msaVersion ?? 'Not recorded'}`},
  )
  if (input.agreedHash) blocks.push({kind: 'paragraph', text: `Record hash: ${input.agreedHash}`})

  return blocks
}

function money(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100)
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

  if (formData.get('agree') !== 'yes') {
    return {ok: false, error: 'Tick the box to agree to the scope and the agreement.'}
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
  /**
   * A signature carries over only when the deal is genuinely the same one.
   *
   * Three things have to hold, and all three matter:
   *   1. the same package and add-ons, by selection key
   *   2. the proposal content has not been edited since they signed
   *   3. re-pricing it today lands on the same figures, to the cent
   *
   * The third is the one that protects the charge. Without it the amount
   * comes from the stored row and is never checked against the live
   * proposal, so a price corrected in Sanity after someone signed and walked
   * away would be charged at the old number with no signal that anything had
   * changed. Both the screen and the charge would agree and both be wrong.
   *
   * For a frozen v3 document the content hash lives inside the document.
   * Older rows kept it in `agreed_text_sha256`. A v3 document from before
   * that field existed has neither, so it fails to match and the client
   * simply signs again at today's price.
   */
  const contentHash = agreedTextFor(proposal, pkg, addOns)
  const sameDeal = sameSignedDeal(signed, selectionKey(selection), contentHash)
  const frozen = sameDeal
    ? quoteSelection({...inputs, percent: honoredPercent(inputs.percent, signed)}, selection)
    : null
  const honorsSignature = matchesSignedFigures(frozen, signed)
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

  if (honorsSignature && signed) {
    const address = signed.signer_address ?? {formatted: '', lines: []}
    return {
      ok: true,
      proposal,
      selection,
      quote,
      signerName: signed.signer_name,
      signerEmail: signed.signer_email,
      signerLegalName: signed.signer_legal_name ?? '',
      signerAddress: address,
      packageName: signed.package_name ?? clean(pkg.name),
      clientName: signed.client_name ?? clean(proposal.clientDisplayName),
      agreedHash: signed.agreed_text_sha256,
      agreedDocument: signed.agreed_document,
      msaPdf:
        signed.msa_pdf_sha256 && signed.msa_pdf_bytes_base64
          ? {
              status: 'frozen',
              sha256: signed.msa_pdf_sha256,
              bytesBase64: signed.msa_pdf_bytes_base64,
              filename: signed.msa_pdf_filename ?? 'Master-Services-Agreement.pdf',
              contentType: signed.msa_pdf_content_type ?? 'application/pdf',
            }
          : signed.msa_pdf_missing_reason
            ? {status: 'missing', reason: signed.msa_pdf_missing_reason}
            : null,
      latest,
      reuseAcceptance: signed,
    }
  }

  const fields = validateSigningFields(formData)
  if (!fields.ok) return fields

  const acceptedAt = new Date().toISOString()
  const msaPdf = await freezeMsaPdf(proposal.msa?.pdfUrl)
  const sowBlocks = signedSowBlocks({
    proposal,
    pkg,
    addOns,
    selection,
    signerName: fields.signerName,
    signerLegalName: fields.legalName,
    signerAddress: fields.address,
    signerEmail: fields.email,
    acceptedAt,
    quote,
    msaVersion: clean(proposal.msa?.version) || null,
    agreedHash: null,
    ip: null,
  })
  const agreedDocument = buildFrozenAgreementDocument({
    signerFullName: fields.signerName,
    signerLegalName: fields.legalName,
    signerAddress: fields.address,
    signerEmail: fields.email,
    acceptedAt,
    proposalId: proposal._id,
    clientName: clean(proposal.clientDisplayName) || null,
    packageId: quote.packageId,
    packageName: clean(pkg.name) || null,
    addonIds: quote.addOns.map((item) => item.id),
    addonNames: addOns.map((addOn) => clean(addOn.name)).filter(Boolean),
    selectionKey: selectionKey(selection),
    selection,
    quote,
    contentSha256: contentHash,
    scheduleName: quote.scheduleName ?? proposal.paymentSchedule?.name ?? null,
    msaId: proposal.msa?._id ?? null,
    msaVersion: clean(proposal.msa?.version) || null,
    msaEffectiveDate: proposal.msa?.effectiveDate ?? null,
    msaBodyText: plainText(proposal.msa?.body),
    msaPdf,
    sowBlocks,
  })
  const agreedHash = acceptanceDocumentHash(agreedDocument)
  agreedDocument.sow.blocks = signedSowBlocks({
    proposal,
    pkg,
    addOns,
    selection,
    signerName: fields.signerName,
    signerLegalName: fields.legalName,
    signerAddress: fields.address,
    signerEmail: fields.email,
    acceptedAt,
    quote,
    msaVersion: clean(proposal.msa?.version) || null,
    agreedHash,
    ip: null,
  })

  return {
    ok: true,
    proposal,
    selection,
    quote,
    signerName: fields.signerName,
    signerEmail: fields.email,
    signerLegalName: fields.legalName,
    signerAddress: fields.address,
    packageName: clean(pkg.name),
    clientName: clean(proposal.clientDisplayName) || clean(proposal.clientLegalName),
    agreedHash,
    agreedDocument,
    msaPdf,
    latest,
    // One signature per deal. Clicking pay again after walking away reuses
    // it; changing the selection or the price is a new signature.
    reuseAcceptance: null,
  }
}
