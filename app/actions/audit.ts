'use server'

import {normalizePublicUrl} from '@/lib/audit/url'
import {auditWebsite, type WebsiteAudit} from '@/lib/audit/website'

/**
 * Runs the live website audit from the quiz results screen. The URL comes from
 * a visitor-typed answer, so it's validated hard before any server-side fetch
 * happens (public hostnames only — no localhost, IPs, or internal names).
 */

export async function runWebsiteAudit(rawUrl: string): Promise<WebsiteAudit | null> {
  const url = normalizePublicUrl(rawUrl)
  if (!url) return null
  try {
    return await auditWebsite(url)
  } catch (error) {
    console.error('Website audit failed', error)
    return null
  }
}
