'use client'

import {CapReveal} from '@/components/CapabilitiesMotion'
import {RentalImageLightbox, type RentalLightboxImage} from '@/components/RentalImageLightbox'
import Image from 'next/image'
import {useCallback, useId, useState} from 'react'

type RentalPhotoGalleryProps = {
  heading?: string | null
  images: RentalLightboxImage[]
  /** Screen-reader / lightbox label */
  label?: string
}

/**
 * Photo mosaic for rental pages — click opens a lightbox with arrow navigation.
 */
export function RentalPhotoGallery({heading, images, label}: RentalPhotoGalleryProps) {
  const headingId = useId()
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const openAt = useCallback((i: number) => {
    setIndex(i)
    setOpen(true)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  if (!images.length) return null

  return (
    <section
      className="border-t border-black/10 bg-background-light"
      aria-labelledby={heading ? headingId : undefined}
      aria-label={!heading ? label || 'Photo gallery' : undefined}
    >
      {heading?.trim() ? (
        <div className="mx-auto max-w-6xl px-5 pt-12 sm:px-6 sm:pt-14 md:px-10 md:pt-16">
          <CapReveal y={10}>
            <h2
              id={headingId}
              className="font-mono text-[clamp(1.15rem,2.4vw,1.5rem)] font-medium leading-snug tracking-tight text-black"
            >
              {heading.trim()}
            </h2>
          </CapReveal>
        </div>
      ) : null}

      <ul
        className={`grid list-none grid-cols-2 gap-px bg-black/10 md:grid-cols-3 ${
          heading?.trim() ? 'mt-8 sm:mt-10' : ''
        }`}
      >
        {images.map((image, i) => (
          <li key={`${image.src}-${i}`} className="relative aspect-[3/2] bg-background-light">
            <button
              type="button"
              onClick={() => openAt(i)}
              aria-label={`View ${image.alt || `photo ${i + 1}`}`}
              className="group absolute inset-0 block overflow-hidden text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-black"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                priority={i < 2}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10"
              />
            </button>
          </li>
        ))}
      </ul>

      <RentalImageLightbox
        open={open}
        onClose={close}
        images={images}
        index={index}
        onIndexChange={setIndex}
        label={label || heading || undefined}
      />
    </section>
  )
}
