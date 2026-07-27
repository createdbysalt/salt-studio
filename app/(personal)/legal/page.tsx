import {sanityFetch} from '@/sanity/lib/live'
import {allLegalPagesQuery} from '@/sanity/lib/queries'
import type {Metadata} from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Legal',
  description: 'Legal information, policies, and terms.',
}

/**
 * Maps pageType to display labels.
 */
const PAGE_TYPE_LABELS: Record<string, string> = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  cookies: 'Cookie Policy',
  accessibility: 'Accessibility Statement',
  disclaimer: 'Disclaimer',
  custom: 'Legal Document',
}

export default async function LegalIndexPage() {
  const {data: pages} = await sanityFetch({query: allLegalPagesQuery})

  return (
    <main
      className="mx-auto max-w-3xl px-4 py-12"
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-foreground)',
      }}
    >
      <header className="mb-12">
        <h1
          className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl"
          style={{fontFamily: 'var(--font-serif)'}}
        >
          Legal
        </h1>
        <p style={{color: 'var(--color-muted-foreground)'}}>
          Our policies, terms, and legal information.
        </p>
      </header>

      {pages && pages.length > 0 ? (
        <ul className="space-y-6">
          {pages.map((page) => {
            const title = page.title || PAGE_TYPE_LABELS[page.pageType || 'custom'] || 'Untitled'

            return (
              <li
                key={page._id}
                className="rounded-md border p-6 transition-colors"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                }}
              >
                <Link href={`/legal/${page.slug}`} className="group block">
                  <h2
                    className="mb-2 text-xl font-semibold transition-colors group-hover:underline"
                    style={{color: 'var(--color-foreground)'}}
                  >
                    {title}
                  </h2>
                  {page.overview && (
                    <p
                      className="mb-3 text-sm"
                      style={{color: 'var(--color-muted-foreground)'}}
                    >
                      {page.overview}
                    </p>
                  )}
                  <div
                    className="flex flex-wrap gap-4 text-xs"
                    style={{color: 'var(--color-muted-foreground)'}}
                  >
                    {page.effectiveDate && (
                      <span>
                        Effective:{' '}
                        {new Date(page.effectiveDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                    {page.version && <span>v{page.version}</span>}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <p style={{color: 'var(--color-muted-foreground)'}}>
          No legal pages have been published yet.
        </p>
      )}
    </main>
  )
}
