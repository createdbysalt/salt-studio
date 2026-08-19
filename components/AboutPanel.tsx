'use client'

import {EASE, gsap, prefersReducedMotion} from '@/components/motion/gsap'
import {SidePanelClose} from '@/components/SidePanelClose'
import {
  ABOUT_DEFAULT_SLUG,
  ABOUT_INTEREST_HREF,
  personVideoSrc,
  ABOUT_WAITLIST_HREF,
  aboutSlugFromPath,
  personHref,
} from '@/lib/aboutPanel'
import type {PeopleQueryResult} from '@/sanity.types'
import {useGSAP} from '@gsap/react'
import {useLenis} from 'lenis/react'
import {PortableText, type PortableTextBlock} from 'next-sanity'
import Link from 'next/link'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {createPortal} from 'react-dom'

export type AboutPerson = NonNullable<PeopleQueryResult>[number]

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

export function AboutPanelProvider({
  people,
  children,
}: {
  people: PeopleQueryResult
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const pathSlug = aboutSlugFromPath(pathname)
  const [open, setOpen] = useState(Boolean(pathSlug))

  const openAbout = useCallback(() => {
    setOpen(true)
    router.push(personHref(ABOUT_DEFAULT_SLUG), {scroll: false})
  }, [router])

  const closeAbout = useCallback(() => {
    setOpen(false)
    if (pathSlug) router.replace('/', {scroll: false})
  }, [pathSlug, router])

  useEffect(() => {
    if (pathSlug) setOpen(true)
  }, [pathSlug])

  return (
    <AboutPanelContext.Provider value={{open, openAbout, closeAbout}}>
      {children}
      <Suspense fallback={null}>
        <AboutDeepLink />
      </Suspense>
      <AboutPanel
        open={open}
        onClose={closeAbout}
        people={people ?? []}
        selectedSlug={pathSlug}
      />
    </AboutPanelContext.Provider>
  )
}

/** Remap leftover `?about=1` bookmarks to the sendable /gabi URL. */
function AboutDeepLink() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('about') !== '1') return
    router.replace(personHref(ABOUT_DEFAULT_SLUG), {scroll: false})
  }, [searchParams, router])

  return null
}

type AboutPanelProps = {
  open: boolean
  onClose: () => void
  people: AboutPerson[]
  selectedSlug: string | null
}

/**
 * Paper side drawer for About — same motion grammar as ServiceDetailPanel,
 * simpler overlay, Monolog-shaped content. Toggle swaps the person without
 * closing the drawer.
 */
function AboutPanel({open, onClose, people, selectedSlug}: AboutPanelProps) {
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
  const selectedRef = useRef(selectedSlug)
  const lenis = useLenis()

  const person = useMemo(() => {
    if (!people.length) return null
    return people.find((item) => item.slug === selectedSlug) ?? people[0] ?? null
  }, [people, selectedSlug])

  const close = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    if (open) setPresent(true)
    else selectedRef.current = null
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

  // Toggle: keep the drawer mounted, reset scroll, replay the inner reveal.
  useGSAP(
    () => {
      if (!open || !present || !person) return
      if (selectedRef.current == null) {
        selectedRef.current = person.slug
        return
      }
      if (selectedRef.current === person.slug) return
      selectedRef.current = person.slug

      const panel = panelRef.current
      const scroller = scrollRef.current
      if (scroller) scroller.scrollTop = 0
      if (!panel) return

      const reduced = prefersReducedMotion()
      const revealEls = gsap.utils.toArray<HTMLElement>('[data-about-reveal]', panel)
      if (!revealEls.length) return

      gsap.killTweensOf(revealEls)
      if (reduced) {
        gsap.set(revealEls, {clearProps: 'opacity,transform'})
        return
      }

      gsap.set(revealEls, {opacity: 0, y: 18})
      gsap.to(revealEls, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.06,
        ease: EASE.outCubic,
      })
    },
    {scope: rootRef, dependencies: [person?.slug, open, present]},
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

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (open && present && personVideoSrc(person?.slug)) {
      void video.play().catch(() => {
        // Autoplay can fail before a user gesture — ignore.
      })
    } else {
      video.pause()
    }
  }, [open, present, person?.slug])

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
            {people.length > 1 ? (
              <div
                data-about-reveal
                className="flex items-center gap-4 pr-[110px] font-sans text-[12px] font-semibold tracking-[-0.01em] lg:text-[18px]"
                aria-label="People"
              >
                {people.map((item) => {
                  const href = personHref(item.slug)
                  const active = item.slug === person?.slug
                  const shortName = (item.shortName || item.name || '').trim()
                  return (
                    <Link
                      key={item._id}
                      href={href}
                      scroll={false}
                      aria-current={active ? 'page' : undefined}
                      aria-label={`About ${shortName}`}
                      className={`transition-colors duration-300 ${
                        active
                          ? 'text-[#08090a] underline decoration-[#08090a] underline-offset-[6px]'
                          : 'text-[#08090a]/45 hover:text-[#08090a]/75'
                      }`}
                    >
                      {`about ${shortName.toLowerCase()}`}
                    </Link>
                  )
                })}
              </div>
            ) : null}

            {person ? (
              <PersonPanelBody person={person} titleId={titleId} videoRef={videoRef} onNavigate={close} />
            ) : (
              <p data-about-reveal className="mt-[32px] text-[16px] font-medium text-[#08090a]/70">
                About is not published yet.
              </p>
            )}
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  )
}

function PersonPanelBody({
  person,
  titleId,
  videoRef,
  onNavigate,
}: {
  person: AboutPerson
  titleId: string
  videoRef: React.RefObject<HTMLVideoElement | null>
  onNavigate: () => void
}) {
  const principles = (person.principles ?? []).filter((item) => item?.title && item?.body)
  const studioNote = person.studioNote?.trim()
  const availability = person.availability?.trim()
  const meta = personMeta(person)
  const videoSrc = personVideoSrc(person.slug)
  const body = (person.body ?? []) as PortableTextBlock[]

  return (
    <>
      <header data-about-reveal className="mt-[32px]">
        <h2
          id={titleId}
          className="font-sans text-[28px] font-semibold leading-[1.05] tracking-[-0.03em] text-[#08090a] lg:text-[40px]"
        >
          {person.name}
        </h2>
        {person.role ? (
          <p className="mt-[8px] font-sans text-[14px] font-medium tracking-[-0.015em] text-[#08090a]/70 lg:text-[20px]">
            {person.role}
          </p>
        ) : null}
        {person.headline ? (
          <p className="person-headline mt-[10px] text-[15px] font-medium leading-[1.2] tracking-[-0.015em] text-[#08090a]/80 lg:text-[22px]">
            {person.headline}
          </p>
        ) : null}
      </header>

      {body.length > 0 ? (
        <div
          data-about-reveal
          className="person-bio mt-[28px] space-y-[16px] text-[16px] font-medium leading-[1.2] tracking-[-0.015em] text-[#08090a] lg:space-y-[22px] lg:text-[24px] lg:leading-[1.1]"
        >
          <PortableText
            value={body}
            components={{
              block: {
                normal: ({children}) => <p>{children}</p>,
              },
            }}
          />
        </div>
      ) : null}

      <div data-about-reveal className="mt-[22px]">
        <Link
          href={ABOUT_INTEREST_HREF}
          onClick={onNavigate}
          className="group inline-flex items-center gap-[0.4em] font-sans text-[13px] font-medium tracking-[-0.015em] text-[#08090a]/75 transition-colors duration-300 hover:text-[#08090a] lg:text-[20px]"
        >
          <span>Request a conversation</span>
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[5px]"
          >
            →
          </span>
        </Link>
      </div>

      {meta.length > 0 ? (
        <div
          data-about-reveal
          className="mt-[40px] flex flex-wrap items-center justify-between gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#08090a]/40 lg:text-[11px]"
        >
          {meta.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      ) : null}

      {videoSrc ? (
        <div
          data-about-reveal
          className="relative mt-[20px] aspect-[1080/1434] w-full overflow-hidden bg-[#08090a]/08"
        >
          <video
            ref={videoRef}
            key={videoSrc}
            className="h-full w-full object-cover"
            src={videoSrc}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={person.slug === 'matt' ? 'Matheus' : 'Salt Studio atmosphere'}
          />
        </div>
      ) : null}

      {principles.length > 0 ? (
        <section data-about-reveal className="mt-[56px] lg:mt-[64px]">
          <div className="grid gap-[24px] md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-[40px]">
            <p className="flex items-center gap-2 self-start font-sans text-[12px] font-semibold tracking-[-0.01em] text-[#08090a]/55 lg:text-[18px]">
              <span aria-hidden className="inline-block size-1.5 rounded-full bg-[#08090a]/35" />
              Principles
            </p>
            <ul className="space-y-[28px] lg:space-y-[32px]">
              {principles.map((principle) => (
                <li key={principle._key}>
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
      ) : null}

      {studioNote ? (
        <section data-about-reveal className="mt-[56px] lg:mt-[64px]">
          <p className="text-[15px] font-medium leading-[1.2] tracking-[-0.015em] text-[#08090a]/80 lg:text-[20px]">
            {studioNote}
          </p>
        </section>
      ) : null}

      {availability ? (
        <p
          data-about-reveal
          className="mt-[28px] font-mono text-[10px] uppercase tracking-[0.12em] text-[#08090a]/40 lg:text-[11px]"
        >
          {availability}
        </p>
      ) : null}

      <section
        data-about-reveal
        className="mt-[56px] rounded-sm bg-[#08090a] px-[24px] py-[28px] text-[#f3f3f3] lg:mt-[64px] lg:px-[28px] lg:py-[32px]"
      >
        <div className="grid gap-[24px] md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-[40px]">
          <p className="flex items-center gap-2 self-start font-sans text-[12px] font-semibold tracking-[-0.01em] text-white/55 lg:text-[18px]">
            <span aria-hidden className="inline-block size-1.5 rounded-full bg-white/40" />
            Salt software
          </p>
          <div>
            <p className="text-[15px] font-medium leading-[1.15] tracking-[-0.015em] text-white lg:text-[22px]">
              The studio runs on software we&apos;re building ourselves — Salt — so small teams
              can spend less time gathering and drafting, and more time on the work that matters.
            </p>
            <div className="mt-[24px]">
              <Link
                href={ABOUT_WAITLIST_HREF}
                onClick={onNavigate}
                className="inline-flex items-center rounded-sm border border-white/30 px-4 py-3 font-mono text-[11px] uppercase tracking-label text-white transition-colors hover:border-white/60"
              >
                Join the waitlist
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function personMeta(person: AboutPerson): string[] {
  if (person.slug === 'matt') {
    return ['IN MARKET SINCE 2018', 'SALT STUDIO EST 2025', 'PORTLAND']
  }
  if (person.slug === 'gabi') {
    return ['BUILDING SINCE 2018', 'SALT STUDIO EST 2025', 'PORTLAND']
  }
  const items = ['SALT STUDIO EST 2025']
  if (person.location) items.push(person.location.toUpperCase())
  return items
}
