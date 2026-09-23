import {ClockIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/** Stable id for the Websites timeline. Church portals point here. */
export const WEBSITE_PROJECT_PHASES_ID = 'projectPhases-websites'

/**
 * Project phases — the “How the project runs” timeline on /table.
 * One document per service. Website is the one filled in for now.
 */
export default defineType({
  name: 'projectPhases',
  title: 'Project phases',
  type: 'document',
  icon: ClockIcon,
  description: 'The step-by-step timeline on a client table, tied to one service.',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Studio label only, e.g. “Website”. Clients see the heading below.',
      validation: (rule) => rule.required().error('Give this set a name so you can find it'),
    }),
    defineField({
      name: 'service',
      title: 'Service',
      type: 'reference',
      to: [{type: 'service'}],
      options: {disableNew: true},
      description: 'Which offering this timeline belongs to. Website uses the Websites service.',
      validation: (rule) =>
        rule
          .required()
          .error('Link this to a service so the right tables can find it')
          .custom(async (value, context) => {
            const ref = value?._ref
            if (!ref) return true
            const id = context.document?._id?.replace(/^drafts\./, '')
            const client = context.getClient({apiVersion: '2025-02-27'})
            const count = await client.fetch<number>(
              `count(*[_type == "projectPhases" && service._ref == $ref && !(_id in [$id, "drafts." + $id])])`,
              {ref, id},
            )
            return count === 0 ? true : 'That service already has project phases'
          }),
    }),
    defineField({
      name: 'heading',
      title: 'Heading on the table',
      type: 'string',
      initialValue: 'How the project runs',
      description: 'Shown above the timeline on /table. Default is “How the project runs”.',
      validation: (rule) => rule.required().error('The table needs a heading above the steps'),
    }),
    defineField({
      name: 'phases',
      title: 'Phases',
      type: 'array',
      description:
        'Steps from left to right. The Website set is Discovery through Launch. Drag to reorder.',
      of: [defineArrayMember({type: 'projectPhase'})],
      validation: (rule) =>
        rule
          .required()
          .min(2)
          .error('Need at least two steps or it is not a timeline')
          .max(8)
          .warning('More than six steps gets tight on a laptop'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      service: 'service.title',
      phases: 'phases',
    },
    prepare({title, service, phases}) {
      const count = Array.isArray(phases) ? phases.length : 0
      return {
        title: title || 'Untitled phases',
        subtitle: [service, count ? `${count} steps` : null].filter(Boolean).join(' · '),
      }
    },
  },
})
