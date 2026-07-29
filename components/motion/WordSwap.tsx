'use client'

import {useGSAP} from '@gsap/react'
import {useRef} from 'react'
import {gsap, prefersReducedMotion} from './gsap'

export type SwapFace = {
  left: string
  right: string
}

interface WordSwapProps {
  /** Clear / DECIDE face — default + reduced-motion + accessible text */
  primary: SwapFace
  /** Poetic / LINGER face that visits, then leaves */
  secondary: SwapFace
  className?: string
}

/** Split a side into word-rows. `\n` = intentional line break. */
function toRows(text: string): string[][] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\s+/).filter(Boolean))
}

function WordRows({text}: {text: string}) {
  return (
    <>
      {toRows(text).map((row) => (
        <span
          key={row.join('-')}
          className="flex gap-x-[0.28em] overflow-hidden leading-none"
        >
          {row.map((word) => (
            <span
              key={word}
              data-word={word}
              className="inline-block max-md:whitespace-normal md:whitespace-nowrap"
            >
              {word}
            </span>
          ))}
        </span>
      ))}
    </>
  )
}

function PhraseLayout({face}: {face: SwapFace}) {
  return (
    <span className="flex h-full min-h-0 w-full flex-col justify-between gap-8 md:h-auto md:flex-row md:items-end md:gap-4">
      <span
        data-side="left"
        className="flex w-full min-w-0 flex-col items-end text-right md:w-1/2 md:items-start md:text-left"
      >
        <WordRows text={face.left} />
      </span>
      <span
        data-side="right"
        className="flex w-full min-w-0 flex-col items-start text-left md:w-1/2 md:items-end md:text-right"
      >
        <WordRows text={face.right} />
      </span>
    </span>
  )
}

/**
 * TinyWins hero type: per-word masked reveal + looping phrase swap.
 * Words live in overflow-hidden rows; GSAP drives yPercent through the masks.
 */
export function WordSwap({primary, secondary, className}: WordSwapProps) {
  const scope = useRef<HTMLSpanElement>(null)
  const srText = `${primary.left.replace(/\n/g, ' ')} ${primary.right.replace(/\n/g, ' ')}`

  useGSAP(
    () => {
      if (prefersReducedMotion() || !scope.current) return

      const phraseA = scope.current.querySelector<HTMLElement>('[data-phrase-a]')
      const phraseB = scope.current.querySelector<HTMLElement>('[data-phrase-b]')
      if (!phraseA || !phraseB) return

      const wordsA = gsap.utils.toArray<HTMLElement>('[data-word]', phraseA)
      const wordsB = gsap.utils.toArray<HTMLElement>('[data-word]', phraseB)
      const leftA = gsap.utils.toArray<HTMLElement>(
        '[data-side="left"] [data-word]',
        phraseA,
      )
      const rightA = gsap.utils.toArray<HTMLElement>(
        '[data-side="right"] [data-word]',
        phraseA,
      )

      if (!wordsA.length || !wordsB.length) return

      const withWillChange = (targets: HTMLElement[]) => ({
        onStart: () => {
          gsap.set(targets, {willChange: 'transform'})
        },
        onComplete: () => {
          gsap.set(targets, {willChange: 'auto'})
        },
      })

      const exit = {
        yPercent: -105,
        duration: 0.5,
        ease: 'power3.in',
        stagger: {amount: 0.2},
      }
      const enter = {
        yPercent: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: {amount: 0.4},
        immediateRender: false,
      }

      gsap.set(wordsA, {yPercent: 105})
      gsap.set(wordsB, {yPercent: 105})

      // Intro — left then right, matching TinyWins stagger offsets
      const intro = gsap.timeline()
      intro
        .to(
          leftA,
          {yPercent: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out'},
          0.3,
        )
        .to(
          rightA,
          {yPercent: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out'},
          0.4,
        )

      // Loop — A ↔ B with ~3s pause between cycles (TinyWins repeatDelay)
      const cycleHold = 5.1
      const loop = gsap.timeline({
        paused: true,
        repeat: -1,
        repeatDelay: 3,
      })

      loop
        .to(wordsA, {...exit, ...withWillChange(wordsA)}, 0)
        .fromTo(wordsB, {yPercent: 105}, {...enter, ...withWillChange(wordsB)}, 0.7)
        .to(wordsB, {...exit, ...withWillChange(wordsB)}, cycleHold)
        .fromTo(
          wordsA,
          {yPercent: 105},
          {...enter, ...withWillChange(wordsA)},
          cycleHold + 0.7,
        )

      intro.eventCallback('onComplete', () => {
        loop.play()
      })

      return () => {
        intro.kill()
        loop.kill()
      }
    },
    {scope, dependencies: [primary.left, primary.right, secondary.left, secondary.right]},
  )

  return (
    <span
      ref={scope}
      className={`relative grid h-full min-h-0 w-full ${className ?? ''}`}
    >
      <span className="sr-only">{srText}</span>

      <span
        data-phrase-a
        aria-hidden
        className="col-start-1 row-start-1 block h-full min-h-0 w-full"
      >
        <PhraseLayout face={primary} />
      </span>
      <span
        data-phrase-b
        aria-hidden
        className="col-start-1 row-start-1 block h-full min-h-0 w-full motion-reduce:hidden"
      >
        <PhraseLayout face={secondary} />
      </span>
    </span>
  )
}
