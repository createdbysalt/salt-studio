import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'milestone',
  title: 'Milestone',
  type: 'object',
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Milestone Title',
      description: 'A short name for this milestone (e.g., "Project Launch", "Design Phase").',
      validation: (rule) =>
        rule.required().error('Each milestone needs a title'),
    }),
    defineField({
      type: 'string',
      name: 'description',
      title: 'Description',
      description: 'A brief description of what happened during this milestone.',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'An optional image representing this milestone.',
      options: {
        hotspot: true,
        accept: 'image/png,image/jpeg,image/webp,image/gif',
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Describe the image for accessibility.',
        }),
      ],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      description: 'Optional labels to categorize this milestone (e.g., "Research", "Development").',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      type: 'duration',
      name: 'duration',
      title: 'Time Period',
      description: 'When did this milestone start and end?',
      validation: (rule) =>
        rule.required().error('Duration helps show the timeline'),
    }),
  ],
  preview: {
    select: {
      duration: 'duration',
      image: 'image',
      title: 'title',
    },
    prepare({duration, image, title}) {
      return {
        media: image,
        subtitle: [
          duration?.start && new Date(duration.start).getFullYear(),
          duration?.end && new Date(duration.end).getFullYear(),
        ]
          .filter(Boolean)
          .join(' - '),
        title,
      }
    },
  },
})
