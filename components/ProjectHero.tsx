'use client'

import ImageBox from '@/components/ImageBox'
import {ProjectVideoLightbox, resolveProjectVideoSources} from '@/components/ProjectVideoLightbox'
import {isVimeoUrl, vimeoBackgroundSrc} from '@/lib/vimeo'
import {Maximize2} from 'lucide-react'
import {stegaClean} from 'next-sanity'
import {useCallback, useEffect, useId, useState, type ReactNode} from 'react'

type ProjectHeroProps = {
  title: string
  isCaseStudy: boolean
  videoUrl?: string | null
  coverImage?: {asset?: {_ref?: string} | null; alt?: string | null} | null
  posterUrl?: string | null
  coverDataSanity?: string
  titleDataSanity?: string
  meta?: ReactNode
}

/* On-media label — stays white on purpose: this text sits on photo/video, not the page stage. */
const LABEL = 'font-mono text-[11px] uppercase tracking-[0.08em] text-white/50'

export function ProjectHero({
  title,
  isCaseStudy,
  videoUrl,
  coverImage,
  posterUrl,
  coverDataSanity,
  titleDataSanity,
  meta,
}: ProjectHeroProps) {
  const dialogId = useId()
  const [playerOpen, setPlayerOpen] = useState(false)
  const [mountVideo, setMountVideo] = useState(false)

  const cleanVideo = videoUrl ? stegaClean(videoUrl).trim() || null : null
  const vimeoBg = cleanVideo && isVimeoUrl(cleanVideo) ? vimeoBackgroundSrc(cleanVideo) : null
  const {mp4Src, hasVideo} = resolveProjectVideoSources(videoUrl)
  const hasCover = Boolean(coverImage?.asset?._ref)
  const hasHeroMedia = hasVideo || hasCover

  const closePlayer = useCallback(() => setPlayerOpen(false), [])
  const openPlayer = useCallback(() => {
    if (hasVideo) setPlayerOpen(true)
  }, [hasVideo])

  // Defer background video so cover + page chrome paint first.
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setMountVideo(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  if (!hasHeroMedia) return null

  const typeMarker = (
    <p className={LABEL}>
      <span className={isCaseStudy ? 'text-white/70' : 'text-white/50'}>
        {isCaseStudy ? '// Case study' : '// Project'}
      </span>
    </p>
  )

  const titleBlock = (
    <h1
      data-sanity={titleDataSanity}
      className="mt-3 max-w-4xl font-sans text-4xl font-bold uppercase leading-[1.02] tracking-tight text-white md:mt-4 md:text-6xl"
    >
      {title}
    </h1>
  )

  const mediaLayer = (
    <>
      {hasCover ? (
        <ImageBox
          data-sanity={coverDataSanity}
          image={coverImage as never}
          alt={stegaClean(coverImage?.alt) || `${title} — cover`}
          classesWrapper="absolute inset-0 rounded-none bg-ink"
          priority
        />
      ) : posterUrl ? (
        <img src={posterUrl} alt="" className="absolute inset-0 z-0 h-full w-full object-cover" />
      ) : null}

      {mountVideo && vimeoBg ? (
        <iframe
          src={vimeoBg}
          title={title ? `${title} preview` : 'Project preview'}
          allow="autoplay; fullscreen; picture-in-picture"
          className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[100svh] w-screen min-h-[56.25vw] min-w-[177.78svh] -translate-x-1/2 -translate-y-1/2 border-0"
        />
      ) : null}

      {mountVideo && mp4Src ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover"
        >
          <source src={mp4Src} type="video/mp4" />
        </video>
      ) : null}
    </>
  )

  const heroContent = (
    <div className="pointer-events-auto px-5 text-left md:px-6">
      {typeMarker}
      {titleBlock}
      {meta}
    </div>
  )

  const heroShell = hasVideo ? (
    <div className="project-hero-shell group relative h-full max-h-full w-full overflow-hidden">
      <button
        type="button"
        onClick={openPlayer}
        aria-haspopup="dialog"
        aria-expanded={playerOpen}
        aria-controls={dialogId}
        aria-label={title ? `Watch ${title}` : 'Watch project video'}
        className="absolute inset-0 z-[1] block h-full w-full overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden">{mediaLayer}</div>
        <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/35" />
      </button>
      {/* Legibility scrim over media — the page below is paper, so this ends on solid ink for a clean band edge. */}
      <div
        className="pointer-events-none absolute inset-0 z-[4]"
        style={{
          background:
            'linear-gradient(to bottom, transparent 55%, rgba(8,9,10,0.35) 78%, rgba(8,9,10,0.75) 92%, #08090a 100%)',
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 z-[5] pb-8 md:pb-10">{heroContent}</div>
      <span
        aria-hidden="true"
        className={`project-hero-expand-icon pointer-events-none absolute right-5 z-[6] inline-flex items-center justify-center p-1 text-white/35 group-hover:text-white/75 group-focus-visible:text-white/75 md:right-6 ${
          meta ? 'bottom-[8.75rem] md:bottom-[9.25rem]' : 'bottom-5 md:bottom-6'
        }`}
      >
        <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.25} />
      </span>
    </div>
  ) : (
    <div className="project-hero-shell relative h-full max-h-full w-full overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">{mediaLayer}</div>
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            'linear-gradient(to bottom, transparent 55%, rgba(8,9,10,0.35) 78%, rgba(8,9,10,0.75) 92%, #08090a 100%)',
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 z-[3] pb-8 md:pb-10">{heroContent}</div>
    </div>
  )

  return (
    <>
      <header
        aria-label="Project hero"
        className="project-hero-header relative h-[100svh] max-h-[100svh] w-full overflow-hidden"
      >
        {heroShell}
      </header>

      <ProjectVideoLightbox
        open={playerOpen}
        onClose={closePlayer}
        title={title}
        videoUrl={videoUrl}
        dialogId={dialogId}
      />
    </>
  )
}
