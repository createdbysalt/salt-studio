import './globals.css'
import {StatusPage} from '@/components/StatusPage'
import {sanityFetch} from '@/sanity/lib/live'
import {notFoundPageQuery} from '@/sanity/lib/queries'
import {resolveHref} from '@/sanity/lib/utils'
import {toPlainText} from 'next-sanity'
import Link from 'next/link'

const FALLBACK_MESSAGE = "That page isn't here — it may have moved, or the link is out of date."

/**
 * 404 Not Found page.
 * Fetches content from Sanity when available; otherwise static Salt fallbacks.
 */
export default async function NotFound() {
  let data: Awaited<ReturnType<typeof sanityFetch<typeof notFoundPageQuery>>>['data'] | null = null

  try {
    const result = await sanityFetch({query: notFoundPageQuery, stega: false})
    data = result.data
  } catch {
    // Sanity unavailable — use fallback content
  }

  const headline = data?.headline || 'Page not found.'
  const message =
    data?.message && data.message.length > 0 ? toPlainText(data.message) : FALLBACK_MESSAGE
  const ctaText = data?.ctaText || 'Back home'
  const ctaLink = data?.ctaLink || '/'
  const secondaryCtaText = data?.secondaryCtaText || 'See the work'
  const secondaryCtaLink = data?.secondaryCtaLink || '/work'

  const suggested =
    data?.suggestedLinks && data.suggestedLinks.length > 0 ? (
      <nav>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-label text-foreground/35">
          Or try one of these
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {data.suggestedLinks.map((link) => {
            if (!link) return null
            const href = resolveHref(link._type, link.slug)
            if (!href) return null
            return (
              <li key={link._id}>
                <Link
                  href={href}
                  className="font-mono text-[12px] uppercase tracking-label text-foreground/60 underline decoration-foreground/20 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground/50"
                >
                  {link.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    ) : undefined

  return (
    <StatusPage
      eyebrow="404"
      headline={headline}
      message={message}
      primary={{kind: 'link', label: ctaText, href: ctaLink}}
      secondary={
        secondaryCtaText && secondaryCtaLink
          ? {kind: 'link', label: secondaryCtaText, href: secondaryCtaLink}
          : undefined
      }
      footer={suggested}
    />
  )
}
