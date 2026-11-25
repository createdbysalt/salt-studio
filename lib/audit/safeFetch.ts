import {lookup} from 'node:dns/promises'
import {isIP} from 'node:net'
import {normalizePublicUrl} from '@/lib/audit/url'

/**
 * Fetches a visitor-supplied URL without letting it reach anything private.
 *
 * Redirects are followed by hand, at most three, and every hop is checked
 * twice: the URL has to be a public-looking http(s) address, and every IP
 * its hostname resolves to has to be a public one. A hostname that points at
 * loopback, a private range, link-local (cloud metadata lives there) or the
 * like is refused.
 *
 * Known limit: the address is checked and then fetched by name, so a DNS
 * answer that changes between the two is not caught. Pinning the connection
 * to the checked IP would need a custom dispatcher.
 */

const MAX_REDIRECTS = 3

function ipv4Private(address: string) {
  const parts = address.split('.').map(Number)
  if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) return true
  const [a, b] = parts
  return (
    a === 0 || // unspecified
    a === 10 || // private
    a === 127 || // loopback
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    (a === 169 && b === 254) || // link-local, cloud metadata
    (a === 172 && b >= 16 && b <= 31) || // private
    (a === 192 && b === 168) || // private
    (a === 192 && b === 0) || // protocol assignments, documentation
    (a === 198 && (b === 18 || b === 19)) || // benchmarking
    a >= 224 // multicast and reserved
  )
}

/** True for any address that is not a normal public internet address. */
export function isPrivateAddress(address: string): boolean {
  const version = isIP(address)
  if (version === 4) return ipv4Private(address)
  if (version !== 6) return true

  const lower = address.toLowerCase()
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return ipv4Private(mapped[1])
  if (lower === '::' || lower === '::1') return true
  if (lower.startsWith('::ffff:')) return true // a mapped form we could not read
  const first = parseInt(lower.split(':')[0] || '0', 16)
  return (
    (first & 0xfe00) === 0xfc00 || // unique local fc00::/7
    (first & 0xffc0) === 0xfe80 || // link-local fe80::/10
    (first & 0xff00) === 0xff00 || // multicast
    lower.startsWith('2001:db8') // documentation
  )
}

async function assertPublicHost(hostname: string) {
  const bare = hostname.replace(/^\[|\]$/g, '')
  const addresses = isIP(bare) ? [{address: bare}] : await lookup(bare, {all: true, verbatim: true})
  if (addresses.length === 0 || addresses.some((a) => isPrivateAddress(a.address))) {
    throw new Error(`Refused to fetch ${hostname}: it does not resolve to a public address`)
  }
}

export async function fetchPublic(
  rawUrl: string,
  init: Omit<RequestInit, 'redirect'> = {},
): Promise<Response> {
  let current = normalizePublicUrl(rawUrl)
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!current) throw new Error('Refused to fetch: not a public http(s) address')
    await assertPublicHost(new URL(current).hostname)

    const response = await fetch(current, {...init, redirect: 'manual'})
    if (response.status < 300 || response.status >= 400) return response

    const location = response.headers.get('location')
    await response.body?.cancel().catch(() => undefined)
    if (!location) return response
    current = normalizePublicUrl(new URL(location, current).toString())
  }
  throw new Error('Refused to fetch: too many redirects')
}

/**
 * Reads at most `maxBytes` of a response as text and drops the rest, so a
 * huge or endless page cannot fill memory. Refuses anything that does not
 * say it is HTML or text.
 */
export async function readTextCapped(response: Response, maxBytes = 500_000): Promise<string> {
  const type = response.headers.get('content-type') ?? ''
  if (type && !/text\/|html|xml/i.test(type)) {
    await response.body?.cancel().catch(() => undefined)
    throw new Error(`Not a web page: ${type.slice(0, 60)}`)
  }
  if (!response.body) return ''

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let text = ''
  let received = 0
  while (received < maxBytes) {
    const {done, value} = await reader.read()
    if (done) break
    received += value.byteLength
    text += decoder.decode(value, {stream: true})
  }
  await reader.cancel().catch(() => undefined)
  return text
}
