import {
  enabledField,
  prepareSectionPreview,
  sectionInternalNameField,
  sectionPreview,
} from '@/sanity/schemas/shared/sectionInternalName'
import {
  CheckmarkCircleIcon,
  HelpCircleIcon,
  ListIcon,
  PackageIcon,
  RocketIcon,
  StarIcon,
} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Services page sections (MFI-style page builder).
 * Live in the `sections` array on `servicesPage`; drag to reorder, toggle to hide.
 * Copy source: salt-studio-knowledge-base/studio/website/copy/services.md.
 */

export const servicesHeroSection = defineType({
  name: 'servicesHeroSection',
  title: 'Hero',
  type: 'object',
  icon: RocketIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Hero'),
    defineField({
      name: 'headline',
      title: 'Headline (H1)',
      type: 'string',
      description: 'The page headline. Plain and direct — this page pre-sells the call.',
      validation: (rule) => rule.required().error('The services page needs a headline'),
    }),
    defineField({
      name: 'subheadline',
      title: 'Sub-headline',
      type: 'text',
      rows: 3,
      description: 'The supporting lines under the headline.',
    }),
  ],
  preview: sectionPreview('headline', 'Hero'),
})

export const servicesListSection = defineType({
  name: 'servicesListSection',
  title: 'Services',
  type: 'object',
  icon: PackageIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Services'),
    defineField({
      name: 'serviceAi',
      title: 'AI builds (flagship)',
      type: 'serviceBlock',
      description: 'The flagship AI service — shown first.',
    }),
    defineField({
      name: 'serviceSite',
      title: 'The Salt site',
      type: 'serviceBlock',
      description: 'The complete-website service — shown second.',
    }),
    defineField({
      name: 'serviceCare',
      title: 'Site care',
      type: 'serviceBlock',
      description:
        'The care plan for sites we’ve built — shown third. Intentionally has no CTA button.',
    }),
  ],
  preview: {
    select: {internalName: 'internalName', headline: 'serviceAi.headline', enabled: 'enabled'},
    prepare({internalName, headline, enabled}) {
      return prepareSectionPreview({
        internalName,
        contentTitle: headline ? `Services · ${headline} …` : undefined,
        typeLabel: 'Services',
        enabled,
      })
    },
  },
})

export const servicesFitSection = defineType({
  name: 'servicesFitSection',
  title: 'Fit Filter',
  type: 'object',
  icon: CheckmarkCircleIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Fit Filter'),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      initialValue: 'Are we a fit?',
      description:
        'This section does the repelling so the call doesn’t have to — kind, plain, no apology.',
    }),
    defineField({
      name: 'goodFitLabel',
      title: '“Good fit” heading',
      type: 'string',
      initialValue: 'We’re a good fit if:',
      description: 'Heading above the good-fit bullets.',
    }),
    defineField({
      name: 'goodFitPoints',
      title: '“Good fit” bullets',
      type: 'array',
      description: 'Who this works for. One plain sentence per bullet.',
      of: [defineArrayMember({type: 'text', rows: 2})],
    }),
    defineField({
      name: 'notFitLabel',
      title: '“Not a fit” heading',
      type: 'string',
      initialValue: 'We’re probably not, if:',
      description: 'Heading above the not-a-fit bullets.',
    }),
    defineField({
      name: 'notFitPoints',
      title: '“Not a fit” bullets',
      type: 'array',
      description: 'Who this doesn’t work for. Honest and kind — it saves everyone a call.',
      of: [defineArrayMember({type: 'text', rows: 2})],
    }),
  ],
  preview: sectionPreview('headline', 'Fit Filter'),
})

export const servicesProcessSection = defineType({
  name: 'servicesProcessSection',
  title: 'Process',
  type: 'object',
  icon: ListIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Process'),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      initialValue: 'How it starts',
      description: 'Heading of the process section.',
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      description: 'The steps from first call to build. Bold opener + text per step.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'processStep',
          title: 'Step',
          fields: [
            defineField({
              name: 'lead',
              title: 'Bold opener',
              type: 'string',
              description:
                'Short bold phrase that opens the step, e.g. “Discovery call — 30 minutes.”',
            }),
            defineField({
              name: 'text',
              title: 'Text',
              type: 'text',
              rows: 3,
              description: 'The rest of the step.',
              validation: (rule) => rule.required().error('Every step needs text'),
            }),
          ],
          preview: {
            select: {title: 'lead', subtitle: 'text'},
            prepare({title, subtitle}) {
              return {title: title || subtitle || 'Step', subtitle: title ? subtitle : undefined}
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'recommendationDays',
      title: 'Recommendation turnaround (days)',
      type: 'string',
      description:
        'How many days until the written recommendation, e.g. “3”. Completes the “within X days” promise in the process step — the phrase stays hidden until this is filled. Only fill with a number you can keep.',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA button label',
      type: 'string',
      initialValue: 'Request a conversation',
      description: 'Button under the process steps. It links to the contact page.',
      validation: (rule) => rule.max(40).warning('Keep this short — it sits in a button'),
    }),
  ],
  preview: sectionPreview('headline', 'Process'),
})

export const servicesFaqSection = defineType({
  name: 'servicesFaqSection',
  title: 'FAQ',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    enabledField,
    sectionInternalNameField('FAQ'),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'faq',
      description: 'Questions and answers. These also power FAQ structured data in search results.',
    }),
  ],
  preview: {
    select: {internalName: 'internalName', title: 'faq.title', enabled: 'enabled'},
    prepare({internalName, title, enabled}) {
      return prepareSectionPreview({
        internalName,
        contentTitle: title,
        typeLabel: 'FAQ',
        enabled,
      })
    },
  },
})

export const servicesFinalCtaSection = defineType({
  name: 'servicesFinalCtaSection',
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
      description: 'Headline of the closing call-to-action, e.g. “Bring the problem.”',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA button label',
      type: 'string',
      initialValue: 'Request a conversation',
      description: 'Text on the closing button. It links to the contact page.',
      validation: (rule) => rule.max(40).warning('Keep this short — it sits in a button'),
    }),
    defineField({
      name: 'microcopy',
      title: 'Microcopy',
      type: 'string',
      description: 'Small reassurance line under the button.',
    }),
  ],
  preview: sectionPreview('headline', 'Final CTA'),
})
