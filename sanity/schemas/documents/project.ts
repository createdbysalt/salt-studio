import {
  coreSearchFields,
  coreSearchGroup,
  pageSectionsField,
} from '@/sanity/schemas/shared/corePageFields'
import {DocumentIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {name: 'details', title: 'Details', default: true},
    {name: 'gallery', title: 'Gallery'},
    {name: 'sections', title: 'Case Study'},
    coreSearchGroup,
  ],
  fields: [
    defineField({
      name: 'projectType',
      title: 'Project type',
      type: 'string',
      group: 'details',
      description:
        'Standard = a concise entry. Case Study = the full long-form template. Controls how this project renders.',
      options: {
        list: [
          {title: 'Standard', value: 'standard'},
          {title: 'Case Study', value: 'case-study'},
        ],
        layout: 'radio',
      },
      initialValue: 'standard',
      validation: (rule) => rule.required().error('Pick how this project should render'),
    }),
    defineField({
      name: 'featured',
      title: 'Featured project',
      type: 'boolean',
      group: 'details',
      initialValue: false,
      description:
        'Turn on to highlight this project (home showcase and featured Work views). Works for both Standard and Case Study.',
    }),
    defineField({
      name: 'comingSoon',
      title: 'Coming soon',
      type: 'boolean',
      group: 'details',
      initialValue: false,
      description:
        'Turn on to show this project on the Work grid as a “Coming soon” card — not clickable, and its project page stays unpublished to visitors. Turn off when the case study is ready to open.',
    }),
    defineField({
      name: 'hidden',
      title: 'Hide from website',
      type: 'boolean',
      group: 'details',
      initialValue: false,
      description:
        'Turn on to remove this project from every public surface — Work grid, home, related rails, sitemap, and the project page itself. The document stays in Studio so you can keep editing.',
    }),
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string',
      group: 'details',
      description: 'The name of this project. Shows as the main headline.',
      validation: (rule) => rule.required().error('Every project needs a title'),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      group: 'search',
      description: 'The URL path for this project. Click Generate to create from title.',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) =>
        rule.required().error('URL slug is required for the project to be accessible'),
    }),
    defineField({
      name: 'overview',
      title: 'Outcome summary',
      type: 'array',
      group: 'details',
      description:
        'The one-sentence outcome that sells the project — shown on work cards and in search results. Lead with what changed for the client, not what was made.',
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
          .error('Summary is required for search engines and project listings')
          .max(155)
          .warning('Longer summaries get cut off in search results'),
    }),
    defineField({
      name: 'context',
      title: 'Context (legacy)',
      type: 'text',
      rows: 4,
      group: 'details',
      hidden: true,
      description: 'Legacy — replaced by Statement sections in the Case Study tab.',
    }),
    defineField({
      name: 'btsNote',
      title: 'BTS note (legacy)',
      type: 'text',
      rows: 3,
      group: 'details',
      hidden: true,
      description: 'Legacy — replaced by Media sections in the Case Study tab.',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      group: 'details',
      description:
        'Hero still when no hero video is set, plus the Work grid poster. Recommended: 1600×900px or wider.',
      options: {
        hotspot: true,
        accept: 'image/png,image/jpeg,image/webp,image/gif',
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Describe the image for screen readers.',
          validation: (rule) => rule.warning('Alt text improves accessibility and SEO'),
        }),
      ],
      validation: (rule) =>
        rule.warning(
          'Add a cover image before launch — it appears on project cards and as the video poster',
        ),
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      group: 'gallery',
      description:
        'The project page media stack (right column beside the details). Add photos and videos, then drag to reorder. Prefer high-res stills (2400px+ wide) and 1080p+ video.',
      of: [
        defineArrayMember({type: 'projectGalleryPhoto', title: 'Photo'}),
        defineArrayMember({type: 'projectGalleryVideo', title: 'Video'}),
      ],
    }),
    defineField({
      name: 'btsImages',
      title: 'BTS (legacy)',
      type: 'array',
      group: 'details',
      hidden: true,
      description: 'Legacy — replaced by Media sections in the Case Study tab.',
      of: [
        defineArrayMember({type: 'projectGalleryRowOne', title: '1 column'}),
        defineArrayMember({type: 'projectGalleryRowTwo', title: '2 columns'}),
      ],
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      group: 'details',
      description:
        'Optional. A short video for the hero and card hover — a Vimeo page URL (e.g. https://vimeo.com/123) or a direct HTTPS MP4 link. Projects without one show the cover image instead.',
      validation: (rule) =>
        rule.uri({allowRelative: false, scheme: ['https']}).warning('Use an HTTPS video URL'),
    }),
    defineField({
      name: 'role',
      title: 'Salt’s Role (legacy)',
      type: 'string',
      group: 'details',
      hidden: true,
      description: 'Legacy — replaced by the Deliverables list below.',
    }),
    defineField({
      name: 'deliverables',
      title: 'Deliverables',
      type: 'array',
      group: 'details',
      description:
        'Exactly what Salt delivered, as short items for the project meta panel — e.g. “Brand Identity”, “Web Design & Build”, “Copywriting”. Specific beats vague.',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) =>
        rule.min(1).warning('List what was delivered — it’s the strongest proof on the page'),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'string',
      group: 'details',
      description: 'When the project ran. Allows ranges — e.g. "2025", "2021–22", "2016–19".',
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'reference',
      group: 'details',
      to: [{type: 'client'}],
      description: 'The brand this project was for. Pick from the Clients list, or add a new one.',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      group: 'details',
      description:
        'Pick all categories this project belongs to. These power the Work page filter bar and the category landing pages (e.g., /work/footwear, /work/high-speed). A project can belong to more than one.',
      of: [{type: 'reference', to: [{type: 'workCategory'}]}],
      validation: (rule) =>
        rule
          .min(1)
          .warning(
            'Pick at least one category so this project appears on the Work page filter views',
          ),
    }),
    defineField({
      name: 'stack',
      title: 'Stack',
      type: 'array',
      group: 'details',
      description:
        'The languages, frameworks, and platforms this project was built with — shown as “Built with …” on the project page. Pick from Dynamic Content → Capabilities. Headline items only, not every dev tool.',
      of: [{type: 'reference', to: [{type: 'capability'}]}],
    }),
    defineField({
      name: 'site',
      title: 'Live Site URL',
      type: 'url',
      group: 'details',
      description:
        'Link to the live project (if public). When set, shows a button beside Watch film on the project page.',
    }),
    defineField({
      name: 'siteButtonLabel',
      title: 'Live Site Button Label',
      type: 'string',
      group: 'details',
      description:
        'Text on the Live Site button. Defaults to “Visit site”. A → is added automatically (same as Watch film).',
      hidden: ({document}) => !document?.site,
      validation: (rule) => rule.max(40).warning('Keep button labels short — under 40 characters'),
    }),
    pageSectionsField(
      [
        {type: 'projectStatementSection', title: 'Statement'},
        {type: 'projectScopeSection', title: 'Scope'},
        {type: 'projectMediaSection', title: 'Media'},
        {type: 'projectQuoteSection', title: 'Quote'},
        {type: 'projectStatsSection', title: 'Results'},
        {type: 'projectCreditsSection', title: 'Credits'},
      ],
      {
        uniqueTypes: false,
        description:
          'The case-study body, top to bottom. Mix and repeat freely — the conversion shape is: a few labeled Statements telling the story, Scope listing exactly what was delivered, Media doing the showing, real Quotes and Results (under-title stats) only when they exist. Drag to reorder; toggle to hide. The closing “book a call” CTA renders automatically on every project.',
      },
    ),
    defineField({
      name: 'brief',
      title: 'The brief (legacy)',
      type: 'text',
      rows: 3,
      group: 'details',
      hidden: true,
      description: 'Legacy — replaced by Statement sections in the Case Study tab.',
    }),
    defineField({
      name: 'approach',
      title: 'The approach (legacy)',
      type: 'text',
      rows: 3,
      group: 'details',
      hidden: true,
      description: 'Legacy — replaced by Statement sections in the Case Study tab.',
    }),
    defineField({
      name: 'result',
      title: 'The result (legacy)',
      type: 'text',
      rows: 3,
      group: 'details',
      hidden: true,
      description: 'Legacy — replaced by Statement sections in the Case Study tab.',
    }),
    defineField({
      name: 'showTestimonials',
      title: 'Show testimonials',
      type: 'boolean',
      group: 'sections',
      initialValue: true,
      description:
        'When on, shows any Testimonial documents linked to this project (set the Project field on a Testimonial to connect it). For an inline quote, use a Quote section instead.',
    }),
    defineField({
      name: 'relatedProjects',
      title: 'Related projects',
      type: 'array',
      group: 'details',
      description:
        'Other projects to surface alongside this one (the CSV "RELATED" column). Pick from existing projects.',
      of: [{type: 'reference', to: [{type: 'project'}]}],
    }),
    ...coreSearchFields(),
  ],
  orderings: [
    {
      title: 'Type — Case Studies first',
      name: 'caseStudiesFirst',
      by: [
        {field: 'projectType', direction: 'asc'},
        {field: 'title', direction: 'asc'},
      ],
    },
    {
      title: 'Type — Standard first',
      name: 'standardFirst',
      by: [
        {field: 'projectType', direction: 'desc'},
        {field: 'title', direction: 'asc'},
      ],
    },
    {
      title: 'Title (A–Z)',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
    {
      title: 'Year (newest first)',
      name: 'yearDesc',
      by: [
        {field: 'year', direction: 'desc'},
        {field: 'title', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      projectType: 'projectType',
      featured: 'featured',
      hidden: 'hidden',
      year: 'year',
      client: 'client.name',
      media: 'coverImage',
    },
    prepare({title, projectType, featured, hidden, year, client, media}) {
      const type = projectType === 'case-study' ? 'Case Study' : 'Standard'
      const details = [client, year].filter(Boolean).join(' · ')
      const status = hidden ? 'Hidden' : type
      return {
        title: `${featured ? '★ ' : ''}${title || 'Untitled project'}`,
        subtitle: details ? `${status} — ${details}` : status,
        media,
      }
    },
  },
})
