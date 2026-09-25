import {CustomPortableText} from '@/components/CustomPortableText'
import {Header} from '@/components/Header'
import {HomePage} from '@/components/HomePage'
import {LandingPage} from '@/components/LandingPage'
import {
  BreadcrumbStructuredData,
  CorePageSchema,
  generateServiceSchema,
  ogImageUrl,
  PersonStructuredData,
  SpeakableWebPage,
} from '@/lib/seo'
import type {LandingPageBySlugQueryResult, PersonBySlugQueryResult} from '@/sanity.types'
import {sanityFetch} from '@/sanity/lib/live'
import {
  homePageQuery,
  landingPageBySlugQuery,
  landingPageSlugsQuery,
  pagesBySlugQuery,
  personBySlugQuery,
  personSlugsQuery,
  slugsByTypeQuery,
} from '@/sanity/lib/queries'
import {urlForOpenGraphImage} from '@/sanity/lib/utils'
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

  const {data: landing} = await sanityFetch({
    query: landingPageBySlugQuery,
    params: {slug},
    stega: false,
  })

  if (landing?._id) {
    return landingMetadata(landing, slug)
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

/** Landing pages carry their own Search & Sharing fields; fall back to the hero headline. */
function landingMetadata(
  landing: NonNullable<LandingPageBySlugQueryResult>,
  slug: string,
): Metadata {
  const heroHeadline =
    landing.sections?.flatMap((section) =>
      section._type === 'lpHeroSection' && section.headline ? [section.headline] : [],
    )[0] ?? ''
  const title =
    stegaClean(landing.seoTitle ?? '') || stegaClean(heroHeadline) || landing.title || 'Salt Studio'
  const description =
    stegaClean(landing.seoDescription ?? '') ||
    stegaClean(landing.speakableSummary ?? '') ||
    undefined
  const shareImage =
    urlForOpenGraphImage(landing.ogImage) || ogImageUrl({title, eyebrow: 'Salt Studio'})

  return {
    title,
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

const AUDIENCE_LABEL: Record<string, string> = {
  churches: 'Churches',
  nonprofits: 'Nonprofits',
}

export async function generateStaticParams() {
  const [{data: pages}, {data: people}, {data: landingPages}] = await Promise.all([
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
    sanityFetch({
      query: landingPageSlugsQuery,
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
  for (const item of landingPages ?? []) {
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
      stegaClean(person.seoDescription ?? '') || stegaClean(person.headline ?? '') || undefined
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

  const {data: landing} = await sanityFetch({query: landingPageBySlugQuery, params: {slug}})

  if (landing?._id) {
    const heroHeadline =
      landing.sections?.flatMap((section) =>
        section._type === 'lpHeroSection' && section.headline ? [section.headline] : [],
      )[0] ?? ''
    const name =
      stegaClean(landing.seoTitle ?? '') ||
      stegaClean(heroHeadline) ||
      landing.title ||
      'Salt Studio'
    const description =
      stegaClean(landing.seoDescription ?? '') || stegaClean(landing.speakableSummary ?? '') || name
    const audience = AUDIENCE_LABEL[stegaClean(landing.audience ?? '')]
    const offers = (landing.offers ?? [])
      .filter((offer) => Boolean(offer?.name) && typeof offer?.price === 'number')
      .map((offer) => ({
        name: stegaClean(offer.name ?? ''),
        price: offer.price as number,
        description: offer.description ? stegaClean(offer.description) : undefined,
        billing: (offer.billing as 'one-time' | 'monthly' | null) ?? 'one-time',
      }))

    return (
      <>
        <CorePageSchema
          breadcrumbs={[
            {name: 'Home', url: '/'},
            {name, url: `/${slug}`},
          ]}
          name={name}
          description={description}
          url={`/${slug}`}
          speakableSelectors={['h1']}
          primarySchema={generateServiceSchema({
            name,
            description,
            url: `/${slug}`,
            serviceType: audience
              ? `Marketing and website design for ${audience.toLowerCase()}`
              : 'Marketing and website design',
            audience,
            areaServed: ['United States', 'Canada'],
            offers,
          })}
        />
        <LandingPage data={landing} />
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
