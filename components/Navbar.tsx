'use client'

import {DEFAULT_NAV, type NavChild, type NavItem} from '@/components/homeHero'
import {ScrambleText} from '@/components/ScrambleText'
import {SiteLogo} from '@/components/SiteLogo'
import {isDarkSurface} from '@/lib/site-surface'
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

export function Navbar({data}: NavbarProps) {
  const pathname = usePathname()
  const onDark = isDarkSurface(pathname)
  const [menuOpen, setMenuOpen] = useState(false)

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

  const linkClass = onDark
    ? 'font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-white/90 transition-colors hover:text-white md:text-[13px]'
    : 'font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-black/80 transition-colors hover:text-black md:text-[13px]'

  const childLinkClass = onDark
    ? 'whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-white/65 transition-colors hover:text-white md:text-[12px]'
    : 'whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-black/55 transition-colors hover:text-black md:text-[12px]'

  const menuTriggerClass = onDark
    ? 'pointer-events-auto inline-flex items-center gap-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-white/80 transition-colors duration-200 hover:text-white lg:hidden'
    : 'pointer-events-auto inline-flex items-center gap-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-black/70 transition-colors duration-200 hover:text-black lg:hidden'

  // Contact: absolute overlay (sits on the hero, then scrolls away).
  // Project detail: transparent relative nav. Everything else: solid chrome.
  const isContact = pathname === '/contact' || pathname.startsWith('/contact/')
  const isProjectDetail = pathname.startsWith('/projects/')
  const headerClass = isContact
    ? 'pointer-events-none absolute inset-x-0 top-0 z-50 flex items-start justify-between px-5 py-5 md:px-6 md:py-6'
    : isProjectDetail
      ? 'pointer-events-none relative z-50 flex items-start justify-between bg-transparent px-5 py-5 md:px-6 md:py-6'
      : onDark
        ? 'relative z-50 flex items-start justify-between bg-[#1a1a1a] px-5 py-5 md:px-6 md:py-6'
        : 'relative z-50 flex items-start justify-between bg-background px-5 py-5 md:px-6 md:py-6'

  return (
    <>
      <header className={headerClass} data-sanity={dataAttribute?.('menuItems')}>
        <SiteLogo
          variant={onDark ? 'light' : 'dark'}
          className="pointer-events-auto"
          logo={data?.logo}
          siteName={data?.siteName}
        />

        <nav className="pointer-events-auto hidden items-center gap-6 lg:flex" aria-label="Main">
          {items.map((item) =>
            item.children?.length ? (
              <NavDropdown
                key={`${item.href}-${item.label}`}
                item={item as NavItem & {children: NavChild[]}}
                linkClass={linkClass}
                childLinkClass={childLinkClass}
                onDark={onDark}
              />
            ) : (
              <Link key={`${item.href}-${item.label}`} href={item.href} className={linkClass}>
                <ScrambleText text={item.label} />
              </Link>
            ),
          )}
        </nav>

        <button
          type="button"
          aria-label="Open menu"
          data-scramble-hover
          onClick={() => setMenuOpen(true)}
          className={menuTriggerClass}
        >
          <span aria-hidden="true" className="inline-block text-[14px] leading-none">
            <ScrambleText text="[ / ]" />
          </span>
          <ScrambleText text="Menu" />
        </button>
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

function NavDropdown({
  item,
  linkClass,
  childLinkClass,
  onDark,
}: {
  item: NavItem & {children: NavChild[]}
  linkClass: string
  childLinkClass: string
  onDark: boolean
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
          open ? (onDark ? 'text-white' : 'text-black') : ''
        }`}
      >
        <ScrambleText text={item.label} />
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.5}
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
            open
              ? onDark
                ? 'rotate-180 text-white/85'
                : 'rotate-180 text-black/70'
              : onDark
                ? 'text-white/60'
                : 'text-black/45'
          }`}
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
            <div className="flex flex-col gap-2.5">
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
    'font-sans text-[56px] font-light uppercase leading-[0.95] tracking-[-0.02em] text-black/80 transition-colors duration-200 hover:text-black md:text-[72px] md:tracking-[-0.03em]'

  const menuSubmenuChildClass =
    'font-sans text-[20px] font-light uppercase leading-tight tracking-[-0.01em] text-black/45 transition-colors duration-200 hover:text-black/80 md:text-[24px]'

  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      transition={{duration: 0.25}}
      className="pointer-events-auto fixed inset-0 z-[60] flex h-[100dvh] flex-col overflow-hidden bg-background text-foreground lg:hidden"
    >
      {/* Match the site header chrome exactly so Close sits where Menu was. */}
      <div className="flex shrink-0 items-start justify-between px-5 py-5 md:px-6 md:py-6">
        <SiteLogo
          variant="dark"
          className="shrink-0"
          onClick={onClose}
          logo={logo}
          siteName={siteName}
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          data-scramble-hover
          className="inline-flex items-center gap-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-black/70 transition-colors duration-200 hover:text-black"
        >
          <span aria-hidden="true" className="inline-block text-[14px] leading-none">
            <ScrambleText text="[ / ]" />
          </span>
          <ScrambleText text="Close" />
        </button>
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
                    data-scramble-hover
                    onClick={() => toggleSubmenu(item.label)}
                    aria-expanded={openSubmenu === item.label}
                    className={`inline-flex items-center gap-[8px] transition-colors duration-200 md:gap-[12px] ${
                      openSubmenu === item.label ? 'text-black' : 'text-black/80 hover:text-black'
                    }`}
                  >
                    <span className={menuLinkClass}>
                      <ScrambleText text={item.label} />
                    </span>
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
                    <ScrambleText text={item.label} />
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
                        <ScrambleText text={child.label} />
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
