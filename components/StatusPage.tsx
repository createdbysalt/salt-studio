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
 * Shared light-stage status surface (error / 404). Ink on paper, Geist display,
 * mono labels — matches DESIGN.md, not the legacy Photon dark field.
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
    <main className="fixed inset-0 z-[60] flex min-h-svh flex-col overflow-y-auto bg-background px-3 py-10 text-foreground sm:px-4 md:py-14">
      <div className="flex flex-1 flex-col justify-center">
        <div className="mx-auto w-full max-w-[40rem]">
          <Link
            href="/"
            className="inline-flex text-foreground transition-opacity duration-300 hover:opacity-70"
            aria-label="Salt Studio — Home"
          >
            <SaltWordmark className="h-7 w-auto sm:h-8" />
          </Link>

          <p className="mt-14 font-mono text-[11px] uppercase tracking-label text-foreground/40 md:mt-16">
            {eyebrow}
          </p>

          <h1 className="mt-4 font-sans text-[clamp(2.5rem,6vw,4.5rem)] font-semibold uppercase leading-[0.92] tracking-[-0.03em]">
            {headline}
          </h1>

          <p className="mt-6 max-w-[36ch] text-base leading-relaxed text-foreground/70 md:text-lg">
            {message}
          </p>

          <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <StatusAction control={primary} variant="solid" />
            {secondary ? <StatusAction control={secondary} variant="ghost" /> : null}
          </div>

          {footer ? <div className="mt-12">{footer}</div> : null}
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
