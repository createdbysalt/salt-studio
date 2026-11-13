'use client'

import {startGrowthReportCheckout} from '@/app/actions/growth'
import {hasConsentFor, trackCustomEvent} from '@/lib/analytics'
import {GROWTH_REPORT_PREVIEW, GROWTH_STAGES} from '@/lib/growth/config'
import {scoreGrowthQuiz} from '@/lib/growth/scoring'
import type {GrowthSource} from '@/lib/growth/store'
import {interpolateScore, type DynamicQuiz} from '@/lib/quiz/dynamic'
import {useState} from 'react'

type GrowthQuizResultsProps = {
  quiz: DynamicQuiz
  answers: Record<string, string>
  email: string
  source?: GrowthSource
}

const LABEL = 'font-mono text-[11px] uppercase tracking-label text-foreground/40'

/**
 * Free result for the Business Growth Analysis quiz: the score, five bars,
 * the one leak, and a single button to the $25 report. The Diagnostic offer
 * is deliberately not here. It belongs to people who bought the report.
 */
export function GrowthQuizResults({quiz, answers, email, source}: GrowthQuizResultsProps) {
  const result = scoreGrowthQuiz(quiz, answers)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const leak = GROWTH_STAGES.find((s) => s.id === result.weakest?.id)?.leak

  async function buy() {
    if (pending) return
    setPending(true)
    setError(null)
    const response = await startGrowthReportCheckout({
      email,
      answers,
      source,
      marketingConsent: hasConsentFor('marketing'),
    })
    if (!response.ok) {
      setError(response.message)
      setPending(false)
      return
    }
    trackCustomEvent('growth_report_checkout_start', {
      event_id: response.eventId,
      value: 25,
      currency: 'USD',
      score: result.score,
    })
    window.location.assign(response.url)
  }

  return (
    <div className="animate-quiz-rise pb-24">
      <p className={`flex items-center gap-2 ${LABEL}`}>
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
        Your result
      </p>

      <h2 className="mt-4 text-[clamp(2.5rem,8vw,5.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.03em] text-foreground">
        {interpolateScore(result.band?.resultHeadline, result.score) || `${result.score} of 100`}
      </h2>
      <p className={`mt-4 ${LABEL}`}>
        {result.score} of 100{result.band?.label ? ` · ${result.band.label}` : ''}
      </p>
      {result.band?.resultBody && (
        <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/70">
          {interpolateScore(result.band.resultBody, result.score)}
        </p>
      )}

      <div className="mt-10 max-w-md">
        <p className={LABEL}>Where you stand</p>
        <ul className="mt-3 space-y-4">
          {result.stages.map((stage) => {
            const weakest = stage.id === result.weakest?.id
            return (
              <li key={stage.id}>
                <div className="flex items-baseline justify-between text-base text-foreground">
                  <span>
                    {stage.label}
                    {weakest && <span className={`ml-3 ${LABEL}`}>Fix this first</span>}
                  </span>
                  <span className="font-mono text-sm text-foreground/70">{stage.score}</span>
                </div>
                <div
                  className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10"
                  role="img"
                  aria-label={`${stage.label}: ${stage.score} of 100`}
                >
                  <div
                    className={`h-full rounded-full ${weakest ? 'bg-accent' : 'bg-foreground/60'}`}
                    style={{width: `${Math.max(4, stage.score)}%`}}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {result.weakest && leak && (
        <div className="mt-10 max-w-md">
          <p className={LABEL}>Your number one leak: {result.weakest.label}</p>
          <p className="mt-3 text-base leading-relaxed text-foreground">{leak}</p>
        </div>
      )}

      <div className="mt-12 max-w-md border-t border-foreground/15 pt-8">
        <p className={LABEL}>The full report</p>
        <p className="mt-3 text-base leading-relaxed text-foreground/70">
          Want it written out for your practice? The Business Growth Analysis takes your answers and
          turns them into a plan you can hand to your front desk on Monday.
        </p>
        <ul className="mt-4 space-y-2">
          {GROWTH_REPORT_PREVIEW.map((line) => (
            <li key={line} className="flex items-baseline gap-3 text-base text-foreground">
              <span
                className="inline-block h-1.5 w-1.5 shrink-0 translate-y-[-2px] rounded-full bg-accent"
                aria-hidden="true"
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={buy}
          disabled={pending}
          className="btn-solid mt-8 inline-flex min-h-12 disabled:opacity-60"
        >
          {pending ? 'Opening checkout…' : 'Get my full report for $25'}
        </button>
        {error && (
          <p role="alert" className="mt-4 text-sm text-foreground">
            {error}
          </p>
        )}
        <p className={`mt-4 ${LABEL}`}>One payment · Ready in about two minutes · Yours to keep</p>
      </div>
    </div>
  )
}
