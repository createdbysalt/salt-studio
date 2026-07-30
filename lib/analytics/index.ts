/**
 * Analytics Module
 *
 * Comprehensive, consent-aware analytics for client websites.
 *
 * Quick start:
 * 1. Set NEXT_PUBLIC_GTM_ID in .env.local
 * 2. Wrap app with <ConsentProvider> and <AnalyticsProvider>
 * 3. Use typed event helpers (trackCTAClick, trackFormSubmit, etc.)
 *
 * @see lib/analytics/CLAUDE.md for full documentation
 */

// GTM scripts and helpers (Salt Studio tracking via env var)
export {
  GoogleTagManagerScript,
  GoogleTagManagerNoScript,
  pushToDataLayer,
  updateGoogleConsent,
} from './gtm'

// Client's own GA4 (from Sanity)
export {ClientGoogleAnalyticsScript} from './client-ga'

// Consent management
export {ConsentProvider, useConsent, getConsent, hasConsentFor} from './consent'

// Usercentrics CMP (Termageddon bundle) — scripts + helpers
export {UsercentricsScripts, ucAcceptAll, ucDenyAll, ucShowSecondLayer} from './usercentrics'

// Automatic trackers (include in layout)
export {ClientIdentifier} from './client-identifier'
export {WebVitalsReporter} from './web-vitals'
export {PageViewTracker} from './page-view-tracker'
export {ScrollTracker} from './scroll-tracker'
export {ErrorTracker} from './error-tracker'
export {AnalyticsDebugOverlay} from './debug-overlay'

// Typed event helpers
export {
  trackPageView,
  trackCTAClick,
  trackFormStart,
  trackFormSubmit,
  trackFormError,
  trackScrollDepth,
  trackExternalLink,
  trackFileDownload,
  trackVideoPlay,
  trackVideoProgress,
  trackSearch,
  trackError,
  trackQuizStart,
  trackQuizStep,
  trackQuizGate,
  trackQuizComplete,
  trackCustomEvent,
} from './events'

// Types
export type {
  ConsentState,
  ConsentLevel,
  StandardEventName,
  AnalyticsEvent,
  PageViewEvent,
  CTAClickEvent,
  FormSubmitEvent,
  ScrollDepthEvent,
  ErrorEvent,
} from './types'
