import {WrenchIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Service — one of Salt’s offerings (Websites, AI, Software, Growth).
 *
 * Source of truth for the homepage “How we can help” band and the service
 * detail panel: what it is, what you get, what we use, proof, and the next step.
 */
export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  icon: WrenchIcon,
  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'offer', title: 'Offer'},
    {name: 'detail', title: 'Detail panel'},
    {name: 'proof', title: 'Proof'},
    {name: 'nextStep', title: 'Next step'},
  ],
  fields: [
    // ─── Overview ───
    defineField({
      name: 'title',
      title: 'Service name',
      type: 'string',
      group: 'overview',
      description: 'Shown as the big title on the homepage, e.g. “AI builds”.',
      validation: (rule) => rule.required().error('Every service needs a name'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'overview',
      description: 'Stable id for this service. Click Generate from the name.',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required().error('Slug is required so we can link this service'),
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      group: 'overview',
      description:
        'Optional longer headline for the detail panel or services page, e.g. “AI, built around you”. Falls back to the service name.',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short description',
      type: 'text',
      rows: 3,
      group: 'overview',
      description:
        'One or two plain sentences under the title when this service is expanded on the homepage.',
      validation: (rule) => rule.required().error('Add a short description for the homepage list'),
    }),
    defineField({
      name: 'priceLine',
      title: 'Investment line',
      type: 'string',
      group: 'overview',
      description:
        'Visible starting price, exactly as it should read — e.g. “Pilots from $15,000 · full builds from $75,000”. Keep it true.',
    }),
    defineField({
      name: 'timelineLine',
      title: 'Timeline summary',
      type: 'string',
      group: 'overview',
      description:
        'One-line duration summary shown near the investment line, e.g. “6–10 weeks” or “Ongoing, month to month”.',
    }),
    defineField({
      name: 'linkLabel',
      title: 'List link label',
      type: 'string',
      group: 'overview',
      initialValue: 'See how it works',
      description: 'Label under the short description that opens the detail panel.',
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort order',
      type: 'number',
      group: 'overview',
      initialValue: 0,
      description: 'Lower numbers appear first when services are listed without a custom order.',
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background image',
      type: 'image',
      group: 'overview',
      options: {hotspot: true},
      description:
        'Full-bleed still behind this service when it’s active on the homepage. Also used as the poster if a video is set.',
    }),
    defineField({
      name: 'backgroundVideoUrl',
      title: 'Background video URL',
      type: 'url',
      group: 'overview',
      description:
        'Optional. MP4 (preferred) or Vimeo URL. Plays muted, looping, full-bleed when this service is active.',
      validation: (rule) =>
        rule.uri({allowRelative: false, scheme: ['http', 'https']}).warning('Use a full URL'),
    }),

    // ─── Offer ───
    defineField({
      name: 'timeline',
      title: 'Timeline',
      type: 'array',
      group: 'offer',
      description:
        'Phased timeline for this engagement — e.g. Pilot → Build → Handoff. Shown in the detail panel under “Timeline”.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'serviceTimelinePhase',
          title: 'Phase',
          fields: [
            defineField({
              name: 'label',
              title: 'Phase name',
              type: 'string',
              description: 'e.g. “Pilot”, “Build”, “Launch”.',
              validation: (rule) => rule.required().error('Every phase needs a name'),
            }),
            defineField({
              name: 'duration',
              title: 'Duration',
              type: 'string',
              description: 'e.g. “2–3 weeks”, “Month 1”, “Ongoing”.',
              validation: (rule) => rule.required().error('Every phase needs a duration'),
            }),
            defineField({
              name: 'detail',
              title: 'Detail',
              type: 'text',
              rows: 2,
              description: 'Optional one-line clarification of what happens in this phase.',
            }),
          ],
          preview: {
            select: {title: 'label', subtitle: 'duration'},
          },
        }),
      ],
      validation: (rule) =>
        rule.max(6).warning('Three to five phases usually reads clearer than a long schedule'),
    }),
    defineField({
      name: 'deliverables',
      title: 'Deliverables',
      type: 'array',
      group: 'offer',
      description:
        'What the client actually walks away with — e.g. “Custom AI assistant”, “Admin handoff”, “Training session”. Shown in the detail panel.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'serviceDeliverable',
          title: 'Deliverable',
          fields: [
            defineField({
              name: 'title',
              title: 'Deliverable',
              type: 'string',
              description: 'Short name of what’s delivered.',
              validation: (rule) => rule.required().error('Every deliverable needs a name'),
            }),
            defineField({
              name: 'detail',
              title: 'Detail',
              type: 'text',
              rows: 2,
              description: 'Optional one-line clarification.',
            }),
          ],
          preview: {
            select: {title: 'title', subtitle: 'detail'},
          },
        }),
      ],
      validation: (rule) =>
        rule
          .max(10)
          .warning('Keep the list scannable — six clear deliverables beat twelve vague ones'),
    }),
    defineField({
      name: 'plans',
      title: 'Plans',
      type: 'array',
      group: 'offer',
      description:
        'Optional pricing tiers shown in the detail panel — e.g. “Steady” and “Priority” for a retainer. Leave empty for services with a single price.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'servicePlan',
          title: 'Plan',
          fields: [
            defineField({
              name: 'name',
              title: 'Plan name',
              type: 'string',
              description: 'Short tier name, e.g. “Steady” or “Priority”.',
              validation: (rule) => rule.required().error('Every plan needs a name'),
            }),
            defineField({
              name: 'price',
              title: 'Price',
              type: 'string',
              description: 'Exactly as it should read, e.g. “$600/mo”. Keep it true.',
              validation: (rule) => rule.required().error('Every plan needs a price'),
            }),
            defineField({
              name: 'summary',
              title: 'Summary',
              type: 'text',
              rows: 2,
              description: 'One line on who this plan is for or what makes it different.',
            }),
            defineField({
              name: 'features',
              title: 'What’s included',
              type: 'array',
              of: [defineArrayMember({type: 'string'})],
              description:
                'Short bullets — the few things that define this tier. Keep them scannable.',
            }),
            defineField({
              name: 'highlight',
              title: 'Highlight this plan',
              type: 'boolean',
              initialValue: false,
              description: 'Give this tier a subtle accent to nudge it as the recommended choice.',
            }),
          ],
          preview: {
            select: {title: 'name', subtitle: 'price'},
          },
        }),
      ],
      validation: (rule) =>
        rule.max(3).warning('Two or three plans reads clearer than a long menu'),
    }),
    defineField({
      name: 'capabilities',
      title: 'Capabilities',
      type: 'array',
      group: 'offer',
      description:
        'Tools, platforms, and disciplines this service uses — from Dynamic Content → Capabilities (e.g. Next.js, Sanity, OpenAI).',
      of: [defineArrayMember({type: 'reference', to: [{type: 'capability'}]})],
    }),
    defineField({
      name: 'workCategories',
      title: 'Work categories',
      type: 'array',
      group: 'offer',
      description:
        'Optional. Which Work categories this service typically lives in (e.g. Web & Digital, Brand & Identity).',
      of: [defineArrayMember({type: 'reference', to: [{type: 'workCategory'}]})],
    }),
    defineField({
      name: 'idealFor',
      title: 'Good fit if',
      type: 'array',
      group: 'offer',
      description:
        'Who this service is for — short bullets, e.g. “One decision-maker who can say yes”. Helps the right people self-select.',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'notAFit',
      title: 'Not a fit if',
      type: 'array',
      group: 'offer',
      description:
        'Who this service is not for — kind, clear bullets. Wrong-fit visitors bouncing is a success.',
      of: [defineArrayMember({type: 'string'})],
    }),

    // ─── Detail panel ───
    defineField({
      name: 'detailEyebrow',
      title: 'Panel eyebrow',
      type: 'string',
      group: 'detail',
      initialValue: 'How it works',
      description: 'Small label at the top of the side panel.',
    }),
    defineField({
      name: 'detailBody',
      title: 'Panel body',
      type: 'text',
      rows: 10,
      group: 'detail',
      description:
        'Longer explanation in the side panel. Separate paragraphs with a blank line. Falls back to the short description if empty.',
    }),
    defineField({
      name: 'sceneLine',
      title: 'Scene line',
      type: 'text',
      rows: 3,
      group: 'detail',
      description:
        'Optional concrete-moment paragraph that shows the service working — e.g. a Monday-morning scene for AI builds.',
    }),
    defineField({
      name: 'stepsLabel',
      title: 'Steps heading',
      type: 'string',
      group: 'detail',
      description: 'Optional heading above the steps, e.g. “How it works” or “The deal, plainly”.',
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      group: 'detail',
      description: 'Numbered steps that explain how this engagement runs.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'serviceDetailStep',
          title: 'Step',
          fields: [
            defineField({
              name: 'lead',
              title: 'Bold opener',
              type: 'string',
              description:
                'Optional short bold phrase that opens the step, e.g. “Pilot first.” Leave empty for a plain bullet.',
            }),
            defineField({
              name: 'text',
              title: 'Text',
              type: 'text',
              rows: 3,
              description: 'The rest of the step.',
              validation: (rule) => rule.required().error('Every step needs text'),
            }),
          ],
          preview: {
            select: {title: 'lead', subtitle: 'text'},
            prepare({title, subtitle}) {
              return {title: title || subtitle || 'Step', subtitle: title ? subtitle : undefined}
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'detailImage',
      title: 'Panel image',
      type: 'image',
      group: 'detail',
      options: {hotspot: true},
      description: 'Optional image at the bottom of the side panel.',
    }),

    // ─── Proof ───
    defineField({
      name: 'featuredProjects',
      title: 'Key projects',
      type: 'array',
      group: 'proof',
      description:
        'Projects that best showcase this service. Shown in the detail panel as proof of the work.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'project'}]})],
      validation: (rule) =>
        rule.max(6).warning('Keep this tight — three strong projects beat a long list'),
    }),
    defineField({
      name: 'testimonials',
      title: 'Key testimonials',
      type: 'array',
      group: 'proof',
      description: 'Client quotes specifically about this service. Shown in the detail panel.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'testimonial'}]})],
      validation: (rule) =>
        rule.max(4).warning('One or two strong quotes usually land harder than a stack'),
    }),
    defineField({
      name: 'clients',
      title: 'Related clients',
      type: 'array',
      group: 'proof',
      description: 'Optional. Clients associated with this service for a quiet proof strip.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'client'}]})],
      validation: (rule) =>
        rule.max(8).warning('A short roster reads stronger than a wall of names'),
    }),
    defineField({
      name: 'proofAnchor',
      title: 'Proof anchor',
      type: 'text',
      rows: 3,
      group: 'proof',
      description:
        'Optional credibility line placed just before the next-step CTA — e.g. a named client outcome once it’s cleared to publish.',
    }),

    // ─── Next step ───
    defineField({
      name: 'nextStep',
      title: 'Next step',
      type: 'reference',
      group: 'nextStep',
      to: [{type: 'callToAction'}],
      description:
        'What someone should do after reading this service — usually “Request a conversation”. Leave empty for offerings that shouldn’t cold-CTA (e.g. Site care). Managed under Dynamic Content → CTAs.',
    }),
    defineField({
      name: 'fitCheckLabel',
      title: 'Quiz CTA label',
      type: 'string',
      group: 'nextStep',
      initialValue: 'See how much this could help',
      description:
        'Secondary CTA next to “Request a conversation” — sends people to the Salt Score quiz to see how useful this service could be. Leave empty to hide it.',
      validation: (rule) =>
        rule.max(48).warning('Keep this short — it sits beside the discovery-call link'),
    }),
    defineField({
      name: 'fitCheckHref',
      title: 'Quiz CTA link',
      type: 'string',
      group: 'nextStep',
      initialValue: '/quiz',
      description:
        'Where the quiz CTA goes. Use /quiz for the Salt Score quiz. Leave empty to hide the button even if a label is set.',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value?.trim()) return true
          const href = value.trim()
          if (href.startsWith('/') || href.startsWith('http://') || href.startsWith('https://')) {
            return true
          }
          return 'Use a site path like /quiz, or a full https:// URL'
        }),
    }),
    defineField({
      name: 'routingLine',
      title: 'Routing line',
      type: 'text',
      rows: 2,
      group: 'nextStep',
      description:
        'Optional quiet line below the CTA that routes edge cases — e.g. “Have a site that needs a caretaker? Worth asking on the call.”',
    }),
  ],
  orderings: [
    {
      title: 'Sort order',
      name: 'sortOrderAsc',
      by: [
        {field: 'sortOrder', direction: 'asc'},
        {field: 'title', direction: 'asc'},
      ],
    },
    {
      title: 'Title',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'priceLine',
      media: 'backgroundImage',
    },
    prepare({title, subtitle, media}) {
      return {
        title: title || 'Untitled service',
        subtitle: subtitle || undefined,
        media,
      }
    },
  },
})
