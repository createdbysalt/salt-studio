import {ClipboardIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/** Stable id for the church website checklist. Church portals point here. */
export const CHURCH_WEBSITE_CHECKLIST_ID = 'checklist-church-website'

export const CLIENT_TYPES = [
  {title: 'Church', value: 'church'},
  {title: 'Business', value: 'business'},
  {title: 'Nonprofit', value: 'nonprofit'},
  {title: 'School', value: 'school'},
  {title: 'Other', value: 'other'},
] as const

/**
 * Checklist — reusable groups for /table, tied to a service and a client type.
 * Church + Websites is the one filled in for now.
 */
export default defineType({
  name: 'portalChecklist',
  title: 'Checklist',
  type: 'document',
  icon: ClipboardIcon,
  description:
    'The checklist groups on a client table, tied to one service and one kind of client.',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Studio label only, e.g. “Church website”. Clients see the group titles below.',
      validation: (rule) => rule.required().error('Give this checklist a name so you can find it'),
    }),
    defineField({
      name: 'service',
      title: 'Service',
      type: 'reference',
      to: [{type: 'service'}],
      options: {disableNew: true},
      description: 'Which offering this checklist belongs to. Church websites use Websites.',
      validation: (rule) =>
        rule.required().error('Link this to a service so the right tables can find it'),
    }),
    defineField({
      name: 'clientType',
      title: 'Client type',
      type: 'string',
      options: {list: [...CLIENT_TYPES], layout: 'radio'},
      description:
        'Who this list is for. Church websites use Church. Business websites can have their own later.',
      validation: (rule) =>
        rule
          .required()
          .error('Pick a client type so church and business lists stay separate')
          .custom(async (clientType, context) => {
            const ref = (context.document?.service as {_ref?: string} | undefined)?._ref
            if (!ref || !clientType) return true
            const id = context.document?._id?.replace(/^drafts\./, '')
            const client = context.getClient({apiVersion: '2025-02-27'})
            const count = await client.fetch<number>(
              `count(*[_type == "portalChecklist" && service._ref == $ref && clientType == $clientType && !(_id in [$id, "drafts." + $id])])`,
              {ref, clientType, id},
            )
            return count === 0 ? true : 'That service already has a checklist for this client type'
          }),
    }),
    defineField({
      name: 'categories',
      title: 'Groups',
      type: 'array',
      description:
        'The accordion groups on the table — Getting Started, Branding, Photos & Video. Drag to reorder.',
      of: [defineArrayMember({type: 'portalChecklistCategory'})],
      validation: (rule) =>
        rule.required().min(1).error('Add at least one group or this is not a checklist'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      service: 'service.title',
      clientType: 'clientType',
      categories: 'categories',
    },
    prepare({title, service, clientType, categories}) {
      const typeLabel = CLIENT_TYPES.find((item) => item.value === clientType)?.title
      const count = Array.isArray(categories) ? categories.length : 0
      return {
        title: title || 'Untitled checklist',
        subtitle: [service, typeLabel, count ? `${count} groups` : null]
          .filter(Boolean)
          .join(' · '),
      }
    },
  },
})
