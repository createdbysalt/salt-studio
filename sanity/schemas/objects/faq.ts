import {HelpCircleIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * FAQ Section Schema
 *
 * A reusable FAQ block that can be embedded in any page.
 * Automatically generates FAQPage structured data for SEO.
 */
export default defineType({
  name: 'faq',
  title: 'FAQ Section',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Optional heading for the FAQ section (e.g., "Frequently Asked Questions").',
      initialValue: 'Frequently Asked Questions',
    }),
    defineField({
      name: 'description',
      title: 'Introduction',
      type: 'text',
      rows: 2,
      description: 'Optional intro text above the questions.',
    }),
    defineField({
      name: 'items',
      title: 'Questions & Answers',
      type: 'array',
      description:
        'Add your frequently asked questions. These also appear in Google search results.',
      of: [
        {
          type: 'object',
          name: 'faqItem',
          title: 'FAQ Item',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              description: 'The question your visitors are asking.',
              validation: (rule) => rule.required().error('Every FAQ needs a question'),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 4,
              description: 'A clear, helpful answer. Keep it concise for best results.',
              validation: (rule) => rule.required().error('Every question needs an answer'),
            }),
          ],
          preview: {
            select: {
              title: 'question',
              subtitle: 'answer',
            },
            prepare({title, subtitle}) {
              return {
                title: title || 'Untitled question',
                subtitle: subtitle ? subtitle.slice(0, 80) + '...' : 'No answer yet',
              }
            },
          },
        },
      ],
      validation: (rule) => rule.min(1).error('Add at least one FAQ item'),
    }),
    defineField({
      name: 'style',
      title: 'Display Style',
      type: 'string',
      description: 'How should the FAQs be displayed?',
      options: {
        list: [
          {title: 'Accordion (expandable)', value: 'accordion'},
          {title: 'List (all visible)', value: 'list'},
          {title: 'Two columns', value: 'columns'},
        ],
        layout: 'radio',
      },
      initialValue: 'accordion',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      items: 'items',
    },
    prepare({title, items}) {
      const count = items?.length || 0
      return {
        title: title || 'FAQ Section',
        subtitle: `${count} question${count !== 1 ? 's' : ''}`,
        media: HelpCircleIcon,
      }
    },
  },
})
