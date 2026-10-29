'use client'

import {isVimeoUrl, vimeoPlayerSrc} from '@/lib/vimeo'
import {isYouTubeUrl, youtubePlayerSrc} from '@/lib/youtube'
import {Play} from 'lucide-react'
import {useState} from 'react'

type LandingHeroVideoProps = {
  videoUrl?: string | null
  posterUrl?: string | null
  posterAlt?: string
  posterTitle?: string
}

/**
 * Click-to-play hero video. Shows the poster with a title and a play button;
 * on tap it swaps to the player in place (MP4 inline, Vimeo/YouTube iframe).
 */
export function LandingHeroVideo({
  videoUrl,
  posterUrl,
  posterAlt = '',
  posterTitle,
}: LandingHeroVideoProps) {
  const [playing, setPlaying] = useState(false)
  const url = videoUrl?.trim() || ''
  const youtube = url && isYouTubeUrl(url) ? youtubePlayerSrc(url) : null
  const vimeo = url && isVimeoUrl(url) ? vimeoPlayerSrc(url) : null
  const mp4 = url && !youtube && !vimeo ? url : null
  const hasVideo = Boolean(youtube || vimeo || mp4)

  if (!hasVideo && !posterUrl) return null

  const frame =
    'relative mx-auto aspect-[4/5] w-full max-w-[560px] overflow-hidden rounded-lg bg-ink md:aspect-[0.87]'

  if (playing && hasVideo) {
    return (
      <div className={frame}>
        {mp4 ? (
          <video
            src={mp4}
            autoPlay
            playsInline
            controls
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <iframe
            src={(youtube ?? vimeo) as string}
            title={posterTitle || 'Video'}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        )}
      </div>
    )
  }

  return (
    <div className={frame}>
      {posterUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterUrl}
          alt={posterAlt}
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
      )}
      {posterTitle && (
        <p className="pointer-events-none absolute inset-x-6 top-[38%] text-center text-[clamp(2.2rem,7vw,4.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.03em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]">
          {posterTitle}
        </p>
      )}
      {hasVideo && (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={posterTitle ? `Play: ${posterTitle}` : 'Play video'}
          className="group absolute inset-0 flex items-center justify-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink/80 text-white ring-1 ring-white/30 transition-transform duration-300 ease-[var(--ease-out-cubic)] group-hover:scale-105 md:h-20 md:w-20">
            <Play aria-hidden className="ml-1 h-7 w-7 fill-current" strokeWidth={0} />
          </span>
        </button>
      )}
    </div>
  )
}
