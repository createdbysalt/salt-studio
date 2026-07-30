import {HomeHeroStage} from '@/components/HomeHeroStage'
import {
  HomePhilosophySection,
  HomeProductSection,
  HomeServicesSection,
  type HomeSectionOf,
} from '@/components/homeSections'
import {filterProjectsWithVideo, withWorkPosters} from '@/components/ProjectGrid'
import type {HomePageQueryResult} from '@/sanity.types'
import {sanityFetch} from '@/sanity/lib/live'
import {allProjectsQuery} from '@/sanity/lib/queries'
import {stegaClean} from 'next-sanity'

export interface HomePageProps {
  data: HomePageQueryResult | null
}

type HomeSection = NonNullable<NonNullable<HomePageQueryResult>['sections']>[number]
type SectionOf<T extends HomeSection['_type']> = Extract<HomeSection, {_type: T}>

/** TinyWins-style edge-anchored splits. `\n` = intentional line break within a side. */
const HERO_PRIMARY = {
  left: 'Custom AI,\nsites + software',
  right: 'for organizations\nwith a mission.',
} as const

const HERO_SECONDARY = {
  left: "Salt doesn't\noverpower.",
  right: "It draws out what's\nalready there.",
} as const

/** Sanity value wins when filled; the constants above are the safety net. */
function heroFace(
  left: string | null | undefined,
  right: string | null | undefined,
  fallback: {left: string; right: string},
) {
  return {
    left: stegaClean(left ?? '')?.trim() || fallback.left,
    right: stegaClean(right ?? '')?.trim() || fallback.right,
  }
}

/**
 * Homepage — 7 sections from the approved copy plan
 * (salt-studio-knowledge-base/studio/website/copy/homepage.md).
 * One primary CTA: Book a discovery call. Services/work only route.
 */
export async function HomePage({data}: HomePageProps) {
  const sections = (data?.sections ?? []).filter((section) => section.enabled !== false)

  const workSection = sections.find(
    (s): s is SectionOf<'homeWorkSection'> => s._type === 'homeWorkSection',
  )
  const curatedTeasers = (workSection?.projects ?? [])
    .filter(
      (project) => Boolean(project?._id) && project?.hidden !== true && project?.featured === true,
    )
    .map((project) => ({
      _id: project!._id,
      title: project!.title ?? null,
      slug: project!.slug ?? null,
      coverImage: project!.coverImage ?? null,
      videoUrl: project!.videoUrl ?? null,
      year: project!.year ?? null,
      client: project!.client ?? null,
      comingSoon: null as boolean | null,
    }))

  // Hero slider: curated home teaser when set, otherwise the full published roster.
  const {data: allProjects} = await sanityFetch({query: allProjectsQuery})
  const sliderSource =
    curatedTeasers.length > 0
      ? curatedTeasers
      : (allProjects ?? [])
          .filter((project) => project.featured === true)
          .map((project) => ({
            _id: project._id,
            title: project.title ?? null,
            slug: project.slug ?? null,
            coverImage: project.coverImage ?? null,
            videoUrl: project.videoUrl ?? null,
            year: project.year ?? null,
            client: project.client ?? null,
            comingSoon: project.comingSoon ?? null,
          }))

  const sliderProjects = await withWorkPosters(sliderSource)
  const heroSliderProjects = filterProjectsWithVideo(sliderProjects)

  return (
    <main className="overflow-x-clip bg-background text-foreground">
      {sections.map((section) => {
        switch (section._type) {
          case 'homeHeroSection':
            return (
              <HomeHeroStage
                key={section._key}
                projects={heroSliderProjects}
                primary={heroFace(
                  section.splitPrimaryLeft,
                  section.splitPrimaryRight,
                  HERO_PRIMARY,
                )}
                secondary={heroFace(
                  section.splitSecondaryLeft,
                  section.splitSecondaryRight,
                  HERO_SECONDARY,
                )}
              />
            )
          case 'homeProofSection':
            return null
          case 'homeServicesSection':
            return <HomeServicesSection key={section._key} section={section} />
          case 'homeWorkSection':
            return null
          case 'homeProductSection':
            return <HomeProductSection key={section._key} section={section} />
          case 'homePhilosophySection': {
            const finalCta = sections.find(
              (s): s is HomeSectionOf<'homeFinalCtaSection'> => s._type === 'homeFinalCtaSection',
            )
            return (
              <HomePhilosophySection
                key={section._key}
                section={section}
                closingLine={finalCta?.headline ?? null}
                emailLine={finalCta?.emailLine ?? null}
                cta={finalCta?.cta ?? null}
              />
            )
          }
          case 'homeFinalCtaSection':
            return null
          default:
            return null
        }
      })}
    </main>
  )
}
