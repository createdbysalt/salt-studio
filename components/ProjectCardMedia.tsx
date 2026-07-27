'use client'

import {isVimeoUrl, vimeoBackgroundSrc} from '@/lib/vimeo'
import {urlForImage} from '@/sanity/lib/utils'
import {stegaClean} from 'next-sanity'
import {useEffect, useRef, useState} from 'react'

export type WorkVideoPlayback = 'autoplay' | 'hover'

/** Normalize CMS / stega-encoded workPage.videoPlayback to a playback mode. */
export function resolveWorkVideoPlayback(
  value: WorkVideoPlayback | string | null | undefined,
): WorkVideoPlayback {
  return stegaClean(value ?? '') === 'hover' ? 'hover' : 'autoplay'
}

type ProjectCardMediaProps = {
  title: string | null
  coverImage?: {asset?: {_ref?: string} | null} | null
  videoUrl?: string | null
  /** Pre-resolved poster (Sanity cover or Vimeo oEmbed) from the server. */
  posterUrl?: string | null
  /** From workPage.videoPlayback — defaults to autoplay. */
  playback?: WorkVideoPlayback | null
  /** Force-pause (e.g. scroll-gallery neighbor frames). */
  paused?: boolean
}

/**
 * Work-grid card media. Autoplay mode mounts a muted looping preview when the
 * card is near the viewport. Hover mode keeps the poster/still until the card
 * is hovered (or keyboard-focused), then plays.
 */
export function ProjectCardMedia({
  title,
  coverImage,
  videoUrl,
  posterUrl,
  playback = 'autoplay',
  paused = false,
}: ProjectCardMediaProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerMountedRef = useRef(false)
  const readyRef = useRef(false)

  const [nearViewport, setNearViewport] = useState(false)
  const [inViewport, setInViewport] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [videoReady, setVideoReady] = useState(false)

  const mode = resolveWorkVideoPlayback(playback)
  const cleanUrl = videoUrl ? stegaClean(videoUrl).trim() || null : null
  const vimeoSrc = cleanUrl && isVimeoUrl(cleanUrl) ? vimeoBackgroundSrc(cleanUrl) : null
  const mp4Src = cleanUrl && !isVimeoUrl(cleanUrl) ? cleanUrl : null

  const coverSrc =
    posterUrl ||
    (coverImage?.asset?._ref
      ? urlForImage({asset: {_ref: coverImage.asset._ref}})
          ?.width(1600)
          .height(900)
          .fit('crop')
          .url()
      : undefined)

  const markReady = () => {
    if (readyRef.current) return
    readyRef.current = true
    setVideoReady(true)
  }

  // Reset when the CMS mode flips so cards don't inherit stale flags.
  useEffect(() => {
    playerMountedRef.current = false
    readyRef.current = false
    setNearViewport(false)
    setInViewport(false)
    setHovered(false)
    setVideoReady(false)
  }, [mode])

  // Track viewport proximity continuously — mount once near, never tear down.
  useEffect(() => {
    const node = rootRef.current
    if (!node || !cleanUrl) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) {
          playerMountedRef.current = true
          setNearViewport(true)
          setInViewport(true)
          return
        }
        setInViewport(false)
      },
      {rootMargin: '240px 0px', threshold: 0.01},
    )
    observer.observe(node)

    const rect = node.getBoundingClientRect()
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    if (rect.top < viewportHeight + 240 && rect.bottom > -240) {
      playerMountedRef.current = true
      setNearViewport(true)
      setInViewport(true)
    }

    return () => observer.disconnect()
  }, [cleanUrl, mode])

  // Hover mode: listen on the parent card link so the text overlay still counts.
  useEffect(() => {
    if (mode !== 'hover') return
    const card = rootRef.current?.closest('a')
    if (!card) return

    const enter = () => setHovered(true)
    const leave = () => setHovered(false)
    card.addEventListener('pointerenter', enter)
    card.addEventListener('pointerleave', leave)
    card.addEventListener('focusin', enter)
    card.addEventListener('focusout', leave)
    card.addEventListener('touchstart', enter, {passive: true})
    card.addEventListener('touchend', leave, {passive: true})
    card.addEventListener('touchcancel', leave, {passive: true})
    return () => {
      card.removeEventListener('pointerenter', enter)
      card.removeEventListener('pointerleave', leave)
      card.removeEventListener('focusin', enter)
      card.removeEventListener('focusout', leave)
      card.removeEventListener('touchstart', enter)
      card.removeEventListener('touchend', leave)
      card.removeEventListener('touchcancel', leave)
    }
  }, [mode])

  const mountPlayer = Boolean(cleanUrl) && (playerMountedRef.current || nearViewport)
  const revealVideo =
    mountPlayer &&
    !paused &&
    (mode === 'hover' ? hovered : inViewport || readyRef.current)

  // Once a player has booted, never flash the poster again on scroll.
  // After mount starts, only show poster while actively in view and still loading.
  const showPoster =
    !readyRef.current &&
    Boolean(coverSrc) &&
    (!playerMountedRef.current || (revealVideo && !videoReady))

  useEffect(() => {
    setVideoReady(false)
    readyRef.current = false
  }, [vimeoSrc, mp4Src])

  useEffect(() => {
    const el = videoRef.current
    if (!el || !mp4Src) return
    if (revealVideo) {
      el.play().catch(() => {})
    } else if (!readyRef.current) {
      el.pause()
      el.currentTime = 0
    }
  }, [revealVideo, mp4Src])

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden bg-foreground/6">
      <div className="work-card-media-zoom absolute inset-0">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt=""
            decoding="async"
            className={`absolute inset-0 z-[1] h-full w-full object-cover ${
              showPoster ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          />
        ) : null}

        {mountPlayer && vimeoSrc ? (
          <iframe
            src={vimeoSrc}
            title={title ? `${title} preview` : 'Project preview'}
            allow="autoplay; fullscreen; picture-in-picture"
            onLoad={markReady}
            className={`pointer-events-none absolute left-1/2 top-1/2 z-0 h-full min-h-full w-[177.78%] min-w-full -translate-x-1/2 -translate-y-1/2 border-0 ${
              revealVideo || readyRef.current ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : null}

        {mountPlayer && mp4Src ? (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="auto"
            poster={coverSrc || undefined}
            onPlaying={markReady}
            onCanPlay={markReady}
            className={`absolute inset-0 z-0 h-full w-full object-cover ${
              revealVideo || readyRef.current ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src={mp4Src} type="video/mp4" />
          </video>
        ) : null}
      </div>
    </div>
  )
}
