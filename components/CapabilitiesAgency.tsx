import {CapabilitiesAmbientVideo} from '@/components/CapabilitiesAmbientVideo'
import {CAP_DEFAULT_VIDEO} from '@/components/CapabilitiesMedia'
import {CapReveal} from '@/components/CapabilitiesMotion'

type CapabilitiesAgencyProps = {
  subhead?: string | null
  body?: string | null
  pullQuote?: string | null
  ambientVideoUrl?: string | null
}

/** Dark band — copy left, full clear video right (stacked on mobile/tablet). */
export function CapabilitiesAgency({
  subhead,
  body,
  pullQuote,
  ambientVideoUrl,
}: CapabilitiesAgencyProps) {
  const videoSrc = ambientVideoUrl || CAP_DEFAULT_VIDEO.agencyDark

  return (
    <section className="overflow-hidden bg-[#0A0A0A] text-white">
      <div className="grid lg:grid-cols-2">
        <CapReveal className="flex flex-col justify-center px-5 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-20 md:px-10 md:pb-20 md:pt-24 lg:border-r lg:border-white/10 lg:py-24">
          {subhead ? (
            <h2 className="max-w-xl font-mono text-[clamp(1.5rem,4vw,2.75rem)] font-medium leading-[1.1] tracking-tight text-white">
              {subhead}
            </h2>
          ) : null}
          {body ? (
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60 sm:mt-6 md:text-[15px]">
              {body}
            </p>
          ) : null}
          {pullQuote ? (
            <p className="mt-6 max-w-md font-mono text-[11px] leading-relaxed text-white/40 sm:mt-8">
              {pullQuote}
            </p>
          ) : null}
        </CapReveal>

        <div className="relative min-h-[300px] bg-black sm:min-h-[360px] md:min-h-[420px] lg:min-h-[560px]">
          <CapabilitiesAmbientVideo src={videoSrc} blend="normal" opacity={1} />
        </div>
      </div>
    </section>
  )
}
