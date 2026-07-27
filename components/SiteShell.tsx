'use client'

import {isDarkSurface} from '@/lib/site-surface'
import {usePathname} from 'next/navigation'
import type {ReactNode} from 'react'

interface SiteShellProps {
  navbar: ReactNode
  footer: ReactNode
  children: ReactNode
}

/**
 * Shared public-site chrome. Work and project detail stay on the dark
 * stage; other interiors (including home) use paper.
 */
export function SiteShell({navbar, footer, children}: SiteShellProps) {
  const pathname = usePathname()
  const onDark = isDarkSurface(pathname)

  // Absolute (non-sticky) nav overlays need a positioned parent so the nav
  // anchors to the page top and scrolls away with the hero.
  const isHeroOverlayPage = pathname === '/contact' || pathname.startsWith('/contact/')

  return (
    <div
      className={`flex min-h-screen flex-col ${isHeroOverlayPage ? 'relative' : ''} ${
        onDark ? 'bg-[#1a1a1a] text-white' : 'bg-background text-foreground'
      }`}
    >
      {navbar}
      <div className="flex-grow">{children}</div>
      {footer}
    </div>
  )
}
