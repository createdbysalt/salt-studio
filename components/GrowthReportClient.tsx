'use client'

import {ensureGrowthReport, startDiagnosticCheckout} from '@/app/actions/growth'
import {trackCustomEvent} from '@/lib/analytics'
import {useRouter} from 'next/navigation'
import {useEffect, useRef, useState} from 'react'

/**
 * The browser-side pieces of the report page: the waiting screen that keeps
 * checking for the finished report, the one-time purchase events, the print
 * button, and the Diagnostic checkout button.
 */

const LABEL = 'font-mono text-[11px] uppercase tracking-label text-foreground/40'

/** Shown right after Stripe sends the buyer back, until the payment is confirmed. */
export function GrowthPaymentConfirming() {
  const router = useRouter()
  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), 3000)
    return () => window.clearInterval(timer)
  }, [router])

  return (
    <div className="animate-quiz-rise">
      <p className={`flex items-center gap-2 ${LABEL}`}>
        <span
          className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent"
          aria-hidden="true"
        />
        One moment
      </p>
      <h1 className="mt-4 text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1] tracking-[-0.02em] text-foreground">
        Confirming your payment
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/70">
        This usually takes a few seconds. The page will move on by itself. If you paid by bank
        transfer it can take longer, and we will email you the link when it clears.
      </p>
    </div>
  )
}

/**
 * Shown while the report is being written. Nudges the server on arrival, then
 * polls. While a run is in progress it nudges again every 30 seconds, which
 * does nothing unless that run has died, in which case it takes over. After a
 * failure it retries once per visit, not on a loop.
 */
export function GrowthReportPending({token, failed}: {token: string; failed: boolean}) {
  const router = useRouter()
  const started = useRef(false)
  const ticks = useRef(0)

  useEffect(() => {
    const nudge = () => void ensureGrowthReport(token).then(() => router.refresh())
    if (!started.current) {
      started.current = true
      nudge()
    }
    const timer = window.setInterval(() => {
      ticks.current += 1
      if (!failed && ticks.current % 6 === 0) nudge()
      else router.refresh()
    }, 5000)
    return () => window.clearInterval(timer)
  }, [router, token, failed])

  return (
    <div className="animate-quiz-rise">
      <p className={`flex items-center gap-2 ${LABEL}`}>
        <span
          className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent"
          aria-hidden="true"
        />
        Payment received
      </p>
      <h1 className="mt-4 text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1] tracking-[-0.02em] text-foreground">
        {failed ? 'Still working on your report' : 'Writing your report'}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/70">
        {failed
          ? 'This is taking longer than it should. We are trying again now, and we have been told about it. You will get an email with the link as soon as it is ready, so you can close this page.'
          : 'This takes about two minutes. We are reading your answers and looking at your website. You can stay here, or close this page. We will email you the link either way.'}
      </p>
    </div>
  )
}

/** Pushes a purchase event to the dataLayer once per browser, with the id the server also sent to Meta. */
export function GrowthPurchaseBeacon({
  event,
  eventId,
  value,
}: {
  event: 'growth_report_purchase' | 'growth_diagnostic_purchase'
  eventId: string
  value: number
}) {
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(eventId)) return
      window.sessionStorage.setItem(eventId, '1')
    } catch {
      // No storage: send anyway. A rare double count beats a missed purchase.
    }
    trackCustomEvent(event, {event_id: eventId, value, currency: 'USD'})
  }, [event, eventId, value])
  return null
}

export function GrowthPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`no-print transition-colors hover:text-foreground ${LABEL}`}
    >
      Save as PDF
    </button>
  )
}

export function GrowthDiagnosticButton({token, label}: {token: string; label: string}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function buy() {
    if (pending) return
    setPending(true)
    setError(null)
    const response = await startDiagnosticCheckout(token)
    if (!response.ok) {
      setError(response.message)
      setPending(false)
      return
    }
    trackCustomEvent('growth_diagnostic_checkout_start', {
      event_id: response.eventId,
      value: 1000,
      currency: 'USD',
    })
    window.location.assign(response.url)
  }

  return (
    <div className="no-print">
      <button
        type="button"
        onClick={buy}
        disabled={pending}
        className="btn-solid mt-6 inline-flex min-h-12 disabled:opacity-60"
      >
        {pending ? 'Opening checkout…' : label}
      </button>
      {error && (
        <p role="alert" className="mt-4 text-sm text-foreground">
          {error}
        </p>
      )}
    </div>
  )
}
