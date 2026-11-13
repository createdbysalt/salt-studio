/**
 * What a first-time visitor can see on a homepage, pulled from its HTML
 * without a browser. Pure, so it is testable. Everything here is something
 * the report is allowed to state as observed.
 */

export type SiteSummary = {
  title: string | null
  metaDescription: string | null
  /** Up to eight h1 and h2 texts, in page order. */
  headings: string[]
  /** Visible text of links and buttons that look like a way to book (max five). */
  bookingLabels: string[]
  hasTapToCall: boolean
  hasForm: boolean
  mentionsPortland: boolean
}

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&nbsp;': ' ',
  '&#39;': "'",
  '&apos;': "'",
  '&quot;': '"',
  '&lt;': '<',
  '&gt;': '>',
}

function text(fragment: string) {
  return fragment
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
}

const BOOKING = /\b(book|schedule|consult|appointment|request a|get started|reserve)\b/i

export function summarizeHtml(rawHtml: string): SiteSummary {
  const html = rawHtml
    .slice(0, 400_000)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1]

  const headings = [...html.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi)]
    .map((m) => text(m[1]))
    .filter(Boolean)
    .slice(0, 8)

  const bookingLabels = [
    ...new Set(
      [...html.matchAll(/<(a|button)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
        .map((m) => text(m[2]))
        .filter((label) => label.length > 0 && label.length <= 60 && BOOKING.test(label)),
    ),
  ].slice(0, 5)

  return {
    title: title ? text(title) || null : null,
    metaDescription: description ? text(description) || null : null,
    headings,
    bookingLabels,
    hasTapToCall: /href=["']tel:/i.test(html),
    hasForm: /<form\b/i.test(html),
    mentionsPortland: /\bportland\b/i.test(html.replace(/<[^>]+>/g, ' ')),
  }
}
