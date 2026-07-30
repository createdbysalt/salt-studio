import {CustomPortableText} from '@/components/CustomPortableText'
import {Header} from '@/components/Header'
import {BreadcrumbStructuredData, ogImageUrl} from '@/lib/seo'
import {sanityFetch} from '@/sanity/lib/live'
import {pagesBySlugQuery, slugsByTypeQuery} from '@/sanity/lib/queries'
import type {Metadata, ResolvingMetadata} from 'next'
import {toPlainText, type PortableTextBlock} from 'next-sanity'
import {draftMode} from 'next/headers'
import {notFound} from 'next/navigation'

type Props = {
  params: Promise<{slug: string}>
}

export async function generateMetadata(
  {params}: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const {data: page} = await sanityFetch({
    query: pagesBySlugQuery,
    params,
    stega: false,
  })

  const {slug} = await params
  const ogImage = ogImageUrl()

  return {
    title: page?.title,
    description: page?.overview ? toPlainText(page.overview) : (await parent).description,
    alternates: {canonical: `/${slug}`},
    openGraph: {images: [{url: ogImage, width: 1200, height: 630}]},
    twitter: {card: 'summary_large_image', images: [ogImage]},
  }
}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: slugsByTypeQuery,
    params: {type: 'page'},
    stega: false,
    perspective: 'published',
  })
  return data
}

export default async function PageSlugRoute({params}: Props) {
  const {data} = await sanityFetch({query: pagesBySlugQuery, params})

  // Only show the 404 page if we're in production, when in draft mode we might be about to create a page on this slug, and live reload won't work on the 404 route
  if (!data?._id && !(await draftMode()).isEnabled) {
    notFound()
  }

  const {body, overview, title} = data ?? {}
  const {slug} = await params

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
        {/* Header */}
        <Header
          id={data?._id || null}
          type={data?._type || null}
          path={['overview']}
          title={title || (data?._id ? 'Untitled' : '404 Page Not Found')}
          description={overview}
        />

        {/* Body */}
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
