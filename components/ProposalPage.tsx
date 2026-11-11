import {ProposalCoverFrame} from '@/components/ProposalCoverFrame'
import {ProposalLockup} from '@/components/ProposalLockup'
import {ProposalRail, type ProposalRailItem} from '@/components/ProposalRail'
import type {ProposalByTokenQueryResult} from '@/sanity.types'
import {urlForImage} from '@/sanity/lib/utils'
import {stegaClean} from 'next-sanity'
import Image from 'next/image'
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
      />
      <ProposalActions acceptHref={view.accepted ? '#signed' : '#accept'} />
      <ProposalRail items={slides.map((slide) => slide.anchor)} />

      {slides.map((slide) => (
        <div
          key={slide.key}
          id={slide.anchor.id}
          data-theme={slide.field.dark ? 'dark' : undefined}
          className={`flex min-h-dvh flex-col justify-center ${slide.field.className}`}
        >
          {slide.content}
        </div>
      ))}

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-[max(4.5rem,var(--spacing-gutter))] py-8 font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
          <p>Private proposal</p>
          <p>Salt Studio</p>
        </div>
      </footer>
    </article>
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
        className: 'bg-[radial-gradient(85%_75%_at_100%_0%,#eaeaea_0%,#ffffff_58%)]',
        dark: false,
      }
    case 'proposalSituationSection':
    case 'proposalOutcomesSection':
    case 'proposalPhasesSection':
    case 'proposalProofSection':
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
      className="relative flex min-h-dvh flex-1 flex-col justify-end px-[max(3.5rem,var(--spacing-gutter))] pb-6 pt-28 md:px-[max(4.5rem,var(--spacing-gutter))]"
    >
      <div className="relative z-10 mb-2 flex justify-center">
        <h1 className="max-w-4xl text-center text-[clamp(2.25rem,6.2vw,2.85rem)] font-[560] leading-[0.92] tracking-[var(--tracking-display)] md:text-[clamp(3rem,7.2vw,8.5rem)] md:leading-[0.9]">
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

const SALT_EMAIL = 'mailto:hello@createdbysalt.com'
const SALT_WHATSAPP = 'https://wa.me/19712052186'

function ProposalActions({acceptHref}: {acceptHref: string}) {
  const link =
    'flex size-10 items-center justify-center rounded-full text-foreground opacity-45 transition-opacity duration-200 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-foreground'
  const icon = 'h-4 w-4'
  return (
    <nav
      aria-label="Talk to Salt"
      data-proposal-enter="chrome"
      className="pointer-events-none fixed inset-y-0 left-3 z-30 flex items-center"
    >
      <ul className="pointer-events-auto flex flex-col gap-1">
        <li>
          <a href={SALT_EMAIL} aria-label="Email Salt Studio" className={link}>
            <svg viewBox="0 0 24 24" aria-hidden className={icon} fill="none" focusable="false">
              <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M3 7.5l9 6 9-6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </li>
        <li>
          <a
            href={SALT_WHATSAPP}
            aria-label="WhatsApp Salt Studio"
            target="_blank"
            rel="noreferrer"
            className={link}
          >
            <svg viewBox="0 0 24 24" aria-hidden className={icon} focusable="false">
              <path
                fill="currentColor"
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
              />
            </svg>
          </a>
        </li>
        <li>
          <a href={acceptHref} aria-label="Accept and pay" className={link}>
            <svg viewBox="0 0 24 24" aria-hidden className={icon} fill="none" focusable="false">
              <rect
                x="2.5"
                y="5.5"
                width="19"
                height="13"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path d="M2.5 9.5h19" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 14.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </a>
        </li>
      </ul>
    </nav>
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
      return {id: 'proof', label: 'Proof'}
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

function Situation({section}: {section: Extract<Section, {_type: 'proposalSituationSection'}>}) {
  const cards = (section.cards ?? []).filter((card) => line(card.title) || line(card.body))
  if (cards.length === 0) return null

  return (
    <SectionBlock heading={line(section.heading) || 'The situation'} panel>
      <div className="divide-y divide-border">
        {cards.map((card) => (
          <article key={card._key} className="p-6 md:p-10">
            <h3 className="text-[length:var(--text-h3)] leading-[var(--text-h3--line-height)] tracking-[var(--tracking-heading)]">
              {line(card.title)}
            </h3>
            <p className="mt-4 max-w-prose text-lg leading-relaxed text-foreground/80">
              {line(card.body)}
            </p>
          </article>
        ))}
      </div>
    </SectionBlock>
  )
}

function Outcomes({section}: {section: Extract<Section, {_type: 'proposalOutcomesSection'}>}) {
  const cards = (section.cards ?? []).filter((card) => line(card.title) || line(card.body))
  if (cards.length === 0) return null

  return (
    <SectionBlock heading={line(section.heading) || 'What changes'} panel>
      <ol className="grid md:grid-cols-3 md:divide-x md:divide-border">
        {cards.map((card, index) => (
          <li key={card._key} className="p-6 md:p-8">
            <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
              {String(index + 1).padStart(2, '0')}
            </p>
            <h3 className="mt-3 text-[length:var(--text-h3)] leading-[var(--text-h3--line-height)] tracking-[var(--tracking-heading)]">
              {line(card.title)}
            </h3>
            <p className="mt-3 text-lg leading-relaxed text-foreground/80">{line(card.body)}</p>
          </li>
        ))}
      </ol>
    </SectionBlock>
  )
}

function Phases({section}: {section: Extract<Section, {_type: 'proposalPhasesSection'}>}) {
  const phases = (section.phases ?? []).filter((phase) => line(phase.name))
  if (phases.length === 0) return null

  return (
    <SectionBlock heading={line(section.heading) || 'How we get there'} panel>
      <PhaseList phases={phases} />
    </SectionBlock>
  )
}

function Proof({section}: {section: Extract<Section, {_type: 'proposalProofSection'}>}) {
  const projects = (section.projects ?? []).filter((project) => line(project.title))
  const quotes = (section.testimonials ?? []).filter((quote) => line(quote.quote))
  if (projects.length === 0 && quotes.length === 0) return null

  return (
    <SectionBlock heading={line(section.heading) || 'Proof'}>
      <div className="grid gap-4">
        {quotes.length > 0 ? (
          <div className="flex min-h-[28rem] flex-col justify-end overflow-hidden rounded-[16px] bg-ink px-8 py-12 text-paper md:min-h-[36rem] md:px-12 md:py-16">
            {quotes.map((quote) => (
              <blockquote key={quote._id}>
                <p className="max-w-3xl text-[length:var(--text-h3)] leading-[var(--text-h3--line-height)] tracking-[var(--tracking-heading)]">
                  “{line(quote.quote)}”
                </p>
                <footer className="mt-4 font-mono text-[12px] uppercase tracking-[0.08em] text-paper/60">
                  {[line(quote.author), line(quote.role)].filter(Boolean).join(' · ')}
                </footer>
              </blockquote>
            ))}
          </div>
        ) : null}
        {projects.length > 0 ? (
          <ul className="grid gap-px bg-border sm:grid-cols-2">
            {projects.map((project) => {
              const imageUrl = project.coverImage
                ? urlForImage(project.coverImage)?.width(1200).height(800).url()
                : undefined
              const href = project.slug ? `/projects/${project.slug}` : undefined
              const body = (
                <>
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt=""
                      width={1200}
                      height={800}
                      className="aspect-[3/2] w-full object-cover"
                    />
                  ) : null}
                  <div className="p-6">
                    <p className="text-lg">{line(project.title)}</p>
                    {line(project.year) ? (
                      <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
                        {line(project.year)}
                      </p>
                    ) : null}
                  </div>
                </>
              )
              return (
                <li key={project._id} className="bg-background">
                  {href ? <Link href={href}>{body}</Link> : body}
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </SectionBlock>
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
