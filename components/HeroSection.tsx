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

  // On-media type stays white over the scrim; paper stage uses ink tokens.
  const textColor = hasBackground ? 'text-white' : 'text-foreground'
  const subtextColor = hasBackground ? 'text-white/90' : 'text-foreground/70'

  return (
    <section
      className={`relative flex flex-col justify-center overflow-hidden rounded-lg ${
        hasBackground ? '' : 'bg-muted'
      } ${sizeClasses[size]} ${alignmentClasses[style]}`}
    >
      {/* Background image with scrim */}
      {backgroundUrl && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{backgroundImage: `url(${backgroundUrl})`}}
            role="img"
            aria-label={backgroundImage?.alt || 'Hero background'}
          />
          <div className="absolute inset-0 bg-ink/50" />
        </>
      )}

      {/* Content */}
      <div
        className={`relative z-10 mx-auto w-full max-w-5xl px-6 ${
          style === 'split' ? 'lg:grid lg:grid-cols-2 lg:gap-12' : ''
        }`}
      >
        <div className={`flex flex-col ${alignmentClasses[style]}`}>
          {/* Eyebrow — mono label */}
          {eyebrow && (
            <span
              className={`mb-4 inline-block font-mono text-[12px] font-medium uppercase tracking-[0.08em] ${
                hasBackground ? 'text-white/70' : 'text-foreground/40'
              }`}
            >
              {eyebrow}
            </span>
          )}

          {/* Headline */}
          <h1
            className={`text-4xl font-semibold uppercase leading-[0.95] tracking-[-0.02em] md:text-5xl lg:text-6xl ${textColor}`}
          >
            {headline}
          </h1>

          {/* Subheadline */}
          {subheadline && (
            <p className={`mt-6 max-w-2xl text-lg leading-relaxed md:text-xl ${subtextColor}`}>
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
              className="aspect-square rounded-md bg-cover bg-center lg:aspect-[4/3]"
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

  // Paper stage: design-system button utilities. On media: white variants over the scrim.
  const getClassName = () => {
    if (style === 'primary') {
      if (hasBackground) {
        // White solid button on media
        return 'inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink transition-colors duration-300 hover:bg-white/85'
      }
      return 'btn-solid'
    }

    // Secondary / ghost
    if (hasBackground) {
      return 'inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-white transition-colors duration-300 hover:border-white'
    }
    return 'btn-ghost'
  }

  const buttonProps = {
    className: getClassName(),
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
