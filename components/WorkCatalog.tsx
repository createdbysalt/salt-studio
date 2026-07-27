'use client'

import {resolveWorkVideoPlayback, type WorkVideoPlayback} from '@/components/ProjectCardMedia'
import {ProjectGrid, type WorkEmptyState, type WorkProjectCard} from '@/components/ProjectGrid'
import {WorkFilterBar} from '@/components/WorkFilterBar'
import {trackSearch} from '@/lib/analytics'
import {type FilterPill} from '@/lib/work-pills'
import {stegaClean} from 'next-sanity'
import {useDeferredValue, useEffect, useState} from 'react'

function matchesQuery(project: WorkProjectCard, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    project.title,
    project.client,
    project.year,
    ...(project.categories ?? []).map((cat) => cat?.filterLabel),
  ]
    .filter(Boolean)
    .map((value) => stegaClean(String(value)).toLowerCase())
    .join(' ')

  return haystack.includes(q)
}

/**
 * Work page interactive shell — search + specialty filter pills + project grid.
 * Search filters the already-fetched catalog client-side (title, client, year,
 * categories). Category pills remain real URL routes.
 */
export function WorkCatalog({
  projects,
  emptyState,
  categories,
  activeSlug = null,
  videoPlayback = 'autoplay',
}: {
  projects: Array<WorkProjectCard | null>
  emptyState?: WorkEmptyState
  categories: FilterPill[]
  activeSlug?: string | null
  videoPlayback?: WorkVideoPlayback | string | null
}) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const searching = Boolean(deferredQuery.trim())

  const filtered = projects.filter((project): project is WorkProjectCard => {
    if (!project) return false
    return matchesQuery(project, deferredQuery)
  })

  useEffect(() => {
    const term = deferredQuery.trim()
    if (!term) return
    const timer = window.setTimeout(() => {
      trackSearch({
        search_term: term,
        search_results_count: filtered.length,
      })
    }, 600)
    return () => window.clearTimeout(timer)
  }, [deferredQuery, filtered.length])

  const playbackMode = resolveWorkVideoPlayback(videoPlayback)

  return (
    <>
      <div className="mt-6 px-5 md:mt-24 md:px-6">
        <div>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
              Search —
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Project, client, specialty…"
              autoComplete="off"
              spellCheck={false}
              className="mt-3 w-full border-b border-white/40 bg-transparent py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-white outline-none transition-colors placeholder:text-white/35 focus:border-white"
            />
          </label>
        </div>

        <WorkFilterBar categories={categories} activeSlug={activeSlug} />
      </div>

      {searching && filtered.length === 0 ? (
        <div className="mt-12 px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40 md:px-6">
          <p className="!m-0">No projects match that search.</p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-3 text-white/70 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
          >
            Clear search
          </button>
        </div>
      ) : (
        <ProjectGrid
          key={playbackMode}
          projects={filtered}
          emptyState={emptyState}
          videoPlayback={playbackMode}
        />
      )}
    </>
  )
}
