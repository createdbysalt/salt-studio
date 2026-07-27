'use client'

import {
  EditorialLoading,
  HomeLoading,
  LegalLoading,
  ProjectLoading,
  WorkLoading,
} from '@/components/PageLoading'
import {usePathname} from 'next/navigation'

/**
 * Route-aware loading shells — each mirrors the target page layout and
 * surface (dark stage vs paper interior) so transitions feel intentional.
 */
export default function Loading() {
  const pathname = usePathname()

  if (pathname === '/') return <HomeLoading />
  if (pathname === '/work' || pathname.startsWith('/work/')) return <WorkLoading />
  if (pathname.startsWith('/projects/')) return <ProjectLoading />
  if (pathname.startsWith('/rentals/')) return <EditorialLoading width="wide" />
  if (pathname === '/legal') return <LegalLoading />
  if (pathname.startsWith('/legal/')) return <LegalLoading article />
  if (pathname === '/contact') return <EditorialLoading width="narrow" />
  if (pathname === '/studio' || pathname === '/capabilities') {
    return <EditorialLoading width="wide" />
  }

  return <EditorialLoading width="wide" />
}
