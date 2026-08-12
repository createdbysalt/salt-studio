/**
 * Usercentrics CMP (bundled with Termageddon) — consent engine only.
 *
 * The default Usercentrics banner is suppressed (`UC_UI_SUPPRESS_CMP_DISPLAY`);
 * our own Salt-branded banner in `consent.tsx` acts as the first layer and
 * forwards choices to UC_UI. The Usercentrics second layer (granular
 * per-service settings) opens via `ucShowSecondLayer()` — linked from the
 * footer's "Privacy settings" and required for compliance.
 */

import Script from 'next/script'

const UC_SETTINGS_ID = '3lNRNwFF7b2Anu'

/** Renders in the root <head>. Consent Mode governs storage; no script blocking. */
export function UsercentricsScripts() {
  return (
    <>
      <Script id="uc-suppress-default-ui" strategy="beforeInteractive">
        {'window.UC_UI_SUPPRESS_CMP_DISPLAY=true;'}
      </Script>
      <Script
        id="usercentrics-cmp"
        src="https://app.usercentrics.eu/browser-ui/latest/loader.js"
        data-settings-id={UC_SETTINGS_ID}
        strategy="afterInteractive"
      />
      <Script id="uc-translations" strategy="afterInteractive">
        {
          "try{uc.setCustomTranslations('https://termageddon.ams3.cdn.digitaloceanspaces.com/translations/');}catch(e){}"
        }
      </Script>
    </>
  )
}

type UcService = {
  name?: string
  consent?: {status?: boolean}
}

type UcUi = {
  isInitialized?: () => boolean
  acceptAllConsents?: () => Promise<void> | void
  denyAllConsents?: () => Promise<void> | void
  showSecondLayer?: () => void
  closeCMP?: () => void
  getServicesBaseInfo?: () => UcService[]
}

declare global {
  interface Window {
    UC_UI?: UcUi
    UC_UI_SUPPRESS_CMP_DISPLAY?: boolean
  }
}

function ucUi(): UcUi | null {
  if (typeof window === 'undefined') return null
  return window.UC_UI ?? null
}

/** Record "accept all" with Usercentrics (no-op if the CMP hasn't loaded). */
export function ucAcceptAll(): void {
  ucUi()?.acceptAllConsents?.()
  ucUi()?.closeCMP?.()
}

/** Record "necessary only" with Usercentrics (no-op if the CMP hasn't loaded). */
export function ucDenyAll(): void {
  ucUi()?.denyAllConsents?.()
  ucUi()?.closeCMP?.()
}

/** Open the Usercentrics second layer — granular per-service settings. */
export function ucShowSecondLayer(): void {
  ucUi()?.showSecondLayer?.()
}

/**
 * Derive our two consent levels from Usercentrics' per-service state after a
 * granular "Save" in the second layer. Anything that isn't clearly an
 * analytics or ads service is treated as necessary and ignored here.
 */
export function ucReadConsentLevels(): {analytics: boolean; marketing: boolean} | null {
  const services = ucUi()?.getServicesBaseInfo?.()
  if (!services || services.length === 0) return null

  const has = (patterns: RegExp[], status: boolean) =>
    services.some((s) => s.consent?.status === status && patterns.some((p) => p.test(s.name ?? '')))

  const analyticsPatterns = [/analytics/i, /tag manager/i, /statistics/i]
  const marketingPatterns = [/ads?\b/i, /marketing/i, /remarketing/i, /doubleclick/i, /meta/i]

  return {
    analytics: has(analyticsPatterns, true),
    marketing: has(marketingPatterns, true) && !has(marketingPatterns, false),
  }
}
