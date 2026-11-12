import {ProposalApproach} from '@/components/ProposalApproach'
import {ProposalChoices} from '@/components/ProposalChoices'
import {ProposalCoverDots} from '@/components/ProposalCoverDots'
import {ProposalCoverFrame} from '@/components/ProposalCoverFrame'
import {ProposalLockup} from '@/components/ProposalLockup'
import {ProposalOutcomes, ProposalSwirlField} from '@/components/ProposalOutcomes'
import {ProposalPackages} from '@/components/ProposalPackages'
import {ProposalProof} from '@/components/ProposalProof'
import {ProposalRail, type ProposalRailItem} from '@/components/ProposalRail'
import {ProposalScopePanel} from '@/components/ProposalScopePanel'
import {ProposalSignForm} from '@/components/ProposalSignForm'
import {ProposalSituationIcon} from '@/components/ProposalSituationIcon'
import {SiteFooter} from '@/components/SiteFooter'
import type {PaymentMethod, PaymentStatus} from '@/lib/proposal/acceptances'
import {INVESTMENT_INTRO, PACKAGES_INTRO} from '@/lib/proposal/copy'
import {
  discountedAmount,
  formatAmount,
  formatCents,
  honoredPercent,
  proposalIsAccepted,
  proposalIsExpired,
  quoteInputs,
  quoteSelection,
  selectionKey,
  type ProposalQuote,
  type ProposalSelection,
  type QuoteInputs,
} from '@/lib/proposal/quote'
import type {
  FooterLegalPagesQueryResult,
  ProposalByTokenQueryResult,
  SettingsQueryResult,
} from '@/sanity.types'
import {urlForImage} from '@/sanity/lib/utils'
import {PortableText, stegaClean, type PortableTextBlock} from 'next-sanity'
import Link from 'next/link'
import type {ReactNode} from 'react'

export type ProposalDocument = NonNullable<ProposalByTokenQueryResult>
type Section = NonNullable<ProposalDocument['sections']>[number]
type PackageOption = NonNullable<ProposalDocument['packages']>[number]
type AddOnOption = NonNullable<ProposalDocument['addOns']>[number]

/** The latest payment row, as the page needs it. Supabase is the authority. */
export type ProposalPaymentView = {
  status: PaymentStatus
  method: PaymentMethod
  amountCents: number
  signerName: string | null
  signerEmail: string | null
  /** The kickoff date frozen on the acceptance, YYYY-MM-DD. */
  kickoffDate: string | null
  /** The same-day percent frozen on the signature, if there was one. */
  honoredPercent: number | null
  selectionKey: string | null
  /** A checkout page of theirs is still open and payable. */
  resumable: boolean
}

type View = {
  token: string
  proposal: ProposalDocument
  selection: ProposalSelection
  selectedPackage: PackageOption | null
  selectedAddOns: AddOnOption[]
  expired: boolean
  accepted: boolean
  payment: ProposalPaymentView | null
  now: number
  /** The quote everything on the page is drawn from. */
  inputs: QuoteInputs
  /** True once a signature is on file, which keeps their terms alive. */
  signed: boolean
}

export function ProposalPage({
  token,
  proposal,
  selection,
  payment = null,
  settings = null,
  legalPages = null,
}: {
  token: string
  proposal: ProposalDocument
  selection: ProposalSelection
  payment?: ProposalPaymentView | null
  settings?: SettingsQueryResult | null
  legalPages?: FooterLegalPagesQueryResult | null
}) {
  const packages = proposal.packages ?? []
  const selectedPackage = packages.find((item) => item._id === selection.packageId) ?? null
  const selectedAddOns = (proposal.addOns ?? []).filter((item) =>
    selection.addonIds.includes(item._id),
  )
  const now = Date.now()
  // One set of inputs for the whole page. When the offer window closed but
  // they already signed, their percent is kept, so what is shown here is
  // what checkout will charge.
  const inputs = quoteInputs(proposal, now)
  // Their signature only covers the selection they signed, so a different
  // package or add-on is priced at today's rules, same as the server does.
  const onSignedDeal =
    payment?.selectionKey != null && payment.selectionKey === selectionKey(selection)
  inputs.percent = honoredPercent(
    inputs.percent,
    onSignedDeal && payment ? {same_day_percent: payment.honoredPercent} : null,
  )
  const view: View = {
    token,
    proposal,
    selection,
    selectedPackage,
    selectedAddOns,
    expired: proposalIsExpired(proposal, now),
    accepted: proposalIsAccepted(proposal) || payment?.status === 'paid',
    payment,
    now,
    inputs,
    signed: payment != null && onSignedDeal,
  }
  const slides = (proposal.sections ?? []).flatMap((section) => {
    if (section.enabled === false || !sectionIsShown(section, view)) return []
    if (section._type === 'proposalAddOnsSection' && packagesAreShown(view)) return []
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
    <>
      <article className="relative z-10 bg-background text-foreground">
        <ProposalLockup
          client={clientName}
          logoUrl={clientLogoUrl}
          logoAlt={line(clientLogo?.alt) || clientName}
          acceptHref={view.accepted ? '#signed' : '#investment'}
        />
        <ProposalRail items={slides.map((slide) => slide.anchor)} />

        {renderProposalSlides(slides)}
      </article>
      <SiteFooter settings={settings} legalPages={legalPages} showPageNav={false} compact />
    </>
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
    if (slide?.anchor.id === 'packages') {
      const withInvestment = next?.anchor.id === 'investment'
      const band = withInvestment && next ? [slide, next] : [slide]
      nodes.push(
        <div key={`${slide.key}-field`} className="relative bg-background">
          <ProposalCoverDots />
          <div className="relative z-[1]">
            {band.map((item) => proposalSlide(item, {shareDots: true}))}
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

function proposalSlide(slide: ProposalSlide, options?: {shareDots?: boolean}) {
  const dots =
    !options?.shareDots && (slide.anchor.id === 'cover' || slide.anchor.id === 'packages')
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
              : slide.anchor.id === 'packages'
                ? 'relative flex min-h-dvh flex-col justify-center'
                : slide.anchor.id === 'investment'
                  ? 'relative scroll-mt-28'
                  : 'flex min-h-dvh flex-col justify-center'

  return (
    <div
      key={slide.key}
      id={slide.anchor.id}
      data-theme={slide.field.dark ? 'dark' : undefined}
      style={dots ? {backgroundColor: '#ffffff', backgroundImage: 'none'} : undefined}
      className={`${shell} ${options?.shareDots ? 'bg-transparent' : slide.field.className}`}
    >
      {dots ? <ProposalCoverDots /> : null}
      {slide.anchor.id === 'packages' ? (
        <div className="relative z-[1]">{slide.content}</div>
      ) : (
        slide.content
      )}
      {slide.anchor.id === 'cover' ? (
        <div aria-hidden className="h-[calc(var(--spacing-6)+2.5rem)] shrink-0" />
      ) : null}
    </div>
  )
}

function sectionIsShown(section: Section, view: View) {
  if (section._type === 'proposalSignedSection') return view.accepted
  if (section._type === 'proposalOfferSection') return false
  if (section._type === 'proposalSowSection') return false
  if (section._type === 'proposalTermsSection') return false
  if (section._type === 'proposalScheduleSection') return false
  if (section._type === 'proposalAcceptSection') return false
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
      return null
    case 'proposalInvestmentSection':
      return <Investment section={section} view={view} />
    case 'proposalSowSection':
      return null
    case 'proposalScheduleSection':
      return null
    case 'proposalTermsSection':
      return null
    case 'proposalAcceptSection':
      return null
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
        <h1 className="max-w-4xl text-center text-[clamp(2.6rem,8vw,3.5rem)] font-[560] leading-[0.92] tracking-[var(--tracking-display)] md:text-[clamp(3.75rem,7vw,5.5rem)] md:leading-[0.9] lg:text-[clamp(4.4rem,6.2vw,7.25rem)]">
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
      heading="How we get there"
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
  const discountPercent = view.inputs.percent
  const packages = (view.proposal.packages ?? []).flatMap((pkg) => {
    const name = line(pkg.name)
    if (!pkg._id || !name) return []
    const amount = typeof pkg.amount === 'number' ? pkg.amount : null
    return [
      {
        id: pkg._id,
        name,
        summary: line(pkg.summary),
        items: (pkg.includedItems ?? []).map((item) => line(item)).filter(Boolean),
        scope: (pkg.scope ?? []) as PortableTextBlock[],
        price: formatAmount(amount),
        sale:
          discountPercent != null && amount != null
            ? formatAmount(discountedAmount(amount, discountPercent))
            : null,
        amount,
        recommended: pkg._id === view.proposal.recommendedPackageId,
      },
    ]
  })
  if (packages.length === 0) return null

  const addOnSection = (view.proposal.sections ?? []).find(
    (item): item is Extract<Section, {_type: 'proposalAddOnsSection'}> =>
      item._type === 'proposalAddOnsSection',
  )
  const addOns =
    addOnSection?.enabled === false
      ? []
      : (view.proposal.addOns ?? []).flatMap((addOn) => {
          const name = line(addOn.name)
          if (!addOn._id || !name) return []
          return [
            {
              id: addOn._id,
              name,
              line: line(addOn.line),
              scope: (addOn.scope ?? []) as PortableTextBlock[],
              price: formatAmount(addOn.amount),
            },
          ]
        })

  return (
    <ProposalPackages
      heading="The investment."
      // Editable per proposal, with the shared default when it is left empty.
      intro={line(section.intro) || PACKAGES_INTRO}
      packages={packages}
      addOnHeading="Add-ons"
      addOns={addOns}
      discountPercent={discountPercent}
    />
  )
}

function packagesAreShown(view: View) {
  const shown = (view.proposal.sections ?? []).some(
    (section) => section._type === 'proposalPackagesSection' && section.enabled !== false,
  )
  return shown && (view.proposal.packages ?? []).some((pkg) => pkg._id && line(pkg.name))
}

function AddOns({
  section,
  view,
}: {
  section: Extract<Section, {_type: 'proposalAddOnsSection'}>
  view: View
}) {
  const addOns = view.proposal.addOns ?? []
  if (addOns.length === 0 || packagesAreShown(view)) return null

  return (
    <SectionBlock heading="Add-ons">
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

function Investment({
  section,
  view,
}: {
  section: Extract<Section, {_type: 'proposalInvestmentSection'}>
  view: View
}) {
  const inputs = view.inputs
  const quote = quoteSelection(inputs, view.selection)
  const percent = inputs.percent
  const packages = (view.proposal.packages ?? []).flatMap((pkg) => {
    const name = line(pkg.name)
    if (!pkg._id || !name) return []
    return [pkg]
  })
  const addOns = (view.proposal.addOns ?? []).flatMap((addOn) => {
    const name = line(addOn.name)
    if (!addOn._id || !name) return []
    return [addOn]
  })
  const sections = view.proposal.sections ?? []
  const scope = sections.find(
    (item): item is Extract<Section, {_type: 'proposalSowSection'}> =>
      item._type === 'proposalSowSection' && item.enabled !== false,
  )
  const accept = sections.find(
    (item): item is Extract<Section, {_type: 'proposalAcceptSection'}> =>
      item._type === 'proposalAcceptSection' && item.enabled !== false,
  )
  // Editable per proposal, with the shared default when it is left empty.
  // The split is deliberately not part of this line: it is printed under the
  // total, worked out from the package selected, so there is no sentence here
  // to keep in step when a schedule changes.
  const lead = line(section.intro) || INVESTMENT_INTRO
  const version = line(view.proposal.msa?.version)
  return (
    <section className="w-full px-[max(3.5rem,var(--spacing-gutter))] pt-16 pb-24 md:px-[max(4.5rem,var(--spacing-gutter))] lg:pt-24 lg:pb-32">
      <header className="mx-auto max-w-[40rem] text-center">
        <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
          Accept & Sign
        </p>
        <h2 className="mx-auto mt-3 max-w-[9em] text-[clamp(2.5rem,6.4vw,6rem)] font-normal leading-[0.95] tracking-[-0.05em]">
          We can't wait to work together.
        </h2>
        {lead ? (
          <p className="mx-auto mt-4 max-w-[36rem] text-[1.125rem] font-medium leading-snug tracking-[-0.02em] text-[#5c5c5c]">
            {lead}
          </p>
        ) : null}
      </header>

      <ProposalChoices
        token={view.token}
        kickoff={view.selection.kickoffDate}
        inputs={inputs}
        packageId={view.selection.packageId}
        addonIds={view.selection.addonIds}
        packages={packages.flatMap((pkg) => {
          if (typeof pkg.amount !== 'number') return []
          return [
            {
              id: pkg._id,
              name: line(pkg.name),
              price: formatAmount(pkg.amount),
              sale: percent != null ? formatAmount(discountedAmount(pkg.amount, percent)) : null,
            },
          ]
        })}
        addOns={addOns.flatMap((addOn) => {
          if (typeof addOn.amount !== 'number') return []
          return [{id: addOn._id, name: line(addOn.name), price: formatAmount(addOn.amount)}]
        })}
      />

      {accept && !view.accepted ? (
        <div id="sign" className="mx-auto mt-[4.5rem] w-full max-w-[36rem]">
          {view.expired && !view.signed ? (
            <SignCardNote>
              The price is no longer held. Write back and a new proposal can go out.
            </SignCardNote>
          ) : view.payment?.status === 'processing' ? (
            <SignCardNote title="Your payment is on its way.">
              Bank payments take a few business days to clear. The signed scope and receipt go to
              your email the moment it does.
              <KickoffLink token={view.token} />
            </SignCardNote>
          ) : view.payment?.status === 'pending_wire' ? (
            <SignCardNote title="Wire instructions are on their way.">
              They go to your email for {formatCents(view.payment.amountCents)}. The scope is yours
              as soon as the payment lands.
              <KickoffLink token={view.token} />
            </SignCardNote>
          ) : quote ? (
            <ProposalSignForm
              token={view.token}
              selection={view.selection}
              payLabel={`Pay ${formatCents(quote.firstCents)}`}
              restLine={restLine(quote.totalCents, quote.steps)}
              wireAvailable={quote.firstCents >= 1_000_000}
              resume={resumeFor(view, quote)}
              defaults={{
                legalName: line(view.proposal.clientLegalName),
                email: line(view.proposal.signerEmail),
              }}
              note={
                view.payment?.status === 'failed'
                  ? 'That payment did not go through, and nothing was charged. Try again below.'
                  : null
              }
            >
              <AgreementLine
                label="I agree to the Master Services Agreement and this Statement of Work."
                clientName={line(view.proposal.clientDisplayName)}
                version={version}
                pdfUrl={view.proposal.msa?.pdfUrl ?? null}
                statement={
                  scope ? (
                    <Statement
                      packageName={line(view.selectedPackage?.name)}
                      packageScope={(view.selectedPackage?.scope ?? []) as PortableTextBlock[]}
                      packageItems={view.selectedPackage?.includedItems ?? []}
                      addOns={view.selectedAddOns.map((addOn) => ({
                        name: line(addOn.name),
                        scope: (addOn.scope ?? []) as PortableTextBlock[],
                        line: line(addOn.line),
                      }))}
                      standing={(scope.body ?? []) as PortableTextBlock[]}
                    />
                  ) : null
                }
                agreement={
                  <Agreement
                    body={(view.proposal.msa?.body ?? []) as PortableTextBlock[]}
                    pdfUrl={view.proposal.msa?.pdfUrl ?? null}
                  />
                }
              />
              {version ? ` Version ${version}.` : ''}
            </ProposalSignForm>
          ) : (
            <SignCardNote>Choose a package above to sign.</SignCardNote>
          )}
        </div>
      ) : null}
    </section>
  )
}

/**
 * They signed, went to pay, and came back without finishing. The card then
 * offers to pick that payment up rather than asking them to sign again.
 * Changing the selection moves them off it, because the terms have moved.
 */
function resumeFor(view: View, quote: ProposalQuote) {
  const payment = view.payment
  if (!payment?.resumable || !payment.signerName) return null
  if (payment.selectionKey !== selectionKey(view.selection)) return null
  if (payment.amountCents !== quote.firstCents) return null
  return {signerName: payment.signerName}
}

function KickoffLink({token}: {token: string}) {
  return (
    <span className="mt-6 block">
      <Link
        href={`/p/${encodeURIComponent(token)}/kickoff`}
        className="btn-solid inline-flex min-h-[48px] items-center justify-center px-6"
      >
        Book your kickoff call
      </Link>
    </span>
  )
}

function SignCardNote({title, children}: {title?: string; children: ReactNode}) {
  return (
    <div className="rounded-[32px] border border-white/70 bg-[rgba(228,228,228,0.62)] px-[2rem] py-[2.25rem] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_30px_80px_rgba(40,30,10,0.12)] backdrop-blur-[42px]">
      {title ? (
        <p className="text-[2.5rem] font-medium leading-[1.05] tracking-[-0.04em]">{title}</p>
      ) : null}
      <p
        className={`text-[1.15rem] font-medium leading-snug ${title ? 'mt-4 text-[#5c5c5c]' : ''}`}
      >
        {children}
      </p>
    </div>
  )
}

/** "The remaining $2,475 is invoiced when the work is accepted." */
function restLine(totalCents: number, steps: Array<{amountCents: number; trigger: string}>) {
  if (steps.length < 2) return null
  const rest = totalCents - (steps[0]?.amountCents ?? 0)
  if (steps.length === 2) {
    const trigger = steps[1]?.trigger ?? ''
    return `The remaining ${formatCents(rest)} is invoiced ${trigger.charAt(0).toLowerCase()}${trigger.slice(1)}.`
  }
  return `The remaining ${formatCents(rest)} is invoiced in ${steps.length - 1} later payments.`
}

function AgreementLine({
  label,
  statement,
  agreement,
  clientName,
  version,
  pdfUrl,
}: {
  label: string
  statement: ReactNode
  agreement: ReactNode
  clientName: string
  version: string
  pdfUrl: string | null
}) {
  return (
    <>
      {splitAgreement(label).map((part, index) => {
        if (part.kind === 'text') return <span key={index}>{part.text}</span>
        if (part.kind === 'sow' && !statement) return <span key={index}>{part.text}</span>
        const title = part.kind === 'msa' ? 'Master Services Agreement' : 'Statement of Work'
        const note = [clientName, part.kind === 'msa' && version ? `Version ${version}` : '']
          .filter(Boolean)
          .join(' · ')
        return (
          <ProposalScopePanel
            key={index}
            appearance="inline"
            label={part.text}
            title={title}
            dismissLabel={
              part.kind === 'msa'
                ? 'Dismiss the Master Services Agreement'
                : 'Dismiss scope of work'
            }
            closeLabel={
              part.kind === 'msa' ? 'Close the Master Services Agreement' : 'Close scope of work'
            }
            downloadName={
              part.kind === 'msa'
                ? 'Salt-Studio-Master-Services-Agreement.pdf'
                : 'Salt-Studio-Statement-of-Work.pdf'
            }
            downloadNote={note || null}
            pdfUrl={part.kind === 'msa' ? pdfUrl : null}
          >
            {part.kind === 'msa' ? agreement : statement}
          </ProposalScopePanel>
        )
      })}
    </>
  )
}

function splitAgreement(label: string) {
  const phrases = [
    {kind: 'msa' as const, text: 'Master Services Agreement'},
    {kind: 'sow' as const, text: 'Statement of Work'},
  ]
  const marks = phrases.flatMap((phrase) => {
    const start = label.indexOf(phrase.text)
    if (start < 0) return []
    return [{kind: phrase.kind, start, end: start + phrase.text.length}]
  })
  marks.sort((a, b) => a.start - b.start)
  const parts: Array<{kind: 'text' | 'msa' | 'sow'; text: string}> = []
  let cursor = 0
  for (const mark of marks) {
    if (mark.start < cursor) continue
    if (mark.start > cursor) parts.push({kind: 'text', text: label.slice(cursor, mark.start)})
    parts.push({kind: mark.kind, text: label.slice(mark.start, mark.end)})
    cursor = mark.end
  }
  if (cursor < label.length) parts.push({kind: 'text', text: label.slice(cursor)})
  return parts
}

function Agreement({body, pdfUrl}: {body: PortableTextBlock[]; pdfUrl: string | null}) {
  return (
    <div className="max-w-[40rem] text-[1.0625rem] leading-relaxed [&_h3]:mt-[1.25rem] [&_h3:first-child]:mt-0 [&_h3]:text-[1.0625rem] [&_h3]:font-medium [&_li+li]:mt-1.5 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-4 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-[#8f8f8f]">
      {body.length > 0 ? <PortableText value={body} /> : null}
      {pdfUrl ? (
        <p className={body.length > 0 ? 'mt-4' : ''}>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-[3px]"
          >
            Open the agreement PDF.
          </a>
        </p>
      ) : null}
    </div>
  )
}

function Statement({
  packageName,
  packageScope,
  packageItems,
  addOns,
  standing,
}: {
  packageName: string
  packageScope: PortableTextBlock[]
  packageItems: Array<string | null>
  addOns: Array<{name: string; scope: PortableTextBlock[]; line: string}>
  standing: PortableTextBlock[]
}) {
  return (
    <div className="max-w-[40rem] text-[1.0625rem] leading-relaxed [&_h3]:mt-[1.25rem] [&_h3:first-child]:mt-0 [&_h3]:text-[1.0625rem] [&_h3]:font-medium [&_li+li]:mt-1.5 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-4 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-[#8f8f8f]">
      {packageName ? <h3 className="mt-0">{packageName}</h3> : null}
      <ScopeCopy blocks={packageScope} items={packageItems} />
      {addOns.map((addOn) => (
        <div key={addOn.name}>
          {addOn.name ? <h3>{addOn.name}</h3> : null}
          <ScopeCopy blocks={addOn.scope} items={addOn.line ? [addOn.line] : []} />
        </div>
      ))}
      {standing.length > 0 ? (
        <div className="mt-[1.25rem]">
          <PortableText value={standing} />
        </div>
      ) : null}
    </div>
  )
}

function ScopeCopy({blocks, items}: {blocks: PortableTextBlock[]; items: Array<string | null>}) {
  if (blocks.length > 0) return <PortableText value={blocks} />
  const lines = items.map((item) => line(item)).filter(Boolean)
  if (lines.length === 0) return null
  return (
    <ul>
      {lines.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
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
  const clientName = line(view.proposal.clientDisplayName)
  const kickoff = line(section.kickoffUrl) ? `/p/${encodeURIComponent(view.token)}/kickoff` : null
  const kickoffLabel = line(section.kickoffLabel) || 'Book your kickoff call'

  return (
    <section className="mx-auto w-full max-w-[36rem] px-[1.5rem]">
      <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-[rgba(228,228,228,0.62)] px-[2rem] py-[2.25rem] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_30px_80px_rgba(40,30,10,0.12)] backdrop-blur-[42px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),transparent)]"
        />
        <div className="relative grid gap-5">
          <p className="text-[2.5rem] font-medium leading-[1.05] tracking-[-0.04em]">
            {clientName ? `${clientName}, thank you so much.` : 'Thank you so much.'}
          </p>
          <p className="text-[1.15rem] font-medium leading-snug text-[#5c5c5c]">
            Your payment went through, and the signed scope and your receipt are on their way to
            your email.
          </p>
          {kickoff ? (
            <>
              <p className="text-[1.15rem] font-medium leading-snug text-[#5c5c5c]">
                If you haven't booked the kickoff call yet, grab the earliest time that works for
                you, ideally in the next day or two.
              </p>
              <Link href={kickoff} className="btn-solid w-full justify-center">
                {kickoffLabel}
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </section>
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

function validityLabel(validUntil: string | null, expired: boolean) {
  if (expired) return 'Expired'
  if (!validUntil) return null
  const end = new Date(validUntil)
  if (Number.isNaN(end.getTime())) return null
  const days = Math.max(1, Math.ceil((end.getTime() - Date.now()) / 86_400_000))
  return days === 1 ? 'Valid for 1 day' : `Valid for ${days} days`
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
