import {
  prepareSectionPreview,
  sectionInternalNameField,
} from '@/sanity/schemas/shared/sectionInternalName'
import {BlockElementIcon, ComponentIcon, RocketIcon, SparklesIcon, ThLargeIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Capabilities page sections (MFI-style page builder).
 *
 * Each section is a standalone object with its own content, an `enabled` toggle,
 * and an editor label. They live in the `sections` array on `capabilitiesPage`,
 * where editors drag to reorder and toggle to hide.
 */

const enabledField = defineField({
  name: 'enabled',
  title: 'Show this section?',
  type: 'boolean',
  initialValue: true,
  description: 'Turn off to hide this section without deleting its content.',
})

const ambientVideoField = defineField({
  name: 'ambientVideo',
  title: 'Ambient video loop',
  type: 'file',
  description:
    'Optional looping motion graphic (MP4). Pick from Media → type-video. When empty, the site uses a default deck loop.',
  options: {accept: 'video/mp4'},
})

const sideImageField = defineField({
  name: 'sideImage',
  title: 'Side image',
  type: 'image',
  description:
    'Optional black-and-white still (equipment, studio, or atmospheric). Shown beside the copy on desktop.',
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
})

/** Shared preview for sections keyed off a headline/subhead string. */
function sectionPreview(contentField: string, typeLabel: string) {
  return {
    select: {internalName: 'internalName', content: contentField, enabled: 'enabled'},
    prepare({
      internalName,
      content,
      enabled,
    }: {
      internalName?: string
      content?: string
      enabled?: boolean
    }) {
      return prepareSectionPreview({internalName, contentTitle: content, typeLabel, enabled})
    },
  }
}

// =============================================================================
// HERO
// =============================================================================
export const capHeroSection = defineType({
  name: 'capHeroSection',
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
      initialValue: 'Modular Production, beginning to end.',
      validation: (rule) => rule.required().error('The hero needs a headline'),
    }),
    defineField({name: 'lead', title: 'Lead paragraph', type: 'text', rows: 3}),
    defineField({
      name: 'founderAnchor',
      title: 'Founder anchor',
      type: 'text',
      rows: 2,
      description: 'Small line below the lead — founding story.',
    }),
    defineField({
      name: 'secondaryLine',
      title: 'Secondary line',
      type: 'string',
      description: 'Also powers the dark “scale” insert below the manifesto.',
    }),
    ambientVideoField,
  ],
  preview: sectionPreview('headline', 'Hero'),
})

// =============================================================================
// WHY MODULAR / HOW WE WORK / WHERE WE WORK — subhead + body blocks
// =============================================================================
function copyBlockSection({
  name,
  title,
  subheadDefault,
}: {
  name: string
  title: string
  subheadDefault?: string
}) {
  return defineType({
    name,
    title,
    type: 'object',
    icon: BlockElementIcon,
    fields: [
      enabledField,
      sectionInternalNameField(title),
      defineField({
        name: 'subhead',
        title: 'Subhead',
        type: 'string',
        initialValue: subheadDefault,
      }),
      defineField({name: 'body', title: 'Body copy', type: 'text', rows: 4}),
    ],
    preview: sectionPreview('subhead', title),
  })
}

export const capWhyModularSection = defineType({
  name: 'capWhyModularSection',
  title: 'Why Modular',
  type: 'object',
  icon: BlockElementIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Why Modular'),
    defineField({
      name: 'subhead',
      title: 'Subhead',
      type: 'string',
      initialValue: "Everything you need, nothing you don't.",
    }),
    defineField({name: 'body', title: 'Body copy', type: 'text', rows: 4}),
    sideImageField,
  ],
  preview: sectionPreview('subhead', 'Why Modular'),
})

export const capHowWeWorkSection = copyBlockSection({
  name: 'capHowWeWorkSection',
  title: 'How We Work',
  subheadDefault: 'Creative → Production → Post.',
})

// =============================================================================
// WHERE WE WORK — subhead + body over a full-bleed Portland | Portugal diptych
// =============================================================================
export const capWhereWeWorkSection = defineType({
  name: 'capWhereWeWorkSection',
  title: 'Where We Work',
  type: 'object',
  icon: BlockElementIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Where We Work'),
    defineField({
      name: 'subhead',
      title: 'Subhead',
      type: 'string',
      description:
        'Headline overlaid on the left (Portland) photo. Example: "Two studios. One modular system."',
      initialValue: 'Two studios. One modular system.',
    }),
    defineField({
      name: 'sideTagline',
      title: 'Right-side tagline',
      type: 'string',
      description:
        'Small line at the top of the right (Portugal) photo. Example: "Modular production for the future of content".',
      initialValue: 'Modular production for the future of content',
    }),
    defineField({
      name: 'leftLocation',
      title: 'Left location',
      type: 'reference',
      to: [{type: 'location'}],
      description:
        'Usually Portland HQ. Pulls the cover image, short name, caption, and role from Studio → Locations.',
      validation: (rule) => rule.required().error('Pick the left location (Portland)'),
    }),
    defineField({
      name: 'rightLocation',
      title: 'Right location',
      type: 'reference',
      to: [{type: 'location'}],
      description:
        'Usually Lisbon / Portugal. Pulls the cover image, short name, caption, and role from Studio → Locations.',
      validation: (rule) => rule.required().error('Pick the right location (Portugal)'),
    }),
  ],
  preview: sectionPreview('subhead', 'Where We Work'),
})

// =============================================================================
// MODULE TILES
// =============================================================================
export const capModuleTilesSection = defineType({
  name: 'capModuleTilesSection',
  title: 'Module Tiles',
  type: 'object',
  icon: ThLargeIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Module Tiles'),
    defineField({name: 'subhead', title: 'Subhead', type: 'string'}),
    defineField({
      name: 'moduleTiles',
      title: 'Module tiles',
      type: 'array',
      description: 'Grid of specialty modules. Drag to reorder tiles.',
      of: [defineArrayMember({type: 'moduleTile'})],
    }),
  ],
  preview: {
    select: {
      internalName: 'internalName',
      subhead: 'subhead',
      enabled: 'enabled',
      tiles: 'moduleTiles',
    },
    prepare({internalName, subhead, enabled, tiles}) {
      const count = Array.isArray(tiles) ? tiles.length : 0
      return prepareSectionPreview({
        internalName,
        contentTitle: subhead || (count ? `${count} tile${count === 1 ? '' : 's'}` : undefined),
        typeLabel: 'Module Tiles',
        enabled,
      })
    },
  },
})

// =============================================================================
// CREATIVE / PRODUCTION / POST — subhead + intro line + body + side image
// =============================================================================
function stageSection({
  name,
  title,
  subheadDefault,
  introDefault,
}: {
  name: string
  title: string
  subheadDefault: string
  introDefault: string
}) {
  return defineType({
    name,
    title,
    type: 'object',
    icon: ComponentIcon,
    fields: [
      enabledField,
      sectionInternalNameField(title),
      defineField({
        name: 'subhead',
        title: 'Subhead',
        type: 'string',
        initialValue: subheadDefault,
      }),
      defineField({
        name: 'introLine',
        title: 'Intro line',
        type: 'string',
        initialValue: introDefault,
      }),
      defineField({name: 'body', title: 'Body copy', type: 'text', rows: 4}),
      sideImageField,
    ],
    preview: sectionPreview('subhead', title),
  })
}

export const capCreativeSection = stageSection({
  name: 'capCreativeSection',
  title: 'Creative',
  subheadDefault: 'Creative.',
  introDefault: 'Where the brief becomes a plan.',
})

export const capProductionSection = stageSection({
  name: 'capProductionSection',
  title: 'Production',
  subheadDefault: 'Production.',
  introDefault: 'Where every moment counts.',
})

export const capPostSection = stageSection({
  name: 'capPostSection',
  title: 'Post',
  subheadDefault: 'Post.',
  introDefault: 'Where it all comes together.',
})

// =============================================================================
// AGENCIES & BRANDS — subhead + body + optional pull quote + media
// =============================================================================
export const capAgencyBrandsSection = defineType({
  name: 'capAgencyBrandsSection',
  title: 'Agencies & Brands',
  type: 'object',
  icon: SparklesIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Agencies & Brands'),
    defineField({
      name: 'subhead',
      title: 'Subhead',
      type: 'string',
      initialValue: 'Maximum flexibility.',
    }),
    defineField({name: 'body', title: 'Body copy', type: 'text', rows: 4}),
    defineField({name: 'pullQuote', title: 'Optional pull quote', type: 'string'}),
    ambientVideoField,
    sideImageField,
  ],
  preview: sectionPreview('subhead', 'Agencies & Brands'),
})

// =============================================================================
// CLOSING CTA — generic, reusable across core pages
// =============================================================================
export const ctaSection = defineType({
  name: 'ctaSection',
  title: 'Call to Action',
  type: 'object',
  icon: RocketIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Call to Action'),
    defineField({
      name: 'cta',
      title: 'CTA',
      type: 'reference',
      to: [{type: 'callToAction'}],
      description:
        'Pick a shared CTA from the library (Dynamic Content → CTAs). Its subhead, button label, and link are managed there and reused across pages.',
      validation: (rule) => rule.required().error('Choose a CTA to show in this section'),
    }),
  ],
  preview: {
    select: {internalName: 'internalName', buttonLabel: 'cta.buttonLabel'},
    prepare({internalName, buttonLabel}) {
      return {
        title: internalName || 'Call to Action',
        subtitle: buttonLabel || 'No CTA linked',
      }
    },
  },
})
