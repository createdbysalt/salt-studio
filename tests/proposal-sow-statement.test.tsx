import assert from 'node:assert/strict'
import test from 'node:test'
import {ProposalScopeCopy, proposalScopeCopyClass} from '@/components/ProposalScopeCopy'
import {ProposalSowStatement} from '@/components/ProposalSowStatement'
import {JSDOM} from 'jsdom'
import type {PortableTextBlock} from 'next-sanity'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'

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

const packageScope = [
  block('what', 'What it is', {style: 'h3'}),
  block('page', 'One page. A single landing page, designed and built.', {listItem: 'bullet'}),
  block('get', 'What you get', {style: 'h3'}),
  block('build', 'The page. Structure, design, build, and launch.', {listItem: 'bullet'}),
]

const videoScope = [
  block('video-get', 'What you get', {style: 'h3'}),
  block('edits', 'The edits. Cut, titled, and delivered.', {listItem: 'bullet'}),
  block('out', 'Not included', {style: 'h3'}),
  block('shoot', 'A new shoot. Filming is not part of this item.', {listItem: 'bullet'}),
]

function statement(addOns: Array<{name: string; scope: PortableTextBlock[]; line: string}>) {
  const html = renderToStaticMarkup(
    createElement(ProposalSowStatement, {
      packageName: 'Landing page',
      packageScope,
      packageItems: ['Page structure'],
      addOns,
      standing: [block('need', 'What we need from you', {style: 'h3'})],
    }),
  )
  return new JSDOM(html).window.document
}

function sectionHeading(document: Document, text: string) {
  return [...document.querySelectorAll('h3')].find(
    (heading) => heading.textContent === text && !heading.hasAttribute('data-sow-part'),
  )
}

test('package scope uses the same section treatment as an add-on scope', () => {
  const document = statement([
    {name: 'Video edits', scope: videoScope, line: 'A set of short edits.'},
  ])
  const packageHeading = sectionHeading(document, 'What you get')
  const addOnHeading = sectionHeading(document, 'Not included')
  assert.ok(packageHeading)
  assert.ok(addOnHeading)
  assert.equal(packageHeading.closest('div')?.className, proposalScopeCopyClass)
  assert.equal(addOnHeading.closest('div')?.className, proposalScopeCopyClass)
  assert.equal(packageHeading.closest('[data-sow-part]'), null)

  const packagePart = document.querySelector('[data-sow-part]')
  assert.equal(packagePart?.textContent, 'Landing page')
  assert.equal(packagePart?.className.includes('text-[1.5rem]'), false)

  const text = document.body.textContent ?? ''
  const packageAt = text.indexOf('Landing page')
  const sectionAt = text.indexOf('What it is')
  const addOnAt = text.indexOf('Video edits')
  const addOnSectionAt = text.indexOf('Not included')
  assert.ok(packageAt < sectionAt && sectionAt < addOnAt && addOnAt < addOnSectionAt)
  assert.match(text, /The page\. Structure, design, build, and launch\./)
  assert.equal(text.includes('Page structure'), false)
})

test('picked add-ons stack in order and leave when they are not picked', () => {
  const picked = statement([
    {name: 'Video edits', scope: videoScope, line: ''},
    {name: 'Monthly notes', scope: [], line: 'Notes after launch.'},
  ])
  const names = [...picked.querySelectorAll('[data-sow-part]')].map((node) => node.textContent)
  assert.deepEqual(names, ['Landing page', 'Video edits', 'Monthly notes'])
  assert.match(picked.body.textContent ?? '', /Notes after launch\./)

  const cleared = statement([])
  assert.equal(cleared.body.textContent?.includes('Video edits'), false)
  assert.equal(cleared.body.textContent?.includes('Monthly notes'), false)
  assert.match(cleared.body.textContent ?? '', /What we need from you/)
})

test('a scope with no portable text falls back to its lines', () => {
  const html = renderToStaticMarkup(
    createElement(ProposalScopeCopy, {blocks: [], items: ['Notes after launch.']}),
  )
  const document = new JSDOM(html).window.document
  assert.equal(document.querySelector('li')?.textContent, 'Notes after launch.')
  assert.equal(document.querySelector('div')?.className, proposalScopeCopyClass)
})
