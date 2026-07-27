import {CustomPortableText} from '@/components/CustomPortableText'
import ImageBox from '@/components/ImageBox'
import {Reveal} from '@/components/Reveal'
import {CorePageSchema, ogImageUrl} from '@/lib/seo'
import type {AboutPageQueryResult} from '@/sanity.types'
import {sanityFetch} from '@/sanity/lib/live'
import {aboutPageQuery} from '@/sanity/lib/queries'
import {urlForOpenGraphImage} from '@/sanity/lib/utils'
import type {Metadata} from 'next'
import Link from 'next/link'
import {draftMode} from 'next/headers'
import {notFound} from 'next/navigation'
import type {PortableTextBlock} from 'next-sanity'

type Section = NonNullable<NonNullable<AboutPageQueryResult>['sections']>[number]
type SectionOf<T extends Section['_type']> = Extract<Section, {_type: T}>

export async function generateMetadata(): Promise<Metadata> {
  const {data} = await sanityFetch({query: aboutPageQuery, stega: false})
  const opening = data?.sections?.find((s) => s._type === 'aboutOpeningSection') as
    | SectionOf<'aboutOpeningSection'>
    | undefined

  const title = data?.seoTitle ?? 'About'
  const description =
    data?.seoDescription ?? [opening?.line1, opening?.line2].filter(Boolean).join(' ') ?? undefined
  const ogImage = data?.ogImage
    ? urlForOpenGraphImage(data.ogImage)
    : ogImageUrl({title, subtitle: description})

  return {
    title: data?.seoTitle ? {absolute: data.seoTitle} : 'About',
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{url: ogImage, width: 1200, height: 630}] : [],
    },
    twitter: {card: 'summary_large_image', images: ogImage ? [ogImage] : []},
  }
}

function SectionHeading({children}: {children: string}) {
  return (
    <h2 className="font-sans text-[clamp(1.5rem,3vw,3rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
      {children}
    </h2>
  )
}

export default async function AboutRoute() {
  const {data} = await sanityFetch({query: aboutPageQuery})

  // Stays 404 until the About doc is published — its copy is gated on the
  // founder beats. Draft mode keeps the Presentation preview working.
  if (!data?._id && !(await draftMode()).isEnabled) {
    notFound()
  }

  const sections = (data?.sections ?? []).filter((section) => section.enabled !== false)
  const opening = sections.find((s) => s._type === 'aboutOpeningSection') as
    | SectionOf<'aboutOpeningSection'>
    | undefined

  return (
    <main className="bg-background pb-24 text-foreground">
      <CorePageSchema
        breadcrumbs={[
          {name: 'Home', url: '/'},
          {name: 'About', url: '/about'},
        ]}
        name="About"
        description={
          data?.speakableSummary ??
          [opening?.line1, opening?.line2].filter(Boolean).join(' ') ??
          ''
        }
        url="/about"
        speakableSelectors={['h1']}
      />

      <div className="page-chrome pt-28 md:pt-36">
        {sections.map((section) => {
          switch (section._type) {
            case 'aboutOpeningSection':
              return (
                <header key={section._key} className="pb-16 md:pb-24">
                  <Reveal immediate>
                    <h1 className="text-display max-w-[1100px] font-semibold">
                      {section.line1}
                      {section.line2 ? (
                        <>
                          <br />
                          {section.line2}
                        </>
                      ) : null}
                    </h1>
                    {section.body ? (
                      <p className="mt-8 max-w-[560px] text-lg leading-snug text-foreground/70">
                        {section.body}
                      </p>
                    ) : null}
                  </Reveal>
                </header>
              )
            case 'aboutStorySection':
              return (
                <Reveal key={section._key} className="border-t border-foreground/15 py-12 md:py-16">
                  <div className="grid gap-12 md:grid-cols-[minmax(0,65ch)_1fr]">
                    <div>
                      {section.body ? (
                        <CustomPortableText
                          id={data?._id ?? null}
                          type={data?._type ?? null}
                          path={['sections', {_key: section._key}, 'body']}
                          value={section.body as PortableTextBlock[]}
                          paragraphClasses="mb-5 text-lg leading-relaxed text-foreground/70"
                        />
                      ) : null}
                    </div>
                    <div className="max-w-[420px]">
                      {section.photo?.asset ? (
                        <ImageBox
                          image={section.photo}
                          alt={section.photo.alt ?? 'Gabriella, founder of Salt Studio'}
                          classesWrapper="relative aspect-[4/5] overflow-hidden rounded-[8px]"
                        />
                      ) : null}
                      {section.offHoursLine ? (
                        <p className="mt-5 text-sm leading-relaxed text-foreground/50">
                          {section.offHoursLine}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Reveal>
              )
            case 'aboutSmallnessSection':
              return (
                <Reveal key={section._key} className="border-t border-foreground/15 py-12 md:py-16">
                  {section.headline ? <SectionHeading>{section.headline}</SectionHeading> : null}
                  {section.body ? (
                    <p className="mt-6 max-w-[65ch] text-lg leading-relaxed text-foreground/70">
                      {section.body}
                    </p>
                  ) : null}
                </Reveal>
              )
            case 'aboutConvictionsSection':
              return (
                <Reveal key={section._key} className="border-t border-foreground/15 py-12 md:py-16">
                  {section.headline ? <SectionHeading>{section.headline}</SectionHeading> : null}
                  <div className="mt-8 space-y-2">
                    {(section.lines ?? []).map((line) => (
                      <p
                        key={line}
                        className="font-sans text-[clamp(1.25rem,2.2vw,2rem)] font-semibold leading-[1.2] tracking-[-0.02em]"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                  {section.closingLine ? (
                    <p className="mt-8 max-w-[65ch] text-lg leading-relaxed text-foreground/70">
                      {section.closingLine}
                    </p>
                  ) : null}
                </Reveal>
              )
            case 'aboutProductSection':
              return (
                <Reveal key={section._key} className="border-t border-foreground/15 py-12 md:py-16">
                  {section.body ? (
                    <p className="max-w-[65ch] text-lg leading-relaxed text-foreground/70">
                      {section.body}
                    </p>
                  ) : null}
                </Reveal>
              )
            case 'aboutClosingSection':
              return (
                <Reveal key={section._key} className="border-t border-foreground/15 py-16 md:py-24">
                  {section.body ? (
                    <h2 className="max-w-[24ch] font-sans text-[clamp(2rem,4vw,4rem)] font-semibold leading-[0.95] tracking-[-0.02em]">
                      {section.body}
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
