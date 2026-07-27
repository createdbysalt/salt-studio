import {DocumentTextIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const LEGAL_PAGE_TYPES = [
  {title: 'Privacy Policy', value: 'privacy'},
  {title: 'Terms of Service', value: 'terms'},
  {title: 'Cookie Policy', value: 'cookies'},
  {title: 'Accessibility Statement', value: 'accessibility'},
  {title: 'Disclaimer', value: 'disclaimer'},
  {title: 'Custom', value: 'custom'},
] as const

/**
 * Maps pageType values to default slugs.
 * Custom pages use title for slug generation.
 */
const PAGE_TYPE_SLUGS: Record<string, string> = {
  privacy: 'privacy-policy',
  terms: 'terms-of-service',
  cookies: 'cookie-policy',
  accessibility: 'accessibility-statement',
  disclaimer: 'disclaimer',
}

export default defineType({
  name: 'legalPage',
  title: 'Legal Page',
  type: 'document',
  icon: DocumentTextIcon,
  description:
    'Appears automatically in the site footer bottom strip (Privacy · Terms · Cookies · Accessibility). Short footer labels come from Page Type.',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'meta', title: 'Metadata'},
  ],
  fields: [
    defineField({
      name: 'pageType',
      title: 'Page Type',
      type: 'string',
      group: 'content',
      options: {
        list: LEGAL_PAGE_TYPES.map((t) => t),
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      description: 'The page title. For standard page types, this overrides the default title.',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'meta',
      description:
        'URL path for this page. For standard types, auto-generates from page type. For custom, generates from title.',
      options: {
        source: (doc) => {
          const pageType = doc.pageType as string
          if (pageType && pageType !== 'custom' && PAGE_TYPE_SLUGS[pageType]) {
            return PAGE_TYPE_SLUGS[pageType]
          }
          return (doc.title as string) || ''
        },
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'overview',
      title: 'Overview',
      type: 'text',
      rows: 3,
      group: 'meta',
      description: 'Brief description for SEO meta tags. Max 155 characters.',
      validation: (rule) => rule.max(155),
    }),

    // Content source toggle
    defineField({
      name: 'contentSource',
      title: 'Content Source',
      type: 'string',
      group: 'content',
      description: 'How is this policy managed?',
      options: {
        list: [
          {title: 'Salt Studio Managed (auto-updating)', value: 'managed'},
          {title: 'Custom content', value: 'custom'},
        ],
        layout: 'radio',
      },
      initialValue: 'managed',
      validation: (rule) => rule.required(),
    }),

    // Managed policy URL
    defineField({
      name: 'policyUrl',
      title: 'Policy URL',
      type: 'url',
      group: 'content',
      description:
        'The policy URL provided by Salt Studio. This policy auto-updates when regulations change.',
      hidden: ({document}) => document?.contentSource !== 'managed',
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document
          if (doc?.contentSource === 'managed' && !value) {
            return 'Policy URL is required for Salt Studio managed policies'
          }
          return true
        }),
    }),

    // Introduction text (optional, shown before policy content)
    defineField({
      name: 'introText',
      title: 'Introduction',
      type: 'array',
      group: 'content',
      description: 'Optional intro text shown before the policy content.',
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

    // Custom content (only for custom source)
    defineField({
      name: 'content',
      title: 'Policy Content',
      type: 'array',
      group: 'content',
      description: 'The main policy content. Only used when Content Source is "Custom".',
      hidden: ({document}) => document?.contentSource !== 'custom',
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
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'Heading 2', value: 'h2'},
            {title: 'Heading 3', value: 'h3'},
            {title: 'Heading 4', value: 'h4'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
        }),
      ],
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document
          if (
            doc?.contentSource === 'custom' &&
            (!value || (Array.isArray(value) && value.length === 0))
          ) {
            return 'Content is required when using custom content source'
          }
          return true
        }),
    }),

    defineField({
      name: 'effectiveDate',
      title: 'Effective Date',
      type: 'date',
      group: 'meta',
      description: 'When this version of the policy takes effect.',
      options: {
        dateFormat: 'MMMM D, YYYY',
      },
    }),
    defineField({
      name: 'version',
      title: 'Version',
      type: 'string',
      group: 'meta',
      description: 'Version identifier (e.g., "2.1", "January 2026").',
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime',
      group: 'meta',
      description: 'When this document was last modified.',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      pageType: 'pageType',
      title: 'title',
      contentSource: 'contentSource',
      version: 'version',
    },
    prepare({pageType, title, contentSource, version}) {
      const typeLabel = LEGAL_PAGE_TYPES.find((t) => t.value === pageType)?.title || 'Legal Page'
      const displayTitle = title || typeLabel
      const source = contentSource === 'managed' ? '🔄 Managed' : '📝 Custom'
      const versionText = version ? `v${version}` : ''
      return {
        title: displayTitle,
        subtitle: [source, versionText].filter(Boolean).join(' · '),
        media: DocumentTextIcon,
      }
    },
  },
  orderings: [
    {
      title: 'Page Type',
      name: 'pageTypeAsc',
      by: [{field: 'pageType', direction: 'asc'}],
    },
    {
      title: 'Last Updated',
      name: 'lastUpdatedDesc',
      by: [{field: 'lastUpdated', direction: 'desc'}],
    },
  ],
})
