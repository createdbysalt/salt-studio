import {TagIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * A reusable proposal package. The card shows `amount`.
 * Charging reads the same `amount` on the server. There is no second price table.
 */
export default defineType({
  name: 'proposalPackage',
  title: 'Proposal package',
  type: 'document',
  icon: TagIcon,
  groups: [
    {name: 'card', title: 'Card', default: true},
    {name: 'scope', title: 'Scope'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      group: 'card',
      description: 'The package name on the card, for example “Essential” or “Complete”.',
      validation: (rule) => rule.required().error('Every package needs a name'),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      group: 'card',
      description: 'One or two sentences on who this package is for.',
      validation: (rule) => rule.required().error('Add a short summary'),
    }),
    defineField({
      name: 'amount',
      title: 'Price',
      type: 'number',
      group: 'card',
      description:
        'The price on the proposal card, in US dollars. Whole dollars, no cents. This is the figure the client reads.',
      validation: (rule) =>
        rule.required().integer().positive().error('Enter the price in whole US dollars'),
    }),
    defineField({
      name: 'includedItems',
      title: 'Included on the card',
      type: 'array',
      group: 'card',
      description:
        'The short checklist on the package card. The full scope is the Scope of work field.',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.min(1).error('Add at least one included item'),
    }),
    defineField({
      name: 'scope',
      title: 'Scope of work',
      type: 'array',
      group: 'scope',
      description:
        'This package’s own scope of work. Paragraphs and bullets. The card button opens only this text. The statement further down includes it when this package is selected.',
      validation: (rule) => rule.required().min(1).error('Paste this package’s scope of work'),
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Paragraph', value: 'normal'},
            {title: 'Heading', value: 'h3'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
            annotations: [],
          },
        }),
      ],
    }),
    defineField({
      name: 'deliverables',
      title: 'Deliverables',
      type: 'array',
      group: 'scope',
      description:
        'Optional notes for you. The page does not print these. The client reads the Scope of work field.',
      of: [defineArrayMember({type: 'proposalDeliverable'})],
    }),
    defineField({
      name: 'outOfScope',
      title: 'Out of scope',
      type: 'array',
      group: 'scope',
      description:
        'What this package explicitly does not include. Optional notes for you. The page does not print this.',
      of: [defineArrayMember({type: 'proposalScopeItem'})],
    }),
    defineField({
      name: 'phases',
      title: 'Phases',
      type: 'array',
      group: 'scope',
      description:
        'Optional phase notes for you. The signed statement uses the Scope of work field, not this list.',
      of: [defineArrayMember({type: 'proposalPhaseItem'})],
    }),
  ],
  preview: {
    select: {title: 'name', amount: 'amount'},
    prepare({title, amount}) {
      return {
        title: title || 'Untitled package',
        subtitle: typeof amount === 'number' ? `$${amount.toLocaleString('en-US')}` : undefined,
      }
    },
  },
})
