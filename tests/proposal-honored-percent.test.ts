import assert from 'node:assert/strict'
import test from 'node:test'
import {honoredPercent} from '@/lib/proposal/quote'

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
