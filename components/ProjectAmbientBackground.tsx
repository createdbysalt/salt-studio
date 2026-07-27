'use client'

import {useEffect, useRef} from 'react'

type ProjectAmbientBackgroundProps = {
  src: string
}

/** Muted looping motion — fills the case-study band, 50% opacity. */
export function ProjectAmbientBackground({src}: ProjectAmbientBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.play().catch(() => {
      /* autoplay blocked */
    })
  }, [src])

  return (
    <div
      className="pointer-events-none absolute inset-0 col-start-1 row-start-1 h-full w-full overflow-hidden"
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute left-1/2 top-1/2 h-auto min-h-full w-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover opacity-50 mix-blend-screen"
        src={src}
      />
    </div>
  )
}
