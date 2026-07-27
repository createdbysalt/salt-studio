import {defineField, defineType} from 'sanity'

/** Single capability module tile on the Capabilities page grid. */
export default defineType({
  name: 'moduleTile',
  title: 'Module tile',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Short module name shown in the tile (e.g. "High-speed (1000+ fps)").',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'inHouse',
      title: 'In-house',
      type: 'boolean',
      description: 'Show an in-house indicator on the tile.',
      initialValue: true,
    }),
  ],
  preview: {
    select: {label: 'label', inHouse: 'inHouse'},
    prepare({label, inHouse}) {
      return {
        title: label || 'Module',
        subtitle: inHouse ? 'In-house' : 'Available on request',
      }
    },
  },
})
