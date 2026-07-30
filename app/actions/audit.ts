'use server'

import {auditWebsite, type WebsiteAudit} from '@/lib/audit/website'

/**
 * Runs the live website audit from the quiz results screen. The URL comes from
 * a visitor-typed answer, so it's validated hard before any server-side fetch
 * happens (public hostnames only — no localhost, IPs, or internal names).
 */

const BLOCKED_HOSTNAME = /^(localhost|.*\.local|.*\.internal|\d{1,3}(\.\d{1,3}){3}|\[.*\])$/i

function normalizeUrl(raw: string): string | null {
  const trimmed = (raw || '').trim().slice(0, 500)
  if (!trimmed) return null
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  let parsed: URL
  try {
    parsed = new URL(withProtocol)
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
  if (!parsed.hostname.includes('.') || BLOCKED_HOSTNAME.test(parsed.hostname)) return null
  return parsed.toString()
}

export async function runWebsiteAudit(rawUrl: string): Promise<WebsiteAudit | null> {
  const url = normalizeUrl(rawUrl)
  if (!url) return null
  try {
    return await auditWebsite(url)
  } catch (error) {
    console.error('Website audit failed', error)
    return null
  }
}
