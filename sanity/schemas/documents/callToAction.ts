import {RocketIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * CTA — a reusable call-to-action stored once and linked from many pages.
 *
 * One place to manage the site's CTAs (e.g. "Start a conversation →",
 * "Rent the studio →"). Core pages reference a CTA instead of retyping the
 * label and link, so updating the copy or destination updates everywhere.
 */
export default defineType({
  name: 'callToAction',
  title: 'CTA',
  type: 'document',
  icon: RocketIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Internal name',
      type: 'string',
      description:
        'A label just for this list — not shown on the site. Helps you find this CTA when linking it from a page (e.g. "Primary — Start a conversation").',
      validation: (rule) => rule.required().error('Give this CTA a name so you can find it later'),
    }),
    defineField({
      name: 'subhead',
      title: 'Subhead',
      type: 'string',
      description: 'Optional line shown above the button (e.g. "Let\'s talk shop.").',
    }),
    defineField({
      name: 'buttonLabel',
      title: 'Button label',
      type: 'string',
      description: 'The text on the button (e.g. "Start a conversation →").',
      initialValue: 'Start a conversation →',
      validation: (rule) => rule.required().error('The button needs a label'),
    }),
    defineField({
      name: 'link',
      title: 'Button link',
      type: 'string',
      description:
        'Where the button goes. Use an internal path like "/contact" or "/rentals/studio", or a full URL like "https://…".',
      initialValue: '/contact',
      validation: (rule) => rule.required().error('The button needs a destination'),
    }),
    defineField({
      name: 'contactSubject',
      title: 'Contact form subject (optional)',
      type: 'string',
      description: 'Prefills the contact form subject when this CTA links to /contact.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      buttonLabel: 'buttonLabel',
      link: 'link',
    },
    prepare({title, buttonLabel, link}) {
      return {
        title: title || buttonLabel || 'Untitled CTA',
        subtitle: [buttonLabel, link].filter(Boolean).join('  →  '),
        media: RocketIcon,
      }
    },
  },
})
