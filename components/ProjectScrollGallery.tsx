'use client'

import ImageBox from '@/components/ImageBox'
import {prefersReducedMotion} from '@/components/motion/gsap'
import {ProjectCardMedia} from '@/components/ProjectCardMedia'
import {ProjectGalleryVideoCell} from '@/components/ProjectGalleryVideoCell'
import {stegaClean} from 'next-sanity'
import {useEffect, useRef, useState} from 'react'

export type ProjectScrollFrame =
  | {
      key: string
      kind: 'lead'
      title: string
      coverImage?: {asset?: {_ref?: string} | null; alt?: string | null} | null
      videoUrl?: string | null
      posterUrl?: string | null
    }
  | {
      key: string
      kind: 'photo'
      image: {
        asset?: {_ref?: string} | null
        alt?: string | null
        caption?: string | null
        hotspot?: unknown
        crop?: unknown
      }
    }
  | {
      key: string
      kind: 'video'
      title: string
      videoUrl?: string | null
      poster?: {asset?: {_ref?: string} | null; alt?: string | null} | null
      caption?: string | null
    }

/**
 * Glitch&Grit-style vertical media stack: right-edge bleed frames (photo or
 * video) with the in-view item bright and neighbors dimmed. Videos use the
 * same muted autoplay loop as Work cards; only the focused frame plays.
 */
export function ProjectScrollGallery({frames}: {frames: ProjectScrollFrame[]}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)
  const itemRefs = useRef<Array<HTMLElement | null>>([])
  const ratiosRef = useRef<Map<number, number>>(new Map())

  useEffect(() => {
    setReduceMotion(prefersReducedMotion())
  }, [])

  useEffect(() => {
    if (reduceMotion || frames.length === 0) return

    const thresholds = Array.from({length: 21}, (_, i) => i / 20)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.index)
          if (Number.isNaN(index)) continue
          ratiosRef.current.set(index, entry.isIntersecting ? entry.intersectionRatio : 0)
        }

        let bestIndex = 0
        let bestRatio = -1
        ratiosRef.current.forEach((ratio, index) => {
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestIndex = index
          }
        })
        setActiveIndex((prev) => (prev === bestIndex ? prev : bestIndex))
      },
      {
        threshold: thresholds,
        rootMargin: '-18% 0px -42% 0px',
      },
    )

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [frames.length, reduceMotion])

  if (frames.length === 0) return null

  return (
    <div className="flex flex-col gap-0">
      {frames.map((frame, index) => {
        const isActive = reduceMotion || index === activeIndex

        return (
          <figure
            key={frame.key}
            ref={(el) => {
              itemRefs.current[index] = el
            }}
            data-index={index}
            data-media={frame.kind === 'photo' ? 'photo' : 'video'}
            className={`relative m-0 aspect-video w-full overflow-hidden bg-foreground/6 ${
              index > 0 ? '-mt-px' : ''
            }`}
          >
            {/* Keep media at full opacity — dim via scrim only so video decode stays clean. */}
            <div className="absolute inset-0">
              {frame.kind === 'lead' ? (
                <ProjectCardMedia
                  title={frame.title}
                  coverImage={frame.coverImage}
                  videoUrl={frame.videoUrl}
                  posterUrl={frame.posterUrl}
                  playback="autoplay"
                  paused={!isActive}
                />
              ) : null}

              {frame.kind === 'photo' ? (
                <ImageBox
                  image={frame.image as never}
                  alt={(frame.image.alt ? stegaClean(frame.image.alt) : '') || 'Project still'}
                  classesWrapper="absolute inset-0 !rounded-none bg-muted"
                />
              ) : null}

              {frame.kind === 'video' ? (
                <ProjectGalleryVideoCell
                  videoUrl={frame.videoUrl}
                  poster={frame.poster}
                  title={frame.title}
                  aspectClass="absolute inset-0 h-full w-full !aspect-auto"
                  active={isActive}
                />
              ) : null}
            </div>

            <div
              aria-hidden
              className={`pointer-events-none absolute inset-0 z-[2] bg-black transition-opacity duration-500 ease-out ${
                isActive ? 'opacity-0' : 'opacity-45'
              }`}
            />
          </figure>
        )
      })}
    </div>
  )
}
