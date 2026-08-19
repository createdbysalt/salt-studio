import {stegaClean} from 'next-sanity'

/**
 * Shared, framework-agnostic data + helpers for the homepage hero and nav.
 * Kept in a plain (non-'use client') module so both server and client
 * components can import them.
 */

export type NavChild = {label: string; href: string}
export type NavItem = {label: string; href: string; children?: NavChild[]}

// Fallback nav if `settings.menuItems` hasn't been filled in Sanity yet, so the
// header never renders empty. Once the client populates the nav, that wins.
export const DEFAULT_NAV: NavItem[] = [
  {label: 'Work', href: '/work'},
  {label: 'Capabilities', href: '/capabilities'},
  {label: 'Contact', href: '/contact'},
]

// The CTA button appends its own arrow, so strip any trailing "→"
// baked into the Sanity label to avoid doubling it.
export function normalizeCtaLabel(label?: string | null): string {
  const clean = label ? stegaClean(label) : ''
  const stripped = clean.replace(/[→\s]+$/, '').trim()
  return stripped || 'Request a conversation'
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
