import '../globals.css'
import '@/styles/index.css'
import {LenisProvider} from '@/components/motion/LenisProvider'
import {PageTransition} from '@/components/motion/PageTransition'
import {Navbar} from '@/components/Navbar'
import {SiteFooter} from '@/components/SiteFooter'
import {SiteShell} from '@/components/SiteShell'
import {ogImageUrl, SiteStructuredData} from '@/lib/seo'
import {sanityFetch, SanityLive} from '@/sanity/lib/live'
import {footerLegalPagesQuery, homePageQuery, settingsQuery} from '@/sanity/lib/queries'
import {urlForOpenGraphImage} from '@/sanity/lib/utils'
import {SpeedInsights} from '@vercel/speed-insights/next'
import type {Metadata, Viewport} from 'next'
import {VisualEditing} from 'next-sanity/visual-editing'
import {draftMode} from 'next/headers'
import {Toaster} from 'sonner'
import {handleError} from './client-functions'
import {DraftModeToast} from './DraftModeToast'

export async function generateMetadata(): Promise<Metadata> {
  const [{data: settings}, {data: homePage}] = await Promise.all([
    sanityFetch({query: settingsQuery, stega: false}),
    sanityFetch({query: homePageQuery, stega: false}),
  ])

  // Use site name from settings, fallback to home page title
  const siteName = settings?.siteName || homePage?.seoTitle || 'Salt Studio'
  const siteDescription = settings?.siteDescription || homePage?.seoDescription

  // Uploaded settings image wins; otherwise fall back to the auto-generated
  // branded card so every page (including the 404) has a share image.
  const ogImage =
    urlForOpenGraphImage(settings?.ogImage) ??
    ogImageUrl({title: siteName, subtitle: siteDescription})

  return {
    title: {
      template: `%s | ${siteName}`,
      default: siteName,
    },
    description: siteDescription,
    openGraph: {
      siteName,
      images: [{url: ogImage, width: 1200, height: 630}],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImage],
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#eaeaea',
}

export default async function IndexRoute({children}: {children: React.ReactNode}) {
  const [{data}, {data: legalPages}] = await Promise.all([
    sanityFetch({query: settingsQuery}),
    sanityFetch({query: footerLegalPagesQuery}),
  ])
  return (
    <>
      <SiteStructuredData />
      <LenisProvider>
        <SiteShell
          navbar={<Navbar data={data} />}
          footer={<SiteFooter settings={data} legalPages={legalPages} />}
        >
          {children}
        </SiteShell>
      </LenisProvider>
      <PageTransition />
      <Toaster />
      <SanityLive onError={handleError} />
      {(await draftMode()).isEnabled && (
        <>
          <DraftModeToast
            action={async () => {
              'use server'

              await Promise.allSettled([
                (await draftMode()).disable(),
                // Simulate a delay to show the loading state
                new Promise((resolve) => setTimeout(resolve, 1000)),
              ])
            }}
          />
          <VisualEditing />
        </>
      )}
      <SpeedInsights />
    </>
  )
}
