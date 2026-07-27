import {urlForImage} from '@/sanity/lib/utils'
import Image from 'next/image'

/** Ambient loops when section file fields are empty — no cross-project CDN defaults. */
export const CAP_DEFAULT_VIDEO = {
  heroLight: '',
  scaleDark: '',
  agencyDark: '',
} as const

/** Local stills extracted from the capabilities pitch deck frames. */
export const CAP_DEFAULT_STILL = {
  creative: '/capabilities/capture-motion-stills.jpg',
  production: '/capabilities/specialty-capture.jpg',
  post: '/capabilities/equipment-rigs.jpg',
  scale: '/capabilities/xray-hand.jpg',
  agency: '/capabilities/equipment-rigs.jpg',
} as const

type SanityImage = {
  asset?: {_ref?: string; _id?: string; url?: string} | null
  alt?: string | null
} | null

type CapabilitiesStillProps = {
  image?: SanityImage
  fallbackSrc: string
  alt: string
  priority?: boolean
  className?: string
  sizes?: string
  /** Scale past the frame to clip white borders baked into deck stills. */
  bleedEdges?: boolean
  /** Subtle brightness + wash — matches location diptych treatment. */
  soften?: boolean
}

/** Sanity image when set; otherwise a local deck still. */
export function CapabilitiesStill({
  image,
  fallbackSrc,
  alt,
  priority = false,
  className = '',
  sizes = '(min-width: 1024px) 50vw, 100vw',
  bleedEdges = false,
  soften = false,
}: CapabilitiesStillProps) {
  const fromSanity = image?.asset?._ref
    ? urlForImage({asset: {_ref: image.asset._ref}})
        ?.width(1600)
        .height(1200)
        .fit('crop')
        .url()
    : null
  const src = fromSanity || fallbackSrc
  const resolvedAlt = image?.alt?.trim() || alt

  return (
    <div className={`relative h-full overflow-hidden bg-black ${className}`}>
      <Image
        src={src}
        alt={resolvedAlt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover object-center ${bleedEdges ? 'scale-[1.08]' : ''} ${
          soften ? 'brightness-[0.97]' : ''
        }`}
      />
      {soften ? (
        <div className="pointer-events-none absolute inset-0 z-[1] bg-black/[0.06]" aria-hidden />
      ) : null}
    </div>
  )
}
