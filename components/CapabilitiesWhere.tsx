import {CapReveal} from '@/components/CapabilitiesMotion'
import {urlForImage} from '@/sanity/lib/utils'
import Image from 'next/image'

type SanityImage = {
  asset?: {_ref?: string; _id?: string; url?: string} | null
  alt?: string | null
} | null

type WhereLocation = {
  _id?: string | null
  name?: string | null
  shortName?: string | null
  caption?: string | null
  role?: string | null
  kind?: string | null
  image?: SanityImage
} | null

type CapabilitiesWhereProps = {
  subhead?: string | null
  sideTagline?: string | null
  leftLocation?: WhereLocation
  rightLocation?: WhereLocation
}

const DEFAULT_LEFT = ''
const DEFAULT_RIGHT = ''

const VERTICAL_LABEL =
  'pointer-events-none absolute z-10 font-sans text-[clamp(1.15rem,2vw,1.85rem)] font-black uppercase tracking-[0.02em] text-black [text-shadow:0_0_0.35px_currentColor,0_0_0.35px_currentColor]'

const LOCATION_META =
  'flex flex-col gap-px font-mono text-[11px] uppercase leading-none tracking-[0.1em] text-black sm:text-[12px] md:text-[15px]'

const FRAME_MARKS = ['47', '↑', '48', '↑', '49'] as const

function resolveSrc(image: SanityImage | undefined, fallback: string) {
  if (image?.asset?._ref) {
    return (
      urlForImage({asset: {_ref: image.asset._ref}})
        ?.width(2400)
        .height(1600)
        .fit('crop')
        .url() || fallback
    )
  }
  return fallback
}

function LocationMeta({place, role}: {place: string; role?: string | null}) {
  if (!place && !role) return null
  return (
    <div className={LOCATION_META}>
      {place ? <p>{place}</p> : null}
      {role ? <p>{`» ${role}`}</p> : null}
    </div>
  )
}

/** Vertical film-edge seam — desktop only. */
function FilmStripSeam() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden w-[14px] min-w-[14px] max-w-[14px] -translate-x-1/2 overflow-hidden bg-black md:flex"
    >
      <div className="flex h-full w-full flex-col items-center justify-between py-4">
        <span className="font-mono text-[5px] font-medium uppercase leading-none tracking-[0.14em] text-neutral-200 [writing-mode:vertical-rl] rotate-180">
          Kodak Portra 400
        </span>

        <div className="flex flex-col items-center gap-2">
          {FRAME_MARKS.map((mark, i) => (
            <span
              key={`${mark}-${i}`}
              className="font-mono text-[5px] font-medium leading-none text-neutral-200"
            >
              {mark}
            </span>
          ))}
        </div>

        <span className="font-mono text-[5px] font-medium uppercase leading-none tracking-[0.14em] text-neutral-200 [writing-mode:vertical-rl]">
          Kodak Portra 400
        </span>
      </div>
    </div>
  )
}

/** Horizontal film edge between stacked panels on mobile. */
function FilmStripSeamMobile() {
  return (
    <div
      aria-hidden="true"
      className="relative z-20 flex h-[14px] w-full items-center justify-between bg-black px-3 md:hidden"
    >
      <span className="font-mono text-[7px] font-medium uppercase tracking-[0.18em] text-neutral-200">
        Kodak Portra 400
      </span>
      <span className="font-mono text-[7px] font-medium tracking-wide text-neutral-200">48</span>
      <span className="font-mono text-[7px] font-medium uppercase tracking-[0.18em] text-neutral-200">
        Kodak Portra 400
      </span>
    </div>
  )
}

/** Full-bleed location diptych — stacked on mobile, split from md up. */
export function CapabilitiesWhere({
  subhead,
  sideTagline,
  leftLocation,
  rightLocation,
}: CapabilitiesWhereProps) {
  const leftSrc = resolveSrc(leftLocation?.image, DEFAULT_LEFT)
  const rightSrc = resolveSrc(rightLocation?.image, DEFAULT_RIGHT)
  const leftAlt = leftLocation?.image?.alt?.trim() || leftLocation?.name || 'Salt Studio Portland studio'
  const rightAlt =
    rightLocation?.image?.alt?.trim() || rightLocation?.name || 'Salt Studio Lisbon location'

  const leftLabel = leftLocation?.shortName?.trim() || leftLocation?.name || 'Portland'
  const rightLabel = rightLocation?.shortName?.trim() || rightLocation?.name || 'Portugal'
  const leftCaption = leftLocation?.caption?.trim() || 'Portland OR, USA'
  const rightCaption = rightLocation?.caption?.trim() || 'Lisbon, Portugal'
  const leftRole = leftLocation?.role?.trim() || 'Main studio and production hub'
  const rightRole = rightLocation?.role?.trim() || 'Satellite studio and post hub'

  return (
    <section
      aria-label="Where we work"
      className="relative overflow-hidden bg-black md:min-h-[min(92svh,860px)]"
    >
      <div className="grid grid-cols-1 md:absolute md:inset-0 md:grid-cols-2">
        <div className="relative min-h-[42svh] md:min-h-0">
          <Image
            src={leftSrc}
            alt={leftAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-center brightness-[0.97]"
            priority={false}
          />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-black/[0.06]" aria-hidden />
          <CapReveal
            className={`${VERTICAL_LABEL} right-3 top-4 [writing-mode:vertical-rl] md:right-2 md:top-[32%] md:rotate-180`}
            delay={0.18}
            y={0}
          >
            {leftLabel}
          </CapReveal>
          {subhead ? (
            <CapReveal
              className="pointer-events-none absolute left-4 top-16 z-10 max-w-[min(20rem,calc(100%-2rem))] sm:left-5 sm:top-20 md:left-8 md:top-24 lg:left-10"
              delay={0.12}
              y={12}
            >
              <h2 className="font-mono text-[clamp(1.35rem,4.5vw,2.5rem)] font-medium leading-snug tracking-tight text-black">
                {subhead}
              </h2>
            </CapReveal>
          ) : null}
          <CapReveal
            className="pointer-events-none absolute bottom-5 left-4 z-10 md:bottom-10 md:left-6"
            delay={0.22}
            y={8}
          >
            <LocationMeta place={leftCaption} role={leftRole} />
          </CapReveal>
        </div>

        <div className="md:hidden">
          <FilmStripSeamMobile />
        </div>

        <div className="relative min-h-[42svh] md:min-h-0">
          <Image
            src={rightSrc}
            alt={rightAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-center brightness-[0.97]"
          />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-black/[0.06]" aria-hidden />
          <CapReveal
            className={`${VERTICAL_LABEL} hidden md:block md:left-2 md:top-[52%] md:[writing-mode:vertical-rl]`}
            delay={0.2}
            y={0}
          >
            {rightLabel}
          </CapReveal>
          <CapReveal
            className="pointer-events-none absolute left-4 top-5 z-10 font-sans text-[1.15rem] font-black uppercase tracking-[0.02em] text-black md:hidden"
            delay={0.12}
            y={8}
          >
            {rightLabel}
          </CapReveal>
          {sideTagline ? (
            <CapReveal
              className="pointer-events-none absolute right-3 top-3 z-10 max-w-[11rem] text-right font-mono text-[7px] uppercase leading-snug tracking-[0.14em] text-black sm:max-w-[14rem] sm:text-[8px] md:right-6 md:top-4 md:max-w-[20rem] md:text-[9px]"
              delay={0.16}
              y={6}
            >
              {sideTagline}
            </CapReveal>
          ) : null}
          <CapReveal
            className="pointer-events-none absolute bottom-5 left-4 z-10 md:bottom-10 md:left-6"
            delay={0.24}
            y={8}
          >
            <LocationMeta place={rightCaption} role={rightRole} />
          </CapReveal>
        </div>
      </div>

      <FilmStripSeam />
    </section>
  )
}
