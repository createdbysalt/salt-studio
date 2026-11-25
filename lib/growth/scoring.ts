import {GROWTH_FIT, GROWTH_KEYS, GROWTH_STAGES, type GrowthStageId} from '@/lib/growth/config'
import {
  questionAnswerKey,
  type DynamicQuiz,
  type DynamicQuizBand,
  type DynamicQuizResult,
} from '@/lib/quiz/dynamic'

/**
 * Scoring for the Business Growth Analysis quiz.
 *
 * The generic quiz engine adds points up. This quiz reads the customer's
 * path instead: five stages, each 0 to 100, and an overall score pulled
 * hard toward the weakest one (weakest x 0.8 + average x 0.2), so nearly
 * everyone leaves with one clear leak. Pure, so the client can show it at
 * once and the server can recompute it from raw answers.
 */

export type GrowthStageRead = 'strong' | 'watch' | 'open'

export type GrowthStageScore = {
  id: GrowthStageId
  label: string
  score: number
  read: GrowthStageRead
}

export type GrowthResult = {
  score: number
  band: DynamicQuizBand | null
  stages: GrowthStageScore[]
  /** The lowest stage. Ties go to the earliest stage in the path. */
  weakest: GrowthStageScore | null
  /** Points on the unscored foundation question, or null when unanswered. */
  foundation: number | null
  /** Internal fit flag for the Diagnostic. Never shown to the visitor. */
  fit: boolean
}

export function stageRead(score: number): GrowthStageRead {
  if (score >= 70) return 'strong'
  if (score >= 40) return 'watch'
  return 'open'
}

function pointsFor(quiz: DynamicQuiz, answers: Record<string, string>, key: string): number | null {
  const question = (quiz.questions ?? []).find((q) => questionAnswerKey(q) === key)
  if (!question) return null
  const option = question.options?.find((o) => o._key === answers[key])
  return option ? (option.points ?? 0) : null
}

function average(values: number[]) {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export function scoreGrowthQuiz(quiz: DynamicQuiz, answers: Record<string, string>): GrowthResult {
  const stages: GrowthStageScore[] = []
  for (const stage of GROWTH_STAGES) {
    const points = stage.questions
      .map((key) => pointsFor(quiz, answers, key))
      .filter((p): p is number => p !== null)
    if (points.length === 0) continue
    const score = Math.round(average(points))
    stages.push({id: stage.id, label: stage.label, score, read: stageRead(score)})
  }

  let weakest: GrowthStageScore | null = null
  for (const stage of stages) {
    if (!weakest || stage.score < weakest.score) weakest = stage
  }

  const score = weakest
    ? Math.round(weakest.score * 0.8 + average(stages.map((s) => s.score)) * 0.2)
    : 0

  const band =
    [...(quiz.bands ?? [])]
      .sort((a, b) => (b.minScore ?? 0) - (a.minScore ?? 0))
      .find((b) => score >= (b.minScore ?? 0)) ?? null

  const picked = (key: string, allowed: readonly string[]) => allowed.includes(answers[key] ?? '')
  const fit =
    picked(GROWTH_KEYS.revenue, GROWTH_FIT.revenue) &&
    picked(GROWTH_KEYS.clientValue, GROWTH_FIT.clientValue) &&
    picked(GROWTH_KEYS.businessType, GROWTH_FIT.businessType)

  return {
    score,
    band,
    stages,
    weakest,
    foundation: pointsFor(quiz, answers, GROWTH_KEYS.foundation),
    fit,
  }
}

/** The growth score in the shape the generic quiz pipeline stores and tracks. */
export function growthAsDynamicResult(
  quiz: DynamicQuiz,
  answers: Record<string, string>,
): DynamicQuizResult {
  const result = scoreGrowthQuiz(quiz, answers)
  return {
    score: result.score,
    band: result.band,
    topAreas: result.weakest ? [result.weakest.label] : [],
  }
}
