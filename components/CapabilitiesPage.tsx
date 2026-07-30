import {CapabilitiesHero} from '@/components/CapabilitiesHero'
import {
  HomePhilosophySection,
  HomeProductSection,
  HomeServicesSection,
  type HomeSectionOf,
} from '@/components/homeSections'
import type {HomePageQueryResult} from '@/sanity.types'

export interface CapabilitiesPageProps {
  data: HomePageQueryResult | null
  /** Masthead headline from servicesPage.capabilitiesHeadline (already stega-cleaned). */
  heroHeadline?: string | null
}

type HomeSection = NonNullable<NonNullable<HomePageQueryResult>['sections']>[number]
type SectionOf<T extends HomeSection['_type']> = Extract<HomeSection, {_type: T}>

/**
 * Capabilities — paper→ink swipe hero, then homepage services (no type-beat),
 * tools scrub + waitlist strip, and philosophy CTA.
 */
export async function CapabilitiesPage({data, heroHeadline}: CapabilitiesPageProps) {
  const sections = (data?.sections ?? []).filter((section) => section.enabled !== false)

  const services = sections.find(
    (s): s is SectionOf<'homeServicesSection'> => s._type === 'homeServicesSection',
  )
  const product = sections.find(
    (s): s is SectionOf<'homeProductSection'> => s._type === 'homeProductSection',
  )
  const philosophy = sections.find(
    (s): s is SectionOf<'homePhilosophySection'> => s._type === 'homePhilosophySection',
  )
  const finalCta = sections.find(
    (s): s is HomeSectionOf<'homeFinalCtaSection'> => s._type === 'homeFinalCtaSection',
  )

  return (
    <main className="overflow-x-clip bg-background text-foreground">
      <CapabilitiesHero headline={heroHeadline} />

      {services ? <HomeServicesSection section={services} showBridge={false} /> : null}
      {product ? <HomeProductSection section={product} /> : null}
      {philosophy ? (
        <HomePhilosophySection
          section={philosophy}
          closingLine={finalCta?.headline ?? null}
          emailLine={finalCta?.emailLine ?? null}
          cta={finalCta?.cta ?? null}
        />
      ) : null}
    </main>
  )
}
