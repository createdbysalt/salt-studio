import {CustomPortableText} from '@/components/CustomPortableText'
import {sanityFetch} from '@/sanity/lib/live'
import {legalPageBySlugQuery, slugsByTypeQuery} from '@/sanity/lib/queries'
import type {Metadata, ResolvingMetadata} from 'next'
import type {PortableTextBlock} from 'next-sanity'
import {draftMode} from 'next/headers'
import {notFound} from 'next/navigation'

type Props = {
  params: Promise<{slug: string}>
}

export async function generateMetadata({params}: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const {data: page} = await sanityFetch({
    query: legalPageBySlugQuery,
    params,
    stega: false,
  })

  return {
    title: page?.title || 'Legal',
    description: page?.overview || (await parent).description,
  }
}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: slugsByTypeQuery,
    params: {type: 'legalPage'},
    stega: false,
    perspective: 'published',
  })
  return data
}

/**
 * Fetches policy content from the managed provider URL.
 * Returns clean HTML that can be styled with our site's CSS.
 */
async function fetchPolicyContent(policyUrl: string | null): Promise<string | null> {
  if (!policyUrl) return null

  try {
    const response = await fetch(policyUrl, {
      next: {revalidate: 3600}, // Cache for 1 hour, auto-updates
    })

    if (!response.ok) {
      console.error(`Failed to fetch policy:`, response.status)
      return null
    }

    const html = await response.text()

    // Extract just the body content if it's a full HTML page
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) {
      return bodyMatch[1]
    }

    return html
  } catch (error) {
    console.error(`Error fetching policy:`, error)
    return null
  }
}

export default async function LegalPageRoute({params}: Props) {
  const {data} = await sanityFetch({query: legalPageBySlugQuery, params})

  if (!data?._id && !(await draftMode()).isEnabled) {
    notFound()
  }

  const {title, introText, content, contentSource, policyUrl, effectiveDate, version, lastUpdated} = data ?? {}

  // Fetch managed policy content if using that source
  const policyHtml = contentSource === 'managed' ? await fetchPolicyContent(policyUrl || null) : null

  return (
    <article
      className="mx-auto max-w-3xl px-4 py-12"
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-foreground)',
      }}
    >
      {/* Header */}
      <header className="mb-12">
        <h1
          className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl"
          style={{fontFamily: 'var(--font-serif)'}}
        >
          {title || 'Untitled'}
        </h1>

        {/* Metadata */}
        <div
          className="flex flex-wrap gap-4 text-sm"
          style={{color: 'var(--color-muted-foreground)'}}
        >
          {effectiveDate && (
            <p>
              <span className="font-medium">Effective:</span>{' '}
              {new Date(effectiveDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
          {version && (
            <p>
              <span className="font-medium">Version:</span> {version}
            </p>
          )}
          {lastUpdated && (
            <p>
              <span className="font-medium">Last updated:</span>{' '}
              {new Date(lastUpdated).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
      </header>

      {/* Introduction text */}
      {introText && (
        <div className="prose prose-lg mb-8 max-w-none">
          <CustomPortableText
            id={data?._id || null}
            type={data?._type || null}
            path={['introText']}
            value={introText as unknown as PortableTextBlock[]}
          />
        </div>
      )}

      {/* Managed policy content - rendered natively with site styling */}
      {contentSource === 'managed' && policyHtml && (
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{__html: policyHtml}}
        />
      )}

      {/* Custom content */}
      {contentSource === 'custom' && content && (
        <div className="prose prose-lg max-w-none">
          <CustomPortableText
            id={data?._id || null}
            type={data?._type || null}
            path={['content']}
            value={content as unknown as PortableTextBlock[]}
          />
        </div>
      )}

      {/* Fallback if managed policy fetch failed */}
      {contentSource === 'managed' && !policyHtml && (
        <div
          className="rounded-lg border p-6 text-center"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-muted)',
          }}
        >
          <p style={{color: 'var(--color-muted-foreground)'}}>
            Policy content is currently unavailable. Please try again later.
          </p>
        </div>
      )}

      {/* Footer divider */}
      <div
        className="mt-16 border-t pt-8"
        style={{borderColor: 'var(--color-border)'}}
      />
    </article>
  )
}
