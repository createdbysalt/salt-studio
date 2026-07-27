import {dataset, projectId} from '@/sanity/lib/api'
import {createImageUrlBuilder} from '@sanity/image-url'
import {stegaClean} from 'next-sanity'
import type {Image} from 'sanity'

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

/**
 * Image source type that accepts both the strict Sanity Image type
 * and the looser types returned by GROQ queries.
 */
type ImageSource = Image | {asset?: {_ref?: string}} | null | undefined

export const urlForImage = (source: ImageSource) => {
  // Ensure that source image contains a valid reference
  if (!source?.asset?._ref) {
    return undefined
  }

  return imageBuilder
    ?.image(source as Image)
    .auto('format')
    .fit('max')
}

export function urlForOpenGraphImage(image: ImageSource) {
  return urlForImage(image)?.width(1200).height(627).fit('crop').url()
}

export function resolveHref(documentType?: string, slug?: string | null): string | undefined {
  switch (documentType) {
    case 'home':
      return '/'
    case 'workPage':
      return '/work'
    case 'capabilitiesPage':
      return '/capabilities'
    case 'studioPage':
      return '/studio'
    case 'contactPage':
      return '/contact'
    case 'rentalPage':
      return slug ? `/rentals/${slug}` : undefined
    case 'workCategory':
      return slug ? `/work/${slug}` : undefined
    case 'page':
      return slug ? `/${slug}` : undefined
    case 'project':
      return slug ? `/projects/${slug}` : undefined
    case 'legalPage':
      return slug ? `/legal/${slug}` : undefined
    default:
      console.warn('Invalid document type:', documentType)
      return undefined
  }
}

/**
 * A nav item after it's been resolved to a plain URL + display label — the
 * shape both the header Navbar and the homepage hero render. Stega markers are
 * stripped so the string is safe to use in effects (e.g. the hero's scramble).
 */
export type ResolvedNavChild = {label: string; href: string}
export type ResolvedNavItem = ResolvedNavChild & {children?: ResolvedNavChild[]}

type RawNavLink = {_type?: string | null; slug?: string | null; title?: string | null} | null
type RawNavEntry = {label?: string | null; link?: RawNavLink}

function resolveNavEntry(entry: RawNavEntry | null | undefined): ResolvedNavChild | null {
  const href = resolveHref(entry?.link?._type ?? undefined, entry?.link?.slug ?? undefined)
  if (!href) return null
  const label = stegaClean(entry?.label || entry?.link?.title || '')?.trim()
  if (!label) return null
  return {label, href}
}

/**
 * Turn the raw `settings.menuItems` (references + optional dropdown children)
 * into resolved `{label, href, children}` items. Entries whose link can't be
 * resolved to a URL are dropped, so the nav never renders a dead link.
 */
export function resolveMenu(
  menuItems: (RawNavEntry & {children?: RawNavEntry[] | null})[] | null | undefined,
): ResolvedNavItem[] {
  if (!menuItems?.length) return []
  return menuItems.flatMap((item) => {
    const base = resolveNavEntry(item)
    if (!base) return []
    const children = (item.children ?? [])
      .map(resolveNavEntry)
      .filter((child): child is ResolvedNavChild => Boolean(child))
    return [{...base, children: children.length ? children : undefined}]
  })
}
