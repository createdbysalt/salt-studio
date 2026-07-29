'use client'

import {resolveProjectVideoSources} from '@/components/ProjectVideoLightbox'
import {isVimeoUrl, vimeoBackgroundSrc} from '@/lib/vimeo'
import {urlForImage} from '@/sanity/lib/utils'
import {useEffect, useRef, useState} from 'react'

type PosterImage = {
  asset?: {_ref?: string} | null
  alt?: string | null
} | null

type ProjectGalleryVideoCellProps = {
  videoUrl?: string | null
  poster?: PosterImage
  title: string
  aspectClass: string
  /** When false, pause the muted loop (scroll-gallery neighbors). Default true. */
  active?: boolean
}

/** Gallery video cell — muted autoplay loop in place (no lightbox, no caption). */
export function ProjectGalleryVideoCell({
  videoUrl,
  poster,
  title,
  aspectClass,
  active = true,
}: ProjectGalleryVideoCellProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)
  const {cleanVideo, mp4Src, hasVideo} = resolveProjectVideoSources(videoUrl)
  const vimeoBg = cleanVideo && isVimeoUrl(cleanVideo) ? vimeoBackgroundSrc(cleanVideo) : null
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
    <div className={`relative overflow-hidden bg-muted ${aspectClass}`}>
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
    </div>
  )
}
