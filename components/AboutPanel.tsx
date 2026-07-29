'use client'

import {EASE, gsap, prefersReducedMotion} from '@/components/motion/gsap'
import {SidePanelClose} from '@/components/SidePanelClose'
import {
  ABOUT_BIO,
  ABOUT_CTA,
  ABOUT_META_LINE,
  ABOUT_PRINCIPLES,
  ABOUT_VIDEO_SRC,
} from '@/lib/aboutPanel'
import {useGSAP} from '@gsap/react'
import {useLenis} from 'lenis/react'
import Link from 'next/link'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {createPortal} from 'react-dom'

type AboutPanelContextValue = {
  open: boolean
  openAbout: () => void
  closeAbout: () => void
}

const AboutPanelContext = createContext<AboutPanelContextValue | null>(null)

export function useAboutPanel(): AboutPanelContextValue {
  const ctx = useContext(AboutPanelContext)
  if (!ctx) {
    throw new Error('useAboutPanel must be used within AboutPanelProvider')
  }
  return ctx
}

/** Safe for links that may render outside the provider during SSR edges. */
export function useOptionalAboutPanel(): AboutPanelContextValue | null {
  return useContext(AboutPanelContext)
}

export function AboutPanelProvider({children}: {children: ReactNode}) {
  const [open, setOpen] = useState(false)

  const openAbout = useCallback(() => setOpen(true), [])
  const closeAbout = useCallback(() => setOpen(false), [])

  return (
    <AboutPanelContext.Provider value={{open, openAbout, closeAbout}}>
      {children}
      <Suspense fallback={null}>
        <AboutDeepLink openAbout={openAbout} />
      </Suspense>
      <AboutPanel open={open} onClose={closeAbout} />
    </AboutPanelContext.Provider>
  )
}

/** Opens the panel from `?about=1` (used by the /about redirect). */
function AboutDeepLink({openAbout}: {openAbout: () => void}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('about') !== '1') return
    openAbout()
    const params = new URLSearchParams(searchParams.toString())
    params.delete('about')
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, {scroll: false})
  }, [searchParams, pathname, router, openAbout])

  return null
}

type AboutPanelProps = {
  open: boolean
  onClose: () => void
}

/**
 * Paper side drawer for About — same motion grammar as ServiceDetailPanel,
 * simpler overlay, Monolog-shaped content (bio → meta → video → principles → CTA).
 */
function AboutPanel({open, onClose}: AboutPanelProps) {
  const titleId = useId()
  const [mounted, setMounted] = useState(false)
  const [present, setPresent] = useState(false)
  const [interactive, setInteractive] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const openRef = useRef(open)
  const lenis = useLenis()

  const close = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    if (open) setPresent(true)
  }, [open])

  useGSAP(
    () => {
      if (!present) return

      const backdrop = backdropRef.current
      const panel = panelRef.current
      if (!backdrop || !panel) return

      const reduced = prefersReducedMotion()
      gsap.killTweensOf([backdrop, panel])

      if (open) {
        gsap.set(panel, {xPercent: 100})
        gsap.set(backdrop, {opacity: 0})
        setInteractive(true)

        const revealEls = gsap.utils.toArray<HTMLElement>('[data-about-reveal]', panel)

        const tl = gsap.timeline()
        tl.to(
          backdrop,
          {
            opacity: 1,
            duration: reduced ? 0.01 : 0.55,
            ease: EASE.outCubic,
          },
          0,
        )
        tl.to(
          panel,
          {
            xPercent: 0,
            duration: reduced ? 0.01 : 1.05,
            ease: 'expo.out',
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
          gsap.set(revealEls, {opacity: 0, y: 18})
          tl.to(
            revealEls,
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              stagger: 0.07,
              ease: EASE.outCubic,
            },
            0.28,
          )
        }

        return () => {
          tl.kill()
        }
      }

      setInteractive(false)
      const tl = gsap.timeline({
        onComplete: () => {
          if (!openRef.current) setPresent(false)
        },
      })
      tl.to(
        panel,
        {
          xPercent: 100,
          duration: reduced ? 0.01 : 0.7,
          ease: 'power3.in',
        },
        0,
      )
      tl.to(
        backdrop,
        {
          opacity: 0,
          duration: reduced ? 0.01 : 0.45,
          ease: EASE.outCubic,
        },
        0,
      )

      return () => {
        tl.kill()
      }
    },
    {scope: rootRef, dependencies: [present, open]},
  )

  useEffect(() => {
    if (!present) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    lenis?.stop()
    document.documentElement.dataset.aboutPanelOpen = ''
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prev
      lenis?.start()
      delete document.documentElement.dataset.aboutPanelOpen
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [present, close, lenis])

  // Play/pause ambient video with the panel.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (open && present) {
      void video.play().catch(() => {
        // Autoplay can fail before a user gesture — ignore.
      })
    } else {
      video.pause()
    }
  }, [open, present])

  if (!mounted || !present) return null

  return createPortal(
    <div
      ref={rootRef}
      data-lenis-prevent
      className={`fixed inset-0 z-[180] ${interactive ? '' : 'pointer-events-none'}`}
      aria-hidden={!interactive}
    >
      <button
        ref={backdropRef}
        type="button"
        aria-label="Dismiss about panel"
        tabIndex={interactive ? 0 : -1}
        onClick={close}
        className="absolute inset-0 bg-black/70 opacity-0 backdrop-blur-[6px] supports-[backdrop-filter]:bg-black/55"
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-full max-w-[min(100vw,45rem)] flex-col bg-[#f3f3f3] text-[#08090a] shadow-[-24px_0_80px_rgba(0,0,0,0.35)] will-change-transform"
      >
        <SidePanelClose open={open && present} onClose={close} ariaLabel="Close about panel" />

        <div
          ref={scrollRef}
          data-lenis-prevent
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
        >
          <div className="px-[28px] pb-[56px] pt-[40px]">
            {/* Header eyebrow — same top band as Close; scrolls away with content. */}
            <p
              data-about-reveal
              className="flex items-center gap-2 pr-[110px] font-sans text-[12px] font-semibold tracking-[-0.01em] text-[#08090a]/55 lg:text-[18px]"
            >
              <span aria-hidden className="inline-block size-1.5 rounded-full bg-[#08090a]/35" />
              About the studio
            </p>

            <h2 id={titleId} className="sr-only">
              About Salt Studio
            </h2>

            {/* Type scale: mobile/tablet 16 → desktop 24 (2/3). Same ratio on siblings below. */}
            <div
              data-about-reveal
              className="mt-[32px] space-y-[16px] text-[16px] font-medium leading-[1.2] tracking-[-0.015em] text-[#08090a] lg:space-y-[22px] lg:text-[24px] lg:leading-[1.1]"
            >
              {ABOUT_BIO.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>

            <div data-about-reveal className="mt-[22px]">
              <a
                href={ABOUT_CTA.primaryHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="group inline-flex items-center gap-[0.4em] font-sans text-[13px] font-medium tracking-[-0.015em] text-[#08090a]/75 transition-colors duration-300 hover:text-[#08090a] lg:text-[20px]"
              >
                <span>{ABOUT_CTA.primaryLabel}</span>
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[5px]"
                >
                  →
                </span>
              </a>
            </div>

            <div
              data-about-reveal
              className="mt-[40px] flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[#08090a]/40 lg:text-[11px]"
            >
              <span>{ABOUT_META_LINE.established}</span>
              <span className="text-right">{ABOUT_META_LINE.location}</span>
            </div>

            <div
              data-about-reveal
              className="relative mt-[20px] aspect-[1080/1434] w-full overflow-hidden bg-[#08090a]/08"
            >
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                src={ABOUT_VIDEO_SRC}
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Salt Studio atmosphere"
              />
            </div>

            <section data-about-reveal className="mt-[56px] lg:mt-[64px]">
              <div className="grid gap-[24px] md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-[40px]">
                <p className="flex items-center gap-2 self-start font-sans text-[12px] font-semibold tracking-[-0.01em] text-[#08090a]/55 lg:text-[18px]">
                  <span
                    aria-hidden
                    className="inline-block size-1.5 rounded-full bg-[#08090a]/35"
                  />
                  Our principles
                </p>
                <ul className="space-y-[28px] lg:space-y-[32px]">
                  {ABOUT_PRINCIPLES.map((principle) => (
                    <li key={principle.title}>
                      <p className="font-sans text-[15px] font-medium leading-[1.15] tracking-[-0.015em] text-[#08090a] lg:text-[22px]">
                        {principle.title}
                      </p>
                      <p className="mt-[8px] text-[12px] font-medium leading-[1.25] tracking-[-0.01em] text-[#08090a]/65 lg:text-[17px]">
                        {principle.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section
              data-about-reveal
              className="mt-[56px] rounded-sm bg-[#08090a] px-[24px] py-[28px] text-[#f3f3f3] lg:mt-[64px] lg:px-[28px] lg:py-[32px]"
            >
              <div className="grid gap-[24px] md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-[40px]">
                <p className="flex items-center gap-2 self-start font-sans text-[12px] font-semibold tracking-[-0.01em] text-white/55 lg:text-[18px]">
                  <span aria-hidden className="inline-block size-1.5 rounded-full bg-white/40" />
                  {ABOUT_CTA.eyebrow}
                </p>
                <div>
                  <p className="text-[15px] font-medium leading-[1.15] tracking-[-0.015em] text-white lg:text-[22px]">
                    {ABOUT_CTA.body}
                  </p>
                  <div className="mt-[24px]">
                    <Link
                      href={ABOUT_CTA.secondaryHref}
                      onClick={close}
                      className="inline-flex items-center rounded-sm border border-white/30 px-4 py-3 font-mono text-[11px] uppercase tracking-label text-white transition-colors hover:border-white/60"
                    >
                      {ABOUT_CTA.secondaryLabel}
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
