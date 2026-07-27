import {StarIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Testimonial — a standalone client quote, managed in Dynamic Content.
 *
 * Distinct from the `testimonials` section object (a page-builder block). These
 * are reusable documents you can link to a client/project and surface anywhere.
 */
export default defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      description: 'What the client said about the work. No surrounding quotation marks needed.',
      validation: (rule) => rule.required().error('Every testimonial needs a quote'),
    }),
    defineField({
      name: 'author',
      title: 'Author name',
      type: 'string',
      description: 'The name of the person quoted.',
      validation: (rule) => rule.required().error('Include the author’s name'),
    }),
    defineField({
      name: 'role',
      title: 'Role & company',
      type: 'string',
      description: 'Their title and company (e.g. "Brand Marketing Lead, Seattle Sounders FC").',
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'reference',
      to: [{type: 'client'}],
      description: 'Optional. Link this testimonial to a client on the roster.',
    }),
    defineField({
      name: 'project',
      title: 'Project',
      type: 'reference',
      to: [{type: 'project'}],
      description: 'Optional. Link this testimonial to the project it’s about.',
    }),
  ],
  orderings: [{title: 'Author', name: 'authorAsc', by: [{field: 'author', direction: 'asc'}]}],
  preview: {
    select: {
      author: 'author',
      role: 'role',
      client: 'client.name',
    },
    prepare({author, role, client}) {
      return {
        title: author || 'Unnamed',
        subtitle: [role, client].filter(Boolean).join(' · ') || undefined,
        media: StarIcon,
      }
    },
  },
})
