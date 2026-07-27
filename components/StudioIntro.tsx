import {CapReveal} from '@/components/CapabilitiesMotion'

type StudioIntroProps = {
  lead?: string | null
}

/** Portland HQ band — same feature split as Capabilities “Why modular”. */
export function StudioIntro({lead}: StudioIntroProps) {
  if (!lead?.trim()) return null

  return (
    <section className="border-b border-black/10 bg-background-light">
      <div className="mx-auto grid max-w-6xl items-start gap-5 px-5 py-14 sm:gap-6 sm:px-6 sm:py-16 md:grid-cols-2 md:gap-12 md:py-20 lg:gap-16">
        <CapReveal y={12}>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-black/40 sm:text-[11px]">
            The studio
          </p>
          <h2 className="mt-4 max-w-md font-mono text-[clamp(1.55rem,3.5vw,2.65rem)] font-medium leading-[1.08] tracking-tight text-black md:mt-5">
            Portland HQ
          </h2>
        </CapReveal>

        <CapReveal delay={0.1} y={16}>
          <p className="text-[0.875rem] leading-[1.7] text-black/55 md:pt-4 md:text-[0.9375rem] md:leading-[1.75] lg:pt-5">
            {lead}
          </p>
        </CapReveal>
      </div>
    </section>
  )
}
