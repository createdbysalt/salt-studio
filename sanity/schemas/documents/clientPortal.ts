import {ActivePhaseInput} from '@/sanity/schemas/documents/ActivePhaseInput'
import {CLIENT_TYPES} from '@/sanity/schemas/documents/portalChecklist'
import {CaseIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Client portal — a password-gated /project/[slug] page for one engagement.
 *
 * Set it up once (name, Drive, password). The Church website create template
 * fills the checklist. Not the same as the homepage `client` roster.
 */
export default defineType({
  name: 'clientPortal',
  title: 'Client portal',
  type: 'document',
  icon: CaseIcon,
  description: 'A private page for one client: shared Drive, optional preview, and a checklist.',
  groups: [
    {name: 'client', title: 'Client', default: true},
    {name: 'project', title: 'Project'},
    {name: 'settings', title: 'Settings'},
  ],
  fields: [
    defineField({
      name: 'client',
      title: 'Client',
      type: 'reference',
      group: 'client',
      to: [{type: 'client'}],
      description:
        'The brand in Dynamic Content → Clients. One client can have more than one table over time.',
    }),
    defineField({
      name: 'name',
      title: 'Name on the table',
      type: 'string',
      group: 'client',
      description:
        'Shown at the top of their page (e.g. "Enjoy Life Church"). Can differ from the roster name.',
      validation: (rule) => rule.required().error('The name is the first thing the client sees'),
    }),
    defineField({
      name: 'slug',
      title: 'Project URL',
      type: 'slug',
      group: 'client',
      description: 'Their page is /project/this-slug. Send them that link plus the password.',
      options: {
        source: 'name',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required().error('The slug is the URL you send the client'),
    }),
    defineField({
      name: 'clientType',
      title: 'Client type',
      type: 'string',
      group: 'client',
      initialValue: 'church',
      options: {list: [...CLIENT_TYPES], layout: 'radio'},
      description: 'Filters the checklist and forms you can pick below.',
      validation: (rule) => rule.required().error('Client type chooses which kit this table uses'),
    }),
    defineField({
      name: 'serviceType',
      title: 'Service',
      type: 'string',
      group: 'client',
      hidden: true,
      initialValue: 'website',
      options: {
        list: [
          {title: 'Website', value: 'website'},
          {title: 'Software', value: 'software'},
          {title: 'AI', value: 'ai'},
          {title: 'Growth', value: 'growth'},
        ],
      },
      description: 'Set by the create template. Website is the only filled service for now.',
    }),
    defineField({
      name: 'projectPhases',
      title: 'Project phases',
      type: 'reference',
      group: 'client',
      to: [{type: 'projectPhases'}],
      options: {disableNew: true},
      description: 'The Overview timeline on the table. Leave empty to hide Overview in the nav.',
    }),
    defineField({
      name: 'checklistTemplate',
      title: 'Checklist',
      type: 'reference',
      group: 'client',
      to: [{type: 'portalChecklist'}],
      options: {
        disableNew: true,
        filter: ({document}) => {
          const clientType = document?.clientType
          if (typeof clientType !== 'string' || !clientType) return {filter: 'true'}
          return {filter: 'clientType == $clientType', params: {clientType}}
        },
      },
      description: 'The Checklist section on the table. Leave empty to hide it in the nav.',
    }),
    defineField({
      name: 'formsTemplate',
      title: 'Forms',
      type: 'reference',
      group: 'client',
      to: [{type: 'portalForms'}],
      options: {
        disableNew: true,
        filter: ({document}) => {
          const clientType = document?.clientType
          if (typeof clientType !== 'string' || !clientType) return {filter: 'true'}
          return {filter: 'clientType == $clientType', params: {clientType}}
        },
      },
      description: 'The Forms section on the table. Leave empty to hide it in the nav.',
    }),
    defineField({
      name: 'activePhase',
      title: 'Current phase',
      type: 'string',
      group: 'project',
      description:
        'Red dot on the Overview timeline. Automatic follows the checklist ticks. Pick a phase to pin it.',
      hidden: ({document}) => !document?.projectPhases,
      components: {input: ActivePhaseInput},
    }),
    defineField({
      name: 'launchEstimate',
      title: 'Estimated launch',
      type: 'date',
      group: 'project',
      description: 'Shown under Overview. Leave empty to hide it.',
      options: {dateFormat: 'MMMM D, YYYY'},
    }),
    defineField({
      name: 'contentDue',
      title: 'Checklist & forms due',
      type: 'date',
      group: 'project',
      description: 'One date for both Checklist and Forms on the table. Leave empty to hide it.',
      options: {dateFormat: 'MMMM D, YYYY'},
    }),
    defineField({
      name: 'checklistDue',
      title: 'Checklist due',
      type: 'date',
      group: 'settings',
      hidden: true,
      description: 'Replaced by Checklist & forms due. Kept so older tables still resolve a date.',
      options: {dateFormat: 'MMMM D, YYYY'},
    }),
    defineField({
      name: 'formsDue',
      title: 'Forms due',
      type: 'date',
      group: 'settings',
      hidden: true,
      description: 'Replaced by Checklist & forms due. Kept so older tables still resolve a date.',
      options: {dateFormat: 'MMMM D, YYYY'},
    }),
    defineField({
      name: 'previewUrl',
      title: 'Public link',
      type: 'url',
      group: 'project',
      description:
        'Staging or preview. The See the site button on the table. Hidden until you add it.',
      validation: (rule) =>
        rule.uri({allowRelative: false, scheme: ['http', 'https']}).warning('Use a full https URL'),
    }),
    defineField({
      name: 'productionUrl',
      title: 'Production link',
      type: 'url',
      group: 'project',
      description:
        'The live site. The See the live site button on the table. Hidden until you add it.',
      validation: (rule) =>
        rule.uri({allowRelative: false, scheme: ['http', 'https']}).warning('Use a full https URL'),
    }),
    defineField({
      name: 'whatsappGroupUrl',
      title: 'WhatsApp group',
      type: 'url',
      group: 'project',
      description:
        'Invite link for this project’s WhatsApp group (Group info → Invite via link). The Contact button on the table opens it. Leave empty to use Salt’s studio number.',
      validation: (rule) =>
        rule.uri({allowRelative: false, scheme: ['https']}).custom((value) => {
          if (!value) return true
          try {
            const host = new URL(value).hostname.replace(/^www\./, '')
            if (
              host === 'chat.whatsapp.com' ||
              host === 'wa.me' ||
              host === 'api.whatsapp.com' ||
              host.endsWith('.whatsapp.com')
            ) {
              return true
            }
          } catch {
            return 'Use a full https WhatsApp link'
          }
          return 'Use a WhatsApp group invite (chat.whatsapp.com) or wa.me link'
        }),
    }),
    defineField({
      name: 'sharedFolderUrl',
      title: 'Shared Drive folder',
      type: 'url',
      group: 'project',
      description: 'The root Google Drive folder for this client.',
      validation: (rule) =>
        rule.uri({allowRelative: false, scheme: ['http', 'https']}).warning('Use a full https URL'),
    }),
    defineField({
      name: 'brandingFolderUrl',
      title: 'Branding folder',
      type: 'url',
      group: 'project',
      description: 'Folder inside the shared Drive for logos, fonts, and colors.',
      validation: (rule) =>
        rule.uri({allowRelative: false, scheme: ['http', 'https']}).warning('Use a full https URL'),
    }),
    defineField({
      name: 'mediaFolderUrl',
      title: 'Photos & video folder',
      type: 'url',
      group: 'project',
      description: 'Folder inside the shared Drive for building, service, and other photos.',
      validation: (rule) =>
        rule.uri({allowRelative: false, scheme: ['http', 'https']}).warning('Use a full https URL'),
    }),
    defineField({
      name: 'password',
      title: 'Password',
      type: 'string',
      group: 'settings',
      initialValue: 'salt',
      description:
        'Shared password you tell the client. Default is “salt”. Never shown on the public page.',
      validation: (rule) => rule.required().error('Without a password the page cannot be opened'),
    }),
    defineField({
      name: 'enabled',
      title: 'Page is live',
      type: 'boolean',
      group: 'settings',
      initialValue: true,
      description: 'Turn off to hide the page (404). Default is on.',
    }),
    defineField({
      name: 'checklist',
      title: 'This client’s ticks',
      type: 'array',
      group: 'settings',
      hidden: true,
      description:
        'Saved when they tick items on /table. Titles come from the shared Checklist and Forms.',
      of: [defineArrayMember({type: 'portalChecklistCategory'})],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      clientName: 'client.name',
      slug: 'slug.current',
      enabled: 'enabled',
      clientType: 'clientType',
      serviceType: 'serviceType',
    },
    prepare({title, clientName, slug, enabled, clientType, serviceType}) {
      const typeLabel = CLIENT_TYPES.find((item) => item.value === clientType)?.title
      const serviceLabel =
        serviceType === 'website'
          ? 'Website'
          : serviceType === 'software'
            ? 'Software'
            : serviceType === 'ai'
              ? 'AI'
              : serviceType === 'growth'
                ? 'Growth'
                : null
      const parts = [
        typeLabel,
        serviceLabel,
        slug ? `/project/${slug}` : null,
        enabled === false ? 'Hidden' : null,
      ].filter(Boolean)
      return {
        title: title || clientName || 'Untitled table',
        subtitle: parts.join(' · ') || undefined,
      }
    },
  },
})
