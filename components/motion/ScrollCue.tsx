'use client'

import {EASE, gsap, prefersReducedMotion} from '@/components/motion/gsap'
import {useGSAP} from '@gsap/react'
import {useRef} from 'react'

/**
 * Minimal down-arrow cue for ink-dome mastheads — soft bob, dissolves on scroll.
 */
export function ScrollCue() {
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      const mark = root.querySelector<HTMLElement>('[data-scroll-cue-mark]')
      const trigger = root.closest<HTMLElement>('[data-ink-dome-trigger]') ?? root.parentElement
      if (!trigger) return

      if (prefersReducedMotion()) {
        gsap.set(root, {autoAlpha: 0.4})
        return
      }

      gsap.set(root, {autoAlpha: 0})
      gsap.to(root, {
        autoAlpha: 0.55,
        duration: 0.8,
        delay: 1,
        ease: EASE.outCubic,
      })

      if (mark) {
        gsap.to(mark, {
          y: 9,
          duration: 1.05,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 1.1,
        })
      }

      gsap.to(root, {
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: {
          trigger,
          start: 'top top',
          end: '+=80',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
    },
    {scope: rootRef},
  )

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center mix-blend-difference text-white sm:bottom-7 md:bottom-8"
    >
      <svg
        data-scroll-cue-mark
        viewBox="0 0 16 16"
        width="14"
        height="14"
        fill="none"
        className="will-change-transform sm:h-4 sm:w-4"
      >
        <path
          d="M3.5 6.5L8 11l4.5-4.5"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-70"
        />
      </svg>
    </div>
  )
}
