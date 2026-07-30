import {
  filterProjectsWithVideo,
  withWorkPosters,
  type WorkProjectCard,
} from '@/components/ProjectGrid'
import {Reveal} from '@/components/Reveal'
import {WorkCatalog} from '@/components/WorkCatalog'
import {WorkFilterHeadline} from '@/components/WorkFilterHeadline'
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
  const visibleCurated = (curated ?? []).filter(
    (project): project is WorkProjectCard =>
      Boolean(project?._id) &&
      project?.hidden !== true &&
      (Boolean(project?.coverImage?.asset) || Boolean(project?.videoUrl)),
  )

  switch (projectSource) {
    case 'manual':
      return filterProjectsWithVideo(visibleCurated)
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

  const headline = page?.headline ?? 'All Work'
  const description = page?.seoDescription ?? 'Selected commercial video and photography work.'
  const speakable = page?.speakableSummary ?? undefined
  const speakableSelectors = speakable ? ['h1', '.speakable-summary'] : ['h1']

  const projects = await withWorkPosters(
    resolveProjects(page?.projectSource, page?.curatedProjects, allProjects ?? []),
  )
  const pills = resolveWorkPills(page?.pillSource, page?.categoryPills, categories ?? [])

  return (
    <main className="bg-background text-foreground pb-24">
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

      <header className="page-chrome pt-28 text-center md:pt-36">
        <h1 className="sr-only">{headline}</h1>
        {speakable ? <p className="sr-only speakable-summary">{speakable}</p> : null}

        <Reveal immediate>
          {pills.length > 0 ? (
            <p className="mb-[14px] font-sans text-[13px] tracking-[-0.01em] text-foreground/45 md:mb-[18px] md:text-[14px]">
              Filter by
            </p>
          ) : null}
          <WorkFilterHeadline allLabel={headline} categories={pills} activeSlug={null} />
        </Reveal>
      </header>

      <WorkCatalog
        projects={projects}
        emptyState={page?.emptyState}
        videoPlayback={page?.videoPlayback}
      />
    </main>
  )
}
