import {EnvelopeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Contact Form Schema
 *
 * A configurable contact form section.
 * The actual form handling is done via server action.
 */
export default defineType({
  name: 'contactForm',
  title: 'Contact Form',
  type: 'object',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Heading for the contact section (e.g., "Get in Touch").',
      initialValue: 'Get in Touch',
    }),
    defineField({
      name: 'description',
      title: 'Introduction',
      type: 'text',
      rows: 2,
      description: 'Optional text above the form explaining what happens when they submit.',
    }),
    defineField({
      name: 'fields',
      title: 'Form Fields',
      type: 'array',
      description: 'Configure which fields appear in the form.',
      of: [
        {
          type: 'object',
          name: 'formField',
          title: 'Form Field',
          fields: [
            defineField({
              name: 'name',
              title: 'Field Name',
              type: 'string',
              description: 'Internal name (e.g., "email", "phone", "company").',
              validation: (rule) => rule.required().error('Field needs a name'),
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'Label shown to users (e.g., "Your Email", "Phone Number").',
              validation: (rule) => rule.required().error('Field needs a label'),
            }),
            defineField({
              name: 'type',
              title: 'Field Type',
              type: 'string',
              options: {
                list: [
                  {title: 'Text (single line)', value: 'text'},
                  {title: 'Email', value: 'email'},
                  {title: 'Phone', value: 'tel'},
                  {title: 'Textarea (multi-line)', value: 'textarea'},
                  {title: 'Select dropdown', value: 'select'},
                ],
                layout: 'radio',
              },
              initialValue: 'text',
            }),
            defineField({
              name: 'placeholder',
              title: 'Placeholder',
              type: 'string',
              description: 'Hint text shown when field is empty.',
            }),
            defineField({
              name: 'required',
              title: 'Required',
              type: 'boolean',
              description: 'Must this field be filled out?',
              initialValue: false,
            }),
            defineField({
              name: 'options',
              title: 'Options',
              type: 'array',
              description: 'For dropdown fields only. Add the available choices.',
              of: [{type: 'string'}],
              hidden: ({parent}) => parent?.type !== 'select',
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'type',
              required: 'required',
            },
            prepare({title, subtitle, required}) {
              return {
                title: title || 'Unnamed field',
                subtitle: `${subtitle}${required ? ' (required)' : ''}`,
              }
            },
          },
        },
      ],
      initialValue: [
        {
          _type: 'formField',
          name: 'name',
          label: 'Your Name',
          type: 'text',
          placeholder: 'John Smith',
          required: true,
        },
        {
          _type: 'formField',
          name: 'email',
          label: 'Email Address',
          type: 'email',
          placeholder: 'john@example.com',
          required: true,
        },
        {
          _type: 'formField',
          name: 'message',
          label: 'Message',
          type: 'textarea',
          placeholder: 'How can we help?',
          required: true,
        },
      ],
    }),
    defineField({
      name: 'submitLabel',
      title: 'Submit Button Text',
      type: 'string',
      description: 'Text on the submit button.',
      initialValue: 'Send Message',
    }),
    defineField({
      name: 'successHeadline',
      title: 'Success Headline',
      type: 'string',
      description: 'Heading shown after successful submission (e.g. "Signal acquired.").',
    }),
    defineField({
      name: 'successMessage',
      title: 'Success Message',
      type: 'text',
      rows: 3,
      description: 'Body copy shown after successful submission.',
      initialValue: "Thanks! We'll be in touch soon.",
    }),
    defineField({
      name: 'errorHeadline',
      title: 'Error Headline',
      type: 'string',
      description: 'Heading shown when submission fails (e.g. "Signal lost.").',
    }),
    defineField({
      name: 'errorMessage',
      title: 'Error Message',
      type: 'text',
      rows: 3,
      description: 'Body copy shown when submission fails.',
    }),
    defineField({
      name: 'footerNote',
      title: 'Footer Note',
      type: 'text',
      rows: 2,
      description: 'Small text below the form (e.g. response-time note).',
    }),
    defineField({
      name: 'style',
      title: 'Layout Style',
      type: 'string',
      options: {
        list: [
          {title: 'Stacked (full width)', value: 'stacked'},
          {title: 'Two columns', value: 'columns'},
          {title: 'Compact (inline)', value: 'compact'},
        ],
        layout: 'radio',
      },
      initialValue: 'stacked',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      fields: 'fields',
    },
    prepare({title, fields}) {
      const count = fields?.length || 0
      return {
        title: title || 'Contact Form',
        subtitle: `${count} field${count !== 1 ? 's' : ''}`,
        media: EnvelopeIcon,
      }
    },
  },
})
