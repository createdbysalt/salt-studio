'use client'

import {useGSAP} from '@gsap/react'
import {useRef} from 'react'
import {DURATION, EASE, gsap, prefersReducedMotion} from './gsap'

interface WordSwapProps {
  /** The clear headline — the default face; what reduced motion and crawlers get */
  primary: string
  /** The poetic alternate that swaps in */
  secondary: string
  /** Seconds each face holds before swapping */
  hold?: number
  className?: string
}

/**
 * Motion pattern #3: TinyWins hero word-swap. Two copies of a line stacked in
 * the same grid cell; words of the visible copy translate up out of
 * overflow-hidden masks while the other copy's words rise in. The primary
 * (clear) line is the default face — the poetic line visits, then leaves.
 * Under reduced motion only the primary renders visibly.
 */
export function WordSwap({primary, secondary, hold = 4, className}: WordSwapProps) {
  const scope = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !scope.current) return

      const aWords = scope.current.querySelectorAll('[data-swap-a] [data-word]')
      const bWords = scope.current.querySelectorAll('[data-swap-b] [data-word]')
      gsap.set(bWords, {yPercent: 105})

      const tl = gsap.timeline({repeat: -1, delay: hold})
      tl.to(aWords, {
        yPercent: -105,
        duration: DURATION.slow,
        ease: EASE.outCubic,
        stagger: 0.05,
      })
        .fromTo(
          bWords,
          {yPercent: 105},
          {yPercent: 0, duration: DURATION.slow, ease: EASE.outCubic, stagger: 0.05},
          '<0.1',
        )
        .to(
          bWords,
          {yPercent: -105, duration: DURATION.slow, ease: EASE.outCubic, stagger: 0.05},
          `+=${hold}`,
        )
        .fromTo(
          aWords,
          {yPercent: 105},
          {yPercent: 0, duration: DURATION.slow, ease: EASE.outCubic, stagger: 0.05},
          '<0.1',
        )
        .to({}, {duration: 0.001}) // hold ends the cycle on the primary face
    },
    {scope},
  )

  const renderWords = (text: string) =>
    text.split(' ').map((word, i) => (
      <span key={i} className="inline-block overflow-hidden align-bottom">
        <span data-word className="inline-block will-change-transform">
          {word}
        </span>{' '}
      </span>
    ))

  return (
    <span ref={scope} className={`inline-grid ${className ?? ''}`}>
      <span data-swap-a className="col-start-1 row-start-1">
        {renderWords(primary)}
      </span>
      <span
        data-swap-b
        aria-hidden
        className="col-start-1 row-start-1 motion-reduce:invisible"
      >
        {renderWords(secondary)}
      </span>
    </span>
  )
}
