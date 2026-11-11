import {TagIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * A reusable proposal package. The dollar amount lives in the payments
 * table, keyed by priceId. Never type a price here.
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
      name: 'priceId',
      title: 'Price id',
      type: 'string',
      group: 'card',
      description:
        'The id of this package in the payments table, for example “website-essential”. The page looks up the amount on the server. Do not type a dollar amount here.',
      validation: (rule) =>
        rule
          .required()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .error('Use a lowercase id with hyphens, matching the payments table'),
    }),
    defineField({
      name: 'includedItems',
      title: 'Included on the card',
      type: 'array',
      group: 'card',
      description:
        'The short checklist on the package card. The signed list is the deliverables below.',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.min(1).error('Add at least one included item'),
    }),
    defineField({
      name: 'deliverables',
      title: 'Deliverables',
      type: 'array',
      group: 'scope',
      description:
        'Numbered scope items. Each one needs acceptance criteria so the Statement of Work can assemble itself.',
      of: [defineArrayMember({type: 'proposalDeliverable'})],
      validation: (rule) => rule.min(1).error('A package needs at least one deliverable'),
    }),
    defineField({
      name: 'outOfScope',
      title: 'Out of scope',
      type: 'array',
      group: 'scope',
      description: 'What this package explicitly does not include.',
      of: [defineArrayMember({type: 'proposalScopeItem'})],
    }),
    defineField({
      name: 'phases',
      title: 'Phases',
      type: 'array',
      group: 'scope',
      description: 'The phases that go into the signed scope for this package.',
      of: [defineArrayMember({type: 'proposalPhaseItem'})],
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'priceId'},
    prepare({title, subtitle}) {
      return {title: title || 'Untitled package', subtitle}
    },
  },
})
