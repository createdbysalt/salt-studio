import {CapabilitiesBentoHero} from '@/components/CapabilitiesBentoHero'
import {Reveal} from '@/components/Reveal'
import {CAPABILITIES_BENTO_SHOTS} from '@/lib/capabilitiesBentoShots'
import {CorePageSchema, ogImageUrl} from '@/lib/seo'
import type {ServicesPageQueryResult} from '@/sanity.types'
import {sanityFetch} from '@/sanity/lib/live'
import {servicesPageQuery} from '@/sanity/lib/queries'
import {urlForOpenGraphImage} from '@/sanity/lib/utils'
import type {Metadata} from 'next'
import Link from 'next/link'

type Section = NonNullable<NonNullable<ServicesPageQueryResult>['sections']>[number]
type SectionOf<T extends Section['_type']> = Extract<Section, {_type: T}>

export async function generateMetadata(): Promise<Metadata> {
  const {data} = await sanityFetch({query: servicesPageQuery, stega: false})
  const hero = data?.sections?.find((s) => s._type === 'servicesHeroSection') as
    | SectionOf<'servicesHeroSection'>
    | undefined

  const title = data?.seoTitle ?? hero?.headline ?? 'Capabilities'
  const description = data?.seoDescription ?? hero?.subheadline ?? undefined
  const ogImage = data?.ogImage
    ? urlForOpenGraphImage(data.ogImage)
    : ogImageUrl({title, subtitle: description})

  return {
    title: data?.seoTitle ? {absolute: data.seoTitle} : 'Capabilities',
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{url: ogImage, width: 1200, height: 630}] : [],
    },
    twitter: {card: 'summary_large_image', images: ogImage ? [ogImage] : []},
  }
}

type Service = NonNullable<SectionOf<'servicesListSection'>['serviceAi']>

function Steps({steps}: {steps: Service['steps']}) {
  if (!steps?.length) return null
  return (
    <ol className="mt-6 space-y-4">
      {steps.map((step) => (
        <li key={step._key} className="max-w-[65ch] text-base leading-relaxed text-foreground/70">
          {step.lead ? <strong className="font-semibold text-foreground/90">{step.lead} </strong> : null}
          {step.text}
        </li>
      ))}
    </ol>
  )
}

function ServiceBlock({service}: {service: Service}) {
  return (
    <Reveal className="border-t border-foreground/15 py-12 md:py-16">
      <h2 className="font-sans text-[clamp(1.5rem,3vw,3rem)] font-semibold uppercase leading-[1.05] tracking-[-0.02em]">
        {service.headline}
      </h2>
      <p className="mt-6 max-w-[65ch] whitespace-pre-line text-lg leading-relaxed text-foreground/70">
        {service.body}
      </p>
      {service.stepsLabel ? (
        <p className="mt-10 font-mono text-[12px] uppercase tracking-label text-foreground/40">
          {service.stepsLabel}
        </p>
      ) : null}
      <Steps steps={service.steps} />
      {service.sceneLine ? (
        <p className="mt-8 max-w-[60ch] border-l-2 border-foreground/15 pl-5 text-base leading-relaxed text-foreground/60">
          {service.sceneLine}
        </p>
      ) : null}
      {service.investmentLine ? (
        <p className="mt-8 font-mono text-[13px] uppercase tracking-label text-foreground/90">
          {service.investmentLine}
        </p>
      ) : null}
      {service.proofAnchor ? (
        <p className="mt-6 max-w-[60ch] text-base leading-relaxed text-foreground/60">
          {service.proofAnchor}
        </p>
      ) : null}
      {service.ctaLabel ? (
        <div className="mt-8">
          <Link href="/contact" className="btn-solid">
            {service.ctaLabel}
          </Link>
        </div>
      ) : null}
      {service.routingLine ? (
        <p className="mt-6 max-w-[60ch] text-sm leading-relaxed text-foreground/50">
          {service.routingLine}
        </p>
      ) : null}
    </Reveal>
  )
}

function FitList({label, points}: {label?: string | null; points?: string[] | null}) {
  if (!points?.length) return null
  return (
    <div>
      {label ? <h3 className="text-lg font-semibold">{label}</h3> : null}
      <ul className="mt-4 space-y-3">
        {points.map((point) => (
          <li key={point} className="max-w-[55ch] text-base leading-relaxed text-foreground/70">
            {point}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function CapabilitiesRoute() {
  const {data} = await sanityFetch({query: servicesPageQuery})

  const sections = (data?.sections ?? []).filter((section) => section.enabled !== false)
  const hero = sections.find((s) => s._type === 'servicesHeroSection') as
    | SectionOf<'servicesHeroSection'>
    | undefined

  return (
    <main className="bg-background pb-24 text-foreground">
      <CorePageSchema
        breadcrumbs={[
          {name: 'Home', url: '/'},
          {name: 'Capabilities', url: '/capabilities'},
        ]}
        name={hero?.headline ?? 'Capabilities'}
        description={data?.speakableSummary ?? data?.seoDescription ?? hero?.subheadline ?? ''}
        url="/capabilities"
        speakableSelectors={['h1']}
      />

      <CapabilitiesBentoHero
        headline={hero?.headline ?? 'Capabilities'}
        subheadline={hero?.subheadline}
        items={CAPABILITIES_BENTO_SHOTS}
      />

      <div className="page-chrome pt-16 md:pt-24">
        {sections.map((section) => {
          switch (section._type) {
            case 'servicesHeroSection':
              return null
            case 'servicesListSection':
              return (
                <section key={section._key}>
                  {[section.serviceAi, section.serviceSite, section.serviceCare]
                    .filter((service): service is NonNullable<typeof service> => Boolean(service))
                    .map((service) => (
                      <ServiceBlock key={service.headline} service={service} />
                    ))}
                </section>
              )
            case 'servicesFitSection':
              return (
                <Reveal key={section._key} className="border-t border-foreground/15 py-12 md:py-16">
                  {section.headline ? (
                    <h2 className="font-sans text-[clamp(1.5rem,3vw,3rem)] font-semibold uppercase leading-[1.05] tracking-[-0.02em]">
                      {section.headline}
                    </h2>
                  ) : null}
                  <div className="mt-8 grid gap-10 md:grid-cols-2">
                    <FitList label={section.goodFitLabel} points={section.goodFitPoints} />
                    <FitList label={section.notFitLabel} points={section.notFitPoints} />
                  </div>
                </Reveal>
              )
            case 'servicesProcessSection':
              return (
                <Reveal key={section._key} className="border-t border-foreground/15 py-12 md:py-16">
                  {section.headline ? (
                    <h2 className="font-sans text-[clamp(1.5rem,3vw,3rem)] font-semibold uppercase leading-[1.05] tracking-[-0.02em]">
                      {section.headline}
                    </h2>
                  ) : null}
                  <ol className="mt-8 space-y-5">
                    {(section.steps ?? []).map((step, index) => (
                      <li key={step._key} className="flex max-w-[65ch] gap-5">
                        <span className="font-mono text-[12px] leading-[1.8] tracking-label text-foreground/40">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <p className="text-base leading-relaxed text-foreground/70">
                          {step.lead ? (
                            <strong className="font-semibold text-foreground/90">
                              {step.lead}{' '}
                            </strong>
                          ) : null}
                          {step.text}
                        </p>
                      </li>
                    ))}
                  </ol>
                  {section.ctaLabel ? (
                    <div className="mt-10">
                      <Link href="/contact" className="btn-solid">
                        {section.ctaLabel}
                      </Link>
                    </div>
                  ) : null}
                </Reveal>
              )
            case 'servicesFaqSection': {
              const faq = section.faq
              if (!faq?.items?.length) return null
              return (
                <Reveal key={section._key} className="border-t border-foreground/15 py-12 md:py-16">
                  {faq.title ? (
                    <h2 className="font-sans text-[clamp(1.5rem,3vw,3rem)] font-semibold uppercase leading-[1.05] tracking-[-0.02em]">
                      {faq.title}
                    </h2>
                  ) : null}
                  <div className="mt-8 max-w-[70ch]">
                    {faq.items.map((item) => (
                      <details key={item._key} className="group border-b border-foreground/15 py-5">
                        <summary className="cursor-pointer list-none text-base font-semibold text-foreground/90 marker:content-none">
                          {item.question}
                        </summary>
                        <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-foreground/70">
                          {item.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </Reveal>
              )
            }
            case 'servicesFinalCtaSection':
              return (
                <Reveal key={section._key} className="border-t border-foreground/15 py-16 md:py-24">
                  {section.headline ? (
                    <h2 className="font-sans text-[clamp(2rem,4vw,4rem)] font-semibold uppercase leading-[0.95] tracking-[-0.02em]">
                      {section.headline}
                    </h2>
                  ) : null}
                  <div className="mt-10 flex flex-col items-start gap-3">
                    {section.ctaLabel ? (
                      <Link href="/contact" className="btn-solid">
                        {section.ctaLabel}
                      </Link>
                    ) : null}
                    {section.microcopy ? (
                      <p className="font-mono text-[12px] uppercase tracking-label text-foreground/50">
                        {section.microcopy}
                      </p>
                    ) : null}
                  </div>
                </Reveal>
              )
            default:
              return null
          }
        })}
      </div>
    </main>
  )
}
