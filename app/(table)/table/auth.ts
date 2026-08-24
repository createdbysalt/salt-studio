import {cookies, draftMode} from 'next/headers'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i

export function tableAuthCookieName(slug: string) {
  return `table_auth_${slug}`
}

export function isValidTableSlug(slug: string) {
  return SLUG_PATTERN.test(slug)
}

export async function isTableAuthenticated(slug: string) {
  if ((await draftMode()).isEnabled) return true
  if (!isValidTableSlug(slug)) return false
  const cookieStore = await cookies()
  return cookieStore.get(tableAuthCookieName(slug))?.value === '1'
}
