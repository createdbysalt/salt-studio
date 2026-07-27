import {CapabilitiesAmbientVideo} from '@/components/CapabilitiesAmbientVideo'
import {CAP_DEFAULT_VIDEO} from '@/components/CapabilitiesMedia'
import {CapReveal} from '@/components/CapabilitiesMotion'

type CapabilitiesHeroProps = {
  headline?: string | null
  lead?: string | null
  founderAnchor?: string | null
  secondaryLine?: string | null
  ambientVideoUrl?: string | null
}

/**
 * Full-viewport capabilities hero — deck chapter frame with motion loop as the
 * entire field and site nav fixed over the top (see Navbar overlay path).
 */
export function CapabilitiesHero({
  headline,
  lead,
  founderAnchor,
  secondaryLine,
  ambientVideoUrl,
}: CapabilitiesHeroProps) {
  const videoSrc = ambientVideoUrl || CAP_DEFAULT_VIDEO.heroLight

  return (
    <header className="relative isolate h-[100svh] max-h-[100svh] overflow-hidden bg-background-light">
      <div className="pointer-events-none absolute inset-0">
        <CapabilitiesAmbientVideo src={videoSrc} blend="normal" opacity={1} />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background-light/85 via-background-light/25 to-transparent md:from-background-light/70 md:via-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background-light/55 to-transparent"
      />

      <div className="relative z-10 flex h-full flex-col px-4 pb-8 pt-[var(--project-nav-height)] sm:px-5 sm:pb-10 md:px-8 md:pb-12 md:pt-[var(--project-nav-height-md)] lg:px-10">
        <div className="mt-auto flex max-w-3xl flex-col justify-end lg:max-w-[50%]">
          <CapReveal immediate delay={0.08} y={18}>
            {headline ? (
              <h1 className="font-mono text-[clamp(1.75rem,7vw,4.25rem)] font-medium leading-[0.95] tracking-tight text-black">
                {headline}
              </h1>
            ) : null}
          </CapReveal>
          <CapReveal immediate delay={0.18} y={12}>
            {lead ? (
              <p className="mt-4 max-w-md text-sm leading-relaxed text-black/65 sm:mt-5 md:mt-6 md:text-base">
                {lead}
              </p>
            ) : null}
          </CapReveal>
          <CapReveal immediate delay={0.28} y={10}>
            {founderAnchor ? (
              <p className="mt-3 max-w-md font-mono text-[10px] leading-relaxed text-black/40 sm:mt-4 sm:text-[11px]">
                {founderAnchor}
              </p>
            ) : null}
          </CapReveal>
          <CapReveal immediate delay={0.38} y={8}>
            {secondaryLine ? (
              <p className="mt-5 inline-block w-fit max-w-full bg-black px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white sm:mt-6 sm:text-[9px] sm:tracking-[0.14em] md:mt-8">
                {secondaryLine}
              </p>
            ) : null}
          </CapReveal>
        </div>
      </div>
    </header>
  )
}
