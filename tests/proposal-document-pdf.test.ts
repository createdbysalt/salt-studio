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
  assert.match(pdf, /Page 2 of /)
  assert.match(pdf, /Salt Studio LLC\. Statement of Work\. Page 1 of /)
})

test('a statement of work keeps the cover, the scope structure, and the acceptance block', () => {
  const pdf = text(
    buildProposalPdf([
      {kind: 'kicker', text: 'Salt Studio'},
      {kind: 'title', text: 'Signed Statement of Work'},
      {kind: 'note', text: 'Client legal name: Fixture Organization LLC'},
      {
        kind: 'note',
        text: 'Mailing address: 100 Test Street, Fixture City, Test Region 10000, United States',
      },
      {kind: 'note', text: 'Signed date: November 12, 2026'},
      {kind: 'part', text: 'Landing page'},
      {kind: 'heading', text: 'What you get'},
      {kind: 'paragraph', text: 'The page. Structure, design, build, and launch.'},
      {kind: 'bullet', text: 'A walkthrough. One session so the office can publish.', marker: '•'},
      {kind: 'part', text: 'Video edits'},
      {kind: 'heading', text: 'Not included'},
      {kind: 'bullet', text: 'A new shoot. Filming is not part of this item.', marker: '•'},
      {kind: 'part', text: 'Acceptance block'},
      {
        kind: 'paragraph',
        text: 'Fixture Organization LLC agreed to the Master Services Agreement and this Statement of Work.',
      },
    ]),
  )

  assert.match(pdf, /Signed Statement of Work/)
  assert.match(pdf, /Cover Page/)
  assert.match(pdf, /LEGAL NAME/)
  assert.match(pdf, /Fixture Organization LLC/)
  assert.match(pdf, /MAILING ADDRESS/)
  assert.match(pdf, /100 Test Street/)
  assert.match(pdf, /SIGNED DATE/)
  assert.match(pdf, /November 12, 2026/)
  assert.match(pdf, /What you get/)
  assert.match(pdf, /Not included/)
  assert.match(pdf, /A walkthrough/)
  assert.match(pdf, /Acceptance block/)
  assert.match(pdf, /createdbysalt.com/)
  assert.equal(pdf.includes('Salt Studio LLC. createdbysalt.com'), false)
  const pages = pdf.match(/\/Type \/Page(?!s)/g)
  assert.equal(pdf.split('Salt Studio LLC').length - 1, pages?.length)
  assert.match(pdf, /\/F2 17 Tf/)
  assert.match(pdf, /\/F2 10 Tf/)
  assert.equal(pdf.includes('Client legal name:'), false)
})
