'use client'

import {EASE, gsap} from '@/components/motion/gsap'
import {isVimeoUrl, vimeoBackgroundSrc} from '@/lib/vimeo'
import {isYouTubeUrl, youtubeBackgroundSrc} from '@/lib/youtube'
import {ArrowLeft, ArrowRight} from 'lucide-react'
import Image from 'next/image'
import {useEffect, useRef, useState} from 'react'

export type ProposalProofProject = {
  key: string
  title: string
  note: string
  imageUrl?: string
  videoUrl?: string
}

/**
 * Gray sheet. The line sits above a slider. Each card is a 16:9 picture
 * or video, then the project name and one paragraph. Cards do not link out.
 */
export function ProposalProof({
  eyebrow,
  line,
  attribution,
  projects,
}: {
  eyebrow: string
  line: string
  attribution: string
  projects: ProposalProofProject[]
}) {
  return (
    <section className="flex min-h-[85dvh] w-full flex-col justify-center px-[max(3.5rem,var(--spacing-gutter))] py-10 md:min-h-[88dvh] md:px-[max(4.5rem,var(--spacing-gutter))] md:py-16 lg:min-h-dvh lg:py-32">
      <header>
        <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
          {eyebrow}
        </p>
        {line ? (
          <h2 className="mt-3 max-w-[9em] text-[clamp(2.5rem,6.4vw,6rem)] font-normal leading-[0.95] tracking-[-0.05em]">
            {line}
          </h2>
        ) : null}
        {attribution ? (
          <p className="mt-4 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
            {attribution}
          </p>
        ) : null}
      </header>
      {projects.length > 0 ? (
        <div className="mt-6">
          <ProjectSlider projects={projects} />
        </div>
      ) : null}
    </section>
  )
}

function ProjectSlider({projects}: {projects: ProposalProofProject[]}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [reduce, setReduce] = useState(false)
  const count = projects.length

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduce(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const moving = useRef(false)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || count === 0) return

    let frame = 0
    const paint = () => {
      if (moving.current) return
      const slides = scroller.querySelectorAll<HTMLElement>('[data-proof-slide]')
      const pad = Number.parseFloat(getComputedStyle(scroller).paddingLeft) || 0
      const origin = scroller.getBoundingClientRect().left + pad
      let closest = 0
      let best = Number.POSITIVE_INFINITY
      slides.forEach((slide, slideIndex) => {
        const delta = Math.abs(slide.getBoundingClientRect().left - origin)
        if (delta < best) {
          best = delta
          closest = slideIndex
        }
      })
      setIndex((previous) => (previous === closest ? previous : closest))
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(paint)
    }

    const release = () => {
      moving.current = false
      gsap.killTweensOf(scroller)
      scroller.style.scrollSnapType = ''
    }

    paint()
    scroller.addEventListener('scroll', onScroll, {passive: true})
    scroller.addEventListener('pointerdown', release)
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      release()
      scroller.removeEventListener('scroll', onScroll)
      scroller.removeEventListener('pointerdown', release)
      window.removeEventListener('resize', onScroll)
    }
  }, [count])

  const go = (next: number) => {
    const scroller = scrollerRef.current
    const slides = scroller?.querySelectorAll<HTMLElement>('[data-proof-slide]')
    const clamped = Math.max(0, Math.min(count - 1, next))
    const slide = slides?.[clamped]
    const first = slides?.[0]
    if (!scroller || !slide || !first || clamped === index) return
    const left = slide.offsetLeft - first.offsetLeft
    setIndex(clamped)
    if (reduce) {
      scroller.scrollLeft = left
      return
    }
    moving.current = true
    scroller.style.scrollSnapType = 'none'
    gsap.to(scroller, {
      scrollLeft: left,
      duration: 0.55,
      ease: EASE.outCubic,
      overwrite: true,
      onComplete: () => {
        moving.current = false
        scroller.style.scrollSnapType = ''
      },
    })
  }

  return (
    <div>
      <div className="-mx-[max(3.5rem,var(--spacing-gutter))] w-[100vw] md:-mx-[max(4.5rem,var(--spacing-gutter))]">
        <div
          ref={scrollerRef}
          aria-label="Projects"
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pl-[max(3.5rem,var(--spacing-gutter))] scroll-pl-[max(3.5rem,var(--spacing-gutter))] [scrollbar-width:none] md:pl-[max(4.5rem,var(--spacing-gutter))] md:scroll-pl-[max(4.5rem,var(--spacing-gutter))] [&::-webkit-scrollbar]:hidden"
        >
          {projects.map((project, projectIndex) => (
            <div
              key={project.key}
              data-proof-slide
              className="w-[min(40rem,calc(100vw-max(3.5rem,var(--spacing-gutter))-3.5rem))] shrink-0 snap-start md:w-[min(40rem,calc(100vw-max(4.5rem,var(--spacing-gutter))-4.5rem))]"
            >
              <ProjectCard project={project} playing={projectIndex === index} />
            </div>
          ))}
        </div>
      </div>
      {count > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {projects.map((project, projectIndex) => {
              const selected = projectIndex === index
              return (
                <button
                  key={project.key}
                  type="button"
                  aria-label={project.title}
                  aria-current={selected ? 'true' : undefined}
                  onClick={() => go(projectIndex)}
                  className={`h-1.5 cursor-pointer rounded-full ${
                    selected ? 'w-4 bg-ink' : 'w-1.5 bg-black/25'
                  }`}
                />
              )
            })}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous project"
              disabled={index === 0}
              onClick={() => go(index - 1)}
              className="cursor-pointer text-ink disabled:cursor-default disabled:text-black/25"
            >
              <ArrowLeft aria-hidden className="size-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Next project"
              disabled={index === count - 1}
              onClick={() => go(index + 1)}
              className="cursor-pointer text-ink disabled:cursor-default disabled:text-black/25"
            >
              <ArrowRight aria-hidden className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ProjectCard({project, playing}: {project: ProposalProofProject; playing: boolean}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[32px] bg-[#e6e6e6]">
      <div className="px-3 pt-3">
        <ProofMedia imageUrl={project.imageUrl} videoUrl={project.videoUrl} playing={playing} />
      </div>
      <div className="flex flex-col px-5 pb-5 pt-4 md:px-6 md:pb-6 md:pt-5">
        <h3 className="text-[1.5rem] font-medium leading-snug tracking-[-0.03em]">
          {project.title}
        </h3>
        {project.note ? (
          <p className="mt-2 text-[1.125rem] font-medium leading-snug tracking-[-0.02em] text-[#5c5c5c]">
            {project.note}
          </p>
        ) : null}
      </div>
    </article>
  )
}

function ProofMedia({
  imageUrl,
  videoUrl,
  playing,
}: {
  imageUrl?: string
  videoUrl?: string
  playing: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const clean = videoUrl?.trim() || ''
  const vimeoSrc = clean && isVimeoUrl(clean) ? vimeoBackgroundSrc(clean) : null
  const youtubeSrc = clean && isYouTubeUrl(clean) ? youtubeBackgroundSrc(clean) : null
  const mp4Src = clean && !vimeoSrc && !youtubeSrc ? clean : null
  const frameSrc = vimeoSrc || youtubeSrc

  useEffect(() => {
    const video = videoRef.current
    if (!video || !mp4Src) return
    if (playing) {
      void video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [mp4Src, playing])

  return (
    <div className="relative aspect-video shrink-0 overflow-hidden rounded-[20px] bg-[#d5d5d5] shadow-[0_1px_2px_rgba(8,9,10,0.08),0_8px_20px_rgba(8,9,10,0.1)]">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="(min-width: 768px) 640px, 85vw"
          className="object-cover"
        />
      ) : null}
      {playing && frameSrc ? (
        <iframe
          title=""
          src={frameSrc}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          tabIndex={-1}
        />
      ) : null}
      {mp4Src ? (
        <video
          ref={videoRef}
          src={mp4Src}
          poster={imageUrl}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : null}
    </div>
  )
}
