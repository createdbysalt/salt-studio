import {CustomPortableText} from '@/components/CustomPortableText'
import {Header} from '@/components/Header'
import {HomePage} from '@/components/HomePage'
import {
  BreadcrumbStructuredData,
  ogImageUrl,
  PersonStructuredData,
  SpeakableWebPage,
} from '@/lib/seo'
import {sanityFetch} from '@/sanity/lib/live'
import {homePageQuery, pagesBySlugQuery, personBySlugQuery, personSlugsQuery, slugsByTypeQuery} from '@/sanity/lib/queries'
import {urlForOpenGraphImage} from '@/sanity/lib/utils'
import type {PersonBySlugQueryResult} from '@/sanity.types'
import type {Metadata, ResolvingMetadata} from 'next'
import {stegaClean, toPlainText, type PortableTextBlock} from 'next-sanity'
import {draftMode} from 'next/headers'
import {notFound} from 'next/navigation'

type Props = {
  params: Promise<{slug: string}>
}

export async function generateMetadata(
  {params}: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const {slug} = await params
  const {data: person} = await sanityFetch({
    query: personBySlugQuery,
    params: {slug},
    stega: false,
  })

  if (person?._id) {
    return personMetadata(person, slug)
  }

  const {data: page} = await sanityFetch({
    query: pagesBySlugQuery,
    params,
    stega: false,
  })

  const ogImage = ogImageUrl()

  return {
    title: page?.title,
    description: page?.overview ? toPlainText(page.overview) : (await parent).description,
    alternates: {canonical: `/${slug}`},
    openGraph: {images: [{url: ogImage, width: 1200, height: 630}]},
    twitter: {card: 'summary_large_image', images: [ogImage]},
  }
}

function personMetadata(person: NonNullable<PersonBySlugQueryResult>, slug: string): Metadata {
  const name = stegaClean(person.name ?? '')
  const role = stegaClean(person.role ?? '')
  const title = stegaClean(person.seoTitle ?? '') || [name, role].filter(Boolean).join(' · ')
  const description =
    stegaClean(person.seoDescription ?? '') || stegaClean(person.headline ?? '') || undefined
  const shareImage =
    urlForOpenGraphImage(person.ogImage) ||
    urlForOpenGraphImage(person.photo) ||
    ogImageUrl({title, eyebrow: role || name})

  return {
    title: {absolute: title},
    description,
    alternates: {canonical: `/${slug}`},
    openGraph: {
      title,
      description,
      images: [{url: shareImage, width: 1200, height: 630}],
    },
    twitter: {card: 'summary_large_image', images: [shareImage]},
  }
}

export async function generateStaticParams() {
  const [{data: pages}, {data: people}] = await Promise.all([
    sanityFetch({
      query: slugsByTypeQuery,
      params: {type: 'page'},
      stega: false,
      perspective: 'published',
    }),
    sanityFetch({
      query: personSlugsQuery,
      stega: false,
      perspective: 'published',
    }),
  ])

  const slugs = new Set<string>()
  for (const item of pages ?? []) {
    if (item.slug) slugs.add(item.slug)
  }
  for (const item of people ?? []) {
    if (item.slug) slugs.add(item.slug)
  }
  return [...slugs].map((slug) => ({slug}))
}

export default async function PageSlugRoute({params}: Props) {
  const {slug} = await params
  const {data: person} = await sanityFetch({query: personBySlugQuery, params: {slug}})

  if (person?._id) {
    const {data: home} = await sanityFetch({query: homePageQuery})
    const name = stegaClean(person.name ?? 'About')
    const description =
      stegaClean(person.seoDescription ?? '') ||
      stegaClean(person.headline ?? '') ||
      undefined
    const image =
      urlForOpenGraphImage(person.ogImage) || urlForOpenGraphImage(person.photo) || undefined
    const speakableSelectors = ['h1', '.person-headline', '.person-bio']

    return (
      <>
        <PersonStructuredData
          name={name}
          jobTitle={stegaClean(person.role ?? '') || undefined}
          url={`/${slug}`}
          image={image}
          email={stegaClean(person.email ?? '') || undefined}
          sameAs={person.linkedinUrl ? [person.linkedinUrl] : undefined}
          description={description}
        />
        <SpeakableWebPage
          name={name}
          description={description ?? name}
          url={`/${slug}`}
          speakableSelectors={speakableSelectors}
        />
        <BreadcrumbStructuredData
          items={[
            {name: 'Home', url: '/'},
            {name, url: `/${slug}`},
          ]}
        />
        <HomePage data={home} />
      </>
    )
  }

  const {data} = await sanityFetch({query: pagesBySlugQuery, params})

  // Only show the 404 page if we're in production, when in draft mode we might be about to create a page on this slug, and live reload won't work on the 404 route
  if (!data?._id && !(await draftMode()).isEnabled) {
    notFound()
  }

  const {body, overview, title} = data ?? {}

  return (
    <div>
      {data?._id ? (
        <BreadcrumbStructuredData
          items={[
            {name: 'Home', url: '/'},
            {name: title || 'Page', url: `/${slug}`},
          ]}
        />
      ) : null}
      <div className="mb-14">
        <Header
          id={data?._id || null}
          type={data?._type || null}
          path={['overview']}
          title={title || (data?._id ? 'Untitled' : '404 Page Not Found')}
          description={overview}
        />

        {body && (
          <CustomPortableText
            id={data?._id || null}
            type={data?._type || null}
            path={['body']}
            paragraphClasses="font-serif max-w-3xl text-gray-600 text-xl"
            value={body as unknown as PortableTextBlock[]}
          />
        )}
      </div>
      <div className="absolute left-0 w-screen border-t" />
    </div>
  )
}
