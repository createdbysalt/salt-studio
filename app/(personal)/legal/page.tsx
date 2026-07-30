import {LineReveal} from '@/components/motion/LineReveal'
import {sanityFetch} from '@/sanity/lib/live'
import {allLegalPagesQuery} from '@/sanity/lib/queries'
import type {Metadata} from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Legal',
  description: 'Legal information, policies, and terms.',
  alternates: {canonical: '/legal'},
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
    <main className="overflow-x-clip bg-background text-foreground">
      <header className="page-chrome flex min-h-[50vh] flex-col items-center justify-center px-4 pb-12 pt-28 text-center md:pt-36">
        <LineReveal
          as="h1"
          stagger={0.12}
          duration={0.9}
          className="font-sans text-[clamp(3.5rem,14vw,8rem)] font-bold uppercase leading-[0.84] tracking-[-0.05em]"
        >
          Legal
        </LineReveal>
        <p className="mt-6 max-w-md font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">
          Policies, terms, and legal information
        </p>
      </header>

      <div className="mx-auto max-w-3xl px-4 pb-24 md:px-6">
        {pages && pages.length > 0 ? (
          <ul className="divide-y divide-white/15 border-y border-white/15">
            {pages.map((page) => {
              const title = page.title || PAGE_TYPE_LABELS[page.pageType || 'custom'] || 'Untitled'

              return (
                <li key={page._id}>
                  <Link
                    href={`/legal/${page.slug}`}
                    className="group flex flex-col gap-2 py-6 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                  >
                    <h2 className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:underline sm:text-xl">
                      {title}
                    </h2>
                    <div className="flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
                      {page.effectiveDate ? (
                        <span>
                          Effective{' '}
                          {new Date(page.effectiveDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      ) : null}
                      {page.version ? <span>v{page.version}</span> : null}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-white/45">No legal pages have been published yet.</p>
        )}
      </div>
    </main>
  )
}
