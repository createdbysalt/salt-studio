import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import test from 'node:test'
import {agreedTextFor} from '@/lib/proposal/agreementText'
import {feeSectionBlocks} from '@/lib/proposal/feeBlocks'
import {
  acceptanceDocumentHash,
  buildFrozenAgreementDocument,
  oneTimeAddOnsFromSelection,
} from '@/lib/proposal/frozenDocument'
import {
  billingTypeOf,
  discountedAmount,
  formatAddOnPrice,
  formatCents,
  monthlyBillingSentence,
  postedChooseOneError,
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

test('one-time add-ons are never discounted, and they count toward the split', () => {
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

// --- monthly add-ons and choose-one groups --------------------------------
//
// Monthly prices stay off the total, the deposit, and every step. A missing
// billing type is one-time, so the tests above need no migration.

const FIFTY_FIFTY = {
  name: '50/50',
  steps: [
    {_key: 's1', percent: 50, trigger: 'On signing'},
    {_key: 's2', percent: 50, trigger: 'When the work is accepted'},
  ],
}

/** $4,800 package, $900 one-time, $500 and $1,500 monthly. Discount off. */
function mixedBilling(schedule: QuoteProposal['paymentSchedule'] = FIFTY_FIFTY) {
  return proposal({
    sameDayOffer: {deadline: null},
    sections: [
      {_type: 'proposalPackagesSection', enabled: true, sameDayDiscount: {enabled: false}},
    ],
    packages: [{_id: 'pkg-landing', amount: 4800, name: 'Landing page'}],
    addOns: [
      {_id: 'addon-video', amount: 900, name: 'Video edits', billingType: 'one-time'},
      {_id: 'addon-notes', amount: 500, name: 'Monthly notes', billingType: 'monthly'},
      {_id: 'addon-plan', amount: 1500, name: 'Plan one', billingType: 'monthly'},
    ],
    paymentSchedule: schedule,
  })
}

const MIXED_SELECTION = {
  packageId: 'pkg-landing',
  addonIds: ['addon-video', 'addon-notes', 'addon-plan'],
  kickoffDate: null,
}

test('a missing billing type is one-time, and only the word monthly is monthly', () => {
  assert.equal(billingTypeOf(undefined), 'one-time')
  assert.equal(billingTypeOf(null), 'one-time')
  assert.equal(billingTypeOf(''), 'one-time')
  assert.equal(billingTypeOf('one-time'), 'one-time')
  assert.equal(billingTypeOf('yearly'), 'one-time')
  assert.equal(billingTypeOf(' Monthly '), 'monthly')
  assert.equal(formatAddOnPrice(500, null), '$500')
  assert.equal(formatAddOnPrice(500, 'monthly'), '$500 a month')
})

test('one-time plus monthly on 50/50 keeps monthly out of the total and the deposit', () => {
  const quote = quoteProposal(mixedBilling(), MIXED_SELECTION, NOW)
  assert.ok(quote)
  assert.deepEqual(quote.addOns, [{id: 'addon-video', amountCents: 90_000}])
  assert.equal(quote.totalCents, 570_000)
  assert.equal(quote.firstCents, 285_000)
  assert.deepEqual(
    quote.steps.map((step) => step.amountCents),
    [285_000, 285_000],
  )
  assert.equal(quote.monthlyCents, 200_000)
  assert.deepEqual(quote.monthly, [
    {id: 'addon-notes', name: 'Monthly notes', amountCents: 50_000},
    {id: 'addon-plan', name: 'Plan one', amountCents: 150_000},
  ])
  assert.equal(
    monthlyBillingSentence(quote.monthly),
    "Billed monthly: Monthly notes, $500 a month. Plan one, $1,500 a month. Not part of the total or today's payment.",
  )
  assert.equal(
    quote.steps.some((step) => step.amountCents === 50_000),
    false,
  )
  assert.equal(
    quote.steps.some((step) => step.amountCents === 150_000),
    false,
  )
})

test('the same fixture on 30/40/30 splits only the one-time total', () => {
  const quote = quoteProposal(mixedBilling(THIRTY_FORTY_THIRTY), MIXED_SELECTION, NOW)
  assert.ok(quote)
  assert.equal(quote.totalCents, 570_000)
  assert.deepEqual(
    quote.steps.map((step) => step.amountCents),
    [171_000, 228_000, 171_000],
  )
  assert.equal(
    quote.steps.reduce((sum, step) => sum + step.amountCents, 0),
    570_000,
  )
  assert.equal(quote.monthlyCents, 200_000)
  assert.equal(
    quote.steps.some((step) => [50_000, 150_000, 200_000].includes(step.amountCents)),
    false,
  )
})

test('a $10,000 package plus $500 a month deposits half of $10,000', () => {
  const quote = quoteProposal(
    proposal({
      sameDayOffer: {deadline: null},
      sections: [
        {_type: 'proposalPackagesSection', enabled: true, sameDayDiscount: {enabled: false}},
      ],
      packages: [{_id: 'pkg-ten', amount: 10_000}],
      addOns: [{_id: 'addon-notes', amount: 500, name: 'Monthly notes', billingType: 'monthly'}],
      paymentSchedule: FIFTY_FIFTY,
    }),
    {packageId: 'pkg-ten', addonIds: ['addon-notes'], kickoffDate: null},
    NOW,
  )
  assert.ok(quote)
  assert.equal(quote.totalCents, 1_000_000)
  assert.equal(quote.firstCents, 500_000)
  assert.equal(quote.monthlyCents, 50_000)
  assert.deepEqual(quote.addOns, [])
})

test('a choose-one group keeps the first in proposal order and refuses two on a post', () => {
  const doc = proposal({
    addOns: [
      {_id: 'addon-linkedin-two', amount: 2000, name: 'LinkedIn two', chooseOneGroup: 'linkedin'},
      {_id: 'addon-linkedin-one', amount: 1500, name: 'LinkedIn one', chooseOneGroup: 'LinkedIn'},
      {_id: 'addon-notes', amount: 500, name: 'Monthly notes', billingType: 'monthly'},
    ],
  })
  const narrowed = resolveProposalSelection(doc, {
    package: 'pkg-foundation',
    addon: ['addon-linkedin-one', 'addon-notes', 'addon-linkedin-two', 'addon-linkedin-one'],
  })
  assert.deepEqual(narrowed.addonIds, ['addon-notes', 'addon-linkedin-two'])
  assert.equal(postedChooseOneError(doc, []), null)
  assert.equal(postedChooseOneError(doc, ['addon-linkedin-one']), null)
  assert.equal(postedChooseOneError(doc, ['addon-linkedin-one', 'addon-linkedin-one']), null)
  assert.equal(
    postedChooseOneError(doc, ['addon-linkedin-one', 'addon-linkedin-two']),
    'Choose only one add-on from each group.',
  )
  assert.equal(postedChooseOneError(doc, ['addon-unknown', 'addon-also-unknown']), null)

  const source = readFileSync(new URL('../lib/proposal/sign.ts', import.meta.url), 'utf8')
  const refuseAt = source.indexOf('if (groupError) return {ok: false, error: groupError}')
  const acceptanceAt = source.indexOf('await latestAcceptanceForProposal')
  assert.ok(refuseAt > 0)
  assert.ok(acceptanceAt > refuseAt)
})

test('a group key used by one add-on does not hide a second add-on', () => {
  const doc = proposal({
    addOns: [
      {_id: 'addon-solo', amount: 100, chooseOneGroup: 'solo'},
      {_id: 'addon-other', amount: 200, chooseOneGroup: 'other'},
    ],
  })
  const selection = resolveProposalSelection(doc, {
    addon: ['addon-other', 'addon-solo'],
  })
  assert.deepEqual(selection.addonIds, ['addon-other', 'addon-solo'])
  assert.equal(postedChooseOneError(doc, ['addon-solo', 'addon-other']), null)
})

const ONE_TIME_AGREED_HASH = '473d87092b24786542353c31eeaabae44d471048f84ee05787795acf033333ee'
const ONE_TIME_DOCUMENT_HASH = 'a94cb4fc802e9a646c423bc0499b9e43d1f11fcaf0d9de8cbab09ee18c451ec4'

test('freezing one-time add-on prices keeps the agreed text and document hash from main', () => {
  const block = (text: string) => ({
    _type: 'block',
    style: 'normal',
    children: [{_type: 'span', text}],
  })
  const pkg = {
    name: 'Landing page',
    scope: [block('One landing page.')],
    includedItems: ['Design', 'Build'],
  }
  const addOn = {
    name: 'Video edits',
    line: 'One round of edits.',
    scope: [block('Edit the interviews.')],
  }
  const agreed = agreedTextFor(
    {
      sections: [{_type: 'proposalSowSection', body: [block('Standing terms.')]}],
      msa: {version: '1.0', body: [block('Agreement body.')]},
    },
    pkg,
    [addOn],
  )
  assert.equal(agreed, ONE_TIME_AGREED_HASH)

  const quote = quoteProposal(
    proposal({
      sameDayOffer: {deadline: null},
      sections: [
        {_type: 'proposalPackagesSection', enabled: true, sameDayDiscount: {enabled: false}},
      ],
      packages: [{_id: 'pkg-landing', amount: 4800}],
      addOns: [{_id: 'addon-video', amount: 900, name: 'Video edits'}],
      paymentSchedule: FIFTY_FIFTY,
    }),
    {packageId: 'pkg-landing', addonIds: ['addon-video'], kickoffDate: null},
    NOW,
  )
  assert.ok(quote)
  assert.deepEqual(quote.monthly, [])
  const fees = feeSectionBlocks(quote)
  assert.deepEqual(
    fees.map((item) => item.text),
    [
      'Fees and payment steps',
      'Total fee: $5,700.',
      'Payment made now: $2,850.',
      '50% ($2,850) — On signing',
      '50% ($2,850) — When the work is accepted',
    ],
  )
  assert.equal(
    fees.some((item) => item.text.includes('Billed monthly')),
    false,
  )

  const document = buildFrozenAgreementDocument({
    signerFullName: 'Preview Signer',
    signerLegalName: 'Preview Legal',
    signerAddress: {formatted: '1 Main St, Town, US', lines: ['1 Main St', 'Town', 'US']},
    signerEmail: 'preview@example.test',
    acceptedAt: '2026-11-20T00:00:00.000Z',
    proposalId: 'proposal-one-time',
    clientName: 'Preview',
    packageId: 'pkg-landing',
    packageName: 'Landing page',
    addonIds: ['addon-video'],
    addonNames: ['Video edits'],
    selectionKey: 'pkg-landing|addon-video',
    selection: {packageId: 'pkg-landing', addonIds: ['addon-video'], kickoffDate: null},
    quote,
    contentSha256: agreed,
    kickoffUrl: null,
    scheduleName: '50/50',
    msaId: 'msa-1',
    msaVersion: '1.0',
    msaEffectiveDate: '2026-01-01',
    msaBodyText: 'Agreement body.',
    msaPdf: {status: 'missing', reason: 'preview'},
    sowBlocks: fees,
  })
  assert.equal('monthly' in document.quote, false)
  assert.deepEqual(document.proposal.addons, [
    {id: 'addon-video', name: 'Video edits', amountCents: 90_000},
  ])
  assert.equal(acceptanceDocumentHash(document), ONE_TIME_DOCUMENT_HASH)
  const withoutPrices = {
    ...document,
    proposal: {...document.proposal},
  }
  delete withoutPrices.proposal.addons
  assert.equal(acceptanceDocumentHash(withoutPrices), ONE_TIME_DOCUMENT_HASH)
  assert.equal(agreed, ONE_TIME_AGREED_HASH)
})

test('signing freezes one-time add-on prices and leaves monthly add-ons off that list', () => {
  const source = readFileSync(new URL('../lib/proposal/sign.ts', import.meta.url), 'utf8')
  assert.match(source, /oneTimeAddOns:\s*oneTimeAddOnsFromSelection\(/)
  const frozen = oneTimeAddOnsFromSelection(
    [
      {_id: 'addon-video', name: 'Video edits'},
      {_id: 'addon-notes', name: 'Monthly notes'},
      {_id: 'addon-blank', name: '   '},
    ],
    [
      {id: 'addon-video', amountCents: 90_000},
      {id: 'addon-blank', amountCents: 10_000},
    ],
  )
  assert.deepEqual(frozen, [
    {id: 'addon-video', name: 'Video edits', amountCents: 90_000},
    {id: 'addon-blank', name: 'Add-on', amountCents: 10_000},
  ])

  const empty = buildFrozenAgreementDocument({
    signerFullName: 'Preview Signer',
    signerLegalName: 'Preview Legal',
    signerAddress: {formatted: '1 Main St, Town, US', lines: ['1 Main St', 'Town', 'US']},
    signerEmail: 'preview@example.test',
    acceptedAt: '2026-11-20T00:00:00.000Z',
    proposalId: 'proposal-monthly-only',
    clientName: 'Preview',
    packageId: 'pkg-landing',
    packageName: 'Landing page',
    addonIds: ['addon-notes'],
    addonNames: ['Monthly notes'],
    oneTimeAddOns: [],
    selectionKey: 'pkg-landing|addon-notes',
    selection: {packageId: 'pkg-landing', addonIds: ['addon-notes'], kickoffDate: null},
    quote: {
      packageId: 'pkg-landing',
      packageAmountCents: 480_000,
      packageDueCents: 480_000,
      percent: null,
      addOns: [],
      monthly: [{id: 'addon-notes', name: 'Monthly notes', amountCents: 50_000}],
      monthlyCents: 50_000,
      totalCents: 480_000,
      steps: [{key: 'full', percent: 100, trigger: 'On signing', amountCents: 480_000}],
      scheduleName: 'Full',
      firstCents: 480_000,
    },
    contentSha256: 'abc',
    kickoffUrl: null,
    scheduleName: 'Full',
    msaId: null,
    msaVersion: null,
    msaEffectiveDate: null,
    msaBodyText: '',
    msaPdf: {status: 'missing', reason: 'preview'},
    sowBlocks: [],
  })
  assert.equal('addons' in empty.proposal, false)
})
