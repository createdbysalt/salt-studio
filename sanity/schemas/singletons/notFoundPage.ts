import {SearchIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * 404 Not Found page content.
 * Singleton — only one instance exists.
 *
 * This content is fetched by app/not-found.tsx with a fallback
 * in case Sanity is unreachable.
 */
export default defineType({
  name: 'notFoundPage',
  title: '404 Page',
  type: 'document',
  icon: SearchIcon,
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'Main headline shown on the 404 page.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'array',
      description: 'Helpful message explaining what happened and what to do next.',
      of: [
        defineArrayMember({
          type: 'block',
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  }),
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Button Text',
      type: 'string',
      description: 'Text for the primary call-to-action button (e.g., "Go back home").',
    }),
    defineField({
      name: 'ctaLink',
      title: 'CTA Link',
      type: 'string',
      description: 'Where the CTA button goes. Defaults to "/" (home).',
      initialValue: '/',
    }),
    defineField({
      name: 'secondaryCtaText',
      title: 'Secondary CTA Text',
      type: 'string',
      description: 'Optional second button label (e.g. "Browse the work →").',
    }),
    defineField({
      name: 'secondaryCtaLink',
      title: 'Secondary CTA Link',
      type: 'string',
      description: 'Where the secondary CTA goes (e.g. "/work").',
    }),
    defineField({
      name: 'footerTagline',
      title: 'Footer Tagline',
      type: 'string',
      description: 'Small mono line below the CTAs.',
    }),
    defineField({
      name: 'suggestedLinks',
      title: 'Suggested Links',
      type: 'array',
      description: 'Optional links to suggest to visitors.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'home'}, {type: 'page'}, {type: 'project'}],
        }),
      ],
      validation: (rule) => rule.max(5),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: '404 Page',
        subtitle: 'Not Found page content',
        media: SearchIcon,
      }
    },
  },
})
