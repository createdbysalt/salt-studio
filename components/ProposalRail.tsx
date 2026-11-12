'use client'

import {useEffect, useState} from 'react'

export type ProposalRailItem = {
  id: string
  label: string
}

/**
 * Vertical section control, fixed to the right edge.
 * ProposalPage renders it beside the cover.
 */
export function ProposalRail({items}: {items: ProposalRailItem[]}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')
  const watched = items.map((item) => item.id).join('|')

  useEffect(() => {
    const ids = watched.split('|').filter(Boolean)
    if (ids.length === 0) return

    const update = () => {
      const line = window.innerHeight * 0.4
      let current = ids[0] ?? ''
      for (const id of ids) {
        const node = document.getElementById(id)
        if (!node) continue
        if (node.getBoundingClientRect().top <= line) current = id
      }
      setActiveId(current)
    }

    const root = document.documentElement
    root.style.scrollSnapType = ''
    root.style.scrollBehavior = ''
    update()
    window.addEventListener('scroll', update, {passive: true})
    window.addEventListener('hashchange', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('hashchange', update)
    }
  }, [watched])

  if (items.length === 0) return null

  return (
    <nav
      aria-label="Proposal sections"
      data-proposal-enter="chrome"
      className="fixed right-3 top-1/2 z-30 -translate-y-1/2 mix-blend-difference"
    >
      <ol className="flex flex-col items-center gap-1">
        {items.map((item) => {
          const active = item.id === activeId
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-label={item.label}
                aria-current={active ? 'true' : undefined}
                className="flex h-4 w-4 items-center justify-center outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={(event) => {
                  const node = document.getElementById(item.id)
                  if (!node) return
                  event.preventDefault()
                  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
                  node.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'start'})
                  history.pushState(null, '', `#${item.id}`)
                }}
              >
                <span
                  aria-hidden="true"
                  className={`block rounded-full bg-white ${active ? 'size-[8px]' : 'size-[4px] opacity-40'}`}
                />
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
