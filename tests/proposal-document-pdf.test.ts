import assert from 'node:assert/strict'
import test from 'node:test'
import {buildProposalPdf} from '@/lib/proposal/documentPdf'

function text(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes)
}

test('the agreement PDF names the document and keeps parentheses intact', () => {
  const pdf = text(
    buildProposalPdf([
      {kind: 'kicker', text: 'Salt Studio'},
      {kind: 'title', text: 'Master Services Agreement'},
      {kind: 'note', text: 'Harbor Parish · Version 1.0'},
      {
        kind: 'paragraph',
        text: 'This agreement is between Salt Studio (LLC) and Harbor Parish.',
      },
    ]),
  )

  assert.match(pdf, /^%PDF-1\.4/)
  assert.match(pdf, /Master Services Agreement/)
  assert.match(pdf, /Harbor Parish/)
  assert.match(pdf, /Salt Studio \\\(LLC\\\)/)
  const start = Number(pdf.match(/startxref\n(\d+)/)?.[1])
  assert.equal(pdf.slice(start, start + 4), 'xref')
})

test('a long statement of work continues onto another page', () => {
  const pdf = text(
    buildProposalPdf([
      {kind: 'title', text: 'Statement of Work'},
      ...Array.from({length: 40}, (_, index) => ({
        kind: 'paragraph' as const,
        text: `Paragraph ${index + 1}. The scope names the specific work and the review window. `.repeat(
          8,
        ),
      })),
    ]),
  )

  const pages = pdf.match(/\/Type \/Page(?!s)/g)
  assert.ok(pages && pages.length > 1)
  assert.match(pdf, /2 \/ /)
})
