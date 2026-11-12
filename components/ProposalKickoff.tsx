'use client'

import {SaltWordmark} from '@/components/SaltWordmark'
import Cal, {getCalApi} from '@calcom/embed-react'
import Link from 'next/link'
import {useEffect} from 'react'

const NAMESPACE = 'kickoff'

const THANKS: Record<'paid' | 'processing' | 'wire', string> = {
  paid: 'Your payment went through. The signed scope and your receipt are on their way to your email.',
  processing:
    'Your bank payment is on its way. It takes a few business days to clear, and the signed scope and receipt go to your email once it does.',
  wire: 'Wire instructions are on their way to your email. The signed scope follows as soon as the payment lands.',
}

/**
 * The page after payment: a thank you, then the kickoff booking on our own
 * domain. Cal.com's calendar sits inline with their details already filled
 * in. Everything around it is ours to design.
 */
export function ProposalKickoff({
  clientName,
  calLink,
  fallbackHref,
  paymentState,
  heading,
  intro,
  name,
  email,
}: {
  clientName: string
  calLink: string
  fallbackHref: string
  paymentState: 'paid' | 'processing' | 'wire'
  heading: string
  intro: string
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
      <div className="px-[max(1.5rem,var(--spacing-gutter))] pt-[1.5rem]">
        <Link href="/" aria-label="Salt Studio" className="inline-flex text-[#08090a]">
          <SaltWordmark className="h-[22px] w-auto" />
        </Link>
      </div>

      <section className="mx-auto w-full max-w-[72rem] px-[1.5rem] pb-[3rem] pt-[1rem] md:pt-[1.25rem]">
        <header className="max-w-[40rem]">
          <h1 className="max-w-[14em] text-balance text-[clamp(1.6rem,3vw,2.25rem)] font-medium leading-[1.05] tracking-[-0.035em]">
            {clientName}, thank you so much.
          </h1>
          <p className="mt-2 max-w-[32rem] text-[0.95rem] font-medium leading-snug tracking-[-0.01em] text-[#5c5c5c]">
            {THANKS[paymentState]}
          </p>
          <p className="mt-5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
            {heading}
          </p>
          <p className="mt-1.5 max-w-[32rem] text-[0.95rem] font-medium leading-snug tracking-[-0.01em] text-[#5c5c5c]">
            {intro}
          </p>
        </header>

        <div className="mt-5 overflow-hidden rounded-[32px] border border-[#08090a]/10 bg-white shadow-[0_30px_80px_rgba(40,30,10,0.08)]">
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

        <p className="mt-3 text-[0.85rem] font-medium leading-snug text-[#5c5c5c]">
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
