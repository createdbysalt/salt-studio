'use client'

import {gsap, prefersReducedMotion} from '@/components/motion/gsap'
import {LineReveal} from '@/components/motion/LineReveal'
import {ServiceDetailPanel} from '@/components/ServiceDetailPanel'
import {isVimeoUrl, vimeoBackgroundSrc} from '@/lib/vimeo'
import {useGSAP} from '@gsap/react'
import {ArrowUpRight} from 'lucide-react'
import {stegaClean} from 'next-sanity'
import {useEffect, useRef, useState} from 'react'

/** TinyWins-style elbow arrow (exact path geometry). */
function ServiceElbowArrow({className}: {className?: string}) {
  return (
    <svg viewBox="0 0 64 65.7933" fill="none" className={className} aria-hidden focusable="false">
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
  plans?: Array<{
    _key: string
    name: string
    price: string
    summary?: string | null
    features?: string[] | null
    highlight?: boolean | null
  }> | null
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
    /** One-line outcome — the “key thought” under the featured work card. */
    thought?: string | null
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
  /** Homepage type-beat bridge. Off on /capabilities (hero owns the ink swipe). */
  showBridge?: boolean
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
  showBridge = true,
}: HomeServicesShowcaseProps) {
  // First service open by default (mobile tap mode + desktop idle).
  const [active, setActive] = useState<number | null>(0)
  if (cards.length === 0) return null

  const leadText = lead?.trim() || FALLBACK_LEAD
  const headlineText = headline?.trim() || FALLBACK_HEADLINE

  return (
    <>
      {showBridge ? <TypeBeatBridge lead={leadText} headline={headlineText} /> : null}
      <WhatWeDoBand label={label} cards={cards} active={active} setActive={setActive} />
    </>
  )
}

/**
 * Pin the type beat on paper. A wide CSS dome rises on scrub until ink owns
 * the frame — wider than the old 50%-radius circle so corner wedges stay off-screen.
 */
function TypeBeatBridge({lead, headline}: {lead: string; headline: string}) {
  const triggerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const inkRef = useRef<HTMLDivElement>(null)
  const themeDarkRef = useRef(false)

  useGSAP(
    () => {
      if (!triggerRef.current || !panelRef.current || !inkRef.current) return

      const trigger = triggerRef.current
      const panel = panelRef.current
      const ink = inkRef.current

      const setCovered = (covered: boolean) => {
        if (covered === themeDarkRef.current) return
        themeDarkRef.current = covered
        if (covered) {
          panel.setAttribute('data-theme', 'dark')
          // Solid ink once the dome owns the frame — prevents a white strip
          // at the bottom while pinned and when the sticky section unpins.
          gsap.set(panel, {backgroundColor: INK})
        } else {
          panel.removeAttribute('data-theme')
          gsap.set(panel, {backgroundColor: PAPER})
        }
      }

      gsap.set(panel, {backgroundColor: PAPER})

      if (prefersReducedMotion()) {
        setCovered(true)
        gsap.set(ink, {y: '-45%'})
        return
      }

      setCovered(false)
      // Dome is 200% of panel height. y% is of the dome itself:
      //   50%  → top at 100% panel (parked below the fold)
      //  -45%  → bottom at 110% panel (full cover, no white foot)
      gsap.set(ink, {y: '50%', force3D: true})

      gsap.to(ink, {
        y: '-45%',
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setCovered(self.progress > 0.9)
          },
          onLeave: () => setCovered(true),
          onLeaveBack: () => setCovered(false),
        },
      })

      return () => {
        panel.removeAttribute('data-theme')
        themeDarkRef.current = false
        gsap.set(panel, {backgroundColor: PAPER})
      }
    },
    {scope: triggerRef},
  )

  return (
    // Mobile: shorter scrub distance so the ink beat doesn’t linger.
    <div ref={triggerRef} className="relative h-[125vh] md:h-[160vh] lg:h-[180vh]">
      <section
        ref={panelRef}
        className="sticky top-0 flex h-[100dvh] min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-3 pb-8 pt-14 text-center text-foreground sm:px-4 md:px-12 md:pb-10 md:pt-20"
        style={{backgroundColor: PAPER}}
      >
        {/* Wide dome — rises from below on scrub; oversized so arch corners stay off-screen. */}
        <div
          ref={inkRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-[-55%] top-0 z-0 will-change-transform [border-radius:100%_100%_0_0/22%_22%_0_0] md:inset-x-[-75%] md:[border-radius:100%_100%_0_0/28%_28%_0_0]"
          style={{
            height: '200%',
            backgroundColor: INK,
          }}
        />

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
            className="mx-auto mt-3 w-full max-w-[min(96vw,80rem)] font-sans text-[clamp(2.15rem,8.5vw,10rem)] font-bold uppercase leading-[0.88] tracking-[-0.04em] text-white sm:mt-5 md:mt-8"
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
  /** Below lg: tap to expand, second tap (or CTA) opens panel. lg+: hover + click. */
  const [tapMode, setTapMode] = useState(false)
  const panelOpen = panelIndex !== null
  const panelCard = panelIndex !== null ? cards[panelIndex] : null

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const sync = () => setTapMode(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Tap mode always keeps one service expanded.
  useEffect(() => {
    if (tapMode && active === null) setActive(0)
  }, [tapMode, active, setActive])

  const openPanel = (i: number) => {
    setActive(i)
    setPanelIndex(i)
  }

  /** Tap: expand first, panel on second tap. Desktop: click opens panel. */
  const onServiceActivate = (i: number) => {
    if (tapMode) {
      if (active === i) openPanel(i)
      else setActive(i)
      return
    }
    openPanel(i)
  }

  return (
    <section
      id="how-we-can-help"
      data-theme="dark"
      className="relative flex min-h-[85dvh] scroll-mt-24 flex-col justify-center overflow-hidden bg-background pt-0 pb-4 text-foreground sm:pb-5 md:min-h-[100dvh] md:pb-6"
      style={{backgroundColor: INK}}
      onMouseLeave={() => {
        if (!panelOpen && !tapMode) setActive(null)
      }}
    >
      <div
        className="relative flex min-h-[85dvh] flex-col justify-center md:min-h-[100dvh]"
        style={{backgroundColor: INK}}
      >
        {/* Full-bleed media — each layer already darkened so nothing flashes bright */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {cards.map((item, i) => (
            <ServiceBackground key={item._key} card={item} active={i === active} />
          ))}
        </div>

        <div className="page-chrome relative z-10 grid w-full items-start gap-6 py-10 md:grid-cols-[minmax(9rem,18vw)_minmax(0,1fr)] md:gap-12 md:py-16 lg:gap-16 lg:py-20">
          <p className="max-w-[14ch] text-[15px] leading-[0.95] text-foreground/70 md:text-base md:leading-[0.95]">
            {label?.trim() || 'How we can help'}
          </p>

          <ul className="flex min-w-0 flex-col" role="list">
            {cards.map((item, i) => {
              const isActive = i === active

              return (
                <li
                  key={item._key}
                  onMouseEnter={() => {
                    if (!tapMode) setActive(i)
                  }}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={isActive}
                    aria-haspopup="dialog"
                    onClick={() => onServiceActivate(i)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onServiceActivate(i)
                      }
                    }}
                    onFocus={() => {
                      if (!tapMode) setActive(i)
                    }}
                    className="group cursor-pointer outline-none focus-visible:outline-none"
                  >
                    <p
                      className={`font-sans text-[clamp(2.5rem,8.5vw,8rem)] font-bold uppercase leading-[0.95] tracking-[-0.045em] break-words transition-colors duration-200 ${
                        isActive || (!tapMode && active === null)
                          ? 'text-foreground'
                          : 'text-foreground/20'
                      }`}
                    >
                      <span className="inline-flex max-w-full items-baseline">
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
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                openPanel(i)
                              }}
                              className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-label text-foreground/70 transition-colors duration-300 group-hover:text-foreground"
                            >
                              {item.linkLabel?.trim() || 'See how it works'}
                              <ArrowUpRight
                                aria-hidden
                                size={12}
                                strokeWidth={2.5}
                                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                              />
                            </button>
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
      </div>

      <ServiceDetailPanel
        open={panelOpen}
        onClose={() => {
          setPanelIndex(null)
          // Desktop: clear hover highlight. Tap mode: keep the expanded service.
          if (!tapMode) setActive(null)
        }}
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
                plans: panelCard.plans,
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

function ServiceBackground({card, active}: {card: HomeServiceCard; active: boolean}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoUrl = card.backgroundVideoUrl ? stegaClean(card.backgroundVideoUrl).trim() : ''
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
