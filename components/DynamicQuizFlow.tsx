'use client'

import {submitDynamicQuiz, type DynamicQuizSubmissionInput} from '@/app/actions/dynamicQuiz'
import {DynamicQuizResults} from '@/components/DynamicQuizResults'
import {trackQuizComplete, trackQuizGate, trackQuizStart, trackQuizStep} from '@/lib/analytics'
import {
  questionAnswerKey,
  scoreDynamicQuiz,
  type DynamicQuiz,
  type DynamicQuizResult,
} from '@/lib/quiz/dynamic'
import {stegaClean} from 'next-sanity'
import Link from 'next/link'
import {useEffect, useRef, useState} from 'react'

type Phase = 'intro' | 'questions' | 'gate' | 'results'

type DynamicQuizFlowProps = {
  quiz: DynamicQuiz
}

/**
 * Sanity-driven counterpart of QuizFlow (the hardcoded Salt Score). One quiz
 * document in, a four-phase funnel out: intro → questions → email gate →
 * band-routed results. The client scores for instant display; the server
 * action re-scores from the published document before storing.
 */
export function DynamicQuizFlow({quiz}: DynamicQuizFlowProps) {
  const quizName = stegaClean(quiz.slug ?? 'quiz')
  const questions = quiz.questions ?? []

  const [phase, setPhase] = useState<Phase>('intro')
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [textDraft, setTextDraft] = useState('')
  const [email, setEmail] = useState('')
  const [waitlistOptIn, setWaitlistOptIn] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [gateError, setGateError] = useState<string | null>(null)
  const [result, setResult] = useState<DynamicQuizResult | null>(null)
  const advancing = useRef(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const source = useRef<DynamicQuizSubmissionInput['source']>(undefined)

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

  const current = questions[stepIndex]
  const currentKind = current ? stegaClean(current.kind) : null
  const total = questions.length
  const answeredCount = Math.min(stepIndex, total)
  const progress = phase === 'questions' ? answeredCount / total : phase === 'intro' ? 0 : 1

  // Move keyboard focus to the question when the step changes.
  useEffect(() => {
    if (phase === 'questions') headingRef.current?.focus()
  }, [phase, stepIndex])

  function begin() {
    trackQuizStart({quiz_name: quizName})
    setPhase('questions')
  }

  function advance() {
    if (stepIndex + 1 >= total) {
      trackQuizGate({quiz_name: quizName, track: 'service'})
      setPhase('gate')
    } else {
      setStepIndex(stepIndex + 1)
    }
    setTextDraft('')
    advancing.current = false
  }

  function answerChoice(optionKey: string) {
    if (advancing.current || !current) return
    advancing.current = true
    setAnswers({...answers, [questionAnswerKey(current)]: optionKey})
    trackQuizStep({
      quiz_name: quizName,
      step: stepIndex + 1,
      question_key: questionAnswerKey(current),
    })
    // Brief pause so the selection registers visually before the next question rises in.
    window.setTimeout(advance, 180)
  }

  function answerText() {
    if (advancing.current || !current) return
    advancing.current = true
    const value = textDraft.trim()
    if (value) setAnswers({...answers, [questionAnswerKey(current)]: value})
    trackQuizStep({
      quiz_name: quizName,
      step: stepIndex + 1,
      question_key: questionAnswerKey(current),
    })
    advance()
  }

  function goBack() {
    if (phase === 'gate') {
      setPhase('questions')
      setStepIndex(total - 1)
    } else if (stepIndex > 0) {
      const previous = questions[stepIndex - 1]
      setStepIndex(stepIndex - 1)
      setTextDraft(answers[questionAnswerKey(previous)] ?? '')
    }
  }

  async function submitGate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setGateError(null)
    setSubmitting(true)

    const form = new FormData(event.currentTarget)
    const response = await submitDynamicQuiz({
      quizSlug: quizName,
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

    const computed = scoreDynamicQuiz(quiz, answers)
    trackQuizComplete({
      quiz_name: quizName,
      track: 'service',
      score: computed.score,
      score_band: computed.band?.label ? stegaClean(computed.band.label) : undefined,
      waitlist_opt_in: waitlistOptIn,
    })
    setResult(computed)
    setSubmitting(false)
    setPhase('results')
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 md:px-6">
      {/* The measure — counter + progress hairline, present on every phase. */}
      <div className="pb-10 pt-[calc(var(--project-nav-height)+2rem)] md:pb-14 md:pt-[calc(var(--project-nav-height-md)+2.5rem)]">
        <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-label text-foreground/40">
          <span>{quiz.title}</span>
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
            {quiz.introHeadline}
          </h1>
          {quiz.introBody && (
            <p className="mt-6 max-w-md text-base leading-relaxed text-foreground/70">
              {quiz.introBody}
            </p>
          )}
          <button type="button" onClick={begin} className="btn-solid mt-10 min-h-12">
            {quiz.startLabel || 'Start'}
          </button>
        </div>
      )}

      {phase === 'questions' && current && (
        <div key={current._key} className="animate-quiz-rise pb-24">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="max-w-xl text-[clamp(1.5rem,4vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground outline-none"
          >
            {current.prompt}
          </h2>
          {current.hint && (
            <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-foreground/40">
              {current.hint}
            </p>
          )}

          {currentKind === 'choice' && current.options && (
            <div className="mt-8 flex flex-col gap-2">
              {current.options.map((option) => {
                const selected = answers[questionAnswerKey(current)] === option._key
                return (
                  <button
                    key={option._key}
                    type="button"
                    onClick={() => answerChoice(option._key)}
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

          {currentKind === 'text' && (
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
                placeholder={current.hint ?? undefined}
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

          {currentKind === 'url' && (
            <form
              className="mt-8"
              onSubmit={(e) => {
                e.preventDefault()
                answerText()
              }}
            >
              <input
                type="text"
                inputMode="url"
                autoComplete="url"
                value={textDraft}
                onChange={(e) => setTextDraft(e.target.value)}
                maxLength={500}
                placeholder="yourbusiness.com"
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
            {quiz.gateHeadline || 'Your result is ready.'}
          </h2>
          <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-foreground/70">
            {quiz.gateBody || 'Where should we send the breakdown?'}
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
                {quiz.waitlistLabel ||
                  'Keep me posted on Salt — the tool we’re building that does this work for you.'}
              </span>
            </label>
            {gateError && (
              <p className="mt-4 text-sm leading-relaxed text-error" role="alert">
                {gateError}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn-solid mt-6 min-h-12 disabled:opacity-50"
            >
              {submitting ? 'One second…' : quiz.gateButtonLabel || 'Show my result'}
            </button>
            <p className="mt-5 text-xs leading-relaxed text-foreground/40">
              Your result shows instantly. The full breakdown comes from us personally — no drip
              campaigns, and your email never leaves the studio.{' '}
              <Link
                href="/legal/privacy-policy"
                className="underline underline-offset-2 hover:text-foreground"
              >
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
        <DynamicQuizResults
          quiz={quiz}
          result={result}
          answers={answers}
          waitlistOptIn={waitlistOptIn}
        />
      )}
    </div>
  )
}
