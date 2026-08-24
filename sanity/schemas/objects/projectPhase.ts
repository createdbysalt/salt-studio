import {defineField, defineType} from 'sanity'

/**
 * One step in a client-table “How the project runs” timeline.
 */
export default defineType({
  name: 'projectPhase',
  title: 'Phase',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Phase name',
      type: 'string',
      description: 'Short title on the table, e.g. “Discovery” or “Build”.',
      validation: (rule) => rule.required().error('Every phase needs a name the client can scan'),
    }),
    defineField({
      name: 'note',
      title: 'Note',
      type: 'text',
      rows: 2,
      description: 'One or two sentences under the name. Keep it plain.',
      validation: (rule) => rule.required().error('A short note tells the client what this step is'),
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'note'},
  },
})
