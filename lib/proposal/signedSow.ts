import type {PdfBlock} from '@/lib/proposal/documentPdf'
import {feeSectionBlocks} from '@/lib/proposal/feeBlocks'
import type {FrozenAddress, FrozenMsaPdf} from '@/lib/proposal/frozenDocument'
import type {ProposalQuote, ProposalSelection} from '@/lib/proposal/quote'
import {formatSigningDate, formatSigningTime} from '@/lib/proposal/signingTime'
import {stegaClean} from 'next-sanity'

type SowProposal = {
  sections?: Array<{_type?: string; body?: unknown}> | null
}

type SowPackage = {
  name?: string | null
  scope?: unknown
  includedItems?: Array<string | null> | null
}

type SowAddOn = {
  name?: string | null
  scope?: unknown
  line?: string | null
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

export function signedSowBlocks(input: {
  proposal: SowProposal
  pkg: SowPackage
  addOns: SowAddOn[]
  selection: ProposalSelection
  signerName: string
  signerLegalName: string
  signerAddress: FrozenAddress
  signerEmail: string
  acceptedAt: string
  quote: ProposalQuote
  msaVersion: string | null
  msaPdf?: FrozenMsaPdf | null
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
    {kind: 'note', text: `Signed date: ${formatSigningDate(input.acceptedAt)}`},
    {kind: 'part', text: 'Parties'},
    {
      kind: 'paragraph',
      text: `This Statement of Work is between Salt Studio and ${input.signerLegalName}.`,
    },
    {kind: 'part', text: input.pkg.name ? clean(input.pkg.name) : 'Selected package'},
    ...portableBlocksToPdf(input.pkg.scope),
    ...(input.pkg.includedItems ?? [])
      .map((item) => clean(item))
      .filter(Boolean)
      .map((text): PdfBlock => ({kind: 'bullet', text, marker: '•'})),
  ]

  for (const addOn of input.addOns) {
    const name = clean(addOn.name) || 'Add-on'
    blocks.push({kind: 'part', text: name})
    blocks.push(...portableBlocksToPdf(addOn.scope))
    const line = clean(addOn.line)
    if (line) blocks.push({kind: 'bullet', text: line, marker: '•'})
  }

  blocks.push(
    {kind: 'part', text: 'Standing terms'},
    ...portableBlocksToPdf(standing),
    ...feeSectionBlocks(input.quote),
  )

  blocks.push(
    {kind: 'part', text: 'Kickoff date'},
    {
      kind: 'paragraph',
      text: input.selection.kickoffDate
        ? `Selected kickoff date: ${input.selection.kickoffDate}.`
        : 'Kickoff date: Confirmed at kickoff.',
    },
    {kind: 'part', text: 'Acceptance block'},
    {
      kind: 'paragraph',
      text: `${input.signerLegalName} agreed to the Master Services Agreement and this Statement of Work. Both documents were sent as attachments with the confirmation email and together form the agreement.`,
    },
    {kind: 'paragraph', text: `Accepted by: ${input.signerName}`},
    {kind: 'paragraph', text: `Email: ${input.signerEmail}`},
    {kind: 'paragraph', text: `Accepted at: ${formatSigningTime(input.acceptedAt)}`},
    {kind: 'paragraph', text: `IP address: ${input.ip ?? 'Not recorded'}`},
    {kind: 'paragraph', text: `MSA version: ${input.msaVersion ?? 'Not recorded'}`},
    // Which agreement, provably. Printing the checksum here means the
    // document the client holds carries its own proof, instead of that
    // living only in our database where it is no use to them.
    ...(input.msaPdf?.status === 'frozen'
      ? [
          {kind: 'paragraph' as const, text: `Agreement file: ${input.msaPdf.filename}`},
          {
            kind: 'paragraph' as const,
            text: `Agreement checksum (SHA-256): ${input.msaPdf.sha256}`,
          },
        ]
      : input.msaPdf?.status === 'missing'
        ? [
            {
              kind: 'paragraph' as const,
              text: `Agreement PDF: not captured at signing (${input.msaPdf.reason}). The agreement text of record is MSA version ${input.msaVersion ?? 'not recorded'}.`,
            },
          ]
        : []),
  )
  if (input.agreedHash) blocks.push({kind: 'paragraph', text: `Record hash: ${input.agreedHash}`})

  return blocks
}
