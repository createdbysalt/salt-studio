'use client'

import {gsap, ScrollTrigger, skipScrubMotion} from '@/components/motion/gsap'
import {useGSAP} from '@gsap/react'
import {useEffect, useRef} from 'react'

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

/** Deterministic 0..1 — stable across resize reflows. */
function rand(seed: number, salt = 0) {
  const n = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453
  return n - Math.floor(n)
}

function overlapArea(a: Rect, b: Rect) {
  const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
  const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
  if (ox <= 0 || oy <= 0) return 0
  return ox * oy
}

type LayoutCtx = {
  pills: HTMLElement[]
  rests: Rest[]
  aboveY: number[]
  settled: boolean
  dropTl: gsap.core.Timeline | null
  suckTl: gsap.core.Timeline | null
  scatterTl: gsap.core.Timeline | null
  breathTweens: gsap.core.Tween[]
  order: number[]
}

/**
 * Capability pills fall into a bucket (bottom first), settle with a soft land,
 * then breathe. Packing keeps labels readable inside the flex viewport stage.
 */
export function HomeCapabilitiesScrub({items, label}: HomeCapabilitiesScrubProps) {
  const frameRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLUListElement>(null)
  const ctxRef = useRef<LayoutCtx | null>(null)

  useGSAP(
    () => {
      const frame = frameRef.current
      const stage = stageRef.current
      if (!frame || !stage || items.length === 0) return

      const pills = gsap.utils.toArray<HTMLElement>('[data-cap-pill]', stage)
      if (!pills.length) return

      const labelEl = frame.querySelector<HTMLElement>('[data-cap-label]')
      // Touch devices get the static settled layout too: the pinned scrub
      // physics batch badly against iOS momentum scroll and feel janky.
      const reduced = skipScrubMotion()

      const parkOffstage = (rests: Rest[], aboveY: number[]) => {
        pills.forEach((pill, i) => {
          const r = rests[i]
          if (!r) return
          const drift = (rand(i, 3) * 2 - 1) * 36
          gsap.set(pill, {
            x: r.x + drift,
            y: aboveY[i] ?? -pill.offsetHeight - 48,
            rotation: r.rotation + (rand(i, 5) * 2 - 1) * 10,
            opacity: 0,
            visibility: 'hidden',
            scale: 1,
            force3D: true,
          })
        })
      }

      /**
       * Scatter pack with a real gap between pills. Bottom-weighted, full width —
       * not a scrambled heap, not a rigid tag-cloud grid.
       */
      const computeRests = (
        rests: Rest[],
        aboveY: number[],
        order: number[],
        opts?: {hideForMeasure?: boolean},
      ) => {
        const frameW = frame.clientWidth
        const stageH = stage.clientHeight || window.innerHeight
        const gutter = Math.max(12, Math.min(28, frameW * 0.022))
        const labelPad = (labelEl?.offsetHeight ?? 0) + 12
        const bottomPad = Math.max(14, gutter * 0.65)
        const stageTop = stage.offsetTop
        const maxX = (w: number) => Math.max(gutter, frameW - gutter - w)

        const live = pills.map((pill) => ({
          x: Number(gsap.getProperty(pill, 'x')) || 0,
          y: Number(gsap.getProperty(pill, 'y')) || 0,
          rotation: Number(gsap.getProperty(pill, 'rotation')) || 0,
          opacity: Number(gsap.getProperty(pill, 'opacity')) || 0,
          visibility: pill.style.visibility || 'visible',
        }))

        gsap.set(pills, {
          position: 'absolute',
          left: 0,
          top: 0,
          transformOrigin: '50% 50%',
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 0,
          visibility: 'hidden',
        })

        if (order.length !== pills.length) {
          order.length = 0
          const idx = pills.map((_, i) => i)
          for (let i = idx.length - 1; i > 0; i--) {
            const j = Math.floor(rand(i + pills.length, 4) * (i + 1))
            ;[idx[i], idx[j]] = [idx[j], idx[i]]
          }
          order.push(...idx)
        }

        type Measured = {index: number; w: number; h: number}
        const measured: Measured[] = pills.map((pill, index) => ({
          index,
          w: pill.offsetWidth || 80,
          h: pill.offsetHeight || 36,
        }))
        const placeOrder = [...measured].sort((a, b) => b.w * b.h - a.w * a.h)

        // Dense pack band: size from total pill area, not the full viewport height.
        const usableW = Math.max(1, frameW - gutter * 2)
        const totalArea = measured.reduce((s, m) => s + m.w * m.h, 0)
        const avgH = measured.reduce((s, m) => s + m.h, 0) / Math.max(1, measured.length)
        const fullH = Math.max(1, stageH - labelPad - bottomPad)
        // ~72% coverage → tight cloud; clamp so it never blows past the stage.
        const packH = Math.min(fullH, Math.max(avgH * 4.8, totalArea / usableW / 0.72))
        const packBottom = stageH - bottomPad
        // Sit the cloud mid-low so the label keeps air above.
        const packTop = Math.max(labelPad, packBottom - packH)
        const floor = (h: number) => Math.max(packTop, packBottom - h)
        const ceiling = packTop

        rests.length = 0
        aboveY.length = 0
        for (let k = 0; k < pills.length; k++) {
          rests.push({x: 0, y: 0, rotation: 0})
          aboveY.push(0)
        }

        const placed: Rect[] = []
        // Near-touching with a soft tuck — denser settled pile.
        const gap = Math.max(1, Math.min(4, frameW * 0.0025))
        let maxOverlap = 0.18

        const padded = (r: Rect): Rect => ({
          x: r.x - gap / 2,
          y: r.y - gap / 2,
          w: r.w + gap,
          h: r.h + gap,
        })

        const clear = (rect: Rect, limit: number) => {
          if (rect.x < gutter || rect.y < ceiling) return false
          if (rect.x + rect.w > frameW - gutter) return false
          if (rect.y + rect.h > packBottom) return false
          const hit = padded(rect)
          return !placed.some((p) => {
            const area = overlapArea(hit, padded(p))
            if (area <= 1) return false
            const ratio = area / Math.min(hit.w * hit.h, padded(p).w * padded(p).h)
            return ratio > limit
          })
        }

        for (const item of placeOrder) {
          let found: Rest | null = null
          const ySpan = Math.max(0, floor(item.h) - ceiling)

          for (let pass = 0; pass < 4 && !found; pass++) {
            const limit = Math.min(0.34, maxOverlap + pass * 0.05)
            const attempts = pass < 2 ? 200 : 140
            for (let attempt = 0; attempt < attempts; attempt++) {
              const t = rand(item.index, attempt + pass * 333)
              const u = rand(item.index, attempt + 701 + pass * 333)
              // Stronger floor bias → denser lower mass.
              const bias = pass === 0 ? 2.05 : pass === 1 ? 1.55 : 1.15
              const lift = Math.pow(u, bias) * ySpan
              const x = gutter + t * Math.max(0, maxX(item.w) - gutter)
              const y = floor(item.h) - lift
              const rect = {x, y, w: item.w, h: item.h}
              if (!clear(rect, limit)) continue
              const rotation = (rand(item.index, attempt + 11) * 2 - 1) * 8
              found = {x, y, rotation}
              placed.push(rect)
              break
            }
          }

          if (!found) {
            const stepX = Math.max(12, Math.floor(item.w * 0.28))
            const stepY = Math.max(10, Math.floor(item.h * 0.42))
            outer: for (let y = floor(item.h); y >= ceiling; y -= stepY) {
              const xStart = gutter + rand(item.index, Math.round(y)) * stepX
              for (let x = xStart; x <= maxX(item.w); x += stepX) {
                const rect = {x, y, w: item.w, h: item.h}
                if (!clear(rect, Math.min(0.32, maxOverlap + 0.12))) continue
                found = {
                  x,
                  y,
                  rotation: (rand(item.index, Math.round(y + x)) * 2 - 1) * 6,
                }
                placed.push(rect)
                break outer
              }
              for (let x = gutter; x < xStart; x += stepX) {
                const rect = {x, y, w: item.w, h: item.h}
                if (!clear(rect, Math.min(0.32, maxOverlap + 0.12))) continue
                found = {
                  x,
                  y,
                  rotation: (rand(item.index, Math.round(y + x)) * 2 - 1) * 6,
                }
                placed.push(rect)
                break outer
              }
            }
          }

          if (!found) {
            const t = rand(item.index, 999)
            const x = gutter + t * Math.max(0, maxX(item.w) - gutter)
            const y = floor(item.h) - rand(item.index, 1001) * ySpan * 0.35
            found = {
              x,
              y: Math.max(ceiling, y),
              rotation: (rand(item.index, 1002) * 2 - 1) * 5,
            }
            placed.push({x: found.x, y: found.y, w: item.w, h: item.h})
            maxOverlap = Math.min(0.34, maxOverlap + 0.04)
          }

          rests[item.index] = found
          aboveY[item.index] = -(stageTop + found.y + pillTravel(item.h, item.index))
        }

        // Higher in the pile draws on top (settled stack reading).
        const byY = [...order].sort((a, b) => (rests[a]?.y ?? 0) - (rests[b]?.y ?? 0))
        byY.forEach((pillIndex, z) => {
          pills[pillIndex].style.zIndex = String(10 + z)
        })

        if (!opts?.hideForMeasure) {
          pills.forEach((pill, i) => {
            const L = live[i]
            gsap.set(pill, {
              x: L.x,
              y: L.y,
              rotation: L.rotation,
              opacity: L.opacity,
              visibility: L.visibility,
            })
          })
        }
      }

      function pillTravel(h: number, i: number) {
        return 40 + h + (i % 9) * 22 + rand(i, 8) * 40
      }

      const ctx: LayoutCtx = {
        pills,
        rests: [],
        aboveY: [],
        settled: false,
        dropTl: null,
        suckTl: null,
        scatterTl: null,
        breathTweens: [],
        order: [],
      }
      ctxRef.current = ctx

      const layoutOnce = () => {
        computeRests(ctx.rests, ctx.aboveY, ctx.order, {hideForMeasure: true})
        parkOffstage(ctx.rests, ctx.aboveY)
      }

      const settleVisible = () => {
        pills.forEach((pill, i) => {
          const r = ctx.rests[i]
          if (!r) return
          gsap.set(pill, {
            x: r.x,
            y: r.y,
            rotation: r.rotation,
            opacity: 1,
            visibility: 'visible',
          })
        })
        ctx.settled = true
      }

      layoutOnce()

      if (reduced) {
        // Static settled layout (reduced motion + touch): place pills at their
        // rest positions, visible. Re-run after the first layout frame so a
        // late measurement doesn't leave them parked offstage (opacity 0).
        settleVisible()
        requestAnimationFrame(() => {
          if (!ctxRef.current) return
          computeRests(ctx.rests, ctx.aboveY, ctx.order, {hideForMeasure: true})
          settleVisible()
        })
        return
      }

      requestAnimationFrame(() => {
        if (!ctxRef.current) return
        layoutOnce()
      })

      const startBreath = () => {
        ctx.breathTweens.forEach((t) => t.kill())
        ctx.breathTweens = []
        pills.forEach((pill, i) => {
          const ampY = 1.6 + (i % 4) * 0.45
          const ampRot = 0.4 + (i % 3) * 0.2
          const t = gsap.to(pill, {
            y: `+=${ampY}`,
            rotation: `+=${i % 2 === 0 ? ampRot : -ampRot}`,
            duration: 3.2 + (i % 5) * 0.35,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: (i % 9) * 0.14,
          })
          ctx.breathTweens.push(t)
        })
      }

      const stopBreath = () => {
        ctx.breathTweens.forEach((t) => t.kill())
        ctx.breathTweens = []
      }

      const isTouchUi = () => window.matchMedia('(max-width: 1023px)').matches

      /** Tap scatter — nearby pills shove away, then settle home (mobile/tablet). */
      const scatterFrom = (mx: number, my: number) => {
        if (!ctx.settled) return
        stopBreath()
        ctx.scatterTl?.kill()
        pills.forEach((pill, i) => {
          const r = ctx.rests[i]
          if (!r) return
          gsap.killTweensOf(pill)
          gsap.set(pill, {x: r.x, y: r.y, rotation: r.rotation})
        })

        const tl = gsap.timeline({
          onComplete: () => {
            if (ctx.settled) startBreath()
          },
        })
        ctx.scatterTl = tl

        const radius = Math.min(170, Math.max(120, stage.clientWidth * 0.38))
        const maxForce = Math.min(64, Math.max(40, stage.clientWidth * 0.12))

        pills.forEach((pill, i) => {
          const r = ctx.rests[i]
          if (!r) return
          const cx = r.x + pill.offsetWidth / 2
          const cy = r.y + pill.offsetHeight / 2
          const dx = cx - mx
          const dy = cy - my
          const dist = Math.hypot(dx, dy) || 0.01
          if (dist >= radius) return
          const force = Math.pow(1 - dist / radius, 1.2) * maxForce
          const ox = (dx / dist) * force
          const oy = (dy / dist) * force
          const orot = (ox / maxForce) * 8
          tl.to(
            pill,
            {
              x: r.x + ox,
              y: r.y + oy,
              rotation: r.rotation + orot,
              duration: 0.4,
              ease: 'power3.out',
              force3D: true,
            },
            0,
          )
          tl.to(
            pill,
            {
              x: r.x,
              y: r.y,
              rotation: r.rotation,
              duration: 0.95,
              ease: 'power2.out',
              force3D: true,
            },
            0.36,
          )
        })
      }

      const onStagePointerDown = (event: PointerEvent) => {
        if (!isTouchUi() || !ctx.settled) return
        const rect = stage.getBoundingClientRect()
        scatterFrom(event.clientX - rect.left, event.clientY - rect.top)
      }

      stage.addEventListener('pointerdown', onStagePointerDown)

      /** Two-phase fall: accelerate in, then soft land — reads as settling. */
      const runDrop = () => {
        if (ctx.settled && !ctx.suckTl) {
          startBreath()
          return
        }
        if (ctx.dropTl?.isActive()) return

        ctx.suckTl?.kill()
        ctx.suckTl = null
        ctx.dropTl?.kill()
        stopBreath()
        ctx.settled = false
        parkOffstage(ctx.rests, ctx.aboveY)

        const tl = gsap.timeline({
          onComplete: () => {
            ctx.settled = true
            // Snap to exact homes (clear any land overshoot residue).
            pills.forEach((pill, i) => {
              const r = ctx.rests[i]
              if (!r) return
              gsap.set(pill, {
                x: r.x,
                y: r.y,
                rotation: r.rotation,
                scale: 1,
                opacity: 1,
                visibility: 'visible',
              })
            })
            startBreath()
          },
        })
        ctx.dropTl = tl

        const byDepth = [...ctx.order].sort(
          (a, b) => (ctx.rests[b]?.y ?? 0) - (ctx.rests[a]?.y ?? 0),
        )

        byDepth.forEach((pillIndex, sequence) => {
          const pill = pills[pillIndex]
          const r = ctx.rests[pillIndex]
          if (!r) return

          const fall = 0.78 + rand(pillIndex, 20) * 0.42
          const land = 0.48 + rand(pillIndex, 21) * 0.28
          const at = sequence * (0.055 + rand(pillIndex, 22) * 0.035)
          const preX = r.x + (rand(pillIndex, 23) * 2 - 1) * 10
          const preY = r.y - (4 + rand(pillIndex, 24) * 12)
          const preRot = r.rotation + (rand(pillIndex, 25) * 2 - 1) * 4

          tl.set(
            pill,
            {
              x: r.x + (rand(pillIndex, 26) * 2 - 1) * 28,
              y: ctx.aboveY[pillIndex],
              rotation: r.rotation + (rand(pillIndex, 27) * 2 - 1) * 14,
              scale: 1,
              opacity: 0,
              visibility: 'visible',
            },
            at,
          )

          // Fall — accelerating toward the pile.
          tl.to(
            pill,
            {
              x: preX,
              y: preY,
              rotation: preRot,
              opacity: 1,
              duration: fall,
              ease: 'power3.in',
              force3D: true,
            },
            at,
          )

          // Land — ease into the rest pose (tiny settle, not a bounce loop).
          tl.to(
            pill,
            {
              x: r.x,
              y: r.y,
              rotation: r.rotation,
              scale: 1,
              duration: land,
              ease: 'power2.out',
              force3D: true,
            },
            at + fall,
          )
        })
      }

      const runSuck = () => {
        if (!ctx.settled && !ctx.dropTl) return
        if (ctx.suckTl?.isActive()) return

        ctx.dropTl?.kill()
        ctx.dropTl = null
        ctx.scatterTl?.kill()
        ctx.scatterTl = null
        stopBreath()
        ctx.settled = false

        // Clear breath offsets before lift.
        pills.forEach((pill, i) => {
          const r = ctx.rests[i]
          if (!r) return
          gsap.set(pill, {
            x: r.x,
            y: r.y,
            rotation: r.rotation,
            opacity: 1,
            visibility: 'visible',
          })
        })

        const tl = gsap.timeline({
          onComplete: () => {
            parkOffstage(ctx.rests, ctx.aboveY)
          },
        })
        ctx.suckTl = tl

        const byTop = [...ctx.order].sort((a, b) => (ctx.rests[a]?.y ?? 0) - (ctx.rests[b]?.y ?? 0))

        byTop.forEach((pillIndex, i) => {
          const pill = pills[pillIndex]
          const r = ctx.rests[pillIndex]
          if (!r) return
          const at = i * 0.034
          const lift = 0.42 + rand(pillIndex, 30) * 0.18
          tl.to(
            pill,
            {
              y: ctx.aboveY[pillIndex],
              x: r.x + (rand(pillIndex, 31) * 2 - 1) * 24,
              rotation: r.rotation + (rand(pillIndex, 32) * 2 - 1) * 16,
              opacity: 0,
              duration: lift,
              ease: 'power2.in',
              force3D: true,
            },
            at,
          )
          tl.set(pill, {visibility: 'hidden'}, at + lift)
        })
      }

      const reflow = () => {
        const prevSettled = ctx.settled
        const wasDropping = Boolean(ctx.dropTl?.isActive())
        const wasSucking = Boolean(ctx.suckTl?.isActive())

        computeRests(ctx.rests, ctx.aboveY, ctx.order)

        if (wasSucking || (!prevSettled && !wasDropping)) {
          parkOffstage(ctx.rests, ctx.aboveY)
          return
        }

        stopBreath()
        ctx.dropTl?.kill()
        ctx.dropTl = null

        const tl = gsap.timeline({
          onComplete: () => {
            ctx.settled = true
            startBreath()
          },
        })
        ctx.dropTl = tl

        pills.forEach((pill, i) => {
          const r = ctx.rests[i]
          if (!r) return
          gsap.set(pill, {visibility: 'visible'})
          tl.to(
            pill,
            {
              x: r.x,
              y: r.y,
              rotation: r.rotation,
              opacity: 1,
              scale: 1,
              duration: 0.5,
              ease: 'power2.out',
              force3D: true,
            },
            0,
          )
        })
      }

      let resizeTimer: ReturnType<typeof setTimeout> | null = null
      const onResize = () => {
        if (resizeTimer) clearTimeout(resizeTimer)
        resizeTimer = setTimeout(() => {
          resizeTimer = null
          reflow()
          ScrollTrigger.refresh()
        }, 140)
      }

      const ro = new ResizeObserver(onResize)
      ro.observe(frame)

      const trigger = ScrollTrigger.create({
        trigger: frame,
        // Fire as the red band enters — 78% felt like a dead scroll beat.
        start: 'top 92%',
        end: 'bottom top',
        onEnter: () => runDrop(),
        onEnterBack: () => runDrop(),
        onLeaveBack: () => runSuck(),
      })

      return () => {
        if (resizeTimer) clearTimeout(resizeTimer)
        ro.disconnect()
        trigger.kill()
        stage.removeEventListener('pointerdown', onStagePointerDown)
        ctx.dropTl?.kill()
        ctx.suckTl?.kill()
        ctx.scatterTl?.kill()
        stopBreath()
        ctxRef.current = null
      }
    },
    {scope: frameRef, dependencies: [items.length]},
  )

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [items.length])

  if (items.length === 0) return null

  return (
    <section
      ref={frameRef}
      className="relative isolate min-h-[68svh] flex-1 overflow-hidden bg-accent text-white sm:min-h-[72svh] lg:min-h-0"
      aria-label={label?.trim() || 'Capabilities'}
    >
      {label?.trim() ? (
        <p
          data-cap-label
          className="page-chrome pointer-events-none absolute inset-x-0 top-0 z-10 pt-16 font-mono text-[11px] uppercase tracking-label text-white/55 sm:pt-[4.5rem] lg:pt-16"
        >
          {label}
        </p>
      ) : null}

      <ul
        ref={stageRef}
        className="absolute inset-0 z-0 h-full w-full touch-manipulation lg:pointer-events-none"
        role="list"
      >
        {items.map((item) => (
          <li
            key={item._id}
            data-cap-pill
            className="absolute left-0 top-0 w-max max-w-[min(90vw,20rem)] whitespace-nowrap rounded-full border border-[#08090A]/8 bg-white px-2.5 py-[0.3rem] font-sans text-[10.5px] font-semibold uppercase tracking-[-0.01em] text-[#08090A] opacity-0 shadow-[0_4px_16px_rgba(0,0,0,0.14)] lg:pointer-events-none md:max-w-[min(90vw,21rem)] md:px-3 md:py-1.5 md:text-[11.5px] lg:max-w-[min(92vw,22rem)] lg:px-5 lg:py-2.5 lg:text-[14px]"
          >
            {item.name}
          </li>
        ))}
      </ul>
    </section>
  )
}
