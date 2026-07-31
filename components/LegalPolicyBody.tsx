'use client'

import {EASE, gsap, prefersReducedMotion, ScrollTrigger} from '@/components/motion/gsap'
import {useGSAP} from '@gsap/react'
import {useRef} from 'react'

/**
 * Managed policy HTML (Termageddon) + GSAP scroll reveals.
 * Accordion rows stay compact — the provider’s default type is oversized on our stage.
 */
export function LegalPolicyBody({html}: {html: string}) {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !scope.current) return

      const targets = gsap.utils.toArray<HTMLElement>(
        'h1, h2, h3, h4, p, ul, ol, table, details.accordion, .accordion',
        scope.current,
      )

      if (!targets.length) return

      // One container trigger + stagger. Per-element ScrollTriggers left the
      // Termageddon body stuck at autoAlpha:0 under Lenis (onEnter never fired).
      const alreadyInView = scope.current.getBoundingClientRect().top < window.innerHeight * 0.9

      if (alreadyInView) {
        gsap.fromTo(
          targets,
          {autoAlpha: 0, y: 20},
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: EASE.outCubic,
            stagger: 0.02,
            clearProps: 'transform',
          },
        )
        return
      }

      gsap.fromTo(
        targets,
        {autoAlpha: 0, y: 20},
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          ease: EASE.outCubic,
          stagger: 0.02,
          clearProps: 'transform',
          scrollTrigger: {
            trigger: scope.current,
            start: 'top 90%',
            once: true,
          },
        },
      )

      ScrollTrigger.refresh()
    },
    {scope, dependencies: [html]},
  )

  return (
    <div
      ref={scope}
      className="legal-policy prose prose-invert prose-sm max-w-none prose-headings:font-sans prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-[0.9375rem] prose-p:leading-relaxed prose-li:text-[0.9375rem] [&_.accordion]:font-mono [&_.accordion]:text-[11px] [&_.accordion]:leading-relaxed [&_.accordion]:tracking-[0.04em] [&_details.accordion]:my-1 [&_details.accordion]:border-b [&_details.accordion]:border-white/15 [&_details.accordion]:py-1.5 [&_details.accordion]:font-mono [&_details.accordion]:text-[11px] [&_details.accordion]:leading-relaxed [&_details.accordion]:tracking-[0.04em] [&_details.accordion_li]:font-mono [&_details.accordion_li]:text-[11px] [&_details.accordion_li]:text-white/55 [&_details.accordion_p]:mt-1.5 [&_details.accordion_p]:font-mono [&_details.accordion_p]:text-[11px] [&_details.accordion_p]:leading-relaxed [&_details.accordion_p]:tracking-[0.02em] [&_details.accordion_p]:text-white/55 [&_details.accordion_summary]:cursor-pointer [&_details.accordion_summary]:list-none [&_details.accordion_summary]:font-mono [&_details.accordion_summary]:text-[11px] [&_details.accordion_summary]:font-normal [&_details.accordion_summary]:uppercase [&_details.accordion_summary]:leading-snug [&_details.accordion_summary]:tracking-[0.08em] [&_details.accordion_summary]:text-white/70 [&_details.accordion_summary::-webkit-details-marker]:hidden"
      dangerouslySetInnerHTML={{__html: html}}
    />
  )
}
