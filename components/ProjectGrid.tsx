import {ProjectCardCorners} from '@/components/ProjectCardCorners'
import {
  ProjectCardMedia,
  resolveWorkVideoPlayback,
  type WorkVideoPlayback,
} from '@/components/ProjectCardMedia'
import {fetchVimeoPoster, isVimeoUrl} from '@/lib/vimeo'
import {urlForImage} from '@/sanity/lib/utils'
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
  /** Resolved on the server for cards that need a still before video boots. */
  posterUrl?: string | null
}

/** True when a project has a non-empty video URL (Work grid requires video). */
export function projectHasVideo(
  project: Pick<WorkProjectCard, 'videoUrl'> | null | undefined,
): boolean {
  if (!project?.videoUrl) return false
  return Boolean(stegaClean(project.videoUrl).trim())
}

/** Drop projects without video — used after manual curation or client-side filters. */
export function filterProjectsWithVideo(
  projects: Array<WorkProjectCard | null>,
): WorkProjectCard[] {
  return projects.filter((project): project is WorkProjectCard =>
    Boolean(project && projectHasVideo(project)),
  )
}

// Editor-configurable empty state (from the workPage singleton).
export type WorkEmptyState = {
  text?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
} | null

/** Format CMS year ("2026", "2021–22") as the short card mark ("/26"). */
function formatYearMark(year: string | null | undefined): string | null {
  if (!year) return null
  const clean = stegaClean(year).trim()
  if (!clean) return null
  const match = clean.match(/(\d{4})/)
  if (match) return `/${match[1].slice(-2)}`
  return clean.startsWith('/') ? clean : `/${clean}`
}

/** Meta line: `Client × Salt Studio · /26` */
function formatClientLine(client: string | null | undefined, year: string | null | undefined) {
  const name = client ? stegaClean(client).trim() : ''
  const yearMark = formatYearMark(year)
  const left = name ? `${name} × Salt Studio` : 'Salt Studio'
  if (yearMark) return `${left} · ${yearMark}`
  return left
}

/** Category labels for the work card meta line. */
function formatTagLine(project: WorkProjectCard): string | null {
  const categories = (project.categories ?? [])
    .map((cat) => (cat?.filterLabel ? stegaClean(cat.filterLabel).trim() : ''))
    .filter(Boolean)
  if (categories.length) return categories.join(' · ')

  return null
}

/**
 * Attach poster stills for work cards — Sanity cover when present, otherwise
 * a cached Vimeo oEmbed thumbnail so the grid isn't black while video boots.
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
 * The Work grid — full-bleed project cards linking to /projects/[slug].
 * Filters out dangling references and renders the editor-configured empty
 * state (or a sensible default) when nothing remains.
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
      <div className="mt-12 px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40 md:px-6">
        <p>{text}</p>
        <Link
          href={ctaHref}
          className="mt-3 inline-block text-white/70 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
        >
          {ctaLabel}
        </Link>
      </div>
    )
  }

  return (
    <ul className="mt-12 grid grid-cols-1 gap-hairline sm:grid-cols-2">
      {items.map((project) => {
        const clientLine = formatClientLine(project.client, project.year)
        const tagLine = formatTagLine(project)
        return (
          <li key={project._id} className="bg-[#1a1a1a]">
            <Link
              href={`/projects/${project.slug}`}
              className="group relative block aspect-[6/5] overflow-hidden sm:aspect-[16/9]"
            >
              <ProjectCardMedia
                title={project.title}
                coverImage={project.coverImage}
                videoUrl={project.videoUrl}
                posterUrl={project.posterUrl}
                playback={playbackMode}
              />
              <ProjectCardCorners />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4 md:p-5">
                <h3 className="font-sans text-lg font-bold uppercase leading-[0.95] tracking-tight text-white md:text-xl">
                  {project.title}
                </h3>
                <p className="!m-0 font-mono text-[11px] uppercase leading-none tracking-[0.12em] text-white/70">
                  {clientLine}
                </p>
                {tagLine ? (
                  <p className="!m-0 font-mono text-[10px] uppercase leading-none tracking-[0.14em] text-white/45">
                    {tagLine}
                  </p>
                ) : null}
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
