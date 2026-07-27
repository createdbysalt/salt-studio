import {CapabilitiesPage} from '@/components/CapabilitiesPage'
import {CorePageSchema, generateServiceSchema, ogImageUrl} from '@/lib/seo'
import {studioUrl} from '@/sanity/lib/api'
import {sanityFetch} from '@/sanity/lib/live'
import {capabilitiesPageQuery} from '@/sanity/lib/queries'
import {urlForOpenGraphImage} from '@/sanity/lib/utils'
import type {Metadata} from 'next'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
  const {data} = await sanityFetch({query: capabilitiesPageQuery, stega: false})

  const hero = data?.sections?.find((s) => s._type === 'capHeroSection')
  const heroHeadline = hero && 'headline' in hero ? (hero.headline ?? undefined) : undefined

  const ogImage = data?.ogImage
    ? urlForOpenGraphImage(data.ogImage)
    : ogImageUrl({
        title: heroHeadline ?? 'Capabilities',
        subtitle: data?.seoDescription,
      })

  return {
    title: data?.seoTitle ? {absolute: data.seoTitle} : 'Capabilities',
    description: data?.seoDescription ?? undefined,
    openGraph: {
      title: data?.seoTitle ?? heroHeadline ?? 'Capabilities',
      description: data?.seoDescription ?? undefined,
      images: ogImage ? [{url: ogImage, width: 1200, height: 630}] : [],
    },
    twitter: {card: 'summary_large_image', images: ogImage ? [ogImage] : []},
  }
}

export default async function CapabilitiesRoute() {
  const {data} = await sanityFetch({query: capabilitiesPageQuery})

  if (!data) {
    return (
      <div className="px-6 py-16 text-center">
        No Capabilities content yet,{' '}
        <Link href={`${studioUrl}/structure/capabilitiesPage`} className="underline">
          add it now
        </Link>
        .
      </div>
    )
  }

  const sections = (data.sections ?? []).filter((s) => s.enabled !== false)

  const hero = data.sections?.find((s) => s._type === 'capHeroSection')
  const heroHeadline = hero && 'headline' in hero ? (hero.headline ?? undefined) : undefined
  const heroLead = hero && 'lead' in hero ? (hero.lead ?? undefined) : undefined

  const name = heroHeadline ?? 'Capabilities'
  const description =
    data.seoDescription ?? heroLead ?? 'Modular production — creative, production, and post.'
  const speakable = data.speakableSummary ?? undefined
  const speakableSelectors = speakable ? ['h1', '.speakable-summary'] : ['h1']

  return (
    <>
      <CorePageSchema
        breadcrumbs={[
          {name: 'Home', url: '/'},
          {name: 'Capabilities', url: '/capabilities'},
        ]}
        name={name}
        description={speakable ?? description}
        url="/capabilities"
        speakableSelectors={speakableSelectors}
        primarySchema={generateServiceSchema({
          name,
          description,
          url: '/capabilities',
          serviceType: 'Modular Video Production',
          areaServed: ['Portland, OR', 'Lisbon', 'Worldwide'],
        })}
      />
      {speakable ? <p className="speakable-summary sr-only">{speakable}</p> : null}
      <CapabilitiesPage sections={sections} />
    </>
  )
}
