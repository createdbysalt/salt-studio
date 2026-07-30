'use client'

import {isVimeoUrl, vimeoPlayerSrc} from '@/lib/vimeo'
import {isYouTubeUrl, youtubePlayerSrc} from '@/lib/youtube'
import {X} from 'lucide-react'
import {stegaClean} from 'next-sanity'
import {useCallback, useEffect, useId, useState} from 'react'
import {createPortal} from 'react-dom'

type ProjectVideoLightboxProps = {
  open: boolean
  onClose: () => void
  title: string
  videoUrl?: string | null
  videoFileUrl?: string | null
  dialogId?: string
}

export function resolveProjectVideoSources(videoUrl?: string | null, videoFileUrl?: string | null) {
  const cleanFile = videoFileUrl ? stegaClean(videoFileUrl).trim() || null : null
  const cleanVideo = videoUrl ? stegaClean(videoUrl).trim() || null : null
  const youtubePlayer = cleanVideo && isYouTubeUrl(cleanVideo) ? youtubePlayerSrc(cleanVideo) : null
  const vimeoPlayer = cleanVideo && isVimeoUrl(cleanVideo) ? vimeoPlayerSrc(cleanVideo) : null
  const mp4Src =
    cleanFile ||
    (cleanVideo && !isVimeoUrl(cleanVideo) && !isYouTubeUrl(cleanVideo) ? cleanVideo : null)
  return {
    cleanVideo,
    cleanFile,
    youtubePlayer,
    vimeoPlayer,
    mp4Src,
    hasVideo: Boolean(youtubePlayer || vimeoPlayer || mp4Src),
  }
}

/** Full-screen project film player — same popout as the hero. */
export function ProjectVideoLightbox({
  open,
  onClose,
  title,
  videoUrl,
  videoFileUrl,
  dialogId: dialogIdProp,
}: ProjectVideoLightboxProps) {
  const generatedId = useId()
  const dialogId = dialogIdProp ?? generatedId
  const [mounted, setMounted] = useState(false)
  const {youtubePlayer, vimeoPlayer, mp4Src, hasVideo} = resolveProjectVideoSources(
    videoUrl,
    videoFileUrl,
  )

  const closePlayer = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePlayer()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, closePlayer])

  if (!mounted || !open || !hasVideo) return null

  // Portal to body so parent stacking contexts (e.g. project page) can't leave
  // the site nav above the overlay.
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0a0a0a]/92 p-5 backdrop-blur-md backdrop-saturate-0 md:p-10"
      onClick={closePlayer}
      role="presentation"
    >
      <div
        id={dialogId}
        role="dialog"
        aria-modal="true"
        aria-label={title ? `Watch ${title}` : 'Watch project video'}
        className="relative w-full max-w-5xl overflow-hidden rounded-lg border border-white/20 bg-ink shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative flex min-h-[3rem] items-center justify-end border-b border-white/10 px-4 py-3 md:min-h-[3.25rem] md:px-5">
          <p className="absolute left-4 top-1/2 max-w-[calc(100%-6rem)] -translate-y-1/2 font-mono text-[10px] uppercase leading-none tracking-[0.08em] text-white/55 md:left-5">
            {title}
          </p>
          <button
            type="button"
            onClick={closePlayer}
            aria-label="Close"
            className="inline-flex items-center gap-2 p-1 font-mono text-[10px] uppercase tracking-[0.08em] text-white/70 transition-colors hover:text-white"
          >
            Close
            <X className="h-3 w-3 shrink-0" strokeWidth={1.25} aria-hidden="true" />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black">
          {youtubePlayer ? (
            <iframe
              src={youtubePlayer}
              title={title ? `${title} — full player` : 'Project video'}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : vimeoPlayer ? (
            <iframe
              src={vimeoPlayer}
              title={title ? `${title} — full player` : 'Project video'}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : mp4Src ? (
            <video controls autoPlay playsInline className="absolute inset-0 h-full w-full">
              <source src={mp4Src} type="video/mp4" />
            </video>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}
