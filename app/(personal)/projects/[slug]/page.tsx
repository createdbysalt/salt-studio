import {ProjectDetail} from '@/components/ProjectDetail'
import {
  BreadcrumbStructuredData,
  CreativeWorkStructuredData,
  ogImageUrl,
  SpeakableWebPage,
} from '@/lib/seo'
import {sanityFetch} from '@/sanity/lib/live'
import {projectBySlugQuery, slugsByTypeQuery} from '@/sanity/lib/queries'
import {urlForImage, urlForOpenGraphImage} from '@/sanity/lib/utils'
import type {Metadata, ResolvingMetadata} from 'next'
import {stegaClean, toPlainText} from 'next-sanity'
import {draftMode} from 'next/headers'
import {notFound} from 'next/navigation'

type Props = {
  params: Promise<{slug: string}>
}

export async function generateMetadata(
  {params}: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const {data: project} = await sanityFetch({
    query: projectBySlugQuery,
    params,
    stega: false,
  })
  // Per-project card: honor an uploaded share image, else auto-generate a title card.
  const kind = project?.projectType === 'case-study' ? 'Case study' : 'Project'
  const year = project?.year ? stegaClean(project.year).trim() : ''
  const eyebrow = year ? `${kind} · ${year}` : kind
  const ogImage = project?.ogImage?.asset
    ? (urlForOpenGraphImage(project.ogImage) ?? ogImageUrl({title: project?.title, eyebrow}))
    : ogImageUrl({title: project?.title, eyebrow})
  const description =
    project?.seoDescription ||
    project?.context ||
    (project?.overview ? toPlainText(project.overview) : (await parent).description)

  const {slug} = await params

  return {
    title: project?.seoTitle || project?.title,
    description: description ?? undefined,
    alternates: {canonical: `/projects/${slug}`},
    openGraph: {
      images: [{url: ogImage, width: 1200, height: 630}],
    },
    twitter: {card: 'summary_large_image', images: [ogImage]},
  }
}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: slugsByTypeQuery,
    params: {type: 'project'},
    stega: false,
    perspective: 'published',
  })
  return data
}

export default async function ProjectSlugRoute({params}: Props) {
  const {slug} = await params
  const {data} = await sanityFetch({query: projectBySlugQuery, params: {slug}})

  // Coming-soon / hidden projects stay in Studio but are not public pages.
  if ((!data?._id || data?.comingSoon || data?.hidden) && !(await draftMode()).isEnabled) {
    notFound()
  }

  const clientName = data?.client?.name ? stegaClean(data.client.name) : undefined
  const title = data?.title ?? 'Project'
  const description =
    data?.seoDescription ||
    data?.context ||
    (data?.overview ? toPlainText(data.overview) : undefined)
  const ogImage = urlForImage(data?.coverImage)?.width(1200).height(630).url()
  const speakable = data?.speakableSummary || data?.context || undefined
  const keywords = (data?.categories ?? [])
    .map((cat) => (cat?.filterLabel ? stegaClean(cat.filterLabel).trim() : ''))
    .filter(Boolean)

  return (
    <main data-theme="dark" className="bg-background text-foreground">
      <BreadcrumbStructuredData
        items={[
          {name: 'Home', url: '/'},
          {name: 'Work', url: '/work'},
          {name: title, url: `/projects/${slug}`},
        ]}
      />
      {description ? (
        <CreativeWorkStructuredData
          name={title}
          description={description}
          url={`/projects/${slug}`}
          image={ogImage}
          client={clientName}
          keywords={keywords.length ? keywords : undefined}
        />
      ) : null}
      {speakable ? (
        <SpeakableWebPage
          name={title}
          description={speakable}
          url={`/projects/${slug}`}
          speakableSelectors={['h1', '.project-summary', '.results']}
        />
      ) : null}
      <ProjectDetail data={data} />
    </main>
  )
}
