'use client'

import {CapReveal} from '@/components/CapabilitiesMotion'
import {
  resolveStudioImageSrc,
  STUDIO_DEFAULT_IMAGES,
  type StudioSanityImage,
} from '@/components/StudioMedia'
import {StudioLine} from '@/components/StudioMotion'
import {motion, useReducedMotion} from 'motion/react'
import Image from 'next/image'

type StudioHeroProps = {
  headline?: string | null
  /** Short hero support line. Falls back to a crafted line when empty. */
  supportLine?: string | null
  heroImage?: StudioSanityImage
}

const DEFAULT_SUPPORT =
  "A giant network distilled into specialty teams with the mission to maximize resources and elevate what's possible."

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Studio hero — full white field.
 * Copy left, radiographic suit right / pinned to the bottom edge.
 */
export function StudioHero({headline, supportLine, heroImage}: StudioHeroProps) {
  const src = resolveStudioImageSrc(heroImage, STUDIO_DEFAULT_IMAGES.hero, 1600, 2000)
  const alt = heroImage?.alt?.trim() || 'X-ray of a spacesuit — Salt Studio studio chapter mark'
  const isLocalDefault = src === STUDIO_DEFAULT_IMAGES.hero
  const {display, rest} = parseHeadline(headline)
  const support = supportLine?.trim() || DEFAULT_SUPPORT
  const reduce = useReducedMotion()

  return (
    <header className="relative isolate h-[100svh] max-h-[100svh] overflow-hidden bg-white">
      <div className="relative z-10 grid h-full grid-rows-[auto_1fr] lg:grid-cols-2 lg:grid-rows-1">
        <div className="flex flex-col justify-end px-5 pb-3 pt-[calc(var(--project-nav-height)+3.25rem)] sm:pb-6 sm:pt-[calc(var(--project-nav-height)+2rem)] md:px-6 md:pb-16 md:pt-[var(--project-nav-height-md)] lg:justify-center lg:pb-20 lg:pt-[var(--project-nav-height-md)]">
          <h1 className="m-0 max-w-[16ch] font-mono text-[clamp(1.75rem,7vw,4.25rem)] font-medium leading-[0.95] tracking-tight text-black sm:max-w-[18ch]">
            <StudioLine immediate delay={0.1}>
              {display}
            </StudioLine>
            {rest ? (
              <StudioLine immediate delay={0.2}>
                {rest}
              </StudioLine>
            ) : null}
          </h1>

          <CapReveal immediate delay={0.32} y={10}>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-black/65 sm:mt-5 md:mt-6 md:text-base">
              {support}
            </p>
          </CapReveal>
        </div>

        <div className="relative min-h-0 lg:h-full">
          {/* Mobile: scale suit up from the bottom so the helmet sits closer to the copy */}
          <div className="absolute inset-0 flex items-end justify-center px-2 sm:px-6 lg:justify-end lg:px-10 xl:px-14">
            {reduce ? (
              <div className="relative -mt-6 h-[112%] w-full max-w-[440px] origin-bottom sm:-mt-4 sm:h-[108%] sm:max-w-[420px] lg:mt-0 lg:h-full lg:max-w-[520px]">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 95vw, 50vw"
                  className="object-contain object-bottom"
                  {...(isLocalDefault ? {unoptimized: true} : {})}
                />
              </div>
            ) : (
              <motion.div
                className="relative -mt-6 h-[112%] w-full max-w-[440px] origin-bottom sm:-mt-4 sm:h-[108%] sm:max-w-[420px] lg:mt-0 lg:h-full lg:max-w-[520px]"
                initial={{opacity: 0, y: 28, scale: 1.02}}
                animate={{opacity: 1, y: 0, scale: 1}}
                transition={{duration: 1.05, delay: 0.22, ease: EASE}}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 95vw, 50vw"
                  className="object-contain object-bottom"
                  {...(isLocalDefault ? {unoptimized: true} : {})}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function parseHeadline(headline?: string | null) {
  const full = headline?.trim() || 'Ground Control for boots on the ground.'
  const match = full.match(/^(Ground Control)\s+(.+)$/i)
  if (match) {
    return {
      display: match[1],
      rest: match[2].replace(/\.$/, ''),
      full,
    }
  }
  if (full.length <= 18) {
    return {display: full, rest: null, full}
  }
  const words = full.split(/\s+/)
  return {
    display: words.slice(0, 2).join(' '),
    rest: words.slice(2).join(' ').replace(/\.$/, '') || null,
    full,
  }
}
