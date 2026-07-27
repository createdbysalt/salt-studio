'use client'

import {Reveal} from '@/components/Reveal'
import type {ReactNode} from 'react'

type ContactHeroProps = {
  headline?: string | null
  lead?: string | null
  directLine?: string | null
}

const EMAIL_RE = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
const DEFAULT_DIRECT =
  'Rather skip the form? Email us directly — hello@createdbysalt.com. We answer same day, usually same hour.'

const WHO_YOU_REACH =
  "You'll hear from Salt Studio within one business day — usually faster. If it's urgent, say so in the message and we'll prioritize."

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
        className="break-words text-black underline decoration-black/25 underline-offset-[0.18em] transition-colors duration-300 hover:decoration-black"
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
export function ContactHero({headline, lead, directLine}: ContactHeroProps) {
  const direct = directLine?.trim() || DEFAULT_DIRECT

  return (
    <div className="flex min-w-0 flex-col gap-6 sm:gap-8 md:gap-10 lg:sticky lg:top-[calc(var(--project-nav-height-md)+1.5rem)] lg:self-start">
      <div className="min-w-0">
        {headline?.trim() ? (
          <Reveal immediate y={14}>
            <h1 className="max-w-[11ch] font-mono text-[clamp(2.125rem,8.5vw,4.75rem)] font-medium leading-[0.95] tracking-tight text-black sm:text-[clamp(2.35rem,7vw,4.75rem)]">
              {headline}
            </h1>
          </Reveal>
        ) : null}
        {lead?.trim() ? (
          <Reveal immediate delay={0.1} y={12}>
            <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-black/55 sm:mt-5 sm:text-base md:mt-6 md:leading-relaxed">
              {lead}
            </p>
          </Reveal>
        ) : null}
      </div>

      <Reveal immediate delay={0.18} y={12}>
        <div className="max-w-md">
          <p className="text-[0.9375rem] leading-relaxed text-black/60 sm:text-base md:text-[0.9375rem] md:leading-relaxed">
            {linkifyEmails(direct)}
          </p>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-black/45 sm:text-base md:text-[0.9375rem] md:leading-relaxed">
            {WHO_YOU_REACH}
          </p>
        </div>
      </Reveal>
    </div>
  )
}
