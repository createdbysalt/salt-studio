import {ContactPage} from '@/components/ContactPage'
import {CorePageSchema, ogImageUrl, seoConfig} from '@/lib/seo'
import {studioUrl} from '@/sanity/lib/api'
import {sanityFetch} from '@/sanity/lib/live'
import {contactPageQuery} from '@/sanity/lib/queries'
import type {Metadata} from 'next'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
  const {data} = await sanityFetch({query: contactPageQuery, stega: false})

  const hero = data?.sections?.find((s) => s._type === 'contactHeroSection')
  const heroHeadline = hero && 'headline' in hero ? (hero.headline ?? undefined) : undefined
  const ogImage = ogImageUrl()

  return {
    title: data?.seoTitle ? {absolute: data.seoTitle} : 'Contact',
    description: data?.seoDescription ?? undefined,
    alternates: {canonical: '/contact'},
    openGraph: {
      title: data?.seoTitle ?? heroHeadline ?? 'Contact',
      description: data?.seoDescription ?? undefined,
      images: [{url: ogImage, width: 1200, height: 630}],
    },
    twitter: {card: 'summary_large_image', images: [ogImage]},
  }
}

export default async function ContactRoute() {
  const {data} = await sanityFetch({query: contactPageQuery})

  if (!data) {
    return (
      <div className="bg-background px-6 py-16 text-center text-foreground">
        No Contact content yet,{' '}
        <Link href={`${studioUrl}/structure/contactPage`} className="underline">
          add it now
        </Link>
        .
      </div>
    )
  }

  const sections = (data.sections ?? []).filter((s) => s.enabled !== false)

  const hero = data.sections?.find((s) => s._type === 'contactHeroSection')
  const heroHeadline = hero && 'headline' in hero ? (hero.headline ?? undefined) : undefined
  const name = heroHeadline ?? 'Contact'
  const description = data.seoDescription ?? 'Get in touch with Salt Studio.'
  const speakable = data.speakableSummary ?? undefined
  const speakableSelectors = speakable ? ['h1', '.speakable-summary'] : ['h1']

  return (
    <>
      <CorePageSchema
        breadcrumbs={[
          {name: 'Home', url: '/'},
          {name: 'Contact', url: '/contact'},
        ]}
        name={name}
        description={speakable ?? description}
        url="/contact"
        speakableSelectors={speakableSelectors}
        primarySchema={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name,
          description,
          'url': `${seoConfig.siteUrl}/contact`,
        }}
      />
      {speakable ? <p className="sr-only speakable-summary">{speakable}</p> : null}
      <ContactPage sections={sections} />
    </>
  )
}
