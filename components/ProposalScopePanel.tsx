'use client'

import {EASE, gsap, prefersReducedMotion} from '@/components/motion/gsap'
import {SidePanelClose} from '@/components/SidePanelClose'
import {useGSAP} from '@gsap/react'
import {useCallback, useEffect, useId, useRef, useState, type ReactNode} from 'react'
import {createPortal} from 'react-dom'

/**
 * Opens a paper drawer from the right, the same slide as About.
 * Scope of work and terms both use it.
 */
export function ProposalScopePanel({
  label,
  title,
  dismissLabel,
  closeLabel,
  appearance = 'pill',
  children,
}: {
  label: string
  title: string
  dismissLabel: string
  closeLabel: string
  appearance?: 'pill' | 'inline' | 'text'
  children: ReactNode
}) {
  const titleId = useId()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [present, setPresent] = useState(false)
  const [interactive, setInteractive] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const openRef = useRef(open)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    if (open) setPresent(true)
  }, [open])

  useGSAP(
    () => {
      if (!present) return
      const backdrop = backdropRef.current
      const panel = panelRef.current
      if (!backdrop || !panel) return

      const reduced = prefersReducedMotion()
      gsap.killTweensOf([backdrop, panel])

      if (open) {
        gsap.set(panel, {xPercent: 100})
        gsap.set(backdrop, {opacity: 0})
        setInteractive(true)
        const revealEls = gsap.utils.toArray<HTMLElement>('[data-scope-reveal]', panel)
        const tl = gsap.timeline()
        tl.to(backdrop, {opacity: 1, duration: reduced ? 0.01 : 0.55, ease: EASE.outCubic}, 0)
        tl.to(panel, {xPercent: 0, duration: reduced ? 0.01 : 1.05, ease: 'expo.out'}, 0)
        if (!reduced && revealEls.length) {
          gsap.set(revealEls, {opacity: 0, y: 18})
          tl.to(
            revealEls,
            {opacity: 1, y: 0, duration: 0.65, stagger: 0.07, ease: EASE.outCubic},
            0.28,
          )
        }
        return () => {
          tl.kill()
        }
      }

      setInteractive(false)
      const tl = gsap.timeline({
        onComplete: () => {
          if (!openRef.current) setPresent(false)
        },
      })
      tl.to(panel, {xPercent: 100, duration: reduced ? 0.01 : 0.7, ease: 'power3.in'}, 0)
      tl.to(backdrop, {opacity: 0, duration: reduced ? 0.01 : 0.45, ease: EASE.outCubic}, 0)
      return () => {
        tl.kill()
      }
    },
    {scope: rootRef, dependencies: [present, open]},
  )

  useEffect(() => {
    if (!present) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [present, close])

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setOpen(true)
        }}
        className={
          appearance === 'inline'
            ? 'cursor-pointer font-[inherit] text-[inherit] leading-[inherit] underline decoration-[#08090a]/50 underline-offset-[3px] hover:decoration-[#08090a]'
            : appearance === 'text'
              ? 'group relative z-[1] mt-auto block w-full cursor-pointer self-end pt-5 text-right text-[0.95rem] font-medium tracking-[-0.02em]'
              : 'inline-flex cursor-pointer items-center rounded-full border border-[#08090a] px-5 py-3 text-[0.95rem] font-medium tracking-[-0.02em] transition-colors duration-300 hover:bg-[#08090a] hover:text-white'
        }
      >
        {label}
        {appearance === 'text' ? (
          <span
            aria-hidden="true"
            className="ml-2 inline-block transition-transform duration-300 ease-out group-hover:translate-x-1"
          >
            →
          </span>
        ) : null}
      </button>
      {mounted && present
        ? createPortal(
            <div
              ref={rootRef}
              className={`fixed inset-0 z-[180] ${interactive ? '' : 'pointer-events-none'}`}
              aria-hidden={!interactive}
            >
              <button
                ref={backdropRef}
                type="button"
                aria-label={dismissLabel}
                tabIndex={interactive ? 0 : -1}
                onClick={close}
                className="absolute inset-0 bg-black/70 opacity-0 backdrop-blur-[6px] supports-[backdrop-filter]:bg-black/55"
              />
              <aside
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="absolute inset-y-0 right-0 flex w-full max-w-[min(100vw,52rem)] flex-col bg-[#f3f3f3] text-[#08090a] shadow-[-24px_0_80px_rgba(0,0,0,0.35)] will-change-transform"
              >
                <SidePanelClose open={open && present} onClose={close} ariaLabel={closeLabel} />
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-7 pb-16 pt-12 md:px-10">
                  <h2
                    id={titleId}
                    data-scope-reveal
                    className="max-w-[10em] text-[clamp(2.4rem,5vw,4rem)] font-normal leading-[0.95] tracking-[-0.05em]"
                  >
                    {title}
                  </h2>
                  <div data-scope-reveal className="mt-5">
                    {children}
                  </div>
                </div>
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
