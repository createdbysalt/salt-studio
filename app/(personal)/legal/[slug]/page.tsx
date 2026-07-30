import {LegalPage} from '@/components/LegalPage'
import {sanityFetch} from '@/sanity/lib/live'
import {legalPageBySlugQuery, slugsByTypeQuery} from '@/sanity/lib/queries'
import type {Metadata, ResolvingMetadata} from 'next'
import {draftMode} from 'next/headers'
import {notFound} from 'next/navigation'

type Props = {
  params: Promise<{slug: string}>
}

export async function generateMetadata(
  {params}: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const {data: page} = await sanityFetch({
    query: legalPageBySlugQuery,
    params,
    stega: false,
  })

  const {slug} = await params

  return {
    title: page?.title || 'Legal',
    description: page?.overview || (await parent).description,
    alternates: {canonical: `/legal/${slug}`},
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
    const content = bodyMatch ? bodyMatch[1] : html

    // Strip the provider's embedded styles and scripts (Termageddon ships a
    // scoped CSS reset) so the policy inherits the site's own typography.
    return content
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
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

  const {slug} = await params
  const policyHtml =
    data?.contentSource === 'managed' ? await fetchPolicyContent(data.policyUrl || null) : null

  return <LegalPage data={data} slug={slug} policyHtml={policyHtml} />
}
