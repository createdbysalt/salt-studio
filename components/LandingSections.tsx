import {FAQSection} from '@/components/FAQSection'
import ImageBox from '@/components/ImageBox'
import {LogoCarousel} from '@/components/LogoCarousel'
import type {LandingPageBySlugQueryResult} from '@/sanity.types'
import {ArrowUpRight} from 'lucide-react'
import {stegaClean} from 'next-sanity'
import Link from 'next/link'

/**
 * Landing page sections (paid-traffic page builder).
 *
 * One exported function per section object in `landingSections.ts`. The page-level
 * CTA (label, link, subhead) is passed down so every button on the page is the same
 * action. Structure and evidence: Salt Studio/Marketing/churches-landing/05-landing-page-template.md
 */

export type Landing = NonNullable<LandingPageBySlugQueryResult>
type Section = NonNullable<Landing['sections']>[number]
export type LandingSectionOf<T extends Section['_type']> = Extract<Section, {_type: T}>

export type LandingCta = {
  label: string
  href: string
  subhead?: string | null
}

const SECTION_IDS: Record<string, string> = {
  system: 'lp-system',
  process: 'lp-process',
  pricing: 'lp-pricing',
}

const clean = (value?: string | null) => (value ? stegaClean(value).trim() : '')

function paragraphs(text?: string | null) {
  return clean(text)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

function CtaButton({cta, className = ''}: {cta: LandingCta; className?: string}) {
  const external = cta.href.startsWith('http')
  const inner = (
    <>
      {cta.label}
      <ArrowUpRight aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />
    </>
  )
  return external ? (
    <a
      href={cta.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-solid ${className}`}
      data-lp-cta
    >
      {inner}
    </a>
  ) : (
    <Link href={cta.href} className={`btn-solid ${className}`} data-lp-cta>
      {inner}
    </Link>
  )
}

function CtaSubhead({text}: {text?: string | null}) {
  const value = clean(text)
  if (!value) return null
  return (
    <p className="max-w-[42ch] font-mono text-[12px] uppercase tracking-label text-foreground/40">
      {value}
    </p>
  )
}

function SectionHeading({children, id}: {children: React.ReactNode; id?: string}) {
  return (
    <h2
      id={id}
      className="max-w-[24ch] text-[clamp(1.75rem,4.2vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-foreground"
    >
      {children}
    </h2>
  )
}

const sectionBase = 'page-chrome mx-auto w-full max-w-5xl py-14 md:py-20'
const bodyText = 'text-[clamp(1.05rem,1.6vw,1.2rem)] leading-relaxed text-foreground/75'

// ---------------------------------------------------------------------------

export function LandingHeroSection({
  section,
  cta,
}: {
  section: LandingSectionOf<'lpHeroSection'>
  cta: LandingCta
}) {
  const eyebrow = clean(section.eyebrow)
  const headline = clean(section.headline)
  const sub = clean(section.subheadline)
  const proof = clean(section.proofLine)
  const secondaryLabel = clean(section.secondaryLinkLabel)
  const target = SECTION_IDS[clean(section.secondaryLinkTarget) || 'process'] ?? SECTION_IDS.process

  return (
    <section id="lp-hero" className={`${sectionBase} pt-24 md:pt-32`}>
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:items-center">
        <div>
          {eyebrow && (
            <p className="font-mono text-[12px] uppercase tracking-label text-foreground/50">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-4 text-display font-semibold text-foreground max-md:[font-size:clamp(2.05rem,8.2vw,2.5rem)]">
            {headline}
          </h1>
          {sub && <p className={`mt-6 max-w-[46ch] ${bodyText}`}>{sub}</p>}
          <div className="mt-8 flex flex-col items-start gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <CtaButton cta={cta} />
              {secondaryLabel && (
                <a href={`#${target}`} className="btn-ghost">
                  {secondaryLabel}
                </a>
              )}
            </div>
            <CtaSubhead text={cta.subhead} />
          </div>
          {proof && <p className="mt-6 text-sm text-foreground/60">{proof}</p>}
        </div>
        {section.image?.asset && (
          <ImageBox
            image={section.image}
            alt={clean(section.image.alt) || headline}
            width={1200}
            height={1200}
            size="(max-width: 768px) 100vw, 40vw"
            classesWrapper="max-md:hidden"
          />
        )}
      </div>
    </section>
  )
}

export function LandingLogoSection({section}: {section: LandingSectionOf<'lpLogoSection'>}) {
  const block = section.logos
  const logos = (block?.logos ?? [])
    .filter((logo) => Boolean(logo?.image && logo?.name))
    .map((logo) => ({
      _key: logo._key,
      image: logo.image!,
      name: clean(logo.name),
      url: logo.url ?? undefined,
    }))
  if (logos.length < 2) return null
  return (
    <section className="page-chrome mx-auto w-full max-w-5xl py-6 md:py-10">
      <LogoCarousel
        title={clean(block?.title) || undefined}
        logos={logos}
        style={(block?.style as 'grid' | 'scrolling' | 'row' | null) ?? 'row'}
        grayscale={block?.grayscale ?? true}
      />
    </section>
  )
}

export function LandingProblemSection({section}: {section: LandingSectionOf<'lpProblemSection'>}) {
  const pains = (section.pains ?? []).map(clean).filter(Boolean)
  const stat = clean(section.statLine)
  const sourceLabel = clean(section.statSourceLabel)
  const sourceUrl = clean(section.statSourceUrl)
  const closing = clean(section.closingLine)
  return (
    <section className={sectionBase}>
      <SectionHeading>{clean(section.headline)}</SectionHeading>
      <div className={`mt-8 max-w-[62ch] space-y-5 ${bodyText}`}>
        {paragraphs(section.scene).map((p) => (
          <p key={p}>{p}</p>
        ))}
        {pains.length > 0 && (
          <ul className="list-disc space-y-2 pl-5">
            {pains.map((pain) => (
              <li key={pain}>{pain}</li>
            ))}
          </ul>
        )}
        {stat && (
          <p className="text-foreground/60">
            {stat}
            {sourceLabel && (
              <>
                {' '}
                (
                {sourceUrl ? (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    {sourceLabel}
                  </a>
                ) : (
                  sourceLabel
                )}
                )
              </>
            )}
          </p>
        )}
        {closing && <p className="font-semibold text-foreground">{closing}</p>}
      </div>
    </section>
  )
}

export function LandingSystemSection({section}: {section: LandingSectionOf<'lpSystemSection'>}) {
  const name = clean(section.systemName)
  const parts = (section.parts ?? []).filter((part) => clean(part?.title))
  return (
    <section id={SECTION_IDS.system} className={sectionBase}>
      {name && (
        <p className="font-mono text-[12px] uppercase tracking-label text-foreground/50">{name}</p>
      )}
      <SectionHeading>{clean(section.headline)}</SectionHeading>
      {clean(section.bridgeLine) && (
        <p className={`mt-6 max-w-[62ch] ${bodyText}`}>{clean(section.bridgeLine)}</p>
      )}
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {parts.map((part) => (
          <div key={part._key} className="border-t border-foreground/15 pt-5">
            <h3 className="text-xl font-semibold text-foreground">{clean(part.title)}</h3>
            {clean(part.body) && (
              <p className="mt-3 leading-relaxed text-foreground/75">{clean(part.body)}</p>
            )}
            {clean(part.statLine) && (
              <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                {clean(part.statLine)}
              </p>
            )}
          </div>
        ))}
      </div>
      {clean(section.closingLine) && (
        <p className="mt-10 font-semibold text-foreground">{clean(section.closingLine)}</p>
      )}
    </section>
  )
}

export function LandingDeliverableSection({
  section,
}: {
  section: LandingSectionOf<'lpDeliverableSection'>
}) {
  if (!section.mockupImage?.asset) return null
  return (
    <section className={sectionBase}>
      {clean(section.headline) && <SectionHeading>{clean(section.headline)}</SectionHeading>}
      <div className="mt-8 md:mx-auto md:max-w-3xl">
        <ImageBox
          image={section.mockupImage}
          alt={clean(section.mockupImage.alt) || 'Plan a Visit page on a phone'}
          width={1600}
          height={1200}
          size="(max-width: 768px) 100vw, 60vw"
        />
        {clean(section.caption) && (
          <p className="mt-3 text-center text-sm text-foreground/60">{clean(section.caption)}</p>
        )}
      </div>
    </section>
  )
}

export function LandingProcessSection({section}: {section: LandingSectionOf<'lpProcessSection'>}) {
  const steps = (section.steps ?? []).filter((step) => clean(step?.label))
  return (
    <section id={SECTION_IDS.process} className={sectionBase}>
      <SectionHeading>{clean(section.headline)}</SectionHeading>
      <ol className="mt-10 grid gap-6 md:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step._key} className="flex gap-4 border-t border-foreground/15 pt-5">
            <span className="font-mono text-sm text-foreground/40">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              {clean(step.timeframe) && (
                <p className="font-mono text-[12px] uppercase tracking-label text-foreground/50">
                  {clean(step.timeframe)}
                </p>
              )}
              <h3 className="mt-1 text-lg font-semibold text-foreground">{clean(step.label)}</h3>
              {clean(step.body) && (
                <p className="mt-2 leading-relaxed text-foreground/75">{clean(step.body)}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function LandingMeasurementSection({
  section,
}: {
  section: LandingSectionOf<'lpMeasurementSection'>
}) {
  const bullets = (section.bullets ?? []).filter((b) => clean(b?.text) || clean(b?.lead))
  return (
    <section className={sectionBase}>
      <SectionHeading>{clean(section.headline)}</SectionHeading>
      {clean(section.intro) && (
        <p className={`mt-6 max-w-[62ch] ${bodyText}`}>{clean(section.intro)}</p>
      )}
      <ul className="mt-8 max-w-[62ch] space-y-4">
        {bullets.map((bullet) => (
          <li
            key={bullet._key}
            className="border-t border-foreground/15 pt-4 leading-relaxed text-foreground/75"
          >
            {clean(bullet.lead) && (
              <span className="font-semibold text-foreground">{clean(bullet.lead)} </span>
            )}
            {clean(bullet.text)}
          </li>
        ))}
      </ul>
      {clean(section.limitsLine) && (
        <p className="mt-8 max-w-[62ch] text-foreground/60">{clean(section.limitsLine)}</p>
      )}
    </section>
  )
}

export function LandingProofSection({section}: {section: LandingSectionOf<'lpProofSection'>}) {
  const cases = (section.cases ?? []).filter((c) => clean(c?.title))
  const testimonials = (section.testimonials ?? []).filter((t) => clean(t?.quote))
  return (
    <section className={sectionBase}>
      <SectionHeading>{clean(section.headline)}</SectionHeading>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {cases.map((item) => (
          <article key={item._key} className="flex flex-col border-t border-foreground/15 pt-5">
            {clean(item.number) && (
              <p className="text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-none tracking-[-0.02em] text-foreground">
                {clean(item.number)}
                {clean(item.numberLabel) && (
                  <span className="mt-1 block font-mono text-[12px] font-normal uppercase tracking-label text-foreground/50">
                    {clean(item.numberLabel)}
                  </span>
                )}
              </p>
            )}
            <h3 className="mt-4 text-lg font-semibold text-foreground">{clean(item.title)}</h3>
            {clean(item.body) && (
              <p className="mt-2 leading-relaxed text-foreground/75">{clean(item.body)}</p>
            )}
            {item.projectSlug && (
              <Link
                href={`/projects/${item.projectSlug}`}
                className="mt-4 inline-flex items-center gap-1 font-mono text-[12px] uppercase tracking-label text-foreground/60 underline-offset-4 hover:underline"
              >
                See the project <ArrowUpRight aria-hidden className="h-3 w-3" />
              </Link>
            )}
          </article>
        ))}
      </div>
      {testimonials.length > 0 && (
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {testimonials.map((t) => (
            <blockquote key={t._id} className="border-l-2 border-foreground/20 pl-5">
              <p className="text-lg leading-relaxed text-foreground">“{clean(t.quote)}”</p>
              <footer className="mt-3 font-mono text-[12px] uppercase tracking-label text-foreground/50">
                {[clean(t.author), clean(t.role), clean(t.client)].filter(Boolean).join(' · ')}
              </footer>
            </blockquote>
          ))}
        </div>
      )}
    </section>
  )
}

export function LandingCtaSection({
  section,
  cta,
}: {
  section: LandingSectionOf<'lpCtaSection'> | LandingSectionOf<'lpFinalCtaSection'>
  cta: LandingCta
}) {
  const headline = clean(section.headline)
  const subhead = clean(section.subhead) || cta.subhead
  const isFinal = section._type === 'lpFinalCtaSection'
  const secondaryLabel = isFinal ? clean(section.secondaryLinkLabel) : ''
  const secondaryHref = isFinal ? clean(section.secondaryLinkHref) : ''
  return (
    <section
      className={`page-chrome mx-auto flex w-full max-w-5xl flex-col items-center py-16 text-center md:py-24 ${
        isFinal ? 'border-t border-foreground/15' : ''
      }`}
    >
      {headline && (
        <h2 className="max-w-[26ch] text-[clamp(1.6rem,3.6vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-foreground">
          {headline}
        </h2>
      )}
      <div className="mt-8 flex flex-col items-center gap-3">
        <CtaButton cta={cta} />
        <CtaSubhead text={subhead} />
      </div>
      {secondaryLabel && secondaryHref && (
        <p className="mt-6 text-sm text-foreground/60">
          <Link href={secondaryHref} className="underline underline-offset-4">
            {secondaryLabel}
          </Link>
        </p>
      )}
    </section>
  )
}

export function LandingPricingSection({section}: {section: LandingSectionOf<'lpPricingSection'>}) {
  const inclusions = (section.inclusions ?? []).map(clean).filter(Boolean)
  return (
    <section id={SECTION_IDS.pricing} className={sectionBase}>
      <SectionHeading>{clean(section.headline)}</SectionHeading>
      <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="border-t border-foreground/15 pt-5">
          <p className="font-mono text-[12px] uppercase tracking-label text-foreground/50">
            {clean(section.launchName)}
          </p>
          <p className="mt-2 text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-none tracking-[-0.02em] text-foreground">
            {clean(section.launchPrice)}
          </p>
          {clean(section.launchPaymentLine) && (
            <p className="mt-2 text-foreground/60">{clean(section.launchPaymentLine)}</p>
          )}
          {inclusions.length > 0 && (
            <ul className="mt-6 space-y-2 leading-relaxed text-foreground/75">
              {inclusions.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50"
                  />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-8">
          <div className="border-t border-foreground/15 pt-5">
            <p className="text-2xl font-semibold text-foreground">{clean(section.monthlyPrice)}</p>
            {clean(section.monthlyTerms) && (
              <p className="mt-2 leading-relaxed text-foreground/75">
                {clean(section.monthlyTerms)}
              </p>
            )}
          </div>
          {clean(section.adSpendLine) && (
            <div className="border-t border-foreground/15 pt-5">
              <p className="font-mono text-[12px] uppercase tracking-label text-foreground/50">
                Your ad budget
              </p>
              <p className="mt-2 leading-relaxed text-foreground/75">
                {clean(section.adSpendLine)}
              </p>
            </div>
          )}
          {clean(section.grantsLine) && (
            <div className="border-t border-foreground/15 pt-5">
              <p className="font-mono text-[12px] uppercase tracking-label text-foreground/50">
                Free search ads, if you qualify
              </p>
              <p className="mt-2 leading-relaxed text-foreground/75">{clean(section.grantsLine)}</p>
            </div>
          )}
        </div>
      </div>
      {clean(section.websiteLine) && (
        <p className="mt-10 border-t border-foreground/15 pt-5 font-semibold text-foreground">
          {clean(section.websiteLine)}
        </p>
      )}
    </section>
  )
}

export function LandingFitSection({section}: {section: LandingSectionOf<'lpFitSection'>}) {
  const good = (section.goodFitPoints ?? []).map(clean).filter(Boolean)
  const bad = (section.notFitPoints ?? []).map(clean).filter(Boolean)
  return (
    <section className={sectionBase}>
      {clean(section.headline) && <SectionHeading>{clean(section.headline)}</SectionHeading>}
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="border-t border-foreground/15 pt-5">
          <h3 className="text-lg font-semibold text-foreground">
            {clean(section.goodFitLabel) || 'A good fit if'}
          </h3>
          <ul className="mt-4 space-y-3 leading-relaxed text-foreground/75">
            {good.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div className="border-t border-foreground/15 pt-5">
          <h3 className="text-lg font-semibold text-foreground">
            {clean(section.notFitLabel) || 'Not a fit if'}
          </h3>
          <ul className="mt-4 space-y-3 leading-relaxed text-foreground/75">
            {bad.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export function LandingTeamSection({section}: {section: LandingSectionOf<'lpTeamSection'>}) {
  const people = (section.people ?? []).filter((p) => clean(p?.name))
  const roles = section.roles ?? []
  const founder = clean(section.founderLine)
  return (
    <section className={sectionBase}>
      {clean(section.headline) && <SectionHeading>{clean(section.headline)}</SectionHeading>}
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {people.map((person, index) => {
          const name = clean(person.shortName) || clean(person.name)
          const role = clean(roles[index]) || clean(person.role)
          return (
            <div key={person._id} className="flex gap-5 border-t border-foreground/15 pt-5">
              {person.photo?.asset && (
                <ImageBox
                  image={person.photo}
                  alt={name}
                  width={400}
                  height={400}
                  size="96px"
                  classesWrapper="h-20 w-20 shrink-0 rounded-full"
                />
              )}
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {person.slug ? (
                    <Link href={`/${person.slug}`} className="underline-offset-4 hover:underline">
                      {name}
                    </Link>
                  ) : (
                    name
                  )}
                </h3>
                {role && <p className="mt-1 leading-relaxed text-foreground/75">{role}</p>}
              </div>
            </div>
          )
        })}
      </div>
      {founder && (
        <blockquote className="mt-10 max-w-[62ch] border-l-2 border-foreground/20 pl-5 text-lg leading-relaxed text-foreground/85">
          {founder}
        </blockquote>
      )}
    </section>
  )
}

export function LandingFaqSection({section}: {section: LandingSectionOf<'lpFaqSection'>}) {
  const items = (section.faq?.items ?? [])
    .filter((item) => clean(item?.question) && clean(item?.answer))
    .map((item) => ({_key: item._key, question: clean(item.question), answer: clean(item.answer)}))
  if (items.length === 0) return null
  return (
    <section className={sectionBase}>
      <FAQSection
        title={clean(section.faq?.title) || 'Questions churches ask us'}
        description={clean(section.faq?.description) || undefined}
        items={items}
        style="accordion"
      />
    </section>
  )
}
