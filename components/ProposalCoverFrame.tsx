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
        // Read both rects and the margin together, then write once. Writing
        // marginTop between reads forced a fresh layout on every read, so one
        // call could flush layout eight times.
        const frameTop = node.getBoundingClientRect().top
        const wordRect = word.getBoundingClientRect()
        const margin = parseFloat(window.getComputedStyle(node).marginTop) || 0
        const delta = wordRect.top + wordRect.height / 2 - frameTop
        if (Math.abs(delta) < 0.5) break
        node.style.marginTop = `${Math.round(margin + delta)}px`
      }
      node.style.transform = transform
    }

    place()
    const headline = node.parentElement?.querySelector('h1')
    const observer = new ResizeObserver(place)
    if (headline) observer.observe(headline)

    // Only a width change can move the headline. On a phone every scroll
    // shows or hides the address bar, which fires resize with a new height
    // and used to re-run the whole measure loop, nudging the hero mid-scroll.
    let lastWidth = window.innerWidth
    const onResize = () => {
      if (window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      place()
    }
    window.addEventListener('resize', onResize)
    document.fonts.ready.then(place).catch(() => {})
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    const node = frame.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let hovering = false
    let queued = 0
    let pending: [number, number] | null = null

    // One write per frame. Both handlers used to write transform on every
    // event, and the element carried a 300ms CSS transition, so each event
    // restarted the ease toward a new target and the tilt rubber-banded
    // behind the scroll. The transition is now applied only when the pointer
    // leaves, which is the one place an ease is wanted.
    const flush = () => {
      queued = 0
      if (!pending) return
      const [rotateX, rotateY] = pending
      pending = null
      node.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`
    }

    const apply = (rotateX: number, rotateY: number) => {
      pending = [rotateX, rotateY]
      if (!queued) queued = requestAnimationFrame(flush)
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
      node.style.transition = 'none'
      apply(-y * 1.6, x * 1.8)
    }

    const onLeave = () => {
      hovering = false
      node.style.transition = 'transform 300ms ease-out'
      apply(scrollTilt(), 0)
    }

    const onScroll = () => {
      if (hovering) return
      node.style.transition = 'none'
      apply(scrollTilt(), 0)
    }

    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerleave', onLeave)
    window.addEventListener('scroll', onScroll, {passive: true})
    return () => {
      if (queued) cancelAnimationFrame(queued)
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div
      ref={frame}
      // On a large screen the panel fills the section's gutters rather than
      // stopping at the 1152px column, and its height is set directly instead
      // of by an aspect ratio. A ratio made a wider panel a taller one too,
      // which ran it off the bottom of the screen and pushed the headline up
      // against the top. The hero is bottom anchored, so a shorter panel
      // brings the headline back down.
      className={`relative z-0 mx-auto h-[56vh] max-h-[56vh] w-full max-w-6xl origin-center overflow-hidden rounded-[16px] border-0 shadow-none will-change-transform md:h-[64vh] md:max-h-[64vh] lg:h-[52vh] lg:max-h-[52vh] lg:max-w-[100rem] ${src ? 'bg-paper' : ''}`}
    >
      {src ? (
        // The cover is the largest thing above the fold, so it is the LCP.
        // Without priority Next marks it lazy, it is not found until after
        // hydration, and the client watches an empty panel then a pop. The
        // height matches the 2400x1200 URL built in ProposalPage.
        <Image
          src={src}
          alt={alt || ''}
          width={2400}
          height={1200}
          sizes="(min-width: 1024px) 1152px, 100vw"
          priority
          className="h-full w-full object-cover"
        />
      ) : (
        <ProposalSwirlField pace="slow" />
      )}
      {!src && caption ? (
        <p className="absolute inset-x-0 bottom-0 z-[1] px-4 pb-4 text-foreground/80 md:px-5 md:pb-5 lg:px-12 lg:pb-10">
          <span className="block text-balance text-[clamp(1.75rem,6vw,2.25rem)] font-[560] leading-[1.05] tracking-[var(--tracking-display)] md:max-w-xl md:text-[2.1rem] lg:max-w-3xl lg:text-[clamp(1.75rem,3.2vw,3rem)] lg:leading-[0.95]">
            {caption}
          </span>
        </p>
      ) : null}
    </div>
  )
}
