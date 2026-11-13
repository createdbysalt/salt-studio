import 'server-only'
import {fetchPublic, readTextCapped} from '@/lib/audit/safeFetch'
import {normalizePublicUrl} from '@/lib/audit/url'
import {auditWebsite, type WebsiteAudit} from '@/lib/audit/website'
import {summarizeHtml, type SiteSummary} from '@/lib/growth/siteSummary'

/**
 * Everything measured on the buyer's website for the report: the existing
 * PageSpeed audit plus a read of what the homepage says. Either half can be
 * missing. Null means there is nothing measured, and the report then says
 * nothing about the site.
 */

export type SiteRead = {
  url: string
  audit: WebsiteAudit | null
  summary: SiteSummary | null
}

const PAGE_TIMEOUT_MS = 12_000

async function fetchSummary(url: string) {
  const response = await fetchPublic(url, {
    signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
    headers: {'user-agent': 'Mozilla/5.0 (compatible; SaltAudit/1.0; +https://createdbysalt.com)'},
  })
  if (!response.ok) throw new Error(`Site responded ${response.status}`)
  return summarizeHtml(await readTextCapped(response))
}

export async function readSite(rawUrl: string | null): Promise<SiteRead | null> {
  const url = normalizePublicUrl(rawUrl)
  if (!url) return null

  const [audit, summary] = await Promise.allSettled([auditWebsite(url), fetchSummary(url)])
  if (summary.status === 'rejected') console.warn('[growth] site read failed', summary.reason)

  const auditResult = audit.status === 'fulfilled' && !audit.value.failed ? audit.value : null
  const summaryResult = summary.status === 'fulfilled' ? summary.value : null
  if (!auditResult && !summaryResult) return null
  return {url, audit: auditResult, summary: summaryResult}
}
