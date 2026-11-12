'use client'

import {unlockProposal} from '@/app/(proposal)/p/[token]/actions'
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
    <main data-proposal-gate="" className="min-h-svh bg-white text-[#08090a]">
      <div className="px-[max(1.5rem,var(--spacing-gutter))] pt-[1.5rem]">
        <Link href="/" aria-label="Salt Studio" className="inline-flex text-[#08090a]">
          <SaltWordmark className="h-[26px] w-auto" />
        </Link>
      </div>
      <div className="flex min-h-[calc(100svh-4.5rem)] items-center justify-center px-[1.5rem] pb-[4rem]">
        <div className="w-full max-w-[28rem] text-center">
          <h1 className="text-balance text-[2.25rem] font-medium leading-[1.05] tracking-[-0.03em]">
            {clientName}
          </h1>
          <p className="mx-auto mt-[1.25rem] max-w-[24rem] text-[1.05rem] font-medium leading-snug text-[#5c5c5c]">
            Enter the password to see what we've prepared for you. We're excited to work together.
          </p>
          <form
            action={formAction}
            className="mx-auto mt-[2rem] flex w-full max-w-[22rem] flex-col text-left"
          >
            <label className="block">
              <span className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
                Password
              </span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className="mt-[0.5rem] w-full border-b border-[#08090a]/25 bg-transparent py-[0.75rem] text-[1.15rem] text-[#08090a] outline-none placeholder:text-[#a3a3a3] focus:border-[#08090a]"
              />
            </label>
            {state?.error ? (
              <p className="mt-[0.75rem] text-[0.95rem] font-medium text-[#9a3412]">
                {state.error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="btn-solid mt-[1.5rem] min-h-[48px] w-full justify-center disabled:opacity-50"
            >
              {pending ? 'Checking…' : 'Open'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
