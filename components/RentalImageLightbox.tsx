'use client'

import {ChevronLeft, ChevronRight, X} from 'lucide-react'
import Image from 'next/image'
import {useCallback, useEffect, useId, useState} from 'react'
import {createPortal} from 'react-dom'

export type RentalLightboxImage = {
  src: string
  alt: string
}

type RentalImageLightboxProps = {
  open: boolean
  onClose: () => void
  images: RentalLightboxImage[]
  index: number
  onIndexChange: (index: number) => void
  label?: string
}

/** Full-screen photo viewer with prev/next arrows for rental galleries. */
export function RentalImageLightbox({
  open,
  onClose,
  images,
  index,
  onIndexChange,
  label,
}: RentalImageLightboxProps) {
  const dialogId = useId()
  const [mounted, setMounted] = useState(false)
  const count = images.length
  const current = count > 0 ? images[((index % count) + count) % count] : null

  const goPrev = useCallback(() => {
    if (count < 2) return
    onIndexChange(((index % count) + count - 1) % count)
  }, [count, index, onIndexChange])

  const goNext = useCallback(() => {
    if (count < 2) return
    onIndexChange(((index % count) + count + 1) % count)
  }, [count, index, onIndexChange])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') goPrev()
      if (event.key === 'ArrowRight') goNext()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose, goPrev, goNext])

  if (!mounted || !open || !current) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0a0a0a]/92 p-4 backdrop-blur-md backdrop-saturate-0 sm:p-6 md:p-10"
      onClick={onClose}
      role="presentation"
    >
      <div
        id={dialogId}
        role="dialog"
        aria-modal="true"
        aria-label={label || current.alt || 'Photo gallery'}
        className="relative flex h-full w-full max-w-6xl flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative z-10 flex shrink-0 items-center justify-between gap-4 px-1 py-2 md:py-3">
          <p className="min-w-0 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
            {label ? `${label} · ` : ''}
            {index + 1} / {count}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex items-center gap-2 p-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-white"
          >
            Close
            <X className="h-3 w-3 shrink-0" strokeWidth={1.25} aria-hidden="true" />
          </button>
        </div>

        <div className="relative min-h-0 flex-1">
          <Image
            src={current.src}
            alt={current.alt}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />

          {count > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous photo"
                className="absolute left-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-white/70 transition-colors hover:text-white sm:h-14 sm:w-14"
              >
                <ChevronLeft
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  strokeWidth={1.25}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next photo"
                className="absolute right-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-white/70 transition-colors hover:text-white sm:h-14 sm:w-14"
              >
                <ChevronRight
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  strokeWidth={1.25}
                  aria-hidden="true"
                />
              </button>
            </>
          ) : null}
        </div>

        {current.alt ? (
          <p className="shrink-0 px-1 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45 md:py-4">
            {current.alt}
          </p>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
