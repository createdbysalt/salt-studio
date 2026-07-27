'use client'

import {useGSAP} from '@gsap/react'
import {useRef} from 'react'
import {gsap, prefersReducedMotion} from './gsap'

interface ParallaxMediaProps {
  children: React.ReactNode
  className?: string
  /** How far the media drifts, as a percentage of its own height (each way) */
  strength?: number
}

/**
 * Motion pattern #4: TinyWins negative-inset parallax. Media renders oversized
 * inside a clipped frame and drifts vertically, scrubbed to scroll position.
 * The wrapper needs a size (aspect ratio or explicit height) from `className`.
 */
export function ParallaxMedia({children, className, strength = 10}: ParallaxMediaProps) {
  const scope = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !scope.current || !inner.current) return

      gsap.fromTo(
        inner.current,
        {yPercent: -strength},
        {
          yPercent: strength,
          ease: 'none',
          scrollTrigger: {
            trigger: scope.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    },
    {scope},
  )

  return (
    <div ref={scope} className={`overflow-hidden ${className ?? ''}`}>
      <div
        ref={inner}
        className="h-full w-full will-change-transform motion-reduce:scale-100"
        style={{scale: `${1 + (strength * 2) / 100}`}}
      >
        {children}
      </div>
    </div>
  )
}
