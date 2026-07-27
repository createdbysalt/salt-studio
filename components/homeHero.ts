import {stegaClean} from 'next-sanity'

/**
 * Shared, framework-agnostic data + helpers for the homepage hero. Kept in a
 * plain (non-'use client') module so both the server `HomePage` and the client
 * `VideoHero` can import them — a Server Component can render a Client
 * Component, but it cannot *call* a function that lives in a client module.
 */

export type NavChild = {label: string; href: string}
export type NavItem = {label: string; href: string; children?: NavChild[]}

export type MarqueeClient = {
  name: string
  website?: string | null
  id?: string | null
}

// Fallback nav if `settings.menuItems` hasn't been filled in Sanity yet, so the
// header never renders empty. Once the client populates the nav, that wins.
export const DEFAULT_NAV: NavItem[] = [
  {label: 'Work', href: '/work'},
  {label: 'Capabilities', href: '/capabilities'},
  {label: 'Studio', href: '/studio'},
  {
    label: 'Rentals',
    // No /rentals hub — parent click lands on studio; hover dropdown for all three.
    href: '/rentals/studio',
    children: [
      {label: 'Studio', href: '/rentals/studio'},
      {label: 'Podcast', href: '/rentals/podcast'},
      {label: 'Gear', href: '/rentals/gear'},
    ],
  },
  {label: 'Contact', href: '/contact'},
]

// Fallback roster if no clients are marked "featured" (or none exist) in
// Sanity, so the strip never renders blank during setup.
export const DEFAULT_CLIENTS = [
  'Nike',
  'Adidas',
  'Google Pixel',
  'Under Armour',
  'Hyperice',
  'JBL',
  'GQ',
]

export const DEFAULT_MARQUEE_CLIENTS: MarqueeClient[] = DEFAULT_CLIENTS.map((name) => ({name}))

// The CTA button (GhostCTA) appends its own arrow, so strip any trailing "→"
// baked into the Sanity label to avoid doubling it.
export function normalizeCtaLabel(label?: string | null): string {
  const clean = label ? stegaClean(label) : ''
  const stripped = clean.replace(/[→\s]+$/, '').trim()
  return stripped || 'Start a Conversation'
}

/** Resolve a CTA document link, optionally appending ?subject= for /contact. */
export function resolveCtaHref(
  cta?: {
    link?: string | null
    contactSubject?: string | null
  } | null,
): string {
  const link = stegaClean(cta?.link ?? '')?.trim() || '/contact'
  const subject = stegaClean(cta?.contactSubject ?? '')?.trim()
  if (!subject) return link

  const isContact =
    link === '/contact' || link.startsWith('/contact?') || link.startsWith('/contact#')
  if (!isContact) return link

  const [pathname, search = ''] = link.split('?')
  const params = new URLSearchParams(search)
  params.set('subject', subject)
  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}
