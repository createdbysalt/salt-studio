'use client'

import {useGSAP} from '@gsap/react'
import {useLenis} from 'lenis/react'
import Link from 'next/link'
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
import {usePathname, useRouter, useSearchParams} from 'next/navigation'

import {EASE, gsap, prefersReducedMotion} from '@/components/motion/gsap'
import {
  ABOUT_BIO,
  ABOUT_CTA,
  ABOUT_META_LINE,
  ABOUT_PRINCIPLES,
  ABOUT_VIDEO_SRC,
} from '@/lib/aboutPanel'

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
  const closeWrapRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const closeMagnetRef = useRef<HTMLSpanElement>(null)
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
      const closeWrap = closeWrapRef.current
      const closeBtn = closeBtnRef.current
      const magnet = closeMagnetRef.current
      if (!backdrop || !panel) return

      const reduced = prefersReducedMotion()
      gsap.killTweensOf([backdrop, panel, closeWrap, closeBtn, magnet])

      if (open) {
        gsap.set(panel, {xPercent: 100})
        gsap.set(backdrop, {opacity: 0})
        if (closeWrap) gsap.set(closeWrap, {opacity: 0, y: -14, scale: 0.88})
        setInteractive(true)

        const revealEls = gsap.utils.toArray<HTMLElement>('[data-about-reveal]', panel)
        const labelOut = closeBtn?.querySelector<HTMLElement>('[data-close-label="out"]')
        const labelIn = closeBtn?.querySelector<HTMLElement>('[data-close-label="in"]')
        const escOut = closeBtn?.querySelector<HTMLElement>('[data-close-esc="out"]')
        const escIn = closeBtn?.querySelector<HTMLElement>('[data-close-esc="in"]')
        const escBg = closeBtn?.querySelector<HTMLElement>('[data-close-esc-bg]')

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

        if (closeWrap) {
          tl.to(
            closeWrap,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: reduced ? 0.01 : 0.7,
              ease: 'expo.out',
            },
            reduced ? 0 : 0.35,
          )
        }

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

        // Hover: dual-layer text swap + ESC flip.
        const cleanups: Array<() => void> = []
        if (closeBtn && labelOut && labelIn && escOut && escIn) {
          gsap.set(labelIn, {yPercent: 110})
          gsap.set(escIn, {yPercent: 110})

          const hoverTl = gsap.timeline({paused: true})
          hoverTl
            .to(labelOut, {yPercent: -110, duration: 0.38, ease: EASE.outQuint}, 0)
            .to(labelIn, {yPercent: 0, duration: 0.38, ease: EASE.outQuint}, 0)
            .to(escOut, {yPercent: -110, duration: 0.34, ease: EASE.outQuint}, 0.02)
            .to(escIn, {yPercent: 0, duration: 0.34, ease: EASE.outQuint}, 0.02)
          if (escBg) {
            hoverTl.to(
              escBg,
              {backgroundColor: 'rgba(255,255,255,0.28)', duration: 0.3, ease: EASE.outCubic},
              0,
            )
          }

          const onEnter = () => hoverTl.play()
          const onLeave = () => hoverTl.reverse()
          closeBtn.addEventListener('pointerenter', onEnter)
          closeBtn.addEventListener('pointerleave', onLeave)
          cleanups.push(() => {
            closeBtn.removeEventListener('pointerenter', onEnter)
            closeBtn.removeEventListener('pointerleave', onLeave)
            hoverTl.kill()
          })
        }

        // Magnetic pull toward the cursor — the “cool” bit.
        if (closeBtn && magnet) {
          const xTo = gsap.quickTo(magnet, 'x', {duration: 0.45, ease: EASE.outQuint})
          const yTo = gsap.quickTo(magnet, 'y', {duration: 0.45, ease: EASE.outQuint})
          const maxPull = 10

          const onMove = (event: PointerEvent) => {
            const rect = closeBtn.getBoundingClientRect()
            const cx = rect.left + rect.width / 2
            const cy = rect.top + rect.height / 2
            const dx = (event.clientX - cx) / (rect.width / 2)
            const dy = (event.clientY - cy) / (rect.height / 2)
            xTo(gsap.utils.clamp(-1, 1, dx) * maxPull)
            yTo(gsap.utils.clamp(-1, 1, dy) * maxPull)
          }
          const onLeaveMagnet = () => {
            xTo(0)
            yTo(0)
          }
          const onDown = () => {
            gsap.to(magnet, {scale: 0.94, duration: 0.16, ease: EASE.outCubic})
          }
          const onUp = () => {
            gsap.to(magnet, {scale: 1, duration: 0.35, ease: 'expo.out'})
          }

          magnet.addEventListener('pointermove', onMove)
          magnet.addEventListener('pointerleave', onLeaveMagnet)
          magnet.addEventListener('pointerdown', onDown)
          magnet.addEventListener('pointerup', onUp)
          magnet.addEventListener('pointercancel', onUp)
          cleanups.push(() => {
            magnet.removeEventListener('pointermove', onMove)
            magnet.removeEventListener('pointerleave', onLeaveMagnet)
            magnet.removeEventListener('pointerdown', onDown)
            magnet.removeEventListener('pointerup', onUp)
            magnet.removeEventListener('pointercancel', onUp)
          })
        }

        return () => {
          tl.kill()
          cleanups.forEach((fn) => fn())
        }
      }

      setInteractive(false)
      const tl = gsap.timeline({
        onComplete: () => {
          if (!openRef.current) setPresent(false)
        },
      })
      if (closeWrap) {
        tl.to(
          closeWrap,
          {
            opacity: 0,
            y: -10,
            scale: 0.94,
            duration: reduced ? 0.01 : 0.35,
            ease: 'power2.in',
          },
          0,
        )
      }
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
        {/* Close is pinned to the panel (not the scroll) so it never leaves — and never covers the eyebrow. */}
        <div
          ref={closeWrapRef}
          className="pointer-events-none absolute top-[28px] right-[28px] z-20"
        >
          <span
            ref={closeMagnetRef}
            className="pointer-events-auto relative inline-flex will-change-transform"
          >
            <button
              ref={closeBtnRef}
              type="button"
              onClick={close}
              aria-label="Close about panel"
              className="relative isolate inline-flex items-center gap-2 overflow-hidden rounded-sm bg-[#08090a] py-1.5 pl-3.5 pr-1.5 font-mono text-[11px] uppercase tracking-label text-white"
            >
              <span className="relative inline-block h-[1em] overflow-hidden leading-none">
                <span data-close-label="out" className="block">
                  Close
                </span>
                <span
                  data-close-label="in"
                  aria-hidden
                  className="absolute inset-x-0 top-0 block"
                >
                  Close
                </span>
              </span>
              <span
                data-close-esc-bg
                className="relative inline-block h-[1.65em] min-w-[2.1rem] overflow-hidden rounded-[3px] bg-white/15 px-1.5 text-center text-[10px] leading-[1.65em] tracking-[0.08em] text-white/75"
              >
                <span data-close-esc="out" className="block">
                  ESC
                </span>
                <span
                  data-close-esc="in"
                  aria-hidden
                  className="absolute inset-x-0 top-0 block"
                >
                  ESC
                </span>
              </span>
            </button>
          </span>
        </div>

        <div
          ref={scrollRef}
          data-lenis-prevent
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
        >
          <div className="px-[28px] pb-[56px] pt-[40px]">
            {/* Header eyebrow — same top band as Close; scrolls away with content. */}
            <p
              data-about-reveal
              className="flex items-center gap-2 pr-[110px] font-sans text-[18px] font-semibold tracking-[-0.01em] text-[#08090a]/55"
            >
              <span aria-hidden className="inline-block size-1.5 rounded-full bg-[#08090a]/35" />
              About the studio
            </p>

            <h2 id={titleId} className="sr-only">
              About Salt Studio
            </h2>

            {/* Monolog-measured: 24px / 500 / -0.015em / 1.1 leading, ~32px under eyebrow */}
            <div
              data-about-reveal
              className="mt-[32px] space-y-[22px] text-[22px] font-medium leading-[1.1] tracking-[-0.015em] text-[#08090a] md:text-[24px]"
            >
              {ABOUT_BIO.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>

            <div data-about-reveal className="mt-[22px]">
              <Link
                href={ABOUT_CTA.primaryHref}
                onClick={close}
                className="group inline-flex items-center gap-[0.4em] font-sans text-[18px] font-medium tracking-[-0.015em] text-[#08090a]/75 transition-colors duration-300 hover:text-[#08090a] md:text-[20px]"
              >
                <span>{ABOUT_CTA.primaryLabel}</span>
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[5px]"
                >
                  →
                </span>
              </Link>
            </div>

            <div
              data-about-reveal
              className="mt-[40px] flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[#08090a]/40 md:text-[11px]"
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

            <section data-about-reveal className="mt-[56px] md:mt-[64px]">
              <div className="grid gap-[24px] md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-[40px]">
                <p className="flex items-center gap-2 self-start font-sans text-[18px] font-semibold tracking-[-0.01em] text-[#08090a]/55">
                  <span aria-hidden className="inline-block size-1.5 rounded-full bg-[#08090a]/35" />
                  Our principles
                </p>
                <ul className="space-y-[28px] md:space-y-[32px]">
                  {ABOUT_PRINCIPLES.map((principle) => (
                    <li key={principle.title}>
                      <p className="font-sans text-[20px] font-medium leading-[1.15] tracking-[-0.015em] text-[#08090a] md:text-[22px]">
                        {principle.title}
                      </p>
                      <p className="mt-[8px] text-[16px] font-medium leading-[1.25] tracking-[-0.01em] text-[#08090a]/65 md:text-[17px]">
                        {principle.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section
              data-about-reveal
              className="mt-[56px] rounded-sm bg-[#08090a] px-[24px] py-[28px] text-[#f3f3f3] md:mt-[64px] md:px-[28px] md:py-[32px]"
            >
              <div className="grid gap-[24px] md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-[40px]">
                <p className="flex items-center gap-2 self-start font-sans text-[18px] font-semibold tracking-[-0.01em] text-white/55">
                  <span aria-hidden className="inline-block size-1.5 rounded-full bg-white/40" />
                  {ABOUT_CTA.eyebrow}
                </p>
                <div>
                  <p className="text-[20px] font-medium leading-[1.15] tracking-[-0.015em] text-white md:text-[22px]">
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
