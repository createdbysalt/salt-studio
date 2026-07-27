import {
  DEFAULT_MARQUEE_CLIENTS,
  normalizeCtaLabel,
  resolveCtaHref,
  type MarqueeClient,
} from '@/components/homeHero'
import {ClientStrip, MobileCTA, VideoHero, type HeroProject} from '@/components/VideoHero'
import {fetchVimeoPoster, isVimeoUrl} from '@/lib/vimeo'
import type {HomePageQueryResult} from '@/sanity.types'
import {urlForImage} from '@/sanity/lib/utils'
import {stegaClean} from 'next-sanity'

export interface HomePageProps {
  data: HomePageQueryResult | null
}

// Roster for the bottom marquee, resolved from the home doc's client selector
// (manual list, or auto by "known" / "less known" tier). See homePageQuery.
function resolveMarqueeClients(
  clients: NonNullable<HomePageQueryResult>['marqueeClients'] | undefined,
): MarqueeClient[] {
  const result: MarqueeClient[] = []

  for (const client of clients ?? []) {
    const name = stegaClean(client?.name ?? '')?.trim()
    if (!name) continue

    const website = stegaClean(client?.website ?? '')?.trim() || null
    const id = client?._id ?? null

    result.push({name, website, id})
  }

  return result
}

function sanityCoverUrl(
  coverImage: NonNullable<HeroProject['coverImage']> | null | undefined,
): string | undefined {
  if (!coverImage) return undefined
  return urlForImage(coverImage as any)
    ?.width(1920)
    .height(1080)
    .url()
}

/** Prefer Sanity cover; fall back to Vimeo oEmbed so the hero isn't black while video boots. */
async function withPosters(
  projects: NonNullable<HomePageQueryResult>['showcaseProjects'],
): Promise<HeroProject[]> {
  const list = (projects ?? []).filter((p): p is NonNullable<typeof p> => Boolean(p?.videoUrl))

  return Promise.all(
    list.map(async (project) => {
      const fromSanity = sanityCoverUrl(project.coverImage)
      if (fromSanity) return {...project, posterUrl: fromSanity}

      if (project.videoUrl && isVimeoUrl(project.videoUrl)) {
        const fromVimeo = await fetchVimeoPoster(project.videoUrl)
        return {...project, posterUrl: fromVimeo}
      }

      return {...project, posterUrl: undefined}
    }),
  )
}

export async function HomePage({data}: HomePageProps) {
  const {showcaseProjects = []} = data ?? {}

  const videoProjects = await withPosters(showcaseProjects)

  const resolvedMarqueeClients = resolveMarqueeClients(data?.marqueeClients)
  // Use Sanity roster when the query returns clients; defaults only during setup.
  const marqueeClients =
    resolvedMarqueeClients.length > 0
      ? resolvedMarqueeClients
      : data?.marqueeClients == null
        ? DEFAULT_MARQUEE_CLIENTS
        : resolvedMarqueeClients
  const projectCtaLabel = stegaClean(data?.heroCtaLabel || '')?.trim() || 'Extrapolate'
  const ctaLabel = normalizeCtaLabel(data?.cta?.buttonLabel)
  const ctaHref = resolveCtaHref(data?.cta)

  // No video-bearing projects yet: still render the dark full-screen hero so the
  // shared Navbar (white on dark) has the right surface behind it.
  if (!videoProjects.length) {
    return (
      <section className="fixed inset-0 z-40 overflow-hidden bg-[#1a1a1a]">
        <div className="pointer-events-none absolute inset-0 bg-black/40" />
        <div className="flex h-full items-center justify-center px-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
            Add featured projects with video URLs to get started.
          </p>
        </div>
        <ClientStrip
          clients={marqueeClients}
          ctaLabel={ctaLabel}
          ctaHref={ctaHref}
          homeId={data?._id}
        />
        <MobileCTA label={ctaLabel} href={ctaHref} homeId={data?._id} />
      </section>
    )
  }

  return (
    <VideoHero
      projects={videoProjects}
      marqueeClients={marqueeClients}
      projectCtaLabel={projectCtaLabel}
      ctaLabel={ctaLabel}
      ctaHref={ctaHref}
      homeId={data?._id}
    />
  )
}
