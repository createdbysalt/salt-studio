import {createHash} from 'node:crypto'
import type {PdfBlock} from '@/lib/proposal/documentPdf'
import type {ProposalQuote, ProposalSelection, QuoteStep} from '@/lib/proposal/quote'

export type FrozenAddress = {
  formatted: string
  lines: string[]
}

export type FrozenMsaPdf =
  | {
      status: 'frozen'
      sha256: string
      bytesBase64: string
      filename: string
      contentType: string
    }
  | {
      status: 'missing'
      reason: string
    }

export type FrozenAgreementDocument = {
  version: 3
  signer: {
    fullName: string
    legalName: string
    address: FrozenAddress
    email: string
    acceptedAt: string
  }
  proposal: {
    id: string
    clientName: string | null
    packageId: string
    packageName: string | null
    addonIds: string[]
    addonNames: string[]
    selectionKey: string
    kickoffDate: string | null
  }
  quote: {
    totalCents: number
    firstCents: number
    sameDayPercent: number | null
    scheduleName: string | null
    steps: QuoteStep[]
  }
  msa: {
    id: string | null
    version: string | null
    effectiveDate: string | null
    bodyText: string
    pdf: FrozenMsaPdf
  }
  sow: {
    blocks: PdfBlock[]
  }
}

export function sha256Bytes(bytes: Uint8Array) {
  return createHash('sha256').update(bytes).digest('hex')
}

export function base64FromBytes(bytes: Uint8Array) {
  return Buffer.from(bytes).toString('base64')
}

export function bytesFromBase64(value: string) {
  return new Uint8Array(Buffer.from(value, 'base64'))
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((item) => stableJson(item)).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

export function acceptanceDocumentHash(document: FrozenAgreementDocument) {
  const blocks = [...document.sow.blocks]
  const last = blocks.at(-1)
  if (last?.kind === 'paragraph' && last.text.startsWith('Record hash: ')) blocks.pop()
  return createHash('sha256')
    .update(
      stableJson({
        ...document,
        sow: {blocks},
      }),
    )
    .digest('hex')
}

export function cleanText(value: string | null | undefined) {
  return (value ?? '').trim().replace(/\s+/g, ' ')
}

export function parseFrozenAddress(value: string | null | undefined): FrozenAddress | null {
  const formatted = (value ?? '').trim()
  const lines = formatted
    .split(/\n|,/)
    .map((line) => cleanText(line))
    .filter(Boolean)
  if (formatted.length > 1000 || lines.length < 4) return null
  return {formatted, lines}
}

export function validSignerEmail(value: string | null | undefined) {
  const email = cleanText(value).toLowerCase()
  if (email.length > 320) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return email
}

export function buildFrozenAgreementDocument(input: {
  signerFullName: string
  signerLegalName: string
  signerAddress: FrozenAddress
  signerEmail: string
  acceptedAt: string
  proposalId: string
  clientName: string | null
  packageId: string
  packageName: string | null
  addonIds: string[]
  addonNames: string[]
  selectionKey: string
  selection: ProposalSelection
  quote: ProposalQuote
  scheduleName: string | null
  msaId: string | null
  msaVersion: string | null
  msaEffectiveDate: string | null
  msaBodyText: string
  msaPdf: FrozenMsaPdf
  sowBlocks: PdfBlock[]
}): FrozenAgreementDocument {
  return {
    version: 3,
    signer: {
      fullName: input.signerFullName,
      legalName: input.signerLegalName,
      address: input.signerAddress,
      email: input.signerEmail,
      acceptedAt: input.acceptedAt,
    },
    proposal: {
      id: input.proposalId,
      clientName: input.clientName,
      packageId: input.packageId,
      packageName: input.packageName,
      addonIds: input.addonIds,
      addonNames: input.addonNames,
      selectionKey: input.selectionKey,
      kickoffDate: input.selection.kickoffDate,
    },
    quote: {
      totalCents: input.quote.totalCents,
      firstCents: input.quote.firstCents,
      sameDayPercent: input.quote.percent,
      scheduleName: input.scheduleName,
      steps: input.quote.steps,
    },
    msa: {
      id: input.msaId,
      version: input.msaVersion,
      effectiveDate: input.msaEffectiveDate,
      bodyText: input.msaBodyText,
      pdf: input.msaPdf,
    },
    sow: {blocks: input.sowBlocks},
  }
}
