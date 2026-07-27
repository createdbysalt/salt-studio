'use client'

import type {FilterPill} from '@/lib/work-pills'
import Link from 'next/link'
import {useCallback, useEffect, useRef, useState} from 'react'

export type {FilterPill} from '@/lib/work-pills'

const SCROLL_EDGE = 4

function scrollMask(canScrollStart: boolean, canScrollEnd: boolean): string | undefined {
  if (!canScrollStart && !canScrollEnd) return undefined

  const start = canScrollStart ? 'transparent 0%, #000 10%' : '#000 0%'
  const end = canScrollEnd ? '#000 90%, transparent 100%' : '#000 100%'

  return `linear-gradient(to right, ${start}, ${end})`
}

/**
 * The specialty filter bar on the Work pages. Each pill is a real link to a
 * category landing page (/work/[slug]) — that's what makes every specialty an
 * indexable URL for SEO/AEO, rather than a client-side-only filter. The active
 * category (or "All" on the index) is rendered as filled; idle pills are
 * outlined. On mobile the row scrolls horizontally.
 */
export function WorkFilterBar({
  categories,
  activeSlug = null,
}: {
  categories: FilterPill[]
  activeSlug?: string | null
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hasOverflow, setHasOverflow] = useState(false)
  const [canScrollStart, setCanScrollStart] = useState(false)
  const [canScrollEnd, setCanScrollEnd] = useState(false)

  const updateScrollHints = useCallback(() => {
    const el = scrollRef.current
    if (!el) return

    const overflow = el.scrollWidth - el.clientWidth > SCROLL_EDGE
    setHasOverflow(overflow)

    if (!overflow) {
      setCanScrollStart(false)
      setCanScrollEnd(false)
      return
    }

    setCanScrollStart(el.scrollLeft > SCROLL_EDGE)
    setCanScrollEnd(el.scrollLeft + el.clientWidth < el.scrollWidth - SCROLL_EDGE)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    updateScrollHints()
    el.addEventListener('scroll', updateScrollHints, {passive: true})

    const observer = new ResizeObserver(updateScrollHints)
    observer.observe(el)

    return () => {
      el.removeEventListener('scroll', updateScrollHints)
      observer.disconnect()
    }
  }, [updateScrollHints, categories.length])

  // Keep the active category pill in view on category pages.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const active = el.querySelector<HTMLElement>('[aria-current="page"]')
    if (active) {
      active.scrollIntoView({inline: 'center', block: 'nearest', behavior: 'instant'})
    }

    updateScrollHints()
  }, [activeSlug, categories.length, updateScrollHints])

  const mask = scrollMask(canScrollStart, canScrollEnd)

  const pillBase =
    'inline-block shrink-0 border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-colors duration-300 md:text-[12px]'
  const activeClasses = 'border-white bg-white text-black'
  const idleClasses = 'border-white/40 text-white hover:border-white'

  return (
    <nav aria-label="Filter work by specialty" className="mt-4">
      {hasOverflow ? (
        <span className="sr-only">Specialty filters scroll horizontally. Swipe to see more.</span>
      ) : null}

      <div
        ref={scrollRef}
        className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] md:-mx-6 md:px-6 lg:overflow-x-visible [&::-webkit-scrollbar]:hidden"
        style={
          mask
            ? {
                maskImage: mask,
                WebkitMaskImage: mask,
              }
            : undefined
        }
      >
        <div className="flex w-max flex-nowrap gap-2 pr-4 lg:w-auto lg:flex-wrap lg:pr-0">
          <Link href="/work" className={`${pillBase} ${activeSlug ? idleClasses : activeClasses}`}>
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/work/${category.slug}`}
              aria-current={activeSlug === category.slug ? 'page' : undefined}
              className={`${pillBase} ${activeSlug === category.slug ? activeClasses : idleClasses}`}
            >
              {category.filterLabel}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
