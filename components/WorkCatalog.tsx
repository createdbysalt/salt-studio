'use client'

import {resolveWorkVideoPlayback, type WorkVideoPlayback} from '@/components/ProjectCardMedia'
import {ProjectGrid, type WorkEmptyState, type WorkProjectCard} from '@/components/ProjectGrid'
import {trackSearch} from '@/lib/analytics'
import {stegaClean} from 'next-sanity'
import {useDeferredValue, useEffect, useId, useState} from 'react'

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
 * Work catalog shell — command-strip search + the contact-sheet grid. Category
 * filtering lives in the masthead (WorkFilterHeadline) as real routes; search
 * filters the already-fetched catalog client-side (title, client, year,
 * categories). Catalog numbers are attached before filtering so a searched
 * subset keeps its original index marks.
 */
export function WorkCatalog({
  projects,
  emptyState,
  videoPlayback = 'autoplay',
}: {
  projects: Array<WorkProjectCard | null>
  emptyState?: WorkEmptyState
  videoPlayback?: WorkVideoPlayback | string | null
}) {
  const inputId = useId()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const deferredQuery = useDeferredValue(query)
  const searching = Boolean(deferredQuery.trim())

  const indexed = projects
    .filter((project): project is WorkProjectCard => Boolean(project))
    .map((project, index) => ({
      ...project,
      indexMark: String(index + 1).padStart(2, '0'),
    }))

  const filtered = indexed.filter((project) => matchesQuery(project, deferredQuery))

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
      {indexed.length > 0 ? (
        <div className="page-chrome mt-4">
          <div className="mx-auto w-full max-w-md">
            <label htmlFor={inputId} className="sr-only">
              Search work
            </label>
            <div
              className={`flex h-12 items-center gap-3 rounded-sm px-4 backdrop-blur-[42px] transition-[background-color,box-shadow] duration-300 ${
                focused
                  ? 'bg-[rgba(0,0,0,0.10)] shadow-[inset_0_0_0_1px_rgba(8,9,10,0.12)] in-[[data-theme=dark]]:bg-[rgba(255,255,255,0.16)] in-[[data-theme=dark]]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]'
                  : 'bg-[rgba(0,0,0,0.06)] in-[[data-theme=dark]]:bg-[rgba(255,255,255,0.10)]'
              }`}
            >
              {/* Command prompt — quiet index search, not a form field. */}
              <span
                aria-hidden
                className={`shrink-0 font-mono text-[14px] leading-none transition-colors duration-300 ${
                  focused || query ? 'text-accent' : 'text-foreground/35'
                }`}
              >
                /
              </span>
              <input
                id={inputId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Find a project"
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent font-sans text-[15px] tracking-[-0.01em] text-foreground outline-none placeholder:text-foreground/35 [&::-webkit-search-cancel-button]:appearance-none"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-foreground/45 transition-colors duration-300 hover:text-foreground"
                >
                  Clear
                </button>
              ) : (
                <span
                  aria-hidden
                  className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-foreground/30 sm:inline"
                >
                  Find
                </span>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {searching && filtered.length === 0 ? (
        <div
          className="page-chrome mt-12 flex flex-wrap items-baseline justify-center gap-x-4 gap-y-2 md:mt-16"
          aria-live="polite"
        >
          <p className="font-sans text-[15px] tracking-[-0.01em] text-foreground/60 md:text-base">
            No match for “{deferredQuery.trim()}”
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="font-sans text-[15px] font-medium tracking-[-0.01em] text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors duration-300 hover:decoration-foreground md:text-base"
          >
            Show all work
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
