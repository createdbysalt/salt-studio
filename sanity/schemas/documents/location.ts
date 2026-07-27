import {PinIcon} from '@sanity/icons'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Location — a physical studio location (Portland HQ, Lisbon satellite).
 *
 * Single source of truth for the studio specs table. The same specs render on
 * the Studio page (§06) and the Studio rental page (§08), so they live here once
 * and both pages reference this document — no duplicated, drifting spec tables.
 */
export default defineType({
  name: 'location',
  title: 'Location',
  type: 'document',
  icon: PinIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'specs', title: 'Specs'},
    {name: 'settings', title: 'Settings'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Location name',
      type: 'string',
      group: 'content',
      description: 'The name of the location as it should appear on the site (e.g. "Portland HQ").',
      validation: (rule) => rule.required().error('Every location needs a name'),
    }),
    defineField({
      name: 'kind',
      title: 'Location type',
      type: 'string',
      group: 'content',
      description: 'HQ = the main Portland studio. Satellite = the Lisbon post/EU hub.',
      options: {
        list: [
          {title: 'HQ (main studio)', value: 'hq'},
          {title: 'Satellite', value: 'satellite'},
        ],
        layout: 'radio',
      },
      initialValue: 'hq',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'settings',
      description: 'Auto-generated from the name. Reserved for a future per-location page.',
      options: {source: 'name', maxLength: 96},
    }),
    defineField({
      name: 'shortName',
      title: 'Short name',
      type: 'string',
      group: 'content',
      description:
        'Vertical label on the Capabilities “Where we work” diptych. Keep it short — e.g. "Portland" or "Portugal".',
    }),
    defineField({
      name: 'caption',
      title: 'Caption line',
      type: 'string',
      group: 'content',
      description:
        'Bottom location line on the Capabilities diptych. Example: "Portland OR, USA" or "Lisbon, Portugal".',
    }),
    defineField({
      name: 'role',
      title: 'Role line',
      type: 'string',
      group: 'content',
      description:
        'Second bottom line on the Capabilities diptych (shown after »). Example: "Main studio and production hub".',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'A short description of the location — the lead paragraph for its section.',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'text',
      rows: 2,
      group: 'content',
      description:
        'Shown in the site footer under the logo (one line per location). Also used in the specs table and LocalBusiness SEO. Example: "726 SE 10th Ave, Portland, OR 97214" or "Lisbon, Portugal".',
    }),
    defineField({
      name: 'image',
      title: 'Cover image',
      type: 'image',
      group: 'content',
      description:
        'Hero / diptych still for this location. Used on Capabilities (Where we work) and anywhere else the location needs a cover. Wide landscape works best.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the image for screen readers and SEO.',
          validation: (rule) => rule.warning('Alt text improves accessibility and SEO'),
        }),
      ],
    }),
    defineField({
      name: 'specRows',
      title: 'Specs',
      type: 'array',
      group: 'specs',
      description:
        'The specs table for this location — one row per spec (e.g. "Total space" → "6,000 sq ft"). Renders on both the Studio page and the Studio rental page.',
      of: [defineArrayMember({type: 'specRow'})],
    }),
    orderRankField({type: 'location'}),
  ],
  orderings: [
    orderRankOrdering,
    {title: 'Name', name: 'nameAsc', by: [{field: 'name', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'name', kind: 'kind', media: 'image'},
    prepare({title, kind, media}) {
      const kindLabel = kind === 'satellite' ? 'Satellite' : 'HQ'
      return {title: title || 'Untitled location', subtitle: kindLabel, media}
    },
  },
})
