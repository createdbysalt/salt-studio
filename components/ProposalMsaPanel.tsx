import {PortableText, type PortableTextBlock} from 'next-sanity'

/**
 * TODO: Gabi still needs to sign off on this summary. Swap this constant
 * when the lines change. Page UI only. Do not copy it into the agreement
 * body, the PDF, or the signed or emailed documents.
 */
export const MSA_PANEL_SUMMARY = {
  title: "What you're agreeing to",
  lines: [
    "This project runs on our Master Services Agreement, which uses Common Paper's standard Professional Services Agreement (Version 1.1).",
    "The Statement of Work in this proposal covers what we'll do, the price, the timeline and payments.",
    'You accept both together on the acceptance form. The agreement starts the day you accept.',
    'The full agreement is in the PDF. This summary is just for convenience. The agreement is what counts.',
  ],
  pdfLabel: 'Read the full agreement (PDF)',
  note: 'Your legal name, address and acceptance date are added to your signed Statement of Work, which we email you after you accept.',
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

const legalTextClass =
  '[&_h3]:mt-[1.25rem] [&_h3:first-child]:mt-0 [&_h3]:text-[1.0625rem] [&_h3]:font-medium [&_li+li]:mt-1.5 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-4 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-[#8f8f8f]'

/**
 * The agreement inside the proposal panel. Summary first, then the hosted PDF.
 * Signing, the signed statement, and PDF generation do not read this component.
 *
 * With no PDF, the text version stored on the agreement is shown instead.
 * That is what `proposalMsa.body` is for. Nothing here builds a PDF.
 */
export function ProposalMsaPanel({
  body,
  pdfUrl,
}: {
  body: PortableTextBlock[]
  pdfUrl: string | null
}) {
  const attribution = body.filter(isAttribution)
  const rest = body.filter((block) => !isAttribution(block))
  return (
    <div className="max-w-[40rem] text-[1.0625rem] leading-relaxed">
      <section aria-labelledby="msa-summary-title">
        <h3
          id="msa-summary-title"
          className="text-[1.25rem] font-medium leading-snug tracking-[-0.02em]"
        >
          {MSA_PANEL_SUMMARY.title}
        </h3>
        <div className="mt-4">
          {MSA_PANEL_SUMMARY.lines.map((line) => (
            <p key={line} className="mt-3 first:mt-0">
              {line}
            </p>
          ))}
        </div>
      </section>
      {pdfUrl ? (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center rounded-lg bg-[#08090a] px-5 py-3 text-[0.95rem] font-medium text-white hover:bg-[#08090a]/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#08090a]"
        >
          {MSA_PANEL_SUMMARY.pdfLabel}
        </a>
      ) : rest.length > 0 ? (
        <div data-proposal-document data-msa-full className={`mt-6 ${legalTextClass}`}>
          <PortableText value={rest} />
        </div>
      ) : null}
      <p className="mt-3 text-[0.95rem] leading-relaxed text-[#5c5c5c]">{MSA_PANEL_SUMMARY.note}</p>
      {pdfUrl
        ? null
        : attribution.map((block) => (
            <p
              key={block._key}
              data-msa-attribution
              className="mt-6 text-[0.875rem] leading-relaxed text-[#5c5c5c]"
            >
              {blockText(block)}
            </p>
          ))}
    </div>
  )
}
