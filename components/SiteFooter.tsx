'use client'

import {DEFAULT_NAV} from '@/components/homeHero'
import {EASE, gsap, prefersReducedMotion} from '@/components/motion/gsap'
import {SaltWordmark} from '@/components/SaltWordmark'
import type {FooterLegalPagesQueryResult, SettingsQueryResult} from '@/sanity.types'
import {resolveMenu} from '@/sanity/lib/utils'
import {useGSAP} from '@gsap/react'
import {stegaClean} from 'next-sanity'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useRef} from 'react'

/** Routes whose page stage is dark — footer flips to paper (inverse). */
function pageIsDark(pathname: string): boolean {
  return (
    pathname.startsWith('/projects/') ||
    pathname === '/work' ||
    pathname.startsWith('/work/')
  )
}

type FooterSocialPlatform = 'linkedin' | 'instagram' | 'x'

const SOCIAL_ORDER: FooterSocialPlatform[] = ['linkedin', 'instagram', 'x']

const SOCIAL_LABELS: Record<FooterSocialPlatform, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  x: 'X',
}

/** Fallbacks when Settings → Footer social links omit a platform. */
const SOCIAL_FALLBACKS: Record<FooterSocialPlatform, string> = {
  linkedin: 'https://www.linkedin.com/company/createdbysalt/',
  instagram: 'https://www.instagram.com/createdbysalt/',
  x: 'https://x.com/saltstudio',
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

  return (
    <svg viewBox="0 0 24 24" aria-hidden className={iconClass} focusable="false">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function isFooterSocialPlatform(value: string): value is FooterSocialPlatform {
  return value === 'linkedin' || value === 'instagram' || value === 'x'
}

type SiteFooterProps = {
  settings: SettingsQueryResult | null
  legalPages?: FooterLegalPagesQueryResult | null
}

const LEGAL_FALLBACKS = [
  {title: 'Privacy Policy', slug: 'privacy-policy', pageType: 'privacy'},
  {title: 'Terms of Service', slug: 'terms-of-service', pageType: 'terms'},
] as const

/**
 * Sticky reveal footer — top nav (appears when fully revealed) + mark +
 * social + legal. Inverse of the page: dark on light routes, paper on
 * dark project pages.
 */
export function SiteFooter({settings, legalPages}: SiteFooterProps) {
  const pathname = usePathname()
  const inverseLight = pageIsDark(pathname)
  const siteName = stegaClean(settings?.siteName ?? '') || 'Salt Studio'
  const year = new Date().getFullYear()
  const footerRef = useRef<HTMLElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const markRef = useRef<HTMLDivElement>(null)

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
  const navItems = [
    {label: 'Home', href: '/'},
    ...menuItems.filter((item) => item.href !== '/'),
  ]

  const fromCms = new Map<FooterSocialPlatform, string>()
  for (const item of settings?.footerSocial ?? []) {
    if (!item?.platform || !item?.href) continue
    const platform = stegaClean(item.platform)
    if (!isFooterSocialPlatform(platform)) continue
    fromCms.set(platform, stegaClean(item.href))
  }

  const socialLinks = SOCIAL_ORDER.map((platform) => ({
    platform,
    href: fromCms.get(platform) || SOCIAL_FALLBACKS[platform],
    label: SOCIAL_LABELS[platform],
  }))

  const fromLegal = (legalPages ?? []).filter(
    (page): page is NonNullable<typeof page> =>
      Boolean(page?.slug) && (page.pageType === 'privacy' || page.pageType === 'terms'),
  )
  const legalLinks =
    fromLegal.length > 0
      ? fromLegal.map((page) => ({
          title:
            stegaClean(page.title ?? '') ||
            (page.pageType === 'privacy' ? 'Privacy Policy' : 'Terms of Service'),
          href: `/legal/${stegaClean(page.slug ?? '')}`,
        }))
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
          {socialLinks.map((item) => (
            <li key={item.platform}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="block text-foreground transition-opacity hover:opacity-55"
              >
                <SocialIcon platform={item.platform} />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex w-full flex-nowrap items-baseline justify-center gap-x-4 overflow-x-auto px-6 pb-5 pt-2 text-center font-sans text-[12px] font-medium leading-none text-foreground/45 whitespace-nowrap md:text-[13px]">
        <span className="shrink-0">
          © {year} {siteName}. All rights reserved.
        </span>
        <nav aria-label="Legal" className="contents">
          {legalLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 text-inherit transition-opacity hover:opacity-70"
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
