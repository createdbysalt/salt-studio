'use client'

import {SaltWordmark} from '@/components/SaltWordmark'
import Image from 'next/image'
import {useEffect, useState} from 'react'

/**
 * Salt × client, fixed at the top of a proposal.
 * The frosted chip appears once the page scrolls under it.
 * ProposalPage renders this beside the rail. No existing component
 * holds both the wordmark and the client name.
 */
export function ProposalLockup({
  client,
  logoUrl,
  logoAlt,
}: {
  client: string
  logoUrl?: string
  logoAlt?: string
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8)
    update()
    window.addEventListener('scroll', update, {passive: true})
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div
      data-proposal-enter="lockup"
      className="pointer-events-none fixed left-1/2 top-5 z-30 -translate-x-1/2"
    >
      <div
        className={`flex items-center gap-3 rounded-sm px-3 py-2 ${
          scrolled ? 'bg-[rgba(0,0,0,0.06)] backdrop-blur-[42px]' : ''
        }`}
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
  )
}
