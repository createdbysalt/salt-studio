'use client'

import {pageIsDark} from '@/lib/pageTheme'
import {usePathname} from 'next/navigation'
import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react'
import {updateGoogleConsent} from './gtm'
import type {ConsentLevel, ConsentState} from './types'
import {ucAcceptAll, ucDenyAll, ucReadConsentLevels} from './usercentrics'

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
      
      updateGoogleConsent(stored.analytics, stored.marketing)

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
    ucAcceptAll() // record with the Usercentrics CMP (compliance log)
    saveConsent({necessary: true, analytics: true, marketing: true, timestamp: 0})
  }, [saveConsent])

  const acceptNecessary = useCallback(() => {
    ucDenyAll()
    saveConsent({necessary: true, analytics: false, marketing: false, timestamp: 0})
  }, [saveConsent])

  // Mirror choices made inside the Usercentrics second layer (granular
  // per-service settings, opened from the footer's "Privacy settings").
  useEffect(() => {
    const onUcEvent = (event: Event) => {
      const detail = (event as CustomEvent<{type?: string}>).detail
      if (!detail?.type) return

      if (detail.type === 'ACCEPT_ALL') {
        saveConsent({necessary: true, analytics: true, marketing: true, timestamp: 0})
      } else if (detail.type === 'DENY_ALL') {
        saveConsent({necessary: true, analytics: false, marketing: false, timestamp: 0})
      } else if (detail.type === 'SAVE') {
        const levels = ucReadConsentLevels()
        if (levels) {
          saveConsent({necessary: true, ...levels, timestamp: 0})
        }
      }
    }

    window.addEventListener('UC_UI_CMP_EVENT', onUcEvent)
    return () => window.removeEventListener('UC_UI_CMP_EVENT', onUcEvent)
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
 * Consent Banner — compact toast, bottom-right.
 * Same glass as navbar pills (black/6 on paper, white/10 frost on dark).
 */
function ConsentBanner() {
  const {acceptAll, acceptNecessary} = useConsent()
  const pathname = usePathname()
  const onColor = pageIsDark(pathname)

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 right-3 z-50 w-[min(100%-1.5rem,20rem)] sm:bottom-5 sm:right-4"
    >
      <div
        className={`flex flex-col gap-3.5 rounded-sm p-4 backdrop-blur-[42px] ${
          onColor
            ? 'bg-[rgba(255,255,255,0.10)] text-white'
            : 'bg-[rgba(0,0,0,0.06)] text-foreground'
        }`}
      >
        <div>
          <p className="font-sans text-[14px] font-medium tracking-[-0.01em]">Cookies</p>
          <p
            className={`mt-1.5 font-sans text-[13px] leading-snug tracking-[-0.01em] ${
              onColor ? 'text-white/70' : 'text-foreground/65'
            }`}
          >
            We use cookies to analyze site usage and improve your experience.{' '}
            <a
              href="/legal/privacy-policy"
              className={`underline underline-offset-2 transition-colors ${
                onColor
                  ? 'text-white/90 decoration-white/35 hover:text-white hover:decoration-white'
                  : 'text-foreground/85 decoration-foreground/30 hover:text-foreground hover:decoration-foreground'
              }`}
            >
              Learn more
            </a>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={acceptNecessary}
            className={`inline-flex flex-1 items-center justify-center rounded-sm px-3 py-2 font-sans text-[13px] font-medium tracking-[-0.01em] transition-colors ${
              onColor
                ? 'border border-white/35 text-white/90 hover:border-white/55 hover:text-white'
                : 'border border-foreground/35 text-foreground hover:border-foreground'
            }`}
          >
            Necessary
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className={`inline-flex flex-1 items-center justify-center rounded-sm px-3 py-2 font-sans text-[13px] font-medium tracking-[-0.01em] transition-colors ${
              onColor
                ? 'bg-white text-[#08090a] hover:bg-white/90'
                : 'bg-foreground text-background hover:bg-foreground/85'
            }`}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
