import {
  enabledField,
  sectionInternalNameField,
  sectionPreview,
} from '@/sanity/schemas/shared/sectionInternalName'
import {
  BulbOutlineIcon,
  HeartIcon,
  SparklesIcon,
  StarIcon,
  UserIcon,
  UsersIcon,
} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * About page sections (MFI-style page builder).
 * Live in the `sections` array on `aboutPage`; drag to reorder, toggle to hide.
 * Copy source: salt-studio-knowledge-base/studio/website/copy/about.md.
 * The page is BLOCKED until the [GABRIELLA] founder beats are filled — keep it
 * a draft until then.
 */

export const aboutOpeningSection = defineType({
  name: 'aboutOpeningSection',
  title: 'Opening Statement',
  type: 'object',
  icon: SparklesIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Opening Statement'),
    defineField({
      name: 'line1',
      title: 'Line one',
      type: 'string',
      description: 'First line of the opening statement, set in display type.',
    }),
    defineField({
      name: 'line2',
      title: 'Line two',
      type: 'string',
      description: 'Second line of the opening statement.',
    }),
    defineField({
      name: 'body',
      title: 'Follow-on paragraph',
      type: 'text',
      rows: 3,
      description: 'The paragraph under the two display lines.',
    }),
  ],
  preview: sectionPreview('line1', 'Opening Statement'),
})

export const aboutStorySection = defineType({
  name: 'aboutStorySection',
  title: 'The Story',
  type: 'object',
  icon: UserIcon,
  fields: [
    enabledField,
    sectionInternalNameField('The Story'),
    defineField({
      name: 'body',
      title: 'Story',
      type: 'array',
      description:
        'The founder story, paragraph by paragraph. Lines in [GABRIELLA: …] brackets are placeholders only you can fill — the page stays a draft until they’re replaced with the real thing.',
      of: [
        defineArrayMember({
          type: 'block',
          lists: [],
          marks: {
            annotations: [],
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
          },
          styles: [],
        }),
      ],
    }),
    defineField({
      name: 'offHoursLine',
      title: 'Off-hours line',
      type: 'text',
      rows: 3,
      description: 'The human-texture line (beach, Matheus, Milo, podcasts) — sits near the photo.',
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      description:
        'One real photo — with Milo if possible; beach or workspace both work. Beats any portrait.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the photo for screen readers and SEO.',
          validation: (rule) => rule.warning('Alt text improves accessibility and SEO'),
        }),
      ],
    }),
  ],
  preview: sectionPreview('offHoursLine', 'The Story'),
})

export const aboutSmallnessSection = defineType({
  name: 'aboutSmallnessSection',
  title: 'Small on Purpose',
  type: 'object',
  icon: HeartIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Small on Purpose'),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      initialValue: 'Small on purpose',
      description: 'Heading of the smallness-as-focus section.',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 4,
      description: 'Why a few projects a year is the product, not a limitation.',
    }),
  ],
  preview: sectionPreview('headline', 'Small on Purpose'),
})

export const aboutConvictionsSection = defineType({
  name: 'aboutConvictionsSection',
  title: 'How We Work',
  type: 'object',
  icon: BulbOutlineIcon,
  fields: [
    enabledField,
    sectionInternalNameField('How We Work'),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      initialValue: 'How we work',
      description: 'Heading of the convictions section.',
    }),
    defineField({
      name: 'lines',
      title: 'Conviction lines',
      type: 'array',
      description:
        'Three or four short conviction lines — not a values grid. e.g. “Reveal, don’t impose.”',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.max(4).warning('Three or four lines is plenty'),
    }),
    defineField({
      name: 'closingLine',
      title: 'Closing line',
      type: 'string',
      description: 'The line after the convictions, e.g. “If a thing adds noise, it goes.”',
    }),
  ],
  preview: sectionPreview('headline', 'How We Work'),
})

export const aboutProductSection = defineType({
  name: 'aboutProductSection',
  title: 'Salt Product Bridge',
  type: 'object',
  icon: UsersIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Salt Product Bridge'),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 4,
      description: 'The quiet bridge to the Salt product.',
    }),
    defineField({
      name: 'linkLabel',
      title: 'Link label',
      type: 'string',
      initialValue: 'Join the waitlist',
      description: 'The quiet inline link at the end of the paragraph.',
    }),
  ],
  preview: sectionPreview('body', 'Salt Product Bridge'),
})

export const aboutClosingSection = defineType({
  name: 'aboutClosingSection',
  title: 'Closing CTA',
  type: 'object',
  icon: StarIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Closing CTA'),
    defineField({
      name: 'body',
      title: 'Lead line',
      type: 'string',
      description:
        'The soft lead-in, e.g. “If this sounds like your kind of partner — let’s talk.”',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA button label',
      type: 'string',
      initialValue: 'Book a discovery call',
      description: 'Text on the closing button. It links to the contact page.',
      validation: (rule) => rule.max(40).warning('Keep this short — it sits in a button'),
    }),
    defineField({
      name: 'microcopy',
      title: 'Microcopy',
      type: 'string',
      description: 'Small reassurance line under the button. No pitch — a clear next step.',
    }),
  ],
  preview: sectionPreview('body', 'Closing CTA'),
})
