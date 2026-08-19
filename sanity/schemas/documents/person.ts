import {UsersIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const RESERVED_ROUTE_SLUGS = [
  'work',
  'contact',
  'capabilities',
  'legal',
  'quiz',
  'projects',
  'edit',
  'brand',
  'about',
]

export default defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  icon: UsersIcon,
  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'story', title: 'Story'},
    {name: 'proof', title: 'Proof'},
    {name: 'contact', title: 'Contact'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Display name',
      type: 'string',
      group: 'overview',
      description:
        'The name shown as the heading on their About panel (e.g. “Gabriella”, “Matheus”).',
      validation: (rule) => rule.required().error('The panel needs a name to show'),
    }),
    defineField({
      name: 'shortName',
      title: 'Toggle label',
      type: 'string',
      group: 'overview',
      description: 'Short name on the Gabi | Matt toggle. Keep it to one word.',
      validation: (rule) => rule.required().error('The toggle needs a short label'),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'overview',
      description:
        'The sendable URL: /gabi or /matt. Do not use reserved site paths like work, contact, or about.',
      options: {source: 'shortName', maxLength: 96},
      validation: (rule) =>
        rule
          .required()
          .error('A slug is required so this person has a public URL')
          .custom((value) => {
            const current = value?.current?.trim().toLowerCase()
            if (!current) return true
            if (RESERVED_ROUTE_SLUGS.includes(current)) {
              return `“${current}” is already a site page. Use a first-name slug like gabi or matt.`
            }
            return true
          }),
    }),
    defineField({
      name: 'role',
      title: 'Title / role',
      type: 'string',
      group: 'overview',
      description: 'Line under the name (e.g. “Design & software”, “Growth Marketing & Sales”).',
      validation: (rule) => rule.required().error('A role helps visitors scan who this is'),
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      group: 'overview',
      description:
        'Optional one-line result or thesis under the title. Shown on the panel and used for SEO if no SEO description is set.',
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      group: 'overview',
      description:
        'Headshot used for Open Graph and Person schema. Recommended 1200×630 or a square crop with a hotspot.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description:
            'Describe the photo for screen readers (e.g. “Gabriella, founder of Salt Studio”).',
          validation: (rule) => rule.warning('Alt text improves accessibility and SEO'),
        }),
      ],
      validation: (rule) =>
        rule.warning(
          'A photo is used for the share card and Person schema. The panel still works without one.',
        ),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      group: 'overview',
      description: 'City shown on the panel meta line (e.g. “Portland, Oregon”).',
    }),
    defineField({
      name: 'availability',
      title: 'Availability',
      type: 'string',
      group: 'overview',
      description:
        'Optional. Shown only on this person’s panel if filled. Leave empty unless they wrote the sentence themselves. Do not put “open to roles” on the studio About.',
    }),
    defineField({
      name: 'sortOrder',
      title: 'Toggle order',
      type: 'number',
      group: 'overview',
      initialValue: 0,
      description: 'Lower numbers appear first on the toggle. Gabi is 0, Matt is 1.',
    }),
    defineField({
      name: 'body',
      title: 'Bio',
      type: 'array',
      group: 'story',
      description: 'Their words. Keep their voice. Shown as the main bio on the panel.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [],
          lists: [],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [{name: 'href', type: 'url', title: 'URL'}],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'showStudioVideo',
      title: 'Show studio video',
      type: 'boolean',
      group: 'story',
      initialValue: false,
      description:
        'On for Gabi — plays the existing /about/studio.mp4. Off unless this person has that film.',
    }),
    defineField({
      name: 'principles',
      title: 'Principles',
      type: 'array',
      group: 'story',
      description:
        'Gabi’s studio principles. Leave empty for Matt — he uses “How they work” instead.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'principle',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'Short principle name (e.g. “Reveal, don’t impose”).',
              validation: (rule) => rule.required().error('Each principle needs a title'),
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 3,
              description: 'One or two sentences explaining the principle.',
              validation: (rule) =>
                rule.required().error('Each principle needs a short explanation'),
            }),
          ],
          preview: {
            select: {title: 'title', subtitle: 'body'},
          },
        }),
      ],
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      group: 'proof',
      description:
        'Number + label only. Max 5. Empty slots stay unpublished — do not invent metrics.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'highlight',
          fields: [
            defineField({
              name: 'metric',
              title: 'Metric',
              type: 'string',
              description: 'The number, short — about 12 characters (e.g. “~$10M”, “21%”).',
              validation: (rule) =>
                rule
                  .required()
                  .error('A highlight needs a metric')
                  .max(16)
                  .warning('Keep the metric short so it scans'),
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'What the number is (e.g. “Revenue and contract value, eight years”).',
              validation: (rule) => rule.required().error('A highlight needs a label'),
            }),
          ],
          preview: {
            select: {title: 'metric', subtitle: 'label'},
          },
        }),
      ],
      validation: (rule) => rule.max(5).warning('More than five highlights stops scanning'),
    }),
    defineField({
      name: 'cases',
      title: 'Selected work',
      type: 'array',
      group: 'proof',
      description:
        'Optional notes for later. The About panel does not show these — shipped work lives on /work as projects.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'personCase',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'Case name (e.g. “ONE Conference — Mannahouse + Salt”).',
              validation: (rule) => rule.required().error('Each case needs a title'),
            }),
            defineField({
              name: 'role',
              title: 'Their role',
              type: 'string',
              description: 'What they owned on this work.',
            }),
            defineField({
              name: 'problem',
              title: 'Problem',
              type: 'text',
              rows: 3,
              description: 'The constraint they walked into.',
            }),
            defineField({
              name: 'whatTheyDid',
              title: 'What they did',
              type: 'text',
              rows: 4,
              description:
                'Their motion — not the studio’s website deliverables unless that was their job.',
            }),
            defineField({
              name: 'result',
              title: 'Result',
              type: 'text',
              rows: 3,
              description: 'The outcome they will stand behind in an interview.',
            }),
            defineField({
              name: 'year',
              title: 'Year',
              type: 'string',
              description: 'Optional year or range (e.g. “2025”, “2018–2020”).',
            }),
            defineField({
              name: 'relatedProject',
              title: 'Related project',
              type: 'reference',
              to: [{type: 'project'}],
              description:
                'Optional. Links this case to a project on /work when you’re allowed to show it there.',
            }),
          ],
          preview: {
            select: {title: 'title', subtitle: 'role', year: 'year'},
            prepare({title, subtitle, year}) {
              return {
                title: title || 'Untitled case',
                subtitle: [subtitle, year].filter(Boolean).join(' · ') || undefined,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'howTheyWork',
      title: 'How they work',
      type: 'array',
      group: 'proof',
      description:
        'Short process lines. Used on Matt’s panel. Leave empty if principles already cover it.',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'studioNote',
      title: 'Studio note',
      type: 'text',
      rows: 4,
      group: 'proof',
      description:
        'Optional Salt-context paragraph. Matt’s note is where 2025 lives — do not print “Salt founded 2021.”',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      group: 'contact',
      description:
        'Public email on the panel. Leave empty if you don’t have one — don’t invent it.',
      validation: (rule) => rule.email().warning('Use a real email address, or leave this blank'),
    }),
    defineField({
      name: 'linkedinUrl',
      title: 'LinkedIn',
      type: 'url',
      group: 'contact',
      description: 'Full LinkedIn profile URL.',
      validation: (rule) =>
        rule.uri({allowRelative: false, scheme: ['http', 'https']}).warning('Use a full https URL'),
    }),
    defineField({
      name: 'resume',
      title: 'Résumé',
      type: 'file',
      group: 'contact',
      description: 'PDF résumé. Shown as a download on the personal CTA set.',
      options: {accept: '.pdf'},
    }),
    defineField({
      name: 'primaryCta',
      title: 'Primary CTA',
      type: 'string',
      group: 'contact',
      description:
        'Studio = interest form + Salt-product waitlist (Gabi). Personal = email / LinkedIn / résumé (Matt).',
      options: {
        list: [
          {title: 'Studio — interest form + waitlist', value: 'studio'},
          {title: 'Personal — email, LinkedIn, résumé', value: 'personal'},
        ],
        layout: 'radio',
      },
      initialValue: 'studio',
      validation: (rule) => rule.required().error('Pick which buttons this panel should show'),
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      group: 'seo',
      description:
        'Browser tab and share title. Defaults to “Name · Role” if empty. Keep under 60 characters.',
      validation: (rule) => rule.max(60).warning('Longer titles get truncated in search results'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'Meta description. Falls back to the headline. Keep under 155 characters.',
      validation: (rule) =>
        rule.max(155).warning('Longer descriptions get cut off in Google results'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Share image',
      type: 'image',
      group: 'seo',
      description: 'Optional. If empty, the photo is used for Open Graph.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the share image for accessibility.',
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Toggle order',
      name: 'sortOrderAsc',
      by: [{field: 'sortOrder', direction: 'asc'}],
    },
    {
      title: 'Name',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      slug: 'slug.current',
      media: 'photo',
    },
    prepare({title, subtitle, slug, media}) {
      return {
        title: title || 'Untitled person',
        subtitle: [subtitle, slug ? `/${slug}` : null].filter(Boolean).join(' · ') || undefined,
        media,
      }
    },
  },
})
