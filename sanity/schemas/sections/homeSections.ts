import {
  enabledField,
  sectionInternalNameField,
  sectionPreview,
} from '@/sanity/schemas/shared/sectionInternalName'
import {
  BulbOutlineIcon,
  CaseIcon,
  DocumentsIcon,
  RocketIcon,
  SparklesIcon,
  StarIcon,
  WrenchIcon,
} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Homepage sections (MFI-style page builder).
 * Live in the `sections` array on `home`; drag to reorder, toggle to hide.
 * Copy source: salt-studio-knowledge-base/studio/website/copy/homepage.md.
 */

export const homeHeroSection = defineType({
  name: 'homeHeroSection',
  title: 'Hero',
  type: 'object',
  icon: RocketIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Hero'),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description:
        'The main homepage headline. This is what every visitor (and reduced-motion visitors, only this) reads first — keep it clear, not poetic.',
      validation: (rule) => rule.required().error('The homepage needs its main headline'),
    }),
    defineField({
      name: 'swapLine',
      title: 'Swap line',
      type: 'string',
      description:
        'The alternate face of the word-swap animation — the poetic line the headline briefly swaps to. Never the initial state; visitors with reduced motion never see it.',
    }),
    defineField({
      name: 'subheadline',
      title: 'Sub-headline',
      type: 'text',
      rows: 3,
      description: 'The supporting line under the headline. One or two sentences.',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA button label',
      type: 'string',
      initialValue: 'Book a discovery call',
      description: 'Text on the hero button. It links to the contact page.',
      validation: (rule) => rule.max(40).warning('Keep this short — it sits in a button'),
    }),
    defineField({
      name: 'ctaMicrocopy',
      title: 'CTA microcopy',
      type: 'string',
      description: 'Small reassurance line under the button, e.g. what the call is and isn’t.',
    }),
    defineField({
      name: 'bookingQuarter',
      title: 'Currently booking (quarter)',
      type: 'string',
      description:
        'Powers the “Currently booking …” line in the hero and Final CTA, e.g. “Q4 2026”. Leave empty to hide the line entirely. Only fill this with a quarter that is actually true — never guess.',
    }),
  ],
  preview: sectionPreview('headline', 'Hero'),
})

export const homeProofSection = defineType({
  name: 'homeProofSection',
  title: 'Proof Strip',
  type: 'object',
  icon: CaseIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Proof Strip'),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      initialValue: 'Recent work with',
      description: 'Small label above the client names. Leave empty to show names only.',
    }),
    defineField({
      name: 'clients',
      title: 'Clients',
      type: 'array',
      description:
        'The client names in the proof strip. Drag to set order. Only the names render — no logos. Manage clients under Dynamic Content → Clients.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'client'}]})],
      validation: (rule) => rule.min(1).warning('Add clients so the proof strip isn’t empty'),
    }),
  ],
  preview: sectionPreview('label', 'Proof Strip'),
})

export const homeServicesSection = defineType({
  name: 'homeServicesSection',
  title: 'Services Triad',
  type: 'object',
  icon: WrenchIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Services Triad'),
    defineField({
      name: 'label',
      title: 'Section label',
      type: 'string',
      initialValue: 'What we do',
      description: 'Small label above the three service cards.',
    }),
    defineField({
      name: 'cards',
      title: 'Service cards',
      type: 'array',
      description:
        'Exactly three cards — one per service. Each card links to the Services page (price after value — never straight to contact).',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'homeServiceCard',
          title: 'Service card',
          fields: [
            defineField({
              name: 'title',
              title: 'Service name',
              type: 'string',
              description: 'e.g. “AI builds”, “The Salt site”, “Site care”.',
              validation: (rule) => rule.required().error('Every card needs a service name'),
            }),
            defineField({
              name: 'body',
              title: 'Description',
              type: 'text',
              rows: 3,
              description: 'One or two plain sentences on what this service is.',
              validation: (rule) => rule.required().error('Every card needs a description'),
            }),
            defineField({
              name: 'priceLine',
              title: 'Price line',
              type: 'string',
              description: 'The visible starting price, e.g. “Pilots from $15,000”. Keep it true.',
            }),
            defineField({
              name: 'linkLabel',
              title: 'Link label',
              type: 'string',
              initialValue: 'See how it works',
              description: 'The link text at the end of the card (goes to the Services page).',
            }),
          ],
          preview: {
            select: {title: 'title', subtitle: 'priceLine'},
          },
        }),
      ],
      validation: (rule) =>
        rule.length(3).error('The triad is exactly three cards — one per service'),
    }),
  ],
  preview: sectionPreview('label', 'Services Triad'),
})

export const homeWorkSection = defineType({
  name: 'homeWorkSection',
  title: 'Selected Work',
  type: 'object',
  icon: DocumentsIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Selected Work'),
    defineField({
      name: 'label',
      title: 'Section label',
      type: 'string',
      initialValue: 'Selected work',
      description: 'Small label above the work teaser cards.',
    }),
    defineField({
      name: 'projects',
      title: 'Teaser projects',
      type: 'array',
      description:
        'Hand-picked projects for the homepage teaser (2–3). Drafts won’t appear on the live site until published.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'project'}]})],
      validation: (rule) => rule.max(3).warning('The teaser shows 2–3 pieces'),
    }),
    defineField({
      name: 'linkLabel',
      title: 'Link label',
      type: 'string',
      initialValue: 'All work',
      description: 'The link to the full Work page, shown after the teaser cards.',
    }),
  ],
  preview: sectionPreview('label', 'Selected Work'),
})

export const homeProductSection = defineType({
  name: 'homeProductSection',
  title: 'Salt Product',
  type: 'object',
  icon: SparklesIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Salt Product'),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      initialValue: 'What we’re building',
      description: 'Headline of the red Salt product band.',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 4,
      description: 'The paragraph about the Salt product.',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA label',
      type: 'string',
      initialValue: 'Join the waitlist',
      description:
        'The waitlist button — the only non-call CTA on the homepage, styled secondary on purpose.',
    }),
  ],
  preview: sectionPreview('headline', 'Salt Product'),
})

export const homePhilosophySection = defineType({
  name: 'homePhilosophySection',
  title: 'Philosophy',
  type: 'object',
  icon: BulbOutlineIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Philosophy'),
    defineField({
      name: 'line1',
      title: 'Line one',
      type: 'string',
      description: 'First line of the two-line interlude. No CTA here — the type does the work.',
    }),
    defineField({
      name: 'line2',
      title: 'Line two',
      type: 'string',
      description: 'Second line of the interlude.',
    }),
  ],
  preview: sectionPreview('line1', 'Philosophy'),
})

export const homeFinalCtaSection = defineType({
  name: 'homeFinalCtaSection',
  title: 'Final CTA',
  type: 'object',
  icon: StarIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Final CTA'),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'Headline of the closing call-to-action section.',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 3,
      description: 'One or two sentences leading into the button.',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA button label',
      type: 'string',
      initialValue: 'Book a discovery call',
      description: 'Text on the closing button. It links to the contact page.',
      validation: (rule) => rule.max(40).warning('Keep this short — it sits in a button'),
    }),
    defineField({
      name: 'emailLine',
      title: 'Email line',
      type: 'string',
      description:
        'Microcopy under the button, e.g. “hello@createdbysalt.com if calls aren’t your thing.” The “Currently booking …” line is added automatically from the Hero section’s quarter field.',
    }),
  ],
  preview: sectionPreview('headline', 'Final CTA'),
})
