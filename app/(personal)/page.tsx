import {HomePage} from '@/components/HomePage'
import {CorePageSchema, ogImageUrl} from '@/lib/seo'
import {studioUrl} from '@/sanity/lib/api'
import {sanityFetch} from '@/sanity/lib/live'
import {homePageQuery} from '@/sanity/lib/queries'
import {urlForOpenGraphImage} from '@/sanity/lib/utils'
import type {Metadata} from 'next'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
  const {data} = await sanityFetch({query: homePageQuery, stega: false})

  // Manual Sanity ogImage wins; otherwise the branded OG card (wordmark + tagline).
  // Pass "Salt Studio" as title so /api/og uses the brand composition — not a
  // long SEO title competing with the mark.
  const ogImage = data?.ogImage
    ? urlForOpenGraphImage(data.ogImage)
    : ogImageUrl({title: 'Salt Studio'})

  return {
    openGraph: {images: ogImage ? [{url: ogImage, width: 1200, height: 630}] : []},
    twitter: {card: 'summary_large_image', images: ogImage ? [ogImage] : []},
  }
}

export default async function IndexRoute() {
  const {data} = await sanityFetch({query: homePageQuery})

  if (!data) {
    return (
      <div className="text-center">
        You don&rsquo;t have a homepage yet,{' '}
        <Link href={`${studioUrl}/structure/home`} className="underline">
          create one now
        </Link>
        !
      </div>
    )
  }

  const description =
    data.seoDescription ??
    data.hiddenH1 ??
    'Custom AI and websites for organizations with a mission.'
  const speakable = data.speakableSummary ?? undefined
  const speakableSelectors = speakable ? ['h1', '.speakable-summary'] : ['h1']

  return (
    <>
      {/* Per-page structured data (SEO + AEO). Organization + WebSite are site-wide. */}
      <CorePageSchema
        breadcrumbs={[{name: 'Home', url: '/'}]}
        name={data.seoTitle ?? 'Salt Studio'}
        description={speakable ?? description}
        url="/"
        speakableSelectors={speakableSelectors}
      />
      {speakable ? <p className="sr-only speakable-summary">{speakable}</p> : null}
      <HomePage data={data} />
    </>
  )
}
