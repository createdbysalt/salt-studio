import assert from 'node:assert/strict'
import test from 'node:test'
import {MSA_PANEL_SUMMARY, ProposalMsaPanel} from '@/components/ProposalMsaPanel'
import {JSDOM} from 'jsdom'
import type {PortableTextBlock} from 'next-sanity'
import {renderToStaticMarkup} from 'react-dom/server'

const ATTRIBUTION =
  'Based on the Common Paper Professional Services Agreement, available at https://commonpaper.com. Licensed under CC BY 4.0. Copyright Common Paper, Inc. License: https://creativecommons.org/licenses/by/4.0/. Cover Page adapted for Salt Studio LLC. The Standard Terms are used unchanged.'

const PDF_URL =
  'https://cdn.sanity.io/files/jkqf2ng5/production/6f2313cdc7b5ac1add256890c572af39b4d9dc27.pdf'

const SUMMARY_LINES = [
  "This project runs on our Master Services Agreement, which uses Common Paper's standard Professional Services Agreement (Version 1.1).",
  "The Statement of Work in this proposal covers what we'll do, the price, the timeline and payments.",
  'You accept both together on the acceptance form. The agreement starts the day you accept.',
  'The full agreement is in the PDF. This summary is just for convenience. The agreement is what counts.',
]

const NOTE =
  'Your legal name, address and acceptance date are added to your signed Statement of Work, which we email you after you accept.'

function block(
  key: string,
  text: string,
  extra: {style?: string; listItem?: 'bullet'; level?: number} = {},
): PortableTextBlock {
  return {
    _key: key,
    _type: 'block',
    style: extra.style ?? 'normal',
    markDefs: [],
    children: [{_key: `${key}-span`, _type: 'span', text, marks: []}],
    ...(extra.listItem ? {listItem: extra.listItem, level: extra.level ?? 1} : {}),
  } as PortableTextBlock
}

test('the summary points at the agreement pdf and leaves the attribution in the file', () => {
  const body = [
    block('cover', 'Cover Page', {style: 'h3'}),
    block('provider', 'Salt Studio LLC, trading as SALT Studio'),
    block('credit', ATTRIBUTION),
    block('law', 'The laws of Oregon, United States'),
  ]
  const html = renderToStaticMarkup(<ProposalMsaPanel body={body} pdfUrl={PDF_URL} />)
  const document = new JSDOM(html).window.document

  assert.equal(MSA_PANEL_SUMMARY.title, "What you're agreeing to")
  assert.deepEqual([...MSA_PANEL_SUMMARY.lines], SUMMARY_LINES)
  assert.equal(MSA_PANEL_SUMMARY.pdfLabel, 'Read the full agreement (PDF)')
  assert.equal(MSA_PANEL_SUMMARY.note, NOTE)

  assert.equal(document.querySelector('details'), null)
  assert.equal(document.querySelector('[data-msa-full]'), null)
  assert.equal(document.querySelector('[data-msa-attribution]'), null)
  assert.equal(document.body.textContent?.includes(ATTRIBUTION), false)
  assert.equal(
    document.body.textContent?.includes('Salt Studio LLC, trading as SALT Studio'),
    false,
  )
  assert.equal(document.body.textContent?.includes('The laws of Oregon, United States'), false)

  assert.equal(document.querySelector('#msa-summary-title')?.textContent, MSA_PANEL_SUMMARY.title)
  const summary = document.querySelector('#msa-summary-title')?.parentElement
  const paragraphs = [...(summary?.querySelectorAll('p') ?? [])].map((node) => node.textContent)
  assert.deepEqual(paragraphs, SUMMARY_LINES)
  assert.equal(summary?.querySelector('a'), null)

  const pdf = [...document.querySelectorAll('a')].find(
    (link) => link.textContent === 'Read the full agreement (PDF)',
  )
  assert.ok(pdf)
  assert.equal(pdf.getAttribute('href'), PDF_URL)
  assert.equal(pdf.getAttribute('target'), '_blank')
  assert.equal(pdf.getAttribute('rel'), 'noopener noreferrer')
  assert.equal(summary?.contains(pdf), false)
  assert.equal(
    [...document.querySelectorAll('p')].some((node) => node.textContent === NOTE),
    true,
  )
})

test('an agreement without a pdf shows the text version and the attribution', () => {
  const body = [
    block('one', 'First paragraph, unchanged.'),
    block('credit', ATTRIBUTION),
    block('two', 'Second paragraph, unchanged.'),
  ]
  const html = renderToStaticMarkup(<ProposalMsaPanel body={body} pdfUrl={null} />)
  const document = new JSDOM(html).window.document

  assert.equal(document.querySelector('a[href*="cdn.sanity.io"]'), null)
  assert.equal(
    [...document.querySelectorAll('a')].some(
      (link) => link.textContent === MSA_PANEL_SUMMARY.pdfLabel,
    ),
    false,
  )

  const full = document.querySelector('[data-msa-full]')
  assert.ok(full)
  const texts: string[] = []
  const walk = (el: Element) => {
    const tag = el.tagName
    if (tag === 'P' || tag === 'H3' || tag === 'LI') {
      texts.push(el.textContent ?? '')
      return
    }
    for (const child of el.children) walk(child)
  }
  for (const child of full.children) walk(child)
  assert.deepEqual(texts, ['First paragraph, unchanged.', 'Second paragraph, unchanged.'])
  assert.equal(full.textContent?.includes(ATTRIBUTION), false)
  assert.equal(document.querySelector('[data-msa-attribution]')?.textContent, ATTRIBUTION)
})
