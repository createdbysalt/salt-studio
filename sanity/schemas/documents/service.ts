import {ComponentIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Service — a discipline Salt Studio handled on a project (the CSV "SERVICES HANDLED" column).
 *
 * Controlled vocabulary referenced from projects (e.g. Production, Cinematography,
 * Art Dept, Color). Reorderable via sortOrder; can later feed the Capabilities page.
 */
export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Service name',
      type: 'string',
      description: 'The discipline as it appears on project pages (e.g. "Cinematography").',
      validation: (rule) => rule.required().error('Every service needs a name'),
    }),
    defineField({
      name: 'department',
      title: 'Department',
      type: 'string',
      description: 'Which stage of production this service belongs to.',
      options: {
        list: [
          {title: 'Pre-Production', value: 'pre-production'},
          {title: 'Production', value: 'production'},
          {title: 'Post', value: 'post'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      description: 'Optional. Auto-generated from the name.',
      options: {source: 'name', maxLength: 96},
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort order',
      type: 'number',
      initialValue: 0,
      description: 'Lower numbers appear first when services are listed in a canonical order.',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description:
        'Optional. A short explanation of this service — may feed the Capabilities page.',
    }),
  ],
  orderings: [
    {title: 'Sort order', name: 'sortOrderAsc', by: [{field: 'sortOrder', direction: 'asc'}]},
    {title: 'Name', name: 'nameAsc', by: [{field: 'name', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'name', department: 'department', description: 'description'},
    prepare({title, department, description}) {
      const dept = {['pre-production']: 'Pre-Production', production: 'Production', post: 'Post'}[
        department
      ]
      return {title: title || 'Untitled service', subtitle: dept || description || undefined}
    },
  },
})
