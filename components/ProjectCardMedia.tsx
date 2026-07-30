'use client'

import {isVimeoUrl, vimeoBackgroundSrc} from '@/lib/vimeo'
import {isYouTubeUrl, youtubeBackgroundSrc} from '@/lib/youtube'
import {urlForImage} from '@/sanity/lib/utils'
import {stegaClean} from 'next-sanity'
import {useEffect, useRef, useState} from 'react'

export type WorkVideoPlayback = 'autoplay' | 'hover'

/** Desktop breakpoint — matches Tailwind `lg`. */
const DESKTOP_MQ = '(min-width: 1024px)'

/** Normalize CMS / stega-encoded workPage.videoPlayback to a playback mode. */
export function resolveWorkVideoPlayback(
  value: WorkVideoPlayback | string | null | undefined,
): WorkVideoPlayback {
  // Default to hover (desktop greyscale→color on hover). Explicit `autoplay`
  // keeps full color at rest on every screen size.
  return stegaClean(value ?? '') === 'autoplay' ? 'autoplay' : 'hover'
}

type ProjectCardMediaProps = {
  title: string | null
  coverImage?: {asset?: {_ref?: string} | null} | null
  videoUrl?: string | null
  /** Pre-resolved poster (Sanity cover or Vimeo oEmbed) from the server. */
  posterUrl?: string | null
  /**
   * From workPage.videoPlayback.
   * `hover` = all cards autoplay; desktop is greyscale until hover (full color).
   * `autoplay` = muted loops in full color on every screen size.
   */
  playback?: WorkVideoPlayback | null
  /** Force-pause (e.g. scroll-gallery neighbor frames). */
  paused?: boolean
}

/**
 * Work-grid card media. Muted looping previews mount near the viewport.
 * In hover mode on desktop, every card plays in greyscale and snaps to
 * full color on hover/focus. Phones and tablets stay full-color autoplay.
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
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(DESKTOP_MQ).matches : true,
  )

  const mode = resolveWorkVideoPlayback(playback)
  // Desktop + hover mode → greyscale at rest, color on pointer/focus.
  const colorOnHover = mode === 'hover' && isDesktop
  const inColor = !colorOnHover || hovered

  const cleanUrl = videoUrl ? stegaClean(videoUrl).trim() || null : null
  const youtubeSrc = cleanUrl && isYouTubeUrl(cleanUrl) ? youtubeBackgroundSrc(cleanUrl) : null
  const vimeoSrc = cleanUrl && isVimeoUrl(cleanUrl) ? vimeoBackgroundSrc(cleanUrl) : null
  const mp4Src = cleanUrl && !isVimeoUrl(cleanUrl) && !isYouTubeUrl(cleanUrl) ? cleanUrl : null

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

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ)
    const sync = () => setIsDesktop(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    playerMountedRef.current = false
    readyRef.current = false
    setNearViewport(false)
    setInViewport(false)
    setHovered(false)
    setVideoReady(false)
  }, [mode])

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

  // Color restore on hover — card shell (link or coming-soon wrapper).
  useEffect(() => {
    if (!colorOnHover) {
      setHovered(false)
      return
    }
    const card = rootRef.current?.closest<HTMLElement>('a[href], [data-work-card]') ?? null
    if (!card) return

    const enter = () => setHovered(true)
    const leave = () => setHovered(false)
    card.addEventListener('pointerenter', enter)
    card.addEventListener('pointerleave', leave)
    card.addEventListener('focusin', enter)
    card.addEventListener('focusout', leave)
    return () => {
      card.removeEventListener('pointerenter', enter)
      card.removeEventListener('pointerleave', leave)
      card.removeEventListener('focusin', enter)
      card.removeEventListener('focusout', leave)
    }
  }, [colorOnHover])

  const mountPlayer = Boolean(cleanUrl) && (playerMountedRef.current || nearViewport)
  const revealVideo = mountPlayer && !paused && (inViewport || readyRef.current)

  const showPoster =
    !readyRef.current &&
    Boolean(coverSrc) &&
    (!playerMountedRef.current || (revealVideo && !videoReady))

  const showVideoLayer = revealVideo || readyRef.current

  useEffect(() => {
    setVideoReady(false)
    readyRef.current = false
  }, [youtubeSrc, vimeoSrc, mp4Src])

  useEffect(() => {
    const el = videoRef.current
    if (!el || !mp4Src) return
    if (revealVideo) {
      el.play().catch(() => {})
      return
    }
    el.pause()
    if (!readyRef.current) {
      el.currentTime = 0
    }
  }, [revealVideo, mp4Src])

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden bg-foreground/6">
      <div
        className={`work-card-media-zoom absolute inset-0 ${
          inColor ? 'grayscale-0' : 'grayscale'
        } transition-[filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[filter] motion-reduce:transition-none motion-reduce:will-change-auto`}
      >
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

        {mountPlayer && youtubeSrc ? (
          <iframe
            src={youtubeSrc}
            title={title ? `${title} preview` : 'Project preview'}
            allow="autoplay; fullscreen; picture-in-picture"
            onLoad={markReady}
            className={`pointer-events-none absolute inset-0 z-0 h-full w-full border-0 ${
              showVideoLayer ? 'opacity-100' : 'opacity-0'
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
              showVideoLayer ? 'opacity-100' : 'opacity-0'
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
              showVideoLayer ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src={mp4Src} type="video/mp4" />
          </video>
        ) : null}
      </div>
    </div>
  )
}
