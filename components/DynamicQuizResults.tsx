'use client'

import {WebsiteAuditCard} from '@/components/WebsiteAuditCard'
import {trackCTAClick} from '@/lib/analytics'
import {
  interpolateScore,
  websiteUrlAnswer,
  type DynamicQuiz,
  type DynamicQuizResult,
} from '@/lib/quiz/dynamic'
import {stegaClean} from 'next-sanity'
import Link from 'next/link'

type DynamicQuizResultsProps = {
  quiz: DynamicQuiz
  result: DynamicQuizResult
  answers: Record<string, string>
  waitlistOptIn: boolean
}

function CtaLink({
  href,
  label,
  type,
  location,
  className,
}: {
  href: string
  label: string
  type: 'primary' | 'secondary'
  location: string
  className: string
}) {
  const cleanHref = stegaClean(href)
  const track = () =>
    trackCTAClick({
      cta_text: label,
      cta_location: location,
      cta_type: type,
      cta_destination: cleanHref,
    })
  return cleanHref.startsWith('/') ? (
    <Link href={cleanHref} onClick={track} className={className}>
      {label}
    </Link>
  ) : (
    <a href={cleanHref} onClick={track} className={className}>
      {label}
    </a>
  )
}

/**
 * Band-driven results screen for service quizzes. Everything visible here —
 * headline, body, benefits, CTAs — comes from the matched band on the quiz
 * document, so the conversion copy is tuned in the Studio, not in code.
 */
export function DynamicQuizResults({
  quiz,
  result,
  answers,
  waitlistOptIn,
}: DynamicQuizResultsProps) {
  const band = result.band
  const ctaLocation = `quiz-${stegaClean(quiz.slug ?? 'results')}`
  const auditUrl = websiteUrlAnswer(quiz, answers)

  return (
    <div className="animate-quiz-rise pb-24">
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-label text-foreground/40">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
        Your result
      </p>

      <h2 className="mt-4 text-[clamp(2.5rem,8vw,5.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.03em] text-foreground">
        {interpolateScore(band?.resultHeadline, result.score) || band?.label || 'Your result'}
      </h2>

      {band?.resultBody && (
        <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/70">
          {interpolateScore(band.resultBody, result.score)}
        </p>
      )}

      {/* Where it's leaking */}
      {result.topAreas.length > 0 && (
        <div className="mt-10">
          <p className="font-mono text-[11px] uppercase tracking-label text-foreground/40">
            Where it&rsquo;s leaking
          </p>
          <ul className="mt-3 max-w-md">
            {result.topAreas.map((label, i) => (
              <li
                key={label}
                className="flex items-baseline gap-4 border-b border-foreground/15 py-3 text-base text-foreground first:border-t"
              >
                <span className="font-mono text-[11px] tracking-label text-foreground/40">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="capitalize">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* What this level unlocks */}
      {(band?.benefits?.length ?? 0) > 0 && (
        <div className="mt-10">
          <p className="font-mono text-[11px] uppercase tracking-label text-foreground/40">
            What that gets you
          </p>
          <ul className="mt-3 max-w-md space-y-2">
            {band!.benefits!.map((benefit) => (
              <li key={benefit} className="flex items-baseline gap-3 text-base text-foreground">
                <span
                  className="inline-block h-1.5 w-1.5 shrink-0 translate-y-[-2px] rounded-full bg-accent"
                  aria-hidden="true"
                />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Live website audit (Websites quiz) */}
      {auditUrl && <WebsiteAuditCard url={auditUrl} />}

      {/* Primary CTA */}
      {band?.primaryCtaLabel && band?.primaryCtaHref && (
        <div className="mt-12 max-w-md">
          {band.ctaLead && (
            <p className="text-base leading-relaxed text-foreground/70">
              {interpolateScore(band.ctaLead, result.score)}
            </p>
          )}
          <CtaLink
            href={band.primaryCtaHref}
            label={band.primaryCtaLabel}
            type="primary"
            location={ctaLocation}
            className="btn-solid mt-6 inline-flex min-h-12"
          />
          {band.secondaryCtaLabel && band.secondaryCtaHref && (
            <div>
              <CtaLink
                href={band.secondaryCtaHref}
                label={band.secondaryCtaLabel}
                type="secondary"
                location={ctaLocation}
                className="btn-ghost mt-5 inline-flex"
              />
            </div>
          )}
        </div>
      )}

      {/* Follow-up + waitlist confirmation */}
      <div className="mt-12 space-y-2">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-label text-foreground/40">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
          Full breakdown on its way — written personally, not generated
        </p>
        {waitlistOptIn && (
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-label text-foreground/40">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            You&rsquo;re on the Salt list
          </p>
        )}
      </div>
    </div>
  )
}
