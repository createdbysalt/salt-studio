'use client'

import {CapReveal} from '@/components/CapabilitiesMotion'
import {
  PORTLAND_STUDIO_STILLS,
  resolveStudioImageSrc,
  STUDIO_DEFAULT_IMAGES,
  type StudioSanityImage,
} from '@/components/StudioMedia'
import {motion, useReducedMotion} from 'motion/react'
import Image from 'next/image'

type SpecRow = {_key: string; label: string | null; value: string | null}

type StudioSpecsProps = {
  subhead?: string | null
  rows: SpecRow[]
  gallery?: StudioSanityImage[] | null
  /** When CMS gallery is empty, still show the default Portland stills mosaic. */
  useDefaultGallery?: boolean
}

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Compact technical specs sheet.
 */
export function StudioSpecs({subhead, rows, gallery, useDefaultGallery}: StudioSpecsProps) {
  const reduce = useReducedMotion()
  if (!rows.length && !gallery?.length && !useDefaultGallery) return null

  const images =
    gallery && gallery.length > 0
      ? gallery.map((image, i) => ({
          key: `g-${i}`,
          src: resolveStudioImageSrc(
            image,
            STUDIO_DEFAULT_IMAGES.gallery.length
              ? STUDIO_DEFAULT_IMAGES.gallery[i % STUDIO_DEFAULT_IMAGES.gallery.length]
              : '',
            1600,
            1067,
          ),
          alt: image?.alt?.trim() || `Studio interior ${i + 1}`,
        }))
      : useDefaultGallery && PORTLAND_STUDIO_STILLS.length > 0
        ? PORTLAND_STUDIO_STILLS.map((still, i) => ({
            key: `d-${i}`,
            src: still.src,
            alt: still.alt,
          }))
        : []

  return (
    <section className="border-t border-black/10 bg-background-light">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-14 md:px-10 md:py-16">
        <CapReveal y={10}>
          <h2 className="font-mono text-[clamp(1.15rem,2.4vw,1.5rem)] font-medium leading-snug tracking-tight text-black">
            {subhead?.trim() || 'Specs.'}
          </h2>
        </CapReveal>

        {rows.length ? (
          <dl className="mt-5 divide-y divide-black/10 border-y border-black/10 sm:mt-6">
            {rows.map((row, index) => {
              const rowInner = (
                <div className="grid grid-cols-1 gap-0.5 py-2 transition-colors duration-300 hover:bg-black/[0.015] sm:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)] sm:items-baseline sm:gap-6 sm:px-1 sm:py-2.5">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">
                    {row.label}
                  </dt>
                  <dd className="text-[13px] leading-snug text-black/75 sm:text-right sm:text-sm">
                    {row.value}
                  </dd>
                </div>
              )

              if (reduce) {
                return <div key={row._key}>{rowInner}</div>
              }

              return (
                <motion.div
                  key={row._key}
                  initial={{opacity: 0, y: 8}}
                  whileInView={{opacity: 1, y: 0}}
                  viewport={{once: true, margin: '-4% 0px', amount: 0.2}}
                  transition={{duration: 0.4, delay: Math.min(index * 0.03, 0.35), ease: EASE}}
                >
                  {rowInner}
                </motion.div>
              )
            })}
          </dl>
        ) : null}
      </div>

      {images.length ? (
        <ul className="grid list-none grid-cols-2 gap-px bg-black/10 md:grid-cols-3">
          {images.slice(0, 6).map((image, index) => (
            <li key={image.key} className="relative aspect-[3/2] bg-background-light">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
                priority={index < 2}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
