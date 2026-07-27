'use client'

import {useEffect} from 'react'
import {usePathname} from 'next/navigation'
import {trackError} from './events'

/**
 * Error Tracker
 *
 * Automatically captures unhandled JavaScript errors and sends them to analytics.
 * Include once in your root layout.
 *
 * Tracks:
 * - Uncaught exceptions
 * - Unhandled promise rejections
 *
 * Note: For 404 errors, call trackError manually in not-found.tsx.
 * For API errors, call trackError in your error handling code.
 */
export function ErrorTracker() {
  const pathname = usePathname()

  useEffect(() => {
    function handleError(event: ErrorEvent) {
      trackError({
        error_type: 'js_error',
        error_message: event.message || 'Unknown error',
        error_page: pathname,
        error_stack: event.error?.stack,
      })
    }

    function handleRejection(event: PromiseRejectionEvent) {
      const message =
        event.reason instanceof Error
          ? event.reason.message
          : typeof event.reason === 'string'
            ? event.reason
            : 'Unhandled promise rejection'

      trackError({
        error_type: 'js_error',
        error_message: message,
        error_page: pathname,
        error_stack: event.reason instanceof Error ? event.reason.stack : undefined,
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [pathname])

  return null
}
