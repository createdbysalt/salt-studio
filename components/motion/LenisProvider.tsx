'use client'

import {ReactLenis, type LenisRef} from 'lenis/react'
import {useEffect, useRef, useState} from 'react'
import {gsap, ScrollTrigger} from './gsap'

/**
 * Smooth-scroll root for the public site. Syncs Lenis with ScrollTrigger and
 * drives Lenis from the GSAP ticker (single rAF loop). Under reduced motion the
 * provider renders children with native scrolling — no Lenis instance at all.
 *
 * Mounted in app/(personal)/layout.tsx only; the Studio at /edit stays native.
 */
export function LenisProvider({children}: {children: React.ReactNode}) {
  const lenisRef = useRef<LenisRef>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (reducedMotion) return

    const lenis = lenisRef.current?.lenis
    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000)
    }

    // Lenis owns scrolling; ScrollTrigger must be told about every scroll frame,
    // and GSAP's lag smoothing would fight the Lenis rAF loop.
    lenis?.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
      lenis?.off('scroll', ScrollTrigger.update)
    }
  }, [reducedMotion])

  if (reducedMotion) {
    return <>{children}</>
  }

  return (
    <ReactLenis root options={{autoRaf: false}} ref={lenisRef}>
      {children}
    </ReactLenis>
  )
}
