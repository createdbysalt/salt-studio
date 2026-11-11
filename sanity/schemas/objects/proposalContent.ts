import {defineField, defineType} from 'sanity'

/**
 * Shared pieces of a proposal. Packages and add-ons carry their own
 * deliverables so the Statement of Work can assemble itself.
 */

export const proposalDeliverable = defineType({
  name: 'proposalDeliverable',
  title: 'Deliverable',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description:
        'Short name of what the client receives, as it should appear in the signed scope.',
      validation: (rule) => rule.required().error('Every deliverable needs a name'),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'What this deliverable includes, in plain language.',
      validation: (rule) => rule.required().error('Describe the deliverable so the scope is clear'),
    }),
    defineField({
      name: 'phase',
      title: 'Phase',
      type: 'string',
      description: 'Which phase this belongs to, for example “Discovery” or “Build”.',
    }),
    defineField({
      name: 'acceptanceCriteria',
      title: 'Acceptance criteria',
      type: 'text',
      rows: 3,
      description: 'How the client confirms this deliverable is done.',
      validation: (rule) =>
        rule.required().error('Acceptance criteria are what make the scope binding'),
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'phase'},
    prepare({title, subtitle}) {
      return {title: title || 'Untitled deliverable', subtitle}
    },
  },
})

export const proposalScopeItem = defineType({
  name: 'proposalScopeItem',
  title: 'Out of scope item',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'What is not included',
      type: 'string',
      description: 'One clear exclusion, for example “Copywriting” or “Ongoing ads management”.',
      validation: (rule) => rule.required().error('Write the exclusion in one line'),
    }),
  ],
  preview: {
    select: {title: 'text'},
  },
})

export const proposalPhaseItem = defineType({
  name: 'proposalPhaseItem',
  title: 'Phase',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Phase name',
      type: 'string',
      description: 'The name shown on the timeline, for example “Foundation”.',
      validation: (rule) => rule.required().error('Every phase needs a name'),
    }),
    defineField({
      name: 'summary',
      title: 'What happens',
      type: 'text',
      rows: 2,
      description: 'One or two sentences about the work in this phase.',
      validation: (rule) => rule.required().error('Say what happens in this phase'),
    }),
    defineField({
      name: 'weeks',
      title: 'Weeks',
      type: 'string',
      description: 'The week range, for example “Weeks 1–2”.',
      validation: (rule) => rule.required().error('Add the week range'),
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'weeks'},
  },
})

export const proposalPaymentStep = defineType({
  name: 'proposalPaymentStep',
  title: 'Payment step',
  type: 'object',
  fields: [
    defineField({
      name: 'percent',
      title: 'Percent',
      type: 'number',
      description:
        'This step’s share of the fixed fee, as a whole number. A 50/50 split is 50 then 50.',
      validation: (rule) =>
        rule.required().min(1).max(100).error('Enter a percent between 1 and 100'),
    }),
    defineField({
      name: 'trigger',
      title: 'When it is due',
      type: 'string',
      description:
        'What has to happen before this payment, for example “On signing” or “When the build is accepted”.',
      validation: (rule) => rule.required().error('Say what triggers this payment'),
    }),
  ],
  preview: {
    select: {percent: 'percent', trigger: 'trigger'},
    prepare({percent, trigger}) {
      return {title: percent ? `${percent}%` : 'Payment', subtitle: trigger}
    },
  },
})

export const proposalContentTypes = [
  proposalDeliverable,
  proposalScopeItem,
  proposalPhaseItem,
  proposalPaymentStep,
]
