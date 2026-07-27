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

type ClientGoogleAnalyticsScriptProps = {
  measurementId: string | null | undefined
}

/**
 * Renders the gtag.js script for the client's GA4 property.
 * Include this in <head> after GoogleTagManagerScript.
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
      {/* Load gtag.js for client's GA4 property */}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
      <script
        id="client-ga4-config"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}');
          `,
        }}
      />
    </>
  )
}
