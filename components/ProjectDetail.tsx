import {ProjectAmbientBackground} from '@/components/ProjectAmbientBackground'
import {ProjectCardCorners} from '@/components/ProjectCardCorners'
import {ProjectCardMedia} from '@/components/ProjectCardMedia'
import {galleryHasContent, ProjectGallery} from '@/components/ProjectGallery'
import {withWorkPosters, type WorkProjectCard} from '@/components/ProjectGrid'
import {ProjectHero} from '@/components/ProjectHero'
import {formatProjectYearMark, ProjectHeroMeta} from '@/components/ProjectHeroMeta'
import {ProjectTestimonialRotator} from '@/components/ProjectTestimonialRotator'
import {ProjectWatchVideoButton} from '@/components/ProjectWatchVideoButton'
import {fetchVimeoPoster, isVimeoUrl} from '@/lib/vimeo'
import type {ProjectBySlugQueryResult} from '@/sanity.types'
import {studioUrl} from '@/sanity/lib/api'
import {sanityFetch} from '@/sanity/lib/live'
import {projectBodyBackgroundVideoQuery} from '@/sanity/lib/queries'
import {urlForImage} from '@/sanity/lib/utils'
import {createDataAttribute, stegaClean} from 'next-sanity'
import Link from 'next/link'

type Project = NonNullable<ProjectBySlugQueryResult>

const LABEL = 'font-mono text-[11px] uppercase tracking-[0.14em] text-white/45'
/** Case-study narrative blocks on dark — Pitch sans, sentence case. */
const NARRATIVE = 'font-sans text-lg leading-[1.65] text-white/80 md:text-xl'

function SectionTitle({children}: {children: string}) {
  return <p className={`${LABEL} mb-4`}>{children}</p>
}

function CraftCallout({rows}: {rows: Array<{label: string; value: string}>}) {
  if (!rows.length) return null

  return (
    <section>
      <SectionTitle>Craft</SectionTitle>
      <dl className="font-mono text-[11px] uppercase tracking-[0.14em]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[5.5rem_1fr] gap-4 border-t border-white/10 py-3 first:border-t-0"
          >
            <dt className="text-white/45">{row.label}</dt>
            <dd className="text-white/85">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

async function resolveHeroPoster(project: Project): Promise<string | null> {
  if (project.coverImage?.asset?._ref) {
    return urlForImage(project.coverImage)?.width(1920).height(1080).fit('crop').url() ?? null
  }

  const video = project.videoUrl ? stegaClean(project.videoUrl).trim() : null
  if (video && isVimeoUrl(video)) {
    return (await fetchVimeoPoster(video)) ?? null
  }

  return null
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
  const categories = project.categories ?? []
  const categoryLinks = categories.map((cat) => stegaClean(cat?.filterLabel)).filter(Boolean)
  const categoryItems = categoryLinks as string[]

  const services = (project.services ?? [])
    .map((s) => (s?.name ? stegaClean(s.name).trim() : ''))
    .filter(Boolean)
  const cameras = (project.cameras ?? [])
    .map((name) => (name ? stegaClean(name).trim() : ''))
    .filter(Boolean)
  const lenses = (project.lenses ?? [])
    .map((name) => (name ? stegaClean(name).trim() : ''))
    .filter(Boolean)
  const lighting = (project.lighting ?? [])
    .map((name) => (name ? stegaClean(name).trim() : ''))
    .filter(Boolean)
  const testimonials =
    project.showTestimonials !== false
      ? (project.testimonials ?? []).filter((t) => {
          const quote = t?.quote ? stegaClean(t.quote).trim() : ''
          return Boolean(quote)
        })
      : []
  const relatedCards: WorkProjectCard[] = (
    await withWorkPosters(
      (project.relatedProjects ?? [])
        .filter((p) => Boolean(p?.slug && stegaClean(p.slug).trim()))
        .slice(0, 3)
        .map((p) => ({
          _id: p!._id,
          title: p!.title,
          slug: p!.slug,
          coverImage: p!.coverImage,
          videoUrl: p!.videoUrl,
          year: p!.year,
          client: null,
        })),
    )
  ).filter((p): p is WorkProjectCard => Boolean(p))
  const related = relatedCards
  const title = project.title
    ? stegaClean(project.title).trim() || 'Untitled project'
    : 'Untitled project'
  const yearMark = formatProjectYearMark(project.year)
  const hasCover = Boolean(project.coverImage?.asset?._ref)
  const cleanVideo = project.videoUrl ? stegaClean(project.videoUrl).trim() || null : null
  const cleanSite = project.site ? stegaClean(project.site).trim() || null : null
  const siteButtonLabelRaw =
    (project.siteButtonLabel ? stegaClean(project.siteButtonLabel).trim() : '') || 'Visit site'
  const siteButtonLabel = /→\s*$/.test(siteButtonLabelRaw)
    ? siteButtonLabelRaw
    : `${siteButtonLabelRaw} →`
  const hasHeroMedia = Boolean(cleanVideo || hasCover)
  const heroPosterUrl = await resolveHeroPoster(project)

  const contextText = project.context ? stegaClean(project.context).trim() : ''
  const btsNoteText = project.btsNote ? stegaClean(project.btsNote).trim() : ''
  const briefText = project.brief ? stegaClean(project.brief).trim() : ''
  const approachText = project.approach ? stegaClean(project.approach).trim() : ''
  const resultText = project.result ? stegaClean(project.result).trim() : ''
  const frameRateText = project.frameRate ? stegaClean(project.frameRate).trim() : ''

  const galleryRows = project.gallery ?? []
  const btsRows = project.btsImages ?? []
  const showGallery = galleryHasContent(galleryRows)
  const showBtsGallery = galleryHasContent(btsRows)
  /** Case-study template only — never render on standard projects. */
  const showCaseStudySection = Boolean(isCaseStudy && (briefText || approachText || resultText))
  const {data: caseStudyBackgroundVideoUrl} = showCaseStudySection
    ? await sanityFetch({
        query: projectBodyBackgroundVideoQuery,
        stega: false,
      })
    : {data: null}

  const craftRows = [
    cameras.length ? {label: 'Camera', value: cameras.join(', ')} : null,
    lenses.length ? {label: 'Lens', value: lenses.join(', ')} : null,
    lighting.length ? {label: 'Light', value: lighting.join(', ')} : null,
    frameRateText ? {label: 'Frame rate', value: frameRateText} : null,
  ].filter(Boolean) as Array<{label: string; value: string}>

  const showMeta = Boolean(clientName || yearMark || categoryItems.length)
  const showTestimonials = isCaseStudy && testimonials.length > 0
  const showSidebar = services.length > 0 || craftRows.length > 0
  const showContextBody = Boolean(
    contextText || btsNoteText || cleanVideo || cleanSite || showSidebar,
  )
  const showContextSection = showMeta || showContextBody
  const showRelated = related.length > 0

  const typeMarker = (
    <p className={LABEL}>
      <span className={isCaseStudy ? 'text-white/70' : 'text-white/45'}>
        {isCaseStudy ? '// Case study' : '// Project'}
      </span>
    </p>
  )

  return (
    <article className="bg-[#1a1a1a] text-white">
      {/* 1. Hero header — full-bleed media + title (v3 §04). */}
      {hasHeroMedia ? (
        <div className="project-hero-overlap-nav">
          <ProjectHero
            title={title}
            isCaseStudy={isCaseStudy}
            videoUrl={project.videoUrl}
            coverImage={project.coverImage}
            posterUrl={heroPosterUrl}
            coverDataSanity={dataAttribute?.('coverImage')}
            titleDataSanity={dataAttribute?.('title')}
          />
        </div>
      ) : (
        <header
          aria-label="Project hero"
          className="border-b border-white/10 px-5 pt-24 md:px-6 md:pt-28"
        >
          {typeMarker}
          <h1
            data-sanity={dataAttribute?.('title')}
            className="mt-4 max-w-4xl font-sans text-4xl font-bold uppercase leading-[1.02] tracking-tight text-white md:text-6xl"
          >
            {title}
          </h1>
        </header>
      )}

      {/* Context — meta + narrative. Hidden entirely when nothing is set. */}
      {showContextSection ? (
        <section
          id="context"
          aria-label="Context"
          className={`pt-3 md:pt-4 ${
            !isCaseStudy && showRelated && !showGallery && !showBtsGallery
              ? 'pb-4 md:pb-6'
              : 'pb-10 md:pb-14'
          }`}
        >
          {showMeta ? (
            <>
              <div className="px-5 py-2 md:px-6">
                <ProjectHeroMeta
                  clientName={clientName}
                  clientWebsite={project.client?.website}
                  yearMark={yearMark}
                  categoryItems={categoryItems}
                />
              </div>
              <div className="mt-1 mb-4 h-px w-full overflow-hidden md:mb-5" aria-hidden="true">
                <div className="h-full w-full origin-center scale-y-[0.35] bg-white/80" />
              </div>
            </>
          ) : null}

          {showContextBody ? (
            <div className="grid grid-cols-1 items-start gap-x-12 gap-y-12 px-5 pb-10 md:px-6 md:pb-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] lg:gap-x-16">
              <div className="min-w-0 space-y-12 md:space-y-16">
                {contextText ? (
                  <section>
                    <p
                      data-sanity={dataAttribute?.('context')}
                      className="project-summary max-w-3xl pt-5 font-sans text-base leading-[1.65] text-white/80 md:text-lg"
                    >
                      {contextText}
                    </p>
                  </section>
                ) : null}

                {btsNoteText ? (
                  <section>
                    <SectionTitle>Behind the scenes</SectionTitle>
                    <p
                      data-sanity={dataAttribute?.('btsNote')}
                      className={`max-w-3xl ${NARRATIVE}`}
                    >
                      {btsNoteText}
                    </p>
                  </section>
                ) : null}

                {cleanVideo || cleanSite ? (
                  <section className="flex flex-wrap items-center gap-3">
                    {cleanVideo ? (
                      <ProjectWatchVideoButton title={title} videoUrl={project.videoUrl} />
                    ) : null}
                    {cleanSite ? (
                      <a
                        href={cleanSite}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-sanity={dataAttribute?.('siteButtonLabel')}
                        className="btn-ghost"
                      >
                        {siteButtonLabel}
                      </a>
                    ) : null}
                  </section>
                ) : null}
              </div>

              {showSidebar ? (
                <aside className="min-w-0 space-y-12 border-t border-white/10 pt-12 lg:border-t-0 lg:pt-0">
                  {services.length > 0 ? (
                    <section>
                      <SectionTitle>Services</SectionTitle>
                      <p className="font-mono text-[12px] uppercase leading-[1.9] tracking-[0.12em] text-white/85">
                        {services.join(' · ')}
                      </p>
                    </section>
                  ) : null}

                  <CraftCallout rows={craftRows} />
                </aside>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Case study only — brief / approach / result in the ambient field. */}
      {showCaseStudySection ? (
        <section id="case-study" aria-label="Case study" className="relative z-0 grid bg-[#1a1a1a]">
          {caseStudyBackgroundVideoUrl ? (
            <ProjectAmbientBackground src={caseStudyBackgroundVideoUrl} />
          ) : null}
          {/* Carry page black into the top and bottom of the field. */}
          <div
            className="pointer-events-none col-start-1 row-start-1 z-[1] h-24 w-full self-start bg-gradient-to-b from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent md:h-32"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none col-start-1 row-start-1 z-[1] h-24 w-full self-end bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent md:h-32"
            aria-hidden="true"
          />
          <div className="relative col-start-1 row-start-1 z-[2] mx-auto flex w-full max-w-2xl items-center justify-center px-5 py-20 text-center md:px-8 md:py-28">
            <div className="w-full space-y-14 md:space-y-16">
              {briefText ? (
                <div>
                  <p className={`${LABEL} mb-4`}>The brief</p>
                  <p
                    data-sanity={dataAttribute?.('brief')}
                    className="font-mono text-[11px] uppercase leading-[1.7] tracking-[0.08em] text-white/80 md:text-[12px]"
                  >
                    {briefText}
                  </p>
                </div>
              ) : null}
              {approachText ? (
                <div>
                  <p className={`${LABEL} mb-4`}>The approach</p>
                  <p
                    data-sanity={dataAttribute?.('approach')}
                    className="font-mono text-[11px] uppercase leading-[1.7] tracking-[0.08em] text-white/80 md:text-[12px]"
                  >
                    {approachText}
                  </p>
                </div>
              ) : null}
              {resultText ? (
                <div className="results">
                  <p className={`${LABEL} mb-4`}>The result</p>
                  <p
                    data-sanity={dataAttribute?.('result')}
                    className="font-mono text-[11px] uppercase leading-[1.7] tracking-[0.08em] text-white/80 md:text-[12px]"
                  >
                    {resultText}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Case study: closer sits under the case-study band. */}
      {isCaseStudy ? (
        <section
          aria-label={showTestimonials ? 'Testimonials' : 'Start a conversation'}
          className={`px-5 pt-20 md:px-6 md:pt-28 ${
            showRelated || showGallery || showBtsGallery ? 'pb-16 md:pb-20' : 'pb-24'
          }`}
        >
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-16">
            <div className="min-w-0 flex-1 md:max-w-3xl">
              {showTestimonials ? (
                <ProjectTestimonialRotator items={testimonials} />
              ) : (
                <div>
                  <p className={LABEL}>Contact</p>
                  <p className="mt-4 max-w-xl font-sans text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-4xl lg:text-5xl">
                    Have a mission in mind?
                  </p>
                </div>
              )}
            </div>
            <div className="md:shrink-0 md:pb-1">
              <Link href="/contact" className="btn-ghost">
                Start a conversation →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {showGallery || showBtsGallery ? (
        <div
          className={`flex w-full flex-col gap-hairline ${
            showRelated || !isCaseStudy ? '' : 'pb-24'
          }`}
        >
          {showGallery ? (
            <section aria-label="Gallery">
              <ProjectGallery rows={galleryRows} title={title} />
            </section>
          ) : null}
          {showBtsGallery ? (
            <section aria-label="Behind the scenes">
              <ProjectGallery rows={btsRows} title={`${title} — BTS`} />
            </section>
          ) : null}
        </div>
      ) : null}

      {showRelated ? (
        <section
          aria-label="Related missions"
          className={
            showGallery || showBtsGallery ? 'mt-8 md:mt-10' : !isCaseStudy ? 'mt-2' : 'mt-8'
          }
        >
          <div className="px-5 md:px-6">
            <p className={LABEL}>Related missions</p>
          </div>
          <ul className="mt-6 grid w-full grid-cols-1 gap-hairline sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rel) => {
              const relTitle = rel.title ? stegaClean(rel.title).trim() : 'Untitled'
              const relYear = formatProjectYearMark(rel.year)
              return (
                <li key={rel._id} className="bg-[#0f0f0f]">
                  <Link
                    href={`/projects/${rel.slug}`}
                    className="group relative block aspect-[16/10] overflow-hidden"
                  >
                    <ProjectCardMedia
                      title={relTitle}
                      coverImage={rel.coverImage}
                      videoUrl={rel.videoUrl}
                      posterUrl={rel.posterUrl}
                      playback="autoplay"
                    />
                    <ProjectCardCorners />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4">
                      <p className="font-sans text-sm font-bold uppercase tracking-tight text-white">
                        {relTitle}
                      </p>
                      {relYear ? (
                        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">
                          {relYear}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {/* Standard projects: closer sits under related missions. */}
      {!isCaseStudy ? (
        <section
          aria-label="Start a conversation"
          className={`border-b border-white/10 px-5 pb-24 pt-12 md:px-6 md:pt-16 ${
            showRelated || showGallery || showBtsGallery || showContextSection ? '' : 'mt-10'
          }`}
        >
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-16">
            <div className="min-w-0 flex-1 md:max-w-3xl">
              <div>
                <p className={LABEL}>Contact</p>
                <p className="mt-4 max-w-xl font-sans text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-4xl lg:text-5xl">
                  Have a mission in mind?
                </p>
              </div>
            </div>
            <div className="md:shrink-0 md:pb-1">
              <Link href="/contact" className="btn-ghost">
                Start a conversation →
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </article>
  )
}
