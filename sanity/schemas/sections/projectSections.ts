import {
  enabledField,
  sectionInternalNameField,
  sectionPreview,
} from '@/sanity/schemas/shared/sectionInternalName'
import {
  BlockquoteIcon,
  BulbOutlineIcon,
  CheckmarkCircleIcon,
  ImagesIcon,
  TrendUpwardIcon,
  UsersIcon,
} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Project case-study sections — the reorderable body of /projects/[slug].
 * The conversion shape: outcome first, labeled statements telling the story,
 * concrete scope ("exactly what we did"), media doing the showing, real quotes
 * and stats only when they exist. The closing booking CTA is rendered by the
 * page template on every project — it is not a section, so it can't be forgotten.
 */

export const projectStatementSection = defineType({
  name: 'projectStatementSection',
  title: 'Statement',
  type: 'object',
  icon: BulbOutlineIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Statement'),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description:
        'Short label above the text, e.g. “Where they started”, “What we found together”, “The build”, “What changed”.',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description: 'The statement itself — a few honest paragraphs, not an essay.',
      of: [
        defineArrayMember({
          type: 'block',
          lists: [],
          marks: {
            annotations: [],
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
          },
          styles: [],
        }),
      ],
    }),
  ],
  preview: sectionPreview('label', 'Statement'),
})

export const projectScopeSection = defineType({
  name: 'projectScopeSection',
  title: 'Scope',
  type: 'object',
  icon: CheckmarkCircleIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Scope'),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      initialValue: 'What we delivered',
      description: 'Heading above the scope list.',
    }),
    defineField({
      name: 'items',
      title: 'Scope items',
      type: 'array',
      description:
        'Exactly what was delivered, item by item — specificity sells. e.g. “Full visual identity — 3 logo concepts” or “346 photos migrated into Sanity”.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'scopeItem',
          title: 'Item',
          fields: [
            defineField({
              name: 'title',
              title: 'Item',
              type: 'string',
              description: 'The deliverable, e.g. “Member Resource Hub”.',
              validation: (rule) => rule.required().error('Every scope item needs a name'),
            }),
            defineField({
              name: 'detail',
              title: 'Detail',
              type: 'string',
              description:
                'Optional one-line specific, e.g. “login-gated, ten resource categories”.',
            }),
          ],
          preview: {select: {title: 'title', subtitle: 'detail'}},
        }),
      ],
    }),
  ],
  preview: sectionPreview('label', 'Scope'),
})

export const projectMediaSection = defineType({
  name: 'projectMediaSection',
  title: 'Media',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Media'),
    defineField({
      name: 'rows',
      title: 'Media rows',
      type: 'array',
      description:
        'Full-width and two-up rows of photos and videos. Let the work do the talking — alternate one-up and two-up for rhythm.',
      of: [
        defineArrayMember({type: 'projectGalleryRowOne'}),
        defineArrayMember({type: 'projectGalleryRowTwo'}),
      ],
    }),
  ],
  preview: sectionPreview('internalName', 'Media'),
})

export const projectQuoteSection = defineType({
  name: 'projectQuoteSection',
  title: 'Quote',
  type: 'object',
  icon: BlockquoteIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Quote'),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 3,
      description:
        'A real quote from the client, with their permission. Never invent or embellish one.',
    }),
    defineField({
      name: 'attribution',
      title: 'Who said it',
      type: 'string',
      description: 'e.g. “David”, “Lisa Trent”.',
    }),
    defineField({
      name: 'attributionRole',
      title: 'Their role',
      type: 'string',
      description: 'e.g. “Lead Pastor, Crossroads Life Church”.',
    }),
  ],
  preview: sectionPreview('quote', 'Quote'),
})

export const projectStatsSection = defineType({
  name: 'projectStatsSection',
  title: 'Results',
  type: 'object',
  icon: TrendUpwardIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Results'),
    defineField({
      name: 'items',
      title: 'Results',
      type: 'array',
      description:
        'Centered under the project title: big number on top, short label underneath (uppercase on the site). Real measured numbers only — leave this section out until you have them. Max 3 so they stay on one line.',
      validation: (rule) =>
        rule
          .min(1)
          .max(3)
          .error('Add 1–3 results. More than three breaks the under-title row.'),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'statItem',
          title: 'Result',
          fields: [
            defineField({
              name: 'value',
              title: 'Number',
              type: 'string',
              description:
                'The big figure visitors see first — keep it short. Examples: “+415%”, “4x”, “95%”, “3 weeks”.',
              placeholder: '+415%',
              validation: (rule) =>
                rule
                  .required()
                  .error('Every result needs a number')
                  .max(12)
                  .warning('Keep the number short (about 12 characters) so the row stays even.'),
            }),
            defineField({
              name: 'label',
              title: 'What it measures',
              type: 'string',
              description:
                'Quiet line under the number. Aim for 2–5 words (e.g. “web-based user acquisition”). The site shows it in small uppercase — don’t type in ALL CAPS.',
              placeholder: 'web-based user acquisition',
              validation: (rule) =>
                rule
                  .required()
                  .error('Every result needs a short label')
                  .max(36)
                  .error(
                    'Keep labels under ~36 characters so they stay readable in the under-title row.',
                  ),
            }),
          ],
          preview: {
            select: {title: 'value', subtitle: 'label'},
            prepare({title, subtitle}) {
              return {
                title: title || 'Missing number',
                subtitle: subtitle || 'Missing label',
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: sectionPreview('internalName', 'Results'),
})

export const projectCreditsSection = defineType({
  name: 'projectCreditsSection',
  title: 'Credits',
  type: 'object',
  icon: UsersIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Credits'),
    defineField({
      name: 'items',
      title: 'Credits',
      type: 'array',
      description: 'Who did what on this project.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'creditItem',
          title: 'Credit',
          fields: [
            defineField({
              name: 'role',
              title: 'Role',
              type: 'string',
              description: 'e.g. “Strategy & Build”, “Design”.',
              validation: (rule) => rule.required().error('Every credit needs a role'),
            }),
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              description: 'e.g. “Gabriella Martins”.',
              validation: (rule) => rule.required().error('Every credit needs a name'),
            }),
          ],
          preview: {select: {title: 'role', subtitle: 'name'}},
        }),
      ],
    }),
  ],
  preview: sectionPreview('internalName', 'Credits'),
})
