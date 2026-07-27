import {CodeBlockIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Capability — a technical term Salt works with: a language, framework,
 * platform, tool, or discipline (e.g. TypeScript, Next.js, Sanity, Figma).
 *
 * Linked from work categories (each capability belongs to one or more) and
 * from projects (the per-project "stack"). Powers "what we work with" lists
 * on category landing pages and stack metadata on case studies.
 */
export default defineType({
  name: 'capability',
  title: 'Capability',
  type: 'document',
  icon: CodeBlockIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'The term as it should appear on the site, e.g. “Next.js”, “TypeScript”.',
      validation: (rule) => rule.required().error('Every capability needs a name'),
    }),
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      description: 'What sort of thing this is — used to group capabilities when displayed.',
      options: {
        list: [
          {title: 'Language', value: 'language'},
          {title: 'Framework / Library', value: 'framework'},
          {title: 'Platform / Service', value: 'platform'},
          {title: 'Tool', value: 'tool'},
          {title: 'Discipline', value: 'discipline'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required().error('Pick a kind so displays can group correctly'),
    }),
    defineField({
      name: 'categories',
      title: 'Work categories',
      type: 'array',
      description:
        'Which work categories this capability serves — e.g. Next.js → Web & Digital, Figma → Brand & Identity. A capability can serve more than one.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'workCategory'}]})],
      validation: (rule) =>
        rule.min(1).warning('Link at least one category so this shows up on category pages'),
    }),
    defineField({
      name: 'url',
      title: 'Website',
      type: 'url',
      description: 'Optional link to the official site (e.g. https://nextjs.org).',
      validation: (rule) =>
        rule.uri({allowRelative: false, scheme: ['http', 'https']}).warning('Use a full URL'),
    }),
    defineField({
      name: 'iconSlug',
      title: 'Icon slug (Simple Icons)',
      type: 'string',
      description:
        'The Simple Icons slug for this brand, e.g. “nextdotjs”, “figma” — find it at simpleicons.org. Renders as a monochrome mark in the capabilities marquee. Leave empty for disciplines or brands Simple Icons doesn’t carry (upload a Logo below instead).',
      hidden: ({parent}) => parent?.kind === 'discipline',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description:
        'Fallback mark for brands Simple Icons doesn’t carry (e.g. our own Hermes). Single-color SVG works best so it can render in ink like the rest of the marquee. Leave blank when an icon slug is set.',
      options: {accept: 'image/svg+xml,image/png,image/webp'},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the logo for screen readers (e.g. “Next.js logo”).',
          validation: (rule) => rule.warning('Alt text improves accessibility and SEO'),
        }),
      ],
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort order',
      type: 'number',
      initialValue: 0,
      description: 'Lower numbers appear first within their kind. Leave 0 for alphabetical.',
    }),
  ],
  orderings: [
    {
      title: 'Kind, then name',
      name: 'kindName',
      by: [
        {field: 'kind', direction: 'asc'},
        {field: 'sortOrder', direction: 'asc'},
        {field: 'name', direction: 'asc'},
      ],
    },
    {
      title: 'Name',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'name', kind: 'kind', media: 'logo'},
    prepare({title, kind, media}) {
      const kindLabel =
        {
          language: 'Language',
          framework: 'Framework / Library',
          platform: 'Platform / Service',
          tool: 'Tool',
          discipline: 'Discipline',
        }[kind as string] || kind
      return {
        title: title || 'Untitled capability',
        subtitle: kindLabel || undefined,
        media,
      }
    },
  },
})
