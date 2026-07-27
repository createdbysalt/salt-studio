'use client'

import {useReducedMotion} from 'motion/react'
import {useEffect, useRef, useState} from 'react'

export type CapabilitiesStage = {
  _key: string
  _type: string
  subhead?: string | null
  introLine?: string | null
  body?: string | null
}

type CapabilitiesStagesProps = {
  stages: CapabilitiesStage[]
}

/** Wait before committing a hover so skimming the strip doesn’t thrash panels. */
const HOVER_ENTER_MS = 220
/** Keep the open pane briefly when the pointer leaves / crosses seams. */
const HOVER_LEAVE_MS = 160

/**
 * Full-bleed geometric stage strip — Creative / Production / Post.
 * Creative starts open. Hover (desktop) or tap (mobile) switches panels.
 * No photography — solid planes only (#EFEFEF, same as module off-tiles).
 */
export function CapabilitiesStages({stages}: CapabilitiesStagesProps) {
  const reduce = useReducedMotion()
  const [openIndex, setOpenIndex] = useState(0)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [hoverCapable, setHoverCapable] = useState(false)
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setHoverCapable(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    return () => {
      if (enterTimer.current) clearTimeout(enterTimer.current)
      if (leaveTimer.current) clearTimeout(leaveTimer.current)
    }
  }, [])

  if (!stages.length) return null

  const clearTimers = () => {
    if (enterTimer.current) {
      clearTimeout(enterTimer.current)
      enterTimer.current = null
    }
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current)
      leaveTimer.current = null
    }
  }

  const scheduleHover = (index: number) => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current)
      leaveTimer.current = null
    }
    if (hoverIndex === index) {
      if (enterTimer.current) {
        clearTimeout(enterTimer.current)
        enterTimer.current = null
      }
      return
    }
    if (enterTimer.current) clearTimeout(enterTimer.current)
    enterTimer.current = setTimeout(() => {
      setHoverIndex(index)
      enterTimer.current = null
    }, HOVER_ENTER_MS)
  }

  const scheduleClear = () => {
    if (enterTimer.current) {
      clearTimeout(enterTimer.current)
      enterTimer.current = null
    }
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    leaveTimer.current = setTimeout(() => {
      setHoverIndex(null)
      leaveTimer.current = null
    }, HOVER_LEAVE_MS)
  }

  // Keep Creative (or last tapped) open until hover overrides on desktop.
  const activeIndex = hoverCapable ? (hoverIndex ?? openIndex) : openIndex

  return (
    <section
      className="relative w-full border-b border-black/15 bg-[#EFEFEF]"
      aria-label="Creative, production, and post"
      onMouseLeave={scheduleClear}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          clearTimers()
          setHoverIndex(null)
        }
      }}
    >
      <div className="flex w-full flex-col md:min-h-[min(88vh,780px)] md:flex-row">
        {stages.map((stage, index) => {
          const label = (stage.subhead?.trim() || 'Stage').replace(/\.$/, '')
          const headline = stage.introLine?.trim() || null
          const body = stage.body?.trim() || null
          const isActive = activeIndex === index
          const panelId = `cap-stage-panel-${stage._key}`

          const flexClass =
            activeIndex === null ? 'md:flex-1' : isActive ? 'md:flex-[1.85]' : 'md:flex-[0.9]'

          return (
            <article
              key={stage._key}
              className={`group relative flex min-h-0 flex-col overflow-hidden border-black/15 ${
                index < stages.length - 1 ? 'border-b md:border-b-0 md:border-r' : ''
              } ${isActive ? 'max-md:min-h-[min(52vh,28rem)]' : ''} ${flexClass} ${
                reduce
                  ? 'bg-[#EFEFEF]'
                  : `bg-[#EFEFEF] transition-[flex-grow,flex-basis,min-height,background-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isActive ? 'bg-black/[0.07]' : ''
                    }`
              }`}
              onMouseEnter={() => scheduleHover(index)}
            >
              {/* Mobile / shared header control */}
              <button
                type="button"
                className="relative z-20 flex w-full items-center justify-between px-5 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-black md:absolute md:inset-0 md:block md:p-0"
                aria-expanded={isActive}
                aria-controls={panelId}
                onClick={() => {
                  clearTimers()
                  setOpenIndex(index)
                  setHoverIndex(index)
                }}
                onFocus={() => {
                  clearTimers()
                  setOpenIndex(index)
                  setHoverIndex(index)
                }}
              >
                <span className="flex w-full items-center justify-between md:hidden">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-black/40">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[clamp(1.1rem,2.4vw,1.65rem)] font-medium uppercase tracking-[0.12em] text-black/70">
                    {label}
                  </span>
                </span>
                <span className="sr-only">{isActive ? `Showing ${label}` : `Show ${label}`}</span>
              </button>

              {/* Desktop resting label — vertical type when collapsed */}
              <div
                className={`pointer-events-none absolute inset-0 z-10 hidden md:block ${
                  reduce ? '' : 'transition-opacity duration-300'
                } ${isActive ? 'opacity-0' : 'opacity-100'}`}
                aria-hidden={isActive}
              >
                <p className="absolute left-5 top-8 font-mono text-[10px] uppercase tracking-[0.22em] text-black/40">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-180 font-mono text-[clamp(1.1rem,2.4vw,1.65rem)] font-medium uppercase tracking-[0.12em] text-black/70 [writing-mode:vertical-rl]">
                  {label}
                </h2>
              </div>

              {/* Inset frame on the active pane (desktop) */}
              <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
                <div
                  className={`absolute inset-3 border ${
                    reduce ? '' : 'transition-opacity duration-500'
                  } ${isActive ? 'border-black/20 opacity-100' : 'border-transparent opacity-0'}`}
                />
              </div>

              {/* Expanded detail — pinned to bottom on mobile + desktop */}
              <div
                id={panelId}
                className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 px-5 pb-8 pt-6 sm:px-6 md:inset-0 md:flex md:flex-col md:justify-end md:p-8 lg:p-10 ${
                  reduce ? '' : 'transition-opacity duration-300 delay-100'
                } ${isActive ? 'opacity-100' : 'opacity-0 max-md:hidden'}`}
                aria-hidden={!isActive}
              >
                <p className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-black/40 sm:text-[11px] md:block">
                  {String(index + 1).padStart(2, '0')} — {label}
                </p>
                {headline ? (
                  <h2 className="max-w-md font-mono text-[clamp(1.2rem,2.8vw,2.15rem)] font-medium leading-snug tracking-tight text-black md:mt-4">
                    {headline}
                  </h2>
                ) : (
                  <h2 className="font-mono text-[clamp(1.2rem,2.8vw,2.15rem)] font-medium uppercase tracking-[0.08em] text-black md:mt-4">
                    {label}
                  </h2>
                )}
                {body ? (
                  <p className="mt-3 max-w-sm text-[0.875rem] leading-relaxed text-black/60 sm:mt-4 sm:text-[0.95rem] md:mt-5">
                    {body}
                  </p>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
