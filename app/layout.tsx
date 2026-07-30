import {
  AnalyticsDebugOverlay,
  ClientGoogleAnalyticsScript,
  ClientIdentifier,
  ConsentProvider,
  ErrorTracker,
  GoogleTagManagerNoScript,
  GoogleTagManagerScript,
  PageViewTracker,
  ScrollTracker,
  WebVitalsReporter,
} from '@/lib/analytics'
import {ogImageUrl, seoConfig} from '@/lib/seo'
import {sanityFetch} from '@/sanity/lib/live'
import {developerSettingsQuery} from '@/sanity/lib/queries'
import type {Metadata} from 'next'
import {Geist, Geist_Mono} from 'next/font/google'
import Script from 'next/script'
import {Suspense} from 'react'

// Site-wide default social share card: the auto-generated /api/og branded card.
// Interior pages set their own and override this; it's the fallback for pages
// that don't (notably the 404 and error boundaries, which live outside the
// (personal) group and can't declare their own metadata).
const defaultOgImage = ogImageUrl()

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  openGraph: {
    images: [{url: defaultOgImage, width: 1200, height: 630}],
  },
  twitter: {
    card: 'summary_large_image',
    images: [defaultOgImage],
  },
}

// Brand typefaces per the 2026-07 visual identity: Geist (titles/body) + Geist Mono
// (labels). Variable fonts — full weight axis available.
const sans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export default async function RootLayout({children}: {children: React.ReactNode}) {
  // Fetch client's GA4 ID from Sanity (if configured)
  const {data: devSettings} = await sanityFetch({
    query: developerSettingsQuery,
    stega: false,
  })

  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <head>
        {/* Ink cover before hydration — does not mutate React-owned html attrs. */}
        <Script id="salt-intro-boot" strategy="beforeInteractive">
          {`(function(){try{if(location.pathname!=="/")return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;try{sessionStorage.removeItem("salt-intro")}catch(e){}window.__SALT_INTRO__=true;var s=document.createElement("style");s.id="salt-intro-boot-style";s.textContent="html,body{background:#08090a!important}[data-intro-hide]{opacity:0!important;pointer-events:none!important}[data-home-hero] [data-phrase-a],[data-home-hero] [data-phrase-b]{opacity:0!important}";(document.head||document.documentElement).appendChild(s);var d=document.createElement("div");d.id="salt-intro-boot";d.setAttribute("aria-hidden","true");d.style.cssText="position:fixed;inset:0;z-index:199;background:#08090a;pointer-events:none";(document.body||document.documentElement).appendChild(d);}catch(e){}})();`}
        </Script>
        <GoogleTagManagerScript />
        <ClientGoogleAnalyticsScript measurementId={devSettings?.clientGoogleAnalyticsId} />
      </head>
      <body className="bg-background text-foreground">
        <GoogleTagManagerNoScript />
        <ConsentProvider>
          <Suspense fallback={null}>
            <ClientIdentifier />
            <WebVitalsReporter />
            <PageViewTracker />
            <ScrollTracker />
            <ErrorTracker />
          </Suspense>
          {children}
          <AnalyticsDebugOverlay />
        </ConsentProvider>
      </body>
    </html>
  )
}
