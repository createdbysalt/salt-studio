'use client'

import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react'
import {updateGoogleConsent} from './gtm'
import type {ConsentLevel, ConsentState} from './types'

const CONSENT_STORAGE_KEY = 'analytics_consent'
const CONSENT_VERSION = 1 // Bump this to re-prompt users after policy changes

// Default state — only necessary cookies allowed
const defaultConsent: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  timestamp: 0,
}

interface ConsentContextValue {
  consent: ConsentState
  hasConsented: boolean
  showBanner: boolean
  acceptAll: () => void
  acceptNecessary: () => void
  updateConsent: (updates: Partial<Omit<ConsentState, 'necessary' | 'timestamp'>>) => void
  hasConsentFor: (level: ConsentLevel) => boolean
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

/**
 * Hook to access consent state and controls.
 */
export function useConsent() {
  const context = useContext(ConsentContext)
  if (!context) {
    throw new Error('useConsent must be used within ConsentProvider')
  }
  return context
}

/**
 * Check consent without hook (for non-component code).
 * Returns false if consent not yet given or on server.
 */
export function getConsent(): ConsentState {
  if (typeof window === 'undefined') return defaultConsent

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!stored) return defaultConsent

    const parsed = JSON.parse(stored)
    if (parsed.version !== CONSENT_VERSION) return defaultConsent

    return parsed.consent
  } catch {
    return defaultConsent
  }
}

/**
 * Check if user has consented to a specific level.
 */
export function hasConsentFor(level: ConsentLevel): boolean {
  const consent = getConsent()
  return consent[level] === true
}

interface ConsentProviderProps {
  children: ReactNode
}

/**
 * Consent Provider
 *
 * Wrap your app with this to enable consent-aware analytics.
 * Renders a consent banner if user hasn't made a choice.
 */
export function ConsentProvider({children}: ConsentProviderProps) {
  const [consent, setConsent] = useState<ConsentState>(defaultConsent)
  const [hasConsented, setHasConsented] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Load consent from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const stored = getConsent()
    if (stored.timestamp > 0) {
      setConsent(stored)
      setHasConsented(true)
      setShowBanner(false)
    } else {
      // Small delay before showing banner to avoid layout shift
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Save consent to localStorage and push to dataLayer
  const saveConsent = useCallback((newConsent: ConsentState) => {
    const withTimestamp = {...newConsent, timestamp: Date.now()}
    setConsent(withTimestamp)
    setHasConsented(true)
    setShowBanner(false)

    try {
      localStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify({version: CONSENT_VERSION, consent: withTimestamp}),
      )
    } catch {
      // localStorage not available
    }

    // Update Google Consent Mode
    updateGoogleConsent(withTimestamp.analytics, withTimestamp.marketing)
  }, [])

  const acceptAll = useCallback(() => {
    saveConsent({necessary: true, analytics: true, marketing: true, timestamp: 0})
  }, [saveConsent])

  const acceptNecessary = useCallback(() => {
    saveConsent({necessary: true, analytics: false, marketing: false, timestamp: 0})
  }, [saveConsent])

  const updateConsent = useCallback(
    (updates: Partial<Omit<ConsentState, 'necessary' | 'timestamp'>>) => {
      saveConsent({...consent, ...updates, necessary: true, timestamp: 0})
    },
    [consent, saveConsent],
  )

  const hasConsentForLevel = useCallback(
    (level: ConsentLevel) => consent[level] === true,
    [consent],
  )

  // Don't render banner during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <ConsentContext.Provider
        value={{
          consent: defaultConsent,
          hasConsented: false,
          showBanner: false,
          acceptAll: () => {},
          acceptNecessary: () => {},
          updateConsent: () => {},
          hasConsentFor: () => false,
        }}
      >
        {children}
      </ConsentContext.Provider>
    )
  }

  return (
    <ConsentContext.Provider
      value={{
        consent,
        hasConsented,
        showBanner,
        acceptAll,
        acceptNecessary,
        updateConsent,
        hasConsentFor: hasConsentForLevel,
      }}
    >
      {children}
      {showBanner && <ConsentBanner />}
    </ConsentContext.Provider>
  )
}

/**
 * Consent Banner — semantic tokens so it renders correctly on the light stage
 * and inside dark bands alike. Buttons via .btn-solid / .btn-ghost (globals.css).
 */
function ConsentBanner() {
  const {acceptAll, acceptNecessary} = useConsent()

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-50 md:inset-x-6 md:bottom-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-lg border border-border bg-background/90 p-4 backdrop-blur-md md:flex-row md:items-center md:justify-between md:gap-6 md:p-5">
        <p className="font-mono text-[11px] uppercase leading-[1.7] tracking-[0.08em] text-foreground/70 md:flex-1">
          We use cookies to analyze site usage and improve your experience.{' '}
          <a
            href="/legal/privacy-policy"
            className="underline decoration-foreground/40 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
          >
            Learn more
          </a>
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <button onClick={acceptNecessary} className="btn-ghost justify-center">
            Necessary only
          </button>
          <button onClick={acceptAll} className="btn-solid justify-center">
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
