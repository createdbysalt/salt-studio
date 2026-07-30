import {coreSearchFields, coreSearchGroup} from '@/sanity/schemas/shared/corePageFields'
import {DocumentsIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

// Top-level radios drive which follow-up fields show. `parent` on a singleton's
// root fields is the document itself. Mirrors the `home` singleton selectors.
type WorkPageParent = {projectSource?: string; pillSource?: string}
const isManualProjects = (parent: unknown) => (parent as WorkPageParent)?.projectSource === 'manual'
const isManualPills = (parent: unknown) => (parent as WorkPageParent)?.pillSource === 'manual'

export default defineType({
  name: 'workPage',
  title: 'Work',
  type: 'document',
  icon: DocumentsIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'grid', title: 'Projects & Filters'},
    coreSearchGroup,
  ],
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      group: 'content',
      description: 'Main H1 on the Work index page (/work).',
      initialValue: 'All Projects',
    }),
    defineField({
      name: 'subhead',
      title: 'Subhead',
      type: 'text',
      rows: 2,
      group: 'content',
      description: 'Supporting line below the headline.',
      initialValue: 'Filter by specialty — or scroll the whole thing.',
    }),

    // ==========================================================================
    // PROJECT GRID — which projects show, in what order
    // ==========================================================================
    defineField({
      name: 'projectSource',
      title: 'How to order the project grid',
      type: 'string',
      group: 'grid',
      description:
        'Auto modes show every project that has a slug. Pick manually to hand-choose the exact projects and drag them into the order you want.',
      options: {
        list: [
          {title: 'Automatically — featured first, then by year', value: 'featured'},
          {title: 'Automatically — newest first', value: 'newest'},
          {title: 'Automatically — A–Z by title', value: 'az'},
          {title: 'Pick manually & hand-order', value: 'manual'},
        ],
        layout: 'radio',
      },
      initialValue: 'featured',
    }),
    defineField({
      name: 'curatedProjects',
      title: 'Hand-picked projects',
      type: 'array',
      group: 'grid',
      hidden: ({parent}) => !isManualProjects(parent),
      description:
        'The exact projects shown on /work, in order. Drag to reorder. Only used when "Pick manually" is selected above.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'project'}]})],
      validation: (rule) =>
        rule.custom((value, context) => {
          if (!isManualProjects(context.parent)) return true
          if (!value || value.length === 0) {
            return 'Add at least one project, or switch to an automatic order above'
          }
          return true
        }),
    }),

    // ==========================================================================
    // FILTER PILLS — which category pills show, in what order
    // ==========================================================================
    defineField({
      name: 'pillSource',
      title: 'How to choose the filter pills',
      type: 'string',
      group: 'grid',
      description:
        'The category pills above the grid. Show all categories automatically, or pick manually to control exactly which pills appear and their order (e.g. Sportswear → Lifestyle → Tech). The "All" pill is always shown first.',
      options: {
        list: [
          {title: 'Show all categories', value: 'all'},
          {title: 'Pick manually & order', value: 'manual'},
        ],
        layout: 'radio',
      },
      initialValue: 'all',
    }),
    defineField({
      name: 'categoryPills',
      title: 'Filter pills',
      type: 'array',
      group: 'grid',
      hidden: ({parent}) => !isManualPills(parent),
      description:
        'The category pills shown above the grid, in order. Drag to reorder. Only used when "Pick manually" is selected above. Manage the categories themselves under Work Category.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'workCategory'}]})],
      validation: (rule) =>
        rule.custom((value, context) => {
          if (!isManualPills(context.parent)) return true
          if (!value || value.length === 0) {
            return 'Add at least one category pill, or switch to "Show all categories" above'
          }
          return true
        }),
    }),

    // ==========================================================================
    // VIDEO PLAYBACK — how project cards play video in the grid
    // ==========================================================================
    defineField({
      name: 'videoPlayback',
      title: 'How videos play in the grid',
      type: 'string',
      group: 'grid',
      description:
        'Hover (recommended): every card autoplays; on desktop they stay greyscale until you hover (full color). Phones and tablets play in full color. Autoplay: full-color loops on every screen size, no greyscale.',
      options: {
        list: [
          {
            title: 'Greyscale → color on hover (desktop)',
            value: 'hover',
          },
          {title: 'Full color always (every screen size)', value: 'autoplay'},
        ],
        layout: 'radio',
      },
      initialValue: 'hover',
    }),

    // ==========================================================================
    // EMPTY STATE — shown when the grid (or a category) has no projects
    // ==========================================================================
    defineField({
      name: 'emptyState',
      title: 'Empty state',
      type: 'object',
      group: 'grid',
      description:
        'Shown when the grid has no projects to display — e.g. a category with nothing tagged yet.',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({
          name: 'text',
          title: 'Message',
          type: 'string',
          description: 'The line shown when there are no projects.',
          initialValue: 'Nothing here yet.',
        }),
        defineField({
          name: 'ctaLabel',
          title: 'Link text',
          type: 'string',
          description: 'The clickable call-to-action after the message.',
          initialValue: 'Start a conversation →',
        }),
        defineField({
          name: 'ctaHref',
          title: 'Link destination',
          type: 'string',
          description: 'Where the link goes. Defaults to the contact page.',
          initialValue: '/contact',
        }),
      ],
    }),

    ...coreSearchFields(),
  ],
  preview: {
    prepare() {
      return {
        title: 'Work',
        subtitle: 'Work index page',
        media: DocumentsIcon,
      }
    },
  },
})
