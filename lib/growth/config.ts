/**
 * Business Growth Analysis (Black Friday 2026): the fixed facts of the offer.
 *
 * The quiz itself (questions, options, points, bands) is a Sanity `quiz`
 * document with the slug below, seeded by scripts/seed-growth-analysis-quiz.mjs.
 * What lives here is everything the code has to agree with that document on:
 * which question feeds which stage, the prices, and the fit rule.
 *
 * Copy rules for anything a visitor reads: no em or en dashes, no health
 * claims, no invented numbers.
 */

export const GROWTH_QUIZ_SLUG = 'growth-analysis'

export const GROWTH_REPORT_CENTS = 2_500
export const GROWTH_DIAGNOSTIC_CENTS = 100_000
export const GROWTH_DIAGNOSTIC_REGULAR_CENTS = 150_000

/** The Black Friday price on the Diagnostic stops at the end of this day (Pacific). */
export const GROWTH_DIAGNOSTIC_DEADLINE = '2027-01-01T08:00:00.000Z'
export const GROWTH_DIAGNOSTIC_DEADLINE_LABEL = 'December 31'

export type GrowthStageId = 'found' | 'website' | 'leads' | 'booking' | 'followup'

export type GrowthStageConfig = {
  id: GrowthStageId
  label: string
  /** Question keys averaged into this stage. Order here is the order of the customer's path. */
  questions: string[]
  /** Two sentences shown on the free result when this stage is the weakest. */
  leak: string
}

export const GROWTH_STAGES: GrowthStageConfig[] = [
  {
    id: 'found',
    label: 'Getting found',
    questions: ['getting-found'],
    leak: "People who hear your name look you up before they do anything else. Right now there's a good chance they don't find enough to keep going.",
  },
  {
    id: 'website',
    label: 'Website',
    questions: ['website'],
    leak: "Your site isn't doing the job a referral used to do. Someone who lands on it can't quickly tell what you do or how to book a consult.",
  },
  {
    id: 'leads',
    label: 'Lead handling',
    questions: ['lead-capture', 'first-reply'],
    leak: "Inquiries are coming in, but they wait too long for an answer or land where nobody is looking. That's where people who already wanted to say yes drift away.",
  },
  {
    id: 'booking',
    label: 'Booking',
    questions: ['booking'],
    leak: 'People raise their hand, then it takes too many steps to get them on the calendar. Every extra step is a chance for them to book somewhere else.',
  },
  {
    id: 'followup',
    label: 'Follow-up',
    questions: ['follow-up', 'reviews'],
    leak: "When someone goes quiet, the conversation ends. Most of them weren't saying no. They were busy.",
  },
]

/** Unscored questions the report and the fit rule read by key. */
export const GROWTH_KEYS = {
  foundation: 'foundation',
  revenue: 'monthly-revenue',
  clientValue: 'client-value',
  goal: 'goal',
  businessType: 'business-type',
  firstName: 'first-name',
  businessName: 'business-name',
  website: 'website-url',
} as const

/**
 * Option `_key`s (set by the seed script) that count as a fit for the
 * Diagnostic: $30k to $150k a month, a new client worth $1,000 or more, and a
 * business type on the campaign's list. Internal only. Everyone sees the offer.
 */
export const GROWTH_FIT = {
  revenue: ['rev-30-75', 'rev-75-150'],
  clientValue: ['value-1000-3000', 'value-over-3000'],
  businessType: [
    'type-med-spa',
    'type-chiropractic',
    'type-physical-therapy',
    'type-dermatology',
    'type-plastic-surgery',
    'type-iv-therapy',
    'type-weight-loss',
  ],
} as const

export const GROWTH_REPORT_PREVIEW = [
  'The one leak costing you the most, in a sentence',
  'A read on each step, from being found to follow-up',
  'What we see on your website, if you gave us one',
  'A 30-day plan in the order to do it, with an owner and a date for each item',
]
