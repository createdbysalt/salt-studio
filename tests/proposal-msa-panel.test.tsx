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

const STANDARDS_SENTENCE = `${MSA_PANEL_SUMMARY.standardsBefore}${MSA_PANEL_SUMMARY.standardsUrl}${MSA_PANEL_SUMMARY.standardsAfter}`

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

function sourceText(value: PortableTextBlock) {
  const children = (value as {children?: Array<{text?: string}>}).children ?? []
  return children.map((child) => child.text ?? '').join('')
}

test('the summary points at the agreement pdf and keeps the attribution byte for byte', () => {
  const body = [
    block('cover', 'Cover Page', {style: 'h3'}),
    block('provider', 'Salt Studio LLC, trading as SALT Studio'),
    block('credit', ATTRIBUTION),
    block('law', 'The laws of Oregon, United States'),
  ]
  const html = renderToStaticMarkup(<ProposalMsaPanel body={body} pdfUrl={PDF_URL} />)
  const document = new JSDOM(html).window.document

  assert.equal(document.querySelector('details'), null)
  assert.equal(document.querySelector('[data-msa-full]'), null)
  assert.equal(
    document.body.textContent?.includes('Salt Studio LLC, trading as SALT Studio'),
    false,
  )
  assert.equal(document.body.textContent?.includes('The laws of Oregon, United States'), false)

  assert.equal(document.querySelector('#msa-summary-title')?.textContent, MSA_PANEL_SUMMARY.title)
  const summary = document.querySelector('#msa-summary-title')?.parentElement
  const paragraphs = [...(summary?.querySelectorAll('p') ?? [])].map((node) => node.textContent)
  assert.deepEqual(paragraphs, [
    MSA_PANEL_SUMMARY.lines[0],
    MSA_PANEL_SUMMARY.lines[1],
    STANDARDS_SENTENCE,
    MSA_PANEL_SUMMARY.lines[2],
    MSA_PANEL_SUMMARY.closing,
  ])

  const standards = summary?.querySelector('a')
  assert.equal(standards?.textContent, MSA_PANEL_SUMMARY.standardsUrl)
  assert.equal(standards?.getAttribute('href'), MSA_PANEL_SUMMARY.standardsUrl)
  assert.equal(standards?.getAttribute('target'), '_blank')
  assert.equal(standards?.getAttribute('rel'), 'noopener noreferrer')

  const pdf = [...document.querySelectorAll('a')].find(
    (link) => link.textContent === MSA_PANEL_SUMMARY.pdfLabel,
  )
  assert.ok(pdf)
  assert.equal(pdf.getAttribute('href'), PDF_URL)
  assert.equal(pdf.getAttribute('target'), '_blank')
  assert.equal(pdf.getAttribute('rel'), 'noopener noreferrer')
  assert.equal(summary?.contains(pdf), false)

  assert.equal(
    [...document.querySelectorAll('p')].some((node) => node.textContent === MSA_PANEL_SUMMARY.note),
    true,
  )

  const credit = document.querySelector('[data-msa-attribution]')
  assert.equal(credit?.textContent, ATTRIBUTION)
  assert.equal(credit?.textContent, sourceText(body[2]))
})

test('an agreement without a pdf shows the text version and no pdf link', () => {
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
