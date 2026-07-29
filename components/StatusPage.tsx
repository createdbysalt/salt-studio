import {SaltWordmark} from '@/components/SaltWordmark'
import Link from 'next/link'
import type {ReactNode} from 'react'

type StatusAction =
  | {kind: 'button'; label: string; onClick: () => void}
  | {kind: 'link'; label: string; href: string}

type StatusPageProps = {
  eyebrow: string
  headline: string
  message: string
  primary: StatusAction
  secondary?: StatusAction
  footer?: ReactNode
}

/**
 * Shared dark status surface (error / 404). Compact logo top-left;
 * copy centered in the stage.
 */
export function StatusPage({
  eyebrow,
  headline,
  message,
  primary,
  secondary,
  footer,
}: StatusPageProps) {
  return (
    <main
      data-theme="dark"
      className="fixed inset-0 z-[60] flex min-h-svh flex-col overflow-y-auto bg-background text-foreground"
    >
      <header className="shrink-0 px-3 pt-3 sm:px-4 sm:pt-4">
        <Link
          href="/"
          className="inline-flex text-foreground transition-opacity duration-300 hover:opacity-70"
          aria-label="Salt Studio — Home"
        >
          <SaltWordmark className="h-4 w-auto sm:h-5" />
        </Link>
      </header>

      <div className="page-chrome flex flex-1 flex-col items-center justify-center py-16 text-center md:py-20">
        <div className="w-full max-w-[42rem]">
          <p className="font-mono text-[11px] uppercase tracking-label text-foreground/40">
            {eyebrow}
          </p>

          <h1 className="mt-3 font-sans text-[clamp(2.75rem,7vw,5rem)] font-bold uppercase leading-[0.9] tracking-[-0.035em]">
            {headline}
          </h1>

          <p className="mx-auto mt-3 max-w-[34ch] text-base leading-relaxed text-foreground/55 md:text-lg">
            {message}
          </p>

          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <StatusAction control={primary} variant="solid" />
            {secondary ? <StatusAction control={secondary} variant="ghost" /> : null}
          </div>

          {footer ? <div className="mt-8">{footer}</div> : null}
        </div>
      </div>
    </main>
  )
}

function StatusAction({
  control,
  variant,
}: {
  control: StatusAction
  variant: 'solid' | 'ghost'
}) {
  const className = variant === 'solid' ? 'btn-solid' : 'btn-ghost'

  if (control.kind === 'button') {
    return (
      <button type="button" onClick={control.onClick} className={className}>
        {control.label}
      </button>
    )
  }

  return (
    <Link href={control.href} className={className}>
      {control.label}
    </Link>
  )
}
