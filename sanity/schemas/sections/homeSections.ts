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
      name: 'splitPrimaryLeft',
      title: 'Split headline — primary, left side',
      type: 'text',
      rows: 2,
      description:
        'Left half of the edge-anchored hero split (the face visitors see first). Line breaks are kept exactly as typed. Leave empty to use the built-in copy.',
    }),
    defineField({
      name: 'splitPrimaryRight',
      title: 'Split headline — primary, right side',
      type: 'text',
      rows: 2,
      description:
        'Right half of the edge-anchored hero split (the face visitors see first). Leave empty to use the built-in copy.',
    }),
    defineField({
      name: 'splitSecondaryLeft',
      title: 'Split headline — swap, left side',
      type: 'text',
      rows: 2,
      description:
        'Left half of the face the hero briefly swaps to. Leave empty to use the built-in copy.',
    }),
    defineField({
      name: 'splitSecondaryRight',
      title: 'Split headline — swap, right side',
      type: 'text',
      rows: 2,
      description:
        'Right half of the face the hero briefly swaps to. Leave empty to use the built-in copy.',
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
      initialValue: 'How we can help',
      description: 'Small label above the three service cards.',
    }),
    defineField({
      name: 'services',
      title: 'Services',
      type: 'array',
      description:
        'Pick the three services for this band — order here is the order on the page. Edit each service under Dynamic Content → Services.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'service'}]})],
      validation: (rule) =>
        rule.length(3).error('The triad is exactly three services — one per offering'),
    }),
    defineField({
      name: 'cards',
      title: 'Service cards (legacy)',
      type: 'array',
      deprecated: {
        reason:
          'Use the Services references above. Legacy inline cards are read-only until content is moved to Dynamic Content → Services.',
      },
      readOnly: true,
      hidden: ({value}) => value === undefined,
      description: 'Legacy inline cards. Prefer Services references.',
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
            }),
            defineField({
              name: 'body',
              title: 'Description',
              type: 'text',
              rows: 3,
              description: 'One or two plain sentences on what this service is.',
            }),
            defineField({
              name: 'priceLine',
              title: 'Price line',
              type: 'string',
              description: 'The visible starting price, e.g. “Pilots from $15,000”.',
            }),
            defineField({
              name: 'linkLabel',
              title: 'Link label',
              type: 'string',
              description: 'Opens the service detail side panel.',
            }),
            defineField({
              name: 'detailEyebrow',
              title: 'Panel eyebrow',
              type: 'string',
              description: 'Small label at the top of the side panel.',
            }),
            defineField({
              name: 'detailBody',
              title: 'Panel body',
              type: 'text',
              rows: 8,
              description: 'Longer explanation shown in the side panel.',
            }),
            defineField({
              name: 'detailImage',
              title: 'Panel image',
              type: 'image',
              options: {hotspot: true},
              description: 'Optional image at the bottom of the side panel.',
            }),
            defineField({
              name: 'hoverImage',
              title: 'Background image',
              type: 'image',
              options: {hotspot: true},
              description: 'Full-bleed still behind this service when it’s active.',
            }),
            defineField({
              name: 'backgroundVideoUrl',
              title: 'Background video URL',
              type: 'url',
              description: 'Optional MP4 or Vimeo URL for the active background.',
            }),
          ],
          preview: {
            select: {title: 'title', subtitle: 'priceLine', media: 'hoverImage'},
          },
        }),
      ],
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
      title: 'Display line',
      type: 'string',
      description:
        'Brand statement. Split on periods into stacked display lines — e.g. “Subtle. Essential. Transformative.”',
    }),
    defineField({
      name: 'line2',
      title: 'Support line',
      type: 'string',
      description:
        'Quieter line under the display type. The closing CTA from the Final CTA section sits below this on the homepage.',
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
      title: 'Closing line',
      type: 'string',
      description:
        'Appended after the Philosophy support line on the homepage — e.g. “One build at a time.”',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 3,
      description:
        'Optional longer lead-in. Not shown on the current homepage composition (Philosophy + button + email line).',
      hidden: true,
    }),
    defineField({
      name: 'cta',
      title: 'CTA',
      type: 'reference',
      to: [{type: 'callToAction'}],
      description:
        'Primary button under Philosophy — solid mono label with arrow. Pick from Dynamic Content → CTAs (usually “Primary — Book a discovery call”).',
      validation: (rule) =>
        rule.required().error('Link a CTA so the Philosophy section has a button'),
    }),
    defineField({
      name: 'emailLine',
      title: 'Email line',
      type: 'string',
      description:
        'Quiet mono line under the button, e.g. “hello@createdbysalt.com if calls aren’t your thing.”',
    }),
  ],
  preview: sectionPreview('headline', 'Final CTA'),
})
