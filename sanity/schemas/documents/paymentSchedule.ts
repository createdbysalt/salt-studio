import {ClockIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * A reusable payment split, such as 50/50 or 30/40/30.
 * Percents are the contract. Dollar amounts are computed from the selected price.
 */
export default defineType({
  name: 'paymentSchedule',
  title: 'Payment schedule',
  type: 'document',
  icon: ClockIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'How you refer to this split, for example “50/50” or “30/40/30”.',
      validation: (rule) => rule.required().error('Name the schedule'),
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      description:
        'Each step is a percent of the fixed fee and the moment it is due. Later steps are invoiced, not charged automatically.',
      of: [defineArrayMember({type: 'proposalPaymentStep'})],
      validation: (rule) =>
        rule
          .required()
          .min(2)
          .custom((steps) => {
            if (!Array.isArray(steps)) return true
            let total = 0
            for (const step of steps) {
              const percent = (step as {percent?: number} | null)?.percent
              if (typeof percent === 'number') total += percent
            }
            return total === 100
              ? true
              : `The steps add up to ${total}%. They need to add up to 100%.`
          }),
    }),
  ],
  preview: {
    select: {title: 'name'},
  },
})
