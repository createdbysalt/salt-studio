import {
  enabledField,
  prepareSectionPreview,
  sectionInternalNameField,
  sectionPreview,
} from '@/sanity/schemas/shared/sectionInternalName'
import {CaseIcon, PinIcon, RocketIcon, UsersIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Studio page sections (MFI-style page builder).
 * Live in the `sections` array on `studioPage`; drag to reorder, toggle to hide.
 */

const imageAltField = defineField({
  name: 'alt',
  title: 'Alt text',
  type: 'string',
  description: 'Describe the image for screen readers and SEO.',
  validation: (rule) => rule.warning('Alt text improves accessibility and SEO'),
})

const studioImageField = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    type: 'image',
    description,
    options: {hotspot: true},
    fields: [imageAltField],
  })

export const studioHeroSection = defineType({
  name: 'studioHeroSection',
  title: 'Hero',
  type: 'object',
  icon: RocketIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Hero'),
    defineField({
      name: 'headline',
      title: 'Headline (H1)',
      type: 'string',
      initialValue: 'Ground Control for boots on the ground.',
      validation: (rule) => rule.required().error('The hero needs a headline'),
    }),
    defineField({name: 'lead', title: 'Lead paragraph', type: 'text', rows: 5}),
    studioImageField(
      'heroImage',
      'Hero image',
      'Full-bleed Portland studio photograph. Shown edge-to-edge behind the headline.',
    ),
    defineField({
      name: 'label',
      title: 'Frame label',
      type: 'string',
      initialValue: '02 — The studio',
      description: 'Small mono label above the headline (deck chapter mark).',
    }),
  ],
  preview: sectionPreview('headline', 'Hero'),
})

export const studioSpecsSection = defineType({
  name: 'studioSpecsSection',
  title: 'Studio Specs',
  type: 'object',
  icon: CaseIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Studio Specs'),
    defineField({name: 'subhead', title: 'Subhead', type: 'string'}),
    defineField({
      name: 'location',
      title: 'Pull specs from location',
      type: 'reference',
      to: [{type: 'location'}],
      description:
        'Link a location (e.g. Portland HQ) and its specs table renders here automatically — the single source of truth shared with /rentals/studio. Add or edit locations under Studio → Locations.',
      validation: (rule) =>
        rule.required().error('Link a location — its specs table is what this section renders'),
    }),
    defineField({
      name: 'gallery',
      title: 'Studio photo gallery',
      type: 'array',
      description:
        'Facility photographs shown under the specs table. Pick from Media → use-portland-studio.',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [imageAltField],
        }),
      ],
      validation: (rule) => rule.max(8).warning('Keep the gallery to 8 images or fewer'),
    }),
  ],
  preview: {
    select: {
      internalName: 'internalName',
      subhead: 'subhead',
      enabled: 'enabled',
      locationName: 'location.name',
    },
    prepare({internalName, subhead, enabled, locationName}) {
      return prepareSectionPreview({
        internalName,
        contentTitle: subhead || locationName || undefined,
        typeLabel: 'Studio Specs',
        enabled,
      })
    },
  },
})

export const studioLisbonSection = defineType({
  name: 'studioLisbonSection',
  title: 'Lisbon',
  type: 'object',
  icon: PinIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Lisbon'),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      initialValue: 'Satellite and EU launchpad.',
    }),
    defineField({
      name: 'location',
      title: 'Pull copy from location',
      type: 'reference',
      to: [{type: 'location'}],
      description:
        'Optional. Link the Lisbon location and its summary fills the body below automatically. Add or edit locations under Studio → Locations.',
    }),
    defineField({
      name: 'body',
      title: 'Body copy',
      type: 'text',
      rows: 3,
      description: 'Optional override. Leave blank to use the linked location’s summary.',
    }),
    studioImageField(
      'sideImage',
      'Side image',
      'Optional Lisbon / EU hub photograph shown beside the copy.',
    ),
  ],
  preview: sectionPreview('headline', 'Lisbon'),
})

export const studioCrewSection = defineType({
  name: 'studioCrewSection',
  title: 'Crew',
  type: 'object',
  icon: UsersIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Crew'),
    defineField({name: 'subhead', title: 'Subhead', type: 'string', initialValue: 'Crew.'}),
    defineField({
      name: 'intro',
      title: 'Intro line',
      type: 'string',
      description: 'Optional short line under the Crew subhead on the dark chapter.',
    }),
    defineField({
      name: 'crew',
      title: 'Crew members',
      type: 'array',
      description:
        'Order matters — leads first, then support. Edit people under Dynamic Content → Team.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'teamMember'}]})],
    }),
  ],
  preview: sectionPreview('subhead', 'Crew'),
})
