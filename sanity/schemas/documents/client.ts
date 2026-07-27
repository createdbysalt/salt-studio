import {CaseIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Client — a brand Salt Studio has worked with.
 *
 * Powers the home "SELECTED CLIENTS" strip and is referenced from each project.
 * Logos are optional for now (we don't have them yet) — leave blank.
 */
export default defineType({
  name: 'client',
  title: 'Client',
  type: 'document',
  icon: CaseIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'settings', title: 'Settings'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Client name',
      type: 'string',
      group: 'content',
      description: 'The brand name as it should appear on the site (e.g. "Sorel", "Nike").',
      validation: (rule) => rule.required().error('Every client needs a name'),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'settings',
      description:
        'Optional. Reserved for a future client landing page. Auto-generated from the name.',
      options: {source: 'name', maxLength: 96},
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
      group: 'content',
      description: 'Link to the client’s website (if public).',
      validation: (rule) =>
        rule.uri({allowRelative: false, scheme: ['http', 'https']}).warning('Use a full URL'),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      group: 'content',
      description:
        'Optional — leave blank if we don’t have it yet. SVG or transparent PNG works best.',
      options: {
        hotspot: true,
        accept: 'image/svg+xml,image/png,image/jpeg,image/webp',
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the logo for screen readers (e.g. "Sorel logo").',
          validation: (rule) => rule.warning('Alt text improves accessibility and SEO'),
        }),
      ],
    }),
    defineField({
      name: 'tier',
      title: 'Client tier',
      type: 'string',
      group: 'settings',
      description:
        'How recognizable this brand is — used to filter the client list. "Known" = marquee brands from the 2026 roster; "Less known" = supporting clients to feature as needed.',
      options: {
        list: [
          {title: 'Known (marquee brand)', value: 'known'},
          {title: 'Less known', value: 'less-known'},
        ],
        layout: 'radio',
      },
      initialValue: 'less-known',
    }),
    defineField({
      name: 'featured',
      title: 'Show in home client strip?',
      type: 'boolean',
      group: 'settings',
      hidden: true,
      initialValue: false,
      description:
        'Deprecated — use Client tier (Known / Less known) and Home → CTA → How to choose marquee clients instead.',
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort order',
      type: 'number',
      group: 'settings',
      initialValue: 0,
      description: 'Lower numbers appear first in the home client strip.',
    }),
  ],
  orderings: [
    {
      title: 'Sort order',
      name: 'sortOrderAsc',
      by: [{field: 'sortOrder', direction: 'asc'}],
    },
    {
      title: 'Name',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}],
    },
    {
      title: 'Tier, then name',
      name: 'tierName',
      by: [
        {field: 'tier', direction: 'asc'},
        {field: 'name', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {title: 'name', website: 'website', tier: 'tier', media: 'logo'},
    prepare({title, website, tier, media}) {
      const tierLabel = tier === 'known' ? 'Known' : 'Less known'
      return {
        title: title || 'Untitled client',
        subtitle: [tierLabel, website].filter(Boolean).join(' · ') || undefined,
        media,
      }
    },
  },
})
