'use client'

import {useReportWebVitals} from 'next/web-vitals'
import {pushToDataLayer} from './gtm'
import {hasConsentFor} from './consent'

/**
 * Web Vitals Reporter
 *
 * Tracks Core Web Vitals and sends them to Google Analytics via GTM.
 * Include this component once in your app layout (inside ConsentProvider).
 *
 * Respects user consent — only sends data if analytics consent is granted.
 *
 * Metrics tracked:
 * - LCP (Largest Contentful Paint) - Loading performance
 * - FID (First Input Delay) - Interactivity
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - FCP (First Contentful Paint) - Initial render
 * - TTFB (Time to First Byte) - Server response
 * - INP (Interaction to Next Paint) - Responsiveness
 *
 * @see https://web.dev/vitals/
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Log in development regardless of consent
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
      })
    }

    // Only send to GTM if analytics consent granted
    if (!hasConsentFor('analytics')) {
      return
    }

    // Send to GTM/GA4
    pushToDataLayer({
      event: 'web_vitals',
      metric_name: metric.name,
      metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_id: metric.id,
      metric_rating: metric.rating, // 'good', 'needs-improvement', or 'poor'
    })
  })

  return null
}
