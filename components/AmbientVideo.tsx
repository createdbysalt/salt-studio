'use client'

import {useEffect, useRef} from 'react'

type AmbientVideoProps = {
  src: string
  className?: string
  /** blend mode for dark vs light grounds */
  blend?: 'screen' | 'multiply' | 'normal'
  opacity?: number
}

/** Muted looping ambient background video. Honors prefers-reduced-motion. */
export function AmbientVideo({
  src,
  className = '',
  blend = 'normal',
  opacity = 0.55,
}: AmbientVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) {
      video.pause()
      video.removeAttribute('autoplay')
      return
    }

    video.play().catch(() => {
      /* autoplay blocked */
    })
  }, [src])

  if (!src) return null

  const blendClass =
    blend === 'screen' ? 'mix-blend-screen' : blend === 'multiply' ? 'mix-blend-multiply' : ''

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${blendClass} ${className}`}
      style={{opacity}}
      src={src}
    />
  )
}
