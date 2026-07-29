'use client'

import {useGSAP} from '@gsap/react'
import {useRef} from 'react'

import {EASE, gsap, prefersReducedMotion} from '@/components/motion/gsap'

type SidePanelCloseProps = {
  onClose: () => void
  /** When true, runs the entrance pop. */
  open: boolean
  ariaLabel?: string
}

/**
 * Pinned Close / ESC control shared by About + service detail drawers —
 * magnetic hover + dual-layer text swap.
 */
export function SidePanelClose({
  onClose,
  open,
  ariaLabel = 'Close panel',
}: SidePanelCloseProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const magnetRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const wrap = wrapRef.current
      const btn = btnRef.current
      const magnet = magnetRef.current
      if (!wrap || !btn || !magnet) return

      const reduced = prefersReducedMotion()
      gsap.killTweensOf([wrap, magnet])

      if (open) {
        gsap.set(wrap, {opacity: 0, y: -14, scale: 0.88})
        gsap.to(wrap, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: reduced ? 0.01 : 0.7,
          delay: reduced ? 0 : 0.35,
          ease: 'expo.out',
        })
      } else {
        gsap.to(wrap, {
          opacity: 0,
          y: -10,
          scale: 0.94,
          duration: reduced ? 0.01 : 0.35,
          ease: 'power2.in',
        })
      }

      if (reduced) return

      const labelOut = btn.querySelector<HTMLElement>('[data-close-label="out"]')
      const labelIn = btn.querySelector<HTMLElement>('[data-close-label="in"]')
      const escOut = btn.querySelector<HTMLElement>('[data-close-esc="out"]')
      const escIn = btn.querySelector<HTMLElement>('[data-close-esc="in"]')
      const escBg = btn.querySelector<HTMLElement>('[data-close-esc-bg]')
      const cleanups: Array<() => void> = []

      if (labelOut && labelIn) {
        gsap.set(labelIn, {yPercent: 110})
        if (escIn) gsap.set(escIn, {yPercent: 110})
        const hoverTl = gsap.timeline({paused: true})
        hoverTl
          .to(labelOut, {yPercent: -110, duration: 0.38, ease: EASE.outQuint}, 0)
          .to(labelIn, {yPercent: 0, duration: 0.38, ease: EASE.outQuint}, 0)
        if (escOut && escIn) {
          hoverTl
            .to(escOut, {yPercent: -110, duration: 0.34, ease: EASE.outQuint}, 0.02)
            .to(escIn, {yPercent: 0, duration: 0.34, ease: EASE.outQuint}, 0.02)
        }
        if (escBg) {
          hoverTl.to(
            escBg,
            {backgroundColor: 'rgba(255,255,255,0.28)', duration: 0.3, ease: EASE.outCubic},
            0,
          )
        }
        const onEnter = () => hoverTl.play()
        const onLeave = () => hoverTl.reverse()
        btn.addEventListener('pointerenter', onEnter)
        btn.addEventListener('pointerleave', onLeave)
        cleanups.push(() => {
          btn.removeEventListener('pointerenter', onEnter)
          btn.removeEventListener('pointerleave', onLeave)
          hoverTl.kill()
        })
      }

      const xTo = gsap.quickTo(magnet, 'x', {duration: 0.45, ease: EASE.outQuint})
      const yTo = gsap.quickTo(magnet, 'y', {duration: 0.45, ease: EASE.outQuint})
      const maxPull = 10
      const onMove = (event: PointerEvent) => {
        const rect = btn.getBoundingClientRect()
        const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
        const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
        xTo(gsap.utils.clamp(-1, 1, dx) * maxPull)
        yTo(gsap.utils.clamp(-1, 1, dy) * maxPull)
      }
      const onLeaveMagnet = () => {
        xTo(0)
        yTo(0)
      }
      const onDown = () => {
        gsap.to(magnet, {scale: 0.94, duration: 0.16, ease: EASE.outCubic})
      }
      const onUp = () => {
        gsap.to(magnet, {scale: 1, duration: 0.35, ease: 'expo.out'})
      }
      magnet.addEventListener('pointermove', onMove)
      magnet.addEventListener('pointerleave', onLeaveMagnet)
      magnet.addEventListener('pointerdown', onDown)
      magnet.addEventListener('pointerup', onUp)
      magnet.addEventListener('pointercancel', onUp)
      cleanups.push(() => {
        magnet.removeEventListener('pointermove', onMove)
        magnet.removeEventListener('pointerleave', onLeaveMagnet)
        magnet.removeEventListener('pointerdown', onDown)
        magnet.removeEventListener('pointerup', onUp)
        magnet.removeEventListener('pointercancel', onUp)
      })

      return () => {
        cleanups.forEach((fn) => fn())
      }
    },
    {dependencies: [open]},
  )

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute top-[28px] right-[28px] z-20"
    >
      <span
        ref={magnetRef}
        className="pointer-events-auto relative inline-flex will-change-transform"
      >
        <button
          ref={btnRef}
          type="button"
          onClick={onClose}
          aria-label={ariaLabel}
          className="relative isolate inline-flex items-center gap-2 overflow-hidden rounded-sm bg-[#08090a] py-1.5 pl-3.5 pr-3.5 font-mono text-[11px] uppercase tracking-label text-white lg:pr-1.5"
        >
          <span className="relative inline-block h-[1em] overflow-hidden leading-none">
            <span data-close-label="out" className="block">
              Close
            </span>
            <span data-close-label="in" aria-hidden className="absolute inset-x-0 top-0 block">
              Close
            </span>
          </span>
          <span
            data-close-esc-bg
            className="relative hidden h-[1.65em] min-w-[2.1rem] overflow-hidden rounded-[3px] bg-white/15 px-1.5 text-center text-[10px] leading-[1.65em] tracking-[0.08em] text-white/75 lg:inline-block"
          >
            <span data-close-esc="out" className="block">
              ESC
            </span>
            <span data-close-esc="in" aria-hidden className="absolute inset-x-0 top-0 block">
              ESC
            </span>
          </span>
        </button>
      </span>
    </div>
  )
}
