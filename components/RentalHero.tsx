'use client'

import {CapReveal} from '@/components/CapabilitiesMotion'
import {resolveStudioImageSrc, type StudioSanityImage} from '@/components/StudioMedia'
import {StudioLine} from '@/components/StudioMotion'
import {motion, useReducedMotion} from 'motion/react'
import {stegaClean} from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import {useEffect, useRef, useState} from 'react'

export type RentalHeroCta = {
  label: string
  href: string
}

type RentalHeroProps = {
  headline?: string | null
  eyebrow?: string | null
  supportLine?: string | null
  /** Full-bleed still — used alone, or as poster under a video. */
  heroImage?: StudioSanityImage
  /** Optional muted MP4 loop. When set, video is the hero; image is the poster. */
  heroVideoUrl?: string | null
  /** Prefer this when the hero needs one or more actions (e.g. gear PDF downloads). */
  ctas?: RentalHeroCta[] | null
  /** Single CTA — used when `ctas` is empty. */
  ctaLabel?: string | null
  ctaHref?: string | null
}

const EASE = [0.22, 1, 0.36, 1] as const

const HERO_CTA_CLASS =
  'group inline-flex min-h-11 items-center justify-center gap-2 border border-black/40 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-black transition-colors duration-300 hover:border-black hover:bg-black hover:text-white'

function stripTrailingArrow(label: string) {
  return label.replace(/\s*→\s*$/, '').trim()
}

/**
 * Rental hero — full-bleed photo or muted video loop, mono type lower-left, CTA lower-right.
 * All visitor-facing copy/media come from props (Sanity). No hardcoded page content.
 */
export function RentalHero({
  headline,
  eyebrow,
  supportLine,
  heroImage,
  heroVideoUrl,
  ctas,
  ctaLabel,
  ctaHref,
}: RentalHeroProps) {
  const imageSrc = resolveStudioImageSrc(heroImage, '', 2400, 1600) || null
  const alt = heroImage?.alt?.trim() || ''
  const videoSrc = heroVideoUrl ? stegaClean(heroVideoUrl).trim() || null : null
  const {display, rest} = parseHeadline(headline)
  const actions: RentalHeroCta[] =
    ctas && ctas.length > 0
      ? ctas
          .map((cta) => ({
            label: stripTrailingArrow(cta.label),
            href: cta.href.trim(),
          }))
          .filter((cta) => cta.label && cta.href)
      : ctaLabel?.trim()
        ? [{label: stripTrailingArrow(ctaLabel), href: ctaHref?.trim() || '/contact'}]
        : []
  const reduce = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mountVideo, setMountVideo] = useState(false)

  const useVideo = Boolean(videoSrc) && !reduce
  const showStill = Boolean(imageSrc)

  useEffect(() => {
    if (!useVideo) return
    const id = window.requestAnimationFrame(() => setMountVideo(true))
    return () => window.cancelAnimationFrame(id)
  }, [useVideo])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoSrc || !mountVideo) return
    video.play().catch(() => {
      /* autoplay blocked */
    })
  }, [videoSrc, mountVideo])

  const showVideo = useVideo && mountVideo

  return (
    <header className="relative isolate h-[100svh] max-h-[100svh] overflow-hidden bg-black">
      {showStill ? (
        reduce ? (
          <Image
            src={imageSrc!}
            alt={alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : (
          <motion.div
            className="absolute inset-0"
            initial={{scale: 1.06, opacity: 0.85}}
            animate={{scale: 1, opacity: 1}}
            transition={{duration: 1.35, ease: EASE}}
          >
            <Image
              src={imageSrc!}
              alt={alt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        )
      ) : null}

      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover"
        >
          <source src={videoSrc!} type="video/mp4" />
        </video>
      ) : null}

      <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-10 pt-[calc(var(--project-nav-height)+2rem)] sm:pb-14 md:px-6 md:pb-16 lg:pb-20">
        <div className="flex flex-col gap-7 sm:gap-8 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="min-w-0">
            {eyebrow?.trim() ? (
              <CapReveal immediate delay={0.08} y={8}>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-black/50 sm:text-[11px]">
                  {eyebrow}
                </p>
              </CapReveal>
            ) : null}

            {display ? (
              <h1 className="m-0 max-w-[14ch] font-mono text-[clamp(2.25rem,8vw,5rem)] font-medium leading-[0.92] tracking-tight text-black sm:max-w-[16ch]">
                <StudioLine immediate delay={0.12}>
                  {display}
                </StudioLine>
                {rest ? (
                  <StudioLine immediate delay={0.22}>
                    {rest}
                  </StudioLine>
                ) : null}
              </h1>
            ) : null}

            {supportLine?.trim() ? (
              <CapReveal immediate delay={0.34} y={10}>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-black/65 sm:mt-6 md:text-base">
                  {supportLine}
                </p>
              </CapReveal>
            ) : null}
          </div>

          {actions.length > 0 ? (
            <CapReveal
              immediate
              delay={supportLine?.trim() ? 0.42 : 0.34}
              y={10}
              className="flex shrink-0 flex-col items-stretch gap-3 self-end sm:items-end md:self-auto"
            >
              {actions.map((action) => (
                <Link
                  key={`${action.href}-${action.label}`}
                  href={action.href}
                  className={HERO_CTA_CLASS}
                >
                  <span>{action.label}</span>
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              ))}
            </CapReveal>
          ) : null}
        </div>
      </div>
    </header>
  )
}

function parseHeadline(headline?: string | null) {
  const full = headline?.trim()
  if (!full) return {display: null as string | null, rest: null as string | null}
  const cleaned = full.replace(/\.$/, '')
  if (cleaned.length <= 18) {
    return {display: `${cleaned}.`, rest: null as string | null}
  }
  const words = cleaned.split(/\s+/)
  if (words.length <= 2) {
    return {display: `${cleaned}.`, rest: null}
  }
  return {
    display: words.slice(0, 2).join(' '),
    rest: `${words.slice(2).join(' ')}.`,
  }
}
