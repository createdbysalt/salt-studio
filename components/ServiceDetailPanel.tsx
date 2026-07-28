'use client'

import {useCallback, useEffect, useId, useLayoutEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import {useLenis} from 'lenis/react'
import Link from 'next/link'

import {gsap, prefersReducedMotion} from '@/components/motion/gsap'

export type ServiceDetailPanelContent = {
  title: string
  headline?: string | null
  eyebrow?: string | null
  body: string
  meta?: string | null
  timelineLine?: string | null
  timeline?: Array<{
    _key: string
    label: string
    duration: string
    detail?: string | null
  }> | null
  sceneLine?: string | null
  imageUrl?: string | null
  deliverables?: Array<{_key: string; title: string; detail?: string | null}> | null
  capabilities?: Array<{_id: string; name: string; kind?: string | null}> | null
  idealFor?: string[] | null
  notAFit?: string[] | null
  stepsLabel?: string | null
  steps?: Array<{_key: string; lead?: string | null; text: string}> | null
  projects?: Array<{
    _id: string
    title: string
    slug?: string | null
    client?: string | null
    imageUrl?: string | null
  }> | null
  testimonials?: Array<{
    _id: string
    quote: string
    author: string
    role?: string | null
  }> | null
  clients?: Array<{_id: string; name: string}> | null
  proofAnchor?: string | null
  nextStep?: {
    subhead?: string | null
    buttonLabel: string
    href: string
  } | null
  routingLine?: string | null
}

type ServiceDetailPanelProps = {
  open: boolean
  onClose: () => void
  content: ServiceDetailPanelContent | null
}

/**
 * Paper side drawer for a service’s “how it works” detail — GSAP slide with
 * a long expo ease (same floaty deceleration as Lenis scroll, pushed a notch).
 */
export function ServiceDetailPanel({open, onClose, content}: ServiceDetailPanelProps) {
  const titleId = useId()
  const [mounted, setMounted] = useState(false)
  const [present, setPresent] = useState(false)
  const [interactive, setInteractive] = useState(false)
  const [cached, setCached] = useState<ServiceDetailPanelContent | null>(null)

  const backdropRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const openRef = useRef(open)
  const lenis = useLenis()

  const close = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    openRef.current = open
  }, [open])

  // Keep content cached while open; mount the portal as soon as we open.
  useEffect(() => {
    if (open && content) {
      setCached(content)
      setPresent(true)
    }
  }, [open, content])

  // Drive enter / leave with GSAP (Lenis-like float, slightly exaggerated).
  useLayoutEffect(() => {
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

      const tl = gsap.timeline()
      tl.to(
        backdrop,
        {
          opacity: 1,
          duration: reduced ? 0.01 : 0.85,
          ease: 'power2.out',
        },
        0,
      )
      tl.to(
        panel,
        {
          xPercent: 0,
          duration: reduced ? 0.01 : 1.05,
          ease: 'expo.out',
        },
        0,
      )

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
    tl.to(
      panel,
      {
        xPercent: 100,
        duration: reduced ? 0.01 : 0.7,
        ease: 'power3.in',
      },
      0,
    )
    tl.to(
      backdrop,
      {
        opacity: 0,
        duration: reduced ? 0.01 : 0.55,
        ease: 'power2.in',
      },
      0,
    )

    return () => {
      tl.kill()
    }
  }, [present, open])

  useEffect(() => {
    if (!present) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Stop Lenis so wheel/trackpad only scrolls the panel, not the page behind.
    lenis?.stop()
    // Hide glass nav while open — backdrop-filter would otherwise smear it white.
    document.documentElement.dataset.servicePanelOpen = ''
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prev
      lenis?.start()
      delete document.documentElement.dataset.servicePanelOpen
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [present, close, lenis])

  if (!mounted || !present || !cached) return null

  const paragraphs = cached.body
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
  const timeline = (cached.timeline ?? []).filter(
    (phase) => phase.label?.trim() && phase.duration?.trim(),
  )
  const deliverables = (cached.deliverables ?? []).filter((row) => row.title?.trim())
  const capabilities = (cached.capabilities ?? []).filter((cap) => cap.name?.trim())
  const idealFor = (cached.idealFor ?? []).filter((line) => line.trim())
  const notAFit = (cached.notAFit ?? []).filter((line) => line.trim())
  const steps = (cached.steps ?? []).filter((step) => step.text?.trim())
  const projects = (cached.projects ?? []).filter((project) => project.title)
  const testimonials = (cached.testimonials ?? []).filter((item) => item.quote && item.author)
  const clients = (cached.clients ?? []).filter((client) => client.name?.trim())
  const nextStep = cached.nextStep
  const displayTitle = cached.headline?.trim() || cached.title

  return createPortal(
    <div
      data-lenis-prevent
      className={`fixed inset-0 z-[180] ${interactive ? '' : 'pointer-events-none'}`}
      aria-hidden={!interactive}
    >
      <button
        ref={backdropRef}
        type="button"
        aria-label="Close panel"
        tabIndex={interactive ? 0 : -1}
        onClick={close}
        className="absolute inset-0 bg-black/55 opacity-0 backdrop-blur-[6px] supports-[backdrop-filter]:bg-black/40"
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-full max-w-[min(100vw,40rem)] flex-col bg-[#f3f3f3] text-[#08090a] shadow-[-32px_0_100px_rgba(0,0,0,0.45)] will-change-transform"
      >
        <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-5 md:py-5">
          <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
            <span aria-hidden className="inline-block size-1.5 rounded-full bg-[#08090a]/35" />
            {cached.eyebrow?.trim() || 'How it works'}
          </p>

          <button
            type="button"
            onClick={close}
            aria-label="Close panel"
            className="group inline-flex items-center gap-2 rounded-sm bg-[#08090a] py-1.5 pl-3.5 pr-1.5 font-mono text-[11px] uppercase tracking-label text-white transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:opacity-90 active:scale-[0.98]"
          >
            <span>Close</span>
            <span
              aria-hidden
              className="rounded-[3px] bg-white/15 px-1.5 py-[5px] text-[10px] tracking-[0.08em] text-white/75 transition-colors duration-300 group-hover:bg-white/20 group-hover:text-white/90"
            >
              ESC
            </span>
          </button>
        </div>

        <div
          data-lenis-prevent
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
        >
          <div className="px-4 pb-8 pt-2 md:px-5 md:pb-10 md:pt-4">
            <h2
              id={titleId}
              className="font-sans text-[clamp(2rem,4vw,3.25rem)] font-bold uppercase leading-[0.95] tracking-[-0.04em]"
            >
              {displayTitle}
            </h2>

            <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-[#08090a]/75 md:mt-10 md:text-base">
              {paragraphs.map((paragraph, i) => (
                <p key={`${i}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
              ))}
            </div>

            {cached.sceneLine?.trim() ? (
              <p className="mt-6 text-[15px] leading-relaxed text-[#08090a]/70 md:text-base">
                {cached.sceneLine.trim()}
              </p>
            ) : null}

            {cached.meta || cached.timelineLine ? (
              <div className="mt-8 flex flex-col gap-2 font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                {cached.meta ? <p>{cached.meta}</p> : null}
                {cached.timelineLine ? <p>{cached.timelineLine}</p> : null}
              </div>
            ) : null}

            {timeline.length > 0 ? (
              <div className="mt-12">
                <p className="font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                  Timeline
                </p>
                <ol className="mt-5 space-y-5">
                  {timeline.map((phase, index) => (
                    <li key={phase._key} className="flex gap-4 text-[15px] leading-relaxed md:text-base">
                      <span className="font-mono text-[11px] uppercase tracking-label text-[#08090a]/40">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-[#08090a]">
                          {phase.label}
                          <span className="ml-2 font-mono text-[11px] font-normal uppercase tracking-label text-[#08090a]/45">
                            {phase.duration}
                          </span>
                        </p>
                        {phase.detail?.trim() ? (
                          <p className="mt-1 text-[14px] leading-relaxed text-[#08090a]/65">
                            {phase.detail.trim()}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {deliverables.length > 0 ? (
              <div className="mt-12">
                <p className="font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                  What you get
                </p>
                <ul className="mt-5 space-y-4">
                  {deliverables.map((row) => (
                    <li key={row._key}>
                      <p className="text-[15px] font-medium leading-snug text-[#08090a] md:text-base">
                        {row.title}
                      </p>
                      {row.detail?.trim() ? (
                        <p className="mt-1 text-[14px] leading-relaxed text-[#08090a]/65">
                          {row.detail.trim()}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {capabilities.length > 0 ? (
              <div className="mt-12">
                <p className="font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                  Capabilities
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-[#08090a]/75 md:text-base">
                  {capabilities.map((cap) => cap.name).join(' · ')}
                </p>
              </div>
            ) : null}

            {idealFor.length > 0 || notAFit.length > 0 ? (
              <div className="mt-12 grid gap-8 sm:grid-cols-2">
                {idealFor.length > 0 ? (
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                      Good fit if
                    </p>
                    <ul className="mt-4 space-y-2 text-[14px] leading-snug text-[#08090a]/75">
                      {idealFor.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {notAFit.length > 0 ? (
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                      Not a fit if
                    </p>
                    <ul className="mt-4 space-y-2 text-[14px] leading-snug text-[#08090a]/75">
                      {notAFit.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}

            {steps.length > 0 ? (
              <div className="mt-12">
                {cached.stepsLabel?.trim() ? (
                  <p className="font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                    {cached.stepsLabel}
                  </p>
                ) : null}
                <ol className="mt-5 space-y-5">
                  {steps.map((step, index) => (
                    <li key={step._key} className="flex gap-4 text-[15px] leading-relaxed md:text-base">
                      <span className="font-mono text-[11px] uppercase tracking-label text-[#08090a]/40">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="min-w-0 text-[#08090a]/75">
                        {step.lead?.trim() ? (
                          <span className="font-medium text-[#08090a]">{step.lead.trim()} </span>
                        ) : null}
                        {step.text}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {projects.length > 0 ? (
              <div className="mt-12">
                <p className="font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                  Selected work
                </p>
                <ul className="mt-5 space-y-3">
                  {projects.map((project) => {
                    const inner = (
                      <>
                        {project.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={project.imageUrl}
                            alt=""
                            className="h-14 w-20 shrink-0 object-cover"
                          />
                        ) : (
                          <span className="h-14 w-20 shrink-0 bg-[#08090a]/08" aria-hidden />
                        )}
                        <span className="min-w-0">
                          <span className="block font-sans text-base font-semibold uppercase leading-tight tracking-[-0.02em]">
                            {project.title}
                          </span>
                          {project.client ? (
                            <span className="mt-1 block font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                              {project.client}
                            </span>
                          ) : null}
                        </span>
                      </>
                    )

                    return (
                      <li key={project._id}>
                        {project.slug ? (
                          <Link
                            href={`/projects/${project.slug}`}
                            onClick={close}
                            className="flex items-center gap-4 transition-opacity hover:opacity-70"
                          >
                            {inner}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-4">{inner}</div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : null}

            {testimonials.length > 0 ? (
              <div className="mt-12 space-y-8">
                <p className="font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                  From clients
                </p>
                {testimonials.map((item) => (
                  <blockquote key={item._id}>
                    <p className="text-[15px] leading-relaxed text-[#08090a]/80 md:text-base">
                      “{item.quote}”
                    </p>
                    <footer className="mt-3 font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                      {item.author}
                      {item.role ? ` — ${item.role}` : ''}
                    </footer>
                  </blockquote>
                ))}
              </div>
            ) : null}

            {clients.length > 0 ? (
              <div className="mt-12">
                <p className="font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                  Clients
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-[#08090a]/75 md:text-base">
                  {clients.map((client) => client.name).join(' · ')}
                </p>
              </div>
            ) : null}

            {cached.proofAnchor?.trim() ? (
              <p className="mt-12 text-[15px] leading-relaxed text-[#08090a]/75 md:text-base">
                {cached.proofAnchor.trim()}
              </p>
            ) : null}

            {nextStep || cached.routingLine?.trim() ? (
              <div className="mt-14 border-t border-[#08090a]/10 pt-8">
                {nextStep?.subhead?.trim() ? (
                  <p className="text-[15px] leading-snug text-[#08090a]/70 md:text-base">
                    {nextStep.subhead}
                  </p>
                ) : null}
                {nextStep ? (
                  <Link
                    href={nextStep.href}
                    onClick={close}
                    className="mt-5 inline-flex items-center rounded-sm bg-[#08090a] px-4 py-3 font-mono text-[11px] uppercase tracking-label text-white transition-opacity hover:opacity-85"
                  >
                    {nextStep.buttonLabel}
                  </Link>
                ) : null}
                {cached.routingLine?.trim() ? (
                  <p className="mt-5 text-[14px] leading-relaxed text-[#08090a]/55">
                    {cached.routingLine.trim()}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          {cached.imageUrl ? (
            <div className="relative mt-auto aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#08090a]/08 md:aspect-[16/11]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cached.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </aside>
    </div>,
    document.body,
  )
}
