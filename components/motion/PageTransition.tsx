'use client'

import {isAboutHref} from '@/lib/aboutPanel'
import {isContactHref} from '@/lib/contactMenu'
import {isHomePath, pageIsDark} from '@/lib/pageTheme'
import {usePathname, useRouter} from 'next/navigation'
import {useEffect, useRef} from 'react'
import {EASE, gsap, prefersReducedMotion} from './gsap'
import {setPageWiping} from './pageTransitionState'

const INK = '#08090a'
const PAPER = '#ffffff'
const WIPE = 0.55

/**
 * Vertical page wipe (motion pattern #1 — the Barba replacement).
 *
 * Cover: opposite color DOWN, destination color UP.
 * Reveal: destination cover fades out once the real page is ready — no second
 * directional swipe (that read as an extra blank loader on dark routes).
 *
 * Homepage / About / Contact are skipped.
 */
export function PageTransition() {
  const router = useRouter()
  const pathname = usePathname()
  const firstRef = useRef<HTMLDivElement>(null)
  const secondRef = useRef<HTMLDivElement>(null)
  const isCovering = useRef(false)
  const pendingPath = useRef<string | null>(null)

  useEffect(() => {
    const first = firstRef.current
    const second = secondRef.current
    if (!first || !second) return
    gsap.set(first, {yPercent: -101, autoAlpha: 1, force3D: true})
    gsap.set(second, {yPercent: 101, autoAlpha: 1, force3D: true})
  }, [])

  // Hold the destination cover until the page is ready, then fade it away.
  useEffect(() => {
    if (!isCovering.current) return
    if (pendingPath.current && pathname !== pendingPath.current) return

    let cancelled = false
    const first = firstRef.current
    const second = secondRef.current
    if (!first || !second) return

    const reveal = () => {
      if (cancelled) return
      isCovering.current = false
      pendingPath.current = null

      gsap
        .timeline({
          overwrite: true,
          onComplete: () => {
            setPageWiping(false)
            gsap.set(first, {yPercent: -101, autoAlpha: 1, force3D: true})
            gsap.set(second, {yPercent: 101, autoAlpha: 1, force3D: true})
          },
        })
        // Fade only — the down/up pair already did the wipe. Another swipe
        // felt like a blank loader beat on Work (dark).
        .to(second, {
          autoAlpha: 0,
          duration: 0.35,
          ease: EASE.outQuint,
        })
        .set(first, {yPercent: -101, autoAlpha: 0}, 0)
    }

    const waitUntilReady = () => {
      const start = performance.now()
      const grace = 200
      const minAfterLoad = 40
      const maxWait = 4000
      let sawLoading = false
      let loadingGoneAt: number | null = null

      const tick = () => {
        if (cancelled) return
        const loading = document.querySelector('[data-page-loading]')
        const elapsed = performance.now() - start

        if (loading) {
          sawLoading = true
          loadingGoneAt = null
        } else if (sawLoading && loadingGoneAt === null) {
          loadingGoneAt = performance.now()
        }

        // Instant/cached nav: loading never mounts — wait a grace window so we
        // don't lift early and flash a blank shell (Work was especially bad).
        const instantReady = !sawLoading && elapsed >= grace
        const loadedReady =
          sawLoading && loadingGoneAt !== null && performance.now() - loadingGoneAt >= minAfterLoad

        if (instantReady || loadedReady || elapsed >= maxWait) {
          reveal()
          return
        }
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    waitUntilReady()
    return () => {
      cancelled = true
    }
  }, [pathname])

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }
      if (isCovering.current) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
      if (prefersReducedMotion()) return

      const anchor = (event.target as Element | null)?.closest?.('a')
      if (!anchor) return
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return
      if (anchor.hasAttribute('data-no-transition')) return

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return
      }

      let url: URL
      try {
        url = new URL(href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      if (url.pathname.startsWith('/edit')) return
      if (isHomePath(url.pathname)) return
      if (isAboutHref(url.pathname) || isContactHref(url.pathname)) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return
      }

      const first = firstRef.current
      const second = secondRef.current
      if (!first || !second) return

      event.preventDefault()
      event.stopPropagation()

      isCovering.current = true
      setPageWiping(true)
      const destination = url.pathname + url.search + url.hash
      pendingPath.current = url.pathname
      const dark = pageIsDark(url.pathname)
      const firstColor = dark ? PAPER : INK
      const secondColor = dark ? INK : PAPER

      gsap.killTweensOf([first, second])
      gsap.set(first, {
        backgroundColor: firstColor,
        yPercent: -101,
        autoAlpha: 1,
        force3D: true,
      })
      gsap.set(second, {
        backgroundColor: secondColor,
        yPercent: 101,
        autoAlpha: 1,
        force3D: true,
      })

      gsap
        .timeline({
          onComplete: () => {
            router.push(destination)
          },
        })
        .to(first, {
          yPercent: 0,
          duration: WIPE,
          ease: EASE.outQuint,
          force3D: true,
        })
        .to(
          second,
          {
            yPercent: 0,
            duration: WIPE,
            ease: EASE.outQuint,
            force3D: true,
          },
          `-=${WIPE * 0.28}`,
        )
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [router])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[999]">
      <div ref={firstRef} className="absolute inset-0" />
      <div ref={secondRef} className="absolute inset-0" />
    </div>
  )
}
