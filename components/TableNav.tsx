'use client'

import {SiteLogo} from '@/components/SiteLogo'
import {CONTACT_WHATSAPP_HREF} from '@/lib/contactMenu'
import {useEffect, useLayoutEffect, useState} from 'react'

const pillBase = 'flex overflow-hidden rounded-sm backdrop-blur-[42px]'
const pillRowBase = 'flex h-12 w-full shrink-0 items-center sm:h-14 lg:h-12'
const pillFillPaper =
  'bg-[rgba(0,0,0,0.06)] hover:bg-[rgba(0,0,0,0.10)] transition-colors duration-300'
const pillFillColor =
  'bg-[rgba(255,255,255,0.10)] hover:bg-[rgba(255,255,255,0.16)] transition-colors duration-300'

export type TableNavSection = 'overview' | 'checklist' | 'forms'

const LINKS: {href: `#${TableNavSection}`; label: string; id: TableNavSection}[] = [
  {href: '#overview', label: 'Overview', id: 'overview'},
  {href: '#checklist', label: 'Checklist', id: 'checklist'},
  {href: '#forms', label: 'Forms', id: 'forms'},
]

export function TableNav({
  homeHref,
  showLinks = true,
  onDark = false,
  sections = ['overview', 'checklist', 'forms'],
}: {
  homeHref: string
  showLinks?: boolean
  onDark?: boolean
  sections?: TableNavSection[]
}) {
  const links = LINKS.filter((item) => sections.includes(item.id))
  const showNavLinks = showLinks && links.length > 0
  const [menuOpen, setMenuOpen] = useState(false)
  const [onColor, setOnColor] = useState(showLinks || onDark)

  useLayoutEffect(() => {
    let frame = 0
    const sample = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        setOnColor(isColorSurfaceUnderTableNav())
      })
    }

    sample()
    const settle = window.setTimeout(sample, 120)

    // Capture: hash jumps and nested scrollports do not always bubble to window.
    document.addEventListener('scroll', sample, {passive: true, capture: true})
    window.addEventListener('resize', sample)
    window.addEventListener('hashchange', sample)

    const darks = document.querySelectorAll('[data-theme="dark"]')
    const io = new IntersectionObserver(sample, {
      root: null,
      rootMargin: '-8px 0px -70% 0px',
      threshold: [0, 0.01, 1],
    })
    darks.forEach((el) => io.observe(el))

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(settle)
      document.removeEventListener('scroll', sample, {capture: true})
      window.removeEventListener('resize', sample)
      window.removeEventListener('hashchange', sample)
      io.disconnect()
    }
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (mq.matches) setMenuOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const pillFill = onColor ? pillFillColor : pillFillPaper
  const linkClass = onColor
    ? 'font-sans text-[14px] font-medium tracking-[-0.01em] text-white/85 transition-colors duration-300 hover:text-white sm:text-[15px] lg:text-[14px]'
    : 'font-sans text-[14px] font-medium tracking-[-0.01em] text-foreground/70 transition-colors duration-300 hover:text-foreground sm:text-[15px] lg:text-[14px]'
  const ctaClass = onColor
    ? 'pointer-events-auto inline-flex h-12 max-w-full items-center justify-center whitespace-nowrap px-3 font-sans text-[13px] font-medium tracking-[-0.01em] text-white/90 transition-colors duration-300 hover:text-white sm:h-14 sm:px-5 sm:text-[15px] lg:h-12 lg:px-4 lg:text-[14px]'
    : 'pointer-events-auto inline-flex h-12 max-w-full items-center justify-center whitespace-nowrap px-3 font-sans text-[13px] font-medium tracking-[-0.01em] text-foreground/80 transition-colors duration-300 hover:text-foreground sm:h-14 sm:px-5 sm:text-[15px] lg:h-12 lg:px-4 lg:text-[14px]'
  const hamburgerClass = onColor
    ? 'ml-auto flex h-8 w-5 shrink-0 items-center justify-center text-white/85 transition-opacity hover:opacity-100 lg:ml-0 lg:hidden'
    : 'ml-auto flex h-8 w-5 shrink-0 items-center justify-center text-foreground/70 transition-opacity hover:opacity-100 lg:ml-0 lg:hidden'

  return (
    <header data-table-nav className="pointer-events-none fixed top-0 z-[70] w-full bg-transparent">
      <div className="flex w-full min-w-0 items-start justify-between gap-2 px-3 pt-3.5 sm:gap-3 sm:px-5 sm:pt-5 lg:gap-2 lg:px-4 lg:pt-4">
        <nav
          className={`pointer-events-auto min-w-0 shrink-0 flex-col ${pillBase} ${pillFill} ${
            menuOpen ? '' : 'lg:flex-row lg:items-center'
          }`}
          aria-label="Table"
        >
          <div
            className={`${pillRowBase} gap-3 px-3 sm:gap-5 sm:px-4 lg:gap-7 ${
              menuOpen ? 'px-3 sm:px-4' : 'lg:px-[10px] lg:pr-[18px]'
            }`}
          >
            <SiteLogo
              href={homeHref}
              variant={onColor ? 'light' : 'dark'}
              className="shrink-0"
              markClassName="h-[22px] w-auto sm:h-[26px] lg:h-[22px]"
            />

            {showNavLinks ? (
              <>
                <button
                  type="button"
                  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                  className={hamburgerClass}
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <line
                      x1="1"
                      y1={menuOpen ? 3 : 5}
                      x2="15"
                      y2={menuOpen ? 13 : 5}
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                    <line
                      x1="1"
                      y1={menuOpen ? 13 : 11}
                      x2="15"
                      y2={menuOpen ? 3 : 11}
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                <div className="hidden items-center gap-3 sm:gap-6 lg:flex">
                  {links.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className={linkClass}
                      onClick={() => {
                        requestAnimationFrame(() => {
                          setOnColor(isColorSurfaceUnderTableNav())
                          requestAnimationFrame(() => setOnColor(isColorSurfaceUnderTableNav()))
                        })
                      }}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          {showNavLinks && menuOpen ? (
            <div className="flex flex-col gap-3 px-4 pb-4 pt-2 lg:hidden">
              {links.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setMenuOpen(false)
                    requestAnimationFrame(() => {
                      setOnColor(isColorSurfaceUnderTableNav())
                      requestAnimationFrame(() => setOnColor(isColorSurfaceUnderTableNav()))
                    })
                  }}
                  className={`${linkClass} text-[22px]`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          ) : null}
        </nav>

        <div className="pointer-events-auto flex min-w-0 max-w-[min(100%,16.5rem)] shrink items-start sm:max-w-none">
          <a
            href={CONTACT_WHATSAPP_HREF}
            target="_blank"
            rel="noreferrer"
            aria-label="Contact Salt on WhatsApp"
            className={`${pillBase} ${pillFill} ${ctaClass} min-w-0 gap-1.5 sm:gap-2`}
          >
            <span
              aria-hidden
              className="inline-block size-[7px] shrink-0 rounded-full bg-accent lg:size-[6px]"
            />
            <span>Contact</span>
          </a>
        </div>
      </div>
    </header>
  )
}

/**
 * Paper → black/6 glass + ink type. Dark band → white/10 frost + light type.
 * Skip only the table nav — the hero is also a <header data-theme="dark">.
 */
function isColorSurfaceUnderTableNav(): boolean {
  if (typeof document === 'undefined') return false

  // Hash targets use scroll-margin, so the nav can sit on a paper gutter while
  // the dark band already fills the page. Sample a few points, not only y=40.
  if ([40, 100, 168].some((y) => isColorSurfaceAt(48, y))) return true

  return Array.from(document.querySelectorAll<HTMLElement>('[data-theme="dark"]')).some((el) => {
    if (el.closest('[data-table-nav]')) return false
    const rect = el.getBoundingClientRect()
    return rect.top < 220 && rect.bottom > 64
  })
}

function isColorSurfaceAt(x: number, y: number): boolean {
  const stack = document.elementsFromPoint(x, y)
  for (const el of stack) {
    if (!(el instanceof HTMLElement)) continue
    if (el.closest('[data-table-nav]')) continue

    let node: HTMLElement | null = el
    while (node && node !== document.documentElement) {
      if (node.dataset.theme === 'dark' || node.dataset.navSurface === 'color') {
        return true
      }

      const style = getComputedStyle(node)
      const parsed = parseCssColor(style.backgroundColor)
      if (parsed && parsed.a >= 0.45) {
        return relativeLuminance(parsed) < 0.62
      }

      node = node.parentElement
    }
  }
  return false
}

function parseCssColor(value: string): {r: number; g: number; b: number; a: number} | null {
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'transparent') return null

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
