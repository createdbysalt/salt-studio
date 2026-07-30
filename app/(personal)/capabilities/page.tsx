import {CapabilitiesPage} from '@/components/CapabilitiesPage'
import {CorePageSchema, FAQStructuredData, generateServiceSchema, ogImageUrl} from '@/lib/seo'
import {studioUrl} from '@/sanity/lib/api'
import {sanityFetch} from '@/sanity/lib/live'
import {homePageQuery, servicesPageQuery} from '@/sanity/lib/queries'
import type {Metadata} from 'next'
import {stegaClean} from 'next-sanity'
import Link from 'next/link'

const DESCRIPTION =
  'AI automations, websites, and the tools Salt works with — for organizations with a mission.'

export async function generateMetadata(): Promise<Metadata> {
  const {data: servicesPage} = await sanityFetch({query: servicesPageQuery, stega: false})
  const ogImage = ogImageUrl()
  const description = servicesPage?.seoDescription?.trim() || DESCRIPTION

  return {
    title: 'Capabilities',
    description,
    alternates: {canonical: '/capabilities'},
    openGraph: {
      title: 'Capabilities | Salt Studio',
      description,
      images: [{url: ogImage, width: 1200, height: 630}],
    },
    twitter: {card: 'summary_large_image', images: [ogImage]},
  }
}

export default async function CapabilitiesRoute() {
  const [{data}, {data: servicesPage}] = await Promise.all([
    sanityFetch({query: homePageQuery}),
    sanityFetch({query: servicesPageQuery}),
  ])

  if (!data) {
    return (
      <div className="page-chrome py-24 text-center">
        You don&rsquo;t have a homepage yet,{' '}
        <Link href={`${studioUrl}/structure/home`} className="underline">
          create one now
        </Link>{' '}
        so Capabilities can reuse its sections.
      </div>
    )
  }

  const heroHeadline = stegaClean(servicesPage?.capabilitiesHeadline ?? '')?.trim() || null

  // FAQ JSON-LD only — the questions live on the Services doc for AEO; no visible UI here.
  const faqSection = (servicesPage?.sections ?? []).find(
    (section) => section._type === 'servicesFaqSection' && section.enabled !== false,
  )
  const faqs =
    faqSection && 'faq' in faqSection
      ? (faqSection.faq?.items ?? [])
          .map((item) => ({
            question: stegaClean(item.question ?? '')?.trim() ?? '',
            answer: stegaClean(item.answer ?? '')?.trim() ?? '',
          }))
          .filter((item) => item.question && item.answer)
      : []

  return (
    <>
      <CorePageSchema
        breadcrumbs={[
          {name: 'Home', url: '/'},
          {name: 'Capabilities', url: '/capabilities'},
        ]}
        name="Capabilities"
        description={DESCRIPTION}
        url="/capabilities"
        speakableSelectors={['h1']}
        primarySchema={generateServiceSchema({
          name: 'Websites, AI automations, and custom software',
          description: DESCRIPTION,
          url: '/capabilities',
          serviceType: 'Web design and AI development',
        })}
      />
      {faqs.length > 0 ? <FAQStructuredData faqs={faqs} /> : null}
      <CapabilitiesPage data={data} heroHeadline={heroHeadline} />
    </>
  )
}
