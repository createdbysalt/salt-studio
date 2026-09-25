import {
  enabledField,
  sectionInternalNameField,
  sectionPreview,
} from '@/sanity/schemas/shared/sectionInternalName'
import {
  BlockContentIcon,
  BulbOutlineIcon,
  ChartUpwardIcon,
  CheckmarkCircleIcon,
  DocumentTextIcon,
  HelpCircleIcon,
  ImageIcon,
  ListIcon,
  MobileDeviceIcon,
  PinIcon,
  StarIcon,
  TagIcon,
  UsersIcon,
} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Landing page sections (paid-traffic page builder).
 * Live in the `sections` array on `landingPage`; drag to reorder, toggle to hide.
 * Every button on the page uses the document-level ctaLabel / ctaLink, so the
 * CTA sections carry only a headline and a subhead.
 *
 * Section order and evidence: Salt Studio/Marketing/churches-landing/05-landing-page-template.md
 * DRAFT: not yet run through `npm run typegen`.
 */

const headline = (description: string, required = false) =>
  defineField({
    name: 'headline',
    title: 'Headline',
    type: 'string',
    description,
    validation: required
      ? (rule) => rule.required().error('This section needs a headline')
      : undefined,
  })

export const lpHeroSection = defineType({
  name: 'lpHeroSection',
  title: 'Hero',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Hero'),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description:
        'Small line above the headline naming who this is for, e.g. "For churches in the US and Canada".',
    }),
    defineField({
      name: 'headline',
      title: 'Headline (H1)',
      type: 'string',
      description:
        'The one H1 on the page. Keep the phrase people searched for (e.g. "church website design") and the outcome. Under 10 words.',
      validation: (rule) => rule.required().error('The hero needs a headline'),
    }),
    defineField({
      name: 'subheadline',
      title: 'Sub-headline',
      type: 'text',
      rows: 2,
      description:
        'One sentence on how it works. This is not the Google description; that lives in Search & Sharing.',
    }),
    defineField({
      name: 'proofLine',
      title: 'Proof line',
      type: 'string',
      description:
        'One short trust line under the button: a number, a rating, or "Trusted by churches across the US and Canada".',
    }),
    defineField({
      name: 'secondaryLinkLabel',
      title: 'Secondary link label',
      type: 'string',
      description:
        'A low-commitment link next to the button, e.g. "See how it works". Leave empty to hide.',
      initialValue: 'See how it works',
    }),
    defineField({
      name: 'secondaryLinkTarget',
      title: 'Secondary link scrolls to',
      type: 'string',
      description: 'Which section it scrolls to.',
      options: {
        list: [
          {title: 'The system', value: 'system'},
          {title: 'How it works', value: 'process'},
          {title: 'Price', value: 'pricing'},
        ],
      },
      initialValue: 'process',
    }),
    defineField({
      name: 'image',
      title: 'Image (optional)',
      type: 'image',
      description:
        'Optional small image beside the text. No video here: the first screen must load fast on phones.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the image for screen readers and SEO.',
        }),
      ],
    }),
  ],
  preview: sectionPreview('headline', 'Hero'),
})

export const lpLogoSection = defineType({
  name: 'lpLogoSection',
  title: 'Client logos',
  type: 'object',
  icon: ImageIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Client logos'),
    defineField({
      name: 'logos',
      title: 'Logos',
      type: 'logoCarousel',
      description:
        'Reuses the site logo carousel. Use the church or ministry name as the logo name; it becomes the alt text.',
    }),
  ],
  preview: sectionPreview('logos.title', 'Client logos'),
})

export const lpProblemSection = defineType({
  name: 'lpProblemSection',
  title: 'The problem',
  type: 'object',
  icon: BulbOutlineIcon,
  fields: [
    enabledField,
    sectionInternalNameField('The problem'),
    headline('e.g. "The family that came on Easter".', true),
    defineField({
      name: 'scene',
      title: 'Opening scene',
      type: 'text',
      rows: 5,
      description:
        'One concrete moment, 3 or 4 short sentences. Separate paragraphs with a blank line.',
    }),
    defineField({
      name: 'pains',
      title: 'Pains, in their words',
      type: 'array',
      description: 'Three short bullets at most. Their words, not ours.',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.max(4).warning('Three bullets read better than four'),
    }),
    defineField({
      name: 'statLine',
      title: 'Cited statistic',
      type: 'text',
      rows: 2,
      description: 'One sentence with a real number. Name the source in the next field.',
    }),
    defineField({
      name: 'statSourceLabel',
      title: 'Source label',
      type: 'string',
      description: 'e.g. "Lifeway Research, 2023".',
    }),
    defineField({
      name: 'statSourceUrl',
      title: 'Source link',
      type: 'url',
      description: 'Opens in a new tab.',
    }),
    defineField({
      name: 'closingLine',
      title: 'Closing line',
      type: 'text',
      rows: 2,
      description:
        'The insight, one or two sentences, shown bold. It lands at the end, not the start.',
    }),
  ],
  preview: sectionPreview('headline', 'The problem'),
})

export const lpSystemSection = defineType({
  name: 'lpSystemSection',
  title: 'The system',
  type: 'object',
  icon: ListIcon,
  fields: [
    enabledField,
    sectionInternalNameField('The system'),
    defineField({
      name: 'systemName',
      title: 'System name',
      type: 'string',
      description:
        'A short name for the offer so it reads as one plan, e.g. "The Front Door Plan". Optional.',
    }),
    headline('e.g. "Found. Welcomed. Followed up."', true),
    defineField({
      name: 'bridgeLine',
      title: 'Bridge line',
      type: 'text',
      rows: 2,
      description:
        'For people who searched for a website: "Yes, we build the website. It is the front door, not the whole house."',
    }),
    defineField({
      name: 'parts',
      title: 'The three parts',
      type: 'array',
      description: 'Exactly three. Each gets a short title and two lines.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'lpSystemPart',
          title: 'Part',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 3,
              description: 'Two lines.',
            }),
            defineField({
              name: 'statLine',
              title: 'Statistic (optional)',
              type: 'text',
              rows: 2,
              description:
                'One cited number that backs this part, with the source named in the sentence.',
            }),
          ],
          preview: {select: {title: 'title', subtitle: 'body'}},
        }),
      ],
      validation: (rule) => rule.min(3).max(3).error('The system has three parts'),
    }),
    defineField({
      name: 'closingLine',
      title: 'Closing line',
      type: 'string',
      description: 'e.g. "One plan, not a prettier site."',
    }),
  ],
  preview: sectionPreview('headline', 'The system'),
})

export const lpDeliverableSection = defineType({
  name: 'lpDeliverableSection',
  title: 'Show the deliverable',
  type: 'object',
  icon: MobileDeviceIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Show the deliverable'),
    headline('e.g. "What your guests will see".'),
    defineField({
      name: 'mockupImage',
      title: 'Phone mockup',
      type: 'image',
      description:
        'A real Plan a Visit page on a phone, with the welcome text sequence beside it. Real client work only, compressed under 200 KB.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe what the mockup shows.',
          validation: (rule) => rule.required().warning('Alt text improves accessibility and SEO'),
        }),
      ],
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'One line under the image.',
    }),
  ],
  preview: sectionPreview('headline', 'Show the deliverable'),
})

export const lpProcessSection = defineType({
  name: 'lpProcessSection',
  title: 'How it works',
  type: 'object',
  icon: PinIcon,
  fields: [
    enabledField,
    sectionInternalNameField('How it works'),
    headline('e.g. "Your first 90 days".', true),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      description:
        'Five or six steps, each with a timeframe. Make the Monday check a step and day 90 a decision.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'lpProcessStep',
          title: 'Step',
          fields: [
            defineField({
              name: 'timeframe',
              title: 'When',
              type: 'string',
              description: 'e.g. "Week 1" or "Every Monday".',
            }),
            defineField({
              name: 'label',
              title: 'Step title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({name: 'body', title: 'What happens', type: 'text', rows: 3}),
          ],
          preview: {
            select: {title: 'label', subtitle: 'timeframe'},
          },
        }),
      ],
      validation: (rule) => rule.max(6).warning('Six steps at most'),
    }),
  ],
  preview: sectionPreview('headline', 'How it works'),
})

export const lpMeasurementSection = defineType({
  name: 'lpMeasurementSection',
  title: 'What you will know',
  type: 'object',
  icon: ChartUpwardIcon,
  fields: [
    enabledField,
    sectionInternalNameField('What you will know'),
    headline('e.g. "What you will know every month".', true),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 2}),
    defineField({
      name: 'bullets',
      title: 'What gets measured',
      type: 'array',
      description: 'Three bullets. Only promise what can be counted.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'lpMeasurementBullet',
          title: 'Bullet',
          fields: [
            defineField({name: 'lead', title: 'Bold opener', type: 'string'}),
            defineField({name: 'text', title: 'Text', type: 'text', rows: 2}),
          ],
          preview: {select: {title: 'lead', subtitle: 'text'}},
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'limitsLine',
      title: 'What we will not promise',
      type: 'text',
      rows: 2,
      description:
        'One honest sentence, e.g. "We report sign-ups and confirmed guests, never attendance percentages."',
    }),
  ],
  preview: sectionPreview('headline', 'What you will know'),
})

export const lpProofSection = defineType({
  name: 'lpProofSection',
  title: 'Proof',
  type: 'object',
  icon: StarIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Proof'),
    headline('e.g. "What this looks like for churches like yours".', true),
    defineField({
      name: 'cases',
      title: 'Mini cases',
      type: 'array',
      description: 'Three at most. One number each, linked to the project page.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'lpProofCase',
          title: 'Case',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 3,
              description: 'Two or three lines.',
            }),
            defineField({
              name: 'number',
              title: 'The number',
              type: 'string',
              description: 'e.g. "+21%" or "4x".',
            }),
            defineField({
              name: 'numberLabel',
              title: 'What the number is',
              type: 'string',
              description: 'e.g. "registrations year over year".',
            }),
            defineField({
              name: 'project',
              title: 'Project page',
              type: 'reference',
              to: [{type: 'project'}],
              description: 'Links the case to its project page.',
            }),
          ],
          preview: {select: {title: 'title', subtitle: 'number'}},
        }),
      ],
      validation: (rule) => rule.max(3).warning('Three cases read better than more'),
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      description:
        'Quotes with a name, church, town and photo. The block stays hidden on the site until at least one is added, so it is safe to leave empty.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'testimonial'}]})],
      validation: (rule) => rule.max(4),
    }),
  ],
  preview: sectionPreview('headline', 'Proof'),
})

export const lpCtaSection = defineType({
  name: 'lpCtaSection',
  title: 'Button',
  type: 'object',
  icon: CheckmarkCircleIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Button'),
    headline(
      'Short line above the button, e.g. "Want to see what this could look like for your church?"',
    ),
    defineField({
      name: 'subhead',
      title: 'Line under the button',
      type: 'text',
      rows: 2,
      description:
        'Leave empty to use the page-level line. The button label and link come from the page setup.',
    }),
  ],
  preview: sectionPreview('headline', 'Button'),
})

export const lpPricingSection = defineType({
  name: 'lpPricingSection',
  title: 'Price',
  type: 'object',
  icon: TagIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Price'),
    headline('e.g. "What it costs. All of it."', true),
    defineField({
      name: 'launchName',
      title: 'Launch name',
      type: 'string',
      description: 'e.g. "The 90-day Launch".',
    }),
    defineField({
      name: 'launchPrice',
      title: 'Launch price line',
      type: 'string',
      description: 'Exactly as it should read, e.g. "$4,950".',
    }),
    defineField({
      name: 'launchPaymentLine',
      title: 'Payment option',
      type: 'string',
      description: 'e.g. "Or 3 payments of $1,650."',
    }),
    defineField({
      name: 'inclusions',
      title: 'What the launch includes',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.max(8).warning('Seven bullets at most'),
    }),
    defineField({
      name: 'monthlyPrice',
      title: 'Monthly price line',
      type: 'string',
      description: 'e.g. "After 90 days: $750 a month".',
    }),
    defineField({
      name: 'monthlyTerms',
      title: 'Monthly terms',
      type: 'text',
      rows: 2,
      description: 'e.g. "Cancel anytime. No annual contract."',
    }),
    defineField({
      name: 'adSpendLine',
      title: 'Ad budget line',
      type: 'text',
      rows: 2,
      description: 'Who pays the ad platforms and who sets the budget.',
    }),
    defineField({
      name: 'grantsLine',
      title: 'Google Ad Grants line',
      type: 'text',
      rows: 3,
      description: 'Use the verified eligibility wording. Keep it true.',
    }),
    defineField({
      name: 'websiteLine',
      title: 'Full website line',
      type: 'string',
      description: 'One line, e.g. "Want the whole website rebuilt too? Full website: $5,600."',
    }),
  ],
  preview: sectionPreview('headline', 'Price'),
})

export const lpFitSection = defineType({
  name: 'lpFitSection',
  title: 'Fit / not a fit',
  type: 'object',
  icon: UsersIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Fit / not a fit'),
    headline('e.g. "Is this for your church?"'),
    defineField({
      name: 'goodFitLabel',
      title: '"Good fit" heading',
      type: 'string',
      initialValue: 'A good fit if',
    }),
    defineField({
      name: 'goodFitPoints',
      title: '"Good fit" bullets',
      type: 'array',
      of: [defineArrayMember({type: 'text', rows: 2})],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'notFitLabel',
      title: '"Not a fit" heading',
      type: 'string',
      initialValue: 'Not a fit if',
    }),
    defineField({
      name: 'notFitPoints',
      title: '"Not a fit" bullets',
      type: 'array',
      description: 'Kind, clear bullets. Wrong-fit visitors leaving is a success.',
      of: [defineArrayMember({type: 'text', rows: 2})],
      validation: (rule) => rule.max(4),
    }),
  ],
  preview: sectionPreview('headline', 'Fit / not a fit'),
})

export const lpTeamSection = defineType({
  name: 'lpTeamSection',
  title: 'Who you will work with',
  type: 'object',
  icon: UsersIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Who you will work with'),
    headline('e.g. "Who you will work with".'),
    defineField({
      name: 'people',
      title: 'People',
      type: 'array',
      description: 'Pulls name, role, photo and page link from each person document.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'person'}]})],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'roles',
      title: 'What each person does on this offer',
      type: 'array',
      description:
        'One line per person, in the same order as above, e.g. "Gabi designs and builds your website."',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'founderLine',
      title: 'Founder line',
      type: 'text',
      rows: 3,
      description:
        'One or two sentences in the first person. Shown as a short note with the founder photo.',
    }),
  ],
  preview: sectionPreview('headline', 'Who you will work with'),
})

export const lpFaqSection = defineType({
  name: 'lpFaqSection',
  title: 'FAQ',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    enabledField,
    sectionInternalNameField('FAQ'),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'faq',
      description:
        'Reuses the site FAQ block. Answers 40 to 60 words, first sentence is the direct answer. Rendered collapsed; also emitted as FAQPage structured data.',
    }),
  ],
  preview: {
    select: {internalName: 'internalName', title: 'faq.title', enabled: 'enabled'},
    prepare({internalName, title, enabled}) {
      const base = title || internalName || 'FAQ'
      return {title: base, subtitle: enabled === false ? 'FAQ · Hidden' : 'FAQ'}
    },
  },
})

export const lpFinalCtaSection = defineType({
  name: 'lpFinalCtaSection',
  title: 'Final call to action',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    enabledField,
    sectionInternalNameField('Final call to action'),
    headline(
      'Restate the promise in one line, e.g. "Let\'s help the next new family find you."',
      true,
    ),
    defineField({name: 'subhead', title: 'Line under the button', type: 'text', rows: 2}),
    defineField({
      name: 'secondaryLinkLabel',
      title: 'Secondary link label',
      type: 'string',
      description: 'Small text link under the button for people who want to email first.',
      initialValue: 'Prefer to email first? Send us a note.',
    }),
    defineField({
      name: 'secondaryLinkHref',
      title: 'Secondary link',
      type: 'string',
      description: 'Usually /contact.',
      initialValue: '/contact',
    }),
  ],
  preview: sectionPreview('headline', 'Final call to action'),
})

/** Everything to register in sanity.config.ts `schema.types`. */
export const landingSections = [
  lpHeroSection,
  lpLogoSection,
  lpProblemSection,
  lpSystemSection,
  lpDeliverableSection,
  lpProcessSection,
  lpMeasurementSection,
  lpProofSection,
  lpCtaSection,
  lpPricingSection,
  lpFitSection,
  lpTeamSection,
  lpFaqSection,
  lpFinalCtaSection,
]
