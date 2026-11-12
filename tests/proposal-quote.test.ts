import assert from 'node:assert/strict'
import test from 'node:test'
import {
  discountedAmount,
  formatCents,
  quoteProposal,
  resolveProposalSelection,
  sameDayPercent,
  selectionKey,
  splitCents,
  type QuoteProposal,
} from '@/lib/proposal/quote'

const NOW = Date.UTC(2026, 10, 11, 12)
const HOUR = 3_600_000

function proposal(overrides: Partial<QuoteProposal> = {}): QuoteProposal {
  return {
    status: 'sent',
    validUntil: new Date(NOW + 24 * HOUR * 13).toISOString(),
    packages: [
      {_id: 'pkg-foundation', amount: 5500},
      {_id: 'pkg-complete', amount: 8500},
    ],
    addOns: [
      {_id: 'addon-copy', amount: 1800},
      {_id: 'addon-care', amount: 600},
    ],
    recommendedPackageId: 'pkg-complete',
    kickoffOptions: [{date: '2026-11-17'}, {date: '2026-12-01'}],
    sameDayOffer: {deadline: new Date(NOW + 24 * HOUR).toISOString()},
    paymentSchedule: {
      name: '50/50',
      steps: [
        {_key: 's1', percent: 50, trigger: 'On signing'},
        {_key: 's2', percent: 50, trigger: 'When the work is accepted'},
      ],
    },
    sections: [
      {
        _type: 'proposalPackagesSection',
        enabled: true,
        sameDayDiscount: {enabled: true, percent: 10},
      },
    ],
    ...overrides,
  }
}

test('50/50 on the preview Foundation package charges $2,475 first', () => {
  const quote = quoteProposal(
    proposal(),
    {packageId: 'pkg-foundation', addonIds: [], kickoffDate: null},
    NOW,
  )
  assert.ok(quote)
  assert.equal(quote.packageAmountCents, 550_000)
  assert.equal(quote.packageDueCents, 495_000)
  assert.equal(quote.totalCents, 495_000)
  assert.equal(quote.firstCents, 247_500)
  assert.deepEqual(
    quote.steps.map((step) => step.amountCents),
    [247_500, 247_500],
  )
  assert.equal(formatCents(quote.firstCents), '$2,475')
})

test('40/30/30 on an odd total rounds in cents and the steps sum to the total', () => {
  const doc = proposal({
    packages: [{_id: 'pkg-odd', amount: 4955}],
    sections: [
      {_type: 'proposalPackagesSection', enabled: true, sameDayDiscount: {enabled: false}},
    ],
    paymentSchedule: {
      name: '40/30/30',
      steps: [
        {_key: 'a', percent: 40, trigger: 'On signing'},
        {_key: 'b', percent: 30, trigger: 'At design sign-off'},
        {_key: 'c', percent: 30, trigger: 'When the work is accepted'},
      ],
    },
  })
  const quote = quoteProposal(doc, {packageId: 'pkg-odd', addonIds: [], kickoffDate: null}, NOW)
  assert.ok(quote)
  assert.deepEqual(
    quote.steps.map((step) => step.amountCents),
    [198_200, 148_650, 148_650],
  )
  assert.equal(
    quote.steps.reduce((sum, step) => sum + step.amountCents, 0),
    quote.totalCents,
  )
  assert.equal(formatCents(quote.steps[1].amountCents), '$1,486.50')
  assert.equal(quote.firstCents, 198_200)
})

test('the last step absorbs the rounding remainder', () => {
  assert.deepEqual(splitCents(100, [33, 33, 34]), [33, 33, 34])
  assert.deepEqual(splitCents(101, [50, 50]), [51, 50])
  assert.deepEqual(splitCents(1, [40, 30, 30]), [0, 0, 1])
  assert.equal(
    splitCents(1000, [33, 33, 34]).reduce((a, b) => a + b, 0),
    1000,
  )
})

test('add-ons are never discounted, and they count toward the split', () => {
  const quote = quoteProposal(
    proposal(),
    {
      packageId: 'pkg-foundation',
      addonIds: ['addon-copy', 'addon-care', 'addon-copy'],
      kickoffDate: null,
    },
    NOW,
  )
  assert.ok(quote)
  assert.deepEqual(quote.addOns, [
    {id: 'addon-copy', amountCents: 180_000},
    {id: 'addon-care', amountCents: 60_000},
  ])
  assert.equal(quote.totalCents, 495_000 + 240_000)
  assert.equal(quote.firstCents, 367_500)
})

test('the discount applies before the deadline and not after it', () => {
  const deadline = NOW + 24 * HOUR
  const doc = proposal({sameDayOffer: {deadline: new Date(deadline).toISOString()}})
  assert.equal(sameDayPercent(doc, deadline - 1000), 10)
  assert.equal(sameDayPercent(doc, deadline), null)
  assert.equal(sameDayPercent(doc, deadline + 1000), null)
  assert.equal(
    quoteProposal(
      doc,
      {packageId: 'pkg-foundation', addonIds: [], kickoffDate: null},
      deadline + 1000,
    )?.firstCents,
    275_000,
  )
})

test('no deadline means no discount, even with the sticker on', () => {
  assert.equal(sameDayPercent(proposal({sameDayOffer: {deadline: null}}), NOW), null)
  assert.equal(sameDayPercent(proposal({sameDayOffer: null}), NOW), null)
})

test('expired or accepted proposals lose the discount', () => {
  assert.equal(sameDayPercent(proposal({status: 'expired'}), NOW), null)
  assert.equal(sameDayPercent(proposal({status: 'signed'}), NOW), null)
  assert.equal(
    sameDayPercent(proposal({validUntil: new Date(NOW - 1000).toISOString()}), NOW),
    null,
  )
})

test('a schedule that does not sum to 100 falls back to one full payment', () => {
  const doc = proposal({
    paymentSchedule: {
      steps: [
        {_key: 'a', percent: 40, trigger: 'On signing'},
        {_key: 'b', percent: 30, trigger: 'Later'},
      ],
    },
  })
  const quote = quoteProposal(
    doc,
    {packageId: 'pkg-foundation', addonIds: [], kickoffDate: null},
    NOW,
  )
  assert.ok(quote)
  assert.equal(quote.steps.length, 1)
  assert.equal(quote.firstCents, quote.totalCents)
})

test('unknown ids are dropped and a posted amount has no field to land in', () => {
  const selection = resolveProposalSelection(proposal(), {
    package: 'pkg-made-up',
    addon: ['addon-copy', 'addon-made-up'],
    kickoff: '1999-01-01',
  })
  assert.equal(selection.packageId, 'pkg-complete')
  assert.deepEqual(selection.addonIds, ['addon-copy'])
  assert.equal(selection.kickoffDate, '2026-11-17')
  assert.equal(
    quoteProposal(proposal(), {packageId: 'pkg-made-up', addonIds: [], kickoffDate: null}, NOW),
    null,
  )
})

test('the selection key ignores add-on order', () => {
  assert.equal(
    selectionKey({packageId: 'p', addonIds: ['b', 'a'], kickoffDate: null}),
    selectionKey({packageId: 'p', addonIds: ['a', 'b'], kickoffDate: null}),
  )
})

test('discounted whole dollars round half up, matching the card', () => {
  assert.equal(discountedAmount(5500, 10), 4950)
  assert.equal(discountedAmount(4955, 10), 4460)
  assert.equal(discountedAmount(5, 10), 5)
  assert.equal(discountedAmount(5500, null), 5500)
})

// --- per-package payment schedules ---------------------------------------
//
// The first step of the split is what checkout charges, so a package picking
// up the wrong split is a wrong charge, not a wrong label.

const THIRTY_FORTY_THIRTY = {
  name: '30/40/30',
  steps: [
    {_key: 'c1', percent: 30, trigger: 'On signing'},
    {_key: 'c2', percent: 40, trigger: 'When the build starts'},
    {_key: 'c3', percent: 30, trigger: 'When the work is accepted'},
  ],
}

/** The two packages, where only the larger one sets its own split. */
function mixedSchedules(completeSchedule: unknown = THIRTY_FORTY_THIRTY) {
  return proposal({
    sameDayOffer: {deadline: null},
    packages: [
      {_id: 'pkg-foundation', amount: 5500},
      {
        _id: 'pkg-complete',
        amount: 8500,
        paymentSchedule: completeSchedule as never,
      },
    ],
  })
}

test('a package without its own schedule follows the proposal', () => {
  const quote = quoteProposal(
    mixedSchedules(),
    {packageId: 'pkg-foundation', addonIds: [], kickoffDate: null},
    NOW,
  )
  assert.ok(quote)
  assert.equal(quote.totalCents, 550_000)
  assert.deepEqual(
    quote.steps.map((step) => step.percent),
    [50, 50],
  )
  assert.equal(quote.firstCents, 275_000)
  assert.equal(quote.scheduleName, '50/50')
})

test('a package with its own schedule uses it instead of the proposal', () => {
  const quote = quoteProposal(
    mixedSchedules(),
    {packageId: 'pkg-complete', addonIds: [], kickoffDate: null},
    NOW,
  )
  assert.ok(quote)
  assert.equal(quote.totalCents, 850_000)
  assert.deepEqual(
    quote.steps.map((step) => step.percent),
    [30, 40, 30],
  )
  assert.equal(quote.firstCents, 255_000)
  assert.equal(quote.scheduleName, '30/40/30')
})

test('two packages on one proposal charge different amounts today', () => {
  const doc = mixedSchedules()
  const small = quoteProposal(
    doc,
    {packageId: 'pkg-foundation', addonIds: [], kickoffDate: null},
    NOW,
  )
  const large = quoteProposal(
    doc,
    {packageId: 'pkg-complete', addonIds: [], kickoffDate: null},
    NOW,
  )
  assert.ok(small && large)
  // Half of 5500 against three tenths of 8500.
  assert.equal(small.firstCents, 275_000)
  assert.equal(large.firstCents, 255_000)
  assert.notEqual(small.steps.length, large.steps.length)
})

test("a package's broken schedule falls back rather than charging a wrong share", () => {
  // These sum to 90. Honouring them would undercharge by a tenth.
  const quote = quoteProposal(
    mixedSchedules({
      name: 'broken',
      steps: [
        {_key: 'x', percent: 60, trigger: 'On signing'},
        {_key: 'y', percent: 30, trigger: 'Later'},
      ],
    }),
    {packageId: 'pkg-complete', addonIds: [], kickoffDate: null},
    NOW,
  )
  assert.ok(quote)
  assert.deepEqual(
    quote.steps.map((step) => step.percent),
    [50, 50],
  )
  assert.equal(quote.firstCents, 425_000)
  assert.equal(quote.scheduleName, '50/50')
})

test("an add-on is split by the selected package's schedule", () => {
  const quote = quoteProposal(
    mixedSchedules(),
    {packageId: 'pkg-complete', addonIds: ['addon-copy'], kickoffDate: null},
    NOW,
  )
  assert.ok(quote)
  assert.equal(quote.totalCents, 1_030_000)
  // Thirty percent of the package and the add-on together, not of the package alone.
  assert.equal(quote.firstCents, 309_000)
  assert.equal(
    quote.steps.reduce((sum, step) => sum + step.amountCents, 0),
    quote.totalCents,
  )
})

test('a per-package split still sums to the total exactly', () => {
  // 8499 splits three ways with a remainder, which the last step absorbs.
  const quote = quoteProposal(
    proposal({
      sameDayOffer: {deadline: null},
      packages: [{_id: 'pkg-complete', amount: 8499, paymentSchedule: THIRTY_FORTY_THIRTY}],
    }),
    {packageId: 'pkg-complete', addonIds: [], kickoffDate: null},
    NOW,
  )
  assert.ok(quote)
  assert.equal(
    quote.steps.reduce((sum, step) => sum + step.amountCents, 0),
    quote.totalCents,
  )
})
