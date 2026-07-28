'use client'

import {Flip, gsap, prefersReducedMotion, ScrollTrigger} from '@/components/motion/gsap'
import type {CapabilitiesBentoShot} from '@/lib/capabilitiesBentoShots'
import {useGSAP} from '@gsap/react'
import Image from 'next/image'
import Link from 'next/link'
import {useRef} from 'react'

export type CapabilitiesBentoHeroProps = {
  headline: string
  subheadline?: string | null
  items: CapabilitiesBentoShot[]
}

/**
 * Scrubbed bento gallery hero — Flip + ScrollTrigger pattern from
 * https://demos.gsap.com/demo/scrubbed-bento-gallery/
 *
 * Compact bento → cells expand to fill the viewport as the section pins.
 */
export function CapabilitiesBentoHero({headline, subheadline, items}: CapabilitiesBentoHeroProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const wrap = wrapRef.current
      const gallery = galleryRef.current
      if (!wrap || !gallery || items.length === 0) return
      if (prefersReducedMotion()) return

      const tiles = gsap.utils.toArray<HTMLElement>('[data-bento-tile]', gallery)
      if (!tiles.length) return

      let flipCtx: gsap.Context | undefined

      const createTween = () => {
        flipCtx?.revert()
        gallery.classList.remove('capabilities-bento-gallery--final')

        flipCtx = gsap.context(() => {
          gallery.classList.add('capabilities-bento-gallery--final')
          const flipState = Flip.getState(tiles)
          gallery.classList.remove('capabilities-bento-gallery--final')

          const flip = Flip.to(flipState, {
            simple: true,
            ease: 'expoScale(1, 5)',
          })

          gsap.timeline({
            scrollTrigger: {
              trigger: gallery,
              start: 'center center',
              end: '+=100%',
              scrub: true,
              pin: wrap,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          }).add(flip)

          return () => {
            gsap.set(tiles, {clearProps: 'all'})
          }
        }, wrap)
      }

      createTween()

      // Debounce resize so Flip remeasures after layout settles.
      let resizeTimer: ReturnType<typeof setTimeout> | undefined
      const onResize = () => {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(() => {
          createTween()
          ScrollTrigger.refresh()
        }, 120)
      }
      window.addEventListener('resize', onResize)

      return () => {
        clearTimeout(resizeTimer)
        window.removeEventListener('resize', onResize)
        flipCtx?.revert()
      }
    },
    {dependencies: [items.length], scope: wrapRef},
  )

  if (items.length === 0) {
    return (
      <header className="page-chrome pt-28 pb-16 md:pt-36 md:pb-24">
        <h1 className="text-display max-w-[1100px] font-semibold">{headline}</h1>
        {subheadline ? (
          <p className="mt-8 max-w-[560px] text-lg leading-snug text-foreground/70">{subheadline}</p>
        ) : null}
      </header>
    )
  }

  return (
    <section className="media-bleed bg-background text-foreground" aria-label={headline}>
      <div
        ref={wrapRef}
        className="capabilities-bento-wrap relative flex h-svh w-full items-center justify-center overflow-hidden"
      >
        <div ref={galleryRef} className="capabilities-bento-gallery" data-bento-gallery>
          {items.map((item) => {
            const media = (
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover object-top"
                priority
              />
            )

            return (
              <div key={item.id} className="capabilities-bento-tile relative overflow-hidden bg-muted" data-bento-tile>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="absolute inset-0 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
                    aria-label={item.title}
                  >
                    {media}
                  </Link>
                ) : (
                  <div className="absolute inset-0" aria-hidden>
                    {media}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <header className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-[var(--spacing-gutter)] text-center mix-blend-difference">
          <h1 className="text-display max-w-[14ch] font-semibold text-white">{headline}</h1>
          {subheadline ? (
            <p className="mx-auto mt-5 max-w-[36ch] text-base leading-snug text-white/80 md:mt-6 md:text-lg">
              {subheadline}
            </p>
          ) : null}
        </header>
      </div>
    </section>
  )
}
