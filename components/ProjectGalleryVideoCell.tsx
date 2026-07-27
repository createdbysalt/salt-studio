'use client'

import {ProjectVideoLightbox, resolveProjectVideoSources} from '@/components/ProjectVideoLightbox'
import {vimeoBackgroundSrc} from '@/lib/vimeo'
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
}

/** Gallery video cell — muted autoplay loop; click opens the full player. */
export function ProjectGalleryVideoCell({
  videoUrl,
  caption,
  title,
  aspectClass,
}: ProjectGalleryVideoCellProps) {
  const dialogId = useId()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [open, setOpen] = useState(false)
  const {cleanVideo, mp4Src, hasVideo} = resolveProjectVideoSources(videoUrl)
  const vimeoBg = cleanVideo ? vimeoBackgroundSrc(cleanVideo) : null
  const captionText = caption ? stegaClean(caption) : null

  useEffect(() => {
    const video = videoRef.current
    if (!video || !mp4Src) return
    video.play().catch(() => {
      /* autoplay blocked */
    })
  }, [mp4Src])

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
        className={`group relative block w-full overflow-hidden bg-[#1a1a1a] text-left ${aspectClass}`}
      >
        {mp4Src ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
            src={mp4Src}
          />
        ) : vimeoBg ? (
          <iframe
            src={vimeoBg}
            title={title || 'Project video'}
            className="pointer-events-none absolute inset-0 h-full w-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : null}
        {captionText ? (
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/60">
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
