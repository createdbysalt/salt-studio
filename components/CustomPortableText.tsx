import {ContactForm} from '@/components/ContactForm'
import {FAQSection} from '@/components/FAQSection'
import {HeroSection} from '@/components/HeroSection'
import ImageBox from '@/components/ImageBox'
import {LogoCarousel} from '@/components/LogoCarousel'
import {TestimonialsSection} from '@/components/TestimonialsSection'
import {TimelineSection} from '@/components/TimelineSection'
import type {PathSegment} from '@sanity/client/csm'
import {
  PortableText,
  stegaClean,
  type PortableTextBlock,
  type PortableTextComponents,
} from 'next-sanity'
import Link from 'next/link'
import type {Image} from 'sanity'

export function CustomPortableText({
  id,
  type,
  path,
  paragraphClasses,
  imageCaptionClasses = 'font-sans text-sm text-gray-600',
  value,
}: {
  id: string | null
  type: string | null
  path: PathSegment[]
  paragraphClasses?: string
  imageCaptionClasses?: string
  value: PortableTextBlock[]
}) {
  const components: PortableTextComponents = {
    block: {
      normal: ({children}) => {
        return <p className={paragraphClasses}>{children}</p>
      },
    },
    marks: {
      link: ({children, value}) => {
        return (
          <a
            className="underline transition hover:opacity-50"
            href={value?.href}
            rel="noreferrer noopener"
          >
            {children}
          </a>
        )
      },
    },
    types: {
      image: ({value}: {value: Image & {alt?: string; caption?: string}}) => {
        return (
          <div className="my-6 space-y-2">
            <ImageBox
              image={value}
              alt={value.alt}
              classesWrapper="relative aspect-[16/9] overflow-hidden bg-white/[0.04]"
            />
            {value?.caption && <div className={imageCaptionClasses}>{value.caption}</div>}
          </div>
        )
      },
      hero: ({value}) => {
        const {eyebrow, headline, subheadline, backgroundImage, style, size, buttons, _key} =
          value || {}
        return (
          <HeroSection
            key={_key}
            eyebrow={eyebrow}
            headline={headline}
            subheadline={subheadline}
            backgroundImage={backgroundImage}
            style={style}
            size={size}
            buttons={buttons || []}
          />
        )
      },
      timeline: ({value}) => {
        const {items, _key} = value || {}
        return (
          <TimelineSection
            key={_key}
            id={id}
            type={type}
            path={[...path, {_key}, 'items']}
            timelines={items}
          />
        )
      },
      faq: ({value}) => {
        const {title, description, items, style, _key} = value || {}
        return (
          <FAQSection
            key={_key}
            title={title}
            description={description}
            items={items || []}
            style={style}
          />
        )
      },
      testimonials: ({value}) => {
        const {title, subtitle, items, style, showRatings, _key} = value || {}
        return (
          <TestimonialsSection
            key={_key}
            title={title}
            subtitle={subtitle}
            items={items || []}
            style={style}
            showRatings={showRatings}
          />
        )
      },
      ctaRef: ({value}) => {
        const cta = value?.cta
        if (!cta?.buttonLabel) return null
        const href = stegaClean(cta.link) || '/contact'
        return (
          <section className="mt-16 border-t border-black/15 pt-10">
            {cta.subhead ? <p className="text-xl font-medium">{cta.subhead}</p> : null}
            <Link
              href={href}
              className="mt-6 inline-block border border-black bg-black px-5 py-2.5 font-mono text-[13px] uppercase tracking-[0.15em] text-white"
            >
              {cta.buttonLabel}
            </Link>
          </section>
        )
      },
      logoCarousel: ({value}) => {
        const {title, logos, style, grayscale, _key} = value || {}
        return (
          <LogoCarousel
            key={_key}
            title={title}
            logos={logos || []}
            style={style}
            grayscale={grayscale}
          />
        )
      },
      contactForm: ({value}) => {
        const {title, description, fields, submitLabel, successMessage, style, _key} = value || {}
        return (
          <ContactForm
            key={_key}
            title={title}
            description={description}
            fields={fields || []}
            submitLabel={submitLabel}
            successMessage={successMessage}
            style={style}
          />
        )
      },
    },
  }

  return <PortableText components={components} value={value} />
}
