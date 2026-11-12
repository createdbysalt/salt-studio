import assert from 'node:assert/strict'
import test from 'node:test'
import {honoredPercent, quoteSelection, selectionKey, type QuoteInputs} from '@/lib/proposal/quote'

test('the live clock decides for someone who has not signed', () => {
  assert.equal(honoredPercent(10, null), 10)
  assert.equal(honoredPercent(null, null), null)
})

test('a signature keeps the percent it was signed at', () => {
  // They signed at 10% off, then came back after the offer window closed.
  assert.equal(honoredPercent(null, {same_day_percent: 10}), 10)
})

test('signing without a discount does not invent one later', () => {
  assert.equal(honoredPercent(null, {same_day_percent: null}), null)
})

test('a live offer wins over an older, smaller frozen one', () => {
  assert.equal(honoredPercent(15, {same_day_percent: 10}), 15)
})

const inputs: QuoteInputs = {
  packages: [
    {id: 'small', amount: 1000},
    {id: 'big', amount: 8000},
  ],
  addOns: [{id: 'extra', amount: 200}],
  percent: null,
  steps: [
    {key: 'a', percent: 50, trigger: 'On signing'},
    {key: 'b', percent: 50, trigger: 'When the work is accepted'},
  ],
}

/**
 * The rule the signing path enforces: a frozen percent is only applied to
 * the selection it was signed for. Switching packages after the window has
 * closed must not carry the discount over.
 */
function priceFor(selection: {packageId: string; addonIds: string[]}, signed: Signature | null) {
  const sameDeal =
    signed != null && signed.selection_key === selectionKey({...selection, kickoffDate: null})
  const percent = honoredPercent(inputs.percent, sameDeal ? signed : null)
  return quoteSelection({...inputs, percent}, selection)!.totalCents
}

type Signature = {selection_key: string; same_day_percent: number | null}

test('the discount they signed for survives the deadline on that selection', () => {
  const signed: Signature = {selection_key: 'small', same_day_percent: 10}
  assert.equal(priceFor({packageId: 'small', addonIds: []}, signed), 90_000)
})

test('a signed discount cannot be carried to a different package', () => {
  const signed: Signature = {selection_key: 'small', same_day_percent: 10}
  // Full price for the big package: 8000, not 7200.
  assert.equal(priceFor({packageId: 'big', addonIds: []}, signed), 800_000)
})

test('a signed discount cannot be carried by adding an add-on', () => {
  const signed: Signature = {selection_key: 'small', same_day_percent: 10}
  // 1000 undiscounted plus the 200 add-on, not 900 plus 200.
  assert.equal(priceFor({packageId: 'small', addonIds: ['extra']}, signed), 120_000)
})
