/** Pacific time, with the short zone name so winter reads PST and summer reads PDT. */
export const SIGNING_TIME_ZONE = 'America/Los_Angeles'

const signingTime = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: SIGNING_TIME_ZONE,
  timeZoneName: 'short',
})

const signingDate = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
  timeZone: SIGNING_TIME_ZONE,
})

/** "November 23, 2026 at 3:24 AM PST". The email and a new statement of work share this. */
export function formatSigningTime(value: string | null | undefined) {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return signingTime.format(date)
}

/** The Pacific calendar day of a signing instant. "November 23, 2026". */
export function formatSigningDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return signingDate.format(date)
}
