'use client'

import {AboutPanelProvider} from '@/components/AboutPanel'
import {ContactMenuProvider} from '@/components/ContactMenu'
import {usePathname} from 'next/navigation'
import type {ReactNode} from 'react'

interface SiteShellProps {
  navbar: ReactNode
  footer: ReactNode
  children: ReactNode
}

/** Routes whose page stage is dark — content cover + inverse footer. */
function pageIsDark(pathname: string): boolean {
  return (
    pathname.startsWith('/projects/') ||
    pathname === '/work' ||
    pathname.startsWith('/work/') ||
    pathname === '/legal' ||
    pathname.startsWith('/legal/')
  )
}

/**
 * Shared public-site chrome. Content sits above a sticky reveal footer
 * (TinyWins pattern): the stage is z-10 with an opaque background so it
 * covers the footer while scrolling; the footer sticks underneath at z-0.
 */
export function SiteShell({navbar, footer, children}: SiteShellProps) {
  const pathname = usePathname()
  const dark = pageIsDark(pathname)

  return (
    <AboutPanelProvider>
      <ContactMenuProvider>
        <div className="min-h-screen bg-background text-foreground">
          {navbar}
          <div
            data-theme={dark ? 'dark' : undefined}
            className="relative z-10 bg-background text-foreground"
          >
            {children}
          </div>
          {footer}
        </div>
      </ContactMenuProvider>
    </AboutPanelProvider>
  )
}
