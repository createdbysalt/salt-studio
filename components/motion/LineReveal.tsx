'use client'

import {useGSAP} from '@gsap/react'
import {useRef} from 'react'
import {DURATION, EASE, gsap, prefersReducedMotion, SplitText} from './gsap'

interface LineRevealProps {
  children: React.ReactNode
  /** Wrapper element — defaults to div; pass 'h1', 'p', etc. for semantics */
  as?: keyof React.JSX.IntrinsicElements
  className?: string
  /** Seconds before the first line moves (after the trigger fires) */
  delay?: number
  /** Per-line stagger in seconds */
  stagger?: number
  /** Per-line tween duration in seconds */
  duration?: number
  /** ScrollTrigger start position */
  start?: string
}

/**
 * Motion pattern #2: SplitText line-mask reveal. Lines slide up into place from
 * behind overflow-hidden masks when the element scrolls into view (or
 * immediately, for above-the-fold content — the trigger fires on load).
 * `autoSplit` re-splits and replays cleanly on resize/font-load.
 */
export function LineReveal({
  children,
  as: Tag = 'div',
  className,
  delay = 0,
  stagger = 0.08,
  duration = DURATION.reveal,
  start = 'top 85%',
}: LineRevealProps) {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !scope.current) return

      const split = SplitText.create(scope.current, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration,
            ease: EASE.outCubic,
            stagger,
            delay,
            scrollTrigger: {
              trigger: scope.current,
              start,
              once: true,
            },
          }),
      })

      return () => split.revert()
    },
    {scope, dependencies: [delay, stagger, duration, start]},
  )

  return (
    // @ts-expect-error — polymorphic ref; all intrinsic wrappers here are HTMLElements
    <Tag ref={scope} className={className}>
      {children}
    </Tag>
  )
}
