import type {PdfBlock} from '@/lib/proposal/documentPdf'
import {formatCents, monthlyBillingSentence, type ProposalQuote} from '@/lib/proposal/quote'

/**
 * The fees block of the signed statement.
 *
 * One-time figures only. Each selected monthly add-on gets one bullet after
 * the steps. A quote with no monthly add-ons keeps the same lines as before.
 */
export function feeSectionBlocks(quote: ProposalQuote): PdfBlock[] {
  const blocks: PdfBlock[] = [
    {kind: 'part', text: 'Fees and payment steps'},
    {kind: 'paragraph', text: `Total fee: ${formatCents(quote.totalCents)}.`},
    {kind: 'paragraph', text: `Payment made now: ${formatCents(quote.firstCents)}.`},
    ...quote.steps.map(
      (step): PdfBlock => ({
        kind: 'bullet',
        marker: '•',
        text: `${step.percent}% (${formatCents(step.amountCents)}) — ${step.trigger}`,
      }),
    ),
  ]
  for (const item of quote.monthly) {
    const line = monthlyBillingSentence([item])
    if (!line) continue
    blocks.push({kind: 'bullet', marker: '•', text: line})
  }
  return blocks
}
