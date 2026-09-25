'use client'

import {useEffect, useState} from 'react'

/**
 * Landing page sticky button bar (phones only).
 *
 * Hidden while the hero is on screen; slides in once the visitor scrolls past it.
 * Uses the page-level CTA label and link so the existing GTM cal.com click trigger
 * fires the same way it does for every other button on the page.
 * Honors prefers-reduced-motion by skipping the transition.
 */
export function LandingStickyCta({
  label,
  href,
  sentinelId = 'lp-hero',
}: {
  label: string
  href: string
  sentinelId?: string
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId)
    if (!sentinel || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setVisible(!entry?.isIntersecting)
      },
      {threshold: 0},
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [sentinelId])

  const isExternal = href.startsWith('http')

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-[60] border-t border-foreground/10 bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-300 motion-reduce:transition-none md:hidden ${
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-full'
      }`}
    >
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="btn-solid w-full justify-center"
        data-lp-sticky-cta
      >
        {label}
      </a>
    </div>
  )
}
