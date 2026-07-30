import {seoConfig} from './config'

/** Cache-bust when the branded card design changes. */
const OG_VERSION = 'bw-11'

/**
 * Salt social share card (`/api/og`).
 *
 * With no args: the site-wide statement card (wordmark, statement, tagline, domain).
 * With `title` (and optional `eyebrow`): a project card — the eyebrow sits above the
 * project title in place of the statement.
 *
 *   openGraph: { images: [{url: ogImageUrl({title, eyebrow}), width: 1200, height: 630}] }
 */
export function ogImageUrl(opts?: {
  title?: string | null
  eyebrow?: string | null
  subtitle?: string | null
}): string {
  const params = new URLSearchParams({v: OG_VERSION})
  if (opts?.title) params.set('title', opts.title)
  if (opts?.eyebrow) params.set('eyebrow', opts.eyebrow)
  const base = seoConfig.siteUrl.replace(/\/$/, '')
  return `${base}/api/og?${params.toString()}`
}
