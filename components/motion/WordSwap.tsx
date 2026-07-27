'use client'

import {useGSAP} from '@gsap/react'
import {useRef} from 'react'
import {DURATION, EASE, gsap, prefersReducedMotion} from './gsap'

export type SwapFace = {
  left: string
  right: string
}

interface WordSwapProps {
  /** Clear / DECIDE face — default + reduced-motion + accessible text */
  primary: SwapFace
  /** Poetic / LINGER face that visits, then leaves */
  secondary: SwapFace
  /** Seconds the primary face holds before swapping out */
  hold?: number
  /** Seconds the secondary (poetic) face lingers — defaults longer than `hold` */
  secondaryHold?: number
  className?: string
}

function Face({
  face,
  side,
}: {
  face: SwapFace
  side: 'left' | 'right'
}) {
  const text = side === 'left' ? face.left : face.right
  const lines = text.split('\n').filter(Boolean)

  return (
    <div
      data-side={side}
      className={
        side === 'left'
          ? 'flex flex-col items-end text-right md:items-start md:text-left'
          : 'flex flex-col items-start text-left md:items-end md:text-right'
      }
    >
      {lines.map((line) => (
        <span key={line} className="block whitespace-nowrap">
          {line}
        </span>
      ))}
    </div>
  )
}

function SplitRow({face}: {face: SwapFace}) {
  return (
    <div className="flex w-full flex-col justify-between gap-2 md:flex-row md:items-end md:gap-6">
      <Face face={face} side="left" />
      <Face face={face} side="right" />
    </div>
  )
}

/**
 * Motion pattern #2 — TinyWins-style split hero swap.
 * Two full-width faces (left block + right block, edge-anchored). Primary is
 * the default; secondary slides through the overflow mask. Reduced motion
 * keeps the primary face only.
 */
export function WordSwap({
  primary,
  secondary,
  hold = 5,
  secondaryHold = 8,
  className,
}: WordSwapProps) {
  const scope = useRef<HTMLSpanElement>(null)
  const srText = `${primary.left.replace(/\n/g, ' ')} ${primary.right.replace(/\n/g, ' ')}`

  useGSAP(
    () => {
      if (prefersReducedMotion() || !scope.current) return

      const a = scope.current.querySelector<HTMLElement>('[data-swap-a]')
      const b = scope.current.querySelector<HTMLElement>('[data-swap-b]')
      if (!a || !b) return

      gsap.set(a, {yPercent: 0, autoAlpha: 1})
      gsap.set(b, {yPercent: 110, autoAlpha: 0})

      // Primary holds → poetic enters and lingers longer → primary returns and
      // holds again before the loop. (`delay` only covers the first cycle.)
      const tl = gsap.timeline({repeat: -1, delay: hold})
      tl.to(a, {
        yPercent: -110,
        autoAlpha: 0,
        duration: DURATION.slow,
        ease: EASE.outCubic,
      })
        .fromTo(
          b,
          {yPercent: 110, autoAlpha: 0},
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: DURATION.slow,
            ease: EASE.outCubic,
            immediateRender: false,
          },
          '<0.08',
        )
        .to(
          b,
          {yPercent: -110, autoAlpha: 0, duration: DURATION.slow, ease: EASE.outCubic},
          `+=${secondaryHold}`,
        )
        .fromTo(
          a,
          {yPercent: 110, autoAlpha: 0},
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: DURATION.slow,
            ease: EASE.outCubic,
            immediateRender: false,
          },
          '<0.08',
        )
        .to({}, {duration: hold})
    },
    {scope, dependencies: [hold, secondaryHold]},
  )

  return (
    <span
      ref={scope}
      className={`relative block w-full overflow-hidden ${className ?? ''}`}
    >
      <span className="sr-only">{srText}</span>

      <span data-swap-a className="relative block w-full will-change-transform" aria-hidden>
        <SplitRow face={primary} />
      </span>
      <span
        data-swap-b
        aria-hidden
        className="absolute inset-x-0 top-0 block w-full will-change-transform motion-reduce:hidden"
      >
        <SplitRow face={secondary} />
      </span>
    </span>
  )
}
