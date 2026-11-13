/**
 * Turns a visitor-typed website address into a URL that is safe to fetch
 * from the server: http or https, a real public hostname, no localhost, raw
 * IPs or internal names. Returns null for anything else.
 */

const BLOCKED_HOSTNAME = /^(localhost|.*\.local|.*\.internal|\d{1,3}(\.\d{1,3}){3}|\[.*\])$/i

export function normalizePublicUrl(raw: string | null | undefined): string | null {
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
