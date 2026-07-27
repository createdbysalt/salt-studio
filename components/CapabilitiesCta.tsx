import {CapReveal} from '@/components/CapabilitiesMotion'
import Link from 'next/link'

type CapabilitiesCtaProps = {
  subhead?: string | null
  buttonLabel?: string | null
  link?: string | null
}

/**
 * Quiet dark closer — continues the agency band into the footer
 * instead of flashing a light stripe between two dark blocks.
 */
export function CapabilitiesCta({subhead, buttonLabel, link}: CapabilitiesCtaProps) {
  if (!subhead && !buttonLabel) return null

  const label = buttonLabel?.replace(/\s*→\s*$/, '') || null

  return (
    <section className="border-t border-white/10 bg-[#0A0A0A]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-12 text-center sm:gap-7 sm:px-6 sm:py-14 md:flex-row md:items-end md:justify-between md:gap-10 md:px-10 md:py-14 md:text-left">
        <CapReveal className="min-w-0 md:max-w-xl" y={10}>
          {subhead ? (
            <p className="mx-auto max-w-[18ch] font-mono text-[clamp(1.2rem,4.8vw,1.45rem)] font-medium leading-[1.2] tracking-tight text-white md:mx-0 md:max-w-lg md:text-[clamp(1.05rem,2.4vw,1.35rem)] md:leading-snug">
              {subhead}
            </p>
          ) : null}
        </CapReveal>

        <CapReveal delay={0.08} y={8} className="shrink-0">
          {label ? (
            <Link
              href={link || '/contact'}
              className="group inline-flex min-h-11 items-center justify-center gap-2 border border-white/40 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-black"
            >
              <span>{label}</span>
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          ) : null}
        </CapReveal>
      </div>
    </section>
  )
}
