import {coreSearchFields, coreSearchGroup} from '@/sanity/schemas/shared/corePageFields'
import {HomeIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

// Undefined `showcaseSource` on the existing doc is treated as "custom" so the
// manual list keeps showing until an editor explicitly switches modes.
type HomeParent = {showcaseSource?: string; clientSource?: string}
const sourceOf = (parent: unknown) => (parent as HomeParent)?.showcaseSource
const isCustom = (parent: unknown) => {
  const source = sourceOf(parent)
  return !source || source === 'custom'
}

// Client marquee selector — mirrors the hero project selector. Manual mode
// shows the hand-picked list; the auto modes pull from the client `tier` field.
const clientSourceOf = (parent: unknown) => (parent as HomeParent)?.clientSource
const isManualClients = (parent: unknown) => clientSourceOf(parent) === 'manual'

export default defineType({
  name: 'home',
  title: 'Home',
  type: 'document',
  icon: HomeIcon,
  groups: [
    {name: 'hero', title: 'Video Hero', default: true},
    {name: 'cta', title: 'CTA'},
    coreSearchGroup,
  ],
  fields: [
    // ==========================================================================
    // VIDEO HERO — project selector + philosophy line
    // ==========================================================================
    defineField({
      name: 'showcaseSource',
      title: 'How to choose hero projects',
      type: 'string',
      group: 'hero',
      description:
        'Pick manually to hand-order specific projects. Or auto-fill the hero from all projects, every Featured project, or by project type. Either way, only projects that have a video are ever shown.',
      options: {
        list: [
          {title: 'Pick manually', value: 'custom'},
          {title: 'Automatically — all projects', value: 'all'},
          {title: 'Automatically — featured projects', value: 'featured'},
          {title: 'Automatically — by project type', value: 'type'},
        ],
        layout: 'radio',
      },
      initialValue: 'custom',
    }),
    defineField({
      name: 'showcaseProjects',
      title: 'Featured projects',
      type: 'array',
      group: 'hero',
      hidden: ({parent}) => !isCustom(parent),
      description:
        'Projects you hand-pick for the video hero. Drag to set order. Only projects with a video URL appear on the site.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'project'}]})],
      validation: (rule) =>
        rule.custom((value: unknown[] | undefined, context) => {
          if (!isCustom(context.parent)) return true
          if (!value || value.length < 1) return 'Add at least one project for the hero'
          return true
        }),
    }),
    defineField({
      name: 'showcaseType',
      title: 'Which project type',
      type: 'string',
      group: 'hero',
      hidden: ({parent}) => sourceOf(parent) !== 'type',
      description: 'When auto-selecting by type, show projects of this type in the hero.',
      options: {
        list: [
          {title: 'Standard', value: 'standard'},
          {title: 'Case Study', value: 'case-study'},
        ],
        layout: 'radio',
      },
      initialValue: 'standard',
      validation: (rule) =>
        rule.custom((value, context) => {
          if (sourceOf(context.parent) === 'type' && !value) return 'Pick a project type'
          return true
        }),
    }),
    defineField({
      name: 'heroCtaLabel',
      title: 'Project CTA label',
      type: 'string',
      group: 'hero',
      initialValue: 'Extrapolate',
      description:
        'Button under each hero project’s statement (links to that project’s page). Brand default is “Extrapolate”.',
      validation: (rule) =>
        rule.max(40).warning('Keep this short — it sits in a small bordered button'),
    }),
    // ==========================================================================
    // CTA — client marquee selector + bottom CTA button
    // ==========================================================================
    defineField({
      name: 'clientSource',
      title: 'How to choose marquee clients',
      type: 'string',
      group: 'cta',
      description:
        'Pick manually to hand-order specific clients in the bottom marquee. Or auto-fill from all clients, or just your Known or Less known clients — set each client’s tier under Dynamic Content → Clients.',
      options: {
        list: [
          {title: 'Pick manually', value: 'manual'},
          {title: 'Automatically — all clients', value: 'all'},
          {title: 'Automatically — known clients', value: 'known'},
          {title: 'Automatically — less known clients', value: 'less-known'},
        ],
        layout: 'radio',
      },
      initialValue: 'known',
    }),
    defineField({
      name: 'clientList',
      title: 'Marquee clients',
      type: 'array',
      group: 'cta',
      hidden: ({parent}) => !isManualClients(parent),
      description: 'Clients shown in the bottom marquee. Drag to set order.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'client'}]})],
      validation: (rule) =>
        rule
          .custom((value: unknown[] | undefined, context) => {
            if (!isManualClients(context.parent)) return true
            if (!value || value.length < 1) return 'Add at least one client for the marquee'
            return true
          })
          .warning(),
    }),
    defineField({
      name: 'cta',
      title: 'Bottom CTA',
      type: 'reference',
      group: 'cta',
      to: [{type: 'callToAction'}],
      description:
        'The persistent bottom-right button on the homepage. Pick a shared CTA from the library (Dynamic Content → CTAs).',
    }),

    // ==========================================================================
    // SEARCH & SHARING — shared core-page fields + home-only hidden H1
    // ==========================================================================
    ...coreSearchFields(),
    defineField({
      name: 'hiddenH1',
      title: 'Hidden H1 (accessibility / SEO)',
      type: 'string',
      group: 'search',
      description:
        'Visually hidden on the page but available to screen readers and search engines.',
    }),
  ],
  preview: {
    select: {title: 'seoTitle'},
    prepare({title}) {
      return {
        title: title || 'Home',
        subtitle: 'Homepage',
      }
    },
  },
})
