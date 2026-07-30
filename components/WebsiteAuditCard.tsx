'use client'

import {runWebsiteAudit} from '@/app/actions/audit'
import type {WebsiteAudit} from '@/lib/audit/website'
import {useEffect, useState} from 'react'

type WebsiteAuditCardProps = {
  url: string
}

const CHECK_LABELS: {key: keyof WebsiteAudit['checks']; label: string}[] = [
  {key: 'https', label: 'Secure connection (https)'},
  {key: 'title', label: 'Page title for search results'},
  {key: 'metaDescription', label: 'Meta description for search results'},
  {key: 'openGraph', label: 'Social sharing preview (Open Graph)'},
  {key: 'mobileViewport', label: 'Mobile-ready viewport'},
]

function scoreTone(score: number | null): string {
  if (score == null) return 'text-foreground/40'
  if (score >= 90) return 'text-foreground'
  if (score >= 50) return 'text-foreground'
  return 'text-error'
}

/**
 * Live audit of the visitor's own site, shown on the quiz results screen when
 * the quiz asked for their URL. PageSpeed takes a while, so this renders a
 * patient loading state and fills in whatever the audit could measure.
 */
export function WebsiteAuditCard({url}: WebsiteAuditCardProps) {
  const [audit, setAudit] = useState<WebsiteAudit | null>(null)
  const [state, setState] = useState<'loading' | 'done' | 'failed'>('loading')

  useEffect(() => {
    let cancelled = false
    runWebsiteAudit(url).then((result) => {
      if (cancelled) return
      if (result && !result.failed) {
        setAudit(result)
        setState('done')
      } else {
        setState('failed')
      }
    })
    return () => {
      cancelled = true
    }
  }, [url])

  const hostname = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '')

  return (
    <div className="mt-12 max-w-md border-t border-foreground/15 pt-8">
      <p className="font-mono text-[11px] uppercase tracking-label text-foreground/40">
        Live audit — {hostname}
      </p>

      {state === 'loading' && (
        <p className="mt-4 text-base leading-relaxed text-foreground/70" aria-live="polite">
          Running a live check of your site — page speed, search visibility, mobile readiness. This
          takes about half a minute; your result above isn&rsquo;t going anywhere.
        </p>
      )}

      {state === 'failed' && (
        <p className="mt-4 text-base leading-relaxed text-foreground/70">
          We couldn&rsquo;t reach your site for a live check just now. We&rsquo;ll run the audit by
          hand and include it in your breakdown.
        </p>
      )}

      {state === 'done' && audit && (
        <>
          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-foreground/15 bg-foreground/15">
            {(
              [
                {label: 'Performance', value: audit.scores.performance},
                {label: 'SEO', value: audit.scores.seo},
                {label: 'Accessibility', value: audit.scores.accessibility},
                {label: 'Best practices', value: audit.scores.bestPractices},
              ] as const
            ).map(({label, value}) => (
              <div key={label} className="bg-background px-4 py-3">
                <dt className="font-mono text-[11px] uppercase tracking-label text-foreground/40">
                  {label}
                </dt>
                <dd
                  className={`mt-1 text-2xl font-semibold tracking-[-0.02em] ${scoreTone(value)}`}
                >
                  {value == null ? '—' : `${value}/100`}
                </dd>
              </div>
            ))}
          </dl>

          {audit.lcpSeconds != null && (
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-foreground/70">
              Your page takes about <span className="text-foreground">{audit.lcpSeconds}s</span> to
              show its main content on a phone
              {audit.lcpSeconds > 2.5
                ? ' — visitors start leaving after 2.5 seconds.'
                : ' — that’s within the range visitors tolerate.'}
            </p>
          )}

          <ul className="mt-5">
            {CHECK_LABELS.map(({key, label}) => {
              const value = audit.checks[key]
              if (value == null) return null
              return (
                <li
                  key={key}
                  className="flex items-baseline justify-between gap-4 border-b border-foreground/15 py-2.5 text-[0.9375rem] text-foreground first:border-t"
                >
                  <span>{label}</span>
                  <span
                    className={`font-mono text-[11px] uppercase tracking-label ${value ? 'text-foreground/40' : 'text-error'}`}
                  >
                    {value ? 'OK' : 'Missing'}
                  </span>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
