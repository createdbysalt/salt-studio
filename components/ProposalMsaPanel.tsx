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
    'You accept this agreement and the Statement of Work together on the proposal acceptance form. The Effective Date is the date you accept.',
  ],
  standardsBefore:
    'The Cover Page fills in the key terms for this proposal. The Standard Terms are posted by Common Paper at ',
  standardsUrl: 'https://commonpaper.com/standards/professional-services-agreement/1.1',
  standardsAfter:
    ' and are part of this agreement by reference. Both are in the PDF. Where the Cover Page and the Standard Terms differ, the Cover Page controls.',
  closing:
    'This summary is for convenience. The agreement itself, the Cover Page together with the Standard Terms, is what governs.',
  pdfLabel: 'Read the full agreement (PDF)',
  note: 'Your legal name, address, signer and acceptance date come from the acceptance form when you accept. They appear on the Statement of Work cover and in the confirmation email we both receive.',
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

const linkFocus =
  'rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#08090a]'

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
          <p>{MSA_PANEL_SUMMARY.lines[0]}</p>
          <p className="mt-3">{MSA_PANEL_SUMMARY.lines[1]}</p>
          <p className="mt-3">
            {MSA_PANEL_SUMMARY.standardsBefore}
            <a
              href={MSA_PANEL_SUMMARY.standardsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline decoration-[#08090a]/50 underline-offset-[3px] hover:decoration-[#08090a] ${linkFocus}`}
            >
              {MSA_PANEL_SUMMARY.standardsUrl}
            </a>
            {MSA_PANEL_SUMMARY.standardsAfter}
          </p>
          <p className="mt-3">{MSA_PANEL_SUMMARY.lines[2]}</p>
          <p className="mt-3">{MSA_PANEL_SUMMARY.closing}</p>
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
      {attribution.map((block) => (
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
