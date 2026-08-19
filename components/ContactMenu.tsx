'use client'

import {EASE, gsap, prefersReducedMotion} from '@/components/motion/gsap'
import {
  CONTACT_EMAIL,
  CONTACT_INTEREST_HREF,
  CONTACT_MAILTO,
  CONTACT_MENU,
} from '@/lib/contactMenu'
import {useGSAP} from '@gsap/react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {createPortal} from 'react-dom'

type ContactMenuContextValue = {
  open: boolean
  openContact: () => void
  closeContact: () => void
}

const ContactMenuContext = createContext<ContactMenuContextValue | null>(null)

export function useContactMenu(): ContactMenuContextValue {
  const ctx = useContext(ContactMenuContext)
  if (!ctx) {
    throw new Error('useContactMenu must be used within ContactMenuProvider')
  }
  return ctx
}

export function useOptionalContactMenu(): ContactMenuContextValue | null {
  return useContext(ContactMenuContext)
}

export function ContactMenuProvider({children}: {children: ReactNode}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const openContact = useCallback(() => setOpen(true), [])
  const closeContact = useCallback(() => setOpen(false), [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <ContactMenuContext.Provider value={{open, openContact, closeContact}}>
      {children}
      <ContactMenu open={open} onClose={closeContact} />
    </ContactMenuContext.Provider>
  )
}

type ContactMenuProps = {
  open: boolean
  onClose: () => void
}

type CardBox = {
  left: number
  top: number
  width: number
}

/** Same glass tokens as Navbar left pill — paper vs on-color surfaces. */
const cardFillPaper = 'bg-[rgba(0,0,0,0.06)]'
const cardFillColor = 'bg-[rgba(255,255,255,0.10)]'

/**
 * TinyWins-style contact card — opens from Contact in the nav.
 * Width/position lock to the left nav pill; glass matches nav surface.
 */
function ContactMenu({open, onClose}: ContactMenuProps) {
  const titleId = useId()
  const [mounted, setMounted] = useState(false)
  const [present, setPresent] = useState(false)
  const [onColor, setOnColor] = useState(false)
  const [box, setBox] = useState<CardBox | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLElement>(null)
  const openRef = useRef(open)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    openRef.current = open
  }, [open])

  const syncBox = useCallback(() => {
    const pill = document.querySelector('[data-global-nav-left-pill]')
    if (!(pill instanceof HTMLElement)) return
    const rect = pill.getBoundingClientRect()
    // Desktop: lock to the left nav pill (TinyWins). Mobile pill is logo-only,
    // so keep left edge but give the card a usable width.
    const width =
      rect.width < 240 ? Math.min(window.innerWidth - rect.left - 12, 22.5 * 16) : rect.width
    setBox({
      left: rect.left,
      top: rect.bottom + 8,
      width,
    })
  }, [])

  const syncSurface = useCallback(() => {
    const nav = document.querySelector('[data-site-nav]')
    setOnColor(nav?.getAttribute('data-nav-on-color') === 'true')
  }, [])

  // Measure before mounting the card so GSAP opens against the real rect once.
  useLayoutEffect(() => {
    if (!open) return
    syncBox()
    syncSurface()
    setPresent(true)
  }, [open, syncBox, syncSurface])

  useLayoutEffect(() => {
    if (!present) return

    const nav = document.querySelector('[data-site-nav]')
    const observer = nav && new MutationObserver(syncSurface)
    if (nav && observer) {
      observer.observe(nav, {attributes: true, attributeFilter: ['data-nav-on-color']})
    }

    window.addEventListener('resize', syncBox)
    return () => {
      window.removeEventListener('resize', syncBox)
      observer?.disconnect()
    }
  }, [present, syncBox, syncSurface])

  useEffect(() => {
    if (!present) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [present, onClose])

  useGSAP(
    () => {
      if (!present || !box) return

      const backdrop = backdropRef.current
      const card = cardRef.current
      if (!backdrop || !card) return

      const reduced = prefersReducedMotion()
      gsap.killTweensOf([backdrop, card])

      if (open) {
        const revealEls = gsap.utils.toArray<HTMLElement>('[data-contact-reveal]', card)

        gsap.set(card, {
          opacity: 0,
          y: -12,
          scaleY: 0.92,
          transformOrigin: '50% 0%',
        })
        gsap.set(backdrop, {opacity: 0})

        const tl = gsap.timeline({
          onComplete: () => {
            card.focus({preventScroll: true})
          },
        })

        tl.to(
          backdrop,
          {
            opacity: 1,
            duration: reduced ? 0.01 : 0.22,
            ease: EASE.outCubic,
          },
          0,
        )
        tl.to(
          card,
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: reduced ? 0.01 : 0.48,
            ease: EASE.outQuint,
          },
          0,
        )

        if (reduced) {
          gsap.set(revealEls, {clearProps: 'opacity,transform'})
          return () => {
            tl.kill()
          }
        }

        if (revealEls.length) {
          gsap.set(revealEls, {opacity: 0, y: 10})
          tl.to(
            revealEls,
            {
              opacity: 1,
              y: 0,
              duration: 0.42,
              stagger: 0.05,
              ease: EASE.outCubic,
            },
            0.12,
          )
        }

        return () => {
          tl.kill()
        }
      }

      const tl = gsap.timeline({
        onComplete: () => {
          if (!openRef.current) setPresent(false)
        },
      })
      tl.to(
        card,
        {
          opacity: 0,
          y: -8,
          scaleY: 0.96,
          duration: reduced ? 0.01 : 0.28,
          ease: 'power3.in',
          transformOrigin: '50% 0%',
        },
        0,
      )
      tl.to(
        backdrop,
        {
          opacity: 0,
          duration: reduced ? 0.01 : 0.2,
          ease: EASE.outCubic,
        },
        0,
      )

      return () => {
        tl.kill()
      }
    },
    {scope: rootRef, dependencies: [open, present, Boolean(box)]},
  )

  // Hover grammar on the two CTAs — arrow + label nudge (SidePanelClose pattern).
  useGSAP(
    () => {
      if (!present || !open || prefersReducedMotion()) return

      const card = cardRef.current
      if (!card) return

      const ctas = gsap.utils.toArray<HTMLElement>('[data-contact-cta]', card)
      const cleanups: Array<() => void> = []

      for (const cta of ctas) {
        const label = cta.querySelector<HTMLElement>('[data-contact-cta-label]')
        const arrow = cta.querySelector<HTMLElement>('[data-contact-cta-arrow]')
        if (!label || !arrow) continue

        gsap.set(arrow, {x: 0})
        gsap.set(label, {x: 0})

        const hoverTl = gsap.timeline({paused: true})
        hoverTl
          .to(arrow, {x: 5, duration: 0.38, ease: EASE.outQuint}, 0)
          .to(label, {x: 3, duration: 0.38, ease: EASE.outQuint}, 0)

        const onEnter = () => hoverTl.play()
        const onLeave = () => hoverTl.reverse()
        cta.addEventListener('pointerenter', onEnter)
        cta.addEventListener('pointerleave', onLeave)
        cleanups.push(() => {
          cta.removeEventListener('pointerenter', onEnter)
          cta.removeEventListener('pointerleave', onLeave)
          hoverTl.kill()
        })
      }

      return () => {
        for (const cleanup of cleanups) cleanup()
      }
    },
    {scope: rootRef, dependencies: [open, present]},
  )

  if (!mounted || !present) return null

  const cardStyle: CSSProperties | undefined = box
    ? {
        left: box.left,
        top: box.top,
        width: box.width,
      }
    : undefined

  const muted = onColor ? 'text-white/45' : 'text-foreground/40'
  const soft = onColor ? 'text-white/65' : 'text-foreground/55'
  const ink = onColor ? 'text-white' : 'text-foreground'
  const rule = onColor ? 'bg-white/12' : 'bg-foreground/10'
  const arrow = onColor ? 'text-white/45' : 'text-foreground/40'

  return createPortal(
    <div ref={rootRef} className="pointer-events-none fixed inset-0 z-[65]">
      <button
        ref={backdropRef}
        type="button"
        aria-label="Close contact menu"
        onClick={onClose}
        className="pointer-events-auto absolute inset-0 cursor-default bg-transparent opacity-0"
      />

      <section
        ref={cardRef}
        id="global-nav-contact-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={cardStyle}
        className={`pointer-events-auto absolute max-h-[calc(100dvh-5.5rem)] origin-top overflow-y-auto rounded-sm backdrop-blur-[42px] outline-none will-change-transform ${
          onColor ? cardFillColor : cardFillPaper
        } ${box ? '' : 'invisible left-3 top-[4.5rem] w-[min(calc(100vw-1.5rem),22rem)] sm:left-4'}`}
      >
        <div className="flex flex-col gap-4 px-4 py-4 sm:gap-5 sm:px-5 sm:py-5">
          <header
            data-contact-reveal
            className="grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start sm:gap-6"
          >
            <p
              id={titleId}
              className={`font-sans text-[13px] font-medium tracking-[-0.01em] sm:text-[14px] ${soft}`}
            >
              {CONTACT_MENU.eyebrow}
            </p>
            <div className="flex min-w-0 flex-col gap-0">
              <p
                className={`font-sans text-[14px] font-medium leading-none tracking-[-0.01em] sm:text-[15px] ${soft}`}
              >
                {CONTACT_MENU.line}
              </p>
              <a
                href={CONTACT_MAILTO}
                className={`-mt-[2px] block truncate font-sans text-[18px] font-semibold leading-none tracking-[-0.02em] transition-opacity hover:opacity-70 sm:text-[20px] ${ink}`}
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </header>

          <div data-contact-reveal className={`h-px ${rule}`} />

          <Link
            data-contact-reveal
            data-contact-cta
            href={CONTACT_INTEREST_HREF}
            onClick={onClose}
            className="flex items-center justify-between gap-4"
          >
            <span data-contact-cta-label>
              <span
                className={`block font-sans text-[15px] font-medium tracking-[-0.015em] sm:text-[16px] ${ink}`}
              >
                {CONTACT_MENU.bookLabel}
              </span>
              <span
                className={`mt-0.5 block font-sans text-[12px] font-medium tracking-[-0.01em] ${muted}`}
              >
                {CONTACT_MENU.bookHint}
              </span>
            </span>
            <span aria-hidden data-contact-cta-arrow className={`inline-block ${arrow}`}>
              →
            </span>
          </Link>
        </div>
      </section>
    </div>,
    document.body,
  )
}
