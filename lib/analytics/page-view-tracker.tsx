'use client'

import {useEffect, useRef} from 'react'
import {usePathname, useSearchParams} from 'next/navigation'
import {trackPageView} from './events'

/**
 * Page View Tracker
 *
 * Automatically tracks page views on route changes in Next.js App Router.
 * Handles both initial page loads and client-side navigation.
 *
 * Include once in your root layout (inside ConsentProvider).
 *
 * Features:
 * - Tracks full URL including search params
 * - Preserves UTM parameters for attribution
 * - Captures document title after hydration
 * - Debounces rapid route changes
 */
export function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstRender = useRef(true)
  const lastTrackedUrl = useRef<string>('')

  useEffect(() => {
    // Build full URL
    const url = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname

    // Avoid duplicate tracking
    if (url === lastTrackedUrl.current) return
    lastTrackedUrl.current = url

    // Skip first render if GTM already fired a page view
    // (GTM often auto-fires on initial load)
    if (isFirstRender.current) {
      isFirstRender.current = false
      // Still track after small delay to ensure consent is loaded
      const timer = setTimeout(() => {
        firePageView(pathname, searchParams)
      }, 100)
      return () => clearTimeout(timer)
    }

    // Track subsequent navigations immediately
    firePageView(pathname, searchParams)
  }, [pathname, searchParams])

  return null
}

function firePageView(
  pathname: string,
  searchParams: URLSearchParams | ReturnType<typeof useSearchParams>
) {
  // Get UTM params if present
  const utmSource = searchParams.get('utm_source') || undefined
  const utmMedium = searchParams.get('utm_medium') || undefined
  const utmCampaign = searchParams.get('utm_campaign') || undefined
  const utmTerm = searchParams.get('utm_term') || undefined
  const utmContent = searchParams.get('utm_content') || undefined

  // Store UTMs in sessionStorage for attribution
  if (utmSource) {
    try {
      sessionStorage.setItem(
        'utm_params',
        JSON.stringify({utmSource, utmMedium, utmCampaign, utmTerm, utmContent})
      )
    } catch {
      // sessionStorage not available
    }
  }

  // Get stored UTMs if current page doesn't have them
  let storedUtms: Record<string, string | undefined> = {}
  if (!utmSource) {
    try {
      const stored = sessionStorage.getItem('utm_params')
      if (stored) storedUtms = JSON.parse(stored)
    } catch {
      // sessionStorage not available
    }
  }

  trackPageView({
    page_path: pathname,
    page_title: typeof document !== 'undefined' ? document.title : '',
    page_location: typeof window !== 'undefined' ? window.location.href : '',
    page_referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    utm_source: utmSource || storedUtms.utmSource,
    utm_medium: utmMedium || storedUtms.utmMedium,
    utm_campaign: utmCampaign || storedUtms.utmCampaign,
    utm_term: utmTerm || storedUtms.utmTerm,
    utm_content: utmContent || storedUtms.utmContent,
  })
}
