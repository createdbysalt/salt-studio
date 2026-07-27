import {urlForImage} from '@/sanity/lib/utils'
import {stegaClean} from 'next-sanity'
import Link from 'next/link'

type HeroButton = {
  _key: string
  label: string
  link: string
  style?: 'primary' | 'secondary'
}

type HeroSectionProps = {
  eyebrow?: string
  headline: string
  subheadline?: string
  backgroundImage?: {
    asset?: {_ref: string}
    alt?: string
  }
  style?: 'centered' | 'left' | 'split'
  size?: 'small' | 'medium' | 'large'
  buttons?: HeroButton[]
}

/**
 * Hero Section Component
 *
 * A flexible hero section supporting multiple layouts and sizes.
 */
export function HeroSection({
  eyebrow,
  headline,
  subheadline,
  backgroundImage,
  style = 'centered',
  size = 'medium',
  buttons = [],
}: HeroSectionProps) {
  const backgroundUrl = backgroundImage?.asset
    ? urlForImage(backgroundImage)?.width(1920).height(1080).url()
    : null

  const hasBackground = !!backgroundUrl

  // Size classes
  const sizeClasses = {
    small: 'py-16 md:py-24',
    medium: 'py-24 md:py-32',
    large: 'min-h-[80vh] py-32 md:py-40',
  }

  // Text alignment based on style
  const alignmentClasses = {
    centered: 'text-center items-center',
    left: 'text-left items-start',
    split: 'text-left items-start lg:items-center',
  }

  // Text colors based on background
  const textColor = hasBackground ? 'text-white' : ''
  const subtextColor = hasBackground ? 'text-white/90' : 'text-gray-600'

  return (
    <section
      className={`relative flex flex-col justify-center overflow-hidden rounded-lg ${sizeClasses[size]} ${alignmentClasses[style]}`}
      style={{
        backgroundColor: hasBackground ? undefined : 'var(--color-muted)',
      }}
    >
      {/* Background image with overlay */}
      {backgroundUrl && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{backgroundImage: `url(${backgroundUrl})`}}
            role="img"
            aria-label={backgroundImage?.alt || 'Hero background'}
          />
          <div className="absolute inset-0 bg-black/50" />
        </>
      )}

      {/* Content */}
      <div
        className={`relative z-10 mx-auto w-full max-w-5xl px-6 ${
          style === 'split' ? 'lg:grid lg:grid-cols-2 lg:gap-12' : ''
        }`}
      >
        <div className={`flex flex-col ${alignmentClasses[style]}`}>
          {/* Eyebrow */}
          {eyebrow && (
            <span
              className={`mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-medium ${
                hasBackground ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
              }`}
              style={
                hasBackground
                  ? undefined
                  : {
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                    }
              }
            >
              {eyebrow}
            </span>
          )}

          {/* Headline */}
          <h1
            className={`text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl ${textColor}`}
            style={hasBackground ? undefined : {color: 'var(--color-foreground)'}}
          >
            {headline}
          </h1>

          {/* Subheadline */}
          {subheadline && (
            <p
              className={`mt-6 max-w-2xl text-lg md:text-xl ${subtextColor}`}
              style={hasBackground ? undefined : {color: 'var(--color-muted-foreground)'}}
            >
              {subheadline}
            </p>
          )}

          {/* Buttons */}
          {buttons.length > 0 && (
            <div
              className={`mt-8 flex flex-wrap gap-4 ${
                style === 'centered' ? 'justify-center' : ''
              }`}
            >
              {buttons.map((button, index) => (
                <HeroButton
                  key={button._key}
                  button={button}
                  hasBackground={hasBackground}
                  isFirst={index === 0}
                />
              ))}
            </div>
          )}
        </div>

        {/* Split layout: image on right side */}
        {style === 'split' && backgroundUrl && (
          <div className="mt-10 lg:mt-0">
            <div
              className="aspect-square rounded-lg bg-cover bg-center shadow-xl lg:aspect-[4/3]"
              style={{backgroundImage: `url(${backgroundUrl})`}}
              role="img"
              aria-label={backgroundImage?.alt || 'Hero image'}
            />
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * Individual hero button
 */
function HeroButton({
  button,
  hasBackground,
  isFirst,
}: {
  button: HeroButton
  hasBackground: boolean
  isFirst: boolean
}) {
  const {label, link, style = isFirst ? 'primary' : 'secondary'} = button

  // Clean stega markers from href
  const cleanLink = stegaClean(link)
  const isExternal = cleanLink.startsWith('http://') || cleanLink.startsWith('https://')

  const baseClasses =
    'inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-medium transition-colors'

  // Style based on button type and background
  const getStyles = () => {
    if (style === 'primary') {
      if (hasBackground) {
        // White button on dark background
        return {
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-foreground)',
        }
      }
      return {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-primary-foreground)',
      }
    }

    // Secondary style
    if (hasBackground) {
      return {
        backgroundColor: 'transparent',
        border: '2px solid white',
        color: 'white',
      }
    }
    return {
      backgroundColor: 'transparent',
      border: '2px solid var(--color-border)',
      color: 'var(--color-foreground)',
    }
  }

  const buttonProps = {
    className: baseClasses,
    style: getStyles(),
  }

  if (isExternal) {
    return (
      <a href={cleanLink} target="_blank" rel="noopener noreferrer" {...buttonProps}>
        {label}
      </a>
    )
  }

  return (
    <Link href={cleanLink} {...buttonProps}>
      {label}
    </Link>
  )
}
