'use client'

import {signProposal, type SignActionState} from '@/app/(proposal)/p/[token]/actions'
import {fireConfetti, ProposalPayButton} from '@/components/ProposalPayButton'
import type {ProposalSelection} from '@/lib/proposal/quote'
import {EmbeddedCheckout, EmbeddedCheckoutProvider} from '@stripe/react-stripe-js'
import {loadStripe, type Stripe} from '@stripe/stripe-js'
import {useRouter} from 'next/navigation'
import {useActionState, useEffect, useRef, useState, type ReactNode} from 'react'

let stripePromise: Promise<Stripe | null> | null = null

function getStripePromise() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    stripePromise = key ? loadStripe(key) : Promise.resolve(null)
  }
  return stripePromise
}

const fieldClass =
  'block rounded-[20px] border border-white/80 bg-white/70 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] transition-colors focus-within:border-[#08090a]/25'

/**
 * The signature and the first payment.
 *
 * The form posts the selection it was rendered with, as hidden fields, plus
 * the typed name and the agreement. The server recomputes the amount and
 * answers with a Checkout client secret. Stripe's form then opens in a
 * pop-up over the page. Nothing on this side decides what is charged.
 */
export function ProposalSignForm({
  token,
  selection,
  payLabel,
  restLine,
  wireAvailable,
  note,
  children,
}: {
  token: string
  selection: ProposalSelection
  payLabel: string
  restLine: string | null
  wireAvailable: boolean
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
  const [agreed, setAgreed] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const card = useRef<HTMLFormElement>(null)

  const checkoutSecret = state?.ok && 'clientSecret' in state ? state.clientSecret : null
  const wireRequested = state?.ok === true && 'wire' in state
  const popupOpen = checkoutSecret != null && !dismissed && !confirming

  useEffect(() => {
    if (!wireRequested) return
    router.refresh()
  }, [wireRequested, router])

  useEffect(() => {
    if (!confirming) return
    let tries = 0
    const timer = window.setInterval(() => {
      tries += 1
      router.refresh()
      if (tries >= 24) window.clearInterval(timer)
    }, 2500)
    return () => window.clearInterval(timer)
  }, [confirming, router])

  // The pop-up owns the page while it is open: no scroll behind it, Escape closes it.
  useEffect(() => {
    if (!popupOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDismissed(true)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [popupOpen])

  function handleComplete() {
    if (card.current) fireConfetti(card.current)
    setConfirming(true)
  }

  const ready = name.trim().length >= 2 && agreed

  return (
    <>
      <form
        ref={card}
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
              {confirming ? 'Confirming your payment.' : 'Sign here and we can start.'}
            </p>
          </div>

          {confirming ? (
            <p className="text-center text-[1.05rem] font-medium leading-snug text-[#5c5c5c]">
              Stripe has your payment. This page updates on its own the moment it clears.
            </p>
          ) : (
            <>
              {note ? (
                <p className="rounded-[20px] border border-[#f08a3a]/40 bg-[#f08a3a]/10 px-4 py-3 text-center text-[0.95rem] font-medium leading-snug text-[#7a3a0a]">
                  {note}
                </p>
              ) : null}
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
                  disabled={checkoutSecret != null}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full bg-transparent text-[1.35rem] font-medium tracking-[-0.03em] text-[#08090a] outline-none placeholder:font-normal placeholder:text-[#a3a3a3] disabled:opacity-70"
                />
              </label>
              <label className="flex items-start gap-3 text-[1.05rem] leading-relaxed">
                <input
                  type="checkbox"
                  name="agree"
                  value="yes"
                  checked={agreed}
                  disabled={checkoutSecret != null}
                  onChange={(event) => setAgreed(event.target.checked)}
                  className="mt-1.5 h-4 w-4 accent-ink"
                />
                <span>{children}</span>
              </label>

              {checkoutSecret ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setDismissed(false)}
                    className="btn-solid w-full justify-center"
                  >
                    {dismissed ? 'Continue to payment' : 'Opening payment…'}
                  </button>
                  <p className="mt-3 text-center text-[0.95rem] font-medium leading-snug text-[#5c5c5c]">
                    Your signature is recorded. The payment form stays open for 30 minutes.
                  </p>
                </div>
              ) : (
                <div>
                  <ProposalPayButton label={payLabel} disabled={!ready} pending={pending} />
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
                      disabled={!ready || pending}
                      className="mt-3 w-full text-center text-[0.95rem] font-medium text-[#5c5c5c] underline underline-offset-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Pay by wire instead
                    </button>
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>
      </form>

      {popupOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-[#08090a]/55 p-0 backdrop-blur-[6px] sm:items-center sm:p-6"
          onClick={() => setDismissed(true)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Pay the first payment"
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-[94svh] w-full max-w-[46rem] overflow-y-auto rounded-t-[28px] bg-white px-4 pb-4 pt-14 shadow-[0_40px_120px_rgba(0,0,0,0.35)] sm:rounded-[28px] sm:px-6 sm:pb-6"
          >
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Close the payment form"
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full border border-[#08090a]/15 text-[#08090a] transition-colors hover:bg-[#08090a] hover:text-white"
            >
              <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
                <path
                  d="M3 3l10 10M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <EmbeddedCheckoutProvider
              stripe={getStripePromise()}
              options={{clientSecret: checkoutSecret, onComplete: handleComplete}}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </div>
      ) : null}
    </>
  )
}
