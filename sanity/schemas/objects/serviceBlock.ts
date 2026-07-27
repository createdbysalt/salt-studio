import {WrenchIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * One service on the Services page (AI builds / The Salt site / Site care).
 * Shared shape — the optional fields cover the per-service differences:
 * only AI has a scene line and proof anchor; only Site care has a routing
 * line and (deliberately) no CTA.
 */
export default defineType({
  name: 'serviceBlock',
  title: 'Service',
  type: 'object',
  icon: WrenchIcon,
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'The service headline, e.g. “AI, built around you”.',
      validation: (rule) => rule.required().error('Every service needs a headline'),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 5,
      description: 'The main paragraph(s) describing this service. Plain sentences, no jargon.',
      validation: (rule) => rule.required().error('Every service needs a description'),
    }),
    defineField({
      name: 'stepsLabel',
      title: 'Steps heading',
      type: 'string',
      description: 'Heading above the steps list, e.g. “How it works” or “The deal, plainly”.',
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      description:
        'The numbered steps or plain bullets under this service. Leave the bold opener empty for plain bullets.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'serviceStep',
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
      name: 'investmentLine',
      title: 'Investment line',
      type: 'string',
      description:
        'The visible price, exactly as it should read, e.g. “pilots from $15,000 · full builds from $75,000”. Prices stay on the page — never hidden.',
    }),
    defineField({
      name: 'sceneLine',
      title: 'Scene line',
      type: 'text',
      rows: 3,
      description:
        'Optional concrete-moment paragraph that shows the service working, e.g. the Monday-morning scene. Used by the AI service.',
    }),
    defineField({
      name: 'proofAnchor',
      title: 'Proof anchor',
      type: 'text',
      rows: 3,
      description:
        'Optional credibility line placed just before the CTA. Upgrade to a named client line (e.g. MFI Canada) once their live status is confirmed.',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA button label',
      type: 'string',
      description:
        'Leave empty for no CTA — Site care intentionally has none (it’s the path for existing clients, not a cold entry point).',
      validation: (rule) => rule.max(40).warning('Keep this short — it sits in a button'),
    }),
    defineField({
      name: 'routingLine',
      title: 'Routing line',
      type: 'text',
      rows: 2,
      description:
        'Optional quiet line below the block that routes edge cases, e.g. “Have a site that needs a caretaker? Worth asking on the call.”',
    }),
  ],
  preview: {
    select: {title: 'headline', subtitle: 'investmentLine'},
  },
})
