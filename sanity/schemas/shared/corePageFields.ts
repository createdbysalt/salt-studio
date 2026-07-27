import {defineField} from 'sanity'
import {OgImagePreviewInput} from './OgImagePreviewInput'

/** Page content blocks — hero, body sections, CTAs, etc. */
export const corePageSectionsGroup = {name: 'sections', title: 'Sections', default: true}

/** SEO fields — how this page appears in search and social previews. */
export const coreSearchGroup = {
  name: 'search',
  title: 'Search & Sharing',
  description:
    'How this page appears in Google and social previews — not the visible page content.',
}

/** Standard core-page tabs: Sections → Search & Sharing. */
export const corePageTabGroups = [corePageSectionsGroup, coreSearchGroup]

/**
 * Reorderable page sections array — the MFI-style page builder.
 * Each block carries its own content; drag to reorder, toggle to hide.
 * By default each section type may appear at most once.
 */
export function pageSectionsField(
  ofTypes: Array<{type: string; title: string}>,
  options?: {description?: string; uniqueTypes?: boolean},
) {
  return defineField({
    name: 'sections',
    title: 'Sections',
    type: 'array',
    group: 'sections',
    description:
      options?.description ??
      'Drag to reorder. Each block has a section label you can customize. Toggle a block off to hide it without deleting its content.',
    of: ofTypes.map(({type, title}) => ({type, title})),
    validation: (rule) =>
      options?.uniqueTypes === false
        ? rule
        : rule.custom((sections) => {
            if (!sections) return true
            const types = (sections as Array<{_type: string}>).map((s) => s._type)
            if (types.length !== new Set(types).size) {
              return 'Each section type can only appear once'
            }
            return true
          }),
  })
}

/**
 * Shared Search & Sharing fields for every core-page singleton.
 *
 * Covers both SEO (Google, browser tabs, social previews) and AEO — the concise
 * answer AI assistants and voice search read (maps to SpeakableWebPage JSON-LD via
 * `lib/seo`). Each page falls back to sensible site-wide defaults when left empty.
 */
export function coreSearchFields() {
  return [
    defineField({
      name: 'seoTitle',
      title: 'Search result title',
      type: 'string',
      group: 'search',
      description:
        'Title shown in Google results and browser tabs. Keep under 60 characters. Leave empty to use the page headline.',
      validation: (rule) => rule.max(60).warning('Longer titles get truncated in search results'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Search result description',
      type: 'text',
      rows: 2,
      group: 'search',
      description:
        'Short summary under the title in search results. Keep under 155 characters — write what someone would want to click.',
      validation: (rule) =>
        rule.max(155).warning('Longer descriptions get cut off in Google results'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'image',
      group: 'search',
      description:
        'Image shown when this page is shared on social media or messaging apps. Recommended: 1200×630px. Leave empty to auto-generate a branded card from the title and description — see the preview below.',
      components: {input: OgImagePreviewInput},
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
      name: 'speakableSummary',
      title: 'AI & voice search summary',
      type: 'text',
      rows: 3,
      group: 'search',
      description:
        'One or two plain-language sentences answering "What is this page about?" Used by Google, ChatGPT, and voice assistants (AEO). Keep under 300 characters.',
      validation: (rule) =>
        rule.max(300).warning('Shorter summaries work better for AI assistants'),
    }),
  ]
}
