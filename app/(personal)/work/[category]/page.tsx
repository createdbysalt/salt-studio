import {filterProjectsWithVideo, withWorkPosters} from '@/components/ProjectGrid'
import {Reveal} from '@/components/Reveal'
import {WorkCatalog} from '@/components/WorkCatalog'
import {WorkFilterHeadline} from '@/components/WorkFilterHeadline'
import {CorePageSchema, generateServiceSchema, ogImageUrl} from '@/lib/seo'
import {resolveWorkPills} from '@/lib/work-pills'
import {compareFeaturedThenRecent} from '@/lib/work-sort'
import {sanityFetch} from '@/sanity/lib/live'
import {
  projectsByCategoryQuery,
  slugsByTypeQuery,
  workCategoriesQuery,
  workCategoryBySlugQuery,
  workPageQuery,
} from '@/sanity/lib/queries'
import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import {notFound} from 'next/navigation'

type Props = {params: Promise<{category: string}>}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: slugsByTypeQuery,
    params: {type: 'workCategory'},
    stega: false,
    perspective: 'published',
  })
  return (data ?? []).map(({slug}) => ({category: slug}))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {category} = await params
  const {data} = await sanityFetch({
    query: workCategoryBySlugQuery,
    params: {slug: category},
    stega: false,
  })
  if (!data) return {}

  const title = data.headline ?? data.filterLabel ?? 'Work'
  const ogImage = ogImageUrl()

  return {
    title: data.seoTitle ? {absolute: data.seoTitle} : title,
    description: data.seoDescription ?? undefined,
    alternates: {canonical: `/work/${category}`},
    openGraph: {
      title: data.seoTitle ?? title,
      description: data.seoDescription ?? undefined,
      images: [{url: ogImage, width: 1200, height: 630}],
    },
    twitter: {card: 'summary_large_image', images: [ogImage]},
  }
}

export default async function WorkCategoryRoute({params}: Props) {
  const {category} = await params
  const [{data: categoryDoc}, {data: projects}, {data: page}, {data: categories}] =
    await Promise.all([
      sanityFetch({query: workCategoryBySlugQuery, params: {slug: category}}),
      sanityFetch({query: projectsByCategoryQuery, params: {slug: category}}),
      sanityFetch({query: workPageQuery}),
      sanityFetch({query: workCategoriesQuery}),
    ])

  if (!categoryDoc?._id && !(await draftMode()).isEnabled) {
    notFound()
  }
  if (!categoryDoc) return null

  const headline = categoryDoc.headline ?? categoryDoc.filterLabel ?? 'Work'
  const subhead = categoryDoc.subhead ?? undefined
  const description =
    categoryDoc.seoDescription ?? `${categoryDoc.filterLabel ?? 'Selected'} work by Salt Studio.`

  const pills = resolveWorkPills(
    page?.pillSource,
    page?.categoryPills,
    categories ?? [],
    new Set((categories ?? []).map((category) => category.slug).filter((slug): slug is string => Boolean(slug))),
  )

  return (
    <main className="bg-background text-foreground pb-24">
      <CorePageSchema
        breadcrumbs={[
          {name: 'Home', url: '/'},
          {name: 'Work', url: '/work'},
          {name: categoryDoc.filterLabel ?? headline, url: `/work/${categoryDoc.slug}`},
        ]}
        name={headline}
        description={description}
        url={`/work/${categoryDoc.slug}`}
        speakableSelectors={subhead ? ['h1', '.speakable-summary'] : ['h1']}
        primarySchema={generateServiceSchema({
          name: categoryDoc.filterLabel ?? headline,
          description,
          url: `/work/${categoryDoc.slug}`,
          serviceType: `${categoryDoc.filterLabel ?? 'Web'} design and development`,
          areaServed: 'Worldwide',
        })}
      />

      <header className="page-chrome pt-28 text-center md:pt-36">
        <h1 className="sr-only">{headline}</h1>

        <Reveal immediate>
          <p className="mb-[14px] font-sans text-[13px] tracking-[-0.01em] text-foreground/45 md:mb-[18px] md:text-[14px]">
            Filter by
          </p>
          <WorkFilterHeadline
            allLabel={page?.headline ?? 'All Work'}
            categories={pills}
            activeSlug={categoryDoc.slug}
          />
        </Reveal>
        {subhead ? <p className="sr-only speakable-summary">{subhead}</p> : null}
      </header>

      <WorkCatalog
        projects={await withWorkPosters(
          filterProjectsWithVideo([...(projects ?? [])].sort(compareFeaturedThenRecent)),
        )}
        emptyState={page?.emptyState}
        videoPlayback={page?.videoPlayback}
      />
    </main>
  )
}
