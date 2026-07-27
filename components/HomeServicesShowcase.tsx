'use client'

import {ArrowUpRight} from 'lucide-react'
import Link from 'next/link'
import {useState} from 'react'

export type HomeServiceCard = {
  _key: string
  title: string
  body: string
  priceLine?: string | null
  linkLabel?: string | null
}

type HomeServicesShowcaseProps = {
  label?: string | null
  statement: string
  cards: HomeServiceCard[]
  href?: string
}

/**
 * TinyWins-style services band: oversized bordered statement + numbered
 * service switcher. Hover/focus a number to reveal that service.
 */
export function HomeServicesShowcase({
  label = 'What we do',
  statement,
  cards,
  href = '/capabilities',
}: HomeServicesShowcaseProps) {
  const [active, setActive] = useState(0)
  const card = cards[active] ?? cards[0]
  if (!card) return null

  return (
    <section className="flex min-h-[100dvh] flex-col border-t border-foreground/15 bg-background text-foreground">
      <div className="flex flex-1 flex-col px-3 pt-6 sm:px-4 md:pt-8">
        <div className="flex flex-1 flex-col border border-foreground px-6 py-8 md:px-20 md:py-10">
          <h2 className="mt-auto w-full font-sans text-[clamp(1.75rem,4.2vw,3.75rem)] font-semibold uppercase leading-[0.9] tracking-[-0.04em] text-foreground">
            {statement}
          </h2>
        </div>
      </div>

      <div className="shrink-0 px-3 pt-4 pb-8 sm:px-4 md:px-20 md:pt-2.5 md:pb-8">
        <div className="grid items-start gap-x-4 gap-y-6 md:grid-cols-[minmax(6.5rem,1fr)_minmax(0,2.4fr)_minmax(10rem,1.2fr)_minmax(6.5rem,1fr)] md:gap-x-6">
          <p className="font-mono text-[11px] uppercase tracking-label text-foreground">
            {label}
          </p>

          <div className="flex gap-x-6 md:gap-x-10">
            <div
              className="flex flex-col gap-y-1 md:gap-y-0.5"
              role="tablist"
              aria-label={label ?? 'Services'}
            >
              {cards.map((item, i) => {
                const isActive = i === active
                return (
                  <button
                    key={item._key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`home-service-panel-${item._key}`}
                    id={`home-service-tab-${item._key}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    className={`block text-left font-sans text-[clamp(1.5rem,2.1vw,2.5rem)] font-semibold leading-none tracking-[-0.05em] transition-colors duration-150 ${
                      isActive ? 'text-foreground' : 'text-foreground/15 hover:text-foreground/40'
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>

            <div
              id={`home-service-panel-${card._key}`}
              role="tabpanel"
              aria-labelledby={`home-service-tab-${card._key}`}
              className="min-w-0 pt-0.5"
            >
              <p className="font-sans text-[clamp(1.35rem,2vw,2rem)] font-semibold uppercase leading-[1.05] tracking-[-0.03em] text-foreground">
                {card.title}
              </p>
              {card.priceLine ? (
                <p className="mt-3 font-mono text-[11px] uppercase tracking-label text-foreground/50">
                  {card.priceLine}
                </p>
              ) : null}
              <Link
                href={href}
                className="group mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-label text-foreground/55 transition-colors duration-300 hover:text-foreground"
              >
                {card.linkLabel?.trim() || 'See how'}
                <ArrowUpRight
                  aria-hidden
                  size={12}
                  strokeWidth={2.5}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>

          <div className="min-w-0 md:pt-1">
            <p className="max-w-[34ch] text-[14px] leading-snug text-foreground/70 md:text-[15px]">
              {card.body}
            </p>
          </div>

          <div className="hidden md:block" aria-hidden />
        </div>
      </div>
    </section>
  )
}
