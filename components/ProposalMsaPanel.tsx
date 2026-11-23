import {PortableText, type PortableTextBlock} from 'next-sanity'

/**
 * TODO: Gabi still needs to sign off on this summary. Swap this constant
 * when the lines change. Page UI only. Do not copy it into the agreement
 * body, the PDF, or the signed or emailed documents.
 */
export const MSA_PANEL_SUMMARY = {
  title: "What you're agreeing to",
  lines: [
    'This is the Master Services Agreement behind every Salt Studio project: the Common Paper Professional Services Agreement, Version 1.1, with the Standard Terms unchanged.',
    'The Statement of Work in this proposal sets the specifics for this project: what we do, the fees, the timeline and the payments.',
    'The Cover Page fills in the key terms for this proposal, shown below. Where the Cover Page and the Standard Terms differ, the Cover Page controls.',
    'You accept this agreement and the Statement of Work together on the proposal acceptance form. The Effective Date is the date you accept.',
    'This summary is for convenience. The full agreement below is what governs.',
  ],
} as const

/**
 * Cover Page label/value list is omitted.
 *
 * `proposalMsa` stores `version` (string), `effectiveDate` (date), `pdf` (file),
 * and `body` (portable text). Provider, Customer, Effective Date, Governing Law,
 * Chosen Courts, General Cap Amount, and Payment Period are not fields. They
 * only appear inside `body`. The document `effectiveDate` is when that version
 * took effect, not the Cover Page Effective Date. Do not parse `body` to fill
 * this list, and do not leave a blank slot where the list would have been.
 */
export const MSA_COVER_PAGE_TERMS = null

type TextBlock = PortableTextBlock & {
  children?: Array<{text?: string}>
}

function blockText(block: PortableTextBlock) {
  const children = (block as TextBlock).children
  if (!Array.isArray(children)) return ''
  return children.map((child) => child.text ?? '').join('')
}

/** The Common Paper credit, moved in the render only. The line itself is unchanged. */
function isAttribution(block: PortableTextBlock) {
  const text = blockText(block)
  return text.includes('Licensed under CC BY 4.0') && text.includes('Common Paper')
}

function readingOrder(body: PortableTextBlock[]) {
  const rest: PortableTextBlock[] = []
  const attribution: PortableTextBlock[] = []
  for (const block of body) {
    if (isAttribution(block)) attribution.push(block)
    else rest.push(block)
  }
  return [...rest, ...attribution]
}

const legalTextClass =
  '[&_h3]:mt-[1.25rem] [&_h3:first-child]:mt-0 [&_h3]:text-[1.0625rem] [&_h3]:font-medium [&_li+li]:mt-1.5 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-4 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-[#8f8f8f]'

/**
 * The agreement inside the proposal panel. Summary first, full text folded.
 * Signing, the signed statement, and PDF generation do not read this component.
 */
export function ProposalMsaPanel({
  body,
  pdfUrl,
}: {
  body: PortableTextBlock[]
  pdfUrl: string | null
}) {
  const agreement = readingOrder(body)
  return (
    <div className="max-w-[40rem] text-[1.0625rem] leading-relaxed">
      <section aria-labelledby="msa-summary-title">
        <h3 id="msa-summary-title" className="text-[1.0625rem] font-medium">
          {MSA_PANEL_SUMMARY.title}
        </h3>
        <div className="mt-3">
          {MSA_PANEL_SUMMARY.lines.map((line) => (
            <p key={line} className="mt-3 first:mt-0">
              {line}
            </p>
          ))}
        </div>
      </section>
      <details className="mt-5">
        <summary className="cursor-pointer rounded-sm font-medium underline decoration-[#08090a]/50 underline-offset-[3px] hover:decoration-[#08090a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#08090a]">
          Read the full agreement
        </summary>
        <div data-proposal-document data-msa-full className={`mt-4 ${legalTextClass}`}>
          {agreement.length > 0 ? <PortableText value={agreement} /> : null}
        </div>
      </details>
      {pdfUrl ? (
        <p className="mt-6">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-sm text-[0.95rem] text-[#5c5c5c] underline decoration-[#5c5c5c]/70 underline-offset-[3px] hover:text-[#08090a] hover:decoration-[#08090a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#08090a]"
          >
            Download a copy
          </a>
        </p>
      ) : null}
    </div>
  )
}
