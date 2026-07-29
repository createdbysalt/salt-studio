/**
 * Contact menu copy + destinations — kept in code (same rationale as
 * `lib/aboutPanel.ts`) so the nav popover stays fast to tune without CMS.
 */

export const CONTACT_EMAIL = 'hello@createdbysalt.com'
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`
export const CONTACT_WHATSAPP_HREF = 'https://wa.me/19712052186'
/** Cal.com discovery call — primary booking destination sitewide. */
export const CONTACT_BOOK_HREF = 'https://cal.com/createdbysalt/discovery'

export const CONTACT_MENU = {
  eyebrow: 'Talk to us',
  line: "Let's innovate together",
  bookLabel: 'Book a discovery call',
  bookHint: '25 minutes',
  whatsappLabel: 'Chat via WhatsApp',
  whatsappHint: 'Usually same hour',
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
