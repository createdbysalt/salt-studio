import {CapReveal} from '@/components/CapabilitiesMotion'

type RentalProseBlock = {
  subhead?: string | null
  body?: string | null
}

type RentalProseProps = {
  blocks: RentalProseBlock[]
}

/**
 * Editorial prose bands for What's included / What's extra / Who it's for —
 * same split rhythm as StudioIntro.
 */
export function RentalProse({blocks}: RentalProseProps) {
  const visible = blocks.filter((block) => block.subhead?.trim() || block.body?.trim())
  if (!visible.length) return null

  return (
    <section className="border-b border-black/10 bg-background-light">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-5 py-14 sm:px-6 sm:py-16 md:gap-16 md:py-20">
        {visible.map((block, index) => (
          <div
            key={`${block.subhead ?? 'block'}-${index}`}
            className="grid items-start gap-5 sm:gap-6 md:grid-cols-2 md:gap-12 lg:gap-16"
          >
            <CapReveal y={12}>
              {block.subhead ? (
                <h2 className="max-w-md font-mono text-[clamp(1.35rem,3.2vw,2.25rem)] font-medium leading-[1.08] tracking-tight text-black">
                  {block.subhead}
                </h2>
              ) : null}
            </CapReveal>
            <CapReveal delay={0.08} y={14}>
              {block.body ? (
                <p className="text-[0.875rem] leading-[1.7] text-black/55 md:pt-1 md:text-[0.9375rem] md:leading-[1.75]">
                  {block.body}
                </p>
              ) : null}
            </CapReveal>
          </div>
        ))}
      </div>
    </section>
  )
}
