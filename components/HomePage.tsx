import {HomeCapabilitiesScrub} from '@/components/HomeCapabilitiesScrub'
import {normalizeCtaLabel, resolveCtaHref} from '@/components/homeHero'
import {HomeHeroStage} from '@/components/HomeHeroStage'
import {HomeServicesShowcase} from '@/components/HomeServicesShowcase'
import {LineReveal} from '@/components/motion/LineReveal'
import {filterProjectsWithVideo, withWorkPosters} from '@/components/ProjectGrid'
import type {HomePageQueryResult} from '@/sanity.types'
import {sanityFetch} from '@/sanity/lib/live'
import {allProjectsQuery, capabilitiesQuery} from '@/sanity/lib/queries'
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

/** TinyWins-style edge-anchored splits. `\n` = intentional line break within a side. */
const HERO_PRIMARY = {
  left: 'Custom AI,\nsites + software',
  right: 'for organizations\nwith a mission.',
} as const

const HERO_SECONDARY = {
  left: "Salt doesn't\noverpower.",
  right: "It draws out what's\nalready there.",
} as const

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
          case 'homePhilosophySection': {
            const finalCta = sections.find(
              (s): s is SectionOf<'homeFinalCtaSection'> => s._type === 'homeFinalCtaSection',
            )
            return (
              <HomePhilosophy
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
        plans: (item!.plans ?? [])
          .filter((plan) => Boolean(plan?.name && plan?.price))
          .map((plan) => ({
            _key: plan!._key,
            name: plan!.name!,
            price: plan!.price!,
            summary: plan!.summary,
            features: (plan!.features ?? []).filter((f): f is string => Boolean(f?.trim())),
            highlight: plan!.highlight ?? false,
          })),
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
            thought: project!.thought?.trim() || null,
            imageUrl: project!.coverImage?.asset?._ref
              ? urlForImage({asset: {_ref: project!.coverImage.asset._ref}})
                  ?.width(1400)
                  .height(875)
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
        fitCheck:
          item!.fitCheckLabel?.trim() && item!.fitCheckHref?.trim()
            ? {
                label: item!.fitCheckLabel!,
                href: item!.fitCheckHref!,
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

async function HomeProduct({section}: {section: SectionOf<'homeProductSection'>}) {
  const {data: capabilities} = await sanityFetch({query: capabilitiesQuery})

  // Pill pile — names only. Mix kinds so the drop looks varied, not grouped.
  const items = (capabilities ?? [])
    .filter((cap) => Boolean(cap?.name?.trim()))
    .map((cap) => ({
      _id: cap._id,
      name: stegaClean(cap.name ?? '').trim(),
      kind: cap.kind ?? '',
    }))
    .sort((a, b) => {
      // Stable interleave by kind hash so tools/disciplines aren’t clumped
      const ha = a._id.charCodeAt(a._id.length - 1) + a.name.length
      const hb = b._id.charCodeAt(b._id.length - 1) + b.name.length
      return ha - hb || a.name.localeCompare(b.name)
    })
    .map(({_id, name}) => ({_id, name}))

  const waitlistLabel = section.ctaLabel?.trim() || 'Join the waitlist'
  const waitlistBody = section.body?.trim()

  if (items.length === 0 && !waitlistBody && !section.ctaLabel) return null

  return (
    <div className="bg-accent text-white">
      {items.length > 0 ? (
        <HomeCapabilitiesScrub items={items} label="What we work with" />
      ) : null}

      {/* Thin waitlist strip — product CTA parked under the capabilities scrub */}
      <section className="page-chrome border-t border-white/15 py-10 md:py-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end md:gap-10">
          <div className="min-w-0 max-w-[52ch]">
            <p className="font-mono text-[11px] uppercase tracking-label text-white/55">
              {section.headline?.trim() || 'What we’re building'}
            </p>
            {waitlistBody ? (
              <p className="mt-2 text-base leading-relaxed text-white/85">
                {waitlistBody}
              </p>
            ) : null}
          </div>
          <Link
            href={WAITLIST_HREF}
            className="inline-flex shrink-0 items-center gap-2 rounded border border-white bg-white px-5 py-3 font-mono text-[12px] font-medium uppercase tracking-label text-[#08090A] transition-colors duration-300 hover:bg-white/90"
          >
            {waitlistLabel}
            <ArrowUpRight aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />
          </Link>
        </div>
      </section>
    </div>
  )
}

function HomePhilosophy({
  section,
  closingLine,
  emailLine,
  cta,
}: {
  section: SectionOf<'homePhilosophySection'>
  closingLine?: string | null
  emailLine?: string | null
  cta?: SectionOf<'homeFinalCtaSection'>['cta']
}) {
  if (!section.line1 && !section.line2) return null

  // "Subtle. Essential. Transformative." → three stacked display lines
  const displayLines = (section.line1 ?? '')
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean)

  const supportBase = section.line2?.trim().replace(/\.$/, '') ?? ''
  const closing = closingLine?.trim().replace(/\.$/, '') ?? ''
  // e.g. "We draw out the good that's already there, one build at a time."
  const support = closing
    ? `${supportBase}, ${closing.charAt(0).toLowerCase()}${closing.slice(1)}.`
    : supportBase
      ? `${supportBase}.`
      : ''
  const email = emailLine?.trim()
  const ctaLabel = normalizeCtaLabel(cta?.buttonLabel)
  const ctaHref = resolveCtaHref(cta)

  return (
    <section
      aria-label="Philosophy"
      className="page-chrome flex min-h-[85vh] flex-col items-center justify-center border-t border-foreground/15 py-24 text-center md:min-h-screen md:py-32"
    >
      {displayLines.length > 0 ? (
        <LineReveal as="h2" className="text-display font-semibold text-foreground">
          {displayLines.map((line) => (
            <span key={line} className="block">
              {line}.
            </span>
          ))}
        </LineReveal>
      ) : null}

      {support ? (
        <LineReveal
          as="p"
          delay={0.22}
          className="mt-8 max-w-[38ch] text-[clamp(1.125rem,2.1vw,1.5rem)] font-normal leading-snug tracking-[-0.01em] text-foreground/70 md:mt-10"
        >
          {support}
        </LineReveal>
      ) : null}

      <div className="mt-10 flex flex-col items-center gap-3 md:mt-12">
        <Link href={ctaHref} className="btn-solid">
          {ctaLabel}
          <ArrowUpRight aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />
        </Link>
        {email ? (
          <p className="max-w-[42ch] font-mono text-[12px] uppercase tracking-label text-foreground/40">
            {email}
          </p>
        ) : null}
      </div>
    </section>
  )
}
