import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * A group of checklist items on a client portal (e.g. Forms, Branding).
 */
export default defineType({
  name: 'portalChecklistCategory',
  title: 'Checklist category',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Category title',
      type: 'string',
      description: 'The heading on the page (e.g. "Forms", "Branding").',
      validation: (rule) => rule.required().error('Each category needs a title'),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description: 'Optional one-line intro under the heading.',
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      description: 'What we need in this category. Drag to reorder.',
      of: [defineArrayMember({type: 'portalChecklistItem'})],
      validation: (rule) => rule.min(1).error('Add at least one item or remove the category'),
    }),
  ],
  preview: {
    select: {title: 'title', items: 'items'},
    prepare({title, items}) {
      const count = Array.isArray(items) ? items.length : 0
      return {
        title: title || 'Untitled category',
        subtitle: count === 1 ? '1 item' : `${count} items`,
      }
    },
  },
})
