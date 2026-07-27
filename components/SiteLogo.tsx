import {SaltWordmark} from '@/components/SaltWordmark'
import {urlForImage} from '@/sanity/lib/utils'
import Link from 'next/link'

type SiteLogoImage = {
  asset?: {_ref: string} | null
  alt?: string | null
} | null

interface SiteLogoProps {
  /** `light` = white mark (dark bands / media overlays). `dark` = ink mark (paper). */
  variant?: 'light' | 'dark'
  className?: string
  onClick?: () => void
  /** Sanity Settings → Site Logo. Falls back to the SALT wordmark SVG when empty. */
  logo?: SiteLogoImage
  /** Used for alt / aria when the logo has no alt text. */
  siteName?: string | null
  /**
   * Size classes for the mark itself (explicit px — the project remaps the
   * Tailwind spacing scale, so h-8 ≠ 32px here). Default is nav scale.
   */
  markClassName?: string
}

/**
 * Site-wide logo used in the header, mobile menu, and footer.
 * Prefers the Sanity Settings logo when set; otherwise the inline SALT
 * wordmark, which recolors via currentColor (paper, ink bands, blend nav).
 */
export function SiteLogo({
  variant = 'light',
  className = '',
  onClick,
  logo,
  siteName,
  markClassName = 'h-[26px] w-auto md:h-[32px]',
}: SiteLogoProps) {
  const sanitySrc = logo?.asset?._ref
    ? urlForImage({asset: {_ref: logo.asset._ref}})?.url()
    : undefined
  const fromSanity = Boolean(sanitySrc)
  // Sanity logos are expected black; invert for the light variant on dark surfaces.
  const filterClass = fromSanity && variant === 'light' ? 'brightness-0 invert' : ''
  const alt = logo?.alt?.trim() || siteName?.trim() || 'Salt Studio'
  const markColor = variant === 'dark' ? 'text-foreground' : 'text-white'

  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${alt} — Home`}
      className={`inline-flex items-center ${className}`}
    >
      {fromSanity && sanitySrc ? (
        <img src={sanitySrc} alt={alt} className={`${markClassName} ${filterClass}`} />
      ) : (
        <SaltWordmark title={alt} className={`${markClassName} ${markColor}`} />
      )}
    </Link>
  )
}
