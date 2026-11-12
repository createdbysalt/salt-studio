'use client'

import {unlockProposal} from '@/app/(proposal)/p/[token]/actions'
import {ProposalCoverDots} from '@/components/ProposalCoverDots'
import {SaltWordmark} from '@/components/SaltWordmark'
import Link from 'next/link'
import {useActionState} from 'react'

export function ProposalGate({
  token,
  clientName,
  search,
}: {
  token: string
  clientName: string
  search: string
}) {
  const [state, formAction, pending] = useActionState(
    async (previous: {ok: false; error: string} | null, formData: FormData) =>
      unlockProposal(token, search, previous, formData),
    null,
  )

  return (
    <main data-proposal-gate="" className="relative min-h-svh bg-white text-[#08090a]">
      <ProposalCoverDots />
      <div className="relative z-[1] flex min-h-svh items-center justify-center px-[1.5rem] py-[4rem]">
        <form
          action={formAction}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' || event.nativeEvent.isComposing || pending) return
            event.preventDefault()
            event.currentTarget.requestSubmit()
          }}
          className="relative w-full max-w-[36rem] overflow-hidden rounded-[32px] border border-white/70 bg-[rgba(228,228,228,0.62)] px-[2rem] py-[2.25rem] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_30px_80px_rgba(40,30,10,0.12)] backdrop-blur-[42px]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),transparent)]"
          />
          <div className="relative grid gap-5">
            <div>
              <h1 className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <Link href="/" aria-label="Salt Studio" className="inline-flex text-[#08090a]">
                  <SaltWordmark className="h-[52px] w-auto" />
                </Link>
                <span
                  aria-hidden="true"
                  className="font-mono text-[1.35rem] leading-none text-muted-foreground"
                >
                  ×
                </span>
                <span className="text-balance text-[2.5rem] font-medium leading-[1.05] tracking-[-0.04em]">
                  {clientName}
                </span>
              </h1>
              <p className="mx-auto mt-4 max-w-[24rem] text-[1.05rem] font-medium leading-snug text-[#5c5c5c]">
                Enter the password to see what we've prepared for you. We're excited to work
                together.
              </p>
            </div>
            <label className="block rounded-[20px] border border-white/80 bg-white/70 px-4 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] transition-colors focus-within:border-[#08090a]/25">
              <span className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
                Password
              </span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                enterKeyHint="go"
                placeholder="Your password"
                required
                className="mt-2 w-full bg-transparent text-[1.35rem] font-medium tracking-[-0.03em] text-[#08090a] outline-none placeholder:font-normal placeholder:text-[#a3a3a3]"
              />
            </label>
            {state?.error ? (
              <p className="text-center text-[0.95rem] font-medium leading-snug text-[#9a3412]">
                {state.error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="btn-solid w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? 'Checking…' : 'Open'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
