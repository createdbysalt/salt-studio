import {normalizeCtaLabel} from '@/components/homeHero'
import {HomeProjectSlider} from '@/components/HomeProjectSlider'
import {HomeServicesShowcase} from '@/components/HomeServicesShowcase'
import {ClipReveal} from '@/components/motion/ClipReveal'
import {LineReveal} from '@/components/motion/LineReveal'
import {WordSwap} from '@/components/motion/WordSwap'
import {
  filterProjectsWithVideo,
  withWorkPosters,
  type WorkProjectCard,
} from '@/components/ProjectGrid'
import type {HomePageQueryResult} from '@/sanity.types'
import {sanityFetch} from '@/sanity/lib/live'
import {allProjectsQuery} from '@/sanity/lib/queries'
import {ArrowUpRight} from 'lucide-react'
import {stegaClean} from 'next-sanity'
import Link from 'next/link'

export interface HomePageProps {
  data: HomePageQueryResult | null
}

type HomeSection = NonNullable<NonNullable<HomePageQueryResult>['sections']>[number]
type SectionOf<T extends HomeSection['_type']> = Extract<HomeSection, {_type: T}>

const SERVICES_HREF = '/capabilities'
const WAITLIST_HREF = '/quiz'
const CONTACT_HREF = '/contact'

const FALLBACK = {
  subheadline:
    'We build tools that know your content, answer your people, and carry your voice — and the digital spaces to match.',
  ctaMicrocopy: '30 minutes. You leave with a clear next step — either way.',
} as const

/** TinyWins-style edge-anchored splits. `\n` = intentional line break within a side. */
const HERO_PRIMARY = {
  left: 'AI assistants\nand refined websites',
  right: 'for organizations\nwith a mission.',
} as const

const HERO_SECONDARY = {
  left: "Salt doesn't\noverpower.",
  right: "It draws out\nwhat's already there.",
} as const

/**
 * Homepage — 7 sections from the approved copy plan
 * (salt-studio-knowledge-base/studio/website/copy/homepage.md).
 * One primary CTA: Book a discovery call. Services/work only route.
 */
export async function HomePage({data}: HomePageProps) {
  const sections = (data?.sections ?? []).filter((section) => section.enabled !== false)
  const hero = sections.find((s): s is SectionOf<'homeHeroSection'> => s._type === 'homeHeroSection')
  const bookingQuarter = hero?.bookingQuarter ? stegaClean(hero.bookingQuarter).trim() : ''

  const workSection = sections.find(
    (s): s is SectionOf<'homeWorkSection'> => s._type === 'homeWorkSection',
  )
  const curatedTeasers = (workSection?.projects ?? []).filter(Boolean).map((project) => ({
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
      : (allProjects ?? []).map((project) => ({
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
              <HomeHero
                key={section._key}
                section={section}
                bookingQuarter={bookingQuarter}
                projects={heroSliderProjects}
              />
            )
          case 'homeProofSection':
            return null
          case 'homeServicesSection':
            return (
              <HomeServices
                key={section._key}
                section={section}
                statement={
                  hero?.subheadline?.trim() || FALLBACK.subheadline
                }
              />
            )
          case 'homeWorkSection':
            return null
          case 'homeProductSection':
            return <HomeProduct key={section._key} section={section} />
          case 'homePhilosophySection':
            return <HomePhilosophy key={section._key} section={section} />
          case 'homeFinalCtaSection':
            return (
              <HomeFinalCta
                key={section._key}
                section={section}
                bookingQuarter={bookingQuarter}
              />
            )
          default:
            return null
        }
      })}
    </main>
  )
}

function HomeHero({
  section,
  bookingQuarter,
  projects,
}: {
  section: SectionOf<'homeHeroSection'>
  bookingQuarter: string
  projects: WorkProjectCard[]
}) {
  const ctaLabel = normalizeCtaLabel(section.ctaLabel)
  const ctaMicrocopy = section.ctaMicrocopy?.trim() || FALLBACK.ctaMicrocopy

  return (
    <section className="flex min-h-[100dvh] flex-col pb-8 md:pb-10">
      {/* Split type clears the fixed nav, then sits tight underneath — inset matches pills. */}
      <h1 className="mt-28 w-full px-3 font-sans text-[clamp(2.15rem,3.8vw,4.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.03em] text-foreground sm:mt-32 sm:px-4">
        <WordSwap primary={HERO_PRIMARY} secondary={HERO_SECONDARY} />
      </h1>

      <HomeProjectSlider projects={projects} />

      {/* CTA only — subheadline lives in the services statement below */}
      <div className="mt-auto flex w-full flex-col items-start gap-3 px-3 pt-6 sm:px-4 md:items-end md:pt-8">
        <Link href={CONTACT_HREF} className="btn-solid">
          {ctaLabel}
          <ArrowUpRight aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />
        </Link>
        <p className="max-w-[28ch] font-mono text-[11px] uppercase tracking-label text-foreground/40 md:text-right">
          {ctaMicrocopy}
          {bookingQuarter ? ` · Currently booking ${bookingQuarter}` : null}
        </p>
      </div>
    </section>
  )
}

function HomeServices({
  section,
  statement,
}: {
  section: SectionOf<'homeServicesSection'>
  statement: string
}) {
  const cards = (section.cards ?? [])
    .filter((card): card is NonNullable<typeof card> & {title: string; body: string} =>
      Boolean(card?.title && card?.body),
    )
    .map((card) => ({
      _key: card._key,
      title: card.title,
      body: card.body,
      priceLine: card.priceLine,
      linkLabel: card.linkLabel,
    }))

  if (cards.length === 0) return null

  return (
    <HomeServicesShowcase
      label={section.label}
      statement={statement}
      cards={cards}
      href={SERVICES_HREF}
    />
  )
}

function HomeProduct({section}: {section: SectionOf<'homeProductSection'>}) {
  if (!section.headline && !section.body) return null

  return (
    <ClipReveal className="bg-accent text-white">
      <section className="page-chrome py-20 md:py-28">
        <div className="max-w-[720px]">
          {section.headline ? (
            <h2 className="font-sans text-[clamp(1.75rem,3.5vw,3.25rem)] font-semibold uppercase leading-[0.95] tracking-[-0.02em]">
              {section.headline}
            </h2>
          ) : null}
          {section.body ? (
            <p className="mt-6 max-w-[55ch] text-lg leading-relaxed text-white/85">
              {section.body}
            </p>
          ) : null}
          <Link
            href={WAITLIST_HREF}
            className="mt-10 inline-flex items-center gap-2 rounded-lg border border-white bg-white px-5 py-3 font-mono text-[12px] font-medium uppercase tracking-label text-[#08090A] transition-colors duration-300 hover:bg-white/90"
          >
            {section.ctaLabel?.trim() || 'Join the waitlist'}
            <ArrowUpRight aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />
          </Link>
        </div>
      </section>
    </ClipReveal>
  )
}

function HomePhilosophy({section}: {section: SectionOf<'homePhilosophySection'>}) {
  if (!section.line1 && !section.line2) return null

  return (
    <section className="page-chrome flex min-h-[70vh] items-center border-t border-foreground/15 py-28 md:py-36">
      <div className="max-w-[1100px]">
        {section.line1 ? (
          <LineReveal as="p" className="text-display font-semibold text-foreground">
            {section.line1}
          </LineReveal>
        ) : null}
        {section.line2 ? (
          <LineReveal
            as="p"
            delay={0.2}
            className="mt-8 max-w-[22ch] font-sans text-[clamp(1.5rem,3vw,3rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground/70"
          >
            {section.line2}
          </LineReveal>
        ) : null}
      </div>
    </section>
  )
}

function HomeFinalCta({
  section,
  bookingQuarter,
}: {
  section: SectionOf<'homeFinalCtaSection'>
  bookingQuarter: string
}) {
  const ctaLabel = normalizeCtaLabel(section.ctaLabel)
  const emailLine = section.emailLine?.trim()

  return (
    <section className="page-chrome border-t border-foreground/15 py-24 md:py-32">
      <div className="max-w-[720px]">
        {section.headline ? (
          <LineReveal as="h2" className="text-display font-semibold">
            {section.headline}
          </LineReveal>
        ) : null}
        {section.body ? (
          <LineReveal
            as="p"
            delay={0.15}
            className="mt-8 max-w-[55ch] text-lg leading-relaxed text-foreground/70"
          >
            {section.body}
          </LineReveal>
        ) : null}
        <div className="mt-12 flex flex-col items-start gap-3">
          <Link href={CONTACT_HREF} className="btn-solid">
            {ctaLabel}
            <ArrowUpRight aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />
          </Link>
          {(bookingQuarter || emailLine) && (
            <p className="max-w-[42ch] font-mono text-[12px] uppercase tracking-label text-foreground/40">
              {[bookingQuarter ? `Currently booking ${bookingQuarter}` : null, emailLine]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
