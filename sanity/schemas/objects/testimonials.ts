import {StarIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Testimonials Section Schema
 *
 * A reusable testimonials block that can be embedded in any page.
 * Supports different layouts and optional star ratings.
 */
export default defineType({
  name: 'testimonials',
  title: 'Testimonials Section',
  type: 'object',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Optional heading for the testimonials section.',
      initialValue: 'What Our Clients Say',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'text',
      rows: 2,
      description: 'Optional intro text below the title.',
    }),
    defineField({
      name: 'items',
      title: 'Testimonials',
      type: 'array',
      description: 'Add client testimonials. Include name, role, and their quote.',
      of: [
        {
          type: 'object',
          name: 'testimonial',
          title: 'Testimonial',
          fields: [
            defineField({
              name: 'quote',
              title: 'Quote',
              type: 'text',
              rows: 4,
              description: 'What the client said about your work.',
              validation: (rule) => rule.required().error('Every testimonial needs a quote'),
            }),
            defineField({
              name: 'author',
              title: 'Author Name',
              type: 'string',
              description: 'The name of the person giving the testimonial.',
              validation: (rule) => rule.required().error("Include the author's name"),
            }),
            defineField({
              name: 'role',
              title: 'Role / Company',
              type: 'string',
              description: 'Their job title or company (e.g., "CEO at Acme Inc").',
            }),
            defineField({
              name: 'avatar',
              title: 'Photo',
              type: 'image',
              description: 'Optional headshot or company logo.',
              options: {
                hotspot: true,
                accept: 'image/png,image/jpeg,image/webp',
              },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string',
                  description: 'Describe the image for accessibility.',
                }),
              ],
            }),
            defineField({
              name: 'rating',
              title: 'Star Rating',
              type: 'number',
              description: 'Optional 1-5 star rating.',
              options: {
                list: [
                  {title: '5 Stars', value: 5},
                  {title: '4 Stars', value: 4},
                  {title: '3 Stars', value: 3},
                  {title: '2 Stars', value: 2},
                  {title: '1 Star', value: 1},
                ],
              },
            }),
          ],
          preview: {
            select: {
              title: 'author',
              subtitle: 'role',
              media: 'avatar',
            },
            prepare({title, subtitle, media}) {
              return {
                title: title || 'Unnamed author',
                subtitle: subtitle || 'No role specified',
                media,
              }
            },
          },
        },
      ],
      validation: (rule) => rule.min(1).error('Add at least one testimonial'),
    }),
    defineField({
      name: 'style',
      title: 'Display Style',
      type: 'string',
      description: 'How should the testimonials be displayed?',
      options: {
        list: [
          {title: 'Cards (grid)', value: 'cards'},
          {title: 'Carousel (sliding)', value: 'carousel'},
          {title: 'Featured (large single)', value: 'featured'},
        ],
        layout: 'radio',
      },
      initialValue: 'cards',
    }),
    defineField({
      name: 'showRatings',
      title: 'Show Star Ratings',
      type: 'boolean',
      description: "Display star ratings if they've been set on testimonials.",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      items: 'items',
    },
    prepare({title, items}) {
      const count = items?.length || 0
      return {
        title: title || 'Testimonials Section',
        subtitle: `${count} testimonial${count !== 1 ? 's' : ''}`,
        media: StarIcon,
      }
    },
  },
})
