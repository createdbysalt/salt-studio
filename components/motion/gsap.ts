/**
 * Central GSAP setup. Import gsap + plugins from here, never from 'gsap' directly,
 * so plugin registration happens exactly once. Client-side only — import this
 * module only from 'use client' components.
 *
 * Easing/duration constants mirror the CSS motion tokens in app/globals.css.
 * GSAP power eases are exact matches for the measured cubic-beziers:
 *   power2.out === cubic-bezier(0.33, 1, 0.68, 1)  (--ease-out-cubic)
 *   power4.out === cubic-bezier(0.22, 1, 0.36, 1)  (--ease-out-quint)
 */
import gsap from 'gsap'
import {Draggable} from 'gsap/Draggable'
import {Flip} from 'gsap/Flip'
import {InertiaPlugin} from 'gsap/InertiaPlugin'
import {MorphSVGPlugin} from 'gsap/MorphSVGPlugin'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {SplitText} from 'gsap/SplitText'
import {TextPlugin} from 'gsap/TextPlugin'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(
    ScrollTrigger,
    SplitText,
    Flip,
    TextPlugin,
    Draggable,
    InertiaPlugin,
    MorphSVGPlugin,
  )
}

export const EASE = {
  outCubic: 'power2.out',
  outQuint: 'power4.out',
} as const

export const DURATION = {
  fast: 0.15,
  base: 0.3,
  slow: 0.5,
  reveal: 0.6,
} as const

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Touch devices (phones/tablets) — coarse pointer, no fine hover. */
export function isCoarsePointer(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
}

/**
 * Whether to skip scroll-scrubbed effects (parallax drift, scrub timelines).
 * True under reduced motion OR on touch devices: iOS Safari batches scroll
 * events during momentum, so anything tied frame-by-frame to scroll position
 * looks choppy. Static content reads cleaner there than janky scrub.
 */
export function skipScrubMotion(): boolean {
  return prefersReducedMotion() || isCoarsePointer()
}

export {Draggable, Flip, gsap, InertiaPlugin, MorphSVGPlugin, ScrollTrigger, SplitText, TextPlugin}
