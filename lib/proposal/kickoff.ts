/**
 * The Cal.com link for the kickoff page, with the day they chose and their
 * details filled in. Pure, so the page and tests share it.
 */

export type KickoffPrefill = {
  date: string | null
  name: string | null
  email: string | null
}

export type KickoffLink = {
  /** What `@calcom/embed-react` wants: "createdbysalt/kickoff?date=…". */
  calLink: string
  /** The same booking as a full URL, for a plain link fallback. */
  href: string
}

export function kickoffLink(base: string | null | undefined, prefill: KickoffPrefill) {
  if (!base) return null
  let url: URL
  try {
    url = new URL(base)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' || !url.hostname.endsWith('cal.com')) return null

  const {date, name, email} = prefill
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    url.searchParams.set('date', date)
    url.searchParams.set('month', date.slice(0, 7))
  }
  if (name) url.searchParams.set('name', name)
  if (email) url.searchParams.set('email', email)

  const path = url.pathname.replace(/^\/+/, '')
  if (!path) return null
  return {calLink: `${path}${url.search}`, href: url.toString()} satisfies KickoffLink
}
