import {seoConfig} from './config'

/**
 * Build the URL for the dynamic Open Graph card served by `app/api/og`.
 *
 * The page's content is encoded in the query string, so the image updates
 * automatically whenever that content changes — and each unique card is
 * cached by the CDN.
 *
 * In `generateMetadata`, prefer a manually-uploaded Sanity `ogImage` when set,
 * and fall back to this auto-generated card:
 *
 *   const og = page.ogImage
 *     ? urlForOpenGraphImage(page.ogImage)
 *     : ogImageUrl({title: page.seoTitle ?? page.headline, subtitle: page.seoDescription})
 */
export function ogImageUrl({
  title,
  eyebrow,
  subtitle,
}: {
  title?: string | null
  eyebrow?: string | null
  subtitle?: string | null
}): string {
  const params = new URLSearchParams()
  if (title) params.set('title', title)
  if (eyebrow) params.set('eyebrow', eyebrow)
  if (subtitle) params.set('subtitle', subtitle)

  const base = seoConfig.siteUrl.replace(/\/$/, '')
  return `${base}/api/og?${params.toString()}`
}
