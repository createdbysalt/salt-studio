import assert from 'node:assert/strict'
import test from 'node:test'
import {decideFulfillment, type CheckoutSessionFacts} from '@/lib/proposal/fulfillment'

function session(overrides: Partial<CheckoutSessionFacts> = {}): CheckoutSessionFacts {
  return {
    id: 'cs_test_1',
    amountTotal: 247_500,
    currency: 'usd',
    paymentStatus: 'paid',
    paymentIntentId: 'pi_1',
    customerId: 'cus_1',
    livemode: false,
    ...overrides,
  }
}

const open = {amountCents: 247_500, currency: 'usd', status: 'open'}

test('a paid card session marks the payment paid', () => {
  assert.deepEqual(decideFulfillment('checkout.session.completed', session(), open, false), {
    kind: 'set',
    status: 'paid',
  })
})

test('a completed bank debit stays processing until the async success', () => {
  assert.deepEqual(
    decideFulfillment(
      'checkout.session.completed',
      session({paymentStatus: 'unpaid'}),
      open,
      false,
    ),
    {kind: 'set', status: 'processing'},
  )
  assert.deepEqual(
    decideFulfillment(
      'checkout.session.async_payment_succeeded',
      session({paymentStatus: 'paid'}),
      {...open, status: 'processing'},
      false,
    ),
    {kind: 'set', status: 'paid'},
  )
  assert.deepEqual(
    decideFulfillment(
      'checkout.session.async_payment_failed',
      session({paymentStatus: 'unpaid'}),
      {...open, status: 'processing'},
      false,
    ),
    {kind: 'set', status: 'failed'},
  )
})

test('a mismatched amount or currency is refused', () => {
  const amount = decideFulfillment(
    'checkout.session.completed',
    session({amountTotal: 275_000}),
    open,
    false,
  )
  assert.equal(amount.kind, 'refuse')
  const currency = decideFulfillment(
    'checkout.session.completed',
    session({currency: 'eur'}),
    open,
    false,
  )
  assert.equal(currency.kind, 'refuse')
})

test('a livemode mismatch is refused before anything else', () => {
  assert.equal(
    decideFulfillment('checkout.session.completed', session({livemode: true}), open, false).kind,
    'refuse',
  )
  assert.equal(
    decideFulfillment('checkout.session.completed', session({livemode: false}), open, true).kind,
    'refuse',
  )
})

test('an already paid payment ignores later events', () => {
  assert.equal(
    decideFulfillment('checkout.session.completed', session(), {...open, status: 'paid'}, false)
      .kind,
    'ignore',
  )
})

test('an expired open session is marked expired, a started one is left alone', () => {
  assert.deepEqual(
    decideFulfillment('checkout.session.expired', session({paymentStatus: 'unpaid'}), open, false),
    {
      kind: 'set',
      status: 'expired',
    },
  )
  assert.equal(
    decideFulfillment('checkout.session.expired', session(), {...open, status: 'processing'}, false)
      .kind,
    'ignore',
  )
})
