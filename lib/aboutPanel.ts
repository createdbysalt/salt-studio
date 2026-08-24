/** About panel helpers. Person copy lives in Sanity `person` documents. */

export const ABOUT_VIDEO_SRC = '/about/studio.mp4'

export const ABOUT_VIDEO_BY_SLUG: Record<string, string> = {
  gabi: '/about/studio.mp4',
  matt: '/about/matt.mp4',
}

export function personVideoSrc(slug: string | null | undefined): string | null {
  if (!slug) return null
  return ABOUT_VIDEO_BY_SLUG[slug] ?? null
}

export const ABOUT_DEFAULT_SLUG = 'gabi'

export const ABOUT_WAITLIST_HREF = 'https://usesalt.io'

export const ABOUT_INTEREST_HREF = '/contact'

export const ABOUT_RESERVED_SLUGS = ['gabi', 'matt', 'about'] as const

export function personHref(slug: string | null | undefined): string {
  return slug ? `/${slug}` : `/${ABOUT_DEFAULT_SLUG}`
}

export function isAboutHref(href: string | null | undefined): boolean {
  if (!href) return false
  try {
    const path = href.startsWith('http')
      ? new URL(href).pathname
      : href.split('?')[0]?.split('#')[0]
    const normalized = path?.replace(/\/$/, '') || '/'
    return normalized === '/about' || normalized === '/gabi' || normalized === '/matt'
  } catch {
    return href === '/about' || href === '/gabi' || href === '/matt'
  }
}

export function aboutSlugFromPath(pathname: string | null | undefined): string | null {
  if (!pathname) return null
  const normalized = pathname.replace(/\/$/, '') || '/'
  if (normalized === '/about') return ABOUT_DEFAULT_SLUG
  if (normalized === '/gabi' || normalized === '/matt') return normalized.slice(1)
  return null
}
