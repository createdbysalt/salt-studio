import {defineField, defineType} from 'sanity'

/** One row in a studio or rental specs table. */
export default defineType({
  name: 'specRow',
  title: 'Spec row',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Left column — e.g. "Cyclorama", "Power".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Value',
      type: 'string',
      description: 'Right column — the spec detail.',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {label: 'label', value: 'value'},
    prepare({label, value}) {
      return {title: label || 'Spec', subtitle: value}
    },
  },
})
