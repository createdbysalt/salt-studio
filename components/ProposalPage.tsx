import {ProposalApproach} from '@/components/ProposalApproach'
import {ProposalCoverDots} from '@/components/ProposalCoverDots'
import {ProposalCoverFrame} from '@/components/ProposalCoverFrame'
import {ProposalLockup} from '@/components/ProposalLockup'
import {ProposalOutcomes, ProposalSwirlField} from '@/components/ProposalOutcomes'
import {ProposalProof} from '@/components/ProposalProof'
import {ProposalRail, type ProposalRailItem} from '@/components/ProposalRail'
import {ProposalSituationIcon} from '@/components/ProposalSituationIcon'
import type {ProposalByTokenQueryResult} from '@/sanity.types'
import {urlForImage} from '@/sanity/lib/utils'
import {stegaClean} from 'next-sanity'
import Link from 'next/link'
import type {ReactNode} from 'react'

export type ProposalDocument = NonNullable<ProposalByTokenQueryResult>
type Section = NonNullable<ProposalDocument['sections']>[number]
type PackageOption = NonNullable<ProposalDocument['packages']>[number]
type AddOnOption = NonNullable<ProposalDocument['addOns']>[number]
type Phase = NonNullable<PackageOption['phases']>[number]

export type ProposalSelection = {
  packageId: string | null
  addonIds: string[]
  kickoffDate: string | null
}

type ProposalQuery = {
  package?: string | string[]
  addon?: string | string[]
  kickoff?: string | string[]
}

type View = {
  token: string
  proposal: ProposalDocument
  selection: ProposalSelection
  selectedPackage: PackageOption | null
  selectedAddOns: AddOnOption[]
  expired: boolean
  accepted: boolean
}

export function resolveProposalSelection(
  proposal: ProposalDocument,
  query: ProposalQuery,
): ProposalSelection {
  const packages = proposal.packages ?? []
  const requestedPackage = firstQueryValue(query.package)
  const packageId =
    packages.find((item) => item._id === requestedPackage)?._id ??
    packages.find((item) => item._id === proposal.recommendedPackageId)?._id ??
    packages[0]?._id ??
    null

  const knownAddOns = new Set((proposal.addOns ?? []).map((item) => item._id))
  const addonIds = queryValues(query.addon).filter((id) => knownAddOns.has(id))

  const kickoffs = proposal.kickoffOptions ?? []
  const requestedKickoff = firstQueryValue(query.kickoff)
  const kickoffDate =
    kickoffs.find((item) => item.date === requestedKickoff)?.date ?? kickoffs[0]?.date ?? null

  return {packageId, addonIds, kickoffDate}
}

export function ProposalPage({
  token,
  proposal,
  selection,
}: {
  token: string
  proposal: ProposalDocument
  selection: ProposalSelection
}) {
  const packages = proposal.packages ?? []
  const selectedPackage = packages.find((item) => item._id === selection.packageId) ?? null
  const selectedAddOns = (proposal.addOns ?? []).filter((item) =>
    selection.addonIds.includes(item._id),
  )
  const view: View = {
    token,
    proposal,
    selection,
    selectedPackage,
    selectedAddOns,
    expired: proposalIsExpired(proposal),
    accepted: proposal.status === 'signed' || proposal.status === 'paid',
  }
  const slides = (proposal.sections ?? []).flatMap((section) => {
    if (section.enabled === false || !sectionIsShown(section, view)) return []
    const content = renderSection(section, view)
    if (!content) return []
    const anchor = railAnchor(section._type)
    return [{key: section._key, anchor, content, field: slideField(section._type)}]
  })

  const clientName = line(proposal.clientDisplayName) || 'You'
  const clientLogo = proposal.clientLogo
  const clientLogoUrl = clientLogo?.asset?._ref
    ? urlForImage({asset: clientLogo.asset})?.height(160).url()
    : undefined

  return (
    <article className="bg-background text-foreground">
      <ProposalLockup
        client={clientName}
        logoUrl={clientLogoUrl}
        logoAlt={line(clientLogo?.alt) || clientName}
        acceptHref={view.accepted ? '#signed' : '#accept'}
      />
      <ProposalRail items={slides.map((slide) => slide.anchor)} />

      {renderProposalSlides(slides)}

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-[max(4.5rem,var(--spacing-gutter))] py-8 font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
          <p>Private proposal</p>
          <p>Salt Studio</p>
        </div>
      </footer>
    </article>
  )
}

type ProposalSlide = {
  key: string
  anchor: ProposalRailItem
  content: ReactNode
  field: {className: string; dark: boolean}
}

/**
 * Outcome and approach share one shader. The field is one viewport tall
 * and sticks while those two sections are on screen, then leaves with them.
 * Proof is the gray sheet after them.
 */
function renderProposalSlides(slides: ProposalSlide[]) {
  const nodes: ReactNode[] = []
  let index = 0
  while (index < slides.length) {
    const slide = slides[index]
    const next = slides[index + 1]
    if (slide?.anchor.id === 'outcome') {
      const band = next?.anchor.id === 'approach' ? [slide, next] : [slide]
      nodes.push(
        <div key={`${slide.key}-field`} className="relative">
          <div aria-hidden className="pointer-events-none sticky top-0 z-0 h-dvh">
            <div className="relative h-full overflow-hidden">
              <ProposalSwirlField />
            </div>
          </div>
          <div className="relative z-[1] -mt-[100dvh]">
            {band.map((item) => proposalSlide(item))}
          </div>
        </div>,
      )
      index += band.length
      continue
    }
    if (slide) nodes.push(proposalSlide(slide))
    index += 1
  }
  return nodes
}

function proposalSlide(slide: ProposalSlide) {
  const shell =
    slide.anchor.id === 'situation'
      ? 'relative z-10 -mt-10 -mb-10 overflow-hidden rounded-[40px]'
      : slide.anchor.id === 'cover'
        ? 'relative flex flex-col'
        : slide.anchor.id === 'outcome'
          ? 'relative z-10'
          : slide.anchor.id === 'approach'
            ? 'relative z-10'
            : slide.anchor.id === 'proof'
              ? 'relative z-10 -mt-10 -mb-10 overflow-hidden rounded-[40px]'
              : 'flex min-h-dvh flex-col justify-center'

  return (
    <div
      key={slide.key}
      id={slide.anchor.id}
      data-theme={slide.field.dark ? 'dark' : undefined}
      style={
        slide.anchor.id === 'cover'
          ? {backgroundColor: '#ffffff', backgroundImage: 'none'}
          : undefined
      }
      className={`${shell} ${slide.field.className}`}
    >
      {slide.anchor.id === 'cover' ? <ProposalCoverDots /> : null}
      {slide.content}
      {slide.anchor.id === 'cover' ? (
        <div aria-hidden className="h-[calc(var(--spacing-6)+2.5rem)] shrink-0" />
      ) : null}
    </div>
  )
}

function sectionIsShown(section: Section, view: View) {
  if (section._type === 'proposalSignedSection') return view.accepted
  if (section._type === 'proposalAcceptSection') return !view.accepted
  if (section._type === 'proposalOfferSection') {
    return offerIsOpen(view.proposal.sameDayOffer) && !view.expired && !view.accepted
  }
  return true
}

function slideField(type: Section['_type']): {className: string; dark: boolean} {
  switch (type) {
    case 'proposalCoverSection':
      return {
        className: 'proposal-cover-ground',
        dark: false,
      }
    case 'proposalSituationSection':
      return {className: 'bg-[#f3f3f3]', dark: false}
    case 'proposalOutcomesSection':
    case 'proposalPhasesSection':
      return {className: 'bg-transparent', dark: false}
    case 'proposalProofSection':
      return {className: 'bg-[#f3f3f3]', dark: false}
    case 'proposalAddOnsSection':
    case 'proposalScheduleSection':
      return {className: 'bg-paper', dark: false}
    case 'proposalPackagesSection':
    case 'proposalOfferSection':
    case 'proposalInvestmentSection':
    case 'proposalSowSection':
    case 'proposalTermsSection':
    case 'proposalAcceptSection':
    case 'proposalSignedSection':
      return {className: 'bg-background', dark: false}
    default: {
      const unhandled: never = type
      return unhandled
    }
  }
}

function renderSection(section: Section, view: View): ReactNode {
  switch (section._type) {
    case 'proposalCoverSection':
      return <Cover section={section} view={view} />
    case 'proposalSituationSection':
      return <Situation section={section} />
    case 'proposalOutcomesSection':
      return <Outcomes section={section} />
    case 'proposalPhasesSection':
      return <Phases section={section} />
    case 'proposalProofSection':
      return <Proof section={section} />
    case 'proposalPackagesSection':
      return <Packages section={section} view={view} />
    case 'proposalAddOnsSection':
      return <AddOns section={section} view={view} />
    case 'proposalOfferSection':
      return <Offer section={section} view={view} />
    case 'proposalInvestmentSection':
      return <Investment section={section} view={view} />
    case 'proposalSowSection':
      return <Statement section={section} view={view} />
    case 'proposalScheduleSection':
      return <Schedule section={section} view={view} />
    case 'proposalTermsSection':
      return <Terms section={section} view={view} />
    case 'proposalAcceptSection':
      return <Accept section={section} view={view} />
    case 'proposalSignedSection':
      return <Signed section={section} view={view} />
    default: {
      const unhandled: never = section
      void unhandled
      return null
    }
  }
}

function Cover({
  section,
  view,
}: {
  section: Extract<Section, {_type: 'proposalCoverSection'}>
  view: View
}) {
  const headline = line(section.outcomeHeadline) || line(view.proposal.clientDisplayName)
  const emphasis = line(section.headlineEmphasis)
  const image = section.coverImage
  const imageUrl = image?.asset?._ref
    ? urlForImage({asset: {_ref: image.asset._ref}})
        ?.width(2400)
        .height(1200)
        .url()
    : undefined

  return (
    <section
      data-proposal-enter="cover"
      className="relative z-[1] flex min-h-dvh flex-1 flex-col justify-end px-[max(2.5rem,var(--spacing-gutter))] pb-6 pt-28 md:px-[max(3rem,var(--spacing-gutter))] lg:px-[max(4.5rem,var(--spacing-gutter))]"
    >
      <div className="relative z-10 mb-2 flex justify-center">
        <h1 className="max-w-4xl text-center text-[clamp(2.85rem,8.6vw,3.75rem)] font-[560] leading-[0.92] tracking-[var(--tracking-display)] md:text-[clamp(3.75rem,7vw,5.5rem)] md:leading-[0.9] lg:text-[clamp(3rem,7.2vw,8.5rem)]">
          {withEmphasis(headline, emphasis)}
        </h1>
      </div>
      <ProposalCoverFrame
        src={imageUrl}
        alt={line(image?.alt)}
        caption={line(section.effectPhrase)}
      />
    </section>
  )
}

function railAnchor(type: Section['_type']): ProposalRailItem {
  switch (type) {
    case 'proposalCoverSection':
      return {id: 'cover', label: 'Cover'}
    case 'proposalSituationSection':
      return {id: 'situation', label: 'Situation'}
    case 'proposalOutcomesSection':
      return {id: 'outcome', label: 'Outcome'}
    case 'proposalPhasesSection':
      return {id: 'approach', label: 'Approach'}
    case 'proposalProofSection':
      return {id: 'proof', label: 'Work'}
    case 'proposalPackagesSection':
      return {id: 'packages', label: 'Packages'}
    case 'proposalAddOnsSection':
      return {id: 'add-ons', label: 'Add-ons'}
    case 'proposalOfferSection':
      return {id: 'offer', label: 'Offer'}
    case 'proposalInvestmentSection':
      return {id: 'investment', label: 'Investment'}
    case 'proposalSowSection':
      return {id: 'scope', label: 'Scope'}
    case 'proposalScheduleSection':
      return {id: 'schedule', label: 'Schedule'}
    case 'proposalTermsSection':
      return {id: 'terms', label: 'Terms'}
    case 'proposalAcceptSection':
      return {id: 'accept', label: 'Accept'}
    case 'proposalSignedSection':
      return {id: 'signed', label: 'Signed'}
    default: {
      const unhandled: never = type
      return unhandled
    }
  }
}

/**
 * A light gray sheet after the cover. The eyebrow is the same on every
 * proposal. The problem line is large and regular, and each card keeps
 * the same height. The sheet ends with the same padding it opens with.
 */
function Situation({section}: {section: Extract<Section, {_type: 'proposalSituationSection'}>}) {
  const cards = (section.cards ?? []).filter((card) => line(card.title) || line(card.quote))
  if (cards.length === 0) return null

  const problem = line(section.problemLine)
  const columns = cards.length === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'

  return (
    <section className="flex min-h-dvh w-full flex-col justify-center px-[max(3.5rem,var(--spacing-gutter))] py-32 md:px-[max(4.5rem,var(--spacing-gutter))] lg:py-40">
      <header>
        <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
          What we heard
        </p>
        {problem ? (
          <h2 className="mt-3 max-w-[9em] text-[clamp(2.5rem,6.4vw,6rem)] font-normal leading-[0.95] tracking-[-0.05em]">
            {problem}
          </h2>
        ) : null}
      </header>

      <ul className={`mt-6 grid grid-cols-1 gap-3 md:mt-7 ${columns}`}>
        {cards.map((card) => {
          const quote = line(card.quote)
          return (
            <li
              key={card._key}
              className="flex h-[300px] flex-col rounded-[20px] bg-[#e6e6e6] px-4 py-5 md:px-5"
            >
              <ProposalSituationIcon name={card.icon} />
              <div className="mt-auto">
                <h3 className="text-[1.15rem] font-medium leading-snug md:text-[1.25rem]">
                  {line(card.title)}
                </h3>
                {quote ? (
                  <p className="mt-2 text-[1.15rem] font-medium leading-snug text-[#8f8f8f] md:text-[1.25rem]">
                    {quote}
                  </p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Outcomes({section}: {section: Extract<Section, {_type: 'proposalOutcomesSection'}>}) {
  const cards = (section.cards ?? [])
    .map((card) => ({
      key: card._key,
      title: line(card.title),
      body: line(card.body),
    }))
    .filter((card) => card.title || card.body)
  if (cards.length === 0) return null

  return <ProposalOutcomes heading={line(section.heading)} cards={cards} />
}

function Phases({section}: {section: Extract<Section, {_type: 'proposalPhasesSection'}>}) {
  const phases = (section.phases ?? [])
    .map((phase) => ({
      key: phase._key,
      name: line(phase.name),
      summary: line(phase.summary),
      weeks: line(phase.weeks),
    }))
    .filter((phase) => phase.name)
  if (phases.length === 0) return null

  const questions = (section.questions ?? []).flatMap((item) => {
    const question = line(item.question)
    const answer = line(item.answer)
    if (!question || !answer) return []
    return [{key: item._key, question, answer}]
  })

  return (
    <ProposalApproach
      heading={line(section.heading) || 'How we get there'}
      intro={line(section.intro)}
      phases={phases}
      questionsHeading={line(section.questionsHeading) || 'How this gets built.'}
      questions={questions}
    />
  )
}

function Proof({section}: {section: Extract<Section, {_type: 'proposalProofSection'}>}) {
  const quote = (section.testimonials ?? []).find((item) => line(item.quote))
  const projects = (section.projects ?? []).flatMap((item) => {
    const project = item.project
    const title = line(project?.title)
    if (!project || !title) return []
    const imageUrl = project.coverImage
      ? urlForImage(project.coverImage)?.width(1600).height(900).url()
      : undefined
    return [
      {
        key: item._key,
        title,
        note: line(item.note),
        imageUrl,
        videoUrl: line(project.videoUrl),
      },
    ]
  })
  if (projects.length === 0 && !quote) return null

  return (
    <ProposalProof
      eyebrow="What we make"
      line="A few projects we're proud of."
      attribution={[line(quote?.author), line(quote?.role)].filter(Boolean).join(' · ')}
      projects={projects}
    />
  )
}

function Packages({
  section,
  view,
}: {
  section: Extract<Section, {_type: 'proposalPackagesSection'}>
  view: View
}) {
  const packages = view.proposal.packages ?? []
  if (packages.length === 0) return null

  return (
    <SectionBlock heading={line(section.heading) || 'The engagement'} intro={line(section.intro)}>
      <div className={`grid gap-4 ${packages.length > 1 ? 'lg:grid-cols-2' : ''}`}>
        {packages.map((pkg) => {
          const selected = pkg._id === view.selection.packageId
          const recommended = pkg._id === view.proposal.recommendedPackageId
          return (
            <Link
              key={pkg._id}
              href={proposalHref(
                view.token,
                pkg._id,
                view.selection.addonIds,
                view.selection.kickoffDate,
              )}
              scroll={false}
              aria-current={selected ? 'true' : undefined}
              className={`flex flex-col border p-6 md:p-8 ${
                selected ? 'border-foreground bg-surface' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-[length:var(--text-h3)] leading-[var(--text-h3--line-height)] tracking-[var(--tracking-heading)]">
                  {line(pkg.name)}
                </h3>
                {recommended ? (
                  <span className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.08em]">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                    Recommended
                  </span>
                ) : null}
              </div>
              <p className="mt-4 text-lg leading-relaxed text-foreground/80">{line(pkg.summary)}</p>
              <ul className="mt-6 grid gap-2 text-base">
                {(pkg.includedItems ?? []).map((item) => (
                  <li key={item} className="border-t border-border-subtle py-2">
                    {line(item)}
                  </li>
                ))}
              </ul>
              <p className="mt-8 font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
                Amount shown at signing
              </p>
            </Link>
          )
        })}
      </div>
    </SectionBlock>
  )
}

function AddOns({
  section,
  view,
}: {
  section: Extract<Section, {_type: 'proposalAddOnsSection'}>
  view: View
}) {
  const addOns = view.proposal.addOns ?? []
  if (addOns.length === 0) return null

  return (
    <SectionBlock heading={line(section.heading) || 'Add-ons'} intro={line(section.intro)}>
      <ul className="border-t border-border">
        {addOns.map((addOn) => {
          const selected = view.selection.addonIds.includes(addOn._id)
          const nextIds = selected
            ? view.selection.addonIds.filter((id) => id !== addOn._id)
            : [...view.selection.addonIds, addOn._id]
          return (
            <li key={addOn._id} className="border-b border-border">
              <Link
                href={proposalHref(
                  view.token,
                  view.selection.packageId,
                  nextIds,
                  view.selection.kickoffDate,
                )}
                scroll={false}
                aria-pressed={selected}
                className="flex items-start gap-4 py-5"
              >
                <span
                  className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center border ${
                    selected ? 'border-foreground bg-foreground' : 'border-foreground/40'
                  }`}
                  aria-hidden="true"
                >
                  {selected ? <span className="h-1.5 w-1.5 bg-background" /> : null}
                </span>
                <span>
                  <span className="block text-lg">{line(addOn.name)}</span>
                  <span className="mt-1 block text-foreground/70">{line(addOn.line)}</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </SectionBlock>
  )
}

function Offer({
  section,
  view,
}: {
  section: Extract<Section, {_type: 'proposalOfferSection'}>
  view: View
}) {
  const offer = view.proposal.sameDayOffer
  if (!offerIsOpen(offer) || view.expired || view.accepted) return null

  return (
    <section className="bg-ink text-paper">
      <div className="mx-auto w-full max-w-6xl px-[max(4.5rem,var(--spacing-gutter))] py-16 md:py-24">
        <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-paper/60">
          {line(section.heading) || 'If you sign today'}
        </p>
        <h2 className="mt-4 max-w-3xl text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] tracking-[var(--tracking-heading)]">
          {line(offer?.bonusTitle)}
        </h2>
        {line(offer?.bonusDetail) ? (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/80">
            {line(offer?.bonusDetail)}
          </p>
        ) : null}
      </div>
    </section>
  )
}

function Investment({
  section,
  view,
}: {
  section: Extract<Section, {_type: 'proposalInvestmentSection'}>
  view: View
}) {
  const steps = view.proposal.paymentSchedule?.steps ?? []

  return (
    <SectionBlock heading={line(section.heading) || 'Investment'}>
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end">
        <div>
          <p className="text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] tracking-[var(--tracking-heading)]">
            Amount shown at signing
          </p>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-foreground/80">
            The total is calculated on the server from the package and add-ons you choose. This page
            does not keep a price of its own.
          </p>
        </div>
        <dl className="border-t border-border">
          <div className="flex items-baseline justify-between gap-4 border-b border-border py-3">
            <dt>Package</dt>
            <dd>{line(view.selectedPackage?.name) || 'Choose one'}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-b border-border py-3">
            <dt>Add-ons</dt>
            <dd className="text-right">
              {view.selectedAddOns.length > 0
                ? view.selectedAddOns.map((item) => line(item.name)).join(', ')
                : 'None'}
            </dd>
          </div>
          {steps.map((step) => (
            <div
              key={step._key}
              className="flex items-baseline justify-between gap-4 border-b border-border py-3"
            >
              <dt>{line(step.trigger)}</dt>
              <dd>{step.percent ? `${step.percent}%` : ''}</dd>
            </div>
          ))}
        </dl>
      </div>
    </SectionBlock>
  )
}

function Statement({
  section,
  view,
}: {
  section: Extract<Section, {_type: 'proposalSowSection'}>
  view: View
}) {
  const deliverables = [
    ...(view.selectedPackage?.deliverables ?? []),
    ...view.selectedAddOns.flatMap((addOn) => addOn.deliverables ?? []),
  ]
  const exclusions = uniqueLines([
    ...(view.selectedPackage?.outOfScope ?? []).map((item) => item.text),
    ...view.selectedAddOns.flatMap((addOn) => (addOn.outOfScope ?? []).map((item) => item.text)),
  ])
  const packagePhases = (view.selectedPackage?.phases ?? []).filter((phase) => line(phase.name))
  const phases = packagePhases.length > 0 ? packagePhases : phasesFromApproach(view.proposal)
  const msaVersion = line(view.proposal.msa?.version)

  return (
    <SectionBlock heading="Statement of Work">
      <div className="grid gap-12">
        {line(section.overview) ? (
          <p className="max-w-3xl text-lg leading-relaxed">{line(section.overview)}</p>
        ) : null}
        <dl className="grid gap-6 md:grid-cols-2">
          <div>
            <dt className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
              Parties
            </dt>
            <dd className="mt-2 text-lg">
              Salt Studio and{' '}
              {line(view.proposal.clientLegalName) || line(view.proposal.clientDisplayName)}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
              Order of precedence
            </dt>
            <dd className="mt-2 text-lg">
              The Master Services Agreement{msaVersion ? ` ${msaVersion}` : ''} governs. This scope
              names the specific work.
            </dd>
          </div>
        </dl>
        {deliverables.length > 0 ? (
          <div>
            <h3 className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
              Deliverables
            </h3>
            <ol className="mt-4 border-t border-border">
              {deliverables.map((item, index) => (
                <li
                  key={item._key}
                  className="grid gap-2 border-b border-border py-5 md:grid-cols-[4rem_minmax(0,1fr)]"
                >
                  <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-lg">{line(item.name)}</p>
                    <p className="mt-2 text-foreground/80">{line(item.description)}</p>
                    {line(item.acceptanceCriteria) ? (
                      <p className="mt-2 text-foreground/70">
                        Done when: {line(item.acceptanceCriteria)}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
        {exclusions.length > 0 ? <BulletBlock title="Out of scope" items={exclusions} /> : null}
        {phases.length > 0 ? (
          <div>
            <h3 className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
              Timeline
            </h3>
            <div className="mt-4">
              <PhaseList phases={phases} />
            </div>
          </div>
        ) : null}
        <BulletBlock title="What we need from you" items={section.clientResponsibilities ?? []} />
        <BulletBlock title="Assumptions" items={section.assumptions ?? []} />
        {line(section.acceptanceProcess) ? (
          <CopyBlock title="Acceptance" body={line(section.acceptanceProcess)} />
        ) : null}
        {line(section.ownership) ? (
          <CopyBlock title="Ownership" body={line(section.ownership)} />
        ) : null}
        {line(section.postLaunch) ? (
          <CopyBlock title="After launch" body={line(section.postLaunch)} />
        ) : null}
      </div>
    </SectionBlock>
  )
}

function Schedule({
  section,
  view,
}: {
  section: Extract<Section, {_type: 'proposalScheduleSection'}>
  view: View
}) {
  const steps = view.proposal.paymentSchedule?.steps ?? []
  if (steps.length === 0 && !line(section.excludedNote)) return null

  return (
    <SectionBlock heading={line(section.heading) || 'Payment schedule'}>
      <ol className="grid gap-px bg-border md:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step._key} className="bg-background p-6 md:p-8">
            <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
              {String(index + 1).padStart(2, '0')}
            </p>
            <p className="mt-3 text-[length:var(--text-h3)] leading-[var(--text-h3--line-height)] tracking-[var(--tracking-heading)]">
              {step.percent ? `${step.percent}%` : 'Payment'}
            </p>
            <p className="mt-2 text-lg text-foreground/80">{line(step.trigger)}</p>
          </li>
        ))}
      </ol>
      {line(section.excludedNote) ? (
        <p className="mt-6 max-w-2xl text-foreground/70">{line(section.excludedNote)}</p>
      ) : null}
      <p className="mt-4 max-w-2xl text-foreground/70">
        The first payment is collected here. Later payments are invoiced. They are not charged
        automatically.
      </p>
    </SectionBlock>
  )
}

function Terms({
  section,
  view,
}: {
  section: Extract<Section, {_type: 'proposalTermsSection'}>
  view: View
}) {
  const msa = view.proposal.msa
  const version = line(msa?.version)
  const pdfUrl = msa?.pdfUrl

  return (
    <SectionBlock heading="Terms">
      <div className="grid gap-8 md:grid-cols-2">
        <CopyBlock
          title="How long this holds"
          body={
            line(section.validityNote) ||
            (view.proposal.validUntil
              ? `Held through ${formatTimestamp(view.proposal.validUntil)}.`
              : '')
          }
        />
        <CopyBlock title="Change orders" body={line(section.changeOrderRule)} />
        <div>
          <h3 className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
            Agreement
          </h3>
          {pdfUrl ? (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-lg underline"
            >
              Master Services Agreement{version ? ` ${version}` : ''}
            </a>
          ) : (
            <p className="mt-2 text-lg">
              Master Services Agreement{version ? ` ${version}` : ''}
              {line(msa?.effectiveDate) ? `, effective ${formatDay(line(msa?.effectiveDate))}` : ''}
            </p>
          )}
        </div>
      </div>
    </SectionBlock>
  )
}

function Accept({
  section,
  view,
}: {
  section: Extract<Section, {_type: 'proposalAcceptSection'}>
  view: View
}) {
  if (view.accepted) return null
  if (view.expired) {
    return (
      <SectionBlock heading="This proposal has expired">
        <p className="max-w-2xl text-lg leading-relaxed">
          The price and the kickoff dates are no longer held. Write back and a new proposal can go
          out.
        </p>
      </SectionBlock>
    )
  }

  const kickoffs = view.proposal.kickoffOptions ?? []
  const version = line(view.proposal.msa?.version)
  const email = line(view.proposal.signerEmail)

  return (
    <SectionBlock heading={line(section.prompt) || 'Accept and pay'}>
      <form className="grid max-w-xl gap-8">
        {kickoffs.length > 0 ? (
          <fieldset>
            <legend className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
              Kickoff
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {kickoffs.map((option) => {
                const selected = option.date === view.selection.kickoffDate
                return (
                  <Link
                    key={option._key}
                    href={proposalHref(
                      view.token,
                      view.selection.packageId,
                      view.selection.addonIds,
                      option.date,
                    )}
                    scroll={false}
                    aria-current={selected ? 'true' : undefined}
                    className={`border px-4 py-3 font-mono text-[12px] uppercase tracking-[0.08em] ${
                      selected ? 'border-foreground bg-foreground text-background' : 'border-border'
                    }`}
                  >
                    {line(option.label) || formatDay(option.date ?? '')}
                  </Link>
                )
              })}
            </div>
          </fieldset>
        ) : null}
        <label className="block">
          <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
            Full name
          </span>
          <input
            name="signerName"
            autoComplete="name"
            className="mt-2 w-full border-b border-border bg-transparent py-3 text-lg outline-none focus:border-foreground"
          />
        </label>
        <label className="flex items-start gap-3 text-lg leading-relaxed">
          <input type="checkbox" className="mt-1.5 h-4 w-4 accent-ink" />
          <span>
            {line(section.checkboxLabel) ||
              'I agree to the Master Services Agreement and this Statement of Work.'}
            {version ? ` Version ${version}.` : ''}
          </span>
        </label>
        {email ? (
          <p className="text-foreground/70">The signed scope and receipt go to {email}.</p>
        ) : null}
        <div>
          <button type="button" disabled className="btn-solid cursor-not-allowed opacity-40">
            Pay the first payment
          </button>
          <p className="mt-3 text-foreground/70">You sign before you pay. Payment connects next.</p>
        </div>
      </form>
    </SectionBlock>
  )
}

function Signed({
  section,
  view,
}: {
  section: Extract<Section, {_type: 'proposalSignedSection'}>
  view: View
}) {
  if (!view.accepted) return null
  const steps = (section.nextSteps ?? []).map((step) => line(step)).filter(Boolean)

  return (
    <SectionBlock heading={line(section.heading) || 'Signed.'}>
      {steps.length > 0 ? (
        <ol className="grid max-w-2xl gap-4">
          {steps.map((step, index) => (
            <li key={step} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3 text-lg">
              <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-lg">The scope is signed. What happens next is on its way.</p>
      )}
    </SectionBlock>
  )
}

function SectionBlock({
  id,
  heading,
  intro,
  panel,
  children,
}: {
  id?: string
  heading: string
  intro?: string
  panel?: boolean
  children: ReactNode
}) {
  return (
    <section id={id}>
      <div className="mx-auto w-full max-w-6xl px-[max(4.5rem,var(--spacing-gutter))] py-16 md:py-24">
        <h2 className="max-w-3xl text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] tracking-[var(--tracking-heading)]">
          {heading}
        </h2>
        {intro ? (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground/80">{intro}</p>
        ) : null}
        <div className={panel ? 'mt-10 overflow-hidden rounded-[16px] bg-background' : 'mt-10'}>
          {children}
        </div>
      </div>
    </section>
  )
}

function PhaseList({phases}: {phases: Array<Phase | null>}) {
  const items = phases.filter((phase): phase is Phase => Boolean(phase && line(phase.name)))
  return (
    <ol className="grid gap-px bg-border md:grid-cols-3">
      {items.map((phase) => (
        <li key={phase._key} className="bg-background p-6">
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
            {line(phase.weeks)}
          </p>
          <h3 className="mt-3 text-lg">{line(phase.name)}</h3>
          <p className="mt-2 text-foreground/80">{line(phase.summary)}</p>
        </li>
      ))}
    </ol>
  )
}

function BulletBlock({title, items}: {title: string; items: Array<string | null>}) {
  const lines = uniqueLines(items)
  if (lines.length === 0) return null
  return (
    <div>
      <h3 className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-3 grid gap-2">
        {lines.map((item) => (
          <li key={item} className="text-lg">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function CopyBlock({title, body}: {title: string; body: string}) {
  if (!body) return null
  return (
    <div>
      <h3 className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
        {title}
      </h3>
      <p className="mt-2 text-lg leading-relaxed">{body}</p>
    </div>
  )
}

function phasesFromApproach(proposal: ProposalDocument): Phase[] {
  const approach = (proposal.sections ?? []).find(
    (section): section is Extract<Section, {_type: 'proposalPhasesSection'}> =>
      section._type === 'proposalPhasesSection',
  )
  return (approach?.phases ?? []).map((phase) => ({
    _key: phase._key,
    name: phase.name,
    summary: phase.summary,
    weeks: phase.weeks,
  }))
}

function proposalHref(
  token: string,
  packageId: string | null,
  addonIds: string[],
  kickoff: string | null,
) {
  const params = new URLSearchParams()
  if (packageId) params.set('package', packageId)
  for (const id of addonIds) params.append('addon', id)
  if (kickoff) params.set('kickoff', kickoff)
  const query = params.toString()
  return `/p/${encodeURIComponent(token)}${query ? `?${query}` : ''}`
}

function proposalIsExpired(proposal: ProposalDocument) {
  if (proposal.status === 'expired') return true
  if (!proposal.validUntil) return false
  const end = new Date(proposal.validUntil)
  return !Number.isNaN(end.getTime()) && end.getTime() < Date.now()
}

function offerIsOpen(offer: ProposalDocument['sameDayOffer']) {
  if (!offer?.enabled || !line(offer.bonusTitle)) return false
  if (!offer.deadline) return true
  const end = new Date(offer.deadline)
  return !Number.isNaN(end.getTime()) && end.getTime() >= Date.now()
}

function validityLabel(validUntil: string | null, expired: boolean) {
  if (expired) return 'Expired'
  if (!validUntil) return null
  const end = new Date(validUntil)
  if (Number.isNaN(end.getTime())) return null
  const days = Math.max(1, Math.ceil((end.getTime() - Date.now()) / 86_400_000))
  return days === 1 ? 'Valid for 1 day' : `Valid for ${days} days`
}

function formatTimestamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Los_Angeles',
  }).format(date)
}

function formatDay(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return value
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function line(value: string | null | undefined) {
  return stegaClean(value ?? '').trim()
}

function withEmphasis(headline: string, emphasis: string): ReactNode {
  if (!emphasis) return headline
  const index = headline.indexOf(emphasis)
  if (index === -1) return headline
  return (
    <>
      {headline.slice(0, index)}
      <span className="font-[family-name:var(--font-emphasis)] text-[1.05em] font-[500] italic tracking-normal">
        {emphasis}
      </span>
      {headline.slice(index + emphasis.length)}
    </>
  )
}

function uniqueLines(values: Array<string | null | undefined>) {
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of values) {
    const text = line(value)
    if (!text || seen.has(text)) continue
    seen.add(text)
    result.push(text)
  }
  return result
}

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function queryValues(value: string | string[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}
