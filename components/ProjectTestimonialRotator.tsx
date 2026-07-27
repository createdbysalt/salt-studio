'use client'

import {stegaClean} from 'next-sanity'
import {useEffect, useState} from 'react'

export type ProjectTestimonial = {
  _id: string
  quote: string | null
  author: string | null
  role: string | null
}

const LABEL = 'font-mono text-[11px] uppercase tracking-[0.08em] text-foreground/40'
const INTERVAL_MS = 6000

type ProjectTestimonialRotatorProps = {
  items: ProjectTestimonial[]
}

/** One quote at a time — auto-advances through project testimonials. */
export function ProjectTestimonialRotator({items}: ProjectTestimonialRotatorProps) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [paused, setPaused] = useState(false)
  const count = items.length

  useEffect(() => {
    if (count <= 1 || paused) return

    let fadeTimeout: number | undefined
    const id = window.setInterval(() => {
      setVisible(false)
      fadeTimeout = window.setTimeout(() => {
        setIndex((current) => (current + 1) % count)
        setVisible(true)
      }, 280)
    }, INTERVAL_MS)

    return () => {
      window.clearInterval(id)
      if (fadeTimeout) window.clearTimeout(fadeTimeout)
    }
  }, [count, paused])

  if (!count) return null

  const active = items[index]
  const quote = active.quote ? stegaClean(active.quote).trim() : ''
  const attribution = [active.author, active.role]
    .filter(Boolean)
    .map((x) => stegaClean(x as string))
    .join(' — ')

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false)
        }
      }}
    >
      <figure
        aria-live="polite"
        className={`transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        <blockquote className="font-sans text-2xl font-light uppercase leading-snug tracking-tight text-foreground md:text-3xl">
          “{quote}”
        </blockquote>
        {attribution ? <figcaption className={`${LABEL} mt-4`}>{attribution}</figcaption> : null}
      </figure>

      {count > 1 ? (
        <div className="mt-6 flex items-center gap-2" role="tablist" aria-label="Testimonials">
          {items.map((item, i) => (
            <button
              key={item._id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show testimonial ${i + 1} of ${count}`}
              onClick={() => {
                setVisible(true)
                setIndex(i)
              }}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === index ? 'bg-foreground' : 'bg-foreground/25 hover:bg-foreground/50'
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
