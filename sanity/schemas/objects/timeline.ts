import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'timeline',
  title: 'Timeline',
  type: 'object',
  description: 'Display a visual timeline of events or milestones.',
  fields: [
    {
      name: 'items',
      title: 'Timeline Sections',
      description: 'Add up to 2 timeline sections. Each section can contain multiple milestones.',
      type: 'array',
      validation: (Rule) =>
        Rule.max(2).error('Maximum of 2 timeline sections to keep the page clean'),
      of: [
        {
          name: 'item',
          title: 'Timeline Section',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Section Title',
              type: 'string',
              description:
                'A heading for this group of milestones (e.g., "Education", "Work Experience").',
            }),
            {
              name: 'milestones',
              title: 'Milestones',
              description: 'The events or achievements in this section.',
              type: 'array',
              of: [
                defineField({
                  name: 'milestone',
                  title: 'Milestone',
                  type: 'milestone',
                }),
              ],
            },
          ],
          preview: {
            select: {
              items: 'milestones',
              title: 'title',
            },
            prepare({items, title}) {
              const hasItems = items && items.length > 0
              const milestoneNames = hasItems && items.map((timeline) => timeline.title).join(', ')

              return {
                subtitle: hasItems
                  ? `${milestoneNames} (${items.length} item${items.length > 1 ? 's' : ''})`
                  : 'No milestones',
                title,
              }
            },
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      items: 'items',
    },
    prepare({items}: {items: {title: string}[]}) {
      const hasItems = items && items.length > 0
      const timelineNames = hasItems && items.map((timeline) => timeline.title).join(', ')

      return {
        title: 'Timelines',
        subtitle: hasItems
          ? `${timelineNames} (${items.length} item${items.length > 1 ? 's' : ''})`
          : 'No timelines',
      }
    },
  },
})
