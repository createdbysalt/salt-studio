import {
  enabledField,
  prepareSectionPreview,
  sectionInternalNameField,
  sectionPreview,
} from '@/sanity/schemas/shared/sectionInternalName'
import {
  CalendarIcon,
  CheckmarkCircleIcon,
  ComposeIcon,
  EnvelopeIcon,
  PinIcon,
  RocketIcon,
} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Contact page sections (MFI-style page builder).
 * Live in the `sections` array on `contactPage`; drag to reorder, toggle to hide.
 */

export const contactHeroSection = defineType({
  name: 'contactHeroSection',
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
      initialValue: 'Mission briefing.',
      validation: (rule) => rule.required().error('The hero needs a headline'),
    }),
    defineField({name: 'lead', title: 'Lead paragraph', type: 'text', rows: 3}),
  ],
  preview: sectionPreview('headline', 'Hero'),
})

export const contactDirectSection = defineType({
  name: 'contactDirectSection',
  title: 'Direct Contact',
  type: 'object',
  icon: EnvelopeIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Direct Contact'),
    defineField({
      name: 'directContactLine',
      title: 'Direct contact line',
      type: 'text',
      rows: 2,
      description: 'Escape hatch above the form — e.g. email Chris directly.',
    }),
  ],
  preview: sectionPreview('directContactLine', 'Direct Contact'),
})

export const contactBookingSection = defineType({
  name: 'contactBookingSection',
  title: 'Calendar Booking',
  type: 'object',
  icon: CalendarIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Calendar Booking'),
    defineField({
      name: 'calLink',
      title: 'Cal.com event link',
      type: 'string',
      description:
        'Your Cal.com event link, e.g. “salt-studio/discovery”. The calendar embed stays hidden on the site until this is filled — never a broken embed.',
    }),
    defineField({
      name: 'fallbackNote',
      title: 'Fallback note',
      type: 'string',
      description:
        'Optional small line shown while the calendar is not set up yet. Can stay empty.',
    }),
  ],
  preview: sectionPreview('calLink', 'Calendar Booking'),
})

export const contactCallDetailsSection = defineType({
  name: 'contactCallDetailsSection',
  title: 'What Happens on the Call',
  type: 'object',
  icon: CheckmarkCircleIcon,
  fields: [
    enabledField,
    sectionInternalNameField('What Happens on the Call'),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      initialValue: 'How it works',
      description: 'Small heading above the bullets.',
    }),
    defineField({
      name: 'bullets',
      title: 'Bullets',
      type: 'array',
      description:
        'What the caller can expect — kills call anxiety. Bold opener + text per bullet.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'callDetailBullet',
          title: 'Bullet',
          fields: [
            defineField({
              name: 'lead',
              title: 'Bold opener',
              type: 'string',
              description:
                'Short bold phrase, e.g. “30 minutes, with the person who’d do the work.”',
            }),
            defineField({
              name: 'text',
              title: 'Text',
              type: 'text',
              rows: 2,
              description: 'The rest of the bullet. Can stay empty if the opener says it all.',
            }),
          ],
          preview: {
            select: {title: 'lead', subtitle: 'text'},
            prepare({title, subtitle}) {
              return {title: title || subtitle || 'Bullet', subtitle: title ? subtitle : undefined}
            },
          },
        }),
      ],
      validation: (rule) => rule.max(4).warning('Three or four bullets is plenty'),
    }),
    defineField({
      name: 'recommendationDays',
      title: 'Recommendation turnaround (days)',
      type: 'string',
      description:
        'How many days until the written recommendation, e.g. “3”. Completes the “within X days” bullet — the phrase stays hidden until this is filled. Only fill with a number you can keep.',
    }),
  ],
  preview: sectionPreview('label', 'What Happens on the Call'),
})

export const contactFooterSection = defineType({
  name: 'contactFooterSection',
  title: 'Practical Footer',
  type: 'object',
  icon: PinIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Practical Footer'),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      initialValue: 'hello@createdbysalt.com',
      description: 'The contact email shown at the bottom of the page.',
    }),
    defineField({
      name: 'cityTimezone',
      title: 'City / timezone',
      type: 'string',
      description:
        'Optional location line, e.g. “Toronto · Eastern Time”. Leave empty until you decide what to make public — the line hides until filled.',
    }),
    defineField({
      name: 'responseLine',
      title: 'Response promise',
      type: 'string',
      initialValue: 'We respond within 48 hours, usually faster.',
      description: 'The response-time promise. Only promise what you can keep.',
    }),
  ],
  preview: sectionPreview('email', 'Practical Footer'),
})

export const contactFormSection = defineType({
  name: 'contactFormSection',
  title: 'Contact Form',
  type: 'object',
  icon: ComposeIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Contact Form'),
    defineField({
      name: 'formConfig',
      title: 'Form configuration',
      type: 'contactForm',
      description: 'Field labels, dropdown options, and success/error messages.',
    }),
  ],
  preview: {
    select: {internalName: 'internalName', title: 'formConfig.title', enabled: 'enabled'},
    prepare({internalName, title, enabled}) {
      return prepareSectionPreview({
        internalName,
        contentTitle: title,
        typeLabel: 'Contact Form',
        enabled,
      })
    },
  },
})
