import type {QuizBySlugQueryResult} from '@/sanity.types'

/**
 * Pure engine for Sanity-driven service quizzes (/quiz/[slug]).
 *
 * Content — questions, option points, weights, bands, result copy — lives in
 * the `quiz` document and is edited in the Studio. Only the generic mechanics
 * live here: weighted-sum scoring and band resolution. The client scores for
 * instant display; the server action (app/actions/dynamicQuiz.ts) re-fetches
 * the published quiz and re-scores raw answers before storing, so a tampered
 * client can't store a fake score.
 *
 * Answers are keyed by question key and hold the selected option's `_key`
 * (choice), or the raw string (text/url questions).
 */

export type DynamicQuiz = NonNullable<QuizBySlugQueryResult>
export type DynamicQuizQuestion = NonNullable<DynamicQuiz['questions']>[number]
export type DynamicQuizBand = NonNullable<DynamicQuiz['bands']>[number]

export type DynamicQuizResult = {
  /** Weighted sum, rounded to the nearest whole number. */
  score: number
  /** The matched band — highest minScore not exceeding the score. */
  band: DynamicQuizBand | null
  /** Short labels of the top-contributing scored questions (max 3). */
  topAreas: string[]
}

/** The stable identifier answers are stored under. */
export function questionAnswerKey(question: DynamicQuizQuestion): string {
  return question.key ?? question._key
}

/** The visitor-facing label for a stored answer (option label, or the raw text). */
export function answerLabel(question: DynamicQuizQuestion, raw: string): string {
  const option = question.options?.find((o) => o._key === raw)
  return option?.label ?? raw
}

function contribution(question: DynamicQuizQuestion, raw: string | undefined): number {
  if (!raw || question.kind !== 'choice') return 0
  const weight = question.weight ?? 1
  if (weight <= 0) return 0
  const option = question.options?.find((o) => o._key === raw)
  return weight * (option?.points ?? 0)
}

export function scoreDynamicQuiz(
  quiz: DynamicQuiz,
  answers: Record<string, string>,
): DynamicQuizResult {
  const ranked = (quiz.questions ?? [])
    .filter((q) => q.kind === 'choice' && (q.weight ?? 1) > 0)
    .map((q) => ({
      label: q.shortLabel ?? q.prompt ?? '',
      contribution: contribution(q, answers[questionAnswerKey(q)]),
    }))
    .sort((a, b) => b.contribution - a.contribution)

  const score = Math.round(ranked.reduce((sum, r) => sum + r.contribution, 0))

  const band =
    [...(quiz.bands ?? [])]
      .sort((a, b) => (b.minScore ?? 0) - (a.minScore ?? 0))
      .find((b) => score >= (b.minScore ?? 0)) ?? null

  return {
    score,
    band,
    topAreas: ranked
      .filter((r) => r.contribution > 0 && r.label)
      .slice(0, 3)
      .map((r) => r.label),
  }
}

/** Replace {score} in band copy with the actual number. */
export function interpolateScore(text: string | null | undefined, score: number): string {
  return (text ?? '').replaceAll('{score}', String(score))
}

/** The answer to the first website-URL question, if the quiz has one. */
export function websiteUrlAnswer(
  quiz: DynamicQuiz,
  answers: Record<string, string>,
): string | undefined {
  const urlQuestion = quiz.questions?.find((q) => q.kind === 'url')
  if (!urlQuestion) return undefined
  const raw = answers[questionAnswerKey(urlQuestion)]?.trim()
  if (!raw) return undefined
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
}
