import {
  ProjectCardMedia,
  resolveWorkVideoPlayback,
  type WorkVideoPlayback,
} from '@/components/ProjectCardMedia'
import {fetchVimeoPoster, isVimeoUrl} from '@/lib/vimeo'
import {urlForImage} from '@/sanity/lib/utils'
import {ArrowUpRight} from 'lucide-react'
import {stegaClean} from 'next-sanity'
import Link from 'next/link'

// Minimal card shape shared by the Work index (allProjectsQuery /
// workPage.curatedProjects) and the category pages (projectsByCategoryQuery).
// Kept structural so any of those generated result types are assignable.
export type WorkProjectCard = {
  _id: string
  title: string | null
  slug: string | null
  coverImage: {asset?: {_ref?: string} | null} | null
  videoUrl?: string | null
  year: string | null
  client: string | null
  categories?: Array<{
    _id: string
    filterLabel: string | null
    slug: string | null
  } | null> | null
  featured?: boolean | null
  /** Teaser card — shown on the grid but not clickable, no detail page yet. */
  comingSoon?: boolean | null
  /** Resolved on the server for cards that need a still before video boots. */
  posterUrl?: string | null
  /** Catalog position ("01"), attached before client-side search filtering. */
  indexMark?: string
}

/** True when a project has a non-empty video URL (optional hover flair). */
export function projectHasVideo(
  project: Pick<WorkProjectCard, 'videoUrl'> | null | undefined,
): boolean {
  if (!project?.videoUrl) return false
  return Boolean(stegaClean(project.videoUrl).trim())
}

/**
 * Drop projects with nothing to show — a card needs a cover image or a video.
 * Used after manual curation or client-side filters.
 */
export function filterProjectsWithVideo(
  projects: Array<WorkProjectCard | null>,
): WorkProjectCard[] {
  return projects.filter((project): project is WorkProjectCard =>
    Boolean(project && (project.coverImage?.asset?._ref || projectHasVideo(project))),
  )
}

// Editor-configurable empty state (from the workPage singleton).
export type WorkEmptyState = {
  text?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
} | null

/**
 * Attach poster stills for work cards — Sanity cover when present, otherwise
 * a cached Vimeo oEmbed thumbnail so the grid isn't blank while video boots.
 */
export async function withWorkPosters(
  projects: Array<WorkProjectCard | null>,
): Promise<Array<WorkProjectCard | null>> {
  return Promise.all(
    projects.map(async (project) => {
      if (!project) return project

      const coverRef = project.coverImage?.asset?._ref
      if (coverRef) {
        const fromSanity = urlForImage({asset: {_ref: coverRef}})
          ?.width(1600)
          .height(900)
          .fit('crop')
          .url()
        return {...project, posterUrl: fromSanity ?? null}
      }

      const videoUrl = project.videoUrl ? stegaClean(project.videoUrl) : null
      if (videoUrl && isVimeoUrl(videoUrl)) {
        const fromVimeo = await fetchVimeoPoster(videoUrl)
        return {...project, posterUrl: fromVimeo ?? null}
      }

      return project
    }),
  )
}

/**
 * The Work grid — a contact sheet on paper. Full-bleed media tiles separated
 * by hairlines, captions set BELOW each frame like a print index: catalog
 * number, title, and the route out. No text on the media.
 */
export function ProjectGrid({
  projects,
  emptyState,
  videoPlayback = 'autoplay',
}: {
  projects: Array<WorkProjectCard | null>
  emptyState?: WorkEmptyState
  videoPlayback?: WorkVideoPlayback | null
}) {
  const items = projects.filter((project): project is WorkProjectCard => Boolean(project))
  const playbackMode = resolveWorkVideoPlayback(videoPlayback)

  if (items.length === 0) {
    const text = emptyState?.text || 'Nothing here yet.'
    const ctaLabel = emptyState?.ctaLabel || 'Start a conversation →'
    const ctaHref = emptyState?.ctaHref || '/contact'
    return (
      <div className="page-chrome mt-14 text-center font-sans text-[15px] leading-[1.6] text-foreground/60">
        <p className="!m-0">{text}</p>
        <Link
          href={ctaHref}
          className="mt-3 inline-block text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors duration-300 hover:decoration-foreground"
        >
          {ctaLabel}
        </Link>
      </div>
    )
  }

  return (
    <ul className="media-bleed mt-12 grid grid-cols-1 gap-x-hairline gap-y-10 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
      {items.map((project, position) => {
        const indexMark = project.indexMark ?? String(position + 1).padStart(2, '0')
        const comingSoon = Boolean(project.comingSoon)
        const card = (
          <>
            <div className="relative aspect-[16/9] overflow-hidden bg-foreground/6">
              <ProjectCardMedia
                title={project.title}
                coverImage={project.coverImage}
                videoUrl={project.videoUrl}
                posterUrl={project.posterUrl}
                playback={playbackMode}
              />
            </div>
            {/* Glitch&Grit caption: bold sans index + title left, FULL PROJECT right. */}
            <div className="mt-2 flex items-baseline gap-2.5 px-[16px] md:mt-2.5 md:gap-3 md:px-[20px]">
              <span className="shrink-0 font-sans text-[16px] font-bold tabular-nums tracking-[-0.02em] text-foreground md:text-[17px]">
                {indexMark}
              </span>
              <h3 className="min-w-0 truncate font-sans text-[16px] font-bold uppercase tracking-[-0.02em] text-foreground md:text-[17px]">
                {project.title}
              </h3>
              {comingSoon ? (
                <span className="ml-auto inline-flex shrink-0 items-center font-sans text-[13px] font-bold uppercase tracking-[-0.01em] text-foreground/40 md:text-[14px]">
                  Coming soon
                </span>
              ) : (
                <span className="ml-auto inline-flex shrink-0 items-center gap-1 font-sans text-[13px] font-bold uppercase tracking-[-0.01em] text-foreground/55 transition-colors duration-300 group-hover:text-foreground md:text-[14px]">
                  Full project
                  <ArrowUpRight
                    aria-hidden
                    strokeWidth={2.75}
                    absoluteStrokeWidth
                    className="h-[16px] w-[16px] transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:h-[17px] md:w-[17px]"
                  />
                </span>
              )}
            </div>
          </>
        )
        return (
          <li key={project._id}>
            {comingSoon ? (
              <div className="block cursor-default">{card}</div>
            ) : (
              <Link href={`/projects/${project.slug}`} className="group block">
                {card}
              </Link>
            )}
          </li>
        )
      })}
    </ul>
  )
}
