/**
 * Google Tag Manager Integration
 *
 * Set NEXT_PUBLIC_GTM_ID in .env.local during client onboarding.
 * Example: NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
 *
 * GTM handles:
 * - Google Analytics 4
 * - Conversion tracking
 * - Custom events
 * - Any other marketing tags
 *
 * Clients configure tags in GTM dashboard — no code changes needed.
 *
 * Consent Mode:
 * This implementation uses Google Consent Mode v2. GTM loads immediately
 * but respects consent signals. Configure consent-based tag firing in GTM.
 *
 * @see https://developers.google.com/tag-platform/security/guides/consent
 */

import Script from 'next/script'

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

/**
 * GTM script to include in <head>.
 * Only renders if NEXT_PUBLIC_GTM_ID is set.
 *
 * Includes Google Consent Mode v2 default settings — all denied until
 * user provides consent via the ConsentProvider.
 */
export function GoogleTagManagerScript() {
  if (!GTM_ID) return null

  return (
    <>
      {/* Google Consent Mode v2 defaults */}
      <Script
        id="gtm-consent-defaults"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}

            // Default: deny all until consent given
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied',
              'functionality_storage': 'granted',
              'personalization_storage': 'denied',
              'security_storage': 'granted',
              'wait_for_update': 500
            });

            // Enable URL passthrough for better attribution without cookies
            gtag('set', 'url_passthrough', true);

            // Redact ads data when consent denied
            gtag('set', 'ads_data_redaction', true);
          `,
        }}
      />
      {/* GTM loader */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
    </>
  )
}

/**
 * GTM noscript iframe to include at start of <body>.
 * Provides fallback for users with JavaScript disabled.
 */
export function GoogleTagManagerNoScript() {
  if (!GTM_ID) return null

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{display: 'none', visibility: 'hidden'}}
      />
    </noscript>
  )
}

/**
 * Push custom events to the GTM dataLayer.
 *
 * @example
 * // Track a button click
 * pushToDataLayer({ event: 'button_click', button_name: 'CTA' })
 *
 * @example
 * // Track a form submission
 * pushToDataLayer({ event: 'form_submit', form_name: 'contact' })
 */
export function pushToDataLayer(data: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(data)
}

/**
 * Update Google Consent Mode based on user choice.
 * Called automatically by ConsentProvider when consent changes.
 */
export function updateGoogleConsent(analytics: boolean, marketing: boolean) {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer || []

  // Push consent update to dataLayer
  window.dataLayer.push({
    event: 'consent_update',
  })

  // Update Google Consent Mode via gtag arguments array
  window.dataLayer.push([
    'consent',
    'update',
    {
      ad_storage: marketing ? 'granted' : 'denied',
      ad_user_data: marketing ? 'granted' : 'denied',
      ad_personalization: marketing ? 'granted' : 'denied',
      analytics_storage: analytics ? 'granted' : 'denied',
      personalization_storage: analytics ? 'granted' : 'denied',
    },
  ])
}

// Type declaration for dataLayer
// GTM's dataLayer accepts both objects (events) and arrays (gtag arguments)
type DataLayerItem = Record<string, unknown> | unknown[]

declare global {
  interface Window {
    dataLayer: DataLayerItem[]
  }
}
