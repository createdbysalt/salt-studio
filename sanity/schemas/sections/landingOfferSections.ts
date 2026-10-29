import {
  enabledField,
  sectionInternalNameField,
  sectionPreview,
} from '@/sanity/schemas/shared/sectionInternalName'
import {
  ChartUpwardIcon,
  CommentIcon,
  ImagesIcon,
  ListIcon,
  PlayIcon,
  TagIcon,
  TextIcon,
  TransferIcon,
  UserIcon,
  UsersIcon,
  VideoIcon,
} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Offer landing sections ("Leave it to us" layout).
 *
 * A second family of blocks for the `landingPage` builder, modeled on the
 * video-first agency page pattern: video → headline → client grid → services
 * list → statement band → stats → before/after → reels → founder → quotes →
 * packages → results gallery → FAQ. Every button still uses the page-level
 * ctaLabel / ctaLink, so sections carry copy only.
 */

const imageWithAlt = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    type: 'image',
    description,
    options: {hotspot: true},
    fields: [
      defineField({
        name: 'alt',
        title: 'Alt text',
        type: 'string',
        description: 'Describe the image for screen readers and SEO.',
      }),
    ],
  })

export const lpVideoHeroSection = defineType({
  name: 'lpVideoHeroSection',
  title: 'Video hero',
  type: 'object',
  icon: PlayIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Video hero'),
    defineField({
      name: 'videoUrl',
      title: 'Video',
      type: 'url',
      description:
        'A Vimeo page URL, a YouTube URL, or a direct HTTPS MP4 link. Plays in place when the visitor taps the poster.',
      validation: (rule) =>
        rule.uri({allowRelative: false, scheme: ['https']}).warning('Use an HTTPS video URL'),
    }),
    imageWithAlt(
      'poster',
      'Poster image',
      'Shown before the video plays. Square or 4:5 reads best. Keep it under 300 KB.',
    ),
    defineField({
      name: 'posterTitle',
      title: 'Title over the poster',
      type: 'string',
      description: 'Big words on top of the poster, e.g. "First impression". Optional.',
    }),
    defineField({
      name: 'headline',
      title: 'Headline (H1)',
      type: 'text',
      rows: 2,
      description:
        'The one H1 on the page. Two short lines. Use a line break to control where it wraps.',
      validation: (rule) => rule.required().error('The hero needs a headline'),
    }),
    defineField({
      name: 'ctaText',
      title: 'Highlighted link text',
      type: 'string',
      description:
        'The red highlighted line under the headline. It links to the page button link, e.g. "Leave it to us."',
      initialValue: 'Leave it to us.',
    }),
  ],
  preview: sectionPreview('headline', 'Video hero'),
})

export const lpClientGridSection = defineType({
  name: 'lpClientGridSection',
  title: 'Client grid',
  type: 'object',
  icon: UsersIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Client grid'),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Proud to have worked with:',
    }),
    defineField({
      name: 'clients',
      title: 'Clients',
      type: 'array',
      description:
        'Nine reads as a full grid on desktop. Each gets a round image and a two-line category label under it.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'lpClientTile',
          title: 'Client',
          fields: [
            imageWithAlt('image', 'Logo or photo', 'Cropped to a circle. Square images work best.'),
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              description: 'Used as alt text and as the fallback initials when there is no image.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Category label',
              type: 'string',
              description: 'Two short words, e.g. "Youth conference" or "National church network".',
            }),
          ],
          preview: {select: {title: 'name', subtitle: 'label', media: 'image'}},
        }),
      ],
      validation: (rule) => rule.max(12),
    }),
    defineField({
      name: 'featuredLead',
      title: 'Featured-in lead line',
      type: 'string',
      description: 'Small line above the big names, e.g. "Work covered by". Leave empty to hide.',
    }),
    defineField({
      name: 'featuredNames',
      title: 'Featured-in names',
      type: 'string',
      description: 'Big display text, e.g. "Exame · Veja".',
    }),
  ],
  preview: sectionPreview('title', 'Client grid'),
})

export const lpServicesListSection = defineType({
  name: 'lpServicesListSection',
  title: 'Services list',
  type: 'object',
  icon: ListIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Services list'),
    defineField({name: 'label', title: 'Pill label', type: 'string', initialValue: 'Our services'}),
    defineField({
      name: 'items',
      title: 'Services',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'lpServiceRow',
          title: 'Service',
          fields: [
            imageWithAlt('image', 'Round image'),
            defineField({
              name: 'titleTop',
              title: 'Title, first line',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'titleBottom',
              title: 'Title, second line (italic)',
              type: 'string',
            }),
            defineField({
              name: 'blurb',
              title: 'One line under the title',
              type: 'string',
              description: 'Optional. Keep it to one sentence.',
            }),
          ],
          preview: {select: {title: 'titleTop', subtitle: 'titleBottom', media: 'image'}},
        }),
      ],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: 'showButton',
      title: 'Show the button under the list?',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: sectionPreview('label', 'Services list'),
})

export const lpStatementSection = defineType({
  name: 'lpStatementSection',
  title: 'Statement band',
  type: 'object',
  icon: TextIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Statement band'),
    defineField({
      name: 'text',
      title: 'Statement',
      type: 'string',
      description:
        'One line, shown huge on a full-width ink band. e.g. "Not just clicks. Customers."',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: sectionPreview('text', 'Statement band'),
})

export const lpStatsSection = defineType({
  name: 'lpStatsSection',
  title: 'Big numbers',
  type: 'object',
  icon: ChartUpwardIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Big numbers'),
    defineField({
      name: 'stats',
      title: 'Numbers',
      type: 'array',
      description: 'Three reads best. Only verified figures.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'lpStat',
          title: 'Number',
          fields: [
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string',
              description: 'e.g. "$3.6M" or "70+".',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'e.g. "paid media managed".',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {select: {title: 'value', subtitle: 'label'}},
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
  ],
  preview: {
    select: {internalName: 'internalName', first: 'stats.0.value', enabled: 'enabled'},
    prepare({internalName, first, enabled}) {
      return {
        title: first ? `${first} …` : internalName || 'Big numbers',
        subtitle: enabled === false ? 'Big numbers · Hidden' : 'Big numbers',
      }
    },
  },
})

export const lpBeforeAfterSection = defineType({
  name: 'lpBeforeAfterSection',
  title: 'Before / after',
  type: 'object',
  icon: TransferIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Before / after'),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      description:
        'Each row is a before card and an after card. Use screenshots when you have them; otherwise the numbers show as text.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'lpBeforeAfterRow',
          title: 'Row',
          fields: [
            defineField({
              name: 'name',
              title: 'Account or client',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'metric',
              title: 'What changed',
              type: 'string',
              description: 'e.g. "cost per lead" or "new visitors from the web".',
            }),
            defineField({
              name: 'before',
              title: 'Before',
              type: 'string',
              description: 'e.g. "$35"',
            }),
            defineField({name: 'after', title: 'After', type: 'string', description: 'e.g. "$25"'}),
            imageWithAlt('beforeImage', 'Before screenshot (optional)'),
            imageWithAlt('afterImage', 'After screenshot (optional)'),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description:
                'One honest line of context, e.g. "volume held at 1,500 to 2,000 leads a month".',
            }),
          ],
          preview: {select: {title: 'name', subtitle: 'metric'}},
        }),
      ],
      validation: (rule) => rule.max(6),
    }),
  ],
  preview: {
    select: {internalName: 'internalName', first: 'rows.0.name', enabled: 'enabled'},
    prepare({internalName, first, enabled}) {
      return {
        title: first ? `${first} …` : internalName || 'Before / after',
        subtitle: enabled === false ? 'Before / after · Hidden' : 'Before / after',
      }
    },
  },
})

export const lpReelsSection = defineType({
  name: 'lpReelsSection',
  title: 'Video tiles',
  type: 'object',
  icon: VideoIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Video tiles'),
    defineField({
      name: 'items',
      title: 'Videos',
      type: 'array',
      description: 'Four tiles. Each loops muted with a badge in the corner.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'lpReelTile',
          title: 'Video tile',
          fields: [
            defineField({
              name: 'videoUrl',
              title: 'Video',
              type: 'url',
              description:
                'Direct HTTPS MP4 link (loops muted). Vimeo and YouTube links show the poster only.',
            }),
            imageWithAlt('poster', 'Poster'),
            defineField({
              name: 'badge',
              title: 'Badge',
              type: 'string',
              description: 'Short, e.g. "+21% registrations". Shown in a red stamp.',
            }),
            defineField({
              name: 'href',
              title: 'Link (optional)',
              type: 'string',
              description: 'e.g. /projects/one-youth-conference',
            }),
          ],
          preview: {select: {title: 'badge', subtitle: 'videoUrl', media: 'poster'}},
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'buttonLabel',
      title: 'Button label',
      type: 'string',
      initialValue: 'Watch more',
    }),
    defineField({
      name: 'buttonHref',
      title: 'Button link',
      type: 'string',
      initialValue: '/work',
    }),
  ],
  preview: sectionPreview('buttonLabel', 'Video tiles'),
})

export const lpFounderSection = defineType({
  name: 'lpFounderSection',
  title: 'Meet the founder',
  type: 'object',
  icon: UserIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Meet the founder'),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Meet the founder',
    }),
    imageWithAlt('photo', 'Photo', 'Portrait, 4:5. Real photo only.'),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 8,
      description: 'First person. Separate paragraphs with a blank line.',
    }),
  ],
  preview: sectionPreview('heading', 'Meet the founder'),
})

export const lpQuotesSection = defineType({
  name: 'lpQuotesSection',
  title: 'Client quotes',
  type: 'object',
  icon: CommentIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Client quotes'),
    defineField({
      name: 'quotes',
      title: 'Quotes',
      type: 'array',
      description:
        'Real quotes only, with a name. The section stays hidden on the site until at least one is added.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'lpQuote',
          title: 'Quote',
          fields: [
            defineField({
              name: 'quote',
              title: 'Quote',
              type: 'text',
              rows: 4,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'author',
              title: 'Name',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'handle',
              title: 'Role, company or @handle',
              type: 'string',
            }),
            imageWithAlt('photo', 'Photo or logo', 'Cropped to a circle.'),
          ],
          preview: {select: {title: 'author', subtitle: 'quote', media: 'photo'}},
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
  ],
  preview: {
    select: {internalName: 'internalName', first: 'quotes.0.author', enabled: 'enabled'},
    prepare({internalName, first, enabled}) {
      return {
        title: first ? `Quote from ${first}` : internalName || 'Client quotes',
        subtitle: enabled === false ? 'Client quotes · Hidden' : 'Client quotes',
      }
    },
  },
})

export const lpPackagesSection = defineType({
  name: 'lpPackagesSection',
  title: 'Packages',
  type: 'object',
  icon: TagIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Packages'),
    defineField({name: 'label', title: 'Pill label', type: 'string', initialValue: 'Our packages'}),
    defineField({
      name: 'packages',
      title: 'Packages',
      type: 'array',
      description:
        'Three cards. Each has a name, one line, a feature list, a price and the page button.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'lpPackage',
          title: 'Package',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'One line',
              type: 'text',
              rows: 2,
            }),
            defineField({
              name: 'features',
              title: 'What is included',
              type: 'array',
              of: [defineArrayMember({type: 'string'})],
              validation: (rule) => rule.max(10),
            }),
            defineField({
              name: 'price',
              title: 'Price line',
              type: 'string',
              description: 'Exactly as it should read, e.g. "$2,500/mo".',
            }),
            defineField({
              name: 'note',
              title: 'Small note under the price',
              type: 'string',
              description: 'e.g. "Ad spend billed separately." Optional.',
            }),
          ],
          preview: {select: {title: 'name', subtitle: 'price'}},
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
  ],
  preview: sectionPreview('label', 'Packages'),
})

export const lpResultsGallerySection = defineType({
  name: 'lpResultsGallerySection',
  title: 'Results gallery',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Results gallery'),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'Big red line above the screenshots, e.g. "Want results like this?"',
      initialValue: 'Want results like this?',
    }),
    defineField({
      name: 'images',
      title: 'Screenshots',
      type: 'array',
      description:
        'Real dashboard screenshots: ad manager, analytics, registrations. Crop out anything private. Four to six.',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'alt', title: 'Alt text', type: 'string'}),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'e.g. "Meta Ads, 30 days".',
            }),
          ],
        }),
      ],
      validation: (rule) => rule.max(8),
    }),
    defineField({
      name: 'showButton',
      title: 'Show the button under the gallery?',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: sectionPreview('headline', 'Results gallery'),
})

/** Register in sanity.config.ts `schema.types` next to `landingSections`. */
export const landingOfferSections = [
  lpVideoHeroSection,
  lpClientGridSection,
  lpServicesListSection,
  lpStatementSection,
  lpStatsSection,
  lpBeforeAfterSection,
  lpReelsSection,
  lpFounderSection,
  lpQuotesSection,
  lpPackagesSection,
  lpResultsGallerySection,
]
