'use client'

import {useEffect, useRef} from 'react'

type LandingReelTileProps = {
  videoUrl?: string | null
  posterUrl?: string | null
  alt?: string
}

/** Muted looping tile. Plays once in view; honors prefers-reduced-motion. */
export function LandingReelTile({videoUrl, posterUrl, alt = ''}: LandingReelTileProps) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      {threshold: 0.25},
    )
    io.observe(video)
    return () => io.disconnect()
  }, [videoUrl])

  const mp4 = videoUrl && /\.(mp4|webm|mov)(\?|$)/i.test(videoUrl) ? videoUrl : null

  if (!mp4) {
    return posterUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={posterUrl} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
    ) : null
  }

  return (
    <video
      ref={ref}
      src={mp4}
      poster={posterUrl ?? undefined}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={alt || undefined}
      className="absolute inset-0 h-full w-full object-cover"
    />
  )
}
