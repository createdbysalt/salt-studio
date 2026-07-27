/**
 * Analytics Type Definitions
 *
 * Standardized event types for consistent tracking across the site.
 * All events should use these types to ensure GTM/GA4 compatibility.
 */

// Consent levels for GDPR/CCPA compliance
export type ConsentLevel = 'necessary' | 'analytics' | 'marketing'

export interface ConsentState {
  necessary: boolean // Always true — required for site function
  analytics: boolean // Performance & usage tracking
  marketing: boolean // Advertising & retargeting
  timestamp: number // When consent was given
}

// Standard event names — extend as needed
export type StandardEventName =
  | 'page_view'
  | 'web_vitals'
  | 'cta_click'
  | 'form_start'
  | 'form_submit'
  | 'form_error'
  | 'scroll_depth'
  | 'external_link'
  | 'file_download'
  | 'video_play'
  | 'video_progress'
  | 'video_complete'
  | 'search'
  | 'error'
  | 'consent_update'

// Base event structure
export interface BaseEvent {
  event: StandardEventName | string
  timestamp?: number
  consent_level?: ConsentLevel
}

// Page view event — fired on route changes
export interface PageViewEvent extends BaseEvent {
  event: 'page_view'
  page_path: string
  page_title: string
  page_location: string
  page_referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

// CTA/button click tracking
export interface CTAClickEvent extends BaseEvent {
  event: 'cta_click'
  cta_text: string
  cta_location: string // e.g., 'hero', 'navbar', 'footer'
  cta_destination?: string
  cta_type?: 'primary' | 'secondary' | 'link'
}

// Form tracking events
export interface FormStartEvent extends BaseEvent {
  event: 'form_start'
  form_name: string
  form_location: string
}

export interface FormSubmitEvent extends BaseEvent {
  event: 'form_submit'
  form_name: string
  form_location: string
  form_destination?: string // Thank you page or action
}

export interface FormErrorEvent extends BaseEvent {
  event: 'form_error'
  form_name: string
  form_location: string
  error_field?: string
  error_message?: string
}

// Scroll depth tracking
export interface ScrollDepthEvent extends BaseEvent {
  event: 'scroll_depth'
  scroll_depth: 25 | 50 | 75 | 90 | 100
  page_path: string
}

// External link clicks
export interface ExternalLinkEvent extends BaseEvent {
  event: 'external_link'
  link_url: string
  link_text?: string
  link_location: string
}

// File downloads
export interface FileDownloadEvent extends BaseEvent {
  event: 'file_download'
  file_name: string
  file_type: string
  file_url: string
}

// Video tracking
export interface VideoPlayEvent extends BaseEvent {
  event: 'video_play'
  video_title: string
  video_url: string
  video_provider?: 'youtube' | 'vimeo' | 'self-hosted'
}

export interface VideoProgressEvent extends BaseEvent {
  event: 'video_progress'
  video_title: string
  video_percent: 25 | 50 | 75 | 100
}

// Search tracking
export interface SearchEvent extends BaseEvent {
  event: 'search'
  search_term: string
  search_results_count?: number
}

// Error tracking
export interface ErrorEvent extends BaseEvent {
  event: 'error'
  error_type: 'js_error' | 'api_error' | '404' | 'form_validation'
  error_message: string
  error_page: string
  error_stack?: string
}

// Web Vitals (already implemented, adding type for completeness)
export interface WebVitalsEvent extends BaseEvent {
  event: 'web_vitals'
  metric_name: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'INP'
  metric_value: number
  metric_id: string
  metric_rating: 'good' | 'needs-improvement' | 'poor'
}

// Union type for all events
export type AnalyticsEvent =
  | PageViewEvent
  | CTAClickEvent
  | FormStartEvent
  | FormSubmitEvent
  | FormErrorEvent
  | ScrollDepthEvent
  | ExternalLinkEvent
  | FileDownloadEvent
  | VideoPlayEvent
  | VideoProgressEvent
  | SearchEvent
  | ErrorEvent
  | WebVitalsEvent
