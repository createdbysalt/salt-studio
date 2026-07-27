'use client'

import {usePathname, useRouter} from 'next/navigation'
import {useEffect, useRef} from 'react'
import {DURATION, EASE, gsap, prefersReducedMotion} from './gsap'

/**
 * Curtain page transition (motion pattern #1 — the Barba replacement).
 *
 * Two fixed half-width ink panels wipe in from the sides on internal link
 * clicks, the route changes underneath, then the panels retract once the new
 * pathname has rendered. Works by intercepting document-level clicks on
 * same-origin anchors — no custom Link component needed.
 *
 * Escape hatches: external links, new-tab/download links, modifier clicks,
 * hash-only navigation, /edit (Studio), links marked data-no-transition, and
 * reduced motion all fall through to default Next.js navigation.
 */
export function PageTransition() {
  const router = useRouter()
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)
  const isCovering = useRef(false)

  // Retract the curtain once the new route has rendered under it.
  useEffect(() => {
    if (!isCovering.current) return
    isCovering.current = false
    const panels = containerRef.current?.children
    if (!panels) return
    gsap.to(panels, {
      xPercent: (i) => (i === 0 ? -101 : 101),
      duration: DURATION.slow,
      ease: EASE.outQuint,
      delay: 0.1,
    })
  }, [pathname])

  useEffect(() => {
    function onClick(event: MouseEvent) {
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
      const anchor = (event.target as Element | null)?.closest?.('a')
      if (!anchor) return
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return
      if (anchor.hasAttribute('data-no-transition')) return

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return
      }

      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname.startsWith('/edit')) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) return
      if (prefersReducedMotion()) return
      if (isCovering.current) return

      const panels = containerRef.current?.children
      if (!panels) return

      event.preventDefault()
      isCovering.current = true
      const destination = url.pathname + url.search + url.hash
      gsap.to(panels, {
        xPercent: 0,
        duration: DURATION.slow,
        ease: EASE.outQuint,
        overwrite: true,
        onComplete: () => router.push(destination),
      })
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [router])

  return (
    <div ref={containerRef} aria-hidden className="pointer-events-none fixed inset-0 z-[999]">
      <div
        className="absolute inset-y-0 left-0 w-[51%] bg-ink"
        style={{transform: 'translateX(-101%)'}}
      />
      <div
        className="absolute inset-y-0 right-0 w-[51%] bg-ink"
        style={{transform: 'translateX(101%)'}}
      />
    </div>
  )
}
