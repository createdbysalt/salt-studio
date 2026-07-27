import {UsersIcon} from '@sanity/icons'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  icon: UsersIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'settings', title: 'Settings'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      group: 'content',
      description: 'Full name as it appears on the Studio page crew section.',
      validation: (rule) => rule.required().error('Name is required for the crew grid'),
    }),
    defineField({
      name: 'title',
      title: 'Role title',
      type: 'string',
      group: 'content',
      description:
        'Space-themed job title shown under the portrait (e.g. "Chief Photometrics", "Mission Control").',
      validation: (rule) =>
        rule.required().error('Role title appears under each portrait on /studio'),
    }),
    defineField({
      name: 'affiliation',
      title: 'Partner studio',
      type: 'reference',
      to: [{type: 'partnerStudio'}],
      group: 'content',
      description:
        'Optional. Pick the outside partner studio this person is credited under. Leave blank for in-house crew. Add or edit studios under Dynamic Content → Partner Studios.',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      group: 'content',
      description: 'Optional contact email for this crew member.',
      validation: (rule) => rule.email().warning('Enter a valid email address'),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 3,
      group: 'content',
      description:
        'Optional short bio. Not shown on the current Studio layout unless we add it later.',
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      group: 'content',
      description:
        'Headshot for the Studio page crew grid. Recommended: square, at least 800×800px.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the portrait for screen readers and SEO.',
          validation: (rule) => rule.warning('Alt text improves accessibility and SEO'),
        }),
      ],
    }),
    defineField({
      name: 'tier',
      title: 'Portrait size',
      type: 'string',
      group: 'settings',
      description:
        'Lead = larger portrait on the top row (company heads). Support = smaller portrait on the bottom row.',
      options: {
        list: [
          {title: 'Lead — top row (large)', value: 'lead'},
          {title: 'Support — bottom row (small)', value: 'support'},
        ],
        layout: 'radio',
      },
      initialValue: 'support',
      validation: (rule) => rule.required(),
    }),
    orderRankField({type: 'teamMember'}),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: {
      title: 'name',
      subtitle: 'title',
      tier: 'tier',
      studio: 'affiliation.name',
      media: 'portrait',
    },
    prepare({title, subtitle, tier, studio, media}) {
      const tierLabel = tier === 'lead' ? 'Lead' : 'Support'
      return {
        title: title || 'Untitled',
        subtitle: [subtitle, tierLabel, studio].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
