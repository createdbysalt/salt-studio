'use client'

import {HomeProjectSlider} from '@/components/HomeProjectSlider'
import {gsap, prefersReducedMotion, ScrollTrigger} from '@/components/motion/gsap'
import {WordSwap, type SwapFace} from '@/components/motion/WordSwap'
import type {WorkProjectCard} from '@/components/ProjectGrid'
import {useGSAP} from '@gsap/react'
import {useEffect, useMemo, useRef, useState} from 'react'

type HomeHeroStageProps = {
  projects: WorkProjectCard[]
  primary: SwapFace
  secondary: SwapFace
}

/**
 * Cap how many projects enter the hero strip. Past this, cards would shrink
 * below a readable size when fitting edge-to-edge — the rest stay on /work.
 */
const MAX_HERO_PROJECTS = 8
/** Slight overflow so the strip reads as bleeding off both edges. */
const EDGE_BLEED = 1.06
const MAX_END_SCALE = 1.2
/** Floor so cards stay readable even at the cap (≈8 across). */
const MIN_END_SCALE = 0.42

/**
 * TinyWins-shaped hero: paper band with word-mask swap type up top, full-height
 * project strip below. Scroll scrubs the track as the stage leaves — no pin.
 */
export function HomeHeroStage({projects, primary, secondary}: HomeHeroStageProps) {
  const triggerRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [autoplay, setAutoplay] = useState(true)
  const [coarsePointer, setCoarsePointer] = useState(false)
  const scrubPastRef = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    const sync = () => setCoarsePointer(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const roster = useMemo(() => {
    const usable = projects.filter(
      (p) => p._id && (p.coverImage?.asset?._ref || p.videoUrl),
    )
    return usable.slice(0, MAX_HERO_PROJECTS)
  }, [projects])

  const setLen = roster.length

  useGSAP(
    () => {
      if (prefersReducedMotion() || !triggerRef.current || !stageRef.current) return
      if (setLen < 1) return

      const triggerEl = triggerRef.current
      const stageEl = stageRef.current
      const track = stageEl.querySelector<HTMLElement>('[data-hero-track]')
      if (!track) return

      const cards = gsap.utils.toArray<HTMLElement>('[data-slider-card]', track)
      if (cards.length < setLen * 2) return

      let frozenStartX: number | null = null

      const measure = () => {
        const first = cards[0]
        const second = cards[1] ?? first
        const step = second.offsetLeft - first.offsetLeft || first.offsetWidth
        const setW = step * setLen
        const mid = cards[setLen]
        const setCenter = mid.offsetLeft + setW / 2
        const fitX = window.innerWidth / 2 - setCenter
        const raw = (window.innerWidth * EDGE_BLEED) / Math.max(setW, 1)
        const endScale = gsap.utils.clamp(MIN_END_SCALE, MAX_END_SCALE, raw)
        return {fitX, endScale, setCenter}
      }

      const st = ScrollTrigger.create({
        trigger: triggerEl,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.35,
        invalidateOnRefresh: true,
        onRefresh: () => {
          frozenStartX = null
        },
        onUpdate: (self) => {
          const past = self.progress > 0.18
          if (past !== scrubPastRef.current) {
            scrubPastRef.current = past
            setAutoplay(!past)
          }

          const {fitX, endScale, setCenter} = measure()
          const t = self.progress

          if (t <= 0.001) {
            frozenStartX = null
            gsap.set(track, {scale: 1, transformOrigin: '50% 100%'})
            return
          }

          if (frozenStartX === null) {
            frozenStartX = Number(gsap.getProperty(track, 'x')) || 0
          }

          gsap.killTweensOf(track)
          gsap.set(track, {
            x: gsap.utils.interpolate(frozenStartX, fitX, t),
            scale: gsap.utils.interpolate(1, endScale, t),
            transformOrigin: `${setCenter}px 100%`,
            force3D: true,
          })
        },
      })

      return () => {
        st.kill()
      }
    },
    {scope: triggerRef, dependencies: [setLen]},
  )

  return (
    <section
      ref={triggerRef}
      className="relative flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden bg-background"
    >
      {/* Paper band — TinyWins per-word mask reveal + looping phrase swap */}
      <div className="relative flex min-h-0 flex-1 flex-col px-3 pb-5 pt-[5.75rem] sm:px-4 sm:pb-6 sm:pt-[6.5rem]">
        <h1 className="flex min-h-0 flex-1 flex-col font-sans text-[clamp(1.85rem,8vw,5.4rem)] font-bold uppercase leading-[0.9] tracking-[-0.03em] text-foreground sm:text-[clamp(2.05rem,4.7vw,5.4rem)]">
          <WordSwap primary={primary} secondary={secondary} />
        </h1>
      </div>

      {/* Visual band — project strip fills the full height (no dark stage) */}
      <div
        ref={stageRef}
        data-nav-surface="color"
        className="relative h-[min(46dvh,32rem)] shrink-0 overflow-x-clip sm:h-[min(48dvh,36rem)]"
      >
        <HomeProjectSlider
          projects={roster}
          autoplay={autoplay}
          interactionLock={!autoplay && !coarsePointer}
          bleed
          fillHeight
        />
      </div>
    </section>
  )
}
