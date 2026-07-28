'use client'

import {HomeProjectSlider} from '@/components/HomeProjectSlider'
import {gsap, prefersReducedMotion, ScrollTrigger} from '@/components/motion/gsap'
import {WordSwap} from '@/components/motion/WordSwap'
import type {WorkProjectCard} from '@/components/ProjectGrid'
import {useGSAP} from '@gsap/react'
import {useMemo, useRef, useState} from 'react'

type Face = {left: string; right: string}

type HomeHeroStageProps = {
  projects: WorkProjectCard[]
  primary: Face
  secondary: Face
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
/** Pin height — shorter = less scroll to finish the shrink. */
const PIN_HEIGHT_CLASS = 'h-[140vh]'

/**
 * Full-viewport hero: WordSwap up top, project strip on the bottom edge.
 * Scroll scrubs the track so the roster spans edge-to-edge. Scale is on the
 * track (w-max), not a full-width wrapper.
 */
export function HomeHeroStage({projects, primary, secondary}: HomeHeroStageProps) {
  const triggerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [autoplay, setAutoplay] = useState(true)
  const scrubPastRef = useRef(false)

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

      const sticky = triggerEl.querySelector('section')
      if (sticky) gsap.set(sticky, {overflow: 'visible'})

      const st = ScrollTrigger.create({
        trigger: triggerEl,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.35,
        invalidateOnRefresh: true,
        onRefresh: () => {
          frozenStartX = null
        },
        onUpdate: (self) => {
          const past = self.progress > 0.04
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
        if (sticky) gsap.set(sticky, {clearProps: 'overflow'})
      }
    },
    {scope: triggerRef, dependencies: [setLen]},
  )

  return (
    <div ref={triggerRef} className={`relative ${PIN_HEIGHT_CLASS}`}>
      <section className="sticky top-0 flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden bg-background">
        <h1 className="mt-24 w-full shrink-0 px-3 font-sans text-[clamp(2.4rem,4.4vw,5.25rem)] font-bold uppercase leading-[0.9] tracking-[-0.03em] text-foreground sm:mt-28 sm:px-4">
          <WordSwap primary={primary} secondary={secondary} />
        </h1>

        <div ref={stageRef} className="mt-auto w-full shrink-0 overflow-visible pb-4 md:pb-5">
          <HomeProjectSlider
            projects={roster}
            autoplay={autoplay}
            interactionLock={!autoplay}
            bleed
          />
        </div>
      </section>
    </div>
  )
}
