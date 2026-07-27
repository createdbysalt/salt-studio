import {
  enabledField,
  prepareSectionPreview,
  sectionInternalNameField,
  sectionPreview,
} from '@/sanity/schemas/shared/sectionInternalName'
import {ComposeIcon, EnvelopeIcon, RocketIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

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
