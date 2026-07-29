'use client'

import {useLenis} from 'lenis/react'
import {usePathname} from 'next/navigation'
import {useEffect} from 'react'

/**
 * Smooth-scrolls in-page anchors through Lenis — e.g. the nav “Capabilities”
 * link (`/#how-we-can-help`) dropping to the homepage “How we can help” band.
 *
 * Handles two cases:
 *  - Arriving on a route that already has a hash (cross-page nav or direct load)
 *  - Clicking a same-page hash link (intercepted so Lenis animates it)
 *
 * When Lenis is off (reduced motion), it falls back to native scrolling.
 * Mounted once inside LenisProvider in app/(personal)/layout.tsx.
 */
export function HashScroll() {
  const lenis = useLenis()
  const pathname = usePathname()

  // Arriving on a route with a hash (cross-page nav or direct load). The
  // homepage is GSAP-pinned and mounts in stages, so poll for the target, then
  // re-assert once the pinned layout has settled its final height.
  useEffect(() => {
    const hash = window.location.hash
    if (hash.length < 2) return
    let cancelled = false
    const timers: number[] = []

    const scrollToTarget = (el: Element) => {
      if (lenis) lenis.scrollTo(el as HTMLElement, {offset: -24})
      else el.scrollIntoView()
    }

    const waitForTarget = (tries = 0) => {
      if (cancelled) return
      const el = document.querySelector(hash)
      if (el) {
        scrollToTarget(el)
        // Pinned ScrollTrigger sections change document height after mount;
        // re-assert so the landing position stays correct.
        timers.push(
          window.setTimeout(() => {
            if (!cancelled) scrollToTarget(el)
          }, 450),
          window.setTimeout(() => {
            if (!cancelled) scrollToTarget(el)
          }, 1100),
        )
        return
      }
      if (tries < 40) timers.push(window.setTimeout(() => waitForTarget(tries + 1), 80))
    }

    timers.push(window.setTimeout(() => waitForTarget(), 60))
    return () => {
      cancelled = true
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [pathname, lenis])

  // Same-page hash-link clicks: intercept so the scroll runs through Lenis
  // instead of Next's instant jump.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }
      const anchor = (event.target as HTMLElement | null)?.closest('a')
      const href = anchor?.getAttribute('href')
      if (!href) return
      const hashIndex = href.indexOf('#')
      if (hashIndex < 0) return
      const path = href.slice(0, hashIndex) || '/'
      if (path !== window.location.pathname) return
      const hash = href.slice(hashIndex)
      const el = document.querySelector(hash)
      if (!el) return
      event.preventDefault()
      if (lenis) lenis.scrollTo(el as HTMLElement, {offset: -24})
      else el.scrollIntoView({behavior: 'smooth'})
      window.history.pushState(null, '', hash)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [lenis])

  return null
}
