import {
  getCaseScope,
  getCaseStats,
  hasCaseMedia,
  hasCaseSidebar,
  ProjectCaseMedia,
  ProjectCaseSidebar,
} from '@/components/ProjectCaseSections'
import {withWorkPosters, type WorkProjectCard} from '@/components/ProjectGrid'
import {formatProjectYearMark} from '@/components/ProjectHeroMeta'
import {ProjectNextSection} from '@/components/ProjectNextSection'
import {ProjectScrollGallery, type ProjectScrollFrame} from '@/components/ProjectScrollGallery'
import {ProjectStatsReveal} from '@/components/ProjectStatsReveal'
import {ProjectTestimonialRotator} from '@/components/ProjectTestimonialRotator'
import {ProjectWatchVideoButton} from '@/components/ProjectWatchVideoButton'
import {fetchVimeoPoster, isVimeoUrl} from '@/lib/vimeo'
import type {ProjectBySlugQueryResult} from '@/sanity.types'
import {studioUrl} from '@/sanity/lib/api'
import {sanityFetch} from '@/sanity/lib/live'
import {nextProjectsQuery} from '@/sanity/lib/queries'
import {urlForImage} from '@/sanity/lib/utils'
import {ArrowUpRight} from 'lucide-react'
import {createDataAttribute, stegaClean} from 'next-sanity'
import Link from 'next/link'
import type {ReactNode} from 'react'

type Project = NonNullable<ProjectBySlugQueryResult>

const SIDE_LABEL =
  'font-sans text-[13px] font-bold uppercase tracking-[-0.02em] text-foreground/40 md:text-[14px]'
const SIDE_BODY =
  'mt-2 max-w-lg font-sans text-[16px] font-semibold leading-[1.35] tracking-[-0.02em] text-foreground/90 md:text-[17px]'
const META_LABEL = 'font-sans text-[13px] font-medium text-foreground/40 md:text-[14px]'
const META_VALUE =
  'text-right font-sans text-[13px] font-medium tracking-[-0.02em] text-foreground/85 md:text-[14px]'

function MetaRow({label, children}: {label: string; children: ReactNode}) {
  if (!children) return null
  return (
    <div className="flex items-start justify-between gap-6 border-t border-foreground/15 py-3 first:border-t-0">
      <dt className={META_LABEL}>{label}</dt>
      <dd className={META_VALUE}>{children}</dd>
    </div>
  )
}

async function resolveLeadPoster(project: Project): Promise<string | null> {
  if (project.coverImage?.asset?._ref) {
    return urlForImage(project.coverImage)?.width(1920).height(1080).fit('crop').url() ?? null
  }

  const video = project.videoUrl ? stegaClean(project.videoUrl).trim() : null
  if (video && isVimeoUrl(video)) {
    return (await fetchVimeoPoster(video)) ?? null
  }

  return null
}

type GalleryMediaItem =
  | {
      _key: string
      _type: 'projectGalleryPhoto'
      image?: Extract<ProjectScrollFrame, {kind: 'photo'}>['image']
    }
  | {
      _key: string
      _type: 'projectGalleryVideo'
      videoUrl?: string | null
      videoFileUrl?: string | null
      poster?: Extract<ProjectScrollFrame, {kind: 'video'}>['poster']
      caption?: string | null
    }

/** Flat Photo/Video items, or legacy 1-/2-column rows — normalize for the scroll stack. */
function flattenProjectGallery(
  entries: Project['gallery'] | Project['btsImages'],
): GalleryMediaItem[] {
  const out: GalleryMediaItem[] = []
  for (const entry of entries ?? []) {
    if (!entry) continue
    if (entry._type === 'projectGalleryPhoto' || entry._type === 'projectGalleryVideo') {
      out.push(entry as GalleryMediaItem)
      continue
    }
    const items = 'items' in entry ? entry.items : null
    for (const item of items ?? []) {
      if (!item) continue
      if (item._type === 'projectGalleryPhoto' || item._type === 'projectGalleryVideo') {
        out.push(item as GalleryMediaItem)
      }
    }
  }
  return out
}

function toWorkCards(
  projects: Array<{
    _id: string
    title?: string | null
    slug?: string | null
    coverImage?: WorkProjectCard['coverImage']
    videoUrl?: string | null
    year?: string | null
    client?: string | null
  } | null>,
): WorkProjectCard[] {
  return projects
    .filter((p): p is NonNullable<typeof p> => Boolean(p?.slug && stegaClean(p.slug).trim()))
    .map((p) => ({
      _id: p._id,
      title: p.title ?? null,
      slug: p.slug ?? null,
      coverImage: p.coverImage ?? null,
      videoUrl: p.videoUrl ?? null,
      year: p.year ?? null,
      client: typeof p.client === 'string' ? p.client : null,
    }))
}

export async function ProjectDetail({data}: {data: Project | null}) {
  const dataAttribute =
    data?._id && data._type
      ? createDataAttribute({baseUrl: studioUrl, id: data._id, type: data._type})
      : null

  const project = data
  if (!project) return null

  const isCaseStudy = stegaClean(project.projectType) === 'case-study'
  const clientName = project.client?.name ? stegaClean(project.client.name) : null
  const categoryItems = (project.categories ?? [])
    .map((cat) => (cat?.filterLabel ? stegaClean(cat.filterLabel).trim() : ''))
    .filter(Boolean)
  const roleText = project.role ? stegaClean(project.role).trim() : ''
  const yearMark = formatProjectYearMark(project.year)
  const yearDisplay = project.year ? stegaClean(project.year).trim() : yearMark

  const title = project.title
    ? stegaClean(project.title).trim() || 'Untitled project'
    : 'Untitled project'
  const hasCover = Boolean(project.coverImage?.asset?._ref)
  const cleanVideo = project.videoUrl ? stegaClean(project.videoUrl).trim() || null : null
  const cleanSite = project.site ? stegaClean(project.site).trim() || null : null
  const siteButtonLabel =
    (project.siteButtonLabel ? stegaClean(project.siteButtonLabel).trim() : '').replace(
      /[→\s]+$/,
      '',
    ) || 'Visit site'
  const hasLeadMedia = Boolean(cleanVideo || hasCover)
  const leadPosterUrl = await resolveLeadPoster(project)

  const contextText = project.context ? stegaClean(project.context).trim() : ''
  const briefText = project.brief ? stegaClean(project.brief).trim() : ''
  const approachText = project.approach ? stegaClean(project.approach).trim() : ''
  const resultText = project.result ? stegaClean(project.result).trim() : ''
  const btsNoteText = project.btsNote ? stegaClean(project.btsNote).trim() : ''

  // Glitch&Grit Idea / Insight — case-study brief/approach first; context fills gaps.
  const ideaText = briefText || contextText
  const insightText = approachText || (briefText && contextText ? contextText : '') || btsNoteText

  const galleryItems = flattenProjectGallery(project.gallery)
  const btsItems = flattenProjectGallery(project.btsImages)

  const scrollFrames: ProjectScrollFrame[] = []
  if (hasLeadMedia) {
    scrollFrames.push({
      key: 'lead',
      kind: 'lead',
      title,
      coverImage: project.coverImage,
      videoUrl: project.videoUrl,
      posterUrl: leadPosterUrl,
    })
  }
  for (const item of [...galleryItems, ...btsItems]) {
    if (item._type === 'projectGalleryPhoto' && item.image?.asset) {
      scrollFrames.push({
        key: item._key,
        kind: 'photo',
        image: item.image,
      })
    } else if (item._type === 'projectGalleryVideo') {
      const url = item.videoUrl ? stegaClean(item.videoUrl).trim() : ''
      const fileUrl = item.videoFileUrl ? stegaClean(item.videoFileUrl).trim() : ''
      if (!url && !fileUrl) continue
      scrollFrames.push({
        key: item._key,
        kind: 'video',
        title,
        videoUrl: item.videoUrl,
        videoFileUrl: item.videoFileUrl,
        poster: item.poster,
        caption: item.caption,
      })
    }
  }
  const showScrollGallery = scrollFrames.length > 0

  const testimonials =
    project.showTestimonials !== false
      ? (project.testimonials ?? []).filter((t) => {
          const quote = t?.quote ? stegaClean(t.quote).trim() : ''
          return Boolean(quote)
        })
      : []
  const showTestimonials = isCaseStudy && testimonials.length > 0

  const relatedFromDoc = toWorkCards(
    (project.relatedProjects ?? []).filter((p) => p?.hidden !== true),
  )
  const relatedIds = new Set(relatedFromDoc.map((p) => p._id))
  let nextSource = relatedFromDoc
  if (nextSource.length < 3 && project.slug) {
    const {data: fallback} = await sanityFetch({
      query: nextProjectsQuery,
      params: {slug: stegaClean(project.slug)},
      stega: false,
    })
    const extras = toWorkCards(fallback ?? []).filter((p) => !relatedIds.has(p._id))
    nextSource = [...nextSource, ...extras].slice(0, 3)
  }
  const nextProjects = (
    await withWorkPosters(
      nextSource.map((p, i) => ({
        ...p,
        indexMark: String(i + 1).padStart(2, '0'),
      })),
    )
  ).filter((p): p is WorkProjectCard => Boolean(p))

  const stackNames = (project.stack ?? [])
    .map((item) => (item?.name ? stegaClean(item.name).trim() : ''))
    .filter(Boolean)

  const hasSidebarSections = hasCaseSidebar(project.sections)
  const hasMediaSections = hasCaseMedia(project.sections)
  const caseStats = getCaseStats(project.sections)
  const caseScope = getCaseScope(project.sections)
  const deliverableTerms = (caseScope?.items ?? [])
    .map((it) => (it.title ? stegaClean(it.title).trim() : ''))
    .filter(Boolean)
  const showSidebarCopy = hasSidebarSections || Boolean(ideaText || insightText || resultText)
  const showMeta = Boolean(
    clientName ||
    yearDisplay ||
    roleText ||
    categoryItems.length ||
    stackNames.length ||
    deliverableTerms.length,
  )

  return (
    <article className="bg-background text-foreground">
      {/* 1. Type hero — categories + massive title (Glitch&Grit masthead). */}
      <header aria-label="Project hero" className="px-5 pt-28 text-center md:px-6 md:pt-32">
        {categoryItems.length > 0 ? (
          <ul className="flex flex-col items-center gap-0.5">
            {categoryItems.map((item) => (
              <li
                key={item}
                className="font-sans text-[12px] font-bold uppercase tracking-[-0.02em] text-foreground/55 md:text-[13px]"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-sans text-[12px] font-bold uppercase tracking-[-0.02em] text-foreground/55 md:text-[13px]">
            {isCaseStudy ? 'Case study' : 'Project'}
          </p>
        )}
        <h1
          data-sanity={dataAttribute?.('title')}
          className={`mx-auto mt-3.5 w-full max-w-[16ch] font-sans text-[clamp(2.5rem,11vw,11rem)] font-bold uppercase leading-[0.85] tracking-[-0.05em] text-foreground md:mt-4 ${
            caseStats.length > 0 ? 'mb-2.5 md:mb-3' : 'mb-6 md:mb-0'
          }`}
        >
          {title}
        </h1>
        {caseStats.length > 0 ? (
          <div className="mx-auto mt-4 w-full px-2 pb-5 md:mt-0 md:pb-6">
            <ProjectStatsReveal items={caseStats} />
          </div>
        ) : null}
      </header>

      {/* 2. Sticky sidebar + right-edge-bleed media stack */}
      <section
        aria-label="Project details"
        className={`grid grid-cols-1 items-start gap-5 pb-16 pl-5 pr-5 md:gap-6 md:pb-24 md:pl-6 md:pr-6 lg:grid-cols-[minmax(20rem,28rem)_minmax(0,1fr)] lg:gap-x-10 lg:gap-y-0 lg:pl-[30px] lg:pr-0 xl:grid-cols-[minmax(22rem,32rem)_minmax(0,1fr)] xl:gap-x-14 ${
          caseStats.length > 0 ? 'mt-0' : 'mt-4 md:mt-10 lg:mt-16'
        }`}
      >
        {/* Below lg: gallery first (order-1), then sidebar copy. At lg+: sidebar left, gallery right. */}
        <aside className="order-2 min-w-0 lg:order-1 lg:sticky lg:top-28 lg:self-start lg:pb-8">
          {hasSidebarSections ? (
            <ProjectCaseSidebar sections={project.sections} />
          ) : showSidebarCopy ? (
            <div className="space-y-5 md:space-y-6 lg:space-y-10">
              {ideaText ? (
                <div>
                  <p className={SIDE_LABEL}>Idea</p>
                  <p
                    data-sanity={dataAttribute?.(briefText ? 'brief' : 'context')}
                    className={`project-summary ${SIDE_BODY}`}
                  >
                    {ideaText}
                  </p>
                </div>
              ) : null}
              {insightText ? (
                <div>
                  <p className={SIDE_LABEL}>Insight</p>
                  <p
                    data-sanity={dataAttribute?.(approachText ? 'approach' : 'context')}
                    className={SIDE_BODY}
                  >
                    {insightText}
                  </p>
                </div>
              ) : null}
              {resultText ? (
                <div className="results">
                  <p className={SIDE_LABEL}>Result</p>
                  <p data-sanity={dataAttribute?.('result')} className={SIDE_BODY}>
                    {resultText}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {showMeta ? (
            <dl
              className={`${showSidebarCopy ? 'mt-10 md:mt-12' : ''} border-b border-foreground/15`}
            >
              <MetaRow label="Client">
                {clientName ? (
                  project.client?.website ? (
                    <a
                      href={project.client.website}
                      target="_blank"
                      rel="noreferrer"
                      className="transition-opacity hover:opacity-70"
                    >
                      {clientName}
                    </a>
                  ) : (
                    clientName
                  )
                ) : null}
              </MetaRow>
              <MetaRow label="Year">{yearDisplay}</MetaRow>
              <MetaRow label="Role">{roleText || null}</MetaRow>
              <MetaRow label="Execution">
                {categoryItems.length ? (
                  <span className="inline-block max-w-[14rem]">{categoryItems.join(', ')}</span>
                ) : null}
              </MetaRow>
              <MetaRow label="Built with">
                {stackNames.length ? (
                  <span className="inline-block max-w-[14rem]">{stackNames.join(', ')}</span>
                ) : null}
              </MetaRow>
              <MetaRow label="Deliverables">
                {deliverableTerms.length ? (
                  <span className="inline-block max-w-[14rem]">{deliverableTerms.join(', ')}</span>
                ) : null}
              </MetaRow>
            </dl>
          ) : null}

          {cleanSite || cleanVideo ? (
            <div className="mt-3 flex flex-wrap items-center gap-3 md:mt-4">
              {/* Prefer live site; Watch film only when there is no site URL. */}
              {cleanSite ? (
                <a
                  href={cleanSite}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-sanity={dataAttribute?.('siteButtonLabel')}
                  className="group inline-flex items-center gap-1.5 border-b border-foreground/25 pb-0.5 font-mono text-[11px] font-medium uppercase tracking-label text-foreground/70 transition-colors duration-300 hover:border-foreground hover:text-foreground"
                >
                  {siteButtonLabel}
                  <ArrowUpRight
                    aria-hidden
                    className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={2.25}
                  />
                </a>
              ) : (
                <ProjectWatchVideoButton
                  title={title}
                  videoUrl={project.videoUrl}
                  className="w-full justify-center md:w-auto"
                />
              )}
            </div>
          ) : null}
        </aside>

        <div className="order-1 min-w-0 lg:order-2">
          {showScrollGallery ? (
            <section aria-label="Project gallery" className="-mx-5 md:-mx-6 lg:mx-0">
              <ProjectScrollGallery frames={scrollFrames} />
            </section>
          ) : null}

          {hasMediaSections ? (
            <section aria-label="Case study media" className="-mx-5 md:-mx-6 lg:mx-0">
              <ProjectCaseMedia sections={project.sections} title={title} />
            </section>
          ) : null}

          {showTestimonials ? (
            <div className="border-t border-foreground/10 py-14 pr-5 md:py-16 md:pr-6 lg:pr-6">
              <ProjectTestimonialRotator items={testimonials} />
              <div className="mt-8">
                <Link href="/contact" className="btn-ghost">
                  Reach out →
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* 3. Next project rail */}
      <ProjectNextSection projects={nextProjects} />
    </article>
  )
}
