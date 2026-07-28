'use client'

import {ProjectCardMedia} from '@/components/ProjectCardMedia'
import type {WorkProjectCard} from '@/components/ProjectGrid'
import {Draggable, DURATION, EASE, gsap, prefersReducedMotion} from '@/components/motion/gsap'
import {useGSAP} from '@gsap/react'
import {ArrowUpRight} from 'lucide-react'
import Link from 'next/link'
import {useEffect, useMemo, useRef} from 'react'

type HomeProjectSliderProps = {
  projects: WorkProjectCard[]
  /** When false, autoplay is held (e.g. while the hero scrub shrinks the strip). */
  autoplay?: boolean
  /** Hero scrub owns track x — disable drag / normalize so it isn't fought. */
  interactionLock?: boolean
  /** Keep overflow visible (hero edge-bleed). Don't toggle mid-scroll — that jitters. */
  bleed?: boolean
}

const AUTOPLAY_MS = 4200
/** How many copies of the set to render for seamless looping. */
const LOOP_COPIES = 3

/**
 * Showcase strip: equal-size cards, cover image always on, infinite loop via
 * duplicated sets. Autoplay + drag. Project info on hover.
 * Reduced motion → single set, native horizontal scroll.
 */
export function HomeProjectSlider({
  projects,
  autoplay = true,
  interactionLock = false,
  bleed = false,
}: HomeProjectSliderProps) {
  const scope = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const autoplayRef = useRef(autoplay)
  autoplayRef.current = autoplay
  const lockRef = useRef(interactionLock)
  lockRef.current = interactionLock
  const autoplayControls = useRef<{start: () => void; stop: () => void} | null>(null)
  const draggableRef = useRef<Draggable | null>(null)

  const items = useMemo(
    () => projects.filter((p) => p._id && (p.coverImage?.asset?._ref || p.videoUrl)),
    [projects],
  )

  const loopItems = useMemo(() => {
    if (items.length === 0) return []
    return Array.from({length: LOOP_COPIES}, (_, copy) =>
      items.map((project, i) => ({
        project,
        index: i,
        key: `${project._id}-${copy}-${i}`,
      })),
    ).flat()
  }, [items])

  useGSAP(
    () => {
      if (prefersReducedMotion() || !scope.current || !trackRef.current) return
      if (items.length < 1) return

      const track = trackRef.current
      const root = scope.current
      const cards = gsap.utils.toArray<HTMLElement>('[data-slider-card]', track)
      const medias = gsap.utils.toArray<HTMLElement>('[data-slider-media]', track)
      if (!cards.length) return

      const setLen = items.length
      // Start in the middle copy so we can travel either direction.
      let index = setLen
      let dragMoved = false
      let paused = false
      let autoplayTimer: ReturnType<typeof setInterval> | null = null
      let draggable: Draggable | null = null

      const cardStep = () => {
        const first = cards[0]
        const second = cards[1]
        if (!second) return first.offsetWidth
        return second.offsetLeft - first.offsetLeft
      }

      const centerX = (i: number) => {
        const card = cards[i]
        if (!card) return 0
        return window.innerWidth / 2 - (card.offsetLeft + card.offsetWidth / 2)
      }

      /**
       * Silent wrap: shift the track by exactly one set-width so the same
       * project stays centered — never animate back to the start.
       */
      const normalize = () => {
        if (lockRef.current || setLen < 1) return
        const step = cardStep()
        if (!step) return
        const setW = step * setLen

        while (index >= setLen * 2) {
          index -= setLen
          gsap.set(track, {x: `+=${setW}`})
        }
        while (index < setLen) {
          index += setLen
          gsap.set(track, {x: `-=${setW}`})
        }
        draggable?.update()
      }

      /** Step forward/back one card — always adjacent, then silent-wrap. */
      const goBy = (dir: number, duration = 0.65) => {
        if (lockRef.current) return
        if (!dir) {
          gsap.set(track, {x: centerX(index)})
          draggable?.update()
          return
        }

        // Stay inside the duplicated strip for the animated step.
        if (index + dir < 0 || index + dir > cards.length - 1) {
          normalize()
        }

        const next = index + dir
        if (next < 0 || next > cards.length - 1) return

        index = next
        const step = cardStep()
        gsap.to(track, {
          // Move exactly one card-width so the next-in-line centers.
          x: dir > 0 ? `-=${step}` : `+=${step}`,
          duration,
          ease: EASE.outCubic,
          overwrite: true,
          onComplete: () => {
            normalize()
          },
        })
      }

      /** Snap to a concrete card index (drag), then silent-wrap into the middle. */
      const goTo = (next: number, duration = 0.65) => {
        if (lockRef.current) return
        if (next < 0 || next > cards.length - 1) {
          normalize()
          return
        }
        index = next
        gsap.to(track, {
          x: centerX(index),
          duration,
          ease: EASE.outCubic,
          overwrite: true,
          onComplete: () => {
            normalize()
          },
        })
      }

      const stopAutoplay = () => {
        if (autoplayTimer) {
          clearInterval(autoplayTimer)
          autoplayTimer = null
        }
      }

      const startAutoplay = () => {
        stopAutoplay()
        if (paused || !autoplayRef.current || setLen < 2) return
        autoplayTimer = setInterval(() => {
          if (paused || !autoplayRef.current) return
          goBy(1)
        }, AUTOPLAY_MS)
      }

      autoplayControls.current = {start: startAutoplay, stop: stopAutoplay}

      // Intro — equal size, full opacity, cover always visible
      gsap.set(cards, {y: 48, autoAlpha: 0, scale: 1, opacity: 1})
      gsap.set(medias, {clipPath: 'inset(100% 0% 0% 0%)'})
      gsap.set(track, {x: centerX(index)})

      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 90%',
          once: true,
        },
      })
      intro
        .to(cards, {
          y: 0,
          autoAlpha: 1,
          duration: DURATION.reveal,
          ease: EASE.outCubic,
          stagger: 0.05,
        })
        .to(
          medias,
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.9,
            ease: EASE.outQuint,
            stagger: 0.05,
          },
          0.04,
        )
        .add(() => {
          gsap.set(track, {x: centerX(index)})
          draggable?.update()
          startAutoplay()
        })

      draggable = Draggable.create(track, {
        type: 'x',
        inertia: false,
        bounds: undefined,
        zIndexBoost: false,
        // Let vertical page scroll win on touch; only claim clear horizontal drags.
        allowNativeTouchScrolling: true,
        lockAxis: true,
        onPress() {
          if (lockRef.current) return
          dragMoved = false
          paused = true
          stopAutoplay()
          gsap.killTweensOf(track)
        },
        onDrag() {
          if (lockRef.current) return
          if (Math.abs(this.deltaX) > 3) dragMoved = true
        },
        onDragEnd() {
          if (lockRef.current) return
          const x = this.x
          let closest = index
          let closestDist = Infinity
          cards.forEach((card, i) => {
            const cardCenter = x + card.offsetLeft + card.offsetWidth / 2
            const dist = Math.abs(cardCenter - window.innerWidth / 2)
            if (dist < closestDist) {
              closestDist = dist
              closest = i
            }
          })
          const dragged = this.endX - this.startX
          const step = cardStep() || 1
          if (Math.abs(dragged) > step * 0.2) {
            closest = dragged < 0 ? index + 1 : index - 1
          }
          // Prefer a one-step nudge when we're only one off — keeps motion next-in-line.
          if (Math.abs(closest - index) === 1) {
            goBy(closest - index)
          } else {
            goTo(closest)
          }
          paused = false
          startAutoplay()
        },
      })[0]
      draggableRef.current = draggable

      const onClickCapture = (event: MouseEvent) => {
        if (dragMoved) {
          event.preventDefault()
          event.stopPropagation()
          dragMoved = false
        }
      }
      track.addEventListener('click', onClickCapture, true)

      const onPointerEnter = () => {
        paused = true
        stopAutoplay()
      }
      const onPointerLeave = () => {
        paused = false
        startAutoplay()
      }
      root.addEventListener('pointerenter', onPointerEnter)
      root.addEventListener('pointerleave', onPointerLeave)

      const onResize = () => {
        if (lockRef.current) return
        gsap.killTweensOf(track)
        gsap.set(track, {x: centerX(index)})
        normalize()
        draggable?.update()
      }
      window.addEventListener('resize', onResize)

      const onVisibility = () => {
        if (document.hidden) {
          stopAutoplay()
        } else if (!paused) {
          startAutoplay()
        }
      }
      document.addEventListener('visibilitychange', onVisibility)

      return () => {
        stopAutoplay()
        autoplayControls.current = null
        draggableRef.current = null
        draggable.kill()
        track.removeEventListener('click', onClickCapture, true)
        root.removeEventListener('pointerenter', onPointerEnter)
        root.removeEventListener('pointerleave', onPointerLeave)
        window.removeEventListener('resize', onResize)
        document.removeEventListener('visibilitychange', onVisibility)
      }
    },
    {scope, dependencies: [items.length]},
  )

  useEffect(() => {
    if (autoplay) autoplayControls.current?.start()
    else autoplayControls.current?.stop()
  }, [autoplay])

  useEffect(() => {
    const d = draggableRef.current
    if (!d) return
    if (interactionLock) d.disable()
    else d.enable()
  }, [interactionLock])

  if (items.length === 0) return null

  return (
    <div
      ref={scope}
      className={`relative w-full ${bleed ? 'overflow-visible' : 'overflow-hidden'}`}
    >
      <ul
        ref={trackRef}
        data-hero-track
        className="relative flex w-max cursor-grab items-stretch will-change-transform motion-reduce:w-full motion-reduce:cursor-default motion-reduce:overflow-x-auto motion-reduce:px-3 active:cursor-grabbing sm:motion-reduce:px-4"
        aria-label="Selected projects"
      >
        {loopItems.map(({project, index, key}) => (
          <li
            key={key}
            data-slider-card
            className="w-[min(72vw,40rem)] shrink-0 px-1.5 will-change-transform sm:w-[min(58vw,38rem)] sm:px-2 lg:w-[min(48vw,40rem)]"
          >
            <ShowcaseCard project={project} index={index} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function ShowcaseCard({project, index}: {project: WorkProjectCard; index: number}) {
  const comingSoon = Boolean(project.comingSoon)
  const href = project.slug ? `/projects/${project.slug}` : '/work'
  const indexMark = String(index + 1).padStart(2, '0')

  const inner = (
    <div className="relative aspect-[16/9] overflow-hidden bg-foreground/6">
      <div data-slider-media className="absolute inset-0 will-change-transform">
        <ProjectCardMedia
          title={project.title}
          coverImage={project.coverImage}
          posterUrl={project.posterUrl}
          // Cover still only — no video swap so the photo stays put.
          playback="hover"
        />
      </div>

      {!comingSoon ? (
        <ArrowUpRight
          aria-hidden
          size={20}
          strokeWidth={2}
          className="pointer-events-none absolute bottom-3.5 right-3.5 z-[2] origin-bottom-right scale-90 text-white opacity-0 drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)] transition-[opacity,transform] duration-300 ease-out group-hover:scale-125 group-hover:opacity-100 group-focus-visible:scale-125 group-focus-visible:opacity-100"
        />
      ) : null}

      <span className="sr-only">
        {indexMark} {project.title}
        {project.client ? `, ${project.client}` : ''}
        {project.year ? ` · ${project.year}` : ''}
      </span>
    </div>
  )

  if (comingSoon) {
    return <div className="group block cursor-default">{inner}</div>
  }

  return (
    <Link href={href} className="group block" draggable={false}>
      {inner}
    </Link>
  )
}
