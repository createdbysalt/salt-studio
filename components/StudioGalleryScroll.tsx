'use client'

import {RentalImageLightbox, type RentalLightboxImage} from '@/components/RentalImageLightbox'
import {PORTLAND_STUDIO_STILLS} from '@/components/StudioMedia'
import {motion, useReducedMotion, useScroll, useTransform} from 'motion/react'
import Image from 'next/image'
import {useCallback, useRef, useState} from 'react'

type GalleryImage = RentalLightboxImage

type StudioGalleryScrollProps = {
  images?: GalleryImage[] | null
  label?: string
  /** When true, click opens a lightbox with arrow navigation. */
  lightbox?: boolean
}

/**
 * Full-bleed stills — one horizontal strip that pans left→right
 * as the strip scrolls through the viewport (no tall sticky runway).
 */
export function StudioGalleryScroll({images, label, lightbox = false}: StudioGalleryScrollProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  // `undefined` → studio-page defaults; explicit `[]` → hide (CMS-driven pages).
  const frames =
    images === undefined
      ? PORTLAND_STUDIO_STILLS.map((image) => ({src: image.src, alt: image.alt}))
      : images

  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const openAt = useCallback((i: number) => {
    setIndex(i)
    setOpen(true)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  const {scrollYProgress} = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-58%'])
  const aria = label || 'Gallery'

  if (!frames.length) return null

  const cell = (image: GalleryImage, i: number, sizes: string, tallClass: string) => {
    const media = (
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        className="object-cover"
        priority={i < 2}
      />
    )

    if (!lightbox) {
      return (
        <li key={`${image.src}-${i}`} className={`relative shrink-0 overflow-hidden ${tallClass}`}>
          {media}
        </li>
      )
    }

    return (
      <li key={`${image.src}-${i}`} className={`relative shrink-0 overflow-hidden ${tallClass}`}>
        <button
          type="button"
          onClick={() => openAt(i)}
          aria-label={`View ${image.alt || `photo ${i + 1}`}`}
          className="absolute inset-0 block text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-black"
        >
          {media}
        </button>
      </li>
    )
  }

  const lightboxNode = lightbox ? (
    <RentalImageLightbox
      open={open}
      onClose={close}
      images={frames}
      index={index}
      onIndexChange={setIndex}
      label={label}
    />
  ) : null

  if (reduce) {
    return (
      <>
        <section
          className="overflow-x-auto border-b border-black/10 bg-background-light"
          aria-label={aria}
        >
          <ul className="flex w-max">
            {frames.map((image, i) =>
              cell(image, i, '70vw', 'h-[22vh] w-[min(52vw,480px)] sm:h-[30vh]'),
            )}
          </ul>
        </section>
        {lightboxNode}
      </>
    )
  }

  return (
    <>
      <section
        ref={sectionRef}
        className="overflow-hidden border-b border-black/10 bg-background-light"
        aria-label={aria}
      >
        <motion.ul style={{x}} className="flex w-max will-change-transform">
          {frames.map((image, i) =>
            cell(
              image,
              i,
              '(max-width: 768px) 78vw, 72vw',
              'h-[22vh] w-[min(58vw,620px)] sm:h-[30vh] sm:w-[min(52vw,680px)] md:h-[38vh]',
            ),
          )}
        </motion.ul>
      </section>
      {lightboxNode}
    </>
  )
}
