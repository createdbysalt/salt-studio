'use client'

import {useEffect, useRef, useState} from 'react'

import {submitQuiz, type QuizSubmissionInput} from '@/app/actions/quiz'
import {
  trackQuizComplete,
  trackQuizGate,
  trackQuizStart,
  trackQuizStep,
} from '@/lib/analytics'
import {
  OPENER_QUESTIONS,
  QUIZ_CTAS,
  WEBSITE_QUESTION,
  questionsForTrack,
  resolveTrack,
  type QuizQuestion,
} from '@/lib/quiz/config'
import {scoreQuiz, type QuizResult} from '@/lib/quiz/scoring'
import {QuizResults} from '@/components/QuizResults'
import Link from 'next/link'

const QUIZ_NAME = 'salt-score'

type Phase = 'intro' | 'questions' | 'gate' | 'results'

export function QuizFlow() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [textDraft, setTextDraft] = useState('')
  const [email, setEmail] = useState('')
  const [waitlistOptIn, setWaitlistOptIn] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [gateError, setGateError] = useState<string | null>(null)
  const [result, setResult] = useState<QuizResult | null>(null)
  const advancing = useRef(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const source = useRef<QuizSubmissionInput['source']>(undefined)

  // Capture attribution once, on mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    source.current = {
      utmSource: params.get('utm_source') ?? undefined,
      utmMedium: params.get('utm_medium') ?? undefined,
      utmCampaign: params.get('utm_campaign') ?? undefined,
      referrer: document.referrer || undefined,
      landingPath: window.location.pathname,
    }
  }, [])

  // The track is decidable once team size is answered; both tracks are 9 questions long,
  // so the counter and progress stay stable from the first screen.
  const track = resolveTrack(answers)
  const questions: QuizQuestion[] = [
    ...OPENER_QUESTIONS,
    ...questionsForTrack(track),
    WEBSITE_QUESTION,
  ]
  const current = questions[stepIndex]
  const total = questions.length
  const answeredCount = Math.min(stepIndex, total)
  const progress = phase === 'questions' ? answeredCount / total : phase === 'intro' ? 0 : 1

  // Move keyboard focus to the question when the step changes.
  useEffect(() => {
    if (phase === 'questions') headingRef.current?.focus()
  }, [phase, stepIndex])

  function begin() {
    trackQuizStart({quiz_name: QUIZ_NAME})
    setPhase('questions')
  }

  function advance(nextAnswers: Record<string, string>) {
    if (stepIndex + 1 >= total) {
      trackQuizGate({quiz_name: QUIZ_NAME, track: resolveTrack(nextAnswers)})
      setPhase('gate')
    } else {
      setStepIndex(stepIndex + 1)
    }
    setTextDraft('')
    advancing.current = false
  }

  function answerChoice(value: string) {
    if (advancing.current || !current) return
    advancing.current = true
    const nextAnswers = {...answers, [current.key]: value}
    setAnswers(nextAnswers)
    trackQuizStep({
      quiz_name: QUIZ_NAME,
      step: stepIndex + 1,
      question_key: current.key,
      track: resolveTrack(nextAnswers),
    })
    // Brief pause so the selection registers visually before the next question rises in.
    window.setTimeout(() => advance(nextAnswers), 180)
  }

  function answerText() {
    if (advancing.current || !current) return
    advancing.current = true
    const value = textDraft.trim()
    const nextAnswers = value ? {...answers, [current.key]: value} : answers
    setAnswers(nextAnswers)
    trackQuizStep({
      quiz_name: QUIZ_NAME,
      step: stepIndex + 1,
      question_key: current.key,
      track,
    })
    advance(nextAnswers)
  }

  function goBack() {
    if (phase === 'gate') {
      setPhase('questions')
      setStepIndex(total - 1)
    } else if (stepIndex > 0) {
      setStepIndex(stepIndex - 1)
      setTextDraft(answers[questions[stepIndex - 1].key] ?? '')
    }
  }

  async function submitGate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setGateError(null)
    setSubmitting(true)

    const form = new FormData(event.currentTarget)
    const finalTrack = resolveTrack(answers)
    const response = await submitQuiz({
      email,
      answers,
      waitlistOptIn,
      company: (form.get('company') as string) || undefined,
      source: source.current,
    })

    if (!response.success) {
      setGateError(response.message)
      setSubmitting(false)
      return
    }

    const computed = scoreQuiz(finalTrack, answers)
    trackQuizComplete({
      quiz_name: QUIZ_NAME,
      track: finalTrack,
      score: computed.track === 'solo' ? computed.hours : undefined,
      score_band: computed.track === 'org' ? computed.band : undefined,
      waitlist_opt_in: waitlistOptIn,
    })
    setResult(computed)
    setSubmitting(false)
    setPhase('results')
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 md:px-6">
      {/* The measure — counter + progress hairline, present on every phase.
          Top padding clears the fixed glass navbar, matching ContactPage. */}
      <div className="pb-10 pt-[calc(var(--project-nav-height)+2rem)] md:pb-14 md:pt-[calc(var(--project-nav-height-md)+2.5rem)]">
        <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-label text-foreground/40">
          <span>The Salt Score</span>
          {phase === 'questions' && (
            <span aria-live="polite">
              {String(stepIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          )}
          {phase === 'gate' && <span>Almost there</span>}
          {phase === 'results' && <span>Your result</span>}
        </div>
        <div
          className="mt-3 h-px w-full bg-foreground/15"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={phase === 'questions' ? answeredCount : phase === 'intro' ? 0 : total}
          aria-label="Quiz progress"
        >
          <div
            className="h-px bg-foreground transition-[width] duration-500 ease-out"
            style={{width: `${Math.round(progress * 100)}%`}}
          />
        </div>
      </div>

      {phase === 'intro' && (
        <div className="animate-quiz-rise pb-24">
          <h1 className="text-[clamp(2.125rem,7vw,4rem)] font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-foreground">
            How much of your business could run itself?
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-foreground/70">
            Nine questions, about two minutes. You&rsquo;ll get a straight answer: how many hours a
            week you could hand off, and where to start.
          </p>
          <button type="button" onClick={begin} className="btn-solid mt-10 min-h-12">
            Get your Salt Score
          </button>
        </div>
      )}

      {phase === 'questions' && current && (
        <div key={current.key} className="animate-quiz-rise pb-24">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="max-w-xl text-[clamp(1.5rem,4vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground outline-none"
          >
            {current.label}
          </h2>
          {current.hint && (
            <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-foreground/40">
              {current.hint}
            </p>
          )}

          {current.kind === 'choice' && current.options && (
            <div className="mt-8 flex flex-col gap-2">
              {current.options.map((option) => {
                const selected = answers[current.key] === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => answerChoice(option.value)}
                    aria-pressed={selected}
                    className={`min-h-12 rounded-lg border px-4 py-3 text-left text-base transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      selected
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-foreground/15 text-foreground hover:bg-foreground/6'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          )}

          {current.kind === 'text' && (
            <form
              className="mt-8"
              onSubmit={(e) => {
                e.preventDefault()
                answerText()
              }}
            >
              <textarea
                value={textDraft}
                onChange={(e) => setTextDraft(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Chasing invoices… rewriting the same email… say it like it is."
                className="w-full rounded-lg border border-foreground/15 bg-surface px-4 py-3 text-base text-foreground placeholder:text-foreground/40 focus:border-foreground/40 focus:outline-none"
              />
              <div className="mt-4 flex items-center gap-4">
                <button type="submit" className="btn-solid min-h-12">
                  Continue
                </button>
                <button
                  type="button"
                  onClick={answerText}
                  className="font-mono text-[11px] uppercase tracking-label text-foreground/40 transition-colors hover:text-foreground"
                >
                  Skip
                </button>
              </div>
            </form>
          )}

          {stepIndex > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="mt-10 font-mono text-[11px] uppercase tracking-label text-foreground/40 transition-colors hover:text-foreground"
            >
              ← Back
            </button>
          )}
        </div>
      )}

      {phase === 'gate' && (
        <div className="animate-quiz-rise pb-24">
          <h2 className="max-w-xl text-[clamp(1.5rem,4vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground">
            Your Salt Score is ready.
          </h2>
          <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-foreground/70">
            Where should we send the breakdown?
          </p>
          <form onSubmit={submitGate} className="mt-8 max-w-md">
            {/* Honeypot — humans never see this field */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            <label htmlFor="quiz-email" className="sr-only">
              Email address
            </label>
            <input
              id="quiz-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
              className="w-full rounded-lg border border-foreground/15 bg-surface px-4 py-3 text-base text-foreground placeholder:text-foreground/40 focus:border-foreground/40 focus:outline-none"
            />
            <label className="mt-4 flex cursor-pointer items-start gap-3 text-[0.9375rem] leading-relaxed text-foreground/70">
              <input
                type="checkbox"
                checked={waitlistOptIn}
                onChange={(e) => setWaitlistOptIn(e.target.checked)}
                className="mt-1 h-4 w-4 accent-accent"
              />
              <span>
                Keep me posted on Salt — the tool we&rsquo;re building that does this work for you.
              </span>
            </label>
            {gateError && (
              <p className="mt-4 text-sm leading-relaxed text-error" role="alert">
                {gateError}
              </p>
            )}
            <button type="submit" disabled={submitting} className="btn-solid mt-6 min-h-12 disabled:opacity-50">
              {submitting ? 'One second…' : 'Show my score'}
            </button>
            <p className="mt-5 text-xs leading-relaxed text-foreground/40">
              Your score shows instantly. The full breakdown comes from us personally — no drip
              campaigns, and your email never leaves the studio.{' '}
              <Link href={QUIZ_CTAS.privacy} className="underline underline-offset-2 hover:text-foreground">
                Privacy policy
              </Link>
            </p>
          </form>
          <button
            type="button"
            onClick={goBack}
            className="mt-10 font-mono text-[11px] uppercase tracking-label text-foreground/40 transition-colors hover:text-foreground"
          >
            ← Back
          </button>
        </div>
      )}

      {phase === 'results' && result && (
        <QuizResults
          result={result}
          websiteFlag={answers.websiteFlag}
          waitlistOptIn={waitlistOptIn}
        />
      )}
    </div>
  )
}
