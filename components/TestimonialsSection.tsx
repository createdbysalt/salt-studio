'use client'

import {urlForImage} from '@/sanity/lib/utils'
import {useState} from 'react'

type Testimonial = {
  _key: string
  quote: string
  author: string
  role?: string
  avatar?: {
    asset?: {_ref: string}
    alt?: string
  }
  rating?: number
}

type TestimonialsSectionProps = {
  title?: string
  subtitle?: string
  items: Testimonial[]
  style?: 'cards' | 'carousel' | 'featured'
  showRatings?: boolean
}

/**
 * Testimonials Section Component
 *
 * Displays client testimonials with multiple layout options.
 */
export function TestimonialsSection({
  title = 'What Our Clients Say',
  subtitle,
  items,
  style = 'cards',
  showRatings = true,
}: TestimonialsSectionProps) {
  return (
    <section className="py-12 md:py-16">
      {/* Header */}
      <div className="mb-10 text-center">
        {title && (
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{color: 'var(--color-foreground)'}}
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl" style={{color: 'var(--color-muted-foreground)'}}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Testimonials */}
      {style === 'cards' && <CardsLayout items={items} showRatings={showRatings} />}
      {style === 'carousel' && <CarouselLayout items={items} showRatings={showRatings} />}
      {style === 'featured' && <FeaturedLayout items={items} showRatings={showRatings} />}
    </section>
  )
}

/**
 * Star rating display
 */
function StarRating({rating}: {rating: number}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className="h-5 w-5"
          fill={star <= rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{color: star <= rating ? 'var(--color-primary)' : 'var(--color-border)'}}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ))}
    </div>
  )
}

/**
 * Individual testimonial card
 */
function TestimonialCard({
  testimonial,
  showRatings,
  size = 'normal',
}: {
  testimonial: Testimonial
  showRatings: boolean
  size?: 'normal' | 'large'
}) {
  const avatarUrl = testimonial.avatar?.asset
    ? urlForImage(testimonial.avatar)?.width(100).height(100).url()
    : null

  const isLarge = size === 'large'

  return (
    <div
      className={`rounded-lg p-6 ${isLarge ? 'md:p-10' : ''}`}
      style={{backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)'}}
    >
      {/* Rating */}
      {showRatings && testimonial.rating && (
        <div className="mb-4">
          <StarRating rating={testimonial.rating} />
        </div>
      )}

      {/* Quote */}
      <blockquote className="mb-6">
        <p
          className={`${isLarge ? 'text-xl md:text-2xl' : 'text-base'} leading-relaxed`}
          style={{color: 'var(--color-foreground)'}}
        >
          "{testimonial.quote}"
        </p>
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-4">
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt={testimonial.avatar?.alt || `Photo of ${testimonial.author}`}
            className="h-12 w-12 rounded-full object-cover"
          />
        )}
        <div>
          <p className="font-semibold" style={{color: 'var(--color-foreground)'}}>
            {testimonial.author}
          </p>
          {testimonial.role && (
            <p className="text-sm" style={{color: 'var(--color-muted-foreground)'}}>
              {testimonial.role}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Cards layout - grid of testimonials
 */
function CardsLayout({items, showRatings}: {items: Testimonial[]; showRatings: boolean}) {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((testimonial) => (
        <TestimonialCard
          key={testimonial._key}
          testimonial={testimonial}
          showRatings={showRatings}
        />
      ))}
    </div>
  )
}

/**
 * Carousel layout - sliding testimonials
 */
function CarouselLayout({items, showRatings}: {items: Testimonial[]; showRatings: boolean}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1))
  }

  if (items.length === 0) return null

  return (
    <div className="mx-auto max-w-3xl">
      {/* Testimonial */}
      <div className="relative">
        <TestimonialCard testimonial={items[currentIndex]} showRatings={showRatings} size="large" />
      </div>

      {/* Navigation */}
      {items.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={goToPrevious}
            className="rounded-full p-2 transition-colors"
            style={{
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
            aria-label="Previous testimonial"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentIndex ? 'scale-125' : ''
                }`}
                style={{
                  backgroundColor:
                    index === currentIndex ? 'var(--color-primary)' : 'var(--color-muted)',
                }}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            className="rounded-full p-2 transition-colors"
            style={{
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
            aria-label="Next testimonial"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Featured layout - single large testimonial with smaller ones below
 */
function FeaturedLayout({items, showRatings}: {items: Testimonial[]; showRatings: boolean}) {
  if (items.length === 0) return null

  const [featured, ...rest] = items

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Featured testimonial */}
      <TestimonialCard testimonial={featured} showRatings={showRatings} size="large" />

      {/* Rest of testimonials */}
      {rest.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {rest.map((testimonial) => (
            <TestimonialCard
              key={testimonial._key}
              testimonial={testimonial}
              showRatings={showRatings}
            />
          ))}
        </div>
      )}
    </div>
  )
}
