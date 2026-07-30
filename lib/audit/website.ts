import 'server-only'

/**
 * Live website audit for the Websites quiz (/quiz/[slug] with a URL question).
 *
 * Two sources, run in parallel:
 * - Google PageSpeed Insights (free API) — Lighthouse category scores + LCP/CLS.
 *   Works keyless at low volume; set PAGESPEED_API_KEY to raise the rate limit.
 * - One direct fetch of the page — title, meta description, Open Graph tags,
 *   mobile viewport, and https.
 *
 * Both sources degrade independently: if PSI times out, the basic checks still
 * return, and vice versa. `null` score/check values mean "couldn't measure",
 * never "failed the check".
 */

export type WebsiteAuditScores = {
  /** 0–100, from Lighthouse. Null when PSI didn't respond. */
  performance: number | null
  seo: number | null
  accessibility: number | null
  bestPractices: number | null
}

export type WebsiteAuditChecks = {
  https: boolean
  /** Null when the page fetch failed. */
  title: boolean | null
  metaDescription: boolean | null
  openGraph: boolean | null
  mobileViewport: boolean | null
}

export type WebsiteAudit = {
  url: string
  scores: WebsiteAuditScores
  /** Largest Contentful Paint in seconds, from PSI (mobile). */
  lcpSeconds: number | null
  checks: WebsiteAuditChecks
  /** True when neither source produced anything usable. */
  failed: boolean
}

const PSI_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
const PSI_TIMEOUT_MS = 50_000
const PAGE_TIMEOUT_MS = 12_000

async function runPageSpeed(url: string) {
  const params = new URLSearchParams({url, strategy: 'mobile'})
  for (const category of ['PERFORMANCE', 'SEO', 'ACCESSIBILITY', 'BEST_PRACTICES']) {
    params.append('category', category)
  }
  if (process.env.PAGESPEED_API_KEY) params.set('key', process.env.PAGESPEED_API_KEY)

  const response = await fetch(`${PSI_ENDPOINT}?${params}`, {
    signal: AbortSignal.timeout(PSI_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`PSI responded ${response.status}`)
  const json = await response.json()
  const categories = json?.lighthouseResult?.categories ?? {}
  const toScore = (c: {score?: number} | undefined) =>
    typeof c?.score === 'number' ? Math.round(c.score * 100) : null
  const lcpMs = json?.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue

  return {
    scores: {
      performance: toScore(categories.performance),
      seo: toScore(categories.seo),
      accessibility: toScore(categories.accessibility),
      bestPractices: toScore(categories['best-practices']),
    },
    lcpSeconds: typeof lcpMs === 'number' ? Math.round(lcpMs / 100) / 10 : null,
  }
}

async function runBasicChecks(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
    headers: {'user-agent': 'Mozilla/5.0 (compatible; SaltAudit/1.0; +https://createdbysalt.com)'},
    redirect: 'follow',
  })
  if (!response.ok) throw new Error(`Site responded ${response.status}`)
  // Only the <head> matters; cap the read so huge pages can't hurt us.
  const html = (await response.text()).slice(0, 200_000)

  const hasTag = (pattern: RegExp) => pattern.test(html)
  return {
    title: hasTag(/<title[^>]*>[^<]+<\/title>/i),
    metaDescription:
      hasTag(/<meta[^>]+name=["']description["'][^>]+content=["'][^"']+/i) ||
      hasTag(/<meta[^>]+content=["'][^"']+["'][^>]+name=["']description["']/i),
    openGraph: hasTag(/<meta[^>]+property=["']og:/i),
    mobileViewport: hasTag(/<meta[^>]+name=["']viewport["']/i),
  }
}

export async function auditWebsite(url: string): Promise<WebsiteAudit> {
  const [psi, page] = await Promise.allSettled([runPageSpeed(url), runBasicChecks(url)])

  if (psi.status === 'rejected') console.warn('Website audit: PSI failed', psi.reason)
  if (page.status === 'rejected') console.warn('Website audit: page fetch failed', page.reason)

  const psiResult = psi.status === 'fulfilled' ? psi.value : null
  const pageResult = page.status === 'fulfilled' ? page.value : null

  return {
    url,
    scores: psiResult?.scores ?? {
      performance: null,
      seo: null,
      accessibility: null,
      bestPractices: null,
    },
    lcpSeconds: psiResult?.lcpSeconds ?? null,
    checks: {
      https: url.startsWith('https://'),
      title: pageResult?.title ?? null,
      metaDescription: pageResult?.metaDescription ?? null,
      openGraph: pageResult?.openGraph ?? null,
      mobileViewport: pageResult?.mobileViewport ?? null,
    },
    failed: !psiResult && !pageResult,
  }
}
