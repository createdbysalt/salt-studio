'use client'

import {trackCTAClick} from '@/lib/analytics'
import {QUIZ_CTAS} from '@/lib/quiz/config'
import type {QuizResult} from '@/lib/quiz/scoring'
import Link from 'next/link'

type QuizResultsProps = {
  result: QuizResult
  websiteFlag?: string
  waitlistOptIn: boolean
}

export function QuizResults({result, websiteFlag, waitlistOptIn}: QuizResultsProps) {
  const isOrg = result.track === 'org'
  const showWebsiteCta = websiteFlag === 'yes' || websiteFlag === 'sort-of'
  const lowSolo = result.track === 'solo' && result.hours < 2

  const primaryHref = isOrg ? QUIZ_CTAS.orgIntroCall : QUIZ_CTAS.auditCall
  const primaryLabel = isOrg ? 'Book an intro call' : 'Book your automation audit'

  return (
    <div className="animate-quiz-rise pb-24">
      {/* The score */}
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-label text-foreground/40">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
        Your Salt Score
      </p>

      {result.track === 'solo' ? (
        <h2 className="mt-4 text-[clamp(2.5rem,8vw,5.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.03em] text-foreground">
          {lowSolo ? 'Running tight' : `~${result.hours} hours a week`}
        </h2>
      ) : (
        <h2 className="mt-4 text-[clamp(2.5rem,8vw,5.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.03em] text-foreground">
          {result.band}
        </h2>
      )}
      <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/70">
        {result.track === 'solo'
          ? lowSolo
            ? 'Less than two hours a week of automatable admin — you run tighter than most. The audit below is probably overkill for you today, and we’ll say so if it is.'
            : 'That’s time currently going to work a system could do — every week, whether things are quiet or slammed.'
          : 'automation potential across your organization, based on how information and questions move through it today.'}
      </p>

      {/* Where it's leaking */}
      {result.topWorkflows.length > 0 && (
        <div className="mt-10">
          <p className="font-mono text-[11px] uppercase tracking-label text-foreground/40">
            Where it&rsquo;s leaking
          </p>
          <ul className="mt-3 max-w-md">
            {result.topWorkflows.map((label, i) => (
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

      {/* Primary CTA */}
      <div className="mt-12 max-w-md">
        <p className="text-base leading-relaxed text-foreground/70">
          {isOrg
            ? 'Organizations your size usually start with a bounded pilot: one workflow, fixed scope, real results before any bigger commitment. The first step is a short call.'
            : 'The fastest way to get those hours back: a one-day automation audit. We map your workflows, score what’s automatable, and hand you a prioritized plan — whether or not you build it with us.'}
        </p>
        <a
          href={primaryHref}
          onClick={() =>
            trackCTAClick({
              cta_text: primaryLabel,
              cta_location: 'quiz-results',
              cta_type: 'primary',
              cta_destination: primaryHref,
            })
          }
          className="btn-solid mt-6 inline-flex min-h-12"
        >
          {primaryLabel}
        </a>
      </div>

      {/* Website secondary CTA */}
      {showWebsiteCta && (
        <div className="mt-12 max-w-md border-t border-foreground/15 pt-8">
          <p className="text-base leading-relaxed text-foreground/70">
            You said your website is part of the problem. We build those too — brand, copy, design,
            build, delivered in weeks.
          </p>
          <Link
            href={QUIZ_CTAS.website}
            onClick={() =>
              trackCTAClick({
                cta_text: 'See the Salt site',
                cta_location: 'quiz-results',
                cta_type: 'secondary',
                cta_destination: QUIZ_CTAS.website,
              })
            }
            className="btn-ghost mt-5 inline-flex"
          >
            See the Salt site
          </Link>
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
