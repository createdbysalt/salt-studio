import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import test from 'node:test'
import {previewProposal} from '@/components/proposalPreview'
import {agreedTextFor} from '@/lib/proposal/agreementText'
import {addOnCardLabel} from '@/lib/proposal/cardName'
import {monthlyBillingSentence, quoteInputs, quoteSelection} from '@/lib/proposal/quote'

const CARD = 'Site Care: Growth Plan'
const NAME = 'Growth Plan'
const LINE = 'A plan for the website.'
const SCOPE = [{_type: 'block', children: [{text: LINE}]}]

test('a card name is the card and pick-list label, and the scope name stays put', () => {
  assert.equal(addOnCardLabel(`  ${CARD}  `, NAME), CARD)

  const growth = (previewProposal(undefined, {groupAddOns: true}).addOns ?? []).find(
    (addOn) => addOn.name === NAME,
  )
  assert.ok(growth)
  assert.equal(growth.cardName, CARD)
  assert.equal(addOnCardLabel(growth.cardName, growth.name), CARD)

  const monthly = {
    _id: 'addon-growth',
    name: NAME,
    cardName: CARD,
    amount: 500,
    billingType: 'monthly' as const,
  }
  const inputs = quoteInputs({
    packages: [{_id: 'pkg', amount: 4800, name: 'Landing'}],
    addOns: [monthly],
  })
  assert.equal(inputs.addOns[0]?.name, NAME)
  const priced = quoteSelection(inputs, {packageId: 'pkg', addonIds: ['addon-growth']})
  assert.ok(priced)
  const sentence = monthlyBillingSentence(priced.monthly) ?? ''
  assert.match(sentence, /Growth Plan, \$500 a month/)
  assert.equal(sentence.includes(CARD), false)

  const proposal = {sections: [], msa: {version: '1.0', body: []}}
  const pkg = {name: 'Landing', scope: [], includedItems: []}
  const named = {name: NAME, line: LINE, scope: SCOPE}
  const withCardField = {...named, cardName: CARD}
  const ifCardWereTheName = {name: CARD, line: LINE, scope: SCOPE}
  const agreed = agreedTextFor(proposal, pkg, [named])
  assert.equal(agreed, agreedTextFor(proposal, pkg, [withCardField]))
  assert.notEqual(agreed, agreedTextFor(proposal, pkg, [ifCardWereTheName]))
})

test('a blank card name leaves every label on the add-on name', () => {
  assert.equal(addOnCardLabel(null, NAME), NAME)
  assert.equal(addOnCardLabel(undefined, NAME), NAME)
  assert.equal(addOnCardLabel('', NAME), NAME)
  assert.equal(addOnCardLabel('   ', NAME), NAME)

  const plain = previewProposal().addOns ?? []
  assert.equal(plain.length > 0, true)
  for (const addOn of plain) {
    assert.equal(addOn.cardName ?? null, null)
    assert.equal(addOnCardLabel(addOn.cardName, addOn.name), addOn.name)
  }

  const proposal = {sections: [], msa: {version: '1.0', body: []}}
  const pkg = {name: 'Landing', scope: [], includedItems: []}
  const named = {name: NAME, line: LINE, scope: SCOPE}
  const blank = {...named, cardName: ''}
  const absent = {...named, cardName: null}
  const agreed = agreedTextFor(proposal, pkg, [named])
  assert.equal(agreed, agreedTextFor(proposal, pkg, [blank]))
  assert.equal(agreed, agreedTextFor(proposal, pkg, [absent]))

  for (const file of [
    'lib/proposal/sign.ts',
    'lib/proposal/agreementText.ts',
    'lib/proposal/quote.ts',
    'lib/proposal/paidEmails.ts',
  ]) {
    assert.equal(readFileSync(file, 'utf8').includes('cardName'), false, file)
  }
})
