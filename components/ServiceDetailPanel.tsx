'use client'

import {useGSAP} from '@gsap/react'
import {useCallback, useEffect, useId, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import {useLenis} from 'lenis/react'
import Link from 'next/link'

import {EASE, gsap, prefersReducedMotion, SplitText} from '@/components/motion/gsap'

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
  fitCheck?: {label: string; href: string} | null
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

  const rootRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
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

  // Drawer + content choreography — same useGSAP / SplitText path as LineReveal.
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

        const titleEl = titleRef.current
        const bodyEl = bodyRef.current
        const revealEls = gsap.utils.toArray<HTMLElement>('[data-panel-reveal]', panel)
        const splits: Array<{revert: () => void}> = []

        const tl = gsap.timeline()
        tl.to(
          backdrop,
          {
            opacity: 1,
            duration: reduced ? 0.01 : 0.85,
            ease: EASE.outCubic,
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

        if (reduced) {
          gsap.set(revealEls, {clearProps: 'opacity,transform'})
          gsap.set(
            gsap.utils.toArray<HTMLElement>(
              '[data-timeline-rail], [data-timeline-phase]',
              panel,
            ),
            {clearProps: 'opacity,transform'},
          )
          return () => {
            tl.kill()
          }
        }

        if (revealEls.length) gsap.set(revealEls, {opacity: 0, y: 22})

        const lineTargets: Element[] = []
        if (titleEl) {
          const split = SplitText.create(titleEl, {type: 'lines', mask: 'lines'})
          splits.push(split)
          lineTargets.push(...split.lines)
        }
        if (bodyEl) {
          const split = SplitText.create(bodyEl, {type: 'lines', mask: 'lines'})
          splits.push(split)
          lineTargets.push(...split.lines)
        }

        if (lineTargets.length) {
          gsap.set(lineTargets, {yPercent: 140, opacity: 0})
          tl.to(
            lineTargets,
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.85,
              stagger: 0.045,
              ease: EASE.outCubic,
            },
            0.18,
          )
        }

        if (revealEls.length) {
          tl.to(
            revealEls,
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: EASE.outCubic,
            },
            0.42,
          )
        }

        // Horizontal timeline: draw the rail, then stagger phases in.
        const timelineRail = panel.querySelector<HTMLElement>('[data-timeline-rail]')
        const timelinePhases = gsap.utils.toArray<HTMLElement>('[data-timeline-phase]', panel)
        if (timelineRail) gsap.set(timelineRail, {scaleX: 0, transformOrigin: 'left center'})
        if (timelinePhases.length) gsap.set(timelinePhases, {opacity: 0, y: 16})
        if (timelineRail) {
          tl.to(
            timelineRail,
            {scaleX: 1, duration: 0.75, ease: EASE.outQuint},
            0.55,
          )
        }
        if (timelinePhases.length) {
          tl.to(
            timelinePhases,
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
              stagger: 0.1,
              ease: EASE.outCubic,
            },
            0.7,
          )
        }

        return () => {
          tl.kill()
          splits.forEach((split) => split.revert())
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
          ease: EASE.outCubic,
        },
        0,
      )

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
  const featuredProject = projects[0] ?? null
  const testimonials = (cached.testimonials ?? []).filter((item) => item.quote && item.author)
  const nextStep = cached.nextStep
  const displayTitle = cached.headline?.trim() || cached.title

  return createPortal(
    <div
      ref={rootRef}
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
        className="absolute inset-y-0 right-0 flex w-full max-w-[min(100vw,48rem)] flex-col bg-[#f3f3f3] text-[#08090a] shadow-[-32px_0_100px_rgba(0,0,0,0.45)] will-change-transform"
      >
        <div className="flex items-center justify-between gap-4 px-5 py-3 md:px-7 md:py-3.5">
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
          <div className="px-5 pb-8 pt-0 md:px-7 md:pb-10">
            <h2
              ref={titleRef}
              id={titleId}
              className="font-sans text-[clamp(2rem,4vw,3.25rem)] font-bold uppercase leading-[0.95] tracking-[-0.04em]"
            >
              {displayTitle}
            </h2>

            <div
              ref={bodyRef}
              className="mt-4 space-y-3 text-base leading-[1.45] text-[#08090a]/75 md:mt-5 md:text-lg md:leading-[1.5]"
            >
              {paragraphs.map((paragraph, i) => (
                <p key={`${i}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
              ))}
              {cached.sceneLine?.trim() ? (
                <p className="text-[#08090a]/70">{cached.sceneLine.trim()}</p>
              ) : null}
            </div>

            {cached.meta || cached.timelineLine || nextStep || cached.fitCheck ? (
              <div data-panel-reveal className="mt-5 border-t border-[#08090a]/10 pt-5">
                {cached.meta || cached.timelineLine ? (
                  <div className="flex flex-col gap-2 font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                    {cached.meta ? <p>{cached.meta}</p> : null}
                    {cached.timelineLine ? <p>{cached.timelineLine}</p> : null}
                  </div>
                ) : null}
                {nextStep || cached.fitCheck ? (
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {nextStep ? (
                      <Link
                        href={nextStep.href}
                        onClick={close}
                        className="inline-flex items-center rounded-sm bg-[#08090a] px-4 py-3 font-mono text-[11px] uppercase tracking-label text-white transition-opacity hover:opacity-85"
                      >
                        {nextStep.buttonLabel}
                      </Link>
                    ) : null}
                    {cached.fitCheck ? (
                      <Link
                        href={cached.fitCheck.href}
                        onClick={close}
                        className="inline-flex items-center rounded-sm border border-[#08090a]/25 px-4 py-3 font-mono text-[11px] uppercase tracking-label text-[#08090a] transition-colors hover:border-[#08090a]/50"
                      >
                        {cached.fitCheck.label}
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {capabilities.length > 0 ? (
              <div data-panel-reveal className="mt-10">
                <p className="font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                  Capabilities
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {capabilities.map((cap) => (
                    <li
                      key={cap._id}
                      className="inline-flex items-center rounded-full border border-[#08090a]/12 bg-[#08090a]/5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-label text-[#08090a]/70"
                    >
                      {cap.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {idealFor.length > 0 || notAFit.length > 0 ? (
              <div data-panel-reveal className="mt-12 grid gap-8 sm:grid-cols-2">
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

            {timeline.length > 0 ? (
              <div className="mt-12">
                <p className="font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                  Timeline
                </p>

                <div className="relative mt-7">
                  {/* Horizontal spine — sm+; GSAP draws it via scaleX */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute top-[5px] right-[calc(100%/6)] left-[calc(100%/6)] hidden h-px sm:block"
                  >
                    <span
                      data-timeline-rail
                      className="block h-full origin-left bg-[#08090a]/18"
                    />
                  </div>

                  <ol className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-4">
                    {timeline.map((phase, index) => (
                      <li
                        key={phase._key}
                        data-timeline-phase
                        className="relative min-w-0"
                      >
                        <span
                          aria-hidden
                          className={`mb-4 block size-2.5 rounded-full ring-[5px] ring-[#f3f3f3] sm:mx-auto ${
                            index === 0 ? 'bg-[#e42927]' : 'bg-[#08090a]/55'
                          }`}
                        />
                        <p className="font-mono text-[11px] uppercase tracking-label text-[#08090a]/45 sm:text-center">
                          {phase.duration}
                        </p>
                        <p className="mt-1.5 font-sans text-[1.0625rem] font-semibold leading-tight tracking-[-0.02em] text-[#08090a] sm:text-center md:text-[1.125rem]">
                          {phase.label}
                        </p>
                        {phase.detail?.trim() ? (
                          <p className="mt-2 text-[13px] leading-relaxed text-[#08090a]/65 sm:text-center md:text-[14px]">
                            {phase.detail.trim()}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : null}

            {steps.length > 0 ? (
              <div data-panel-reveal className="mt-12">
                {cached.stepsLabel?.trim() ? (
                  <p className="font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                    {cached.stepsLabel}
                  </p>
                ) : null}
                <ol className="mt-5 space-y-5">
                  {steps.map((step, index) => (
                    <li
                      key={step._key}
                      className="flex gap-4 text-[15px] leading-relaxed md:text-base"
                    >
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

            {deliverables.length > 0 ? (
              <div data-panel-reveal className="mt-12">
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

            {featuredProject ? (
              <div data-panel-reveal className="mt-12">
                <p className="font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                  Selected work
                </p>
                <div className="mt-5">
                  {featuredProject.slug ? (
                    <Link
                      href={`/projects/${featuredProject.slug}`}
                      onClick={close}
                      className="block transition-opacity hover:opacity-70"
                    >
                      {featuredProject.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={featuredProject.imageUrl}
                          alt=""
                          className="aspect-[16/10] w-full object-cover"
                        />
                      ) : (
                        <span
                          className="block aspect-[16/10] w-full bg-[#08090a]/08"
                          aria-hidden
                        />
                      )}
                      <span className="mt-4 block font-sans text-base font-semibold uppercase leading-tight tracking-[-0.02em] md:text-lg">
                        {featuredProject.title}
                      </span>
                      {featuredProject.client ? (
                        <span className="mt-1.5 block font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                          {featuredProject.client}
                        </span>
                      ) : null}
                    </Link>
                  ) : (
                    <div>
                      {featuredProject.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={featuredProject.imageUrl}
                          alt=""
                          className="aspect-[16/10] w-full object-cover"
                        />
                      ) : (
                        <span
                          className="block aspect-[16/10] w-full bg-[#08090a]/08"
                          aria-hidden
                        />
                      )}
                      <p className="mt-4 font-sans text-base font-semibold uppercase leading-tight tracking-[-0.02em] md:text-lg">
                        {featuredProject.title}
                      </p>
                      {featuredProject.client ? (
                        <p className="mt-1.5 font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                          {featuredProject.client}
                        </p>
                      ) : null}
                    </div>
                  )}
                  <Link
                    href="/work"
                    onClick={close}
                    className="mt-6 inline-flex items-center rounded-sm border border-[#08090a]/25 px-4 py-3 font-mono text-[11px] uppercase tracking-label text-[#08090a] transition-colors hover:border-[#08090a]/50"
                  >
                    View more work
                  </Link>
                </div>
              </div>
            ) : null}

            {testimonials.length > 0 ? (
              <div data-panel-reveal className="mt-12 space-y-8">
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

            {cached.proofAnchor?.trim() ? (
              <p
                data-panel-reveal
                className="mt-12 text-[15px] leading-relaxed text-[#08090a]/75 md:text-base"
              >
                {cached.proofAnchor.trim()}
              </p>
            ) : null}
          </div>

          {cached.imageUrl ? (
            <div
              data-panel-reveal
              className="relative mt-auto aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#08090a]/08 md:aspect-[16/11]"
            >
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
