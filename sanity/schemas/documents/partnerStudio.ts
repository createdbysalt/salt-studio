import {EarthGlobeIcon} from '@sanity/icons'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {defineField, defineType} from 'sanity'

/**
 * Partner Studio — an outside studio or collective Salt Studio collaborates with.
 *
 * Kept separate from `teamMember` (individual crew): a partner studio is an
 * organization, so it gets its own logo, website, and location. Managed as a
 * standalone list under Dynamic Content → Partner Studios.
 */
export default defineType({
  name: 'partnerStudio',
  title: 'Partner Studio',
  type: 'document',
  icon: EarthGlobeIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'settings', title: 'Settings'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Studio name',
      type: 'string',
      group: 'content',
      description: 'The partner studio or collective as it should appear (e.g. "Baker Bros").',
      validation: (rule) => rule.required().error('Every partner studio needs a name'),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'settings',
      description:
        'Optional. Reserved for a future partner landing page. Auto-generated from the name.',
      options: {source: 'name', maxLength: 96},
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
      group: 'content',
      description: 'Link to the partner studio’s website (if public).',
      validation: (rule) =>
        rule.uri({allowRelative: false, scheme: ['http', 'https']}).warning('Use a full URL'),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      group: 'content',
      description: 'Where they’re based (e.g. "Portland, OR"). Optional.',
    }),
    defineField({
      name: 'specialty',
      title: 'Specialty',
      type: 'string',
      group: 'content',
      description: 'What they’re known for in a few words (e.g. "Editorial & motion"). Optional.',
    }),
    defineField({
      name: 'blurb',
      title: 'Short description',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Optional one- or two-line summary of the partnership.',
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
          description: 'Describe the logo for screen readers (e.g. "Baker Bros logo").',
          validation: (rule) => rule.warning('Alt text improves accessibility and SEO'),
        }),
      ],
    }),
    orderRankField({type: 'partnerStudio'}),
  ],
  orderings: [
    orderRankOrdering,
    {
      title: 'Name',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'name', location: 'location', specialty: 'specialty', media: 'logo'},
    prepare({title, location, specialty, media}) {
      return {
        title: title || 'Untitled partner studio',
        subtitle: [specialty, location].filter(Boolean).join(' · ') || undefined,
        media,
      }
    },
  },
})
