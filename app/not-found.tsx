import './globals.css'
import {STATUS_AMBIENT_VIDEO} from '@/app/status-ambient'
import {AmbientVideo} from '@/components/AmbientVideo'
import {sanityFetch} from '@/sanity/lib/live'
import {notFoundPageQuery} from '@/sanity/lib/queries'
import {resolveHref} from '@/sanity/lib/utils'
import {toPlainText} from 'next-sanity'
import Link from 'next/link'

const FALLBACK_MESSAGE =
  "Ground control can't find that page. It may have been moved, renamed, or jettisoned in a previous orbit."

/**
 * 404 Not Found page.
 *
 * Fetches content from Sanity if available, otherwise shows static fallback.
 * Visual language matches the app error boundary (dark field + ambient loop).
 */
export default async function NotFound() {
  let data: Awaited<ReturnType<typeof sanityFetch<typeof notFoundPageQuery>>>['data'] | null = null

  try {
    const result = await sanityFetch({query: notFoundPageQuery, stega: false})
    data = result.data
  } catch {
    // Sanity unavailable — use fallback content
  }

  const headline = data?.headline || 'Signal lost.'
  const message =
    data?.message && data.message.length > 0 ? toPlainText(data.message) : FALLBACK_MESSAGE
  const ctaText = data?.ctaText || 'Back to mission control →'
  const ctaLink = data?.ctaLink || '/'
  const secondaryCtaText = data?.secondaryCtaText || 'Browse the work →'
  const secondaryCtaLink = data?.secondaryCtaLink || '/work'
  const footerTagline =
    data?.footerTagline || 'Salt Studio — Subtle. Essential. Transformative..'

  return (
    <main className="fixed inset-0 z-[60] flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] px-5 py-16 text-white md:px-8">
      <AmbientVideo src={STATUS_AMBIENT_VIDEO} blend="normal" opacity={1} />

      <div className="relative flex w-full max-w-lg flex-col items-center px-4 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/45">404</p>

        <h1 className="mt-5 font-mono text-[clamp(2.25rem,6vw,3.5rem)] font-medium leading-[0.95] tracking-tight text-white">
          {headline}
        </h1>

        <p className="mt-5 max-w-md font-mono text-[13px] leading-relaxed text-white/60 md:text-sm">
          {message}
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={ctaLink}
            className="inline-flex items-center justify-center whitespace-nowrap bg-white px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-black transition-opacity hover:opacity-90"
          >
            {ctaText}
          </Link>

          {secondaryCtaText && secondaryCtaLink ? (
            <Link
              href={secondaryCtaLink}
              className="inline-flex items-center justify-center whitespace-nowrap border border-white/30 px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-white/90 transition-colors hover:border-white/60 hover:text-white"
            >
              {secondaryCtaText}
            </Link>
          ) : null}
        </div>

        {footerTagline ? (
          <p className="mt-12 max-w-sm font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-white/35">
            {footerTagline}
          </p>
        ) : null}

        {data?.suggestedLinks && data.suggestedLinks.length > 0 ? (
          <nav className="mt-8">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
              Or try one of these
            </p>
            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              {data.suggestedLinks.map((link) => {
                if (!link) return null
                const href = resolveHref(link._type, link.slug)
                if (!href) return null
                return (
                  <li key={link._id}>
                    <Link
                      href={href}
                      className="font-mono text-[12px] uppercase tracking-[0.12em] text-white/70 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white"
                    >
                      {link.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        ) : null}
      </div>
    </main>
  )
}
