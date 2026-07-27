import {DocumentIcon, ImageIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  type: 'document',
  name: 'page',
  title: 'Page',
  icon: DocumentIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Page Title',
      group: 'content',
      description: 'The headline for this page. Also used in browser tabs.',
      validation: (rule) => rule.required().error('Every page needs a title'),
    }),
    defineField({
      type: 'slug',
      name: 'slug',
      title: 'URL Slug',
      group: 'seo',
      description:
        'The URL path for this page (e.g., "about" becomes /about). Click Generate to create from title.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) =>
        rule.required().error('URL slug is required for the page to be accessible'),
    }),
    defineField({
      name: 'overview',
      title: 'Page Summary',
      type: 'array',
      group: 'seo',
      description:
        'A brief summary shown below the title and in Google search results. Keep under 155 characters for best results.',
      of: [
        defineArrayMember({
          lists: [],
          marks: {
            annotations: [],
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
          },
          styles: [],
          type: 'block',
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .error('Summary helps visitors and search engines understand the page')
          .max(155)
          .warning('Longer summaries get cut off in search results'),
    }),
    defineField({
      type: 'array',
      name: 'body',
      title: 'Page Content',
      group: 'content',
      description: 'The main content of the page. You can add text, images, and timeline sections.',
      of: [
        // Paragraphs
        defineArrayMember({
          type: 'block',
          marks: {
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'Url',
                  },
                ],
              },
            ],
          },
          styles: [],
        }),
        // Custom blocks
        defineArrayMember({
          name: 'hero',
          type: 'hero',
        }),
        defineArrayMember({
          name: 'timeline',
          type: 'timeline',
        }),
        defineArrayMember({
          name: 'faq',
          type: 'faq',
        }),
        defineArrayMember({
          name: 'testimonials',
          type: 'testimonials',
        }),
        defineArrayMember({
          name: 'ctaRef',
          title: 'Call to Action',
          type: 'reference',
          to: [{type: 'callToAction'}],
        }),
        defineArrayMember({
          name: 'logoCarousel',
          type: 'logoCarousel',
        }),
        defineArrayMember({
          name: 'contactForm',
          type: 'contactForm',
        }),
        defineField({
          type: 'image',
          icon: ImageIcon,
          name: 'image',
          title: 'Image',
          options: {
            hotspot: true,
            accept: 'image/png,image/jpeg,image/webp,image/gif',
          },
          preview: {
            select: {
              media: 'asset',
              title: 'caption',
            },
          },
          fields: [
            defineField({
              title: 'Caption',
              name: 'caption',
              type: 'string',
            }),
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
              description:
                'Describe the image for screen readers and SEO. Falls back to caption if not set.',
              validation: (rule) => rule.warning('Alt text improves accessibility and SEO'),
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({title}) {
      return {
        subtitle: 'Page',
        title,
      }
    },
  },
})
