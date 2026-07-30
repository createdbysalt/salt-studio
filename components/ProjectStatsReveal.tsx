'use client'

import {DURATION, EASE, gsap, prefersReducedMotion} from '@/components/motion/gsap'
import {useGSAP} from '@gsap/react'
import {stegaClean} from 'next-sanity'
import {useRef} from 'react'

export type ProjectStatItem = {
  _key: string
  value?: string | null
  label?: string | null
}

/**
 * Compact case-study stats under the title — value + quiet label, one row.
 * Scroll-triggered stagger reveal (skipped under prefers-reduced-motion).
 */
export function ProjectStatsReveal({items}: {items: ProjectStatItem[]}) {
  const scope = useRef<HTMLDListElement>(null)
  const visible = items
    .map((it) => ({
      _key: it._key,
      value: it.value ? stegaClean(it.value).trim() : '',
      label: it.label ? stegaClean(it.label).trim() : '',
    }))
    .filter((it) => Boolean(it.value))
  const itemKey = visible.map((it) => it._key).join('|')

  useGSAP(
    () => {
      const root = scope.current
      if (!root || prefersReducedMotion()) return

      const cells = root.querySelectorAll<HTMLElement>('[data-stat-row]')
      if (!cells.length) return

      gsap.set(cells, {autoAlpha: 0, y: 8})
      gsap.to(cells, {
        autoAlpha: 1,
        y: 0,
        duration: DURATION.slow,
        ease: EASE.outQuint,
        stagger: 0.06,
        scrollTrigger: {
          trigger: root,
          start: 'top 90%',
          once: true,
        },
      })
    },
    {scope, dependencies: [itemKey]},
  )

  if (visible.length === 0) return null

  return (
    <dl
      ref={scope}
      className="flex flex-nowrap items-start justify-center gap-x-3 sm:gap-x-8 md:gap-x-10"
      aria-label="Results"
    >
      {visible.map((it) => (
        <div
          key={it._key}
          data-stat-row
          className="flex min-w-0 flex-1 flex-col-reverse items-center gap-0.5 text-center sm:max-w-[14ch] sm:flex-none"
        >
          {it.label ? (
            <dt className="line-clamp-2 font-mono text-[8px] uppercase leading-tight tracking-label text-foreground/35 sm:text-[9px]">
              {it.label}
            </dt>
          ) : (
            <dt className="sr-only">Result</dt>
          )}
          <dd className="font-sans text-[0.95rem] font-semibold leading-none tracking-[-0.03em] text-foreground sm:text-[1.125rem] md:text-[1.25rem]">
            {it.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
