import {urlForImage} from '@/sanity/lib/utils'

export type StudioSanityImage = {
  asset?: {_ref?: string; _id?: string; url?: string} | null
  alt?: string | null
} | null

/**
 * Facility stills fallbacks — empty until Salt uploads its own media.
 * Do not hardcode another project's Sanity CDN URLs here.
 */
export const PORTLAND_STUDIO_STILLS: ReadonlyArray<{src: string; alt: string}> = []

/** Defaults when CMS media fields are empty. Prefer local assets only. */
export const STUDIO_DEFAULT_IMAGES = {
  hero: '/studio/hero-spacesuit-xray.jpg',
  rentalHero: '/studio/hero-spacesuit-xray.jpg',
  gallery: [] as string[],
  lisbon: '',
} as const

/** Local crew portraits — empty until Salt team media is uploaded. */
export const CREW_FALLBACK_PORTRAITS: Record<string, string> = {}

export function resolveStudioImageSrc(
  image: StudioSanityImage | undefined,
  fallback: string,
  width = 2400,
  height = 1600,
) {
  if (image?.asset?._ref) {
    return (
      urlForImage({asset: {_ref: image.asset._ref}})
        ?.width(width)
        .height(height)
        .fit('crop')
        .url() || fallback
    )
  }
  if (image?.asset?.url) return image.asset.url
  return fallback
}

export function resolveCrewPortraitSrc(
  memberId: string | null | undefined,
  portrait: StudioSanityImage | undefined,
) {
  if (portrait?.asset?._ref) {
    return (
      urlForImage({asset: {_ref: portrait.asset._ref}})
        ?.width(1200)
        .height(1500)
        .fit('crop')
        .url() || null
    )
  }
  if (portrait?.asset?.url) return portrait.asset.url
  if (memberId && CREW_FALLBACK_PORTRAITS[memberId]) {
    return CREW_FALLBACK_PORTRAITS[memberId]
  }
  return null
}
