'use client'

import {useEffect, useRef, useState, type CSSProperties} from 'react'

export type ProposalOutcomeItem = {
  key: string
  title: string
  body: string
}

type ShaderKit = {
  Shader: typeof import('shaders/react').Shader
  Swirl: typeof import('shaders/react').Swirl
  ChromaFlow: typeof import('shaders/react').ChromaFlow
}

/**
 * Same motion as the marketing shader (Swirl + ChromaFlow, grain on top).
 * Colors stay in the sunrise: gold, apricot, sky, and a light ground,
 * so the ink type on this section still reads.
 */
const swirlColors = {
  colorA: '#f0b15a',
  colorB: '#7eb8f2',
  speed: 0.8,
  detail: 0.8,
  blend: 50,
  coarseX: 40,
  coarseY: 40,
  mediumX: 40,
  mediumY: 40,
  fineX: 40,
  fineY: 40,
} as const

const shaderStill: CSSProperties = {
  backgroundColor: '#c5d8f2',
  backgroundImage:
    'linear-gradient(105deg, rgba(126, 168, 234, 0.85) 0%, rgba(186, 206, 232, 0.35) 46%, rgba(232, 196, 140, 0.9) 100%)',
}

const chromaColors = {
  baseColor: '#ffe4c2',
  upColor: '#ffc857',
  downColor: '#f6f1ea',
  leftColor: '#ff9a73',
  rightColor: '#9ecfff',
  intensity: 0.9,
  radius: 1.8,
  momentum: 25,
  maskType: 'alpha',
  opacity: 0.97,
} as const

export function ProposalSwirlField({pace = 'section'}: {pace?: 'section' | 'slow'}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [kit, setKit] = useState<ShaderKit | null>(null)
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState(false)
  const [reduce, setReduce] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduce(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const node = rootRef.current
    if (!node) return

    const sync = (intersecting: boolean) => {
      setActive(intersecting && node.getClientRects().length > 0)
    }
    const observer = new IntersectionObserver(([entry]) => sync(entry.isIntersecting), {
      rootMargin: '240px',
    })
    observer.observe(node)
    const onResize = () => {
      const rect = node.getBoundingClientRect()
      sync(rect.bottom > -240 && rect.top < window.innerHeight + 240)
    }
    window.addEventListener('resize', onResize)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    if (!active || reduce) return
    let cancelled = false
    import('shaders/react')
      .then((mod) => {
        if (cancelled) return
        setKit({Shader: mod.Shader, Swirl: mod.Swirl, ChromaFlow: mod.ChromaFlow})
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [active, reduce])

  useEffect(() => {
    if (!kit || !active) return
    const node = rootRef.current
    if (!node) return

    const check = () => {
      const canvas = node.querySelector('canvas')
      if (canvas && canvas.width > 0 && canvas.height > 0) {
        setReady(true)
        return true
      }
      return false
    }
    if (check()) return

    const interval = window.setInterval(() => {
      if (check()) window.clearInterval(interval)
    }, 100)
    const fallback = window.setTimeout(() => setReady(true), 1500)
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(fallback)
    }
  }, [kit, active])

  const showShader = active && !reduce && kit
  const {Shader, Swirl, ChromaFlow} = kit ?? {}

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="proposal-outcome-field absolute inset-0" style={shaderStill} />
      {showShader && Shader && Swirl && ChromaFlow ? (
        <div className={`absolute inset-0 ${ready ? 'opacity-100' : 'opacity-0'}`}>
          <Shader className="h-full w-full">
            <Swirl {...swirlColors} speed={pace === 'slow' ? 0.16 : swirlColors.speed} />
            <ChromaFlow {...chromaColors} momentum={pace === 'slow' ? 6 : chromaColors.momentum} />
          </Shader>
          <div className="absolute inset-0 bg-white/20" />
        </div>
      ) : null}
      <div className="proposal-outcome-grain absolute inset-0" />
    </div>
  )
}

/**
 * The goal, on the shared shader. A fixed eyebrow, the delivery in one large
 * line, and a pill for each deliverable. On desktop the cards are a deck:
 * scrolling lifts the front card up under the situation sheet, and the next
 * card is already underneath. A click on a pill scrolls to that card.
 * ProposalPage renders this for the outcome slide.
 */
export function ProposalOutcomes({
  heading,
  cards,
}: {
  heading: string
  cards: ProposalOutcomeItem[]
}) {
  const rootRef = useRef<HTMLElement>(null)
  const [travel, setTravel] = useState(0)
  const [reduce, setReduce] = useState(false)
  const count = cards.length
  const active = Math.min(count - 1, Math.round(travel))

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduce(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root || count < 2 || reduce) return

    let frame = 0
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const scrollable = root.offsetHeight - window.innerHeight
        if (scrollable <= 8) return
        const progress = Math.min(1, Math.max(0, -root.getBoundingClientRect().top / scrollable))
        const next = progress * (count - 1)
        setTravel((previous) => (Math.abs(previous - next) < 0.004 ? previous : next))
      })
    }

    measure()
    window.addEventListener('scroll', measure, {passive: true})
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [count, reduce])

  const jump = (index: number) => {
    const root = rootRef.current
    if (!root) return
    const scrollable = root.offsetHeight - window.innerHeight
    if (scrollable <= 8 || reduce) {
      setTravel(index)
      return
    }
    const progress = count < 2 ? 0 : index / (count - 1)
    const top = window.scrollY + root.getBoundingClientRect().top + progress * scrollable
    window.scrollTo({top, behavior: 'smooth'})
  }

  if (count === 0) return null

  const onJump = count > 1 && !reduce ? jump : undefined

  return (
    <>
      <section className="relative flex min-h-dvh flex-col px-[max(3.5rem,var(--spacing-gutter))] pb-20 pt-40 md:hidden">
        <GoalCopy heading={heading} cards={cards} active={0} pills={false} />
        <OutcomeSwipe cards={cards} />
      </section>

      <section
        ref={rootRef}
        className="relative hidden h-auto md:block motion-safe:h-[calc(100dvh+(var(--outcome-steps)-1)*72dvh)]"
        style={{'--outcome-steps': count} as CSSProperties}
      >
        <div className="sticky top-0 flex h-dvh items-center px-[max(3.5rem,var(--spacing-gutter))] py-24 md:px-[max(4.5rem,var(--spacing-gutter))]">
          <div className="relative z-10 grid w-full items-center gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-6">
            <GoalCopy heading={heading} cards={cards} active={active} onJump={onJump} />
            {reduce ? (
              <ul className="grid gap-3">
                {cards.map((card, index) => (
                  <li key={card.key}>
                    <OutcomeCard title={card.title} body={card.body} index={index} />
                  </li>
                ))}
              </ul>
            ) : (
              <div id="outcome-card" className="relative h-[clamp(22rem,52vh,32rem)]">
                {cards.map((card, index) => {
                  const offset = index - travel
                  const leaving = offset > -1 && offset < 0
                  const gone = offset <= -1
                  const y = gone ? -140 : leaving ? offset * 140 : 0
                  return (
                    <div
                      key={card.key}
                      className="absolute inset-0"
                      style={{
                        transform: `translate3d(0, ${y}%, 0)`,
                        opacity: gone ? 0 : 1,
                        zIndex: leaving ? 30 : Math.max(1, 20 - index),
                      }}
                    >
                      <OutcomeCard title={card.title} body={card.body} index={index} tall />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function OutcomeSwipe({cards}: {cards: ProposalOutcomeItem[]}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [reduce, setReduce] = useState(false)
  const count = cards.length

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduce(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || count === 0) return

    let frame = 0
    const paint = () => {
      const slides = scroller.querySelectorAll<HTMLElement>('[data-outcome-slide]')
      const pad = Number.parseFloat(getComputedStyle(scroller).paddingLeft) || 0
      const origin = scroller.getBoundingClientRect().left + pad
      let closest = 0
      let best = Number.POSITIVE_INFINITY
      slides.forEach((slide, slideIndex) => {
        const rect = slide.getBoundingClientRect()
        const delta = Math.abs(rect.left - origin)
        if (!reduce) {
          const damp = delta < 12 ? 0 : Math.min((delta - 12) / Math.max(rect.width, 1), 1)
          slide.style.transform = `scale(${1 - damp * 0.045})`
          slide.style.opacity = String(1 - damp * 0.28)
        }
        if (delta < best) {
          best = delta
          closest = slideIndex
        }
      })
      const max = scroller.scrollWidth - scroller.clientWidth
      const progress = max <= 1 ? 1 : scroller.scrollLeft / max
      const filled = count < 2 ? 1 : (1 + progress * (count - 1)) / count
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${filled})`
      setIndex((previous) => (previous === closest ? previous : closest))
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(paint)
    }

    paint()
    scroller.addEventListener('scroll', onScroll, {passive: true})
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      scroller.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [count, reduce])

  const go = (next: number) => {
    const scroller = scrollerRef.current
    const slides = scroller?.querySelectorAll<HTMLElement>('[data-outcome-slide]')
    const slide = slides?.[next]
    const first = slides?.[0]
    if (!scroller || !slide || !first) return
    scroller.scrollTo({
      left: slide.offsetLeft - first.offsetLeft,
      behavior: reduce ? 'auto' : 'smooth',
    })
  }

  return (
    <div className="relative z-10 mt-6">
      <div
        ref={scrollerRef}
        data-outcome-swipe=""
        className="-mx-[max(3.5rem,var(--spacing-gutter))] flex snap-x snap-mandatory scroll-pl-[max(3.5rem,var(--spacing-gutter))] gap-3 overflow-x-auto overscroll-x-contain px-[max(3.5rem,var(--spacing-gutter))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card, cardIndex) => (
          <div
            key={card.key}
            data-outcome-slide
            className="w-[calc(100vw-7.5rem)] max-w-[26rem] shrink-0 snap-start"
          >
            <OutcomeCard title={card.title} body={card.body} index={cardIndex} />
          </div>
        ))}
      </div>
      {count > 1 ? (
        <div className="mt-4">
          <div className="h-px w-full bg-black/15">
            <div ref={fillRef} className="h-px w-full origin-left scale-x-0 bg-ink" />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {cards.map((card, cardIndex) => {
                const selected = cardIndex === index
                return (
                  <button
                    key={card.key}
                    type="button"
                    aria-label={card.title}
                    aria-current={selected ? 'true' : undefined}
                    onClick={() => go(cardIndex)}
                    className={`h-1.5 cursor-pointer rounded-full ${
                      selected ? 'w-4 bg-ink' : 'w-1.5 bg-black/25'
                    }`}
                  />
                )
              })}
            </div>
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
              {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function GoalCopy({
  heading,
  cards,
  active,
  onJump,
  pills = true,
}: {
  heading: string
  cards: ProposalOutcomeItem[]
  active: number
  onJump?: (index: number) => void
  pills?: boolean
}) {
  return (
    <div>
      <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
        The goal
      </p>
      {heading ? (
        <h2 className="mt-3 max-w-[7em] text-[clamp(3.25rem,5.6vw,6.5rem)] font-normal leading-[0.88] tracking-[-0.055em]">
          {heading}
        </h2>
      ) : null}
      {pills ? (
        <ul aria-label={heading || 'The goal'} className="mt-5 flex flex-col items-start gap-2">
          {cards.map((card, index) => {
            const selected = index === active
            const className = `rounded-full px-4 py-2 text-left text-[15px] font-medium leading-snug ${
              selected ? 'bg-ink text-paper' : 'bg-black/10 text-ink'
            }`
            return (
              <li key={card.key}>
                {onJump ? (
                  <button
                    type="button"
                    aria-current={selected ? 'true' : undefined}
                    aria-controls="outcome-card"
                    onClick={() => onJump(index)}
                    className={`cursor-pointer transition-colors ${selected ? '' : 'hover:bg-black/15'} ${className}`}
                  >
                    {card.title}
                  </button>
                ) : (
                  <p className={className}>{card.title}</p>
                )}
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

function OutcomeCard({
  title,
  body,
  index,
  tall,
}: {
  title: string
  body: string
  index: number
  tall?: boolean
}) {
  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-[32px] border border-white/80 bg-white/30 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_30px_80px_rgba(40,30,10,0.14)] backdrop-blur-[42px] lg:p-6 ${
        tall ? 'h-full' : 'min-h-[240px]'
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-white/80 blur-2xl"
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute -bottom-16 h-44 w-44 rounded-full blur-3xl ${
          index % 2 === 0 ? '-left-10 bg-[#7eb8f2]/35' : '-right-6 bg-[#f0b15a]/40'
        }`}
      />
      <p className="relative font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-[#8f8f8f]">
        {String(index + 1).padStart(2, '0')}
      </p>
      <div className="relative mt-auto">
        <h3 className="max-w-[11em] text-[clamp(1.85rem,2.8vw,2.75rem)] font-medium leading-[1.02] tracking-[-0.045em]">
          {title}
        </h3>
        {body ? (
          <p className="mt-3 max-w-[24em] text-[1.15rem] font-medium leading-snug text-foreground/75 md:text-[1.3rem]">
            {body}
          </p>
        ) : null}
      </div>
    </article>
  )
}
