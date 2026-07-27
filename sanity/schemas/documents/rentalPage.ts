import {coreSearchFields, coreSearchGroup} from '@/sanity/schemas/shared/corePageFields'
import {RocketIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Page type controls which content blocks the editor sees — same idea as
 * Project’s Standard vs Case Study. Editors can create as many rental pages
 * as they need under Dynamic Content → Rental; each gets /rentals/{slug}.
 */
const PAGE_TYPE_OPTIONS = [
  {title: 'Studio space', value: 'studio'},
  {title: 'Podcast room', value: 'podcast'},
  {title: 'Gear list', value: 'gear'},
  {title: 'Custom', value: 'custom'},
] as const

type PageType = (typeof PAGE_TYPE_OPTIONS)[number]['value']

function pageTypeOf(parent?: {kind?: string | null}): PageType | undefined {
  const value = parent?.kind
  if (value === 'studio' || value === 'podcast' || value === 'gear' || value === 'custom') {
    return value
  }
  return undefined
}

/**
 * `hidden` callback — return true to hide.
 * Custom shows every optional block so new rental types can mix freely.
 */
function hiddenUnless(...types: PageType[]) {
  return ({parent}: {parent?: {kind?: string | null}}) => {
    const kind = pageTypeOf(parent)
    if (!kind) return true
    if (kind === 'custom') return false
    return !types.includes(kind)
  }
}

/**
 * Rental — dynamic content document (same pattern as Project).
 *
 * Structure: Dynamic Content → Rental. Create as many as you need.
 * Public URL: /rentals/{slug}. Page type picks which blocks appear in the form.
 */
export default defineType({
  name: 'rentalPage',
  title: 'Rental',
  type: 'document',
  icon: RocketIcon,
  groups: [
    {name: 'details', title: 'Details', default: true},
    {name: 'content', title: 'Content'},
    {name: 'media', title: 'Media'},
    {name: 'cta', title: 'CTA'},
    coreSearchGroup,
  ],
  fields: [
    defineField({
      name: 'kind',
      title: 'Page type',
      type: 'string',
      group: 'details',
      description:
        'Controls which content blocks appear below — like Project type (Standard / Case Study). Pick Custom to unlock every block for a new kind of rental page.',
      options: {list: [...PAGE_TYPE_OPTIONS], layout: 'radio'},
      initialValue: 'studio',
      validation: (rule) => rule.required().error('Pick a page type'),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'details',
      description: 'Editor label and list name (e.g. "Portland Studio", "Lisbon Cyclorama").',
      validation: (rule) => rule.required().error('Every rental needs a title'),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'details',
      description: 'Path under /rentals/ — e.g. studio → /rentals/studio. Generate from the title.',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) =>
        rule.required().error('URL slug is required for the rental page to be accessible'),
    }),

    // ─── Hero ─────────────────────────────────────────────────────────
    defineField({
      name: 'eyebrow',
      title: 'Hero eyebrow',
      type: 'string',
      group: 'content',
      description: 'Small label above the H1 (e.g. “Rentals — Studio”). Leave empty to hide.',
    }),
    defineField({
      name: 'headline',
      title: 'Headline (H1)',
      type: 'string',
      group: 'content',
      description: 'Page title on the site (e.g. “Portland Studio.”).',
      validation: (rule) => rule.required().error('Every rental page needs an H1'),
    }),
    defineField({
      name: 'lead',
      title: 'Lead paragraph',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Optional intro under the H1.',
      hidden: hiddenUnless('studio', 'podcast', 'custom'),
    }),

    // ─── Media ────────────────────────────────────────────────────────
    defineField({
      name: 'heroVideo',
      title: 'Hero video loop',
      type: 'file',
      group: 'media',
      description:
        'Optional. When set, the hero is a muted looping MP4. Leave empty to use a photo hero instead. Prefer a short facility walkthrough.',
      options: {accept: 'video/mp4'},
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      group: 'media',
      description:
        'Full-bleed still for a photo hero. If a hero video is set, this is the poster (and the reduced-motion fallback). Prefer a wide facility frame.',
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
      name: 'gallery',
      title: 'Rental gallery',
      type: 'array',
      group: 'media',
      description:
        'Facility photographs of the empty rental space — mosaic under Specs. Click opens a lightbox. Leave empty to hide the mosaic.',
      of: [
        defineArrayMember({
          type: 'image',
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
      ],
      validation: (rule) => rule.max(16).warning('Keep the rental gallery to 16 images or fewer'),
    }),
    defineField({
      name: 'useGallery',
      title: 'In use gallery',
      type: 'array',
      group: 'media',
      description:
        'Real-world shoots in the space — productions, sets, talent. Shown as the horizontal strip under the hero (no heading). Click opens a lightbox. Leave empty to hide the strip.',
      of: [
        defineArrayMember({
          type: 'image',
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
      ],
      validation: (rule) => rule.max(16).warning('Keep the in-use gallery to 16 images or fewer'),
    }),
    defineField({
      name: 'gallerySubhead',
      title: 'Rental gallery heading',
      type: 'string',
      group: 'media',
      description:
        'Optional heading above the rental mosaic (e.g. “The space.”). Leave empty for no heading.',
    }),

    // ─── Specs ────────────────────────────────────────────────────────
    defineField({
      name: 'specsSubhead',
      title: 'Specs subhead',
      type: 'string',
      group: 'content',
      description: 'Optional heading above the specs table.',
      hidden: hiddenUnless('studio', 'podcast', 'custom'),
    }),
    defineField({
      name: 'specsLocation',
      title: 'Pull specs from location',
      type: 'reference',
      to: [{type: 'location'}],
      group: 'content',
      description:
        'Link a location (e.g. Portland HQ) to reuse its specs table — same source as /studio. Address is appended automatically.',
      hidden: hiddenUnless('studio', 'custom'),
    }),
    defineField({
      name: 'specRows',
      title: 'Specs table',
      type: 'array',
      group: 'content',
      description:
        'Inline specs. Used when no location is linked, or as the full table for podcast / custom pages.',
      hidden: hiddenUnless('studio', 'podcast', 'custom'),
      of: [defineArrayMember({type: 'specRow'})],
    }),

    // ─── Prose ────────────────────────────────────────────────────────
    defineField({
      name: 'whoForSubhead',
      title: "Who it's for — heading",
      type: 'string',
      group: 'content',
      initialValue: "Who it's for",
      hidden: hiddenUnless('podcast', 'custom'),
    }),
    defineField({
      name: 'whoForBody',
      title: "Who it's for — body",
      type: 'text',
      rows: 4,
      group: 'content',
      hidden: hiddenUnless('podcast', 'custom'),
    }),
    defineField({
      name: 'includedSubhead',
      title: "What's included — heading",
      type: 'string',
      group: 'content',
      initialValue: "What's included",
      hidden: hiddenUnless('studio', 'podcast', 'custom'),
    }),
    defineField({
      name: 'includedBody',
      title: "What's included — body",
      type: 'text',
      rows: 4,
      group: 'content',
      hidden: hiddenUnless('studio', 'podcast', 'custom'),
    }),
    defineField({
      name: 'extraSubhead',
      title: "What's extra — heading",
      type: 'string',
      group: 'content',
      initialValue: "What's extra",
      hidden: hiddenUnless('studio', 'custom'),
    }),
    defineField({
      name: 'extraBody',
      title: "What's extra — body",
      type: 'text',
      rows: 4,
      group: 'content',
      description: 'Add-ons priced per shoot day (crew, specialty rigs, catering, etc.).',
      hidden: hiddenUnless('studio', 'custom'),
    }),

    // ─── Gear / downloads ─────────────────────────────────────────────
    defineField({
      name: 'gearHeading',
      title: 'Gear section heading',
      type: 'string',
      group: 'content',
      initialValue: 'Studio curated gear.',
      hidden: hiddenUnless('gear', 'custom'),
    }),
    defineField({
      name: 'gearIntro',
      title: 'Gear section lead',
      type: 'text',
      rows: 3,
      group: 'content',
      initialValue: 'Take your shoot even further with the same gear our creative team relies on.',
      hidden: hiddenUnless('gear', 'custom'),
    }),
    defineField({
      name: 'gearListPdfUrl',
      title: 'Gear list PDF URL',
      type: 'string',
      group: 'content',
      description: 'Path or URL (e.g. /gear-list.pdf).',
      hidden: hiddenUnless('gear', 'custom'),
    }),
    defineField({
      name: 'gearListPdfLabel',
      title: 'Gear list PDF link label',
      type: 'string',
      group: 'content',
      initialValue: 'Download the gear list (PDF) →',
      hidden: hiddenUnless('gear', 'custom'),
    }),
    defineField({
      name: 'studioSpecPdfUrl',
      title: 'Studio spec sheet PDF URL',
      type: 'string',
      group: 'content',
      description: 'Path or URL for the studio spec sheet download.',
      hidden: hiddenUnless('gear', 'custom'),
    }),
    defineField({
      name: 'studioSpecPdfLabel',
      title: 'Studio spec PDF link label',
      type: 'string',
      group: 'content',
      initialValue: 'Download the studio spec sheet (PDF) →',
      hidden: hiddenUnless('gear', 'custom'),
    }),

    // ─── CTA ──────────────────────────────────────────────────────────
    defineField({
      name: 'cta',
      title: 'Section CTA',
      type: 'reference',
      to: [{type: 'callToAction'}],
      group: 'cta',
      description:
        'Usually “Check availability →” to /contact with a rental subject prefilled on the CTA document.',
      validation: (rule) => rule.warning('Add a CTA so visitors can check availability'),
    }),

    ...coreSearchFields(),
  ],
  orderings: [
    {title: 'Title A–Z', name: 'titleAsc', by: [{field: 'title', direction: 'asc'}]},
    {title: 'Page type', name: 'kindAsc', by: [{field: 'kind', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current', kind: 'kind', headline: 'headline'},
    prepare({title, slug, kind, headline}) {
      const kindLabel = PAGE_TYPE_OPTIONS.find((k) => k.value === kind)?.title
      return {
        title: title || headline || 'Rental',
        subtitle: [slug ? `/rentals/${slug}` : null, kindLabel].filter(Boolean).join(' · '),
      }
    },
  },
})
