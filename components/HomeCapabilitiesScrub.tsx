'use client'

import {gsap, prefersReducedMotion, ScrollTrigger} from '@/components/motion/gsap'
import {useGSAP} from '@gsap/react'
import {useRef} from 'react'

export type CapabilityScrubItem = {
  _id: string
  name: string
}

type HomeCapabilitiesScrubProps = {
  items: CapabilityScrubItem[]
  label?: string | null
}

type Rect = {x: number; y: number; w: number; h: number}
type Rest = {x: number; y: number; rotation: number}

function overlapRatio(a: Rect, b: Rect) {
  const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
  const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
  if (ox <= 0 || oy <= 0) return 0
  return (ox * oy) / Math.min(a.w * a.h, b.w * b.h)
}

/**
 * Capability pills fall into a bucket (bottom first). Scroll back up and they
 * soft-suck out the top (pile top first), then drop again on re-entry.
 */
export function HomeCapabilitiesScrub({items, label}: HomeCapabilitiesScrubProps) {
  const frameRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLUListElement>(null)

  useGSAP(
    () => {
      const frame = frameRef.current
      const stage = stageRef.current
      if (!frame || !stage || items.length === 0) return

      const pills = gsap.utils.toArray<HTMLElement>('[data-cap-pill]', stage)
      if (!pills.length) return

      const labelEl = frame.querySelector<HTMLElement>('[data-cap-label]')
      const frameW = frame.clientWidth
      const gutter = Math.max(14, Math.min(40, frameW * 0.032))
      const topPad = (labelEl?.offsetHeight ?? 0) + 16
      const stageTop = stage.offsetTop
      const maxOverlap = 0.28

      gsap.set(pills, {
        position: 'absolute',
        left: 0,
        top: 0,
        opacity: 0,
        visibility: 'hidden',
        transformOrigin: '50% 50%',
      })

      const avgH = pills.reduce((sum, p) => sum + p.offsetHeight, 0) / pills.length || 40
      const approxPerRow = Math.max(3, Math.floor(frameW / 175))
      let stageH =
        topPad + Math.ceil(pills.length / approxPerRow) * (avgH + 14) * 1.15 + gutter + 48
      gsap.set(stage, {height: stageH})

      const measure = (pill: HTMLElement): Rect => {
        const pr = pill.getBoundingClientRect()
        const sr = stage.getBoundingClientRect()
        return {
          x: pr.left - sr.left,
          y: pr.top - sr.top,
          w: pr.width,
          h: pr.height,
        }
      }

      const placed: Rect[] = []
      const rests: Rest[] = new Array(pills.length)
      const order = gsap.utils.shuffle(pills.map((_, i) => i))

      order.forEach((index) => {
        const pill = pills[index]
        const w = pill.offsetWidth
        const h = pill.offsetHeight
        let found = false

        for (let attempt = 0; attempt < 100; attempt++) {
          const floor = stageH - gutter - h
          const lift =
            Math.pow(Math.random(), 2.1) * Math.min(stageH - topPad - h - gutter, avgH * 4.5)
          const x = gsap.utils.random(gutter * 0.4, Math.max(gutter, frameW - gutter - w))
          const y = Math.max(topPad, floor - lift)
          const rotation = gsap.utils.random(-11, 11)

          gsap.set(pill, {x, y, rotation, opacity: 0, visibility: 'hidden'})
          const bounds = measure(pill)
          if (placed.some((p) => overlapRatio(bounds, p) > maxOverlap)) continue

          placed.push(bounds)
          rests[index] = {x, y, rotation}
          stageH = Math.max(stageH, bounds.y + bounds.h + gutter)
          gsap.set(stage, {height: stageH})
          found = true
          break
        }

        if (!found) {
          const h = pill.offsetHeight
          const w = pill.offsetWidth
          const x = gsap.utils.random(gutter * 0.4, Math.max(gutter, frameW - gutter - w))
          const y = stageH - gutter + 4
          const rotation = gsap.utils.random(-8, 8)
          gsap.set(stage, {height: y + h + gutter + 24})
          gsap.set(pill, {x, y, rotation, opacity: 0, visibility: 'hidden'})
          const bounds = measure(pill)
          placed.push(bounds)
          rests[index] = {x, y, rotation}
          stageH = bounds.y + bounds.h + gutter
          gsap.set(stage, {height: stageH})
        }
      })

      const contentBottom = Math.max(...placed.map((p) => p.y + p.h), topPad)
      stageH = contentBottom + gutter
      gsap.set(stage, {height: stageH})

      const parkY = (pill: HTMLElement) =>
        -(stageTop + (pill.offsetHeight || 40) + gsap.utils.random(48, 160))

      const park = (pill: HTMLElement, rest: Rest) => {
        gsap.set(pill, {
          x: rest.x + gsap.utils.random(-40, 40),
          y: parkY(pill),
          rotation: gsap.utils.random(-24, 24),
          opacity: 0,
          visibility: 'hidden',
          scale: 1,
        })
      }

      pills.forEach((pill, i) => {
        const rest = rests[i]
        if (rest) park(pill, rest)
      })

      if (prefersReducedMotion()) {
        pills.forEach((pill, i) => {
          const rest = rests[i]
          if (!rest) return
          gsap.set(pill, {
            x: rest.x,
            y: rest.y,
            rotation: rest.rotation,
            opacity: 1,
            visibility: 'visible',
          })
        })
        return
      }

      type Pose = {
        home: Rest
        avoidX: number
        avoidY: number
        breathX: number
        breathY: number
        breathRot: number
        scrollX: number
        scrollY: number
      }

      const poses: Pose[] = rests.map((home) => ({
        home: {...home},
        avoidX: 0,
        avoidY: 0,
        breathX: 0,
        breathY: 0,
        breathRot: 0,
        scrollX: 0,
        scrollY: 0,
      }))

      type BucketState = 'parked' | 'animating' | 'settled'
      let bucketState: BucketState = 'parked'
      let dropTl: gsap.core.Timeline | null = null
      let suckTl: gsap.core.Timeline | null = null
      let ambientScroll: ScrollTrigger | null = null
      const breathTweens: gsap.core.Tween[] = []
      const cleanups: Array<() => void> = []

      let pointerBound = false
      let moveRaf = 0
      let pendingMouse: {x: number; y: number} | null = null

      const paint = (index: number) => {
        const pose = poses[index]
        const pill = pills[index]
        if (!pose || !pill) return
        gsap.set(pill, {
          x: pose.home.x + pose.avoidX + pose.breathX + pose.scrollX,
          y: pose.home.y + pose.avoidY + pose.breathY + pose.scrollY,
          rotation: pose.home.rotation + pose.breathRot,
        })
      }

      const easeAvoid = (index: number, avoidX: number, avoidY: number, duration: number) => {
        const pose = poses[index]
        if (!pose) return
        gsap.to(pose, {
          avoidX,
          avoidY,
          duration,
          ease: 'power2.out',
          overwrite: 'auto',
          onUpdate: () => paint(index),
        })
      }

      const avoidMouse = (mx: number, my: number) => {
        if (bucketState !== 'settled') return
        poses.forEach((pose, i) => {
          const pill = pills[i]
          if (!pill) return
          const cx = pose.home.x + pill.offsetWidth / 2
          const cy = pose.home.y + pill.offsetHeight / 2
          const dx = cx - mx
          const dy = cy - my
          const dist = Math.hypot(dx, dy) || 0.01
          const radius = 110
          if (dist < radius) {
            const force = Math.pow(1 - dist / radius, 1.35) * 34
            easeAvoid(i, (dx / dist) * force, (dy / dist) * force, 0.65)
          } else {
            easeAvoid(i, 0, 0, 0.85)
          }
        })
      }

      const onPointerMove = (event: PointerEvent) => {
        const rect = stage.getBoundingClientRect()
        pendingMouse = {x: event.clientX - rect.left, y: event.clientY - rect.top}
        if (!moveRaf) {
          moveRaf = requestAnimationFrame(() => {
            moveRaf = 0
            if (!pendingMouse) return
            avoidMouse(pendingMouse.x, pendingMouse.y)
            pendingMouse = null
          })
        }
      }

      const onPointerLeave = () => {
        pendingMouse = null
        if (moveRaf) cancelAnimationFrame(moveRaf)
        moveRaf = 0
        if (bucketState === 'settled') {
          poses.forEach((_, i) => easeAvoid(i, 0, 0, 1))
        }
      }

      const bindPointer = () => {
        if (pointerBound) return
        pointerBound = true
        stage.addEventListener('pointermove', onPointerMove)
        stage.addEventListener('pointerleave', onPointerLeave)
      }

      const unbindPointer = () => {
        if (!pointerBound) return
        pointerBound = false
        stage.removeEventListener('pointermove', onPointerMove)
        stage.removeEventListener('pointerleave', onPointerLeave)
        pendingMouse = null
        if (moveRaf) cancelAnimationFrame(moveRaf)
        moveRaf = 0
      }

      const stopAmbient = () => {
        breathTweens.forEach((t) => t.kill())
        breathTweens.length = 0
        ambientScroll?.kill()
        ambientScroll = null
        poses.forEach((pose) => {
          gsap.killTweensOf(pose)
          pose.avoidX = 0
          pose.avoidY = 0
          pose.breathX = 0
          pose.breathY = 0
          pose.breathRot = 0
          pose.scrollX = 0
          pose.scrollY = 0
        })
      }

      const startAmbient = () => {
        stopAmbient()
        poses.forEach((pose, i) => {
          const ampX = gsap.utils.random(1.5, 3.5)
          const ampY = gsap.utils.random(2, 5)
          const ampRot = gsap.utils.random(0.6, 1.4)
          const duration = gsap.utils.random(4.2, 6.8)

          breathTweens.push(
            gsap.to(pose, {
              breathX: ampX * (i % 2 === 0 ? 1 : -1),
              breathY: -ampY,
              breathRot: ampRot * (i % 2 === 0 ? 1 : -1),
              duration,
              delay: (i % 12) * 0.12,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
              onUpdate: () => paint(i),
            }),
          )
        })

        ambientScroll = ScrollTrigger.create({
          trigger: frame,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.6,
          onUpdate: (self) => {
            if (bucketState !== 'settled') return
            const wave = (self.progress - 0.5) * 2
            poses.forEach((pose, i) => {
              const phase = (i % 7) * 0.35
              pose.scrollX = Math.sin(wave * Math.PI + phase) * 3.5
              pose.scrollY = wave * (4 + (i % 4)) * -0.55
              paint(i)
            })
          },
        })
      }

      const settleVisual = () => {
        pills.forEach((pill, i) => {
          const rest = rests[i]
          if (!rest) return
          gsap.set(pill, {
            x: rest.x,
            y: rest.y,
            rotation: rest.rotation,
            opacity: 1,
            visibility: 'visible',
          })
        })
      }

      // Bottom of pile first on the way in
      const dropOrder = pills
        .map((_, i) => i)
        .sort((a, b) => (rests[b]?.y ?? 0) - (rests[a]?.y ?? 0))

      // Top of pile first on the way out
      const suckOrder = [...dropOrder].reverse()

      const playDrop = () => {
        if (bucketState === 'settled') {
          startAmbient()
          bindPointer()
          return
        }
        if (bucketState === 'animating' && dropTl?.isActive()) return

        suckTl?.kill()
        suckTl = null
        stopAmbient()
        unbindPointer()
        bucketState = 'animating'

        pills.forEach((pill, i) => {
          const rest = rests[i]
          if (rest) park(pill, rest)
        })

        dropTl?.kill()
        dropTl = gsap.timeline({
          onComplete: () => {
            bucketState = 'settled'
            settleVisual()
            startAmbient()
            bindPointer()
          },
        })

        dropOrder.forEach((index, sequence) => {
          const pill = pills[index]
          const rest = rests[index]
          if (!pill || !rest) return

          const fall = gsap.utils.random(0.5, 0.75)
          const land = gsap.utils.random(0.3, 0.48)
          const start = sequence * gsap.utils.random(0.035, 0.06)

          dropTl!.to(
            pill,
            {
              x: rest.x + gsap.utils.random(-8, 8),
              y: rest.y - gsap.utils.random(4, 14),
              rotation: rest.rotation + gsap.utils.random(-3, 3),
              duration: fall,
              ease: 'power3.in',
              onUpdate: function () {
                const y = Number(gsap.getProperty(pill, 'y'))
                if (y > -stageTop + 4) {
                  gsap.set(pill, {opacity: 1, visibility: 'visible'})
                }
              },
            },
            start,
          )
          dropTl!.to(
            pill,
            {
              x: rest.x,
              y: rest.y,
              rotation: rest.rotation,
              duration: land,
              ease: 'power2.out',
            },
            start + fall,
          )
        })
      }

      const playSuck = () => {
        if (bucketState === 'parked') return
        if (bucketState === 'animating' && suckTl?.isActive()) return

        dropTl?.kill()
        dropTl = null
        stopAmbient()
        unbindPointer()
        bucketState = 'animating'

        // Snap to homes before lifting (clear breath/avoid offsets)
        settleVisual()

        suckTl?.kill()
        suckTl = gsap.timeline({
          onComplete: () => {
            bucketState = 'parked'
            pills.forEach((pill, i) => {
              const rest = rests[i]
              if (rest) park(pill, rest)
            })
          },
        })

        suckOrder.forEach((index, sequence) => {
          const pill = pills[index]
          const rest = rests[index]
          if (!pill || !rest) return

          const rise = gsap.utils.random(0.45, 0.7)
          const start = sequence * gsap.utils.random(0.03, 0.055)

          suckTl!.to(
            pill,
            {
              x: rest.x + gsap.utils.random(-36, 36),
              y: parkY(pill),
              rotation: gsap.utils.random(-22, 22),
              duration: rise,
              ease: 'power2.in',
              onUpdate: function () {
                const y = Number(gsap.getProperty(pill, 'y'))
                if (y < -stageTop) {
                  gsap.set(pill, {opacity: 0, visibility: 'hidden'})
                }
              },
            },
            start,
          )
        })
      }

      const trigger = ScrollTrigger.create({
        trigger: frame,
        start: 'top 78%',
        end: 'bottom top',
        onEnter: () => playDrop(),
        onEnterBack: () => playDrop(),
        onLeave: () => {
          // Scrolled past downward — pause idle work, keep visual settled
          if (bucketState === 'settled') {
            stopAmbient()
            unbindPointer()
          }
        },
        onLeaveBack: () => playSuck(),
      })

      cleanups.push(() => {
        unbindPointer()
        stopAmbient()
      })

      return () => {
        trigger.kill()
        dropTl?.kill()
        suckTl?.kill()
        breathTweens.forEach((t) => t.kill())
        cleanups.forEach((fn) => fn())
      }
    },
    {scope: frameRef, dependencies: [items.length]},
  )

  if (items.length === 0) return null

  return (
    <section
      ref={frameRef}
      className="relative isolate overflow-hidden bg-accent text-white"
      aria-label={label?.trim() || 'Capabilities'}
    >
      {label?.trim() ? (
        <p
          data-cap-label
          className="page-chrome pointer-events-none relative z-10 pt-14 font-mono text-[11px] uppercase tracking-label text-white/55 md:pt-16"
        >
          {label}
        </p>
      ) : null}

      <ul ref={stageRef} className="relative z-0 w-full" role="list">
        {items.map((item) => (
          <li
            key={item._id}
            data-cap-pill
            className="absolute left-0 top-0 w-max max-w-[min(90vw,22rem)] rounded-full border border-[#08090A]/8 bg-white px-4 py-2 font-sans text-[13px] font-semibold uppercase tracking-[-0.01em] text-[#08090A] opacity-0 shadow-[0_4px_16px_rgba(0,0,0,0.14)] md:px-5 md:py-2.5 md:text-[14px]"
          >
            {item.name}
          </li>
        ))}
      </ul>
    </section>
  )
}
