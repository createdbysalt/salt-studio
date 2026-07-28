import {normalizeCtaLabel, resolveCtaHref} from '@/components/homeHero'
import {HomeHeroStage} from '@/components/HomeHeroStage'
import {HomeServicesShowcase} from '@/components/HomeServicesShowcase'
import {ClipReveal} from '@/components/motion/ClipReveal'
import {LineReveal} from '@/components/motion/LineReveal'
import {filterProjectsWithVideo, withWorkPosters} from '@/components/ProjectGrid'
import type {HomePageQueryResult} from '@/sanity.types'
import {sanityFetch} from '@/sanity/lib/live'
import {allProjectsQuery} from '@/sanity/lib/queries'
import {urlForImage} from '@/sanity/lib/utils'
import {ArrowUpRight} from 'lucide-react'
import {stegaClean} from 'next-sanity'
import Link from 'next/link'

export interface HomePageProps {
  data: HomePageQueryResult | null
}

type HomeSection = NonNullable<NonNullable<HomePageQueryResult>['sections']>[number]
type SectionOf<T extends HomeSection['_type']> = Extract<HomeSection, {_type: T}>

const WAITLIST_HREF = '/quiz'
const CONTACT_HREF = '/contact'

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
              <HomeHeroStage
                key={section._key}
                projects={heroSliderProjects}
                primary={HERO_PRIMARY}
                secondary={HERO_SECONDARY}
              />
            )
          case 'homeProofSection':
            return null
          case 'homeServicesSection':
            return <HomeServices key={section._key} section={section} />
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

function HomeServices({section}: {section: SectionOf<'homeServicesSection'>}) {
  const fromServices = (section.services ?? [])
    .filter((item) => Boolean(item?.title && item?.shortDescription))
    .map((item) => {
      const next = item!.nextStep
      const href = next?.buttonLabel ? resolveCtaHref(next) : null

      return {
        _key: item!._key,
        title: item!.title!,
        body: item!.shortDescription!,
        headline: item!.headline ?? null,
        priceLine: item!.priceLine,
        timelineLine: item!.timelineLine ?? null,
        timeline: (item!.timeline ?? [])
          .filter((phase) => Boolean(phase?.label && phase?.duration))
          .map((phase) => ({
            _key: phase!._key,
            label: phase!.label!,
            duration: phase!.duration!,
            detail: phase!.detail,
          })),
        linkLabel: item!.linkLabel,
        detailEyebrow: item!.detailEyebrow ?? null,
        detailBody: item!.detailBody ?? null,
        sceneLine: item!.sceneLine ?? null,
        detailImageUrl: item!.detailImage?.asset?._ref
          ? urlForImage({asset: {_ref: item!.detailImage.asset._ref}})
              ?.width(1600)
              .height(1200)
              .fit('crop')
              .url()
          : null,
        backgroundImageUrl: item!.backgroundImage?.asset?._ref
          ? urlForImage({asset: {_ref: item!.backgroundImage.asset._ref}})
              ?.width(2400)
              .height(1600)
              .fit('crop')
              .url()
          : null,
        backgroundVideoUrl: item!.backgroundVideoUrl ?? null,
        deliverables: (item!.deliverables ?? [])
          .filter((row) => Boolean(row?.title))
          .map((row) => ({_key: row!._key, title: row!.title!, detail: row!.detail})),
        capabilities: (item!.capabilities ?? [])
          .filter((cap) => Boolean(cap?._id && cap?.name))
          .map((cap) => ({_id: cap!._id, name: cap!.name!, kind: cap!.kind})),
        idealFor: (item!.idealFor ?? []).filter((line): line is string => Boolean(line?.trim())),
        notAFit: (item!.notAFit ?? []).filter((line): line is string => Boolean(line?.trim())),
        stepsLabel: item!.stepsLabel ?? null,
        steps: (item!.steps ?? [])
          .filter((step) => Boolean(step?.text))
          .map((step) => ({_key: step!._key, lead: step!.lead, text: step!.text!})),
        projects: (item!.featuredProjects ?? [])
          .filter((project) => Boolean(project?._id && project?.title))
          .map((project) => ({
            _id: project!._id,
            title: project!.title!,
            slug: project!.slug,
            client: project!.client,
            imageUrl: project!.coverImage?.asset?._ref
              ? urlForImage({asset: {_ref: project!.coverImage.asset._ref}})
                  ?.width(800)
                  .height(600)
                  .fit('crop')
                  .url()
              : null,
          })),
        testimonials: (item!.testimonials ?? [])
          .filter((quote) => Boolean(quote?._id && quote?.quote && quote?.author))
          .map((quote) => ({
            _id: quote!._id,
            quote: quote!.quote!,
            author: quote!.author!,
            role: quote!.role,
          })),
        clients: (item!.clients ?? [])
          .filter((client) => Boolean(client?._id && client?.name))
          .map((client) => ({_id: client!._id, name: client!.name!})),
        proofAnchor: item!.proofAnchor ?? null,
        nextStep:
          next?.buttonLabel && href
            ? {
                subhead: next.subhead,
                buttonLabel: next.buttonLabel,
                href,
              }
            : null,
        routingLine: item!.routingLine ?? null,
      }
    })

  const fromLegacy = (section.cards ?? [])
    .filter((card) => Boolean(card?.title && card?.body))
    .map((card) => ({
      _key: card!._key,
      title: card!.title!,
      body: card!.body!,
      priceLine: card!.priceLine,
      linkLabel: card!.linkLabel,
      detailEyebrow: card!.detailEyebrow ?? null,
      detailBody: card!.detailBody ?? null,
      detailImageUrl: card!.detailImage?.asset?._ref
        ? urlForImage({asset: {_ref: card!.detailImage.asset._ref}})
            ?.width(1600)
            .height(1200)
            .fit('crop')
            .url()
        : null,
      backgroundImageUrl: card!.hoverImage?.asset?._ref
        ? urlForImage({asset: {_ref: card!.hoverImage.asset._ref}})
            ?.width(2400)
            .height(1600)
            .fit('crop')
            .url()
        : null,
      backgroundVideoUrl: card!.backgroundVideoUrl ?? null,
    }))

  const cards = fromServices.length > 0 ? fromServices : fromLegacy

  if (cards.length === 0) return null

  return <HomeServicesShowcase label={section.label} cards={cards} />
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
