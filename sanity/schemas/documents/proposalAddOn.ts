import {AddIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * An optional add-on. Selecting it changes the total and the Statement of Work.
 * The dollar amount lives in the payments table, keyed by priceId.
 */
export default defineType({
  name: 'proposalAddOn',
  title: 'Proposal add-on',
  type: 'document',
  icon: AddIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'The add-on name, for example “Copywriting” or “Care plan”.',
      validation: (rule) => rule.required().error('Every add-on needs a name'),
    }),
    defineField({
      name: 'line',
      title: 'One line',
      type: 'string',
      description: 'A single sentence shown next to the toggle.',
      validation: (rule) => rule.required().max(140).error('Keep the line under 140 characters'),
    }),
    defineField({
      name: 'priceId',
      title: 'Price id',
      type: 'string',
      description:
        'The id of this add-on in the payments table. The page looks up the amount on the server. Do not type a dollar amount here.',
      validation: (rule) =>
        rule
          .required()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .error('Use a lowercase id with hyphens, matching the payments table'),
    }),
    defineField({
      name: 'deliverables',
      title: 'Deliverables added to the scope',
      type: 'array',
      description: 'What gets added to the Statement of Work when this add-on is selected.',
      of: [defineArrayMember({type: 'proposalDeliverable'})],
    }),
    defineField({
      name: 'outOfScope',
      title: 'Still out of scope',
      type: 'array',
      description: 'Exclusions that stay true even when this add-on is selected. Optional.',
      of: [defineArrayMember({type: 'proposalScopeItem'})],
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'line'},
  },
})
