'use client'

import {LineReveal} from '@/components/motion/LineReveal'
import {gsap, prefersReducedMotion} from '@/components/motion/gsap'
import {useGSAP} from '@gsap/react'
import {ServiceDetailPanel} from '@/components/ServiceDetailPanel'
import {isVimeoUrl, vimeoBackgroundSrc} from '@/lib/vimeo'
import {ArrowUpRight} from 'lucide-react'
import {stegaClean} from 'next-sanity'
import {useEffect, useRef, useState} from 'react'

/** TinyWins-style elbow arrow (exact path geometry). */
function ServiceElbowArrow({className}: {className?: string}) {
  return (
    <svg
      viewBox="0 0 64 65.7933"
      fill="none"
      className={className}
      aria-hidden
      focusable="false"
    >
      <path
        d="M34 13.7227L57 36.2227L34 58.7227"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="square"
      />
      <path
        d="M5 5.72266L5 36.7227H51"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="square"
      />
    </svg>
  )
}

export type HomeServiceCard = {
  _key: string
  title: string
  body: string
  headline?: string | null
  priceLine?: string | null
  timelineLine?: string | null
  timeline?: Array<{
    _key: string
    label: string
    duration: string
    detail?: string | null
  }> | null
  linkLabel?: string | null
  detailEyebrow?: string | null
  detailBody?: string | null
  sceneLine?: string | null
  detailImageUrl?: string | null
  /** Full-bleed still (also poster when a video is set). */
  backgroundImageUrl?: string | null
  /** MP4 or Vimeo — muted looping background for this service. */
  backgroundVideoUrl?: string | null
  deliverables?: Array<{_key: string; title: string; detail?: string | null}> | null
  capabilities?: Array<{_id: string; name: string; kind?: string | null}> | null
  idealFor?: string[] | null
  notAFit?: string[] | null
  stepsLabel?: string | null
  steps?: Array<{_key: string; lead?: string | null; text: string}> | null
  projects?: Array<{
    _id: string
    title: string
    slug?: string | null
    client?: string | null
    imageUrl?: string | null
  }> | null
  testimonials?: Array<{
    _id: string
    quote: string
    author: string
    role?: string | null
  }> | null
  clients?: Array<{_id: string; name: string}> | null
  proofAnchor?: string | null
  nextStep?: {
    subhead?: string | null
    buttonLabel: string
    href: string
  } | null
  fitCheck?: {label: string; href: string} | null
  routingLine?: string | null
}

type HomeServicesShowcaseProps = {
  label?: string | null
  lead?: string | null
  headline?: string | null
  cards: HomeServiceCard[]
}

const FALLBACK_LEAD = 'We bring the flavor of innovation.'
const FALLBACK_HEADLINE = "Let's build for the future."

const INK = '#08090a'
const PAPER = '#ffffff'

/**
 * Services bridge: light type beat that snaps to ink at the bottom
 * (nav-style surface flip + mix-blend headline), then a dark “How we can help”
 * expand list.
 */
export function HomeServicesShowcase({
  label = 'How we can help',
  lead,
  headline,
  cards,
}: HomeServicesShowcaseProps) {
  const [active, setActive] = useState<number | null>(null)
  if (cards.length === 0) return null

  const leadText = lead?.trim() || FALLBACK_LEAD
  const headlineText = headline?.trim() || FALLBACK_HEADLINE

  return (
    <>
      <TypeBeatBridge lead={leadText} headline={headlineText} />
      <WhatWeDoBand
        label={label}
        cards={cards}
        active={active}
        setActive={setActive}
      />
    </>
  )
}

/**
 * GSAP curve-swipe ink wipe (MorphSVG), scrubbed by scroll instead of click.
 * Paths match https://demos.gsap.com/demo/curve-swipe/ — hidden → bulge → cover.
 */
const CURVE_PATH_HIDDEN = 'M 0 100 V 100 Q 50 100 100 100 V 100 z'
const CURVE_PATH_BULGE = 'M 0 100 V 50 Q 50 0 100 50 V 100 z'
const CURVE_PATH_COVER = 'M 0 100 V 0 Q 50 0 100 0 V 100 z'

/**
 * Pin the type beat. As the section settles into view, a curved ink swipe
 * morphs up from the fold and inverts the type via mix-blend.
 */
function TypeBeatBridge({lead, headline}: {lead: string; headline: string}) {
  const triggerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const themeDarkRef = useRef(false)

  useGSAP(
    () => {
      if (!triggerRef.current || !panelRef.current || !pathRef.current) return

      const trigger = triggerRef.current
      const panel = panelRef.current
      const path = pathRef.current

      if (prefersReducedMotion()) {
        panel.setAttribute('data-theme', 'dark')
        gsap.set(panel, {backgroundColor: INK})
        gsap.set(path, {attr: {d: CURVE_PATH_COVER}})
        return
      }

      gsap.set(panel, {backgroundColor: PAPER})
      gsap.set(path, {attr: {d: CURVE_PATH_HIDDEN}})
      themeDarkRef.current = false
      panel.removeAttribute('data-theme')

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger,
          // Begin while the type beat is filling the viewport — not after a
          // full white pin + extra scroll at the bottom.
          start: 'top 30%',
          end: 'bottom bottom',
          scrub: 0.35,
          onUpdate: (self) => {
            const dark = self.progress > 0.55
            if (dark === themeDarkRef.current) return
            themeDarkRef.current = dark
            if (dark) panel.setAttribute('data-theme', 'dark')
            else panel.removeAttribute('data-theme')
          },
        },
      })

      // Same two-stage morph as the GSAP curve-swipe demo, scroll-scrubbed.
      tl.to(path, {morphSVG: CURVE_PATH_BULGE, ease: 'power2.in', duration: 0.45}, 0).to(
        path,
        {morphSVG: CURVE_PATH_COVER, ease: 'power2.out', duration: 0.55},
        0.45,
      )

      return () => {
        tl.scrollTrigger?.kill()
        tl.kill()
        panel.removeAttribute('data-theme')
      }
    },
    {scope: triggerRef},
  )

  return (
    <div ref={triggerRef} className="relative h-[160vh]">
      <section
        ref={panelRef}
        className="sticky top-0 flex h-[100dvh] min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-background px-3 pb-10 pt-28 text-center text-foreground sm:px-4 md:px-12 md:pb-14 md:pt-32"
      >
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path ref={pathRef} fill={INK} d={CURVE_PATH_HIDDEN} />
        </svg>

        <div className="relative z-10 w-full mix-blend-difference text-white">
          <LineReveal
            as="p"
            start="top 85%"
            className="mx-auto max-w-[40ch] font-sans text-[clamp(1.15rem,1.8vw,1.75rem)] font-medium leading-[1.3] tracking-[-0.03em] text-white/70 md:max-w-none"
          >
            {lead}
          </LineReveal>

          <LineReveal
            as="h2"
            start="top 88%"
            delay={0.35}
            stagger={0.16}
            duration={1.05}
            className="mx-auto mt-32 w-full max-w-[min(96vw,80rem)] font-sans text-[clamp(3.25rem,10vw,10rem)] font-bold uppercase leading-[0.88] tracking-[-0.04em] text-white md:mt-44"
          >
            {headline}
          </LineReveal>
        </div>
      </section>
    </div>
  )
}

function WhatWeDoBand({
  label,
  cards,
  active,
  setActive,
}: {
  label: string | null | undefined
  cards: HomeServiceCard[]
  active: number | null
  setActive: (i: number | null) => void
}) {
  const [panelIndex, setPanelIndex] = useState<number | null>(null)
  const panelOpen = panelIndex !== null
  const panelCard = panelIndex !== null ? cards[panelIndex] : null

  return (
    <section
      data-theme="dark"
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden bg-background py-24 text-foreground md:py-28"
      style={{backgroundColor: INK}}
      onMouseLeave={() => {
        if (!panelOpen) setActive(null)
      }}
    >
      {/* Full-bleed media — each layer already darkened so nothing flashes bright */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {cards.map((item, i) => (
          <ServiceBackground
            key={item._key}
            card={item}
            active={i === active}
          />
        ))}
      </div>

      <div className="page-chrome relative z-10 grid w-full items-start gap-6 md:grid-cols-[minmax(9rem,18vw)_minmax(0,1fr)] md:gap-12 lg:gap-16">
        <p className="max-w-[14ch] text-[15px] leading-[0.95] text-foreground/70 md:text-base md:leading-[0.95]">
          {label?.trim() || 'How we can help'}
        </p>

        <ul className="flex min-w-0 flex-col" role="list">
          {cards.map((item, i) => {
            const isActive = i === active
            const openPanel = () => {
              setActive(i)
              setPanelIndex(i)
            }

            return (
              <li key={item._key} onMouseEnter={() => setActive(i)}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isActive}
                  aria-haspopup="dialog"
                  onClick={openPanel}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      openPanel()
                    }
                  }}
                  onFocus={() => setActive(i)}
                  className="group cursor-pointer outline-none focus-visible:outline-none"
                >
                  <p
                    className={`font-sans text-[clamp(3.25rem,9.5vw,8rem)] font-bold uppercase leading-[0.95] tracking-[-0.045em] transition-colors duration-200 ${
                      isActive || active === null
                        ? 'text-foreground'
                        : 'text-foreground/20'
                    }`}
                  >
                    <span className="inline-flex items-baseline">
                      {item.title}
                      {isActive ? (
                        <span
                          aria-hidden
                          className="ml-[0.18em] inline-block h-[0.14em] w-[0.14em] -translate-y-[0.55em] rounded-full bg-accent"
                        />
                      ) : null}
                    </span>
                  </p>

                  <div
                    className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div
                        className={`flex items-start gap-3 pb-5 pt-3 md:gap-4 md:pb-7 md:pt-4 ${
                          isActive ? 'opacity-100' : 'opacity-0'
                        } transition-opacity duration-300`}
                      >
                        <ServiceElbowArrow className="mt-0.5 size-6 shrink-0 overflow-visible text-foreground md:mt-1 md:size-10" />
                        <div className="min-w-0 max-w-[36ch]">
                          <p className="text-[15px] leading-snug text-foreground/80 md:text-base">
                            {item.body}
                          </p>
                          <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-label text-foreground/70 transition-colors duration-300 group-hover:text-foreground">
                            {item.linkLabel?.trim() || 'See how it works'}
                            <ArrowUpRight
                              aria-hidden
                              size={12}
                              strokeWidth={2.5}
                              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <ServiceDetailPanel
        open={panelOpen}
        onClose={() => setPanelIndex(null)}
        content={
          panelCard
            ? {
                title: panelCard.title,
                headline: panelCard.headline,
                eyebrow: panelCard.detailEyebrow,
                body: panelCard.detailBody?.trim() || panelCard.body,
                meta: panelCard.priceLine,
                timelineLine: panelCard.timelineLine,
                timeline: panelCard.timeline,
                sceneLine: panelCard.sceneLine,
                imageUrl: panelCard.detailImageUrl,
                deliverables: panelCard.deliverables,
                capabilities: panelCard.capabilities,
                idealFor: panelCard.idealFor,
                notAFit: panelCard.notAFit,
                stepsLabel: panelCard.stepsLabel,
                steps: panelCard.steps,
                projects: panelCard.projects,
                testimonials: panelCard.testimonials,
                clients: panelCard.clients,
                proofAnchor: panelCard.proofAnchor,
                nextStep: panelCard.nextStep,
                fitCheck: panelCard.fitCheck,
                routingLine: panelCard.routingLine,
              }
            : null
        }
      />
    </section>
  )
}

function ServiceBackground({
  card,
  active,
}: {
  card: HomeServiceCard
  active: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoUrl = card.backgroundVideoUrl
    ? stegaClean(card.backgroundVideoUrl).trim()
    : ''
  const vimeoSrc = videoUrl && isVimeoUrl(videoUrl) ? vimeoBackgroundSrc(videoUrl) : null
  const mp4Src = videoUrl && !isVimeoUrl(videoUrl) ? videoUrl : null
  const hasMedia = Boolean(card.backgroundImageUrl || vimeoSrc || mp4Src)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !mp4Src) return
    if (active) {
      void video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [active, mp4Src])

  if (!hasMedia) return null

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-500 ease-out ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {(vimeoSrc || mp4Src) && card.backgroundImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.backgroundImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      {vimeoSrc ? (
        <iframe
          title=""
          src={active ? vimeoSrc : undefined}
          className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          tabIndex={-1}
        />
      ) : mp4Src ? (
        <video
          ref={videoRef}
          src={mp4Src}
          poster={card.backgroundImageUrl || undefined}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : card.backgroundImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.backgroundImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      {/* Scrim lives on the layer — fades in already dark, no bright flash */}
      <div className="absolute inset-0 bg-black/88" />
    </div>
  )
}
