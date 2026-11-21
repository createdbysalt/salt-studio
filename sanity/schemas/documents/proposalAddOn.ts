import {AddIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * An optional add-on. The card shows `amount`.
 * Charging reads the same `amount` on the server. There is no second price table.
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
        'The price on the proposal card, in US dollars. Whole dollars, no cents. This is the figure the client reads. For a monthly add-on, this is the monthly price.',
      validation: (rule) =>
        rule.required().integer().positive().error('Enter the price in whole US dollars'),
    }),
    defineField({
      name: 'billingType',
      title: 'Billing',
      type: 'string',
      group: 'card',
      initialValue: 'one-time',
      options: {
        layout: 'radio',
        list: [
          {title: 'One-time', value: 'one-time'},
          {title: 'Monthly', value: 'monthly'},
        ],
      },
      description:
        'One-time adds this price to the total and the deposit. Monthly is billed monthly and is not part of the total or today’s payment. An empty value is treated as one-time.',
    }),
    defineField({
      name: 'chooseOneGroup',
      title: 'Choose-one group',
      type: 'string',
      group: 'card',
      description:
        'Optional. Add-ons on the same proposal that share this key are one choice, and the client can pick at most one, or none. Use a short lowercase key, for example linkedin. Leave it empty for an add-on that can be checked on its own. A key used by only one add-on on a proposal stays a normal checkbox.',
      validation: (rule) =>
        rule.custom((value) => {
          if (value == null || value === '') return true
          if (typeof value !== 'string') return 'Use a short lowercase key, like linkedin'
          if (value.length > 40) return 'Keep the key short, like linkedin'
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
            return 'Use lowercase letters, numbers, and hyphens, like linkedin'
          }
          return true
        }),
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
    select: {title: 'name', line: 'line', amount: 'amount', billingType: 'billingType'},
    prepare({title, line, amount, billingType}) {
      const price = typeof amount === 'number' ? `$${amount.toLocaleString('en-US')}` : ''
      const billed = billingType === 'monthly' && price ? `${price} a month` : price
      return {
        title: title || 'Add-on',
        subtitle: [billed, line].filter(Boolean).join(' · '),
      }
    },
  },
})
