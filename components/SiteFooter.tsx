'use client'

import {SiteLogo} from '@/components/SiteLogo'
import {isDarkSurface} from '@/lib/site-surface'
import type {
  FooterLegalPagesQueryResult,
  LocationsQueryResult,
  SettingsQueryResult,
} from '@/sanity.types'
import {resolveHref, urlForImage} from '@/sanity/lib/utils'
import {Mail} from 'lucide-react'
import {stegaClean} from 'next-sanity'
import Link from 'next/link'
import {usePathname} from 'next/navigation'

/** Short bottom-strip label from legal page type (or title fallback). */
function legalStripLabel(pageType: string | null | undefined, title: string | null | undefined) {
  switch (stegaClean(pageType ?? '')) {
    case 'privacy':
      return 'Privacy'
    case 'terms':
      return 'Terms'
    case 'cookies':
      return 'Cookies'
    case 'accessibility':
      return 'Accessibility'
    default:
      return stegaClean(title ?? '') || 'Legal'
  }
}

type FooterSocialPlatform =
  | 'instagram'
  | 'vimeo'
  | 'email'
  | 'youtube'
  | 'x'
  | 'linkedin'
  | 'tiktok'
  | 'custom'

const PLATFORM_TITLES: Record<FooterSocialPlatform, string> = {
  instagram: 'Instagram',
  vimeo: 'Vimeo',
  email: 'Email',
  youtube: 'YouTube',
  x: 'X',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  custom: 'Link',
}

const BUILT_WITH_LABEL = 'Built with SALT Studio'
const BUILT_WITH_HREF = 'https://createdbysalt.com'

const iconClass = 'h-[15px] w-[15px] fill-current'

function BuiltInSocialIcon({platform}: {platform: Exclude<FooterSocialPlatform, 'custom'>}) {
  if (platform === 'email') {
    return <Mail aria-hidden className="h-[15px] w-[15px]" strokeWidth={1.75} />
  }

  if (platform === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={iconClass} focusable="false">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    )
  }

  if (platform === 'x') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={iconClass} focusable="false">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    )
  }

  if (platform === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={iconClass} focusable="false">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    )
  }

  if (platform === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={iconClass} focusable="false">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )
  }

  if (platform === 'tiktok') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={iconClass} focusable="false">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    )
  }

  // Official Vimeo icon mark — the stylized lowercase "v" (not the wordmark).
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={iconClass} focusable="false">
      <path d="M23.9765 6.4168c-.105 2.338-1.739 5.5429-4.894 9.6088-3.2679 4.247-6.0258 6.3699-8.2898 6.3699-1.409 0-2.578-1.294-3.553-3.881l-1.9179-7.1138c-.719-2.584-1.488-3.878-2.312-3.878-.179 0-.806.378-1.8809 1.132l-1.129-1.457a315.06 315.06 0 003.501-3.1279c1.579-1.368 2.765-2.085 3.5539-2.159 1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.5069.5389 2.45 1.1309 3.674 1.7759 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.8679 3.434-5.7568 6.7619-5.6368 2.4729.06 3.6279 1.664 3.4929 4.7969z" />
    </svg>
  )
}

function isFooterSocialPlatform(value: string): value is FooterSocialPlatform {
  return value in PLATFORM_TITLES
}

type SiteFooterProps = {
  settings: SettingsQueryResult | null
  locations?: LocationsQueryResult | null
  /** Auto-populated from Dynamic Content → Legal Pages. */
  legalPages?: FooterLegalPagesQueryResult | null
}

/**
 * Site-wide footer. Light on paper pages; dark on work/project surfaces
 * (matches SiteShell). Centered: studio + addresses + social.
 * Bottom strip: © year · credit · legal links (every Legal Page document).
 */
export function SiteFooter({settings, locations, legalPages}: SiteFooterProps) {
  const pathname = usePathname()
  const onDark = isDarkSurface(pathname)

  const siteName = stegaClean(settings?.siteName ?? '') || 'Salt Studio'
  const showLocations = settings?.showFooterLocations !== false
  const showLegal = settings?.showFooterLegal !== false
  const showBuiltWith = settings?.showBuiltWithCredit !== false

  const addressLines = showLocations
    ? (locations ?? [])
        .map((loc) => (loc?.address ? stegaClean(loc.address).trim() : ''))
        .filter(Boolean)
    : []

  const social = (settings?.footerSocial ?? []).filter((item): item is NonNullable<typeof item> =>
    Boolean(item?.platform && item?.href),
  )

  const legal = showLegal
    ? (legalPages ?? [])
        .map((item) => {
          if (!item?.slug) return null
          const href = resolveHref(item._type, item.slug)
          if (!href) return null
          return {
            href,
            label: legalStripLabel(item.pageType, item.title),
          }
        })
        .filter((item): item is {href: string; label: string} => Boolean(item))
    : []

  const year = new Date().getFullYear()
  const linkClass = onDark
    ? 'text-white/70 transition-colors hover:text-white'
    : 'text-black/70 transition-colors hover:text-black'
  const mutedClass = onDark ? 'text-white/45' : 'text-black/45'
  const customIconClass = onDark
    ? 'h-[15px] w-[15px] object-contain brightness-0 invert'
    : 'h-[15px] w-[15px] object-contain brightness-0'

  return (
    <footer
      className={`w-full border-t ${
        onDark
          ? 'border-white/10 bg-[#1a1a1a] text-white'
          : 'border-black/10 bg-background-light text-foreground-light'
      }`}
    >
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-5 px-5 pb-6 pt-20 text-center md:gap-6 md:px-6 md:pb-7 md:pt-24">
        <div className="space-y-1 font-mono text-[12px] uppercase leading-[1.7] tracking-[0.12em]">
          <SiteLogo
            variant={onDark ? 'light' : 'dark'}
            logo={settings?.logo}
            siteName={siteName}
            className="mb-4 justify-center"
          />
          {addressLines.map((line) => (
            <p key={line} className={`!m-0 ${mutedClass}`}>
              {line}
            </p>
          ))}
        </div>

        {social.length > 0 ? (
          <ul className="flex items-center justify-center gap-4">
            {social.map((item) => {
              const platformRaw = stegaClean(item.platform ?? '')
              const platform = isFooterSocialPlatform(platformRaw) ? platformRaw : null
              const label = stegaClean(item.label ?? '')
              const href = stegaClean(item.href ?? '')
              const displayName = label || (platform ? PLATFORM_TITLES[platform] : '') || 'Link'
              const isMailto = href.startsWith('mailto:')
              const customSrc =
                platform === 'custom' && item.customIcon?.asset?._ref
                  ? urlForImage({asset: {_ref: item.customIcon.asset._ref}})?.url()
                  : undefined

              return (
                <li key={item._key ?? href}>
                  <a
                    href={href}
                    {...(isMailto ? {} : {target: '_blank', rel: 'noopener noreferrer'})}
                    aria-label={displayName}
                    className={`${linkClass} inline-flex`}
                  >
                    {platform && platform !== 'custom' ? (
                      <BuiltInSocialIcon platform={platform} />
                    ) : customSrc ? (
                      <img src={customSrc} alt="" aria-hidden className={customIconClass} />
                    ) : (
                      <span className="font-mono text-[12px] uppercase tracking-[0.14em]">
                        {displayName}
                      </span>
                    )}
                  </a>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>

      <div
        className={`mx-auto flex max-w-[1440px] flex-col items-center justify-center gap-3 px-5 pb-7 pt-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] md:flex-row md:flex-wrap md:gap-x-2 md:px-6 md:pb-8 md:pt-3 ${mutedClass}`}
      >
        <span>
          © {siteName} {year}
        </span>
        {showBuiltWith ? (
          <>
            <span className="hidden md:inline" aria-hidden>
              ·
            </span>
            <a
              href={BUILT_WITH_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {BUILT_WITH_LABEL}
            </a>
          </>
        ) : null}
        {legal.map((item) => (
          <span key={item.href} className="contents">
            <span className="hidden md:inline" aria-hidden>
              ·
            </span>
            <Link href={item.href} className={linkClass}>
              {item.label}
            </Link>
          </span>
        ))}
      </div>
    </footer>
  )
}
