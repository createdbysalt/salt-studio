'use client'

import {FAQStructuredData} from '@/lib/seo'
import {useState} from 'react'

type FAQItem = {
  _key: string
  question: string
  answer: string
}

type FAQSectionProps = {
  title?: string
  description?: string
  items: FAQItem[]
  style?: 'accordion' | 'list' | 'columns'
}

/**
 * FAQ Section Component
 *
 * Displays frequently asked questions with multiple layout options.
 * Automatically includes FAQPage structured data for SEO.
 */
export function FAQSection({
  title = 'Frequently Asked Questions',
  description,
  items,
  style = 'accordion',
}: FAQSectionProps) {
  // Prepare data for structured data
  const faqData = items.map((item) => ({
    question: item.question,
    answer: item.answer,
  }))

  return (
    <section className="py-12 md:py-16">
      {/* Structured data for SEO */}
      <FAQStructuredData faqs={faqData} />

      {/* Header */}
      <div className="mb-8 text-center">
        {title && (
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{color: 'var(--color-foreground)'}}
          >
            {title}
          </h2>
        )}
        {description && (
          <p className="mx-auto mt-4 max-w-2xl" style={{color: 'var(--color-muted-foreground)'}}>
            {description}
          </p>
        )}
      </div>

      {/* FAQ Items */}
      {style === 'accordion' && <AccordionFAQ items={items} />}
      {style === 'list' && <ListFAQ items={items} />}
      {style === 'columns' && <ColumnsFAQ items={items} />}
    </section>
  )
}

/**
 * Accordion style - expandable questions
 */
function AccordionFAQ({items}: {items: FAQItem[]}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="mx-auto max-w-3xl divide-y" style={{borderColor: 'var(--color-border)'}}>
      {items.map((item, index) => (
        <div key={item._key} className="py-4">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-lg font-medium" style={{color: 'var(--color-foreground)'}}>
              {item.question}
            </span>
            <span
              className="ml-4 flex-shrink-0 text-2xl"
              style={{color: 'var(--color-muted-foreground)'}}
            >
              {openIndex === index ? '−' : '+'}
            </span>
          </button>
          {openIndex === index && (
            <p className="mt-4 pr-12" style={{color: 'var(--color-muted-foreground)'}}>
              {item.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * List style - all answers visible
 */
function ListFAQ({items}: {items: FAQItem[]}) {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {items.map((item) => (
        <div key={item._key}>
          <h3 className="text-lg font-medium" style={{color: 'var(--color-foreground)'}}>
            {item.question}
          </h3>
          <p className="mt-2" style={{color: 'var(--color-muted-foreground)'}}>
            {item.answer}
          </p>
        </div>
      ))}
    </div>
  )
}

/**
 * Two-column layout
 */
function ColumnsFAQ({items}: {items: FAQItem[]}) {
  return (
    <div className="mx-auto max-w-5xl grid gap-8 md:grid-cols-2">
      {items.map((item) => (
        <div key={item._key}>
          <h3 className="text-lg font-medium" style={{color: 'var(--color-foreground)'}}>
            {item.question}
          </h3>
          <p className="mt-2" style={{color: 'var(--color-muted-foreground)'}}>
            {item.answer}
          </p>
        </div>
      ))}
    </div>
  )
}
