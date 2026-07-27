'use client'

import {urlForImage} from '@/sanity/lib/utils'
import {stegaClean} from 'next-sanity'

type Logo = {
  _key: string
  image: {
    asset?: {_ref: string}
  }
  name: string
  url?: string
}

type LogoCarouselProps = {
  title?: string
  logos: Logo[]
  style?: 'grid' | 'scrolling' | 'row'
  grayscale?: boolean
}

/**
 * Logo Carousel Component
 *
 * Displays partner/client logos in various layouts.
 */
export function LogoCarousel({
  title = 'Trusted By',
  logos,
  style = 'grid',
  grayscale = true,
}: LogoCarouselProps) {
  return (
    <section className="py-12 md:py-16">
      {/* Header */}
      {title && (
        <h2
          className="mb-8 text-center text-sm font-medium uppercase tracking-wider"
          style={{color: 'var(--color-muted-foreground)'}}
        >
          {title}
        </h2>
      )}

      {/* Logos */}
      {style === 'grid' && <GridLayout logos={logos} grayscale={grayscale} />}
      {style === 'scrolling' && <ScrollingLayout logos={logos} grayscale={grayscale} />}
      {style === 'row' && <RowLayout logos={logos} grayscale={grayscale} />}
    </section>
  )
}

/**
 * Individual logo item
 */
function LogoItem({
  logo,
  grayscale,
  className = '',
}: {
  logo: Logo
  grayscale: boolean
  className?: string
}) {
  const imageUrl = logo.image?.asset
    ? urlForImage(logo.image)?.width(200).height(80).fit('max').url()
    : null

  if (!imageUrl) return null

  // Clean stega markers from strings used in attributes
  const cleanName = stegaClean(logo.name)
  const cleanUrl = logo.url ? stegaClean(logo.url) : undefined

  const imageClasses = `h-10 w-auto max-w-[140px] object-contain transition-all duration-300 ${
    grayscale ? 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100' : ''
  }`

  const content = <img src={imageUrl} alt={cleanName} title={cleanName} className={imageClasses} />

  if (cleanUrl) {
    return (
      <a
        href={cleanUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center ${className}`}
        title={`Visit ${cleanName}`}
      >
        {content}
      </a>
    )
  }

  return <div className={`flex items-center justify-center ${className}`}>{content}</div>
}

/**
 * Grid layout - responsive grid of logos
 */
function GridLayout({logos, grayscale}: {logos: Logo[]; grayscale: boolean}) {
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {logos.map((logo) => (
        <LogoItem key={logo._key} logo={logo} grayscale={grayscale} className="py-4" />
      ))}
    </div>
  )
}

/**
 * Simple row layout
 */
function RowLayout({logos, grayscale}: {logos: Logo[]; grayscale: boolean}) {
  return (
    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-4 md:gap-12">
      {logos.map((logo) => (
        <LogoItem key={logo._key} logo={logo} grayscale={grayscale} />
      ))}
    </div>
  )
}

/**
 * Scrolling/marquee layout - infinite scroll animation
 */
function ScrollingLayout({logos, grayscale}: {logos: Logo[]; grayscale: boolean}) {
  // Duplicate logos for seamless loop
  const duplicatedLogos = [...logos, ...logos]

  return (
    <div className="relative overflow-hidden">
      {/* Gradient fade on edges */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16"
        style={{
          background: 'linear-gradient(to right, var(--color-background), transparent)',
        }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16"
        style={{
          background: 'linear-gradient(to left, var(--color-background), transparent)',
        }}
      />

      {/* Scrolling container - uses animate-logo-scroll from globals.css */}
      <div className="flex animate-logo-scroll gap-12 py-4">
        {duplicatedLogos.map((logo, index) => (
          <LogoItem
            key={`${logo._key}-${index}`}
            logo={logo}
            grayscale={grayscale}
            className="flex-shrink-0"
          />
        ))}
      </div>
    </div>
  )
}
