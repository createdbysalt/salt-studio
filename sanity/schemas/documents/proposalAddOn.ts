import {AddIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * An optional add-on. The card shows `amount`.
 * `priceId` is the payments-table key. Charging reads that table on the server.
 */
export default defineType({
  name: 'proposalAddOn',
  title: 'Proposal add-on',
  type: 'document',
  icon: AddIcon,
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
      description: 'The add-on name, for example “Copywriting” or “Care plan”.',
      validation: (rule) => rule.required().error('Every add-on needs a name'),
    }),
    defineField({
      name: 'line',
      title: 'One line',
      type: 'string',
      group: 'card',
      description: 'A single sentence on the add-on card.',
      validation: (rule) => rule.required().max(140).error('Keep the line under 140 characters'),
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
      name: 'priceId',
      title: 'Price id',
      type: 'string',
      group: 'card',
      description:
        'The id of this add-on in the payments table. Charging uses this id on the server. It is not shown on the card.',
      validation: (rule) =>
        rule
          .required()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .error('Use a lowercase id with hyphens, matching the payments table'),
    }),
    defineField({
      name: 'scope',
      title: 'Scope of work',
      type: 'array',
      group: 'scope',
      description:
        'This add-on’s own scope of work. Paragraphs and bullets. The card button opens only this text. The statement further down includes it when this add-on is checked.',
      validation: (rule) => rule.required().min(1).error('Paste this add-on’s scope of work'),
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
      title: 'Deliverables added to the scope',
      type: 'array',
      group: 'scope',
      description:
        'Optional notes for you. The page does not print these. The client reads the Scope of work field.',
      of: [defineArrayMember({type: 'proposalDeliverable'})],
    }),
    defineField({
      name: 'outOfScope',
      title: 'Still out of scope',
      type: 'array',
      group: 'scope',
      description:
        'Exclusions that stay true even when this add-on is selected. Optional notes for you.',
      of: [defineArrayMember({type: 'proposalScopeItem'})],
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'line'},
  },
})
