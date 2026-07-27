import {urlForImage} from '@/sanity/lib/utils'
import Link from 'next/link'

type SiteLogoImage = {
  asset?: {_ref: string} | null
  alt?: string | null
} | null

interface SiteLogoProps {
  /** `light` = white mark (dark backgrounds). `dark` = black mark (light backgrounds). */
  variant?: 'light' | 'dark'
  className?: string
  onClick?: () => void
  /** Sanity Settings → Site Logo. Falls back to a text wordmark when empty. */
  logo?: SiteLogoImage
  /** Used for alt / aria when the logo has no alt text. */
  siteName?: string | null
}

/**
 * Site-wide logo used in the header and mobile menu.
 * Prefers the Sanity Settings logo when set; otherwise a text "Salt Studio" mark.
 */
export function SiteLogo({
  variant = 'light',
  className = '',
  onClick,
  logo,
  siteName,
}: SiteLogoProps) {
  const sanitySrc = logo?.asset?._ref
    ? urlForImage({asset: {_ref: logo.asset._ref}})?.url()
    : undefined
  const fromSanity = Boolean(sanitySrc)
  // Sanity logos are expected black; invert for light (white) variant on dark surfaces.
  const filterClass = fromSanity
    ? variant === 'light'
      ? 'brightness-0 invert'
      : ''
    : ''
  const alt = logo?.alt?.trim() || siteName?.trim() || 'Salt Studio'
  const textClass =
    variant === 'dark'
      ? 'text-black'
      : 'text-white'

  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${alt} — Home`}
      className={`inline-flex items-center ${className}`}
    >
      {fromSanity && sanitySrc ? (
        <img src={sanitySrc} alt={alt} className={`h-5 w-auto md:h-10 ${filterClass}`} />
      ) : (
        <span
          className={`font-sans text-sm font-semibold tracking-[0.18em] uppercase md:text-base ${textClass}`}
        >
          Salt Studio
        </span>
      )}
    </Link>
  )
}
