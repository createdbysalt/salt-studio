import assert from 'node:assert/strict'
import test from 'node:test'
import {growthAsDynamicResult, scoreGrowthQuiz, stageRead} from '@/lib/growth/scoring'
import type {DynamicQuiz} from '@/lib/quiz/dynamic'

const POINTS = [100, 70, 40, 15]
const SCORED = [
  'getting-found',
  'website',
  'lead-capture',
  'first-reply',
  'booking',
  'follow-up',
  'reviews',
  'foundation',
]

function choice(key: string, optionKeys: string[], points: number[] = []) {
  return {
    _key: key,
    key,
    prompt: key,
    kind: 'choice',
    weight: 0,
    options: optionKeys.map((optionKey, i) => ({
      _key: optionKey,
      label: optionKey,
      points: points[i] ?? 0,
    })),
  }
}

const quiz = {
  _id: 'quiz-growth-analysis',
  slug: 'growth-analysis',
  questions: [
    ...SCORED.map((key) =>
      choice(
        key,
        POINTS.map((p) => `${key}-${p}`),
        POINTS,
      ),
    ),
    choice('monthly-revenue', [
      'rev-under-10',
      'rev-10-30',
      'rev-30-75',
      'rev-75-150',
      'rev-over-150',
    ]),
    choice('client-value', [
      'value-under-500',
      'value-500-1000',
      'value-1000-3000',
      'value-over-3000',
    ]),
    choice('business-type', ['type-med-spa', 'type-chiropractic', 'type-other']),
  ],
  bands: [
    {_key: 'b1', label: 'Leaking at the source', minScore: 0},
    {_key: 'b2', label: 'Working, but leaking', minScore: 40},
    {_key: 'b3', label: 'Mostly covered', minScore: 55},
    {_key: 'b4', label: 'Running well', minScore: 71},
    {_key: 'b5', label: 'Dialed in', minScore: 85},
  ],
} as unknown as DynamicQuiz

/** Answers picking the same points on every scored question, with overrides. */
function answers(points: number, overrides: Record<string, number | string> = {}) {
  const out: Record<string, string> = {}
  for (const key of SCORED) out[key] = `${key}-${points}`
  for (const [key, value] of Object.entries(overrides)) {
    out[key] = typeof value === 'number' ? `${key}-${value}` : value
  }
  return out
}

test('all top answers score 100 and land in the top band', () => {
  const result = scoreGrowthQuiz(quiz, answers(100))
  assert.equal(result.score, 100)
  assert.equal(result.band?.label, 'Dialed in')
  assert.deepEqual(
    result.stages.map((s) => s.id),
    ['found', 'website', 'leads', 'booking', 'followup'],
  )
})

test('the overall score is the weakest stage x 0.8 plus the average x 0.2', () => {
  // Stages: found 100, website 15, leads 100, booking 100, followup 100.
  const result = scoreGrowthQuiz(quiz, answers(100, {website: 15}))
  assert.equal(result.weakest?.id, 'website')
  // 15 * 0.8 + ((100 * 4 + 15) / 5) * 0.2 = 12 + 16.6 = 28.6
  assert.equal(result.score, 29)
  assert.equal(result.band?.label, 'Leaking at the source')
})

test('a two-question stage is the average of its questions', () => {
  const result = scoreGrowthQuiz(quiz, answers(100, {'lead-capture': 40, 'first-reply': 15}))
  const leads = result.stages.find((s) => s.id === 'leads')
  // (40 + 15) / 2 = 27.5
  assert.equal(leads?.score, 28)
  assert.equal(leads?.read, 'open')
})

test('a tie for weakest goes to the earliest stage in the path', () => {
  const result = scoreGrowthQuiz(quiz, answers(100, {'getting-found': 40, 'booking': 40}))
  assert.equal(result.weakest?.id, 'found')
})

test('the foundation question is reported but never moves the score', () => {
  const strong = scoreGrowthQuiz(quiz, answers(70, {foundation: 100}))
  const weak = scoreGrowthQuiz(quiz, answers(70, {foundation: 15}))
  assert.equal(strong.score, weak.score)
  assert.equal(strong.foundation, 100)
  assert.equal(weak.foundation, 15)
})

test('uniform answers land in the band their score starts', () => {
  assert.equal(scoreGrowthQuiz(quiz, answers(40)).band?.label, 'Working, but leaking')
  assert.equal(scoreGrowthQuiz(quiz, answers(70)).band?.label, 'Mostly covered')
  assert.equal(scoreGrowthQuiz(quiz, answers(15)).band?.label, 'Leaking at the source')
})

test('no answers at all scores zero without throwing', () => {
  const result = scoreGrowthQuiz(quiz, {})
  assert.equal(result.score, 0)
  assert.equal(result.weakest, null)
  assert.deepEqual(result.stages, [])
  assert.equal(result.foundation, null)
  assert.equal(result.fit, false)
})

test('an answer that is not one of the options is ignored', () => {
  const result = scoreGrowthQuiz(quiz, answers(100, {website: 'not-an-option'}))
  assert.equal(
    result.stages.find((s) => s.id === 'website'),
    undefined,
  )
  assert.equal(result.score, 100)
})

test('fit needs revenue, client value and business type all on the list', () => {
  const base = {
    'monthly-revenue': 'rev-30-75',
    'client-value': 'value-1000-3000',
    'business-type': 'type-med-spa',
  }
  const fit = (overrides: Record<string, string> = {}) =>
    scoreGrowthQuiz(quiz, answers(70, {...base, ...overrides})).fit
  assert.equal(fit(), true)
  assert.equal(fit({'monthly-revenue': 'rev-10-30'}), false)
  assert.equal(fit({'monthly-revenue': 'rev-over-150'}), false)
  assert.equal(fit({'client-value': 'value-500-1000'}), false)
  assert.equal(fit({'business-type': 'type-other'}), false)
})

test('stage reads: 70 and up strong, 40 to 69 watch, under 40 open', () => {
  assert.equal(stageRead(70), 'strong')
  assert.equal(stageRead(69), 'watch')
  assert.equal(stageRead(40), 'watch')
  assert.equal(stageRead(39), 'open')
})

test('the generic pipeline gets the growth score and the weakest stage', () => {
  const result = growthAsDynamicResult(quiz, answers(100, {booking: 15}))
  assert.equal(result.topAreas[0], 'Booking')
  assert.equal(result.score, scoreGrowthQuiz(quiz, answers(100, {booking: 15})).score)
})
