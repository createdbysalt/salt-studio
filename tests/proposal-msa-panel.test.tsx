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

function renderedAgreementTexts(html: string) {
  const document = new JSDOM(html).window.document
  const root = document.querySelector('[data-msa-full]')
  assert.ok(root, 'full agreement is rendered')
  const texts: string[] = []
  const walk = (el: Element) => {
    const tag = el.tagName
    if (tag === 'P' || tag === 'H3' || tag === 'LI') {
      texts.push(el.textContent ?? '')
      return
    }
    for (const child of el.children) walk(child)
  }
  for (const child of root.children) walk(child)
  return {document, root, texts}
}

test('rendered full agreement text matches the source text exactly', () => {
  const body = [
    block('cover', 'Cover Page', {style: 'h3'}),
    block('provider', 'Salt Studio LLC, trading as SALT Studio'),
    block('credit', ATTRIBUTION),
    block('law', 'The laws of Oregon, United States'),
    block('bullet', 'A listed term that stays byte for byte.', {listItem: 'bullet'}),
  ]
  const html = renderToStaticMarkup(<ProposalMsaPanel body={body} pdfUrl={PDF_URL} />)
  const {document, root, texts} = renderedAgreementTexts(html)
  const rest = body.filter((item) => sourceText(item) !== ATTRIBUTION)
  const credit = body.filter((item) => sourceText(item) === ATTRIBUTION)
  const expected = [...rest, ...credit].map(sourceText)

  assert.deepEqual(texts, expected)
  assert.equal(texts.join('\n'), expected.join('\n'))
  assert.equal(texts[texts.length - 1], ATTRIBUTION)
  assert.equal(texts.slice().sort().join('\n'), body.map(sourceText).slice().sort().join('\n'))

  const full = root.textContent ?? ''
  assert.equal(full.includes(MSA_PANEL_SUMMARY.title), false)
  assert.equal(full.includes(MSA_PANEL_SUMMARY.lines[0]), false)
  assert.equal(full.includes('Download a copy'), false)

  const details = document.querySelector('details')
  assert.ok(details)
  assert.equal(details.hasAttribute('open'), false)
  assert.equal(details.querySelector('summary')?.textContent, 'Read the full agreement')
  assert.equal(details.contains(root), true)

  const link = document.querySelector('a')
  assert.ok(link)
  assert.equal(link.getAttribute('href'), PDF_URL)
  assert.equal(link.getAttribute('target'), '_blank')
  assert.equal(link.getAttribute('rel'), 'noreferrer')
  assert.equal(link.textContent, 'Download a copy')
  assert.equal(root.contains(link), false)
  assert.equal(details.contains(link), false)

  const summary = document.querySelector('#msa-summary-title')
  assert.equal(summary?.textContent, MSA_PANEL_SUMMARY.title)
  const summaryCopy = summary?.parentElement?.textContent ?? ''
  for (const line of MSA_PANEL_SUMMARY.lines) assert.equal(summaryCopy.includes(line), true)
  assert.equal(root.contains(summary), false)
})

test('an agreement without the attribution line renders the source text in order', () => {
  const body = [
    block('one', 'First paragraph, unchanged.'),
    block('two', 'Second paragraph, unchanged.'),
  ]
  const html = renderToStaticMarkup(<ProposalMsaPanel body={body} pdfUrl={null} />)
  const {texts, document} = renderedAgreementTexts(html)
  assert.deepEqual(texts, body.map(sourceText))
  assert.equal(document.querySelector('a'), null)
})
