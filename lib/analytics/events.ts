'use client'

import {hasConsentFor} from './consent'
import {pushToDataLayer} from './gtm'
import type {
  CTAClickEvent,
  FormStartEvent,
  FormSubmitEvent,
  FormErrorEvent,
  ScrollDepthEvent,
  ExternalLinkEvent,
  FileDownloadEvent,
  VideoPlayEvent,
  VideoProgressEvent,
  SearchEvent,
  ErrorEvent,
  PageViewEvent,
} from './types'

/**
 * Typed Analytics Event Helpers
 *
 * These functions provide type-safe event tracking with consent checks.
 * All events are pushed to GTM's dataLayer for GA4 processing.
 *
 * Usage:
 *   import {trackCTAClick} from '@/lib/analytics'
 *   trackCTAClick({cta_text: 'Get Started', cta_location: 'hero'})
 */

// Internal helper to check consent and push event
function trackEvent(
  event: Record<string, unknown>,
  requiresConsent: 'analytics' | 'marketing' = 'analytics'
): void {
  // Skip if no consent for required level
  if (!hasConsentFor(requiresConsent)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Blocked (no ${requiresConsent} consent):`, event)
    }
    return
  }

  pushToDataLayer({
    ...event,
    timestamp: Date.now(),
  })
}

/**
 * Track page view — called automatically by PageViewTracker.
 * Manual usage only needed for virtual page views (e.g., modals, tabs).
 */
export function trackPageView(
  data: Omit<PageViewEvent, 'event' | 'timestamp'>
): void {
  trackEvent({event: 'page_view', ...data})
}

/**
 * Track CTA/button clicks.
 *
 * @example
 * <button onClick={() => trackCTAClick({
 *   cta_text: 'Get Started',
 *   cta_location: 'hero',
 *   cta_type: 'primary'
 * })}>
 *   Get Started
 * </button>
 */
export function trackCTAClick(
  data: Omit<CTAClickEvent, 'event' | 'timestamp'>
): void {
  trackEvent({event: 'cta_click', ...data})
}

/**
 * Track form interaction start (first field focus).
 */
export function trackFormStart(
  data: Omit<FormStartEvent, 'event' | 'timestamp'>
): void {
  trackEvent({event: 'form_start', ...data})
}

/**
 * Track successful form submission.
 */
export function trackFormSubmit(
  data: Omit<FormSubmitEvent, 'event' | 'timestamp'>
): void {
  trackEvent({event: 'form_submit', ...data})
}

/**
 * Track form validation errors.
 */
export function trackFormError(
  data: Omit<FormErrorEvent, 'event' | 'timestamp'>
): void {
  trackEvent({event: 'form_error', ...data})
}

/**
 * Track scroll depth milestones.
 * Usually called by ScrollTracker component, not manually.
 */
export function trackScrollDepth(
  data: Omit<ScrollDepthEvent, 'event' | 'timestamp'>
): void {
  trackEvent({event: 'scroll_depth', ...data})
}

/**
 * Track external link clicks.
 *
 * @example
 * <a
 *   href="https://example.com"
 *   onClick={() => trackExternalLink({
 *     link_url: 'https://example.com',
 *     link_text: 'Visit Example',
 *     link_location: 'footer'
 *   })}
 * >
 */
export function trackExternalLink(
  data: Omit<ExternalLinkEvent, 'event' | 'timestamp'>
): void {
  trackEvent({event: 'external_link', ...data})
}

/**
 * Track file downloads.
 */
export function trackFileDownload(
  data: Omit<FileDownloadEvent, 'event' | 'timestamp'>
): void {
  trackEvent({event: 'file_download', ...data})
}

/**
 * Track video play start.
 */
export function trackVideoPlay(
  data: Omit<VideoPlayEvent, 'event' | 'timestamp'>
): void {
  trackEvent({event: 'video_play', ...data})
}

/**
 * Track video progress milestones (25%, 50%, 75%, 100%).
 */
export function trackVideoProgress(
  data: Omit<VideoProgressEvent, 'event' | 'timestamp'>
): void {
  trackEvent({event: 'video_progress', ...data})
}

/**
 * Track search queries.
 */
export function trackSearch(
  data: Omit<SearchEvent, 'event' | 'timestamp'>
): void {
  trackEvent({event: 'search', ...data})
}

/**
 * Track errors (JS errors, API failures, 404s).
 */
export function trackError(
  data: Omit<ErrorEvent, 'event' | 'timestamp'>
): void {
  trackEvent({event: 'error', ...data})
}

/**
 * Track quiz start (visitor begins the Salt Score quiz).
 */
export function trackQuizStart(data: {quiz_name: string}): void {
  trackEvent({event: 'quiz_start', ...data})
}

/**
 * Track a quiz step answer — powers funnel drop-off analysis.
 */
export function trackQuizStep(data: {
  quiz_name: string
  step: number
  question_key: string
  track?: string
}): void {
  trackEvent({event: 'quiz_step', ...data})
}

/**
 * Track the email gate being shown (all questions answered).
 */
export function trackQuizGate(data: {quiz_name: string; track: string}): void {
  trackEvent({event: 'quiz_gate', ...data})
}

/**
 * Track successful quiz completion (gate submitted, results shown).
 */
export function trackQuizComplete(data: {
  quiz_name: string
  track: string
  score?: number
  score_band?: string
  waitlist_opt_in: boolean
}): void {
  trackEvent({event: 'quiz_complete', ...data})
}

/**
 * Track custom event.
 * Use this for one-off events that don't fit the standard types.
 *
 * @example
 * trackCustomEvent('newsletter_signup', {location: 'footer', email_domain: 'gmail.com'})
 */
export function trackCustomEvent(
  eventName: string,
  data: Record<string, unknown> = {},
  requiresConsent: 'analytics' | 'marketing' = 'analytics'
): void {
  trackEvent({event: eventName, ...data}, requiresConsent)
}
