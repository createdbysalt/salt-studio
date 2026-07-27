'use client'

import {STATUS_AMBIENT_VIDEO} from '@/app/status-ambient'
import {useEffect, useRef} from 'react'
import {ERROR_PAGE_CONTENT} from './error-content'

/**
 * Global error boundary — catches errors in root layout.
 *
 * Must include its own <html> and <body> tags because the root layout may have
 * errored. No runtime Sanity dependency; minimal inline styles in case CSS
 * has not loaded.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & {digest?: string}
  reset: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.play().catch(() => {
      /* autoplay blocked */
    })
  }, [])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
          backgroundColor: '#0A0A0A',
          color: '#ffffff',
        }}
      >
        <main
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100svh',
            padding: '4rem 1.25rem',
            boxSizing: 'border-box',
            overflow: 'hidden',
            textAlign: 'center',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            src={STATUS_AMBIENT_VIDEO}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'relative',
              display: 'flex',
              width: '100%',
              maxWidth: '32rem',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0 1rem',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.28em',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              {ERROR_PAGE_CONTENT.eyebrow}
            </p>

            <h1
              style={{
                margin: '1.25rem 0 0',
                fontSize: 'clamp(2.25rem, 6vw, 3.5rem)',
                fontWeight: 500,
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
              }}
            >
              {ERROR_PAGE_CONTENT.headline}
            </h1>

            <p
              style={{
                margin: '1.25rem 0 0',
                maxWidth: '28rem',
                fontSize: '13px',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              {ERROR_PAGE_CONTENT.message}
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                marginTop: '2.5rem',
              }}
            >
              <button
                type="button"
                onClick={reset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem 1.25rem',
                  fontSize: '11px',
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  whiteSpace: 'nowrap',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: '#ffffff',
                  color: '#0A0A0A',
                }}
              >
                {ERROR_PAGE_CONTENT.retryButtonText}
              </button>

              <a
                href={ERROR_PAGE_CONTENT.homeButtonLink}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem 1.25rem',
                  fontSize: '11px',
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'rgba(255,255,255,0.9)',
                }}
              >
                {ERROR_PAGE_CONTENT.homeButtonText}
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
