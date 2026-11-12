'use client'

import {SaltWordmark} from '@/components/SaltWordmark'
import Cal, {getCalApi} from '@calcom/embed-react'
import Link from 'next/link'
import {useEffect} from 'react'

const NAMESPACE = 'kickoff'

/**
 * The kickoff booking page, on our domain. Cal.com's calendar sits inline
 * with the day they chose and their details already filled in. Everything
 * around it is ours to design.
 */
export function ProposalKickoff({
  token,
  clientName,
  calLink,
  fallbackHref,
  heading,
  intro,
  dateLabel,
  name,
  email,
}: {
  token: string
  clientName: string
  calLink: string
  fallbackHref: string
  heading: string
  intro: string
  dateLabel: string | null
  name: string | null
  email: string | null
}) {
  useEffect(() => {
    let cancelled = false
    getCalApi({namespace: NAMESPACE}).then((cal) => {
      if (cancelled) return
      cal('ui', {
        theme: 'light',
        hideEventTypeDetails: false,
        layout: 'month_view',
        cssVarsPerTheme: {
          light: {'cal-brand': '#08090a'},
          dark: {'cal-brand': '#ffffff'},
        },
      })
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="min-h-svh bg-white text-[#08090a]">
      <div className="flex items-center justify-between px-[max(1.5rem,var(--spacing-gutter))] pt-[1.5rem]">
        <Link href="/" aria-label="Salt Studio" className="inline-flex text-[#08090a]">
          <SaltWordmark className="h-[26px] w-auto" />
        </Link>
        <Link
          href={`/p/${encodeURIComponent(token)}#signed`}
          className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f] hover:text-[#08090a]"
        >
          Back to the proposal
        </Link>
      </div>

      <section className="mx-auto w-full max-w-[72rem] px-[1.5rem] pb-[4rem] pt-[3rem] md:pt-[4.5rem]">
        <header className="max-w-[40rem]">
          <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
            {clientName}
          </p>
          <h1 className="mt-3 text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[1.0] tracking-[-0.04em]">
            {heading}
          </h1>
          <p className="mt-4 max-w-[32rem] text-[1.125rem] font-medium leading-snug tracking-[-0.02em] text-[#5c5c5c]">
            {intro}
          </p>
          {dateLabel ? (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f3f3f3] px-3 py-1.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#08090a]">
              <span className="size-1.5 rounded-full bg-[#f08a3a]" aria-hidden="true" />
              Kickoff week of {dateLabel}
            </p>
          ) : null}
        </header>

        <div className="mt-8 overflow-hidden rounded-[32px] border border-[#08090a]/10 bg-white shadow-[0_30px_80px_rgba(40,30,10,0.08)]">
          <Cal
            namespace={NAMESPACE}
            calLink={calLink}
            style={{width: '100%', height: '100%', overflow: 'auto'}}
            config={{
              layout: 'month_view',
              theme: 'light',
              ...(name ? {name} : {}),
              ...(email ? {email} : {}),
            }}
          />
        </div>

        <p className="mt-4 text-[0.95rem] font-medium leading-snug text-[#5c5c5c]">
          If the calendar does not load,{' '}
          <a
            href={fallbackHref}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-[3px]"
          >
            open it in a new tab
          </a>
          .
        </p>
      </section>
    </main>
  )
}
