import {coreSearchFields, coreSearchGroup} from '@/sanity/schemas/shared/corePageFields'
import {DocumentIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {name: 'details', title: 'Details', default: true},
    {name: 'production', title: 'Production'},
    {name: 'caseStudy', title: 'Case Study'},
    {name: 'gallery', title: 'Gallery'},
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
      title: 'Director Statement',
      type: 'array',
      group: 'details',
      description:
        'The short paragraph that appears next to "Director" on the homepage video. Also used in search results. Keep it to 2-3 sentences.',
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
      title: 'Context',
      type: 'text',
      rows: 4,
      group: 'details',
      description:
        'The main project paragraph shown on the project page — what the project was and what Salt Studio did. Longer than the short summary above.',
    }),
    defineField({
      name: 'btsNote',
      title: 'BTS note',
      type: 'text',
      rows: 3,
      group: 'details',
      description:
        'Optional behind-the-scenes note for the BTS section on the project page (1–2 sentences).',
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
        'Build the project gallery as rows. Add a 1-column or 2-column row, then put a photo or video in each cell. Drag to reorder.',
      of: [
        defineArrayMember({type: 'projectGalleryRowOne', title: '1 column'}),
        defineArrayMember({type: 'projectGalleryRowTwo', title: '2 columns'}),
      ],
    }),
    defineField({
      name: 'btsImages',
      title: 'BTS',
      type: 'array',
      group: 'gallery',
      description:
        'Behind-the-scenes gallery — same as above: 1- or 2-column rows of photos or videos. Pair with the BTS note in Details.',
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
        'Homepage hero video. Paste a Vimeo page URL (e.g. https://vimeo.com/123) or a direct HTTPS MP4 link. Projects without a video never appear in the hero.',
      validation: (rule) =>
        rule.uri({allowRelative: false, scheme: ['https']}).warning('Use an HTTPS video URL'),
    }),
    defineField({
      name: 'role',
      title: 'Your Role',
      type: 'string',
      group: 'production',
      description:
        'The label shown above the Director Statement on the homepage (e.g. "Director"). Leave as "Director" unless your role was different on this project.',
      initialValue: 'Director',
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
      name: 'services',
      title: 'Services',
      type: 'array',
      group: 'production',
      description:
        'The disciplines Salt Studio handled on this project (e.g. Production, Cinematography, Color). Pick from the Services list.',
      of: [{type: 'reference', to: [{type: 'service'}]}],
    }),
    defineField({
      name: 'cameras',
      title: 'Cameras',
      type: 'array',
      group: 'production',
      description:
        'Camera(s) used on this project. Pick from the Equipment → Cameras list. Shown in the technical info block on the homepage hero.',
      of: [{type: 'reference', to: [{type: 'camera'}]}],
    }),
    defineField({
      name: 'lenses',
      title: 'Lenses',
      type: 'array',
      group: 'production',
      description:
        'Lens(es) used on this project. Pick from the Equipment → Lenses list. Shown in the technical info block on the homepage hero.',
      of: [{type: 'reference', to: [{type: 'lens'}]}],
    }),
    defineField({
      name: 'lighting',
      title: 'Lighting',
      type: 'array',
      group: 'production',
      description:
        'Lighting used on this project. Pick from the Equipment → Lights list. Shown in the technical info block on the homepage hero.',
      of: [{type: 'reference', to: [{type: 'light'}]}],
    }),
    defineField({
      name: 'rigging',
      title: 'Rigging',
      type: 'array',
      group: 'production',
      description: 'Rigging used on this project. Pick from the Equipment → Rigging list.',
      of: [{type: 'reference', to: [{type: 'rigging'}]}],
    }),
    defineField({
      name: 'artDepartment',
      title: 'Art Department',
      type: 'array',
      group: 'production',
      description:
        'Art department capabilities used on this project. Pick from the Equipment → Art Department list.',
      of: [{type: 'reference', to: [{type: 'artDepartment'}]}],
    }),
    defineField({
      name: 'frameRate',
      title: 'Frame rate',
      type: 'string',
      group: 'production',
      description:
        'Optional. The frame-rate line in the craft callout (e.g. "Up to 200 fps", "1,000+ fps"). Leave blank if not relevant.',
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
    defineField({
      name: 'brief',
      title: 'The brief',
      type: 'text',
      rows: 3,
      group: 'caseStudy',
      hidden: ({document}) => document?.projectType !== 'case-study',
      description: 'Case study only. One paragraph on what the client came in with.',
    }),
    defineField({
      name: 'approach',
      title: 'The approach',
      type: 'text',
      rows: 3,
      group: 'caseStudy',
      hidden: ({document}) => document?.projectType !== 'case-study',
      description: 'Case study only. One paragraph on how Salt Studio solved it.',
    }),
    defineField({
      name: 'result',
      title: 'The result',
      type: 'text',
      rows: 3,
      group: 'caseStudy',
      hidden: ({document}) => document?.projectType !== 'case-study',
      description: 'Case study only. A short paragraph on the outcome, plus an optional metric.',
    }),
    defineField({
      name: 'showTestimonials',
      title: 'Show testimonials',
      type: 'boolean',
      group: 'caseStudy',
      hidden: ({document}) => document?.projectType !== 'case-study',
      initialValue: true,
      description:
        'Case study only. When on, shows any Testimonials linked to this project — set the Project field on a Testimonial document to connect it. Turn off to hide them.',
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
      year: 'year',
      client: 'client.name',
      media: 'coverImage',
    },
    prepare({title, projectType, featured, year, client, media}) {
      const type = projectType === 'case-study' ? 'Case Study' : 'Standard'
      const details = [client, year].filter(Boolean).join(' · ')
      return {
        title: `${featured ? '★ ' : ''}${title || 'Untitled project'}`,
        subtitle: details ? `${type} — ${details}` : type,
        media,
      }
    },
  },
})
