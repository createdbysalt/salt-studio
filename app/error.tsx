'use client'

import './globals.css'
import {STATUS_AMBIENT_VIDEO} from '@/app/status-ambient'
import {useEffect, useRef} from 'react'
import {ERROR_PAGE_CONTENT} from './error-content'

/**
 * Error boundary for the app.
 *
 * No runtime Sanity dependency — if the server errors, Sanity might be the
 * cause. Copy comes from ERROR_PAGE_CONTENT, baked at build time from the
 * `errorPage` singleton by scripts/generate-error-content.mjs.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & {digest?: string}
  reset: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) {
      video.pause()
      video.removeAttribute('autoplay')
      return
    }

    video.play().catch(() => {
      /* autoplay blocked */
    })
  }, [])

  return (
    <main className="fixed inset-0 z-[60] flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] px-5 py-16 text-white md:px-8">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        src={STATUS_AMBIENT_VIDEO}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      <div className="relative flex w-full max-w-lg flex-col items-center px-4 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/45">
          {ERROR_PAGE_CONTENT.eyebrow}
        </p>

        <h1 className="mt-5 font-mono text-[clamp(2.25rem,6vw,3.5rem)] font-medium leading-[0.95] tracking-tight text-white">
          {ERROR_PAGE_CONTENT.headline}
        </h1>

        <p className="mt-5 max-w-md font-mono text-[13px] leading-relaxed text-white/60 md:text-sm">
          {ERROR_PAGE_CONTENT.message}
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center whitespace-nowrap bg-white px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-black transition-opacity hover:opacity-90"
          >
            {ERROR_PAGE_CONTENT.retryButtonText}
          </button>

          <a
            href={ERROR_PAGE_CONTENT.homeButtonLink}
            className="inline-flex items-center justify-center whitespace-nowrap border border-white/30 px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-white/90 transition-colors hover:border-white/60 hover:text-white"
          >
            {ERROR_PAGE_CONTENT.homeButtonText}
          </a>
        </div>

        {process.env.NODE_ENV === 'development' && error.digest ? (
          <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
            Digest · {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  )
}
