'use client'

import {Reveal} from '@/components/Reveal'
import type {ReactNode} from 'react'

type ContactHeroProps = {
  headline?: string | null
  lead?: string | null
  directLine?: string | null
  responseLine?: string | null
}

const EMAIL_RE = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
const DEFAULT_DIRECT = 'Rather skip the form? Email us directly — hello@createdbysalt.com.'

const DEFAULT_RESPONSE = "We only take on a few projects a year. We'd love to hear from you."

function linkifyEmails(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  const re = new RegExp(EMAIL_RE.source, 'g')

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    const email = match[1]
    nodes.push(
      <a
        key={`${email}-${match.index}`}
        href={`mailto:${email}`}
        className="break-words text-foreground underline decoration-foreground/40 underline-offset-[0.18em] transition-colors duration-300 hover:decoration-foreground"
      >
        {email}
      </a>,
    )
    last = match.index + match[0].length
  }

  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

/**
 * Contact thesis column — headline, lead, Chris escape hatch.
 * Stacks above the form on mobile/tablet; sticky from lg.
 */
export function ContactHero({headline, lead, directLine, responseLine}: ContactHeroProps) {
  const direct = directLine?.trim() || DEFAULT_DIRECT
  const response = responseLine?.trim() || DEFAULT_RESPONSE

  return (
    <div className="flex min-w-0 flex-col gap-6 sm:gap-8 md:gap-10 lg:sticky lg:top-[calc(var(--project-nav-height-md)+1.5rem)] lg:self-start">
      <div className="min-w-0">
        {headline?.trim() ? (
          <Reveal immediate y={14}>
            <h1 className="max-w-[11ch] text-[clamp(1.75rem,4.8vw,2.75rem)] font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-foreground">
              {headline}
            </h1>
          </Reveal>
        ) : null}
        {lead?.trim() ? (
          <Reveal immediate delay={0.1} y={12}>
            <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-foreground/70 sm:mt-5 sm:text-base md:mt-6 md:leading-relaxed">
              {lead}
            </p>
          </Reveal>
        ) : null}
      </div>

      <Reveal immediate delay={0.18} y={12}>
        <div className="max-w-md">
          <p className="text-[0.9375rem] leading-relaxed text-foreground/70 sm:text-base md:text-[0.9375rem] md:leading-relaxed">
            {linkifyEmails(direct)}
          </p>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-foreground/40 sm:text-base md:text-[0.9375rem] md:leading-relaxed">
            {response}
          </p>
        </div>
      </Reveal>
    </div>
  )
}
