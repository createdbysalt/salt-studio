'use client'

import {DEFAULT_NAV, type NavChild, type NavItem} from '@/components/homeHero'
import {SiteLogo} from '@/components/SiteLogo'
import type {SettingsQueryResult} from '@/sanity.types'
import {studioUrl} from '@/sanity/lib/api'
import {resolveMenu} from '@/sanity/lib/utils'
import {ChevronDown} from 'lucide-react'
import {AnimatePresence, motion} from 'motion/react'
import {createDataAttribute} from 'next-sanity'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect, useState} from 'react'

interface NavbarProps {
  data: SettingsQueryResult
}

// TinyWins glass pills — measured on light + colored surfaces.
const pillBase =
  'flex h-10 shrink-0 items-center overflow-hidden rounded-sm backdrop-blur-[42px] sm:h-12'
const pillFillPaper =
  'bg-[rgba(0,0,0,0.06)] hover:bg-[rgba(0,0,0,0.10)] transition-colors duration-300'
const pillFillColor =
  'bg-[rgba(255,255,255,0.10)] hover:bg-[rgba(255,255,255,0.16)] transition-colors duration-300'

const BOOK_CTA_LABEL = 'Book a discovery call'
const BOOK_CTA_HREF = '/contact'

export function Navbar({data}: NavbarProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const onColor = useNavOnColorSurface(pathname)

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

  const pillFill = onColor ? pillFillColor : pillFillPaper

  const linkClass = onColor
    ? 'font-sans text-[13px] font-medium tracking-[-0.01em] text-white/85 transition-colors duration-300 hover:text-white sm:text-[14px]'
    : 'font-sans text-[13px] font-medium tracking-[-0.01em] text-foreground/70 transition-colors duration-300 hover:text-foreground sm:text-[14px]'

  const childLinkClass = onColor
    ? 'whitespace-nowrap font-sans text-[12px] font-medium tracking-[-0.01em] text-white/65 transition-colors duration-300 hover:text-white sm:text-[13px]'
    : 'whitespace-nowrap font-sans text-[12px] font-medium tracking-[-0.01em] text-foreground/50 transition-colors duration-300 hover:text-foreground sm:text-[13px]'

  const ctaClass = onColor
    ? 'pointer-events-auto inline-flex items-center justify-center whitespace-nowrap px-2.5 font-sans text-[13px] font-medium tracking-[-0.01em] text-white/90 transition-colors duration-300 hover:text-white sm:px-4 sm:text-[14px]'
    : 'pointer-events-auto inline-flex items-center justify-center whitespace-nowrap px-2.5 font-sans text-[13px] font-medium tracking-[-0.01em] text-foreground/80 transition-colors duration-300 hover:text-foreground sm:px-4 sm:text-[14px]'

  const menuTriggerClass = onColor
    ? 'pointer-events-auto inline-flex items-center justify-center px-2.5 font-sans text-[13px] font-medium tracking-[-0.01em] text-white/85 transition-colors duration-300 hover:text-white sm:px-4 sm:text-[14px] lg:hidden'
    : 'pointer-events-auto inline-flex items-center justify-center px-2.5 font-sans text-[13px] font-medium tracking-[-0.01em] text-foreground/70 transition-colors duration-300 hover:text-foreground sm:px-4 sm:text-[14px] lg:hidden'

  return (
    <>
      <header
        className="pointer-events-none fixed top-0 z-[70] w-full bg-transparent transition-opacity duration-300 [[data-service-panel-open]_&]:pointer-events-none [[data-service-panel-open]_&]:opacity-0"
        data-site-nav
        data-sanity={dataAttribute?.('menuItems')}
        data-nav-on-color={onColor ? 'true' : 'false'}
      >
        <div className="flex w-full items-start justify-between gap-2 px-3 pt-3 sm:px-4 sm:pt-4">
          <nav
            className={`pointer-events-auto min-w-0 ${pillBase} gap-3 py-2 pl-2.5 pr-3 sm:gap-7 sm:py-[9px] sm:pl-[10px] sm:pr-[18px] ${pillFill}`}
            aria-label="Main navigation"
            data-global-nav-left-pill="true"
          >
            <SiteLogo
              variant={onColor ? 'light' : 'dark'}
              className="shrink-0"
              logo={data?.logo}
              siteName={data?.siteName}
              markClassName="h-[18px] w-auto sm:h-[22px]"
            />

            <div className="hidden items-center gap-3 sm:gap-6 lg:flex">
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
                    className={linkClass}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </div>
          </nav>

          <div className="pointer-events-auto flex shrink-0 items-start gap-2">
            <Link
              href={BOOK_CTA_HREF}
              className={`${pillBase} ${pillFill} ${ctaClass}`}
            >
              {BOOK_CTA_LABEL}
            </Link>

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className={`${menuTriggerClass} ${pillBase} ${pillFill}`}
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <MenuOverlay
            items={items}
            logo={data?.logo}
            siteName={data?.siteName}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * TinyWins swaps black/6 glass on paper for white/10 glass on saturated or dark
 * surfaces. Sample under the left pill; media/images count as color surfaces.
 */
function useNavOnColorSurface(pathname: string): boolean {
  // Media-hero routes start on color even before the first sample.
  const routeHint =
    pathname === '/contact' ||
    pathname.startsWith('/contact/') ||
    pathname.startsWith('/projects/') ||
    pathname === '/work' ||
    pathname.startsWith('/work/')

  const [onColor, setOnColor] = useState(routeHint)

  useEffect(() => {
    setOnColor(routeHint)

    let frame = 0
    const sample = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        setOnColor(isColorSurfaceUnderNav() || routeHint)
      })
    }

    sample()
    window.addEventListener('scroll', sample, {passive: true})
    window.addEventListener('resize', sample)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', sample)
      window.removeEventListener('resize', sample)
    }
  }, [pathname, routeHint])

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

    if (el instanceof HTMLImageElement || el instanceof HTMLVideoElement) {
      return true
    }

    let node: HTMLElement | null = el
    while (node && node !== document.documentElement) {
      if (node.dataset.theme === 'dark' || node.dataset.navSurface === 'color') {
        return true
      }

      const style = getComputedStyle(node)
      if (style.backgroundImage && style.backgroundImage !== 'none') {
        return true
      }

      const parsed = parseCssColor(style.backgroundColor)
      if (parsed && parsed.a >= 0.45) {
        return relativeLuminance(parsed) < 0.62
      }

      node = node.parentElement
    }
  }

  return false
}

function parseCssColor(
  value: string,
): {r: number; g: number; b: number; a: number} | null {
  const match = value.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i,
  )
  if (!match) return null
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] === undefined ? 1 : Number(match[4]),
  }
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

function MenuOverlay({
  items,
  logo,
  siteName,
  onClose,
}: {
  items: NavItem[]
  logo?: {asset?: {_ref: string} | null; alt?: string | null} | null
  siteName?: string | null
  onClose: () => void
}) {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const toggleSubmenu = (label: string) => setOpenSubmenu((prev) => (prev === label ? null : label))

  // Explicit px values — this project remaps Tailwind spacing (e.g. spacing-8 = 136px),
  // so scale utilities like h-8 / px-8 blow up the overlay vs the prototype.
  const menuLinkClass =
    'font-sans text-[56px] font-light leading-[0.95] tracking-[-0.02em] text-foreground/80 transition-colors duration-200 hover:text-foreground md:text-[72px] md:tracking-[-0.03em]'

  const menuSubmenuChildClass =
    'font-sans text-[20px] font-light leading-tight tracking-[-0.01em] text-foreground/45 transition-colors duration-200 hover:text-foreground/80 md:text-[24px]'

  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      transition={{duration: 0.25}}
      className="pointer-events-auto fixed inset-0 z-[80] flex h-[100dvh] flex-col overflow-hidden bg-background text-foreground lg:hidden"
    >
      {/* Match the fixed glass chrome so Close sits where Menu was. */}
      <div className="flex shrink-0 items-start justify-between gap-2 px-3 pt-3 sm:px-4 sm:pt-4">
        <div
          className={`${pillBase} ${pillFillPaper} pointer-events-auto gap-3 px-2.5 sm:px-[10px]`}
        >
          <SiteLogo
            variant="dark"
            className="shrink-0"
            onClick={onClose}
            logo={logo}
            siteName={siteName}
            markClassName="h-[18px] w-auto sm:h-[22px]"
          />
        </div>
        <div className="flex items-start gap-2">
          <Link
            href={BOOK_CTA_HREF}
            onClick={onClose}
            className={`${pillBase} ${pillFillPaper} inline-flex items-center justify-center whitespace-nowrap px-2.5 font-sans text-[13px] font-medium tracking-[-0.01em] text-foreground/80 sm:px-4 sm:text-[14px]`}
          >
            {BOOK_CTA_LABEL}
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={`pointer-events-auto inline-flex items-center justify-center px-2.5 font-sans text-[13px] font-medium tracking-[-0.01em] text-foreground/70 transition-colors duration-300 hover:text-foreground sm:px-4 sm:text-[14px] ${pillBase} ${pillFillPaper}`}
          >
            Close
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-[20px] pb-[16px] md:px-[32px]">
        <div className="flex flex-1 items-start justify-end pt-[80px] md:pt-[112px]">
          <nav
            className="flex flex-col items-end gap-[8px] text-right md:gap-[12px]"
            aria-label="Main"
          >
            {items.map((item) => (
              <div key={`${item.href}-${item.label}`} className="flex flex-col items-end">
                {item.children?.length ? (
                  <button
                    type="button"
                    onClick={() => toggleSubmenu(item.label)}
                    aria-expanded={openSubmenu === item.label}
                    className={`inline-flex items-center gap-[8px] transition-colors duration-200 md:gap-[12px] ${
                      openSubmenu === item.label
                        ? 'text-foreground'
                        : 'text-foreground/80 hover:text-foreground'
                    }`}
                  >
                    <span className={menuLinkClass}>{item.label}</span>
                    <ChevronDown
                      aria-hidden="true"
                      strokeWidth={1.5}
                      absoluteStrokeWidth
                      className={`h-[20px] w-[20px] shrink-0 transition-transform duration-200 md:h-[32px] md:w-[32px] ${
                        openSubmenu === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                ) : (
                  <Link href={item.href} onClick={onClose} className={menuLinkClass}>
                    {item.label}
                  </Link>
                )}

                {item.children && openSubmenu === item.label && (
                  <div className="mt-[4px] mb-[8px] flex flex-col items-end gap-[8px] py-[4px] md:mt-[8px] md:gap-[10px] md:py-[6px]">
                    {item.children.map((child) => (
                      <Link
                        key={`${child.href}-${child.label}`}
                        href={child.href}
                        onClick={onClose}
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
        </div>
      </div>
    </motion.div>
  )
}
