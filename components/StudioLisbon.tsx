import {CapReveal} from '@/components/CapabilitiesMotion'
import {
  resolveStudioImageSrc,
  STUDIO_DEFAULT_IMAGES,
  type StudioSanityImage,
} from '@/components/StudioMedia'
import {StudioImageReveal} from '@/components/StudioMotion'
import Image from 'next/image'

type StudioLisbonProps = {
  headline?: string | null
  body?: string | null
  sideImage?: StudioSanityImage
  locationImage?: StudioSanityImage
}

/** Dark split — Lisbon / EU launchpad with facility still. */
export function StudioLisbon({headline, body, sideImage, locationImage}: StudioLisbonProps) {
  if (!headline && !body) return null

  const image = sideImage?.asset?._ref || sideImage?.asset?.url ? sideImage : locationImage
  const src = resolveStudioImageSrc(image, STUDIO_DEFAULT_IMAGES.lisbon, 1400, 1800)
  const alt = image?.alt?.trim() || 'Salt Studio Lisbon satellite studio'

  return (
    <section className="overflow-hidden bg-[#333] text-white">
      <div className="grid lg:grid-cols-2">
        <CapReveal className="flex flex-col justify-center px-5 py-14 sm:px-6 sm:py-16 md:px-10 md:py-20 lg:border-r lg:border-white/10">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45 sm:text-[11px]">
            Lisbon
          </p>
          {headline ? (
            <h2 className="mt-4 max-w-md font-mono text-[clamp(1.5rem,3.5vw,2.5rem)] font-medium leading-[1.08] tracking-tight text-white">
              {headline}
            </h2>
          ) : null}
          {body ? (
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/65 sm:mt-6 md:text-[15px] md:leading-[1.7]">
              {body}
            </p>
          ) : null}
        </CapReveal>

        <StudioImageReveal
          delay={0.08}
          className="group relative min-h-[280px] overflow-hidden bg-[#2A2A2A] sm:min-h-[360px] lg:min-h-[520px]"
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </StudioImageReveal>
      </div>
    </section>
  )
}
