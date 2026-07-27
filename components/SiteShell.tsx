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
 * Shared public-site chrome. Home, Work, and project detail stay on the dark
 * stage; other interiors use paper. Footer is omitted on home so it doesn't
 * sit under the fixed hero.
 */
export function SiteShell({navbar, footer, children}: SiteShellProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const onDark = isDarkSurface(pathname)

  // Absolute (non-sticky) nav overlays need a positioned parent so the nav
  // anchors to the page top and scrolls away with the hero.
  const isHeroOverlayPage =
    pathname === '/capabilities' ||
    pathname === '/studio' ||
    pathname === '/contact' ||
    pathname.startsWith('/contact/') ||
    pathname === '/rentals' ||
    pathname.startsWith('/rentals/')

  return (
    <div
      className={`flex min-h-screen flex-col ${isHeroOverlayPage ? 'relative' : ''} ${
        onDark ? 'bg-[#1a1a1a] text-white' : 'bg-background-light text-foreground-light'
      }`}
    >
      {navbar}
      <div className="flex-grow">{children}</div>
      {isHome ? null : footer}
    </div>
  )
}
