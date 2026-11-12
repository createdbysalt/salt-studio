'use client'

import {gsap, prefersReducedMotion} from '@/components/motion/gsap'
import {useEffect, useRef} from 'react'

const COLORS = ['#08090a', '#f08a3a', '#e42927', '#c45c1a', '#e8a830', '#3d3d3d']

type Piece = {
  el: HTMLSpanElement
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  life: number
  age: number
  wobble: number
  flutter: number
}

/**
 * The first payment is not collected yet. The click is the celebration:
 * paper leaves the button and falls across the page.
 */
export function ProposalPayButton() {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const layers = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const active = layers.current
    return () => {
      active.forEach((layer) => layer.remove())
      active.length = 0
    }
  }, [])

  function celebrate() {
    const button = buttonRef.current
    if (!button || prefersReducedMotion()) return

    const rect = button.getBoundingClientRect()
    const originX = rect.left + rect.width / 2
    const originY = rect.top + rect.height / 2
    const layer = document.createElement('div')
    layer.setAttribute('aria-hidden', 'true')
    layer.className = 'pointer-events-none fixed inset-0 z-40 overflow-hidden'
    document.body.appendChild(layer)
    layers.current.push(layer)
    if (layers.current.length > 3) layers.current.shift()?.remove()

    const pieces: Piece[] = []
    for (let index = 0; index < 120; index++) {
      const ribbon = index % 5 === 0
      const width = ribbon ? 4 + Math.random() * 3 : 6 + Math.random() * 7
      const height = ribbon ? 16 + Math.random() * 14 : 8 + Math.random() * 8
      const el = document.createElement('span')
      const rotation = Math.random() * 360
      el.style.cssText = [
        'position:absolute',
        'left:0',
        'top:0',
        `width:${width}px`,
        `height:${height}px`,
        `background:${COLORS[index % COLORS.length]}`,
        `border-radius:${index % 7 === 0 ? '999px' : '1px'}`,
        'will-change:transform',
        `transform:translate3d(${originX}px, ${originY}px, 0) rotate(${rotation}deg)`,
      ].join(';')
      layer.appendChild(el)
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.45
      const speed = 720 + Math.random() * 980
      pieces.push({
        el,
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 180,
        rot: rotation,
        vr: (Math.random() - 0.5) * 640,
        life: 1.8 + Math.random() * 0.9,
        age: 0,
        wobble: Math.random() * Math.PI * 2,
        flutter: 14 + Math.random() * 22,
      })
    }

    let last = performance.now()
    const gravity = 1680
    const tick = () => {
      const now = performance.now()
      const dt = Math.min(0.034, (now - last) / 1000)
      last = now
      let alive = false
      for (const piece of pieces) {
        piece.age += dt
        if (piece.age >= piece.life) continue
        alive = true
        piece.vy += gravity * dt
        piece.vx *= 1 - dt * 0.55
        piece.x += piece.vx * dt
        piece.y += piece.vy * dt
        piece.rot += piece.vr * dt
        const fadeStart = piece.life * 0.68
        const fade =
          piece.age < fadeStart ? 1 : 1 - (piece.age - fadeStart) / (piece.life - fadeStart)
        const drift = Math.sin(piece.age * 8 + piece.wobble) * piece.flutter
        piece.el.style.transform = `translate3d(${piece.x + drift}px, ${piece.y}px, 0) rotate(${piece.rot}deg)`
        piece.el.style.opacity = String(Math.max(0, fade))
      }
      if (!alive) {
        gsap.ticker.remove(tick)
        layer.remove()
        layers.current = layers.current.filter((item) => item !== layer)
      }
    }
    gsap.ticker.add(tick)
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={celebrate}
      className="btn-solid w-full justify-center"
    >
      Pay the first payment
    </button>
  )
}
