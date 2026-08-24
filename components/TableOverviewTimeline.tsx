'use client'

import {usePortalStatus} from '@/components/ClientPortalStatus'
import {DURATION, EASE, gsap, prefersReducedMotion} from '@/components/motion/gsap'
import {useGSAP} from '@gsap/react'
import {useRef} from 'react'

const FALLBACK_PHASES = [
  {
    name: 'Discovery',
    note: 'Kickoff, then we learn the church and the site you have now.',
  },
  {
    name: 'Content',
    note: 'Strategy, copy, and the files on this table.',
  },
  {
    name: 'Prototyping',
    note: 'Design system and homepage, then the rest of the pages.',
  },
  {
    name: 'Build',
    note: 'The live site and the CMS your team will use.',
  },
  {
    name: 'Review',
    note: 'Your notes. We revise. One more look.',
  },
  {
    name: 'Launch',
    note: 'Training, QA, go live, wrap-up.',
  },
] as const

export type OverviewPhase = {
  _key?: string | null
  name?: string | null
  note?: string | null
}

const COLS: Record<number, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  7: 'md:grid-cols-7',
  8: 'md:grid-cols-8',
}

export function TableOverviewTimeline({
  heading,
  phases,
}: {
  heading?: string | null
  phases?: Array<OverviewPhase | null> | null
}) {
  const {currentPhase} = usePortalStatus()
  const scope = useRef<HTMLDivElement>(null)
  const steps = (phases ?? [])
    .filter((phase): phase is OverviewPhase => Boolean(phase?.name))
    .map((phase) => ({name: phase.name, note: phase.note ?? ''}))
  const list = steps.length ? steps : [...FALLBACK_PHASES]
  const cols = COLS[list.length] ?? 'md:grid-cols-6'

  useGSAP(
    () => {
      if (!scope.current) return

      const lineX = scope.current.querySelector<HTMLElement>('[data-phase-line="x"]')
      const lineY = scope.current.querySelector<HTMLElement>('[data-phase-line="y"]')
      const dots = gsap.utils.toArray<HTMLElement>('[data-phase-dot]', scope.current)
      const copy = gsap.utils.toArray<HTMLElement>('[data-phase-copy]', scope.current)
      const steps = gsap.utils.toArray<HTMLElement>('[data-phase-step]', scope.current)

      if (prefersReducedMotion()) {
        gsap.set([lineX, lineY].filter(Boolean), {clipPath: 'inset(0% 0% 0% 0%)'})
        gsap.set(dots, {scale: 1, autoAlpha: 1})
        gsap.set(copy, {autoAlpha: 1, y: 0})
        return
      }

      gsap.set(dots, {scale: 0, transformOrigin: '50% 50%'})
      gsap.set(copy, {autoAlpha: 0, y: 8})
      if (lineX) gsap.set(lineX, {clipPath: 'inset(0% 100% 0% 0%)'})
      if (lineY) gsap.set(lineY, {clipPath: 'inset(0% 0% 100% 0%)'})

      const tl = gsap.timeline({
        scrollTrigger: {trigger: scope.current, start: 'top 80%', once: true},
      })

      tl.to([lineX, lineY].filter(Boolean), {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: DURATION.reveal,
        ease: EASE.outCubic,
      })
        .to(
          dots,
          {
            scale: 1,
            autoAlpha: 1,
            duration: 0.34,
            ease: EASE.outQuint,
            stagger: 0.08,
          },
          0.12,
        )
        .to(
          copy,
          {
            autoAlpha: 1,
            y: 0,
            duration: DURATION.slow,
            ease: EASE.outCubic,
            stagger: 0.07,
          },
          0.22,
        )

      const cleanups = steps.map((step) => {
        const dot = step.querySelector<HTMLElement>('[data-phase-dot]')
        if (!dot) return () => undefined

        const hover = gsap.timeline({paused: true})
        hover.to(dot, {scale: 1.35, duration: 0.34, ease: EASE.outQuint}, 0)

        const onEnter = () => hover.play()
        const onLeave = () => hover.reverse()
        step.addEventListener('pointerenter', onEnter)
        step.addEventListener('pointerleave', onLeave)

        return () => {
          step.removeEventListener('pointerenter', onEnter)
          step.removeEventListener('pointerleave', onLeave)
          hover.kill()
        }
      })

      return () => {
        tl.kill()
        cleanups.forEach((fn) => fn())
      }
    },
    {scope},
  )

  return (
    <div ref={scope} className="mt-[40px]">
      <p className="font-sans text-h3 font-semibold tracking-heading">
        {heading?.trim() || 'How the project runs'}
      </p>
      <div className="relative mt-[24px]">
        <div
          aria-hidden
          data-phase-line="x"
          className="pointer-events-none absolute top-[4px] left-[4.5px] hidden h-px bg-border md:block"
          style={{right: `calc((100% - 80px) / ${list.length} - 4.5px)`}}
        />
        <div
          aria-hidden
          data-phase-line="y"
          className="pointer-events-none absolute top-[4.5px] bottom-[4.5px] left-[4.5px] w-px bg-border md:hidden"
        />
        <ol className={`grid grid-cols-1 gap-y-[28px] md:gap-x-[16px] md:gap-y-0 ${cols}`}>
          {list.map((phase, index) => {
            const current = index === currentPhase
            return (
              <li
                key={phase.name}
                data-phase-step
                aria-current={current ? 'step' : undefined}
                className="relative min-w-0"
              >
                <span
                  aria-hidden
                  data-phase-dot
                  className={`relative z-10 mb-[18px] ml-0 block size-[9px] rounded-full ring-[3px] ring-background transition-colors duration-500 ${
                    current ? 'bg-accent' : 'bg-foreground'
                  }`}
                />
                <div data-phase-copy className="min-w-0 pl-[20px] md:pl-0">
                  <p className="text-telemetry text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-[4px] font-sans text-[16px] font-medium leading-snug">
                    {phase.name}
                  </h3>
                  <p className="mt-[8px] text-[14px] leading-relaxed text-secondary">
                    {phase.note}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
