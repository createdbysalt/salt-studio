'use client'

import {useEffect} from 'react'
import {ERROR_PAGE_CONTENT} from './error-content'

/**
 * Global error boundary — catches errors in root layout.
 *
 * Must include its own <html> and <body> because the root layout may have
 * errored. Inline Salt tokens only — CSS / Tailwind may not have loaded.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & {digest?: string}
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#FFFFFF',
          color: '#08090A',
          fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <main
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            minHeight: '100svh',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '2.5rem 1rem',
          }}
        >
          <div style={{width: '100%', maxWidth: '40rem', margin: '0 auto'}}>
            <a
              href="/"
              aria-label="Salt Studio — Home"
              style={{
                display: 'inline-block',
                fontFamily: '"Geist", sans-serif',
                fontSize: '1.25rem',
                fontWeight: 600,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                color: '#08090A',
              }}
            >
              Salt
            </a>

            <p
              style={{
                margin: '3.5rem 0 0',
                fontFamily: '"Geist Mono", ui-monospace, monospace',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(8, 9, 10, 0.4)',
              }}
            >
              {ERROR_PAGE_CONTENT.eyebrow}
            </p>

            <h1
              style={{
                margin: '1rem 0 0',
                fontFamily: '"Geist", sans-serif',
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 600,
                lineHeight: 0.92,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
              }}
            >
              {ERROR_PAGE_CONTENT.headline}
            </h1>

            <p
              style={{
                margin: '1.5rem 0 0',
                maxWidth: '36ch',
                fontSize: '1.125rem',
                lineHeight: 1.6,
                color: 'rgba(8, 9, 10, 0.7)',
              }}
            >
              {ERROR_PAGE_CONTENT.message}
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
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
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '8px',
                  border: '1px solid #08090A',
                  backgroundColor: '#08090A',
                  color: '#FFFFFF',
                  fontFamily: '"Geist Mono", ui-monospace, monospace',
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {ERROR_PAGE_CONTENT.retryButtonText}
              </button>

              <a
                href={ERROR_PAGE_CONTENT.homeButtonLink}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(8, 9, 10, 0.4)',
                  backgroundColor: 'transparent',
                  color: '#08090A',
                  fontFamily: '"Geist Mono", ui-monospace, monospace',
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
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
