'use client'

import {ProposalSwirlField} from '@/components/ProposalOutcomes'
import Image from 'next/image'
import {useEffect, useLayoutEffect, useRef} from 'react'

/**
 * Cover hero frame, rendered by Cover in ProposalPage.tsx.
 * Sits under the headline and tilts slightly on hover or scroll.
 */
export function ProposalCoverFrame({
  src,
  alt,
  caption,
}: {
  src?: string
  alt?: string
  caption?: string
}) {
  const frame = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const node = frame.current
    if (!node) return

    const place = () => {
      const word =
        node.parentElement?.querySelector('h1 span') ?? node.parentElement?.querySelector('h1')
      if (!(word instanceof HTMLElement)) return
      const transform = node.style.transform
      node.style.transform = 'none'
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const frameTop = node.getBoundingClientRect().top
        const wordRect = word.getBoundingClientRect()
        const delta = wordRect.top + wordRect.height / 2 - frameTop
        if (Math.abs(delta) < 0.5) break
        const margin = parseFloat(window.getComputedStyle(node).marginTop) || 0
        node.style.marginTop = `${Math.round(margin + delta)}px`
      }
      node.style.transform = transform
    }

    place()
    const headline = node.parentElement?.querySelector('h1')
    const observer = new ResizeObserver(place)
    if (headline) observer.observe(headline)
    window.addEventListener('resize', place)
    document.fonts.ready.then(place).catch(() => {})
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', place)
    }
  }, [])

  useEffect(() => {
    const node = frame.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let hovering = false

    const apply = (rotateX: number, rotateY: number) => {
      node.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`
    }

    const scrollTilt = () => {
      const rect = node.getBoundingClientRect()
      const delta = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight
      return Math.max(-2, Math.min(2, -delta * 3))
    }

    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      hovering = true
      apply(-y * 1.6, x * 1.8)
    }

    const onLeave = () => {
      hovering = false
      apply(scrollTilt(), 0)
    }

    const onScroll = () => {
      if (hovering) return
      apply(scrollTilt(), 0)
    }

    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerleave', onLeave)
    window.addEventListener('scroll', onScroll, {passive: true})
    return () => {
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div
      ref={frame}
      className={`relative z-0 mx-auto h-[66vh] max-h-[66vh] w-full max-w-6xl origin-center overflow-hidden rounded-[16px] border-0 shadow-none transition-transform duration-300 ease-out will-change-transform md:h-[64vh] md:max-h-[64vh] lg:aspect-[2/1] lg:h-auto lg:max-h-[70vh] ${src ? 'bg-paper' : ''}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || ''}
          width={2400}
          height={1400}
          className="h-full w-full object-cover"
        />
      ) : (
        <ProposalSwirlField pace="slow" />
      )}
      {!src && caption ? (
        <p className="absolute inset-x-0 bottom-0 z-[1] px-4 pb-4 text-foreground/80 md:px-5 md:pb-5 lg:px-12 lg:pb-10">
          <span className="block text-balance text-[clamp(1.75rem,6vw,2.25rem)] font-[560] leading-[1.05] tracking-[var(--tracking-display)] md:max-w-md md:text-[2.35rem] lg:max-w-xl lg:text-[clamp(2rem,4vw,3.75rem)] lg:leading-[0.95]">
            {caption}
          </span>
        </p>
      ) : null}
    </div>
  )
}
