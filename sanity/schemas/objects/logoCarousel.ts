import {ImagesIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Logo Carousel Schema
 *
 * A "Trusted By" or "As Seen In" section displaying partner/client logos.
 */
export default defineType({
  name: 'logoCarousel',
  title: 'Logo Carousel',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Optional heading (e.g., "Trusted By", "As Seen In", "Our Partners").',
      initialValue: 'Trusted By',
    }),
    defineField({
      name: 'logos',
      title: 'Logos',
      type: 'array',
      description: 'Add company logos. For best results, use transparent PNG or SVG files.',
      of: [
        {
          type: 'object',
          name: 'logo',
          title: 'Logo',
          fields: [
            defineField({
              name: 'image',
              title: 'Logo Image',
              type: 'image',
              description: 'Upload a logo (PNG or SVG with transparent background works best).',
              options: {
                accept: 'image/png,image/svg+xml,image/webp',
              },
              validation: (rule) => rule.required().error('Each logo needs an image'),
            }),
            defineField({
              name: 'name',
              title: 'Company Name',
              type: 'string',
              description: 'Used for accessibility (alt text) and hover tooltips.',
              validation: (rule) => rule.required().error('Add the company name for accessibility'),
            }),
            defineField({
              name: 'url',
              title: 'Link (optional)',
              type: 'url',
              description: 'Optional link to the company website.',
            }),
          ],
          preview: {
            select: {
              title: 'name',
              media: 'image',
            },
            prepare({title, media}) {
              return {
                title: title || 'Unnamed company',
                media,
              }
            },
          },
        },
      ],
      validation: (rule) => rule.min(2).error('Add at least 2 logos for a carousel'),
    }),
    defineField({
      name: 'style',
      title: 'Display Style',
      type: 'string',
      description: 'How should the logos be displayed?',
      options: {
        list: [
          {title: 'Grid (static rows)', value: 'grid'},
          {title: 'Scrolling (animated)', value: 'scrolling'},
          {title: 'Simple row', value: 'row'},
        ],
        layout: 'radio',
      },
      initialValue: 'grid',
    }),
    defineField({
      name: 'grayscale',
      title: 'Grayscale Logos',
      type: 'boolean',
      description: 'Display logos in grayscale (color on hover). Creates a cleaner look.',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      logos: 'logos',
    },
    prepare({title, logos}) {
      const count = logos?.length || 0
      return {
        title: title || 'Logo Carousel',
        subtitle: `${count} logo${count !== 1 ? 's' : ''}`,
        media: ImagesIcon,
      }
    },
  },
})
