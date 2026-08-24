/**
 * Client Google Analytics Integration
 *
 * Renders gtag.js for the client's own GA4 property.
 * The measurement ID is pulled from Sanity (developerSettings.clientGoogleAnalyticsId).
 *
 * This runs ALONGSIDE Salt Studio's GTM tracking (from NEXT_PUBLIC_GTM_ID env var).
 * Both can coexist — data flows to both properties independently.
 *
 * Note: This script respects Google Consent Mode. The consent defaults are set
 * by GTM, so this will also be blocked until the user consents.
 */

import Script from 'next/script'

type ClientGoogleAnalyticsScriptProps = {
  measurementId: string | null | undefined
}

/**
 * Renders the gtag.js script for the client's GA4 property.
 * Mount in the root layout body after GoogleTagManagerScript.
 *
 * @example
 * // In app/layout.tsx
 * const {data} = await sanityFetch({query: developerSettingsQuery, stega: false})
 * <ClientGoogleAnalyticsScript measurementId={data?.clientGoogleAnalyticsId} />
 */
export function ClientGoogleAnalyticsScript({measurementId}: ClientGoogleAnalyticsScriptProps) {
  if (!measurementId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="client-ga4-config" strategy="afterInteractive">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}');
          `}
      </Script>
    </>
  )
}
