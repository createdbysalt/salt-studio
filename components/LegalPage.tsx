import {CustomPortableText} from '@/components/CustomPortableText'
import {LegalHero} from '@/components/LegalHero'
import {LegalPolicyBody} from '@/components/LegalPolicyBody'
import {LineReveal} from '@/components/motion/LineReveal'
import {BreadcrumbStructuredData} from '@/lib/seo'
import type {LegalPageBySlugQueryResult} from '@/sanity.types'
import type {PortableTextBlock} from 'next-sanity'

export interface LegalPageProps {
  data: LegalPageBySlugQueryResult | null
  slug: string
  policyHtml: string | null
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Legal document — Capabilities-style masthead, then ink stage for the policy body.
 */
export function LegalPage({data, slug, policyHtml}: LegalPageProps) {
  const title = data?.title
  const introText = data?.introText
  const content = data?.content
  const contentSource = data?.contentSource
  const effectiveDate = data?.effectiveDate
  const version = data?.version
  const lastUpdated = data?.lastUpdated
  const displayTitle = title || 'Untitled'

  return (
    <main className="overflow-x-clip bg-background text-foreground">
      {data?._id ? (
        <BreadcrumbStructuredData
          items={[
            {name: 'Home', url: '/'},
            {name: 'Legal', url: '/legal'},
            {name: displayTitle, url: `/legal/${slug}`},
          ]}
        />
      ) : null}

      <LegalHero title={displayTitle} />

      <article className="mx-auto max-w-3xl px-4 pb-24 pt-10 md:px-6 md:pt-14">
        <header className="mb-10 border-b border-white/15 pb-6">
          <LineReveal
            as="p"
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/45"
            stagger={0.04}
            duration={0.55}
          >
            {displayTitle}
          </LineReveal>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] uppercase tracking-[0.1em] text-white/40">
            {effectiveDate ? <p>Effective {formatDate(effectiveDate)}</p> : null}
            {version ? <p>Version {version}</p> : null}
            {lastUpdated ? <p>Updated {formatDate(lastUpdated)}</p> : null}
          </div>
        </header>

        {introText ? (
          <div className="prose prose-invert prose-sm mb-10 max-w-none">
            <CustomPortableText
              id={data?._id || null}
              type={data?._type || null}
              path={['introText']}
              value={introText as unknown as PortableTextBlock[]}
            />
          </div>
        ) : null}

        {contentSource === 'managed' && policyHtml ? <LegalPolicyBody html={policyHtml} /> : null}

        {contentSource === 'custom' && content ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <CustomPortableText
              id={data?._id || null}
              type={data?._type || null}
              path={['content']}
              value={content as unknown as PortableTextBlock[]}
            />
          </div>
        ) : null}

        {contentSource === 'managed' && !policyHtml ? (
          <div className="rounded-sm border border-white/15 bg-white/5 p-6 text-center">
            <p className="text-sm text-white/55">
              Policy content is currently unavailable. Please try again later.
            </p>
          </div>
        ) : null}
      </article>
    </main>
  )
}
