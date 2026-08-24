import {CLIENT_TYPES} from '@/sanity/schemas/documents/portalChecklist'
import {ComposeIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/** Stable id for the church website forms. Church portals point here. */
export const CHURCH_WEBSITE_FORMS_ID = 'forms-church-website'

/**
 * Forms — reusable form rows for /table, tied to a service and a client type.
 * Church + Websites is the one filled in for now.
 */
export default defineType({
  name: 'portalForms',
  title: 'Forms',
  type: 'document',
  icon: ComposeIcon,
  description: 'The form list on a client table, tied to one service and one kind of client.',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Studio label only, e.g. “Church website”. Clients see the heading below.',
      validation: (rule) => rule.required().error('Give this set a name so you can find it'),
    }),
    defineField({
      name: 'service',
      title: 'Service',
      type: 'reference',
      to: [{type: 'service'}],
      options: {disableNew: true},
      description: 'Which offering this list belongs to. Church websites use Websites.',
      validation: (rule) => rule.required().error('Link this to a service so the right tables can find it'),
    }),
    defineField({
      name: 'clientType',
      title: 'Client type',
      type: 'string',
      options: {list: [...CLIENT_TYPES], layout: 'radio'},
      description: 'Who this list is for. Church websites use Church. Business websites can have their own later.',
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
              `count(*[_type == "portalForms" && service._ref == $ref && clientType == $clientType && !(_id in [$id, "drafts." + $id])])`,
              {ref, clientType, id},
            )
            return count === 0 ? true : 'That service already has forms for this client type'
          }),
    }),
    defineField({
      name: 'heading',
      title: 'Heading on the table',
      type: 'string',
      initialValue: 'Forms',
      description: 'Shown above the list on /table. Default is “Forms”.',
      validation: (rule) => rule.required().error('The table needs a heading above the forms'),
    }),
    defineField({
      name: 'description',
      title: 'Intro',
      type: 'text',
      rows: 3,
      description: 'Short note under the heading. Tell them who should fill each form, then to tick when everyone has sent theirs.',
    }),
    defineField({
      name: 'items',
      title: 'Forms',
      type: 'array',
      description: 'One row per form. Drag to reorder. Church websites have staff through FAQ.',
      of: [defineArrayMember({type: 'portalChecklistItem'})],
      validation: (rule) =>
        rule.required().min(1).error('Add at least one form or this list is empty'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      service: 'service.title',
      clientType: 'clientType',
      items: 'items',
    },
    prepare({title, service, clientType, items}) {
      const typeLabel = CLIENT_TYPES.find((item) => item.value === clientType)?.title
      const count = Array.isArray(items) ? items.length : 0
      return {
        title: title || 'Untitled forms',
        subtitle: [service, typeLabel, count ? `${count} forms` : null].filter(Boolean).join(' · '),
      }
    },
  },
})
