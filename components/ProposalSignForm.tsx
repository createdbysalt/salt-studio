'use client'

import {signProposal, type SignActionState} from '@/app/(proposal)/p/[token]/actions'
import {ProposalPayButton} from '@/components/ProposalPayButton'
import type {ProposalSelection} from '@/lib/proposal/quote'
import {useRouter} from 'next/navigation'
import {useActionState, useEffect, useState, type ReactNode} from 'react'

const fieldClass =
  'block rounded-[20px] border border-white/80 bg-white/70 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] transition-colors focus-within:border-[#08090a]/25'

/**
 * The signature and the first payment, inside the glass card.
 *
 * The form posts the selection it was rendered with, as hidden fields, plus
 * the typed name and the agreement. The server recomputes the amount and
 * answers with a Stripe Checkout URL, and the browser goes there. Stripe's
 * own page collects the payment and returns them to the kickoff page.
 * Nothing on this side decides what is charged.
 */
export function ProposalSignForm({
  token,
  selection,
  payLabel,
  restLine,
  wireAvailable,
  resume,
  defaults,
  note,
  children,
}: {
  token: string
  selection: ProposalSelection
  payLabel: string
  restLine: string | null
  wireAvailable: boolean
  /** Set when they already signed and a payment of theirs is still open. */
  resume: {signerName: string} | null
  defaults: {legalName: string; email: string}
  note: string | null
  children: ReactNode
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(
    async (previous: SignActionState, formData: FormData) =>
      signProposal(token, previous, formData),
    null,
  )
  const [name, setName] = useState('')
  const [legalName, setLegalName] = useState(defaults.legalName)
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState(defaults.email)
  const [agreed, setAgreed] = useState(false)

  const checkoutUrl = state?.ok && 'url' in state ? state.url : null
  const wireRequested = state?.ok === true && 'wire' in state

  useEffect(() => {
    if (!wireRequested) return
    router.refresh()
  }, [wireRequested, router])

  // The signature is already recorded, so hand them to Stripe's page.
  useEffect(() => {
    if (!checkoutUrl) return
    window.location.assign(checkoutUrl)
  }, [checkoutUrl])

  const ready =
    resume != null ||
    (name.trim().length >= 2 &&
      legalName.trim().length >= 2 &&
      address.trim().length >= 10 &&
      email.trim().includes('@') &&
      agreed)
  const leaving = checkoutUrl != null

  return (
    <form
      action={formAction}
      className="relative overflow-hidden rounded-[32px] border border-white/70 bg-[rgba(228,228,228,0.62)] px-[2rem] py-[2.25rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_30px_80px_rgba(40,30,10,0.12)] backdrop-blur-[42px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),transparent)]"
      />
      {selection.packageId ? (
        <input type="hidden" name="package" value={selection.packageId} />
      ) : null}
      {selection.addonIds.map((id) => (
        <input key={id} type="hidden" name="addon" value={id} />
      ))}
      {selection.kickoffDate ? (
        <input type="hidden" name="kickoff" value={selection.kickoffDate} />
      ) : null}

      <div className="relative grid gap-5">
        <div className="text-center">
          <p className="text-[2.5rem] font-medium leading-[1.05] tracking-[-0.04em]">
            {leaving
              ? 'Taking you to payment.'
              : resume
                ? 'Pick up where you left off.'
                : 'Sign here and we can start.'}
          </p>
        </div>

        {leaving ? (
          <p className="text-center text-[1.05rem] font-medium leading-snug text-[#5c5c5c]">
            Your signature is recorded. Stripe handles the payment, then we book your kickoff.
          </p>
        ) : (
          <>
            {note ? (
              <p className="rounded-[20px] border border-[#f08a3a]/40 bg-[#f08a3a]/10 px-4 py-3 text-center text-[0.95rem] font-medium leading-snug text-[#7a3a0a]">
                {note}
              </p>
            ) : null}
            {resume ? (
              <>
                <input type="hidden" name="signerName" value={resume.signerName} />
                <input type="hidden" name="agree" value="yes" />
                <p className="text-center text-[1.05rem] font-medium leading-snug text-[#5c5c5c]">
                  Signed as {resume.signerName}. The payment was not finished, so it is still
                  waiting for you. We will reuse the legal name, address, and email already frozen
                  on that signature.
                </p>
              </>
            ) : (
              <>
                <label className={fieldClass}>
                  <span className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
                    Full name
                  </span>
                  <input
                    name="signerName"
                    autoComplete="name"
                    placeholder="Your name"
                    required
                    minLength={2}
                    value={name}
                    disabled={leaving}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-2 w-full bg-transparent text-[1.35rem] font-medium tracking-[-0.03em] text-[#08090a] outline-none placeholder:font-normal placeholder:text-[#a3a3a3] disabled:opacity-70"
                  />
                </label>
                <label className={fieldClass}>
                  <span className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
                    Legal name
                  </span>
                  <input
                    name="legalName"
                    autoComplete="organization"
                    placeholder="Legal party name"
                    required
                    minLength={2}
                    value={legalName}
                    disabled={leaving}
                    onChange={(event) => setLegalName(event.target.value)}
                    className="mt-2 w-full bg-transparent text-[1.35rem] font-medium tracking-[-0.03em] text-[#08090a] outline-none placeholder:font-normal placeholder:text-[#a3a3a3] disabled:opacity-70"
                  />
                </label>
                <label className={fieldClass}>
                  <span className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
                    Address
                  </span>
                  <textarea
                    name="address"
                    autoComplete="street-address"
                    placeholder={'Street address\nCity, state or region, postal code\nCountry'}
                    required
                    rows={4}
                    value={address}
                    disabled={leaving}
                    onChange={(event) => setAddress(event.target.value)}
                    className="mt-2 w-full resize-none bg-transparent text-[1.12rem] font-medium tracking-[-0.02em] text-[#08090a] outline-none placeholder:font-normal placeholder:text-[#a3a3a3] disabled:opacity-70"
                  />
                </label>
                <label className={fieldClass}>
                  <span className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
                    Email
                  </span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    disabled={leaving}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full bg-transparent text-[1.35rem] font-medium tracking-[-0.03em] text-[#08090a] outline-none placeholder:font-normal placeholder:text-[#a3a3a3] disabled:opacity-70"
                  />
                </label>
                <label className="flex items-start gap-3 text-[1.05rem] leading-relaxed">
                  <input
                    type="checkbox"
                    name="agree"
                    value="yes"
                    checked={agreed}
                    disabled={leaving}
                    onChange={(event) => setAgreed(event.target.checked)}
                    className="mt-1.5 h-4 w-4 accent-ink"
                  />
                  <span>{children}</span>
                </label>
              </>
            )}

            <div>
              <ProposalPayButton
                label={resume ? `Continue payment, ${payLabel.replace(/^Pay /, '')}` : payLabel}
                disabled={!ready || leaving}
                pending={pending || leaving}
              />
              {state && !state.ok ? (
                <p className="mt-3 text-center text-[0.95rem] font-medium leading-snug text-[#9a3412]">
                  {state.error}
                </p>
              ) : null}
              <p className="mt-3 text-center text-[0.95rem] font-medium leading-snug text-[#5c5c5c]">
                {restLine ?? 'The signed scope and receipt go to your email.'}
              </p>
              {wireAvailable ? (
                <button
                  type="submit"
                  name="intent"
                  value="wire"
                  disabled={!ready || pending || leaving}
                  className="mt-3 w-full text-center text-[0.95rem] font-medium text-[#5c5c5c] underline underline-offset-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Pay by wire instead
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </form>
  )
}
