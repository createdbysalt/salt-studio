'use client'

import {useAboutPanel} from '@/components/AboutPanel'
import {useContactMenu} from '@/components/ContactMenu'
import {DEFAULT_NAV} from '@/components/homeHero'
import {EASE, gsap, prefersReducedMotion} from '@/components/motion/gsap'
import {SaltWordmark} from '@/components/SaltWordmark'
import {isAboutHref} from '@/lib/aboutPanel'
import {ucShowSecondLayer} from '@/lib/analytics'
import {isContactHref} from '@/lib/contactMenu'
import type {FooterLegalPagesQueryResult, SettingsQueryResult} from '@/sanity.types'
import {resolveMenu} from '@/sanity/lib/utils'
import {useGSAP} from '@gsap/react'
import {stegaClean} from 'next-sanity'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useRef, type MouseEvent} from 'react'

/** Routes whose page stage is dark — footer flips to paper (inverse). */
function pageIsDark(pathname: string): boolean {
  return (
    pathname.startsWith('/projects/') ||
    pathname === '/work' ||
    pathname.startsWith('/work/') ||
    pathname === '/legal' ||
    pathname.startsWith('/legal/')
  )
}

type FooterSocialPlatform = 'linkedin' | 'instagram' | 'x' | 'email' | 'whatsapp'

const SOCIAL_ORDER: FooterSocialPlatform[] = ['linkedin', 'instagram', 'x', 'email', 'whatsapp']

const SOCIAL_LABELS: Record<FooterSocialPlatform, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  x: 'X',
  email: 'Email',
  whatsapp: 'WhatsApp',
}

/** Fallbacks when Settings → Footer social links omit a platform. */
const SOCIAL_FALLBACKS: Partial<Record<FooterSocialPlatform, string>> = {
  linkedin: 'https://www.linkedin.com/company/createdbysalt/',
  instagram: 'https://www.instagram.com/createdbysalt/',
  x: 'https://x.com/saltstudiohq',
  email: 'mailto:hello@createdbysalt.com',
  whatsapp: 'https://wa.me/19712052186',
}

const iconClass = 'h-[14px] w-[14px] fill-current'

function SocialIcon({platform}: {platform: FooterSocialPlatform}) {
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

  if (platform === 'email') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={iconClass} focusable="false">
        <path d="M1.5 4.5A1.5 1.5 0 013 3h18a1.5 1.5 0 011.5 1.5v15A1.5 1.5 0 0121 21H3a1.5 1.5 0 01-1.5-1.5v-15zm2.03.5l8.22 6.165a.75.75 0 00.9 0L20.47 5H3.53zM21 6.882l-7.53 5.648a2.25 2.25 0 01-2.94 0L3 6.882V19.5h18V6.882z" />
      </svg>
    )
  }

  if (platform === 'whatsapp') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={iconClass} focusable="false">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden className={iconClass} focusable="false">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function isFooterSocialPlatform(value: string): value is FooterSocialPlatform {
  return (
    value === 'linkedin' ||
    value === 'instagram' ||
    value === 'x' ||
    value === 'email' ||
    value === 'whatsapp'
  )
}

function isExternalHref(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://')
}

type SiteFooterProps = {
  settings: SettingsQueryResult | null
  legalPages?: FooterLegalPagesQueryResult | null
}

const LEGAL_TYPE_LABELS: Record<string, string> = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  cookies: 'Cookie Policy',
  accessibility: 'Accessibility',
  disclaimer: 'Disclaimer',
  custom: 'Legal',
}

const LEGAL_FALLBACKS = [
  {title: 'Privacy Policy', slug: 'privacy-policy'},
  {title: 'Terms of Service', slug: 'terms-of-service'},
] as const

/**
 * Sticky reveal footer — top nav (appears when fully revealed) + mark +
 * social + legal. Inverse of the page: dark on light routes, paper on
 * dark project pages.
 */
export function SiteFooter({settings, legalPages}: SiteFooterProps) {
  const pathname = usePathname()
  const {openAbout} = useAboutPanel()
  const {openContact} = useContactMenu()
  const inverseLight = pageIsDark(pathname)
  const siteName = stegaClean(settings?.siteName ?? '') || 'Salt Studio'
  const year = new Date().getFullYear()
  const footerRef = useRef<HTMLElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const markRef = useRef<HTMLDivElement>(null)

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isAboutHref(href)) {
      event.preventDefault()
      openAbout()
      return
    }
    if (isContactHref(href)) {
      event.preventDefault()
      openContact()
    }
  }

  useGSAP(
    () => {
      const footer = footerRef.current
      const mark = markRef.current
      const nav = navRef.current
      if (!footer) return

      const paths = mark?.querySelectorAll('path') ?? []
      const navLinks = nav?.querySelectorAll('a') ?? []

      if (prefersReducedMotion()) {
        if (paths.length) gsap.set(paths, {autoAlpha: 1, x: 0})
        if (nav) gsap.set(nav, {autoAlpha: 1, y: 0})
        if (navLinks.length) gsap.set(navLinks, {autoAlpha: 1, y: 0})
        return
      }

      if (paths.length) {
        gsap.fromTo(
          paths,
          {autoAlpha: 0, x: -48},
          {
            autoAlpha: 1,
            x: 0,
            stagger: 0.12,
            ease: EASE.outQuint,
            scrollTrigger: {
              trigger: footer,
              start: 'top bottom',
              end: 'bottom bottom',
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          },
        )
      }

      // Top nav fades in only once the sticky footer is fully uncovered.
      if (nav && navLinks.length) {
        gsap.set(nav, {autoAlpha: 1})
        gsap.set(navLinks, {autoAlpha: 0, y: -14})
        gsap.to(navLinks, {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.06,
          ease: EASE.outQuint,
          scrollTrigger: {
            trigger: footer,
            start: 'bottom bottom',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        })
      }
    },
    {scope: footerRef, dependencies: [pathname]},
  )

  const resolvedNav = resolveMenu(settings?.menuItems)
  const menuItems = resolvedNav.length
    ? resolvedNav
    : DEFAULT_NAV.map((item) => ({label: item.label, href: item.href}))
  const navItems = [{label: 'Home', href: '/'}, ...menuItems.filter((item) => item.href !== '/')]

  const fromCms = new Map<FooterSocialPlatform, string>()
  for (const item of settings?.footerSocial ?? []) {
    if (!item?.platform || !item?.href) continue
    const platform = stegaClean(item.platform)
    if (!isFooterSocialPlatform(platform)) continue
    fromCms.set(platform, stegaClean(item.href))
  }

  const socialLinks = SOCIAL_ORDER.flatMap((platform) => {
    const href = fromCms.get(platform) || SOCIAL_FALLBACKS[platform]
    if (!href) return []
    return [{platform, href, label: SOCIAL_LABELS[platform]}]
  })

  const fromLegal = (legalPages ?? []).filter((page): page is NonNullable<typeof page> =>
    Boolean(page?.slug),
  )
  const legalLinks =
    fromLegal.length > 0
      ? fromLegal.map((page) => {
          const pageType = stegaClean(page.pageType ?? '') || 'custom'
          return {
            title:
              stegaClean(page.title ?? '') ||
              LEGAL_TYPE_LABELS[pageType] ||
              LEGAL_TYPE_LABELS.custom,
            href: `/legal/${stegaClean(page.slug ?? '')}`,
          }
        })
      : LEGAL_FALLBACKS.map((page) => ({
          title: page.title,
          href: `/legal/${page.slug}`,
        }))

  return (
    <footer
      ref={footerRef}
      data-theme={inverseLight ? undefined : 'dark'}
      className="sticky bottom-0 z-0 flex min-h-[58svh] w-full flex-col overflow-hidden bg-background text-foreground"
    >
      <nav
        ref={navRef}
        aria-label="Footer"
        className="flex w-full items-center justify-between px-6 pt-3 md:px-10 md:pt-3.5"
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={(event) => handleNavClick(event, item.href)}
            className="font-sans text-[12px] font-semibold tracking-[-0.02em] text-foreground/45 transition-opacity hover:opacity-70 md:text-[13px]"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-16 pt-24">
        <div ref={markRef} className="flex items-center justify-center">
          <SaltWordmark
            title={siteName}
            className="h-[clamp(3.25rem,9vw,6rem)] w-auto text-foreground"
          />
        </div>

        <ul className="flex items-center gap-3.5">
          {socialLinks.map((item) => {
            const external = isExternalHref(item.href)
            return (
              <li key={item.platform}>
                <a
                  href={item.href}
                  {...(external ? {target: '_blank', rel: 'noopener noreferrer'} : undefined)}
                  aria-label={item.label}
                  className="block text-foreground transition-opacity hover:opacity-55"
                >
                  <SocialIcon platform={item.platform} />
                </a>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="flex w-full flex-col items-center gap-y-2 px-6 pb-5 pt-2 text-center font-sans text-[12px] font-medium leading-none text-foreground/45 md:flex-row md:flex-nowrap md:items-baseline md:justify-center md:gap-x-4 md:gap-y-0 md:text-[13px]">
        <span className="whitespace-nowrap">
          © {year} {siteName}. All rights reserved.
        </span>
        <nav aria-label="Legal" className="flex flex-wrap items-baseline justify-center gap-x-4">
          {legalLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-inherit transition-opacity hover:opacity-70"
            >
              {item.title}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => ucShowSecondLayer()}
            className="whitespace-nowrap text-inherit transition-opacity hover:opacity-70"
          >
            Privacy Settings
          </button>
        </nav>
      </div>
    </footer>
  )
}
