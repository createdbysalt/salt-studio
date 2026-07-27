import {BlockElementIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Hero Section Block
 *
 * A configurable hero section for pages. Supports:
 * - Headline and subheadline
 * - Optional eyebrow/badge text
 * - Background image or solid color
 * - Primary and secondary CTA buttons
 * - Multiple layout styles
 */
export default defineType({
  name: 'hero',
  title: 'Hero Section',
  type: 'object',
  icon: BlockElementIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'appearance', title: 'Appearance'},
    {name: 'actions', title: 'Actions'},
  ],
  fields: [
    // ==========================================================================
    // CONTENT GROUP
    // ==========================================================================
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow Text',
      type: 'string',
      group: 'content',
      description: 'Small text above the headline (e.g., "New Feature", "Limited Time").',
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      group: 'content',
      description: 'The main headline. Keep it punchy and benefit-focused.',
      validation: (rule) => rule.required().error('Every hero needs a headline'),
    }),
    defineField({
      name: 'subheadline',
      title: 'Subheadline',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Supporting text that expands on the headline. 1-2 sentences max.',
    }),

    // ==========================================================================
    // APPEARANCE GROUP
    // ==========================================================================
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      group: 'appearance',
      description:
        'Optional background image. If set, text will have a dark overlay for readability.',
      options: {
        hotspot: true,
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
      name: 'style',
      title: 'Layout Style',
      type: 'string',
      group: 'appearance',
      description: 'How the hero section should be displayed.',
      options: {
        list: [
          {title: 'Centered (default)', value: 'centered'},
          {title: 'Left-aligned', value: 'left'},
          {title: 'Split (text left, image right)', value: 'split'},
        ],
        layout: 'radio',
      },
      initialValue: 'centered',
    }),
    defineField({
      name: 'size',
      title: 'Height',
      type: 'string',
      group: 'appearance',
      description: 'How tall the hero section should be.',
      options: {
        list: [
          {title: 'Small', value: 'small'},
          {title: 'Medium (default)', value: 'medium'},
          {title: 'Large (full viewport)', value: 'large'},
        ],
        layout: 'radio',
      },
      initialValue: 'medium',
    }),

    // ==========================================================================
    // ACTIONS GROUP
    // ==========================================================================
    defineField({
      name: 'buttons',
      title: 'Call-to-Action Buttons',
      type: 'array',
      group: 'actions',
      description: 'Add up to 2 buttons. The first is styled as primary.',
      validation: (rule) => rule.max(2).warning('Heroes work best with 1-2 buttons'),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'button',
          title: 'Button',
          fields: [
            defineField({
              name: 'label',
              title: 'Button Text',
              type: 'string',
              validation: (rule) => rule.required().error('Button needs text'),
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'string',
              description: 'URL or path (e.g., /contact or https://example.com)',
              validation: (rule) => rule.required().error('Button needs a destination'),
            }),
            defineField({
              name: 'style',
              title: 'Style',
              type: 'string',
              options: {
                list: [
                  {title: 'Primary (filled)', value: 'primary'},
                  {title: 'Secondary (outlined)', value: 'secondary'},
                ],
                layout: 'radio',
              },
              initialValue: 'primary',
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'link',
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'headline',
      subtitle: 'subheadline',
      media: 'backgroundImage',
    },
    prepare({title, subtitle, media}) {
      return {
        title: title || 'Hero Section',
        subtitle: subtitle ? subtitle.substring(0, 50) + '...' : 'No subheadline',
        media: media || BlockElementIcon,
      }
    },
  },
})
