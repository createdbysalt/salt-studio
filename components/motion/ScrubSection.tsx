'use client'

import {useGSAP} from '@gsap/react'
import {useRef} from 'react'
import {EASE, gsap, prefersReducedMotion} from './gsap'

interface ScrubSectionProps {
  children: React.ReactNode
  className?: string
  /** Pin the section while the timeline scrubs */
  pin?: boolean
  /** ScrollTrigger start — Glitch&Grit's home-trigger default */
  start?: string
  end?: string
}

/**
 * Motion pattern #5: scrubbed section (the Glitch&Grit `home-trigger` pattern —
 * one trigger, one synchronized timeline tied to scroll position).
 *
 * Children marked `data-scrub` are animated in sequence (rise + fade) along the
 * scrubbed timeline. For bespoke scrubbed choreography, build your own
 * component on `ScrollTrigger` from './gsap' instead of extending this one.
 */
export function ScrubSection({
  children,
  className,
  pin = false,
  start = 'top center',
  end = 'bottom center',
}: ScrubSectionProps) {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !scope.current) return

      const items = scope.current.querySelectorAll('[data-scrub]')
      if (!items.length) return

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scope.current,
          start,
          end,
          scrub: true,
          pin,
        },
      })

      items.forEach((item, i) => {
        tl.fromTo(
          item,
          {y: 60, autoAlpha: 0},
          {y: 0, autoAlpha: 1, ease: EASE.outCubic, duration: 1},
          i * 0.5,
        )
      })
    },
    {scope},
  )

  return (
    <section ref={scope as React.RefObject<HTMLElement>} className={className}>
      {children}
    </section>
  )
}
