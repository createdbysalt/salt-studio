'use client'

import {gsap, prefersReducedMotion} from '@/components/motion/gsap'
import {LineReveal} from '@/components/motion/LineReveal'
import {useGSAP} from '@gsap/react'
import {Fragment, useRef} from 'react'

const INK = '#08090a'
const PAPER = '#ffffff'

/** Split a legal title into 1–2 display lines for the masthead. */
function toHeadlineLines(title: string): string[] {
  const words = title.trim().split(/\s+/).filter(Boolean)
  if (words.length <= 1) return [title.trim() || 'Legal']
  if (words.length === 2) return words
  const mid = Math.ceil(words.length / 2)
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
}

/**
 * Legal masthead — same paper→ink dome scrub as Capabilities, with the
 * document title as the large LineReveal headline.
 */
export function LegalHero({title}: {title: string}) {
  const lines = toHeadlineLines(title)
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
        aria-label={title}
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
          }}
        />

        <div className="relative z-10 w-full mix-blend-difference text-white">
          <LineReveal
            as="h1"
            start="top 90%"
            stagger={0.16}
            duration={1.05}
            className="mx-auto w-full max-w-[min(96vw,80rem)] text-center font-sans text-[clamp(3.5rem,16vw,10rem)] font-bold uppercase leading-[0.84] tracking-[-0.05em] text-white"
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
