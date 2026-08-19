/**
 * Contact menu copy + destinations — kept in code (same rationale as
 * `lib/aboutPanel.ts`) so the nav popover stays fast to tune without CMS.
 */

export const CONTACT_EMAIL = 'hello@createdbysalt.com'
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`
export const CONTACT_WHATSAPP_HREF = 'https://wa.me/19712052186'
/** Kept for pocket invites — not used as a public CTA. */
export const CONTACT_BOOK_HREF = 'https://cal.com/createdbysalt/discovery'
/** Sitewide studio ask — interest form, not a calendar. */
export const CONTACT_INTEREST_HREF = '/contact'

export const CONTACT_MENU = {
  eyebrow: 'Talk to us',
  line: 'A few projects a year.',
  bookLabel: 'Request a conversation',
  bookHint: 'Tell us about the work',
} as const

/** True when a nav/link href should open the contact menu instead of navigating. */
export function isContactHref(href: string | null | undefined): boolean {
  if (!href) return false
  try {
    const path = href.startsWith('http')
      ? new URL(href).pathname
      : href.split('?')[0]?.split('#')[0]
    return path === '/contact'
  } catch {
    return href === '/contact' || href.startsWith('/contact?') || href.startsWith('/contact#')
  }
}
