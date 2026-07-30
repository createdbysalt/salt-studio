'use client'

import {useAboutPanel} from '@/components/AboutPanel'
import {useContactMenu} from '@/components/ContactMenu'
import {DEFAULT_NAV, type NavChild, type NavItem} from '@/components/homeHero'
import {EASE, gsap, prefersReducedMotion} from '@/components/motion/gsap'
import {SiteLogo} from '@/components/SiteLogo'
import {isAboutHref} from '@/lib/aboutPanel'
import {CONTACT_BOOK_HREF, CONTACT_WHATSAPP_HREF, isContactHref} from '@/lib/contactMenu'
import type {SettingsQueryResult} from '@/sanity.types'
import {studioUrl} from '@/sanity/lib/api'
import {resolveMenu} from '@/sanity/lib/utils'
import {useGSAP} from '@gsap/react'
import {ChevronDown} from 'lucide-react'
import {AnimatePresence, motion} from 'motion/react'
import {createDataAttribute} from 'next-sanity'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {forwardRef, useEffect, useLayoutEffect, useRef, useState, type MouseEvent} from 'react'

interface NavbarProps {
  data: SettingsQueryResult
}

// Glass pills — black/6 on paper; white/10 frost on dark/media when collapsed.
// Expanded mobile sheet on dark uses opaque ink — white/10 + blur reads as a
// milky white panel over large areas.
const pillBase = 'flex shrink-0 overflow-hidden rounded-sm backdrop-blur-[42px]'
const pillRowBase = 'flex h-10 w-full shrink-0 items-center sm:h-12'
const pillFillPaper =
  'bg-[rgba(0,0,0,0.06)] hover:bg-[rgba(0,0,0,0.10)] transition-colors duration-300'
const pillFillColor =
  'bg-[rgba(255,255,255,0.10)] hover:bg-[rgba(255,255,255,0.16)] transition-colors duration-300'
const pillFillColorMenu =
  'bg-[rgba(8,9,10,0.94)] hover:bg-[rgba(8,9,10,0.96)] transition-colors duration-300'

const BOOK_CTA_LABEL = 'Book Discovery Call'

function BookDiscoveryCta({className, onClick}: {className: string; onClick?: () => void}) {
  const rootRef = useRef<HTMLAnchorElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root || prefersReducedMotion()) return

      const dot = root.querySelector<HTMLElement>('[data-book-cta-dot]')
      const label = root.querySelector<HTMLElement>('[data-book-cta-label]')
      if (!dot || !label) return

      gsap.set(dot, {scale: 1})
      gsap.set(label, {x: 0})

      const hoverTl = gsap.timeline({paused: true})
      hoverTl
        .to(dot, {scale: 1.35, duration: 0.34, ease: EASE.outQuint}, 0)
        .to(label, {x: 2, duration: 0.38, ease: EASE.outQuint}, 0)

      const onEnter = () => hoverTl.play()
      const onLeave = () => hoverTl.reverse()
      root.addEventListener('pointerenter', onEnter)
      root.addEventListener('pointerleave', onLeave)

      return () => {
        root.removeEventListener('pointerenter', onEnter)
        root.removeEventListener('pointerleave', onLeave)
        hoverTl.kill()
      }
    },
    {scope: rootRef},
  )

  return (
    <a
      ref={rootRef}
      href={CONTACT_BOOK_HREF}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={className}
    >
      <span
        aria-hidden
        data-book-cta-dot
        className="inline-block size-[6px] shrink-0 rounded-full bg-accent will-change-transform"
      />
      <span data-book-cta-label className="inline-block will-change-transform">
        {BOOK_CTA_LABEL}
      </span>
    </a>
  )
}

export function Navbar({data}: NavbarProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPresent, setMenuPresent] = useState(false)
  const {openAbout} = useAboutPanel()
  const {open, openContact, closeContact} = useContactMenu()
  const onColor = useNavOnColorSurface(pathname, menuPresent)

  const pillRef = useRef<HTMLElement>(null)
  const menuBodyRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLButtonElement>(null)
  const bookWrapRef = useRef<HTMLDivElement>(null)
  const menuTlRef = useRef<gsap.core.Timeline | null>(null)
  const menuOpenRef = useRef(menuOpen)
  const collapsedPillRef = useRef({width: 99, height: 40})

  menuOpenRef.current = menuOpen

  const resolved = resolveMenu(data?.menuItems)
  const items: NavItem[] = resolved.length ? resolved : DEFAULT_NAV

  const dataAttribute =
    data?._id && data?._type
      ? createDataAttribute({
          baseUrl: studioUrl,
          id: data._id,
          type: data._type,
        })
      : null

  const pillFill = onColor ? (menuPresent ? pillFillColorMenu : pillFillColor) : pillFillPaper

  const linkClass = onColor
    ? 'font-sans text-[13px] font-medium tracking-[-0.01em] text-white/85 transition-colors duration-300 hover:text-white sm:text-[14px]'
    : 'font-sans text-[13px] font-medium tracking-[-0.01em] text-foreground/70 transition-colors duration-300 hover:text-foreground sm:text-[14px]'

  const childLinkClass = onColor
    ? 'whitespace-nowrap font-sans text-[12px] font-medium tracking-[-0.01em] text-white/65 transition-colors duration-300 hover:text-white sm:text-[13px]'
    : 'whitespace-nowrap font-sans text-[12px] font-medium tracking-[-0.01em] text-foreground/50 transition-colors duration-300 hover:text-foreground sm:text-[13px]'

  const ctaClass = onColor
    ? 'pointer-events-auto inline-flex h-10 items-center justify-center whitespace-nowrap px-2.5 font-sans text-[13px] font-medium tracking-[-0.01em] text-white/90 transition-colors duration-300 hover:text-white sm:h-12 sm:px-4 sm:text-[14px]'
    : 'pointer-events-auto inline-flex h-10 items-center justify-center whitespace-nowrap px-2.5 font-sans text-[13px] font-medium tracking-[-0.01em] text-foreground/80 transition-colors duration-300 hover:text-foreground sm:h-12 sm:px-4 sm:text-[14px]'

  const hamburgerClass = onColor
    ? 'ml-auto flex h-6 w-3.5 shrink-0 items-center justify-center text-white/85 transition-opacity hover:opacity-100 lg:ml-0 lg:hidden'
    : 'ml-auto flex h-6 w-3.5 shrink-0 items-center justify-center text-foreground/70 transition-opacity hover:opacity-100 lg:ml-0 lg:hidden'

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isAboutHref(href)) {
      event.preventDefault()
      openAbout()
      return
    }
    if (isContactHref(href)) {
      event.preventDefault()
      if (open) closeContact()
      else openContact()
    }
  }

  useEffect(() => {
    if (!menuOpen) return
    const pill = pillRef.current
    if (pill) {
      const rect = pill.getBoundingClientRect()
      collapsedPillRef.current = {width: rect.width, height: rect.height}
    }
    setMenuPresent(true)
  }, [menuOpen])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (mq.matches) setMenuOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!menuPresent) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuPresent])

  useEffect(() => {
    if (!menuPresent) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuPresent])

  // Expand the left glass pill itself — continuation, not a separate popup.
  useGSAP(
    () => {
      if (!menuPresent) return

      const pill = pillRef.current
      const body = menuBodyRef.current
      const backdrop = backdropRef.current
      const book = bookWrapRef.current
      if (!pill || !body || !backdrop) return

      const reduced = prefersReducedMotion()
      const {width: collapsedW, height: collapsedH} = collapsedPillRef.current
      const revealEls = gsap.utils.toArray<HTMLElement>('[data-menu-reveal]', body)
      const barTop = pill.querySelector<SVGLineElement>('[data-menu-bar="top"]')
      const barBot = pill.querySelector<SVGLineElement>('[data-menu-bar="bot"]')

      // Use the real header shell padding — this project remaps spacing-4 to 20px,
      // so a hard-coded 32px gutter left the sheet short on the right.
      const shell = pill.parentElement
      const shellStyle = shell ? getComputedStyle(shell) : null
      const gutter =
        (parseFloat(shellStyle?.paddingLeft || '0') || 0) +
        (parseFloat(shellStyle?.paddingRight || '0') || 0)
      const expandedW = Math.max(collapsedW, (shell?.clientWidth ?? window.innerWidth) - gutter)
      gsap.set(body, {height: 'auto', autoAlpha: 1, overflow: 'hidden'})
      const bodyH = body.scrollHeight
      const expandedH = collapsedH + bodyH

      gsap.set(backdrop, {opacity: 0})
      gsap.set(body, {height: 0, autoAlpha: 0})
      gsap.set(pill, {
        width: collapsedW,
        height: collapsedH,
        willChange: 'width, height',
      })
      if (book) gsap.set(book, {autoAlpha: 1})
      if (barTop)
        gsap.set(barTop, {attr: {x1: 2, y1: 5, x2: 14, y2: 5}, transformOrigin: '50% 50%'})
      if (barBot)
        gsap.set(barBot, {attr: {x1: 2, y1: 11, x2: 14, y2: 11}, transformOrigin: '50% 50%'})

      const releaseBookLayout = () => {
        if (!book) return
        book.style.position = ''
        book.style.width = ''
        book.style.overflow = ''
        book.style.pointerEvents = ''
      }

      const collapseBookLayout = () => {
        if (!book) return
        book.style.position = 'absolute'
        book.style.width = '0'
        book.style.overflow = 'hidden'
        book.style.pointerEvents = 'none'
      }

      const settleClosed = () => {
        if (menuOpenRef.current) return
        // Keep pixel size locked while the menu body unmounts, then release to auto.
        gsap.set(pill, {width: collapsedW, height: collapsedH})
        gsap.set(body, {height: 0, autoAlpha: 0})
        if (book) gsap.set(book, {autoAlpha: 1})
        releaseBookLayout()
        setMenuPresent(false)
        requestAnimationFrame(() => {
          gsap.set(pill, {clearProps: 'width,height,willChange'})
          if (book) gsap.set(book, {clearProps: 'opacity,visibility'})
        })
      }

      const tl = gsap.timeline({
        paused: true,
        onReverseComplete: settleClosed,
      })

      // Fade Book CTA and pull it out of flex flow — visibility:hidden still
      // occupies width, which made the expanded sheet tighter on the right.
      if (book) {
        collapseBookLayout()
        tl.to(
          book,
          {
            autoAlpha: 0,
            duration: reduced ? 0.01 : 0.22,
            ease: 'power2.out',
            easeReverse: 'power2.inOut',
            onReverseComplete: releaseBookLayout,
          },
          0,
        )
      }

      tl.to(
        backdrop,
        {
          opacity: 1,
          duration: reduced ? 0.01 : 0.28,
          ease: 'power2.out',
          easeReverse: true,
        },
        0,
      )

      // power3 (not back) — reverse stays smooth without overshoot snap.
      tl.to(
        pill,
        {
          width: expandedW,
          height: expandedH,
          duration: reduced ? 0.01 : 0.62,
          ease: 'power3.out',
          easeReverse: 'power3.inOut',
        },
        0,
      )

      tl.to(
        body,
        {
          height: bodyH,
          autoAlpha: 1,
          duration: reduced ? 0.01 : 0.62,
          ease: 'power3.out',
          easeReverse: 'power3.inOut',
        },
        0,
      )

      // Two-line hamburger → X
      if (barTop) {
        tl.to(
          barTop,
          {
            attr: {x1: 3, y1: 3, x2: 13, y2: 13},
            duration: reduced ? 0.01 : 0.28,
            ease: 'power3.inOut',
          },
          0,
        )
      }
      if (barBot) {
        tl.to(
          barBot,
          {
            attr: {x1: 13, y1: 3, x2: 3, y2: 13},
            duration: reduced ? 0.01 : 0.28,
            ease: 'power3.inOut',
          },
          0,
        )
      }

      if (revealEls.length) {
        tl.from(
          revealEls,
          {
            opacity: 0,
            y: 8,
            duration: reduced ? 0.01 : 0.32,
            ease: 'power2.out',
            easeReverse: true,
            stagger: 0.045,
          },
          0.2,
        )
      }

      menuTlRef.current = tl

      return () => {
        tl.kill()
        menuTlRef.current = null
        if (barTop) gsap.set(barTop, {attr: {x1: 2, y1: 5, x2: 14, y2: 5}})
        if (barBot) gsap.set(barBot, {attr: {x1: 2, y1: 11, x2: 14, y2: 11}})
      }
    },
    {dependencies: [menuPresent]},
  )

  useEffect(() => {
    if (!menuPresent) return
    const tl = menuTlRef.current
    if (!tl) return

    if (menuOpen) {
      if (prefersReducedMotion()) tl.progress(1)
      else tl.timeScale(1).play()
    } else if (prefersReducedMotion()) {
      gsap.set(pillRef.current, {
        width: collapsedPillRef.current.width,
        height: collapsedPillRef.current.height,
      })
      const book = bookWrapRef.current
      if (book) {
        gsap.set(book, {autoAlpha: 1})
        book.style.position = ''
        book.style.width = ''
        book.style.overflow = ''
        book.style.pointerEvents = ''
      }
      setMenuPresent(false)
      requestAnimationFrame(() => {
        gsap.set(pillRef.current, {clearProps: 'width,height,willChange'})
        gsap.set(bookWrapRef.current, {clearProps: 'opacity,visibility'})
      })
    } else {
      tl.timeScale(1).reverse()
    }
  }, [menuOpen, menuPresent])

  return (
    <>
      {menuPresent && (
        <button
          ref={backdropRef}
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="pointer-events-auto fixed inset-0 z-[85] bg-[rgba(14,16,15,0.28)] opacity-0 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <header
        className={`pointer-events-none fixed top-0 w-full bg-transparent transition-opacity duration-300 [[data-service-panel-open]_&]:pointer-events-none [[data-service-panel-open]_&]:opacity-0 [[data-about-panel-open]_&]:pointer-events-none [[data-about-panel-open]_&]:opacity-0 ${
          menuPresent ? 'z-[90]' : 'z-[70]'
        }`}
        data-site-nav
        data-sanity={dataAttribute?.('menuItems')}
        data-nav-on-color={onColor ? 'true' : 'false'}
      >
        <div className="flex w-full items-start justify-between gap-2 px-3 pt-3 sm:px-4 sm:pt-4">
          <nav
            ref={pillRef}
            className={`pointer-events-auto min-w-0 flex-col ${pillBase} ${pillFill} ${
              menuPresent ? '' : 'lg:flex-row lg:items-center'
            }`}
            aria-label="Main navigation"
            data-global-nav-left-pill="true"
            data-nav-pill
            data-intro-hide
          >
            <div
              className={`${pillRowBase} gap-5 px-3.5 sm:gap-6 sm:px-4 lg:gap-7 ${
                menuPresent ? 'px-3.5 sm:px-4' : 'lg:px-[10px] lg:pr-[18px]'
              }`}
            >
              <SiteLogo
                variant={onColor ? 'light' : 'dark'}
                className="shrink-0"
                logo={data?.logo}
                siteName={data?.siteName}
                markClassName="h-[18px] w-auto sm:h-[22px]"
              />

              <button
                type="button"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-controls="global-nav-mobile-drawer"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((prev) => !prev)}
                className={hamburgerClass}
                data-menu-toggle
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  className="overflow-visible"
                >
                  <line
                    data-menu-bar="top"
                    x1="2"
                    y1="5"
                    x2="14"
                    y2="5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <line
                    data-menu-bar="bot"
                    x1="2"
                    y1="11"
                    x2="14"
                    y2="11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <div className="hidden items-center gap-3 sm:gap-6 lg:flex" data-nav-links>
                {items.map((item) =>
                  item.children?.length ? (
                    <NavDropdown
                      key={`${item.href}-${item.label}`}
                      item={item as NavItem & {children: NavChild[]}}
                      linkClass={linkClass}
                      childLinkClass={childLinkClass}
                      onColor={onColor}
                      pillFill={pillFill}
                    />
                  ) : (
                    <Link
                      key={`${item.href}-${item.label}`}
                      href={item.href}
                      onClick={(event) => handleNavClick(event, item.href)}
                      className={linkClass}
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </div>
            </div>

            {menuPresent && (
              <ExpandingMenuBody
                ref={menuBodyRef}
                items={items}
                onColor={onColor}
                onClose={() => setMenuOpen(false)}
                onAboutOpen={openAbout}
                onContactOpen={openContact}
              />
            )}
          </nav>

          <div
            ref={bookWrapRef}
            className="pointer-events-auto flex shrink-0 items-start gap-2"
            data-nav-cta
            data-intro-hide
          >
            <BookDiscoveryCta className={`${pillBase} ${pillFill} ${ctaClass} gap-2`} />
          </div>
        </div>
      </header>
    </>
  )
}

/**
 * Paper → black/6 glass + dark type. Dark/media → white/10 frost + light type.
 * Sample under the left pill; freeze while the mobile menu is open so the
 * expanded sheet doesn’t re-sample itself as a light surface.
 */
function useNavOnColorSurface(pathname: string, menuPresent: boolean): boolean {
  // Media-hero routes start on color even before the first sample.
  const routeHint =
    pathname === '/contact' ||
    pathname.startsWith('/contact/') ||
    pathname.startsWith('/projects/') ||
    pathname === '/work' ||
    pathname.startsWith('/work/')

  const [onColor, setOnColor] = useState(routeHint)
  const latestRef = useRef(routeHint)

  // Layout effect so route changes drop stale frost/paper chrome before paint.
  useLayoutEffect(() => {
    // Freeze the last good sample while the sheet is open — don't re-hit-test
    // through the expanded pill / backdrop.
    if (menuPresent) {
      setOnColor(latestRef.current)
      return
    }

    // Navbar lives in the layout — reset the route hint immediately so a dark
    // page's frost chrome doesn't flash over a paper hero (legal, capabilities).
    latestRef.current = routeHint
    setOnColor(routeHint)

    let frame = 0
    const sample = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const next = isColorSurfaceUnderNav() || routeHint
        latestRef.current = next
        setOnColor(next)
      })
    }

    sample()
    // Heroes mount GSAP after the first layout pass — resample a couple frames
    // later so frost chrome doesn't stick from a pre-transform ink dome.
    const settleA = requestAnimationFrame(() => {
      sample()
      requestAnimationFrame(sample)
    })
    const settleB = window.setTimeout(sample, 120)

    window.addEventListener('scroll', sample, {passive: true})
    window.addEventListener('resize', sample)
    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(settleA)
      window.clearTimeout(settleB)
      window.removeEventListener('scroll', sample)
      window.removeEventListener('resize', sample)
    }
  }, [pathname, routeHint, menuPresent])

  return onColor
}

function isColorSurfaceUnderNav(): boolean {
  if (typeof document === 'undefined') return false

  // Sample under the left pill (matches TinyWins inset: ~16px, 16px).
  const x = 48
  const y = 40
  const stack = document.elementsFromPoint(x, y)

  for (const el of stack) {
    if (!(el instanceof HTMLElement)) continue
    if (el.closest('header')) continue
    // Session intro paints an ink cover over the page — never treat it as the
    // nav's underlying surface or the chrome locks to white-on-paper.
    if (el.closest('[data-site-intro], #salt-intro-boot')) continue

    if (el instanceof HTMLImageElement || el instanceof HTMLVideoElement) {
      return true
    }

    let node: HTMLElement | null = el
    while (node && node !== document.documentElement) {
      // Explicit paper surface (sticky legal/capabilities masthead over a dark shell).
      if (node.dataset.navSurface === 'paper') {
        return false
      }

      const style = getComputedStyle(node)

      // Ink scrub domes / decorative layers are pe:none but still appear in
      // elementsFromPoint — their dark fill must not steal the paper reading.
      if (style.pointerEvents === 'none') {
        node = node.parentElement
        continue
      }

      // Opaque paint wins over ancestor data-theme — a white hero panel sits
      // above the dark /legal shell and must keep ink chrome, not frost.
      const parsed = parseCssColor(style.backgroundColor)
      if (parsed && parsed.a >= 0.45) {
        return relativeLuminance(parsed) < 0.62
      }

      if (style.backgroundImage && style.backgroundImage !== 'none') {
        return true
      }

      if (node.dataset.theme === 'dark' || node.dataset.navSurface === 'color') {
        return true
      }

      node = node.parentElement
    }
  }

  return false
}

function parseCssColor(value: string): {r: number; g: number; b: number; a: number} | null {
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'transparent') return null

  const hex = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    const h = hex[1]
    const full =
      h.length === 3
        ? h
            .split('')
            .map((c) => c + c)
            .join('')
        : h
    return {
      r: Number.parseInt(full.slice(0, 2), 16),
      g: Number.parseInt(full.slice(2, 4), 16),
      b: Number.parseInt(full.slice(4, 6), 16),
      a: 1,
    }
  }

  // rgb(255, 255, 255) | rgba(255, 255, 255, 0.5)
  const comma = trimmed.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i,
  )
  if (comma) {
    return {
      r: Number(comma[1]),
      g: Number(comma[2]),
      b: Number(comma[3]),
      a: comma[4] === undefined ? 1 : Number(comma[4]),
    }
  }

  // rgb(255 255 255) | rgb(255 255 255 / 0.5)
  const space = trimmed.match(
    /^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i,
  )
  if (space) {
    const alphaRaw = space[4]
    let a = 1
    if (alphaRaw !== undefined) {
      a = alphaRaw.endsWith('%') ? Number(alphaRaw.slice(0, -1)) / 100 : Number(alphaRaw)
    }
    return {r: Number(space[1]), g: Number(space[2]), b: Number(space[3]), a}
  }

  return null
}

function relativeLuminance({r, g, b}: {r: number; g: number; b: number}): number {
  const toLinear = (channel: number) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function NavDropdown({
  item,
  linkClass,
  childLinkClass,
  onColor,
  pillFill,
}: {
  item: NavItem & {children: NavChild[]}
  linkClass: string
  childLinkClass: string
  onColor: boolean
  pillFill: string
}) {
  const [open, setOpen] = useState(false)
  // Hover-capable pointers only — touch taps should navigate the parent link,
  // not stick the dropdown open (common first-tap-opens-hover trap).
  const [hoverCapable, setHoverCapable] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setHoverCapable(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => {
        if (hoverCapable) setOpen(true)
      }}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => {
        if (hoverCapable) setOpen(true)
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false)
        }
      }}
    >
      <Link
        href={item.href}
        aria-expanded={open}
        aria-haspopup="true"
        className={`${linkClass} inline-flex items-center gap-1.5 ${
          open ? (onColor ? 'text-white' : 'text-foreground') : ''
        }`}
      >
        {item.label}
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.5}
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          } ${onColor ? 'text-white/60' : 'text-foreground/45'}`}
        />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{opacity: 0, y: -4}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -4}}
            transition={{duration: 0.18}}
            className="pointer-events-auto absolute left-0 top-full z-50 pt-2"
          >
            <div
              className={`flex flex-col gap-2.5 rounded-sm px-3 py-3 backdrop-blur-[42px] ${pillFill}`}
            >
              {item.children.map((child) => (
                <Link
                  key={`${child.href}-${child.label}`}
                  href={child.href}
                  className={childLinkClass}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const ExpandingMenuBody = forwardRef<
  HTMLDivElement,
  {
    items: NavItem[]
    onColor: boolean
    onClose: () => void
    onAboutOpen: () => void
    onContactOpen: () => void
  }
>(function ExpandingMenuBody({items, onColor, onClose, onAboutOpen, onContactOpen}, ref) {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const toggleSubmenu = (label: string) => setOpenSubmenu((prev) => (prev === label ? null : label))

  const handleItemClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isAboutHref(href)) {
      event.preventDefault()
      onClose()
      onAboutOpen()
      return
    }
    if (isContactHref(href)) {
      event.preventDefault()
      onClose()
      onContactOpen()
      return
    }
    onClose()
  }

  // Explicit px — project remaps Tailwind spacing (spacing-8 = 136px).
  const menuLinkClass = onColor
    ? 'font-sans text-[24px] font-medium leading-[1.1] tracking-[-0.02em] text-white transition-opacity duration-200 hover:opacity-70 sm:text-[28px]'
    : 'font-sans text-[24px] font-medium leading-[1.1] tracking-[-0.02em] text-foreground transition-opacity duration-200 hover:opacity-70 sm:text-[28px]'

  const menuSubmenuChildClass = onColor
    ? 'font-sans text-[15px] font-medium leading-tight tracking-[-0.01em] text-white/45 transition-opacity duration-200 hover:opacity-80'
    : 'font-sans text-[15px] font-medium leading-tight tracking-[-0.01em] text-foreground/45 transition-opacity duration-200 hover:opacity-80'

  return (
    <div
      ref={ref}
      id="global-nav-mobile-drawer"
      className={`lg:hidden ${onColor ? 'text-white' : 'text-foreground'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <div className="flex flex-col gap-3 px-3.5 pb-0 pt-3 sm:px-4 sm:pb-0 sm:pt-4">
        <nav className="flex flex-col items-start gap-[2px] py-2 sm:py-2.5" aria-label="Main">
          {/* Contact is covered by Book a call / WhatsApp CTAs below. */}
          {items
            .filter(
              (item) => !isContactHref(item.href) && item.label.trim().toLowerCase() !== 'contact',
            )
            .map((item) => (
              <div
                key={`${item.href}-${item.label}`}
                data-menu-reveal
                className="flex flex-col items-start"
              >
                {item.children?.length ? (
                  <button
                    type="button"
                    onClick={() => toggleSubmenu(item.label)}
                    aria-expanded={openSubmenu === item.label}
                    className="inline-flex items-center gap-[6px]"
                  >
                    <span className={menuLinkClass}>{item.label}</span>
                    <ChevronDown
                      aria-hidden="true"
                      strokeWidth={1.5}
                      absoluteStrokeWidth
                      className={`h-[14px] w-[14px] shrink-0 transition-transform duration-200 ${
                        openSubmenu === item.label ? 'rotate-180' : ''
                      } ${onColor ? 'text-white/55' : 'text-foreground/45'}`}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={(event) => handleItemClick(event, item.href)}
                    className={menuLinkClass}
                  >
                    {item.label}
                  </Link>
                )}

                {item.children && openSubmenu === item.label && (
                  <div className="mt-[2px] mb-[4px] flex flex-col items-start gap-[4px] py-[2px]">
                    {item.children.map((child) => (
                      <Link
                        key={`${child.href}-${child.label}`}
                        href={child.href}
                        onClick={(event) => handleItemClick(event, child.href)}
                        className={menuSubmenuChildClass}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </nav>

        <div
          data-menu-reveal
          className={`flex gap-2 border-t pt-3 pb-0 ${
            onColor ? 'border-white/10' : 'border-foreground/10'
          }`}
        >
          <a
            href={CONTACT_BOOK_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-sm px-3 py-2 font-sans text-[13px] font-medium tracking-[-0.01em] transition-colors ${
              onColor
                ? 'bg-white/12 text-white hover:bg-white/18'
                : 'bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.1]'
            }`}
          >
            <span aria-hidden className="size-[6px] shrink-0 rounded-full bg-accent" />
            Book a call
          </a>
          <a
            href={CONTACT_WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className={`inline-flex flex-1 items-center justify-center rounded-sm px-3 py-2 font-sans text-[13px] font-medium tracking-[-0.01em] transition-colors ${
              onColor
                ? 'bg-white/12 text-white hover:bg-white/18'
                : 'bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.1]'
            }`}
          >
            Chat via WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
})
