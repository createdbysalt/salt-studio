'use client'

import {authenticateTable} from '@/app/(table)/table/actions'
import {TableNav} from '@/components/TableNav'
import {useActionState} from 'react'

export function ClientPortalLogin({
  slug,
  name,
  contactHref,
}: {
  slug: string
  name: string
  contactHref?: string | null
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: {ok: false; error: string} | null, formData: FormData) =>
      authenticateTable(slug, formData),
    null,
  )

  return (
    <main data-theme="dark" className="scheme-dark min-h-svh bg-background text-foreground">
      <TableNav homeHref={`/project/${slug}`} showLinks={false} onDark contactHref={contactHref} />
      <div className="flex min-h-svh flex-col px-[24px] pb-[max(28px,env(safe-area-inset-bottom))] pt-28 sm:px-[40px] md:justify-center md:px-[56px] md:py-36 lg:px-[80px]">
        <div className="grid flex-1 grid-rows-[1fr_auto] md:w-full md:flex-none md:grid-cols-12 md:grid-rows-none md:items-end md:gap-16 lg:gap-20">
          <div className="flex flex-col justify-center md:col-span-7 md:block">
            <p className="text-label text-muted-foreground">Website project</p>
            <h1 className="mt-3 font-sans text-[length:clamp(2.875rem,13vw,4rem)] font-[650] uppercase leading-[0.9] tracking-display md:mt-4 md:text-[length:clamp(3.75rem,8vw,6rem)] lg:text-[length:var(--text-display)]">
              {name}
            </h1>
            <p className="mt-4 max-w-xl text-body text-foreground/70 md:mt-6">
              Welcome. Enter the password we sent with this link.
            </p>
          </div>
          <form
            action={formAction}
            className="flex flex-col gap-5 pt-10 md:col-span-5 md:gap-6 md:pt-0"
          >
            <label className="flex flex-col gap-2">
              <span className="text-label text-muted-foreground">Password</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className="min-h-[48px] border-0 border-b border-foreground/30 bg-transparent py-3 text-body text-foreground outline-none focus:border-foreground md:min-h-0"
              />
            </label>
            {state?.error ? <p className="text-body text-error">{state.error}</p> : null}
            <button
              type="submit"
              disabled={pending}
              className="btn-solid min-h-[48px] w-full justify-center disabled:opacity-50 md:min-h-0 md:w-fit"
            >
              {pending ? 'Checking…' : 'Open'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
