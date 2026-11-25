import {
  GrowthDiagnosticButton,
  GrowthPaymentConfirming,
  GrowthPrintButton,
  GrowthPurchaseBeacon,
  GrowthReportPending,
} from '@/components/GrowthReportClient'
import {
  GROWTH_DIAGNOSTIC_DEADLINE_LABEL,
  GROWTH_QUIZ_SLUG,
  GROWTH_STAGES,
} from '@/lib/growth/config'
import {metaEventId} from '@/lib/growth/metaCapi'
import {diagnosticOfferState} from '@/lib/growth/payments'
import type {GrowthStageRead} from '@/lib/growth/scoring'
import {findGrowthReportByToken, type GrowthReportRow} from '@/lib/growth/store'
import {addDays} from 'date-fns'
import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'

/**
 * A buyer's private Business Growth Analysis. The link is the key: the token
 * is long and random, the page is never indexed, and nothing here is cached.
 * Server actions called from this page (writing the report) may run for a
 * couple of minutes.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export const metadata: Metadata = {
  title: 'Your Business Growth Analysis',
  robots: {index: false, follow: false},
}

type Props = {
  params: Promise<{token: string}>
  searchParams: Promise<{paid?: string; diagnostic?: string}>
}

const LABEL = 'font-mono text-[11px] uppercase tracking-label text-foreground/40'
const SHELL =
  'mx-auto w-full max-w-2xl px-5 pb-24 pt-[calc(var(--project-nav-height)+2rem)] md:px-6 md:pt-[calc(var(--project-nav-height-md)+2.5rem)]'
const READ_LABEL: Record<GrowthStageRead, string> = {
  strong: 'Strong',
  watch: 'Watch',
  open: 'Open',
}
const PRINT_CSS = `@media print { header, nav, footer, .no-print { display: none !important; } main { padding-top: 0 !important; } body { background: #fff !important; } }`

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <section className="mt-12 break-inside-avoid">
      <h2 className={LABEL}>{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Notes({items}: {items: string[]}) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-baseline gap-3 text-base leading-relaxed text-foreground"
        >
          <span
            className="inline-block h-1.5 w-1.5 shrink-0 translate-y-[-2px] rounded-full bg-accent"
            aria-hidden="true"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** Dates as a Portland reader expects them, whatever timezone the server runs in. */
function pacificDate(date: Date, style: 'long' | 'short') {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
    ...(style === 'long' ? {year: 'numeric'} : {}),
  }).format(date)
}

function hostname(url: string | null) {
  if (!url) return ''
  try {
    return ` (${new URL(url).hostname})`
  } catch {
    return ''
  }
}

function DiagnosticOffer({row}: {row: GrowthReportRow}) {
  const state = diagnosticOfferState(row)
  const bookingUrl = process.env.NEXT_PUBLIC_GROWTH_DIAGNOSTIC_BOOKING_URL

  if (state === 'purchased') {
    return (
      <section id="offer" className="no-print mt-16 border-t border-foreground/15 pt-10">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
          You&rsquo;re in for the Revenue Diagnostic
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/70">
          Thank you. Your receipt is in your inbox.{' '}
          {bookingUrl
            ? 'Pick a time for your kickoff and we will take it from there.'
            : 'We will email you within one business day to set up your kickoff.'}
        </p>
        {bookingUrl && (
          <a href={bookingUrl} className="btn-solid mt-6 inline-flex min-h-12">
            Book my kickoff
          </a>
        )}
      </section>
    )
  }
  if (state !== 'available') return null

  return (
    <section id="offer" className="no-print mt-16 border-t border-foreground/15 pt-10">
      <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
        If you&rsquo;d like help with this
      </h2>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/70">
        This plan is yours to run on your own. If you&rsquo;d rather have us dig into your real
        numbers, our one-week Revenue Diagnostic is normally $1,500. Because you picked up this
        report during Black Friday, it&rsquo;s $1,000 for you through{' '}
        {GROWTH_DIAGNOSTIC_DEADLINE_LABEL}. If we look at your numbers and it turns out we&rsquo;re
        not the right fit, you get every dollar back.
      </p>
      <GrowthDiagnosticButton token={row.token} label="Start my Diagnostic for $1,000" />
    </section>
  )
}

export default async function GrowthReportRoute({params, searchParams}: Props) {
  const {token} = await params
  const query = await searchParams
  const row = await findGrowthReportByToken(token.slice(0, 120))
  if (!row) notFound()

  // Stripe often sends the buyer back a moment before its webhook lands.
  if (row.status === 'open' && query.paid === '1') {
    return (
      <main className="min-h-svh bg-background">
        <div className={SHELL}>
          <GrowthPaymentConfirming />
        </div>
      </main>
    )
  }

  if (row.status === 'open') {
    return (
      <main className="min-h-svh bg-background">
        <div className={SHELL}>
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1] tracking-[-0.02em] text-foreground">
            This report hasn&rsquo;t been paid for yet
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/70">
            If you just paid, give it a few seconds and refresh. Otherwise you can retake the quiz
            and pick up your report from the results page.
          </p>
          <Link href={`/quiz/${GROWTH_QUIZ_SLUG}`} className="btn-solid mt-8 inline-flex min-h-12">
            Back to the quiz
          </Link>
        </div>
      </main>
    )
  }

  const paidBeacon = query.paid === '1' && (
    <GrowthPurchaseBeacon
      event="growth_report_purchase"
      eventId={metaEventId(row.id, 'report-purchase')}
      value={row.amount_cents / 100}
    />
  )

  const report = row.status === 'ready' ? row.report : null
  if (!report) {
    return (
      <main className="min-h-svh bg-background">
        <div className={SHELL}>
          {paidBeacon}
          <GrowthReportPending token={row.token} failed={row.status === 'failed'} />
        </div>
      </main>
    )
  }

  const startDate = new Date(row.paid_at ?? row.created_at)
  const stageLabel = Object.fromEntries(GROWTH_STAGES.map((s) => [s.id, s.label]))
  const stageScore = Object.fromEntries(row.scores.stages.map((s) => [s.id, s.score]))

  return (
    <main className="min-h-svh bg-background">
      <style>{PRINT_CSS}</style>
      {paidBeacon}
      {query.diagnostic === '1' && row.diagnostic_status === 'paid' && (
        <GrowthPurchaseBeacon
          event="growth_diagnostic_purchase"
          eventId={metaEventId(row.id, 'diagnostic-purchase')}
          value={1000}
        />
      )}
      <article className={SHELL}>
        <div className="flex items-baseline justify-between">
          <p className={`flex items-center gap-2 ${LABEL}`}>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            Business Growth Analysis
          </p>
          <GrowthPrintButton />
        </div>

        <h1 className="mt-4 text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1] tracking-[-0.02em] text-foreground">
          {row.business_name || 'Your practice'}
        </h1>
        <p className={`mt-4 ${LABEL}`}>
          {pacificDate(startDate, 'long')} · Score {row.scores.score} of 100
          {row.scores.band ? ` · ${row.scores.band}` : ''}
        </p>

        <Section title="The leak">
          <p className="text-xl leading-snug text-foreground md:text-2xl">{report.leak_sentence}</p>
        </Section>

        <Section title="Where you stand">
          <ul>
            {report.stages.map((stage) => (
              <li
                key={stage.id}
                className="break-inside-avoid border-b border-foreground/15 py-5 first:border-t"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {stageLabel[stage.id] ?? stage.id}
                  </h3>
                  <span className={LABEL}>
                    {READ_LABEL[stage.read]}
                    {stageScore[stage.id] !== undefined ? ` · ${stageScore[stage.id]}` : ''}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                  You told us: {stage.told_us}
                </p>
                <p className="mt-2 text-base leading-relaxed text-foreground">{stage.note}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="What holds it in place">
          <dl className="space-y-4">
            {(
              [
                ['A person who owns it', report.holds_in_place.person],
                ['Steps written down', report.holds_in_place.written_process],
                ['A tool in use', report.holds_in_place.tool],
              ] as const
            ).map(([term, detail]) => (
              <div key={term}>
                <dt className="text-sm text-foreground/60">{term}</dt>
                <dd className="mt-1 text-base leading-relaxed text-foreground">{detail}</dd>
              </div>
            ))}
          </dl>
        </Section>

        {report.website_notes.length > 0 && (
          <Section title={`Your website${hostname(row.website_url)}`}>
            <Notes items={report.website_notes} />
            <p className="mt-4 text-sm leading-relaxed text-foreground/60">
              Measured on the mobile version of your homepage on the day of this report.
            </p>
          </Section>
        )}

        {report.listing_notes.length > 0 && (
          <Section title="Your Google listing">
            <Notes items={report.listing_notes} />
            <p className="mt-4 text-sm leading-relaxed text-foreground/60">
              Based on what you told us. We did not look at your listing.
            </p>
          </Section>
        )}

        <Section title="Your 30-day plan">
          <ol>
            {report.plan.map((item, index) => (
              <li
                key={`${index}-${item.title}`}
                className="break-inside-avoid border-b border-foreground/15 py-5 first:border-t"
              >
                <div className="flex items-baseline gap-4">
                  <span className={LABEL}>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-base leading-relaxed text-foreground/70">{item.why}</p>
                    <p className={`mt-3 ${LABEL}`}>
                      {item.owner} · By {pacificDate(addDays(startDate, item.due_day), 'short')}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <p className="mt-10 max-w-xl text-base leading-relaxed text-foreground/70">
          {report.closing_note}
        </p>

        <p className={`mt-12 ${LABEL}`}>Prepared by Salt Studio · createdbysalt.com</p>

        <DiagnosticOffer row={row} />
      </article>
    </main>
  )
}
