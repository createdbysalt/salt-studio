'use client'

import {useGSAP} from '@gsap/react'
import {useRef} from 'react'
import {EASE, gsap, prefersReducedMotion} from './gsap'

const CLIP_FROM = {
  up: 'inset(100% 0% 0% 0%)',
  down: 'inset(0% 0% 100% 0%)',
  left: 'inset(0% 100% 0% 0%)',
  right: 'inset(0% 0% 0% 100%)',
} as const

interface ClipRevealProps {
  children: React.ReactNode
  className?: string
  /** Which edge the content is revealed from */
  direction?: keyof typeof CLIP_FROM
  /** Seconds after the trigger before the wipe starts */
  delay?: number
}

/**
 * Motion pattern #6: clip-path wipe. The frame un-clips from one edge when it
 * scrolls into view. Pair with ParallaxMedia inside for the full G&G effect.
 */
export function ClipReveal({children, className, direction = 'up', delay = 0}: ClipRevealProps) {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !scope.current) return

      gsap.fromTo(
        scope.current,
        {clipPath: CLIP_FROM[direction]},
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.8,
          delay,
          ease: EASE.outQuint,
          scrollTrigger: {
            trigger: scope.current,
            start: 'top 85%',
            once: true,
          },
        },
      )
    },
    {scope},
  )

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  )
}
