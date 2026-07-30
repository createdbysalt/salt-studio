'use client'

import {gsap, prefersReducedMotion} from '@/components/motion/gsap'
import {LineReveal} from '@/components/motion/LineReveal'
import {useGSAP} from '@gsap/react'
import {Fragment, useRef} from 'react'

const INK = '#08090a'
const PAPER = '#ffffff'

const DEFAULT_HEADLINE = 'Built to\nserve'

/**
 * Capabilities masthead — paper stage with “Built to serve”, then the same
 * wide ink dome scrub as the homepage type-beat bridge.
 * `headline` comes from Sanity (servicesPage.capabilitiesHeadline); the
 * built-in copy is the safety net so the stage never renders empty.
 */
export function CapabilitiesHero({headline}: {headline?: string | null}) {
  const lines = (headline?.trim() || DEFAULT_HEADLINE).split('\n')
  const triggerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const inkRef = useRef<HTMLDivElement>(null)
  const themeDarkRef = useRef(false)

  useGSAP(
    () => {
      if (!triggerRef.current || !panelRef.current || !inkRef.current) return

      const trigger = triggerRef.current
      const panel = panelRef.current
      const ink = inkRef.current

      const setCovered = (covered: boolean) => {
        if (covered === themeDarkRef.current) return
        themeDarkRef.current = covered
        if (covered) {
          panel.setAttribute('data-theme', 'dark')
          panel.removeAttribute('data-nav-surface')
          gsap.set(panel, {backgroundColor: INK})
        } else {
          panel.removeAttribute('data-theme')
          panel.setAttribute('data-nav-surface', 'paper')
          gsap.set(panel, {backgroundColor: PAPER})
        }
      }

      gsap.set(panel, {backgroundColor: PAPER})
      panel.setAttribute('data-nav-surface', 'paper')

      if (prefersReducedMotion()) {
        setCovered(true)
        gsap.set(ink, {y: '-45%'})
        return
      }

      setCovered(false)
      gsap.set(ink, {y: '50%', force3D: true})

      gsap.to(ink, {
        y: '-45%',
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setCovered(self.progress > 0.9)
          },
          onLeave: () => setCovered(true),
          onLeaveBack: () => setCovered(false),
        },
      })

      return () => {
        panel.removeAttribute('data-theme')
        panel.removeAttribute('data-nav-surface')
        themeDarkRef.current = false
        gsap.set(panel, {backgroundColor: PAPER})
      }
    },
    {scope: triggerRef},
  )

  return (
    <div ref={triggerRef} className="relative h-[125vh] md:h-[160vh] lg:h-[180vh]">
      <section
        ref={panelRef}
        aria-label="Capabilities"
        data-nav-surface="paper"
        className="sticky top-0 flex h-[100dvh] min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-3 pb-8 pt-14 text-center text-foreground sm:px-4 md:px-12 md:pb-10 md:pt-20"
        style={{backgroundColor: PAPER}}
      >
        <div
          ref={inkRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-[-55%] top-0 z-0 will-change-transform [border-radius:100%_100%_0_0/22%_22%_0_0] md:inset-x-[-75%] md:[border-radius:100%_100%_0_0/28%_28%_0_0]"
          style={{
            height: '200%',
            backgroundColor: INK,
            // Match GSAP's start pose so first paint isn't a full-bleed dark hit target.
            transform: 'translate3d(0, 50%, 0)',
          }}
        />

        <div className="relative z-10 w-full mix-blend-difference text-white">
          <LineReveal
            as="h1"
            start="top 90%"
            stagger={0.16}
            duration={1.05}
            className="mx-auto w-full max-w-[min(96vw,80rem)] text-center font-sans text-[clamp(4.75rem,22vw,12rem)] font-bold uppercase leading-[0.84] tracking-[-0.05em] text-white"
          >
            {lines.map((line, index) => (
              <Fragment key={index}>
                {index > 0 ? <br /> : null}
                {line}
              </Fragment>
            ))}
          </LineReveal>
        </div>
      </section>
    </div>
  )
}
