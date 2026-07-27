import {StudioPage} from '@/components/StudioPage'
import {CorePageSchema, generateLocalBusinessSchema, ogImageUrl} from '@/lib/seo'
import {studioUrl} from '@/sanity/lib/api'
import {sanityFetch} from '@/sanity/lib/live'
import {studioPageQuery} from '@/sanity/lib/queries'
import {urlForOpenGraphImage} from '@/sanity/lib/utils'
import type {Metadata} from 'next'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
  const {data} = await sanityFetch({query: studioPageQuery, stega: false})

  const hero = data?.sections?.find((s) => s._type === 'studioHeroSection')
  const heroHeadline = hero && 'headline' in hero ? (hero.headline ?? undefined) : undefined

  const ogImage = data?.ogImage
    ? urlForOpenGraphImage(data.ogImage)
    : ogImageUrl({
        title: heroHeadline ?? 'Studio',
        subtitle: data?.seoDescription,
      })

  return {
    title: data?.seoTitle ? {absolute: data.seoTitle} : 'Studio',
    description: data?.seoDescription ?? undefined,
    openGraph: {
      title: data?.seoTitle ?? heroHeadline ?? 'Studio',
      description: data?.seoDescription ?? undefined,
      images: ogImage ? [{url: ogImage, width: 1200, height: 630}] : [],
    },
    twitter: {card: 'summary_large_image', images: ogImage ? [ogImage] : []},
  }
}

export default async function StudioRoute() {
  const {data} = await sanityFetch({query: studioPageQuery})

  if (!data) {
    return (
      <div className="px-6 py-16 text-center">
        No Studio content yet,{' '}
        <Link href={`${studioUrl}/structure/studioPage`} className="underline">
          add it now
        </Link>
        .
      </div>
    )
  }

  const sections = (data.sections ?? []).filter((s) => s.enabled !== false)

  const hero = data.sections?.find((s) => s._type === 'studioHeroSection')
  const heroHeadline = hero && 'headline' in hero ? (hero.headline ?? undefined) : undefined
  const name = heroHeadline ?? 'Studio'
  const description = data.seoDescription ?? 'A 6,000 sq ft production studio in Portland, Oregon.'
  const speakable = data.speakableSummary ?? undefined
  const speakableSelectors = speakable ? ['h1', '.speakable-summary'] : ['h1']

  return (
    <>
      <CorePageSchema
        breadcrumbs={[
          {name: 'Home', url: '/'},
          {name: 'Studio', url: '/studio'},
        ]}
        name={name}
        description={speakable ?? description}
        url="/studio"
        speakableSelectors={speakableSelectors}
        primarySchema={generateLocalBusinessSchema({
          name: 'Salt Studio',
          description,
          address: {
            street: '726 SE 10th Ave',
            city: 'Portland',
            region: 'OR',
            postalCode: '97214',
            country: 'US',
          },
          priceRange: '$$$',
        })}
      />
      {speakable ? <p className="sr-only speakable-summary">{speakable}</p> : null}
      <StudioPage sections={sections} />
    </>
  )
}
