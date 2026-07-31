'use client'

import {isPageWiping} from '@/components/motion/pageTransitionState'
import {
  EditorialLoading,
  HomeLoading,
  LegalLoading,
  ProjectLoading,
  WorkLoading,
} from '@/components/PageLoading'
import {pageIsDark} from '@/lib/pageTheme'
import {usePathname} from 'next/navigation'

/**
 * Route-aware loading shells — each mirrors the target page layout and
 * surface (dark stage vs paper interior) so transitions feel intentional.
 *
 * During the vertical page wipe, render a solid destination fill instead of
 * the skeleton — the wipe cover is the loading state.
 */
export default function Loading() {
  const pathname = usePathname()

  if (isPageWiping()) {
    const dark = pageIsDark(pathname)
    return (
      <div
        data-page-loading
        aria-hidden
        className="min-h-screen"
        style={{backgroundColor: dark ? '#08090a' : '#ffffff'}}
      />
    )
  }

  if (pathname === '/') return <HomeLoading />
  if (pathname === '/work' || pathname.startsWith('/work/')) return <WorkLoading />
  if (pathname.startsWith('/projects/')) return <ProjectLoading />
  if (pathname === '/legal') return <LegalLoading />
  if (pathname.startsWith('/legal/')) return <LegalLoading article />
  if (pathname === '/contact') return <EditorialLoading width="narrow" />
  return <EditorialLoading width="wide" />
}
