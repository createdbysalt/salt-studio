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
        aria-label="Close about panel"
        tabIndex={interactive ? 0 : -1}
        onClick={close}
        className="absolute inset-0 bg-black/40 opacity-0"
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-full max-w-[min(100vw,36rem)] flex-col bg-[#f3f3f3] text-[#08090a] shadow-[-24px_0_80px_rgba(0,0,0,0.35)] will-change-transform md:max-w-[min(100vw,40rem)]"
      >
        <div className="flex items-center justify-between gap-4 px-5 py-3 md:px-7 md:py-3.5">
          <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
            <span aria-hidden className="inline-block size-1.5 rounded-full bg-[#08090a]/35" />
            About the studio
          </p>

          <button
            type="button"
            onClick={close}
            aria-label="Close about panel"
            className="group inline-flex items-center gap-2 rounded-sm bg-[#08090a] py-1.5 pl-3.5 pr-1.5 font-mono text-[11px] uppercase tracking-label text-white transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:opacity-90 active:scale-[0.98]"
          >
            <span>Close</span>
            <span
              aria-hidden
              className="rounded-[3px] bg-white/15 px-1.5 py-[5px] text-[10px] tracking-[0.08em] text-white/75 transition-colors duration-300 group-hover:bg-white/20 group-hover:text-white/90"
            >
              ESC
            </span>
          </button>
        </div>

        <div
          data-lenis-prevent
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
        >
          <div className="px-5 pb-10 pt-1 md:px-7 md:pb-14">
            <h2 id={titleId} className="sr-only">
              About Salt Studio
            </h2>

            <div
              data-about-reveal
              className="space-y-5 text-[15px] leading-[1.55] text-[#08090a]/80 md:space-y-6 md:text-[17px] md:leading-[1.55]"
            >
              {ABOUT_BIO.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>

            <div
              data-about-reveal
              className="mt-10 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[#08090a]/40 md:mt-12 md:text-[11px]"
            >
              <span aria-hidden className="inline-flex items-center gap-[3px]">
                {Array.from({length: 6}).map((_, i) => (
                  <span
                    key={i}
                    className="inline-block size-[3px] rounded-[0.5px] bg-[#08090a]/28"
                  />
                ))}
              </span>
              <span>{ABOUT_META_LINE.established}</span>
              <span className="text-right">{ABOUT_META_LINE.location}</span>
            </div>

            <div
              data-about-reveal
              className="relative mt-5 aspect-[1080/1434] w-full overflow-hidden bg-[#08090a]/08 md:mt-6"
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

            <section data-about-reveal className="mt-14 md:mt-16">
              <div className="grid gap-6 md:grid-cols-[7.5rem_minmax(0,1fr)] md:gap-10">
                <p className="inline-flex items-center gap-2 self-start font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                  <span aria-hidden className="inline-block size-1.5 rounded-full bg-[#08090a]/35" />
                  Our principles
                </p>
                <ul className="space-y-8 md:space-y-9">
                  {ABOUT_PRINCIPLES.map((principle) => (
                    <li key={principle.title}>
                      <p className="font-sans text-[15px] font-semibold leading-snug tracking-[-0.02em] text-[#08090a] md:text-base">
                        {principle.title}
                      </p>
                      <p className="mt-2 text-[14px] leading-relaxed text-[#08090a]/65 md:text-[15px]">
                        {principle.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section
              data-about-reveal
              className="mt-14 border-t border-[#08090a]/10 pt-10 md:mt-16 md:pt-12"
            >
              <div className="grid gap-6 md:grid-cols-[7.5rem_minmax(0,1fr)] md:gap-10">
                <p className="inline-flex items-center gap-2 self-start font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                  <span aria-hidden className="inline-block size-1.5 rounded-full bg-[#08090a]/35" />
                  {ABOUT_CTA.eyebrow}
                </p>
                <div>
                  <p className="text-[15px] leading-relaxed text-[#08090a]/75 md:text-base">
                    {ABOUT_CTA.body}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                      href={ABOUT_CTA.primaryHref}
                      onClick={close}
                      className="inline-flex items-center rounded-sm bg-[#08090a] px-4 py-3 font-mono text-[11px] uppercase tracking-label text-white transition-opacity hover:opacity-85"
                    >
                      {ABOUT_CTA.primaryLabel}
                    </Link>
                    <Link
                      href={ABOUT_CTA.secondaryHref}
                      onClick={close}
                      className="inline-flex items-center rounded-sm border border-[#08090a]/25 px-4 py-3 font-mono text-[11px] uppercase tracking-label text-[#08090a] transition-colors hover:border-[#08090a]/50"
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
