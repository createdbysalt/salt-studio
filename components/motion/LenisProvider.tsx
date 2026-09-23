'use client'

import {ReactLenis, type LenisRef} from 'lenis/react'
import {useEffect, useRef, useState} from 'react'
import {gsap, ScrollTrigger} from './gsap'

/**
 * Smooth-scroll root for the public site. Syncs Lenis with ScrollTrigger and
 * drives Lenis from the GSAP ticker (single rAF loop). Under reduced motion — or
 * on touch devices — the provider renders children with native scrolling and no
 * Lenis instance at all.
 *
 * Touch devices (phones/tablets) are excluded because iOS Safari runs native
 * scroll on the compositor thread with real momentum; Lenis' main-thread rAF
 * loop fights that engine and makes scrolling feel laggy. ScrollTrigger and the
 * scrubbed animations keep working on native scroll — we just drop the smoothing.
 *
 * Mounted in app/(personal)/layout.tsx only; the Studio at /edit stays native.
 */
export function LenisProvider({children}: {children: React.ReactNode}) {
  const lenisRef = useRef<LenisRef>(null)
  const [nativeScroll, setNativeScroll] = useState(false)

  useEffect(() => {
    // Reduced motion OR a coarse (touch) pointer → hand scrolling back to the
    // browser. `pointer: coarse` catches phones and tablets, where native
    // momentum scrolling beats anything we can do on the main thread.
    const mq = window.matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)')
    setNativeScroll(mq.matches)
    const onChange = () => setNativeScroll(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    // Browser "auto" restoration + Lenis/GSAP pins fight on reload — you'd land
    // mid-page (often on the type-beat). Manual + explicit top unless a hash.
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    if (!window.location.hash) {
      window.scrollTo(0, 0)
    }
  }, [])

  useEffect(() => {
    if (nativeScroll) return

    const lenis = lenisRef.current?.lenis
    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000)
    }

    // Lenis owns scrolling; ScrollTrigger must be told about every scroll frame,
    // and GSAP's lag smoothing would fight the Lenis rAF loop.
    lenis?.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    if (!window.location.hash) {
      lenis?.scrollTo(0, {immediate: true})
    }

    return () => {
      gsap.ticker.remove(update)
      lenis?.off('scroll', ScrollTrigger.update)
    }
  }, [nativeScroll])

  if (nativeScroll) {
    return <>{children}</>
  }

  return (
    <ReactLenis root options={{autoRaf: false}} ref={lenisRef}>
      {children}
    </ReactLenis>
  )
}
