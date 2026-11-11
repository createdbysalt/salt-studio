import {DocumentsIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {proposalSectionMembers} from '../objects/proposalSections'

const PROPOSAL_STATUSES = [
  {title: 'Draft', value: 'draft'},
  {title: 'Sent', value: 'sent'},
  {title: 'Viewed', value: 'viewed'},
  {title: 'Signed', value: 'signed'},
  {title: 'Paid', value: 'paid'},
  {title: 'Expired', value: 'expired'},
] as const

function createProposalToken() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function fourteenDaysFromNow() {
  return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
}

/**
 * A private proposal for one lead.
 *
 * Client names and the signed scope live here. Read this only on the server.
 * The production dataset is still public until proposals move to a private dataset,
 * so do not put a real client's legal details in until that move is done.
 * Dollar amounts are never stored here. The page sends selected ids and the server
 * recomputes the total.
 */
export default defineType({
  name: 'proposal',
  title: 'Proposal',
  type: 'document',
  icon: DocumentsIcon,
  groups: [
    {name: 'client', title: 'Client', default: true},
    {name: 'page', title: 'Page'},
    {name: 'commercial', title: 'Commercial'},
    {name: 'offer', title: 'Offer window'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Internal title',
      type: 'string',
      group: 'client',
      description:
        'For you, in the studio list. The client sees the outcome headline, not this title.',
      validation: (rule) => rule.required().error('Give the proposal an internal title'),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'client',
      initialValue: 'draft',
      description:
        'Draft while you are writing. After the link is sent, the site updates this. Do not move a signed proposal back to draft.',
      options: {list: PROPOSAL_STATUSES.map((status) => status), layout: 'radio'},
      validation: (rule) => rule.required().error('Choose a status'),
    }),
    defineField({
      name: 'token',
      title: 'Private link key',
      type: 'string',
      group: 'client',
      initialValue: createProposalToken,
      description:
        'The unguessable key in the client’s link (/p/this-key). It is generated when you create the proposal. Do not change it after you send the link.',
      validation: (rule) =>
        rule.required().min(32).error('The private link key must be at least 32 characters'),
    }),
    defineField({
      name: 'clientDisplayName',
      title: 'Client name',
      type: 'string',
      group: 'client',
      description: 'The name in the top bar and on the cover. This can be the brand name.',
      validation: (rule) => rule.required().error('Add the name the client should see'),
    }),
    defineField({
      name: 'clientLogo',
      title: 'Client logo',
      type: 'image',
      group: 'client',
      description: 'Optional logo on the cover. SVG or a transparent PNG works best.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the logo for screen readers, for example “Northwind logo”.',
        }),
      ],
    }),
    defineField({
      name: 'clientLegalName',
      title: 'Legal name',
      type: 'string',
      group: 'client',
      description:
        'The legal party named in the Statement of Work. The production dataset is still world-readable, so wait to enter a real client until proposals live in a private dataset.',
      validation: (rule) => rule.required().error('The signed scope needs the client’s legal name'),
    }),
    defineField({
      name: 'signerName',
      title: 'Signer name',
      type: 'string',
      group: 'client',
      description: 'The person expected to sign. They still type their own name on the page.',
    }),
    defineField({
      name: 'signerEmail',
      title: 'Signer email',
      type: 'string',
      group: 'client',
      description: 'Where the signed scope and receipt are sent.',
      validation: (rule) => rule.email().error('Use a valid email address'),
    }),
    defineField({
      name: 'sections',
      title: 'Page sections',
      type: 'array',
      group: 'page',
      description:
        'The page, from top to bottom. Reorder sections here, or hide one without deleting it.',
      of: proposalSectionMembers,
      initialValue: [
        {
          _type: 'proposalCoverSection',
          enabled: true,
          preparedBy: 'Gabriella Martins, Salt Studio',
        },
        {_type: 'proposalSituationSection', enabled: true, heading: 'The situation'},
        {_type: 'proposalOutcomesSection', enabled: true, heading: 'What changes'},
        {_type: 'proposalPhasesSection', enabled: true, heading: 'How we get there'},
        {_type: 'proposalProofSection', enabled: true, heading: 'Proof'},
        {_type: 'proposalPackagesSection', enabled: true, heading: 'The engagement'},
        {_type: 'proposalAddOnsSection', enabled: true, heading: 'Add-ons'},
        {_type: 'proposalOfferSection', enabled: true, heading: 'If you sign today'},
        {_type: 'proposalInvestmentSection', enabled: true, heading: 'Investment'},
        {_type: 'proposalSowSection', enabled: true},
        {_type: 'proposalScheduleSection', enabled: true, heading: 'Payment schedule'},
        {
          _type: 'proposalTermsSection',
          enabled: true,
          changeOrderRule:
            'Anything outside this scope is quoted and approved in writing before the work starts.',
        },
        {
          _type: 'proposalAcceptSection',
          enabled: true,
          prompt: 'Sign here and we start on the date you choose.',
          checkboxLabel: 'I agree to the Master Services Agreement and this Statement of Work.',
        },
        {_type: 'proposalSignedSection', enabled: true, heading: 'Signed.'},
      ],
    }),
    defineField({
      name: 'packages',
      title: 'Packages',
      type: 'array',
      group: 'commercial',
      description:
        'Two or three packages the client can choose from. One of them is marked recommended.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'proposalPackage'}]})],
      validation: (rule) =>
        rule
          .max(3)
          .error('Show two or three packages')
          .min(2)
          .warning('Two or three packages reads as a clear choice'),
    }),
    defineField({
      name: 'recommendedPackage',
      title: 'Recommended package',
      type: 'reference',
      group: 'commercial',
      to: [{type: 'proposalPackage'}],
      description: 'The package marked recommended. It must be one of the packages above.',
      validation: (rule) =>
        rule.custom((value, context) => {
          const selected = (context.document?.packages as {_ref?: string}[] | undefined) ?? []
          const ref = (value as {_ref?: string} | undefined)?._ref
          if (!ref) return 'Mark one package as recommended'
          if (!selected.some((item) => item?._ref === ref)) {
            return 'The recommended package has to be one of the packages on this proposal'
          }
          return true
        }),
    }),
    defineField({
      name: 'addOns',
      title: 'Add-ons',
      type: 'array',
      group: 'commercial',
      description: 'Optional toggles. Each one updates the total and the signed scope.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'proposalAddOn'}]})],
    }),
    defineField({
      name: 'paymentSchedule',
      title: 'Payment schedule',
      type: 'reference',
      group: 'commercial',
      to: [{type: 'paymentSchedule'}],
      description: 'The split for this proposal, for example 50/50 or 30/40/30.',
      validation: (rule) => rule.required().error('Choose how the fee is split'),
    }),
    defineField({
      name: 'msa',
      title: 'Master services agreement',
      type: 'reference',
      group: 'commercial',
      to: [{type: 'proposalMsa'}],
      description: 'The agreement version they accept. The page links to it. It is not pasted in.',
      validation: (rule) => rule.required().error('Choose the agreement version'),
    }),
    defineField({
      name: 'kickoffOptions',
      title: 'Kickoff dates',
      type: 'array',
      group: 'offer',
      description:
        'Real start dates you can hold. The page shows these. It does not invent a date.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'proposalKickoffOption',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'How the date should read, for example “Monday, March 3”.',
              validation: (rule) => rule.required().error('Add the label the client sees'),
            }),
            defineField({
              name: 'date',
              title: 'Date',
              type: 'date',
              description: 'The actual kickoff date.',
              validation: (rule) => rule.required().error('Add the date'),
            }),
          ],
          preview: {select: {title: 'label', subtitle: 'date'}},
        }),
      ],
    }),
    defineField({
      name: 'validUntil',
      title: 'Valid until',
      type: 'datetime',
      group: 'offer',
      initialValue: fourteenDaysFromNow,
      description:
        'Price and kickoff slot are held until this moment. Default is 14 days. After that the page says the proposal expired.',
      validation: (rule) => rule.required().error('Set how long this proposal stays valid'),
    }),
    defineField({
      name: 'sameDayOffer',
      title: 'Same-day offer',
      type: 'object',
      group: 'offer',
      description:
        'A bonus for signing and paying the deposit today. Usually a deliverable, not a discount. The server decides if it still applies.',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Offer this bonus',
          type: 'boolean',
          initialValue: false,
          description: 'Turn on only when there is a real bonus.',
        }),
        defineField({
          name: 'bonusTitle',
          title: 'Bonus',
          type: 'string',
          description: 'What they receive, for example “Priority kickoff” or “Homepage copy”.',
        }),
        defineField({
          name: 'bonusDetail',
          title: 'Detail',
          type: 'text',
          rows: 2,
          description: 'One sentence on the bonus. Do not invent scarcity.',
        }),
        defineField({
          name: 'deadline',
          title: 'Deadline',
          type: 'datetime',
          description:
            'Optional. If empty, the bonus applies on the day the proposal is first opened, decided by the server.',
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'clientDisplayName', status: 'status', internal: 'title'},
    prepare({title, status, internal}) {
      const label = PROPOSAL_STATUSES.find((item) => item.value === status)?.title ?? 'Draft'
      return {title: title || internal || 'Untitled proposal', subtitle: label}
    },
  },
})
