import {agreedTextHash} from '@/lib/proposal/acceptances'
import {stegaClean} from 'next-sanity'

type Block = {
  _type?: string
  children?: Array<{text?: string}>
  style?: string
  listItem?: string
}

type AgreementProposal = {
  sections?: Array<{_type: string; body?: unknown}> | null
  msa?: {version?: string | null; body?: unknown} | null
}

type AgreementPackage = {
  name?: string | null
  scope?: unknown
  includedItems?: Array<string | null> | null
}

type AgreementAddOn = {
  name?: string | null
  line?: string | null
  scope?: unknown
}

function clean(value: string | null | undefined) {
  return stegaClean(value ?? '').trim()
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
  proposal: AgreementProposal,
  pkg: AgreementPackage,
  addOns: AgreementAddOn[],
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
