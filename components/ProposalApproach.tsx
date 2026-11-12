'use client'

import {gsap, prefersReducedMotion, ScrollTrigger} from '@/components/motion/gsap'
import {useEffect, useRef, useState, type CSSProperties} from 'react'

export type ProposalPhaseItem = {
  key: string
  name: string
  summary: string
  weeks: string
}

export type ProposalApproachQuestion = {
  key: string
  question: string
  answer: string
}

/**
 * Approach, on the same shader as the goal. The phases stay on screen
 * beside a straight line. Scrolling draws that line from the title downward.
 * Even phases sit on the left, odd phases on the right. Touch gets the same
 * phases in a vertical list, and scrolling draws that line from the first
 * dot to the last. Reduced motion shows the full line.
 * ProposalPage Phases renders this for the approach slide.
 */
export function ProposalApproach({
  heading,
  intro,
  phases,
  questionsHeading,
  questions,
}: {
  heading: string
  intro: string
  phases: ProposalPhaseItem[]
  questionsHeading: string
  questions: ProposalApproachQuestion[]
}) {
  if (phases.length === 0) return null

  return (
    <>
      <PhaseList
        heading={heading}
        intro={intro}
        phases={phases}
        className={
          phases.length > 1
            ? 'md:hidden motion-reduce:md:!block [@media(pointer:coarse)]:md:!block'
            : ''
        }
      />
      {phases.length > 1 ? <PhaseScrub heading={heading} intro={intro} phases={phases} /> : null}
      {questions.length > 0 ? <ApproachNotes title={questionsHeading} notes={questions} /> : null}
    </>
  )
}

const VIEW = {w: 1000, h: 640}
const LINE_X = 500

function phasePoints(count: number) {
  const top = 36
  const bottom = 600
  return Array.from({length: count}, (_, index) => {
    const t = count === 1 ? 0.5 : index / (count - 1)
    return {x: LINE_X, y: top + (bottom - top) * t}
  })
}

function lineThrough(points: {x: number; y: number}[]) {
  if (points.length < 2) return ''
  const first = points[0]
  const last = points[points.length - 1]
  if (!first || !last) return ''
  return `M ${first.x} ${first.y} L ${last.x} ${last.y}`
}

function PhaseScrub({
  heading,
  intro,
  phases,
}: {
  heading: string
  intro: string
  phases: ProposalPhaseItem[]
}) {
  const rootRef = useRef<HTMLElement>(null)
  const drawRef = useRef<SVGPathElement>(null)
  const penRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<ScrollTrigger | null>(null)
  const count = phases.length
  const points = phasePoints(count)
  const path = lineThrough(points)
  const origin = points[0] ?? {x: LINE_X, y: 36}

  useEffect(() => {
    const root = rootRef.current
    const draw = drawRef.current
    const pen = penRef.current
    if (!root || !draw || !pen || count < 2) return

    const desktopQuery = window.matchMedia('(min-width: 768px)')
    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarseQuery = window.matchMedia('(pointer: coarse)')
    let ctx: gsap.Context | undefined
    let lastHeight = -1

    const canRun = () =>
      desktopQuery.matches &&
      !reduceQuery.matches &&
      !coarseQuery.matches &&
      draw.getTotalLength() > 1

    const ensure = () => {
      if (!canRun()) {
        ctx?.revert()
        ctx = undefined
        triggerRef.current = null
        return
      }
      if (ctx) return

      const length = draw.getTotalLength()
      const place = (progress: number) => {
        const point = draw.getPointAtLength(Math.max(0, Math.min(length, length * progress)))
        pen.style.left = `${(point.x / VIEW.w) * 100}%`
        pen.style.top = `${(point.y / VIEW.h) * 100}%`
      }

      ctx = gsap.context(() => {
        const proxy = {t: 0}
        gsap.set(draw, {strokeDasharray: length, strokeDashoffset: length})
        place(0)
        const timeline = gsap.timeline({
          defaults: {ease: 'none'},
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.55,
            invalidateOnRefresh: true,
          },
        })
        timeline.to(draw, {strokeDashoffset: 0, duration: 1}, 0)
        timeline.to(proxy, {t: 1, duration: 1, onUpdate: () => place(proxy.t)}, 0)
        triggerRef.current = timeline.scrollTrigger ?? null
      }, root)
      ScrollTrigger.refresh()
    }

    ensure()

    const onMedia = () => ensure()
    desktopQuery.addEventListener('change', onMedia)
    reduceQuery.addEventListener('change', onMedia)
    coarseQuery.addEventListener('change', onMedia)

    const observer = new ResizeObserver(() => {
      const next = root.offsetHeight
      if (!ctx) {
        ensure()
        lastHeight = root.offsetHeight
        return
      }
      if (next !== lastHeight) {
        lastHeight = next
        ScrollTrigger.refresh()
      }
    })
    lastHeight = root.offsetHeight
    observer.observe(root)

    return () => {
      desktopQuery.removeEventListener('change', onMedia)
      reduceQuery.removeEventListener('change', onMedia)
      coarseQuery.removeEventListener('change', onMedia)
      observer.disconnect()
      triggerRef.current = null
      ctx?.revert()
    }
  }, [count, path])

  const jump = (index: number) => {
    const trigger = triggerRef.current
    if (!trigger || count < 2) return
    const progress = index / (count - 1)
    const top = trigger.start + (trigger.end - trigger.start) * progress
    window.scrollTo({top, behavior: 'smooth'})
  }

  return (
    <section
      ref={rootRef}
      className="relative hidden h-auto motion-reduce:!hidden [@media(pointer:coarse)]:!hidden md:block motion-safe:h-[calc(100dvh+(var(--approach-steps)-1)*48dvh)]"
      style={{'--approach-steps': count} as CSSProperties}
    >
      <div className="sticky top-0 flex h-dvh flex-col overflow-x-clip px-[max(3.5rem,var(--spacing-gutter))] pb-[5vh] pt-[5.5rem] md:px-[max(4.5rem,var(--spacing-gutter))]">
        <p className="text-center font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
          The timeline
        </p>
        <h2 className="mx-auto mt-3 max-w-[8em] text-center text-[clamp(3.25rem,6.4vw,5.75rem)] font-normal leading-[0.92] tracking-[-0.05em]">
          {heading}
        </h2>
        {intro ? (
          <p className="mx-auto mt-3 max-w-[34em] text-center text-[1.05rem] font-medium leading-snug text-foreground/75">
            {intro}
          </p>
        ) : null}

        <div className="relative mt-7 min-h-0 flex-1">
          <svg
            viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
            preserveAspectRatio="none"
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          >
            <path
              d={path}
              fill="none"
              stroke="rgba(8,9,10,0.16)"
              strokeWidth="2.25"
              strokeLinecap="round"
            />
            <path
              ref={drawRef}
              d={path}
              fill="none"
              stroke="#08090a"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeDasharray={4000}
              strokeDashoffset={4000}
            />
          </svg>
          <div
            ref={penRef}
            aria-hidden
            className="pointer-events-none absolute z-20 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink ring-4 ring-white/80"
            style={{left: `${(origin.x / VIEW.w) * 100}%`, top: `${(origin.y / VIEW.h) * 100}%`}}
          />
          {phases.map((phase, index) => {
            const point = points[index]
            if (!point) return null
            const onRight = index % 2 === 1
            return (
              <div
                key={phase.key}
                className="absolute z-10"
                style={{left: `${(point.x / VIEW.w) * 100}%`, top: `${(point.y / VIEW.h) * 100}%`}}
              >
                <button
                  type="button"
                  aria-label={phase.weeks ? `${phase.weeks}. ${phase.name}` : phase.name}
                  onClick={() => jump(index)}
                  className="absolute left-0 top-0 size-5 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-ink bg-white/85"
                />
                <article
                  className={`absolute top-1/2 w-[min(18rem,30vw)] -translate-y-1/2 ${
                    onRight
                      ? 'left-[calc(100%+1.75rem)] text-left'
                      : 'right-[calc(100%+1.75rem)] text-right'
                  }`}
                >
                  <p className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-[#8f8f8f]">
                    {String(index + 1).padStart(2, '0')}
                    {phase.weeks ? ` · ${phase.weeks}` : ''}
                  </p>
                  <h3 className="mt-1 text-[clamp(1.85rem,3vw,2.75rem)] font-medium leading-[0.95] tracking-[-0.04em]">
                    {phase.name}
                  </h3>
                  {phase.summary ? (
                    <p
                      className={`mt-2 max-w-[22em] text-[1.02rem] font-medium leading-snug text-foreground/75 ${
                        onRight ? '' : 'ml-auto'
                      }`}
                    >
                      {phase.summary}
                    </p>
                  ) : null}
                </article>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ApproachNotes({title, notes}: {title: string; notes: ProposalApproachQuestion[]}) {
  const [openKey, setOpenKey] = useState<string | null>(notes[0]?.key ?? null)

  return (
    <section
      data-approach-notes
      className="px-[max(3.5rem,var(--spacing-gutter))] pb-9 pt-8 md:px-[max(4.5rem,var(--spacing-gutter))]"
    >
      <div className="mx-auto w-full">
        <p className="text-center font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
          Our approach
        </p>
        <h2 className="mx-auto mt-3 max-w-[8em] text-center text-[clamp(3.25rem,6.4vw,5.75rem)] font-normal leading-[0.92] tracking-[-0.05em]">
          {title}
        </h2>
        <ul className="mx-auto mt-6 grid w-full max-w-[40rem] gap-3">
          {notes.map((note, index) => {
            const open = note.key === openKey
            return (
              <li
                key={note.key}
                className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_30px_80px_rgba(40,30,10,0.14)] backdrop-blur-[42px]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-10 h-28 w-28 rounded-full bg-white/80 blur-2xl"
                />
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -bottom-12 h-32 w-32 rounded-full blur-3xl ${
                    index % 2 === 0 ? '-left-8 bg-[#7eb8f2]/35' : '-right-4 bg-[#f0b15a]/40'
                  }`}
                />
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`approach-note-${note.key}`}
                  onClick={() => setOpenKey(open ? null : note.key)}
                  className="relative flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-[1.05rem] font-medium leading-snug">{note.question}</span>
                  <Chevron open={open} />
                </button>
                <div
                  id={`approach-note-${note.key}`}
                  role="region"
                  aria-hidden={open ? undefined : true}
                  className={`relative grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-[0.98rem] leading-relaxed text-foreground/75">
                      {note.answer}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function Chevron({open}: {open: boolean}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={`h-3 w-3 shrink-0 text-foreground/55 transition-transform duration-300 motion-reduce:transition-none ${
        open ? 'rotate-180' : ''
      }`}
    >
      <path
        d="M3.5 6 L8 10.5 L12.5 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PhaseList({
  heading,
  intro,
  phases,
  className = '',
}: {
  heading: string
  intro: string
  phases: ProposalPhaseItem[]
  className?: string
}) {
  const listRef = useRef<HTMLOListElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const inkRef = useRef<HTMLDivElement>(null)
  const penRef = useRef<HTMLDivElement>(null)
  const count = phases.length

  useEffect(() => {
    const list = listRef.current
    const track = trackRef.current
    const ink = inkRef.current
    const pen = penRef.current
    if (!list || !track || !ink || !pen) return

    const place = () => {
      const dots = list.querySelectorAll<HTMLElement>('[data-phase-dot]')
      const first = dots[0]
      const last = dots[dots.length - 1]
      if (!first || !last || dots.length < 2) {
        track.style.opacity = '0'
        return
      }
      const listBox = list.getBoundingClientRect()
      const start = first.getBoundingClientRect()
      const end = last.getBoundingClientRect()
      const top = start.top + start.height / 2 - listBox.top
      const height = end.top + end.height / 2 - listBox.top - top
      track.style.opacity = '1'
      track.style.left = `${start.left + start.width / 2 - listBox.left}px`
      track.style.top = `${top}px`
      track.style.height = `${Math.max(height, 0)}px`
    }

    place()
    const observer = new ResizeObserver(place)
    observer.observe(list)

    let ctx: ReturnType<typeof gsap.context> | undefined
    if (prefersReducedMotion() || count < 2) {
      gsap.set(ink, {scaleY: 1, transformOrigin: 'top center'})
      pen.style.opacity = '0'
    } else {
      ctx = gsap.context(() => {
        gsap.set(ink, {scaleY: 0, transformOrigin: 'top center'})
        gsap.set(pen, {top: 0})
        gsap
          .timeline({
            defaults: {ease: 'none'},
            scrollTrigger: {
              trigger: track,
              start: 'top 75%',
              end: 'bottom 42%',
              scrub: 0.45,
            },
          })
          .to(ink, {scaleY: 1, duration: 1}, 0)
          .to(pen, {top: '100%', duration: 1}, 0)
      }, list)
    }

    return () => {
      observer.disconnect()
      ctx?.revert()
    }
  }, [count])

  return (
    <div
      className={`px-[max(3.5rem,var(--spacing-gutter))] pb-5 pt-28 md:px-[max(4.5rem,var(--spacing-gutter))] ${className}`}
    >
      <p className="text-center font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
        The timeline
      </p>
      <h2 className="mx-auto mt-3 max-w-[8em] text-center text-[clamp(3.25rem,6.4vw,5.75rem)] font-normal leading-[0.92] tracking-[-0.05em]">
        {heading}
      </h2>
      {intro ? (
        <p className="mx-auto mt-3 max-w-[34em] text-center text-[1.05rem] font-medium leading-snug text-foreground/75">
          {intro}
        </p>
      ) : null}
      <div className="relative mt-6">
        <div
          ref={trackRef}
          aria-hidden
          className="pointer-events-none absolute w-[2px] -translate-x-1/2 opacity-0"
        >
          <div className="absolute inset-0 bg-black/15" />
          <div ref={inkRef} className="absolute inset-0 origin-top scale-y-0 bg-[#08090a]" />
          <div ref={penRef} className="absolute left-1/2 top-0">
            <div className="size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#08090a] ring-4 ring-white/80" />
          </div>
        </div>
        <ol ref={listRef}>
          {phases.map((phase, index) => (
            <li
              key={phase.key}
              className="relative grid grid-cols-[20px_minmax(0,1fr)] gap-4 pb-7 last:pb-0"
            >
              <span
                data-phase-dot=""
                aria-hidden
                className="relative z-10 mt-1.5 size-4 justify-self-center rounded-full border border-ink bg-white"
              />
              <div>
                <p className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-[#8f8f8f]">
                  {String(index + 1).padStart(2, '0')}
                  {phase.weeks ? ` · ${phase.weeks}` : ''}
                </p>
                <h3 className="mt-1 text-[clamp(2.2rem,4.5vw,3rem)] font-medium leading-[0.95] tracking-[-0.04em]">
                  {phase.name}
                </h3>
                {phase.summary ? (
                  <p className="mt-2 max-w-xl text-[1.15rem] font-medium leading-snug text-foreground/75">
                    {phase.summary}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
