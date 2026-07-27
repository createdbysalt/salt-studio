/**
 * The Salt Score quiz — single source of truth for questions, branching,
 * scoring weights, and CTA destinations.
 *
 * Strategy + full rationale: docs/plans/2026-07-27-salt-score-quiz.md
 *
 * One promise ("how much of your business could be automated?"), branched by
 * who the respondent is — never by which service we want to sell. Weights are
 * admitted guesses; calibrate them from real submissions and concierge
 * follow-ups, in this one file only.
 */

export type QuizTrack = 'solo' | 'org'

export type QuizOption = {
  value: string
  label: string
  /** Hours midpoint for hours-scale questions; org-track diagnostic points otherwise. */
  points: number
}

export type QuizQuestion = {
  key: string
  /** The question as shown to the respondent. */
  label: string
  /** Short noun phrase for results display (e.g. "client intake"). Required on scored questions. */
  shortLabel?: string
  /** Optional supporting line under the question. */
  hint?: string
  kind: 'choice' | 'text'
  options?: QuizOption[]
  /** Weight applied to the selected option's points when scoring. 0 = unscored. */
  weight: number
}

/** The five-step hours scale shared by every hours question. */
const HOURS_OPTIONS: QuizOption[] = [
  {value: 'none', label: 'None, really', points: 0},
  {value: '1-2', label: 'An hour or two', points: 1.5},
  {value: '3-5', label: '3–5 hours', points: 4},
  {value: '6-10', label: '6–10 hours', points: 8},
  {value: '10+', label: 'More than 10', points: 12},
]

// ─── Shared openers ───────────────────────────────────────────────────────────

export const OPENER_QUESTIONS: QuizQuestion[] = [
  {
    key: 'businessType',
    label: 'What kind of business are you?',
    kind: 'choice',
    weight: 0,
    options: [
      {value: 'solo-service', label: 'Solo service business — design, coaching, consulting, creative', points: 0},
      {value: 'small-team', label: 'Small studio or team', points: 0},
      {value: 'nonprofit', label: 'Nonprofit, church, or community organization', points: 0},
      {value: 'institution', label: 'School, university, or larger institution', points: 0},
      {value: 'other', label: 'Something else', points: 0},
    ],
  },
  {
    key: 'teamSize',
    label: 'How many people are on your team?',
    kind: 'choice',
    weight: 0,
    options: [
      {value: '1', label: 'Just me', points: 0},
      {value: '2-9', label: '2–9', points: 0},
      {value: '10-50', label: '10–50', points: 0},
      {value: '50+', label: 'More than 50', points: 0},
    ],
  },
  {
    key: 'neverAgain',
    label: 'What’s the one task you’d pay to never do again?',
    hint: 'Chasing invoices… rewriting the same email… say it like it is.',
    kind: 'text',
    weight: 0,
  },
]

// ─── Branch rule ──────────────────────────────────────────────────────────────

export function resolveTrack(answers: Record<string, string>): QuizTrack {
  const isInstitution = answers.businessType === 'institution'
  const isLargeTeam = answers.teamSize === '10-50' || answers.teamSize === '50+'
  return isInstitution || isLargeTeam ? 'org' : 'solo'
}

// ─── Solo track — hours/week on Salt's surface area ───────────────────────────

export const SOLO_QUESTIONS: QuizQuestion[] = [
  {
    key: 'intake',
    shortLabel: 'client intake',
    label: 'How many hours a week go to client intake?',
    hint: 'Collecting info, forms, and back-and-forth before the real work starts.',
    kind: 'choice',
    options: HOURS_OPTIONS,
    weight: 0.8,
  },
  {
    key: 'scheduling',
    shortLabel: 'scheduling',
    label: 'How many hours go to scheduling?',
    hint: 'Booking, rescheduling, reminders.',
    kind: 'choice',
    options: HOURS_OPTIONS,
    weight: 0.9,
  },
  {
    key: 'followups',
    shortLabel: 'follow-ups',
    label: 'How many hours go to follow-ups?',
    hint: 'Chasing replies, sending check-ins and nudges.',
    kind: 'choice',
    options: HOURS_OPTIONS,
    weight: 0.85,
  },
  {
    key: 'drafting',
    shortLabel: 'proposals and first drafts',
    label: 'How many hours go to proposals and first drafts?',
    hint: 'Quotes, outlines, documents started from scratch.',
    kind: 'choice',
    options: HOURS_OPTIONS,
    weight: 0.7,
  },
  {
    key: 'invoicing',
    shortLabel: 'invoicing and payment chasing',
    label: 'How many hours go to invoicing and chasing payments?',
    kind: 'choice',
    options: HOURS_OPTIONS,
    weight: 0.9,
  },
]

// ─── Org track — organization-shaped diagnostics ──────────────────────────────

export const ORG_QUESTIONS: QuizQuestion[] = [
  {
    key: 'inquiries',
    shortLabel: 'answering repetitive questions',
    label: 'How many repetitive questions does your team answer every week?',
    hint: 'From clients, members, students, or the public.',
    kind: 'choice',
    weight: 0.85,
    options: [
      {value: 'handful', label: 'A handful', points: 1},
      {value: 'dozens', label: 'Dozens', points: 4},
      {value: 'hundreds', label: 'Hundreds', points: 8},
      {value: 'constant', label: 'It never stops', points: 12},
    ],
  },
  {
    key: 'knowledge',
    shortLabel: 'finding and sharing knowledge',
    label: 'Where does the knowledge people need actually live?',
    kind: 'choice',
    weight: 0.8,
    options: [
      {value: 'organized', label: 'Well-organized docs', points: 1},
      {value: 'scattered', label: 'Scattered files and PDFs', points: 5},
      {value: 'heads', label: 'Mostly in people’s heads', points: 8},
      {value: 'all', label: 'All of the above', points: 10},
    ],
  },
  {
    key: 'routing',
    shortLabel: 'moving information between systems',
    label: 'How many hours a week does staff spend moving information between systems?',
    hint: 'Entering, re-entering, routing.',
    kind: 'choice',
    options: HOURS_OPTIONS,
    weight: 0.85,
  },
  {
    key: 'approvals',
    shortLabel: 'approvals and decision routing',
    label: 'How many people does a typical decision or approval touch?',
    kind: 'choice',
    weight: 0.6,
    options: [
      {value: '1', label: 'One', points: 0},
      {value: '2-3', label: '2–3', points: 2},
      {value: '4+', label: '4 or more', points: 4},
      {value: 'committees', label: 'Committees', points: 6},
    ],
  },
  {
    key: 'aiReadiness',
    label: 'Is your organization using AI tools today?',
    kind: 'choice',
    weight: 0, // readiness modifier — informs the conversation, not the score
    options: [
      {value: 'no', label: 'Not really', points: 0},
      {value: 'some', label: 'A few individuals experiment', points: 0},
      {value: 'yes', label: 'Team-wide', points: 0},
    ],
  },
]

// ─── Shared closer ────────────────────────────────────────────────────────────

export const WEBSITE_QUESTION: QuizQuestion = {
  key: 'websiteFlag',
  label: 'Is your current website part of the problem?',
  kind: 'choice',
  weight: 0,
  options: [
    {value: 'yes', label: 'Yes — outdated or hard to update', points: 0},
    {value: 'sort-of', label: 'Sort of — it’s fine, but it doesn’t bring in inquiries', points: 0},
    {value: 'no', label: 'No — the website’s good', points: 0},
  ],
}

export function questionsForTrack(track: QuizTrack): QuizQuestion[] {
  return track === 'solo' ? SOLO_QUESTIONS : ORG_QUESTIONS
}

// ─── Org score bands ──────────────────────────────────────────────────────────

export type OrgBand = 'Emerging' | 'Significant' | 'High'

/**
 * Band thresholds over the weighted org sum (max ≈ 27.8).
 * Start as rough tertiles; tune from real submissions.
 */
export const ORG_BAND_THRESHOLDS: {band: OrgBand; min: number}[] = [
  {band: 'High', min: 16},
  {band: 'Significant', min: 8},
  {band: 'Emerging', min: 0},
]

// ─── CTA destinations ─────────────────────────────────────────────────────────

/**
 * Commercial links are env-driven so they can change without a deploy of copy.
 * Fallback: the contact page, so the quiz never renders a dead CTA before the
 * Stripe/Cal.com links exist.
 */
export const QUIZ_CTAS = {
  auditPayment: process.env.NEXT_PUBLIC_QUIZ_AUDIT_PAYMENT_URL || '/contact',
  auditCall: process.env.NEXT_PUBLIC_QUIZ_CALL_URL || '/contact',
  orgIntroCall: process.env.NEXT_PUBLIC_QUIZ_CALL_URL || '/contact',
  website: '/services',
  privacy: '/legal/privacy-policy',
} as const
