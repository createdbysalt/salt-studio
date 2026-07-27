'use client'

import {useEffect, useRef} from 'react'
import {usePathname} from 'next/navigation'
import {trackScrollDepth} from './events'

type ScrollMilestone = 25 | 50 | 75 | 90 | 100

/**
 * Scroll Depth Tracker
 *
 * Tracks how far users scroll down the page.
 * Fires events at 25%, 50%, 75%, 90%, and 100% scroll depth.
 *
 * Include once in your layout (inside ConsentProvider).
 * Milestones reset on route change.
 */
export function ScrollTracker() {
  const pathname = usePathname()
  const firedMilestones = useRef<Set<ScrollMilestone>>(new Set())

  useEffect(() => {
    // Reset milestones on route change
    firedMilestones.current.clear()

    function handleScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight

      if (docHeight <= 0) return // Page doesn't scroll

      const scrollPercent = Math.round((scrollTop / docHeight) * 100)

      // Check each milestone
      const milestones: ScrollMilestone[] = [25, 50, 75, 90, 100]

      for (const milestone of milestones) {
        if (scrollPercent >= milestone && !firedMilestones.current.has(milestone)) {
          firedMilestones.current.add(milestone)
          trackScrollDepth({
            scroll_depth: milestone,
            page_path: pathname,
          })
        }
      }
    }

    // Throttle scroll handler
    let ticking = false
    function throttledScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledScroll, {passive: true})

    // Check initial scroll position (for reloads mid-page)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [pathname])

  return null
}
