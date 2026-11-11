'use client'

import {gsap, skipScrubMotion, type ScrollTrigger} from '@/components/motion/gsap'
import {useEffect, useRef, useState, type CSSProperties} from 'react'

export type ProposalPhaseItem = {
  key: string
  name: string
  summary: string
  weeks: string
}

/**
 * Approach, on the same shader as the goal. The phases are the timeline.
 * On a fine pointer, scrolling scrubs from one phase to the next and draws
 * the line. The list can be any length. Touch and reduced motion get the
 * same phases in a vertical line, without the pin.
 * ProposalPage Phases renders this for the approach slide.
 */
export function ProposalApproach({
  heading,
  phases,
}: {
  heading: string
  phases: ProposalPhaseItem[]
}) {
  if (phases.length === 0) return null

  return (
    <>
      <PhaseList
        heading={heading}
        phases={phases}
        className={
          phases.length > 1
            ? 'md:hidden motion-reduce:md:!block [@media(pointer:coarse)]:md:!block'
            : ''
        }
      />
      {phases.length > 1 ? <PhaseScrub heading={heading} phases={phases} /> : null}
    </>
  )
}

function PhaseScrub({heading, phases}: {heading: string; phases: ProposalPhaseItem[]}) {
  const rootRef = useRef<HTMLElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<ScrollTrigger | null>(null)
  const [active, setActive] = useState(0)
  const count = phases.length

  useEffect(() => {
    const root = rootRef.current
    const fill = fillRef.current
    const desktop = window.matchMedia('(min-width: 768px)').matches
    if (!root || !fill || count < 2 || skipScrubMotion() || !desktop) return

    const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-approach-panel]'))
    if (panels.length < 2) return

    const ctx = gsap.context(() => {
      gsap.set(panels, {autoAlpha: 0, y: 56})
      gsap.set(panels[0], {autoAlpha: 1, y: 0})
      gsap.set(fill, {scaleY: 0, transformOrigin: 'top center'})

      const timeline = gsap.timeline({
        defaults: {ease: 'none'},
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (self) => {
            const index = Math.min(count - 1, Math.round(self.progress * (count - 1)))
            setActive((previous) => (previous === index ? previous : index))
          },
        },
      })

      for (let index = 0; index < count - 1; index += 1) {
        const current = panels[index]
        const next = panels[index + 1]
        if (!current || !next) continue
        timeline
          .to(current, {autoAlpha: 0, y: -72, duration: 1}, index)
          .to(next, {autoAlpha: 1, y: 0, duration: 1}, index)
      }
      timeline.to(fill, {scaleY: 1, duration: count - 1}, 0)
      triggerRef.current = timeline.scrollTrigger ?? null
    }, root)

    return () => {
      triggerRef.current = null
      ctx.revert()
    }
  }, [count])

  const jump = (index: number) => {
    const trigger = triggerRef.current
    if (!trigger) return
    const progress = index / (count - 1)
    const top = trigger.start + (trigger.end - trigger.start) * progress
    window.scrollTo({top, behavior: 'smooth'})
  }

  return (
    <section
      ref={rootRef}
      className="relative hidden h-auto motion-reduce:!hidden [@media(pointer:coarse)]:!hidden md:block motion-safe:h-[calc(100dvh+(var(--approach-steps)-1)*64dvh)]"
      style={{'--approach-steps': count} as CSSProperties}
    >
      <div className="sticky top-0 flex h-dvh items-center overflow-x-clip px-[max(3.5rem,var(--spacing-gutter))] md:px-[max(4.5rem,var(--spacing-gutter))]">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.7fr)] lg:gap-10">
          <div>
            <h2 className="max-w-[10em] text-[clamp(2.4rem,4.2vw,4rem)] font-normal leading-[0.92] tracking-[-0.045em]">
              {heading}
            </h2>
            <div className="relative mt-6 h-[clamp(16rem,32vh,22rem)]">
              {phases.map((phase, index) => (
                <article
                  key={phase.key}
                  data-approach-panel
                  className="absolute inset-0"
                  aria-hidden={index === active ? undefined : true}
                >
                  <p
                    aria-hidden
                    className="pointer-events-none absolute -top-10 left-0 font-sans text-[clamp(6.5rem,14vw,11rem)] font-medium leading-none tracking-[-0.07em] text-white/55"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <div className="relative flex h-full flex-col justify-end">
                    {phase.weeks ? (
                      <p className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-[#8f8f8f]">
                        {phase.weeks}
                      </p>
                    ) : null}
                    <h3 className="mt-2 max-w-[8em] text-[clamp(3.25rem,6vw,6.25rem)] font-medium leading-[0.9] tracking-[-0.05em]">
                      {phase.name}
                    </h3>
                    {phase.summary ? (
                      <p className="mt-4 max-w-[28em] text-[1.2rem] font-medium leading-snug text-foreground/75 md:text-[1.35rem]">
                        {phase.summary}
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
              {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </p>
            <div className="relative mt-4">
              <div aria-hidden className="absolute bottom-3 left-[5px] top-3 w-px bg-black/15" />
              <div
                ref={fillRef}
                aria-hidden
                className="absolute bottom-3 left-[5px] top-3 w-px origin-top bg-ink"
              />
              <ol>
                {phases.map((phase, index) => {
                  const selected = index === active
                  return (
                    <li key={phase.key} className="relative">
                      <button
                        type="button"
                        aria-current={selected ? 'step' : undefined}
                        onClick={() => jump(index)}
                        className="grid w-full cursor-pointer grid-cols-[12px_minmax(0,1fr)] items-start gap-3 py-3 text-left"
                      >
                        <span
                          aria-hidden
                          className={`mt-1.5 size-3 rounded-full border border-ink ${
                            selected ? 'bg-ink' : 'bg-white/70'
                          }`}
                        />
                        <span>
                          {phase.weeks ? (
                            <span className="block font-mono text-[12px] uppercase tracking-[0.08em] text-[#8f8f8f]">
                              {phase.weeks}
                            </span>
                          ) : null}
                          <span
                            className={`mt-1 block text-[1.15rem] leading-snug tracking-[-0.03em] ${
                              selected ? 'font-medium' : 'text-foreground/55'
                            }`}
                          >
                            {phase.name}
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PhaseList({
  heading,
  phases,
  className = '',
}: {
  heading: string
  phases: ProposalPhaseItem[]
  className?: string
}) {
  return (
    <div
      className={`px-[max(3.5rem,var(--spacing-gutter))] pb-16 pt-6 md:px-[max(4.5rem,var(--spacing-gutter))] ${className}`}
    >
      <h2 className="max-w-[10em] text-[clamp(2.4rem,4.2vw,4rem)] font-normal leading-[0.92] tracking-[-0.045em]">
        {heading}
      </h2>
      <div className="relative mt-6">
        <div aria-hidden className="absolute bottom-2 left-[7px] top-2 w-px bg-black/15" />
        <ol>
          {phases.map((phase, index) => (
            <li key={phase.key} className="relative grid grid-cols-[16px_minmax(0,1fr)] gap-4 pb-7">
              <span
                aria-hidden
                className="mt-1.5 size-4 rounded-full border border-ink bg-white/80"
              />
              <div>
                <p className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-[#8f8f8f]">
                  {String(index + 1).padStart(2, '0')}
                  {phase.weeks ? ` · ${phase.weeks}` : ''}
                </p>
                <h3 className="mt-1 text-[clamp(1.85rem,3vw,2.75rem)] font-medium leading-[0.95] tracking-[-0.04em]">
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
