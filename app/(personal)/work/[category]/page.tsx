import {filterProjectsWithVideo, withWorkPosters} from '@/components/ProjectGrid'
import {WorkCatalog} from '@/components/WorkCatalog'
import {CorePageSchema, generateServiceSchema, ogImageUrl} from '@/lib/seo'
import {resolveWorkPills} from '@/lib/work-pills'
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
  const ogImage = ogImageUrl({title: data.seoTitle ?? title, subtitle: data.seoDescription})

  return {
    title: data.seoTitle ? {absolute: data.seoTitle} : title,
    description: data.seoDescription ?? undefined,
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

  const pills = resolveWorkPills(page?.pillSource, page?.categoryPills, categories ?? [])

  return (
    <main data-theme="dark" className="bg-background text-foreground pb-24">
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

      <header className="px-5 pt-10 md:px-6 md:pt-14">
        <h1 className="font-sans text-4xl font-bold uppercase leading-[0.95] tracking-tight text-white lg:text-5xl">
          {headline}
        </h1>
        {subhead ? (
          <p className="speakable-summary mt-4 max-w-xl font-mono text-[11px] uppercase leading-[1.7] tracking-[0.08em] text-white/70 md:text-[12px]">
            {subhead}
          </p>
        ) : null}
      </header>

      <WorkCatalog
        projects={await withWorkPosters(filterProjectsWithVideo(projects ?? []))}
        emptyState={page?.emptyState}
        categories={pills}
        activeSlug={categoryDoc.slug}
        videoPlayback={page?.videoPlayback}
      />
    </main>
  )
}
