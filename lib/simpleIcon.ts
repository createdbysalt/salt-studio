import type {SimpleIcon} from 'simple-icons'
import * as simpleIcons from 'simple-icons'

/**
 * Resolve a Simple Icons slug (e.g. “nextdotjs”) to the icon object.
 * Slug → export key: nextdotjs → siNextdotjs.
 * Server-only helper — resolve path/title before passing props to client components
 * so the full simple-icons package never ships to the browser.
 */
export function getSimpleIcon(slug: string | null | undefined): SimpleIcon | null {
  const clean = slug?.trim()
  if (!clean) return null
  const key = `si${clean.charAt(0).toUpperCase()}${clean.slice(1)}`
  const icon = (simpleIcons as Record<string, unknown>)[key]
  if (!icon || typeof icon !== 'object' || !('path' in icon)) return null
  return icon as SimpleIcon
}
