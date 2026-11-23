import assert from 'node:assert/strict'
import test, {mock} from 'node:test'
import {previewProposal} from '@/components/proposalPreview'
import {chooseOneGroupKey, formatAddOnPrice, quoteInputs} from '@/lib/proposal/quote'
import {JSDOM} from 'jsdom'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'

mock.module('next/navigation', {
  namedExports: {
    useRouter: () => ({
      replace() {},
      push() {},
      refresh() {},
    }),
  },
})

async function loadChoices() {
  const loaded = await import('@/components/ProposalChoices')
  const selection = await import('@/components/ProposalSelection')
  return {
    ProposalChoices: loaded.ProposalChoices,
    ProposalSelectionProvider: selection.ProposalSelectionProvider,
  }
}

function accessibleName(element: Element) {
  const labelledBy = element.getAttribute('aria-labelledby')
  if (labelledBy) {
    return labelledBy
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => element.ownerDocument.getElementById(id)?.textContent ?? '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
  }
  const label = element.getAttribute('aria-label')
  if (label) return label.replace(/\s+/g, ' ').trim()
  const legend = [...element.children].find((child) => child.tagName === 'LEGEND')
  return (legend?.textContent ?? '').replace(/\s+/g, ' ').trim()
}

function roleOf(element: Element) {
  const explicit = element.getAttribute('role')
  if (explicit) return explicit
  if (element.tagName === 'FIELDSET') return 'group'
  return ''
}

function getByRole(root: ParentNode, role: string, options: {name: string}) {
  const matches = [...root.querySelectorAll('*')].filter(
    (element) => roleOf(element) === role && accessibleName(element) === options.name,
  )
  assert.equal(
    matches.length,
    1,
    `expected one ${role} named ${JSON.stringify(options.name)}, found ${matches.length}`,
  )
  return matches[0]
}

async function choices(grouped: boolean) {
  const {ProposalChoices, ProposalSelectionProvider} = await loadChoices()
  const proposal = previewProposal(undefined, {groupAddOns: grouped})
  const packages = (proposal.packages ?? []).flatMap((pkg) => {
    if (!pkg._id || typeof pkg.amount !== 'number') return []
    return [{id: pkg._id, name: pkg.name ?? '', price: '$1', sale: null}]
  })
  const addOns = (proposal.addOns ?? []).flatMap((addOn) => {
    if (!addOn._id || typeof addOn.amount !== 'number') return []
    return [
      {
        id: addOn._id,
        name: addOn.name ?? '',
        price: formatAddOnPrice(addOn.amount, addOn.billingType),
        group: chooseOneGroupKey(addOn.chooseOneGroup),
        category: (addOn.category ?? '').trim() || null,
      },
    ]
  })
  const inputs = quoteInputs(proposal)
  const html = renderToStaticMarkup(
    createElement(ProposalSelectionProvider, {
      token: 'preview',
      kickoff: null,
      inputs,
      packageId: packages[0]?.id ?? null,
      addonIds: [] as string[],
      children: createElement(ProposalChoices, {packages, addOns}),
    }),
  )
  return new JSDOM(html).window.document
}

test('a grouped category names its checkbox group and leaves Choose one alone', async () => {
  const document = await choices(true)
  getByRole(document, 'group', {name: 'Website add-ons'})
  getByRole(document, 'group', {name: 'Growth add-ons'})
  getByRole(document, 'group', {name: 'Add-ons'})
  getByRole(document, 'radiogroup', {name: 'Choose one'})
  assert.equal(
    [...document.querySelectorAll('*')].some(
      (element) => roleOf(element) === 'group' && accessibleName(element) === 'Select any add-ons',
    ),
    false,
  )
})

test('ungrouped add-ons keep the Select any add-ons group', async () => {
  const document = await choices(false)
  getByRole(document, 'group', {name: 'Select any add-ons'})
  getByRole(document, 'radiogroup', {name: 'Choose one'})
})
