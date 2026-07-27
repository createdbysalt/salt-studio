'use client'

import './globals.css'
import {StatusPage} from '@/components/StatusPage'
import {useEffect} from 'react'
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
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <StatusPage
      eyebrow={ERROR_PAGE_CONTENT.eyebrow}
      headline={ERROR_PAGE_CONTENT.headline}
      message={ERROR_PAGE_CONTENT.message}
      primary={{
        kind: 'button',
        label: ERROR_PAGE_CONTENT.retryButtonText,
        onClick: reset,
      }}
      secondary={{
        kind: 'link',
        label: ERROR_PAGE_CONTENT.homeButtonText,
        href: ERROR_PAGE_CONTENT.homeButtonLink,
      }}
      footer={
        process.env.NODE_ENV === 'development' && error.digest ? (
          <p className="font-mono text-[10px] uppercase tracking-label text-foreground/30">
            Digest · {error.digest}
          </p>
        ) : null
      }
    />
  )
}
