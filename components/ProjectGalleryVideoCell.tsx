'use client'

import {ProjectVideoLightbox, resolveProjectVideoSources} from '@/components/ProjectVideoLightbox'
import {isVimeoUrl, vimeoBackgroundSrc} from '@/lib/vimeo'
import {urlForImage} from '@/sanity/lib/utils'
import {stegaClean} from 'next-sanity'
import {useEffect, useId, useRef, useState} from 'react'

type PosterImage = {
  asset?: {_ref?: string} | null
  alt?: string | null
} | null

type ProjectGalleryVideoCellProps = {
  videoUrl?: string | null
  poster?: PosterImage
  caption?: string | null
  title: string
  aspectClass: string
  /** When false, pause the muted loop (scroll-gallery neighbors). Default true. */
  active?: boolean
}

/** Gallery video cell — muted autoplay loop; click opens the full player. */
export function ProjectGalleryVideoCell({
  videoUrl,
  poster,
  caption,
  title,
  aspectClass,
  active = true,
}: ProjectGalleryVideoCellProps) {
  const dialogId = useId()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [open, setOpen] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const {cleanVideo, mp4Src, hasVideo} = resolveProjectVideoSources(videoUrl)
  const vimeoBg = cleanVideo && isVimeoUrl(cleanVideo) ? vimeoBackgroundSrc(cleanVideo) : null
  const captionText = caption ? stegaClean(caption) : null
  const posterSrc = poster?.asset?._ref
    ? urlForImage({asset: {_ref: poster.asset._ref}})?.width(1600).height(900).fit('crop').url()
    : undefined

  useEffect(() => {
    const video = videoRef.current
    if (!video || !mp4Src) return
    if (active) {
      video.play().catch(() => {
        /* autoplay blocked */
      })
    } else {
      video.pause()
    }
  }, [mp4Src, active])

  if (!hasVideo) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-label={title ? `Open ${title} video` : 'Open video'}
        className={`group relative block w-full overflow-hidden bg-muted text-left ${aspectClass}`}
      >
        {posterSrc ? (
          <img
            src={posterSrc}
            alt=""
            aria-hidden
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              videoReady && active ? 'opacity-0' : 'opacity-100'
            }`}
          />
        ) : null}

        {mp4Src ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onLoadedData={() => setVideoReady(true)}
            className="absolute inset-0 h-full w-full object-cover"
            src={mp4Src}
          />
        ) : vimeoBg && active ? (
          <iframe
            src={vimeoBg}
            title={title || 'Project video'}
            className="pointer-events-none absolute inset-0 h-full w-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : null}

        {captionText ? (
          /* Caption ON media — white over a scrim, deliberately not themed. */
          <span className="absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-black/80 to-transparent p-3 font-mono text-[10px] uppercase tracking-[0.08em] text-white/70">
            {captionText}
          </span>
        ) : null}
      </button>
      <ProjectVideoLightbox
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        videoUrl={videoUrl}
        dialogId={dialogId}
      />
    </>
  )
}
