import {normalizeCtaLabel, resolveCtaHref} from '@/components/homeHero'
import {LineReveal} from '@/components/motion/LineReveal'
import type {HomePageQueryResult} from '@/sanity.types'
import Link from 'next/link'

export interface HomePageProps {
  data: HomePageQueryResult | null
}

/**
 * Interim homepage — approved hero copy from the copy plan
 * (salt-studio-knowledge-base/studio/website/copy/homepage.md §1) until the
 * full section build lands. One CTA, per conversion doctrine.
 */
export function HomePage({data}: HomePageProps) {
  const ctaLabel = normalizeCtaLabel(data?.cta?.buttonLabel)
  const ctaHref = resolveCtaHref(data?.cta)

  return (
    <section className="flex min-h-[calc(100dvh-88px)] flex-col justify-center bg-background px-[clamp(20px,5vw,80px)] py-24 text-foreground">
      <div className="max-w-[1100px]">
        <LineReveal
          as="h1"
          className="font-sans text-display font-semibold uppercase tracking-display"
        >
          AI assistants and refined websites for organizations with a mission.
        </LineReveal>

        <LineReveal
          as="p"
          delay={0.3}
          className="mt-8 max-w-[560px] text-lg leading-snug text-muted-foreground"
        >
          We build tools that know your content, answer your people, and carry your voice — and
          the digital spaces to match.
        </LineReveal>

        <div className="mt-12 flex flex-col items-start gap-3">
          <Link href={ctaHref} className="btn-solid">
            {ctaLabel}
          </Link>
          <p className="font-mono text-[12px] uppercase tracking-label text-muted-foreground">
            30 minutes. You leave with a clear next step — either way.
          </p>
        </div>
      </div>
    </section>
  )
}
