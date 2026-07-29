'use client'

import {useGSAP} from '@gsap/react'
import {useCallback, useEffect, useId, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import {useLenis} from 'lenis/react'
import Link from 'next/link'

import {SidePanelClose} from '@/components/SidePanelClose'
import {EASE, gsap, prefersReducedMotion} from '@/components/motion/gsap'

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
  plans?: Array<{
    _key: string
    name: string
    price: string
    summary?: string | null
    features?: string[] | null
    highlight?: boolean | null
  }> | null
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
    /** One-line outcome — the “key thought” under the featured work card. */
    thought?: string | null
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

const sectionEyebrow =
  'flex items-center gap-2 self-start font-sans text-[18px] font-semibold tracking-[-0.01em] text-[#08090a]/55'

/**
 * Paper side drawer for a service’s “how it works” detail — shell and type
 * aligned with AboutPanel (Monolog-style gutters, dense body, pinned Close).
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
  const openRef = useRef(open)
  const lenis = useLenis()

  const close = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    if (open && content) {
      setCached(content)
      setPresent(true)
    }
  }, [open, content])

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

        const revealEls = gsap.utils.toArray<HTMLElement>('[data-panel-reveal]', panel)
        const tl = gsap.timeline()
        tl.to(
          backdrop,
          {
            opacity: 1,
            duration: reduced ? 0.01 : 0.55,
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
          return () => {
            tl.kill()
          }
        }

        if (revealEls.length) {
          gsap.set(revealEls, {opacity: 0, y: 18})
          tl.to(
            revealEls,
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              stagger: 0.07,
              ease: EASE.outCubic,
            },
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
          duration: reduced ? 0.01 : 0.45,
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
    lenis?.stop()
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
  const deliverables = (cached.deliverables ?? []).filter((row) => row.title?.trim())
  const plans = (cached.plans ?? []).filter((plan) => plan.name?.trim() && plan.price?.trim())
  const steps = (cached.steps ?? []).filter((step) => step.text?.trim())
  const projects = (cached.projects ?? []).filter((project) => project.title)
  const featuredProject = projects[0] ?? null
  const featuredThought =
    featuredProject?.thought?.trim() || featuredProject?.title || null
  const featuredLabel =
    featuredProject?.client?.trim() || featuredProject?.title || null
  const testimonials = (cached.testimonials ?? []).filter((item) => item.quote && item.author)
  const nextStep = cached.nextStep
  const displayTitle = cached.headline?.trim() || cached.title
  const eyebrow = cached.eyebrow?.trim() || 'How it works'

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
        aria-label="Dismiss panel"
        tabIndex={interactive ? 0 : -1}
        onClick={close}
        className="absolute inset-0 bg-black/70 opacity-0 backdrop-blur-[6px] supports-[backdrop-filter]:bg-black/55"
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-full max-w-[min(100vw,45rem)] flex-col bg-[#f3f3f3] text-[#08090a] shadow-[-24px_0_80px_rgba(0,0,0,0.35)] will-change-transform"
      >
        <SidePanelClose open={open && present} onClose={close} ariaLabel="Close panel" />

        <div
          data-lenis-prevent
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
        >
          <div className="px-5 pb-[56px] pt-[40px] md:px-[28px]">
            <p
              data-panel-reveal
              className="flex items-center gap-2 pr-[88px] font-sans text-[18px] font-semibold tracking-[-0.01em] text-[#08090a]/55 md:pr-[110px]"
            >
              <span aria-hidden className="inline-block size-1.5 rounded-full bg-[#08090a]/35" />
              {eyebrow}
            </p>

            <h2
              id={titleId}
              data-panel-reveal
              className="mt-[28px] font-sans text-[clamp(1.75rem,3.6vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-[#08090a]"
            >
              {displayTitle}
            </h2>

            <div
              data-panel-reveal
              className="mt-[28px] space-y-[22px] text-[18px] font-medium leading-[1.2] tracking-[-0.015em] text-[#08090a] md:text-[24px] md:leading-[1.1]"
            >
              {paragraphs.map((paragraph, i) => (
                <p key={`${i}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
              ))}
              {cached.sceneLine?.trim() ? <p>{cached.sceneLine.trim()}</p> : null}
            </div>

            {nextStep || cached.fitCheck ? (
              <div
                data-panel-reveal
                className="mt-[22px] flex flex-col items-start gap-[14px] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3"
              >
                {nextStep ? (
                  <Link
                    href={nextStep.href}
                    onClick={close}
                    className="group inline-flex items-center gap-[0.4em] border-b border-[#08090a]/35 pb-[2px] font-sans text-[18px] font-semibold tracking-[-0.015em] text-[#08090a] transition-[border-color] duration-300 hover:border-[#08090a] md:text-[20px]"
                  >
                    <span>{nextStep.buttonLabel}</span>
                    <span
                      aria-hidden
                      className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[5px]"
                    >
                      →
                    </span>
                  </Link>
                ) : null}
                {cached.fitCheck ? (
                  <Link
                    href={cached.fitCheck.href}
                    onClick={close}
                    className="group inline-flex items-center gap-[0.4em] font-sans text-[16px] font-medium tracking-[-0.015em] text-[#08090a]/55 transition-colors hover:text-[#08090a] md:text-[17px]"
                  >
                    <span>{cached.fitCheck.label}</span>
                    <span
                      aria-hidden
                      className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[4px]"
                    >
                      →
                    </span>
                  </Link>
                ) : null}
              </div>
            ) : null}

            {cached.meta || cached.timelineLine ? (
              <div
                data-panel-reveal
                className="mt-[64px] flex flex-col gap-0 font-mono text-[10px] uppercase tracking-[0.14em] text-[#08090a]/40 md:text-[11px]"
              >
                {cached.meta ? <p className="leading-none">{cached.meta}</p> : null}
                {cached.timelineLine ? (
                  <p className="leading-none text-[#08090a]/30">{cached.timelineLine}</p>
                ) : null}
              </div>
            ) : null}

            {featuredProject ? (
              <div data-panel-reveal className="mt-[20px]">
                {featuredProject.slug ? (
                  <Link
                    href={`/projects/${featuredProject.slug}`}
                    onClick={close}
                    className="group block"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#08090a]/08">
                      {featuredProject.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={featuredProject.imageUrl}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                        />
                      ) : null}
                    </div>
                    {featuredThought ? (
                      <p className="mt-[22px] font-sans text-[20px] font-medium leading-[1.15] tracking-[-0.015em] text-[#08090a] md:text-[22px]">
                        {featuredThought}
                      </p>
                    ) : null}
                  </Link>
                ) : (
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#08090a]/08">
                      {featuredProject.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={featuredProject.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    {featuredThought ? (
                      <p className="mt-[22px] font-sans text-[20px] font-medium leading-[1.15] tracking-[-0.015em] text-[#08090a] md:text-[22px]">
                        {featuredThought}
                      </p>
                    ) : null}
                  </div>
                )}

                <div className="mt-[16px] flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                  {featuredLabel ? (
                    <p className="font-mono text-[11px] uppercase tracking-label text-[#08090a]/40">
                      {featuredLabel}
                    </p>
                  ) : (
                    <span />
                  )}
                  <Link
                    href={
                      featuredProject.slug
                        ? `/projects/${featuredProject.slug}`
                        : '/work'
                    }
                    onClick={close}
                    className="group inline-flex items-center gap-[0.4em] font-sans text-[16px] font-medium tracking-[-0.015em] text-[#08090a]/75 transition-colors hover:text-[#08090a]"
                  >
                    <span>{featuredProject.slug ? 'View project' : 'View more work'}</span>
                    <span
                      aria-hidden
                      className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[5px]"
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            ) : cached.imageUrl ? (
              <div
                data-panel-reveal
                className="relative mt-[20px] aspect-[16/11] w-full overflow-hidden bg-[#08090a]/08"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cached.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}

            {steps.length > 0 ? (
              <section data-panel-reveal className="mt-[56px] md:mt-[64px]">
                <div className="grid gap-[24px] md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-[40px]">
                  <p className={sectionEyebrow}>
                    <span aria-hidden className="inline-block size-1.5 rounded-full bg-[#08090a]/35" />
                    {cached.stepsLabel?.trim() || 'How we work'}
                  </p>
                  <ul className="space-y-[28px] md:space-y-[32px]">
                    {steps.map((step) => (
                      <li key={step._key}>
                        {step.lead?.trim() ? (
                          <p className="font-sans text-[20px] font-medium leading-[1.15] tracking-[-0.015em] text-[#08090a] md:text-[22px]">
                            {step.lead.trim()}
                          </p>
                        ) : null}
                        <p
                          className={`text-[16px] font-medium leading-[1.25] tracking-[-0.01em] text-[#08090a]/65 md:text-[17px] ${
                            step.lead?.trim() ? 'mt-[8px]' : ''
                          }`}
                        >
                          {step.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : null}

            {deliverables.length > 0 ? (
              <section data-panel-reveal className="mt-[56px] md:mt-[64px]">
                <div className="grid gap-[24px] md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-[40px]">
                  <p className={sectionEyebrow}>
                    <span aria-hidden className="inline-block size-1.5 rounded-full bg-[#08090a]/35" />
                    What you get
                  </p>
                  <ul className="space-y-[28px] md:space-y-[32px]">
                    {deliverables.map((row) => (
                      <li key={row._key}>
                        <p className="font-sans text-[20px] font-medium leading-[1.15] tracking-[-0.015em] text-[#08090a] md:text-[22px]">
                          {row.title}
                        </p>
                        {row.detail?.trim() ? (
                          <p className="mt-[8px] text-[16px] font-medium leading-[1.25] tracking-[-0.01em] text-[#08090a]/65 md:text-[17px]">
                            {row.detail.trim()}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : null}

            {plans.length > 0 ? (
              <section data-panel-reveal className="mt-[56px] md:mt-[64px]">
                <div className="grid gap-[24px] md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-[40px]">
                  <p className={sectionEyebrow}>
                    <span aria-hidden className="inline-block size-1.5 rounded-full bg-[#08090a]/35" />
                    Plans
                  </p>
                  <div className="grid gap-[16px] sm:grid-cols-2">
                    {plans.map((plan) => (
                      <div
                        key={plan._key}
                        className={`flex flex-col rounded-sm border p-[20px] ${
                          plan.highlight
                            ? 'border-[#e42927]/40 bg-[#e42927]/[0.04]'
                            : 'border-[#08090a]/12'
                        }`}
                      >
                        <p className="font-sans text-[20px] font-medium leading-[1.1] tracking-[-0.015em] text-[#08090a] md:text-[22px]">
                          {plan.name}
                        </p>
                        <p className="mt-[6px] font-mono text-[12px] uppercase tracking-label text-[#08090a]/55">
                          {plan.price}
                        </p>
                        {plan.summary?.trim() ? (
                          <p className="mt-[12px] text-[15px] font-medium leading-[1.3] tracking-[-0.01em] text-[#08090a]/65">
                            {plan.summary.trim()}
                          </p>
                        ) : null}
                        {plan.features && plan.features.length > 0 ? (
                          <ul className="mt-[16px] space-y-[8px] text-[14px] font-medium leading-[1.3] tracking-[-0.01em] text-[#08090a]/70">
                            {plan.features.map((feature) => (
                              <li key={feature} className="flex gap-[8px]">
                                <span
                                  aria-hidden
                                  className="mt-[0.5em] inline-block size-[4px] shrink-0 rounded-full bg-[#08090a]/40"
                                />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {testimonials.length > 0 ? (
              <section data-panel-reveal className="mt-[56px] md:mt-[64px]">
                <div className="grid gap-[24px] md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-[40px]">
                  <p className={sectionEyebrow}>
                    <span aria-hidden className="inline-block size-1.5 rounded-full bg-[#08090a]/35" />
                    From clients
                  </p>
                  <div className="space-y-[28px]">
                    {testimonials.map((item) => (
                      <blockquote key={item._id}>
                        <p className="text-[18px] font-medium leading-[1.2] tracking-[-0.015em] text-[#08090a] md:text-[20px]">
                          “{item.quote}”
                        </p>
                        <footer className="mt-3 font-mono text-[11px] uppercase tracking-label text-[#08090a]/45">
                          {item.author}
                          {item.role ? ` — ${item.role}` : ''}
                        </footer>
                      </blockquote>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {nextStep?.subhead?.trim() ? (
              <section
                data-panel-reveal
                className="mt-[56px] rounded-sm bg-[#08090a] px-[24px] py-[28px] text-[#f3f3f3] md:mt-[64px] md:px-[28px] md:py-[32px]"
              >
                <div className="grid gap-[24px] md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-[40px]">
                  <p className="flex items-center gap-2 self-start font-sans text-[18px] font-semibold tracking-[-0.01em] text-white/55">
                    <span aria-hidden className="inline-block size-1.5 rounded-full bg-white/40" />
                    Next step
                  </p>
                  <div>
                    <p className="text-[20px] font-medium leading-[1.15] tracking-[-0.015em] text-white md:text-[22px]">
                      {nextStep.subhead.trim()}
                    </p>
                    <div className="mt-[24px]">
                      <Link
                        href={nextStep.href}
                        onClick={close}
                        className="inline-flex items-center rounded-sm bg-[#f3f3f3] px-4 py-3 font-mono text-[11px] uppercase tracking-label text-[#08090a] transition-opacity hover:opacity-85"
                      >
                        {nextStep.buttonLabel}
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
