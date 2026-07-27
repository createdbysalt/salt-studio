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
import {Suspense} from 'react'

// Site-wide default social share card: the auto-generated /api/og branded card.
// Interior pages set their own and override this; it's the fallback for pages
// that don't (notably the 404 and error boundaries, which live outside the
// (personal) group and can't declare their own metadata).
const defaultOgImage = ogImageUrl({
  title: seoConfig.siteName,
  subtitle: seoConfig.siteDescription,
})

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
