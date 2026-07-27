import {RentalPage} from '@/components/RentalPage'
import {CorePageSchema, generateServiceSchema, ogImageUrl} from '@/lib/seo'
import {sanityFetch} from '@/sanity/lib/live'
import {rentalPageBySlugQuery, slugsByTypeQuery} from '@/sanity/lib/queries'
import {urlForOpenGraphImage} from '@/sanity/lib/utils'
import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import {notFound} from 'next/navigation'

type Props = {params: Promise<{slug: string}>}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: slugsByTypeQuery,
    params: {type: 'rentalPage'},
    stega: false,
    perspective: 'published',
  })
  return data
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {data} = await sanityFetch({query: rentalPageBySlugQuery, params, stega: false})
  if (!data) return {}

  const ogImage = data.ogImage
    ? urlForOpenGraphImage(data.ogImage)
    : data.heroImage
      ? urlForOpenGraphImage(data.heroImage)
      : ogImageUrl({title: data.headline ?? data.title ?? 'Rental', subtitle: data.seoDescription})

  return {
    title: data.seoTitle ? {absolute: data.seoTitle} : (data.title ?? 'Rental'),
    description: data.seoDescription ?? undefined,
    openGraph: {
      title: data.seoTitle ?? data.headline ?? data.title ?? undefined,
      description: data.seoDescription ?? undefined,
      images: ogImage ? [{url: ogImage, width: 1200, height: 630}] : [],
    },
    twitter: {card: 'summary_large_image', images: ogImage ? [ogImage] : []},
  }
}

export default async function RentalPageRoute({params}: Props) {
  const {data} = await sanityFetch({query: rentalPageBySlugQuery, params})

  if (!data?._id && !(await draftMode()).isEnabled) {
    notFound()
  }
  if (!data) return null

  const name = data.headline ?? data.title ?? 'Rental'
  const description = data.seoDescription ?? `Rent the Salt Studio ${data.title ?? 'space'}.`
  const speakable = data.speakableSummary ?? undefined
  const speakableSelectors = speakable ? ['h1', '.speakable-summary'] : ['h1']

  return (
    <>
      <CorePageSchema
        breadcrumbs={[
          {name: 'Home', url: '/'},
          {name: data.title ?? 'Rental', url: `/rentals/${data.slug}`},
        ]}
        name={name}
        description={speakable ?? description}
        url={`/rentals/${data.slug}`}
        speakableSelectors={speakableSelectors}
        primarySchema={generateServiceSchema({
          name,
          description,
          url: `/rentals/${data.slug}`,
          serviceType: 'Studio and Equipment Rental',
          areaServed: 'Portland, OR',
        })}
      />
      {speakable ? <p className="sr-only speakable-summary">{speakable}</p> : null}
      <RentalPage data={data} />
    </>
  )
}
