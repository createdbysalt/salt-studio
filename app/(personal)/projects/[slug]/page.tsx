import {ProjectDetail} from '@/components/ProjectDetail'
import {BreadcrumbStructuredData, CreativeWorkStructuredData, SpeakableWebPage} from '@/lib/seo'
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
  const ogImage =
    urlForOpenGraphImage(project?.ogImage) || urlForOpenGraphImage(project?.coverImage)
  const description =
    project?.seoDescription ||
    project?.context ||
    (project?.overview ? toPlainText(project.overview) : (await parent).description)

  return {
    title: project?.seoTitle || project?.title,
    description: description ?? undefined,
    openGraph: ogImage
      ? {
          images: [ogImage, ...((await parent).openGraph?.images || [])],
        }
      : {},
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

  // Coming-soon projects tease on the Work grid but have no detail page yet.
  if ((!data?._id || data?.comingSoon) && !(await draftMode()).isEnabled) {
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
