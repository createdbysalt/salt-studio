import {
  filterProjectsWithVideo,
  withWorkPosters,
  type WorkProjectCard,
} from '@/components/ProjectGrid'
import {WorkCatalog} from '@/components/WorkCatalog'
import {CorePageSchema, ogImageUrl} from '@/lib/seo'
import {resolveWorkPills} from '@/lib/work-pills'
import {sanityFetch} from '@/sanity/lib/live'
import {allProjectsQuery, workCategoriesQuery, workPageQuery} from '@/sanity/lib/queries'
import {urlForOpenGraphImage} from '@/sanity/lib/utils'
import type {Metadata} from 'next'
import {stegaClean} from 'next-sanity'

export async function generateMetadata(): Promise<Metadata> {
  const {data} = await sanityFetch({query: workPageQuery, stega: false})

  const ogImage = data?.ogImage
    ? urlForOpenGraphImage(data.ogImage)
    : ogImageUrl({title: data?.headline ?? 'Work', subtitle: data?.seoDescription})

  return {
    title: data?.seoTitle ? {absolute: data.seoTitle} : 'Work',
    description: data?.seoDescription ?? undefined,
    openGraph: {
      title: data?.seoTitle ?? data?.headline ?? 'Work',
      description: data?.seoDescription ?? undefined,
      images: ogImage ? [{url: ogImage, width: 1200, height: 630}] : [],
    },
    twitter: {card: 'summary_large_image', images: ogImage ? [ogImage] : []},
  }
}

/**
 * Resolve the grid order from the workPage `projectSource` control. "manual"
 * uses the hand-picked list; the auto modes reorder the full catalog (which the
 * query already returns newest-first).
 */
function resolveProjects(
  projectSource: string | null | undefined,
  curated: Array<WorkProjectCard | null> | null | undefined,
  all: WorkProjectCard[],
): WorkProjectCard[] {
  switch (projectSource) {
    case 'manual':
      return filterProjectsWithVideo(curated ?? [])
    case 'featured':
      // Stable sort keeps the newest-first order within each group.
      return filterProjectsWithVideo(
        [...all].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))),
      )
    case 'az':
      return filterProjectsWithVideo(
        [...all].sort((a, b) =>
          (stegaClean(a.title) ?? '').localeCompare(stegaClean(b.title) ?? ''),
        ),
      )
    default:
      return filterProjectsWithVideo(all)
  }
}

export default async function WorkIndexRoute() {
  const [{data: page}, {data: allProjects}, {data: categories}] = await Promise.all([
    sanityFetch({query: workPageQuery}),
    sanityFetch({query: allProjectsQuery}),
    sanityFetch({query: workCategoriesQuery}),
  ])

  const headline = page?.headline ?? 'All Projects'
  const subhead = page?.subhead ?? 'Filter by specialty — or scroll the whole thing.'
  const description = page?.seoDescription ?? 'Selected commercial video and photography work.'
  const speakable = page?.speakableSummary ?? undefined
  const speakableSelectors = speakable ? ['h1', '.speakable-summary'] : ['h1']

  const projects = await withWorkPosters(
    resolveProjects(page?.projectSource, page?.curatedProjects, allProjects ?? []),
  )
  const pills = resolveWorkPills(page?.pillSource, page?.categoryPills, categories ?? [])

  return (
    <main data-theme="dark" className="bg-background text-foreground pb-24">
      <CorePageSchema
        breadcrumbs={[
          {name: 'Home', url: '/'},
          {name: 'Work', url: '/work'},
        ]}
        name={headline}
        description={speakable ?? description}
        url="/work"
        speakableSelectors={speakableSelectors}
      />

      <header className="px-5 pt-10 md:px-6 md:pt-14">
        <h1 className="font-sans text-4xl font-bold uppercase leading-[0.95] tracking-tight text-white lg:text-5xl">
          {headline}
        </h1>
        {subhead ? (
          <p className="mt-4 max-w-xl font-mono text-[11px] uppercase leading-[1.7] tracking-[0.08em] text-white/70 md:text-[12px]">
            {subhead}
          </p>
        ) : null}
        {speakable ? <p className="sr-only speakable-summary">{speakable}</p> : null}
      </header>

      <WorkCatalog
        projects={projects}
        emptyState={page?.emptyState}
        categories={pills}
        videoPlayback={page?.videoPlayback}
      />
    </main>
  )
}
