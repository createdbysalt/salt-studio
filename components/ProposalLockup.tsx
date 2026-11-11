'use client'

import {SaltWordmark} from '@/components/SaltWordmark'
import Image from 'next/image'
import {useEffect, useRef, useState} from 'react'

const SALT_EMAIL = 'mailto:hello@createdbysalt.com'

/**
 * Salt × client, fixed at the top of a proposal, with Contact and Accept
 * on the same line. The frosted chip appears on all three once the page
 * scrolls. ProposalPage renders this beside the rail.
 *
 * Over a dark band the chip turns into a paper plate instead of inverting.
 * A client logo is a picture: inverting it would print the wrong brand colours.
 */
export function ProposalLockup({
  client,
  logoUrl,
  logoAlt,
  acceptHref,
}: {
  client: string
  logoUrl?: string
  logoAlt?: string
  acceptHref: string
}) {
  const chip = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [overDark, setOverDark] = useState(false)

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 8)
      const node = chip.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const probe = rect.top + rect.height / 2
      const bands = Array.from(document.querySelectorAll<HTMLElement>('[data-theme="dark"]'))
      setOverDark(
        bands.some((band) => {
          const bounds = band.getBoundingClientRect()
          return bounds.top <= probe && bounds.bottom >= probe
        }),
      )
    }

    update()
    window.addEventListener('scroll', update, {passive: true})
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const plate = overDark
    ? 'bg-[rgba(234,234,234,0.92)] text-ink backdrop-blur-[42px]'
    : scrolled
      ? 'bg-[rgba(0,0,0,0.06)] backdrop-blur-[42px]'
      : ''
  const action =
    'pointer-events-auto rounded-sm px-3 py-2 font-mono text-[12px] font-medium uppercase tracking-[0.08em] transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-current'

  return (
    <div className="pointer-events-none fixed inset-x-3 top-5 z-30">
      <div className="flex items-center justify-between">
        <a href={SALT_EMAIL} data-proposal-enter="chrome" className={`${action} ${plate}`}>
          Contact
        </a>
        <div
          data-proposal-enter="lockup"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        >
          <div
            ref={chip}
            className={`flex items-center gap-3 rounded-sm px-3 py-2 transition-colors duration-300 ${plate}`}
          >
            <SaltWordmark className="h-[22px] w-auto" />
            <span aria-hidden="true" className="font-mono text-[12px] text-muted-foreground">
              ×
            </span>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={logoAlt || client}
                width={180}
                height={72}
                className="h-[22px] w-auto object-contain"
              />
            ) : (
              <p className="mb-0 shrink-0 whitespace-nowrap font-mono text-[12px] font-medium uppercase tracking-[0.08em]">
                {client}
              </p>
            )}
          </div>
        </div>
        <a
          href={acceptHref}
          data-proposal-enter="chrome"
          className={`${action} ${plate}`}
          onClick={(event) => {
            const id = acceptHref.replace('#', '')
            const node = document.getElementById(id)
            if (!node) return
            event.preventDefault()
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            node.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'start'})
            history.pushState(null, '', `#${id}`)
          }}
        >
          Accept
        </a>
      </div>
    </div>
  )
}
