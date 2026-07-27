import {
  ORG_BAND_THRESHOLDS,
  ORG_QUESTIONS,
  SOLO_QUESTIONS,
  type OrgBand,
  type QuizQuestion,
  type QuizTrack,
} from './config'

/**
 * Pure scoring functions for the Salt Score quiz. No React, no I/O —
 * everything here is deterministic and unit-testable. The client computes the
 * result for instant display; the server action recomputes it from raw answers
 * before storing, so a tampered client can't store a fake score.
 */

export type SoloResult = {
  track: 'solo'
  /** Estimated automatable hours per week, rounded to the nearest whole hour. */
  hours: number
  /** Workflow labels ranked by weighted contribution, highest first (top 3, zero-contribution excluded). */
  topWorkflows: string[]
}

export type OrgResult = {
  track: 'org'
  band: OrgBand
  /** The org questions ranked by weighted contribution, highest first (top 3, zero-contribution excluded). */
  topWorkflows: string[]
}

export type QuizResult = SoloResult | OrgResult

function pointsFor(question: QuizQuestion, answer: string | undefined): number {
  if (!answer || !question.options) return 0
  const option = question.options.find((o) => o.value === answer)
  return option ? option.points : 0
}

function rankedContributions(
  questions: QuizQuestion[],
  answers: Record<string, string>,
): {label: string; contribution: number}[] {
  return questions
    .filter((q) => q.weight > 0)
    .map((q) => ({
      label: q.shortLabel ?? q.label,
      contribution: q.weight * pointsFor(q, answers[q.key]),
    }))
    .sort((a, b) => b.contribution - a.contribution)
}

export function scoreSolo(answers: Record<string, string>): SoloResult {
  const ranked = rankedContributions(SOLO_QUESTIONS, answers)
  const total = ranked.reduce((sum, r) => sum + r.contribution, 0)
  return {
    track: 'solo',
    hours: Math.round(total),
    topWorkflows: ranked
      .filter((r) => r.contribution > 0)
      .slice(0, 3)
      .map((r) => r.label),
  }
}

export function scoreOrg(answers: Record<string, string>): OrgResult {
  const ranked = rankedContributions(ORG_QUESTIONS, answers)
  const total = ranked.reduce((sum, r) => sum + r.contribution, 0)
  const band = ORG_BAND_THRESHOLDS.find((t) => total >= t.min)?.band ?? 'Emerging'
  return {
    track: 'org',
    band,
    topWorkflows: ranked
      .filter((r) => r.contribution > 0)
      .slice(0, 3)
      .map((r) => r.label),
  }
}

export function scoreQuiz(track: QuizTrack, answers: Record<string, string>): QuizResult {
  return track === 'solo' ? scoreSolo(answers) : scoreOrg(answers)
}
