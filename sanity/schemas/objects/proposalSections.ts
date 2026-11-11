import {defineArrayMember, defineField, defineType} from 'sanity'

function shownField() {
  return defineField({
    name: 'enabled',
    title: 'Show this section',
    type: 'boolean',
    initialValue: true,
    description: 'Turn this off to hide the section on the proposal without deleting it.',
  })
}

export const proposalCoverSection = defineType({
  name: 'proposalCoverSection',
  title: 'Cover',
  type: 'object',
  fields: [
    shownField(),
    defineField({
      name: 'outcomeHeadline',
      title: 'Outcome headline',
      type: 'string',
      description:
        'The one line the client sees first, centered on the cover. Lead with the result, not the word “Proposal”. Write the full sentence here, including the word you will stress. The stressed word is set in Headline emphasis, not with markdown or HTML.',
      validation: (rule) =>
        rule.required().max(140).error('Write the outcome in one line, under 140 characters'),
    }),
    defineField({
      name: 'headlineEmphasis',
      title: 'Headline emphasis',
      type: 'string',
      description:
        'One word or short phrase copied exactly from Outcome headline, including capitals and spaces. The cover sets only this phrase in Instrument Serif italic. The rest of the line stays in Geist. One emphasis per cover. Leave empty for no emphasis. Example: Outcome headline “A website the parish can keep.” and Headline emphasis “keep”. Do not wrap it in asterisks, quotes, or HTML.',
      validation: (rule) =>
        rule.max(48).custom((value, context) => {
          if (!value || typeof value !== 'string') return true
          const headline =
            (context.parent as {outcomeHeadline?: string} | undefined)?.outcomeHeadline ?? ''
          if (!headline.includes(value)) {
            return 'Copy the word or phrase exactly from the outcome headline, including capitals.'
          }
          return true
        }),
    }),
    defineField({
      name: 'effectPhrase',
      title: 'Effect phrase',
      type: 'string',
      description:
        'One short sentence shown inside the cover frame when no cover image is set. It states the effect of the outcome headline and should complement that line, not repeat it. Do not use the client name. The client name already sits in the top lockup. Plain sentence, no markdown or HTML. Example: outcome headline “A website the parish can keep.” and effect phrase “The office can publish it.”',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      options: {hotspot: true},
      description:
        'Optional. A wide picture at the bottom of the cover, usually a mockup of the proposed site. Landscape, at least 2000px wide. Leave empty and the cover shows a plain paper panel in that same frame. Do not upload another client’s screenshot.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description:
            'What the picture shows, for example “Homepage mockup for Harbor Parish.” Required when a cover image is set.',
          validation: (rule) =>
            rule.custom((value, context) => {
              const parent = context.parent as {asset?: {_ref?: string}} | undefined
              if (parent?.asset?._ref && !value) return 'Describe the cover image'
              return true
            }),
        }),
      ],
    }),
    defineField({
      name: 'preparedBy',
      title: 'Prepared by',
      type: 'string',
      initialValue: 'Gabriella Martins, Salt Studio',
      description:
        'Who prepared this proposal. Kept on the document. The cover does not print this line.',
    }),
  ],
  preview: {
    select: {title: 'outcomeHeadline', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {title: 'Cover', subtitle: enabled === false ? 'Hidden' : title}
    },
  },
})

export const proposalSituationSection = defineType({
  name: 'proposalSituationSection',
  title: 'The situation',
  type: 'object',
  fields: [
    shownField(),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'The situation',
      description: 'Section heading. Keep their problem in their words in the cards below.',
    }),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      description: 'Two to four short cards. Use their words, and say what is at stake.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'proposalSituationCard',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'A short label for this part of the situation.',
              validation: (rule) => rule.required().error('Each card needs a title'),
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 4,
              description: 'Their problem, in their words.',
              validation: (rule) => rule.required().error('Write what they told you'),
            }),
          ],
          preview: {select: {title: 'title', subtitle: 'body'}},
        }),
      ],
      validation: (rule) =>
        rule.max(4).warning('Two to four cards is enough. More than that becomes a document.'),
    }),
  ],
  preview: {
    select: {enabled: 'enabled'},
    prepare({enabled}) {
      return {title: 'The situation', subtitle: enabled === false ? 'Hidden' : 'Shown'}
    },
  },
})

export const proposalOutcomesSection = defineType({
  name: 'proposalOutcomesSection',
  title: 'The outcome',
  type: 'object',
  fields: [
    shownField(),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'What changes',
      description: 'Heading above the three result cards.',
    }),
    defineField({
      name: 'cards',
      title: 'Result cards',
      type: 'array',
      description: 'Three results. Use a real number only when you have a source for it.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'proposalOutcomeCard',
          fields: [
            defineField({
              name: 'title',
              title: 'Result',
              type: 'string',
              description: 'The change, in a few words.',
              validation: (rule) => rule.required().error('Name the result'),
            }),
            defineField({
              name: 'body',
              title: 'Detail',
              type: 'text',
              rows: 3,
              description: 'What that change means for them. No invented metrics.',
              validation: (rule) => rule.required().error('Explain the result'),
            }),
          ],
          preview: {select: {title: 'title'}},
        }),
      ],
      validation: (rule) => rule.max(3).error('Keep this to three results'),
    }),
  ],
  preview: {
    select: {enabled: 'enabled'},
    prepare({enabled}) {
      return {title: 'The outcome', subtitle: enabled === false ? 'Hidden' : 'Shown'}
    },
  },
})

export const proposalPhasesSection = defineType({
  name: 'proposalPhasesSection',
  title: 'Approach',
  type: 'object',
  fields: [
    shownField(),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'How we get there',
      description: 'Heading for the timeline.',
    }),
    defineField({
      name: 'phases',
      title: 'Phases',
      type: 'array',
      description:
        'The timeline the client reads. The signed scope uses the phases on the selected package, so keep these in step.',
      of: [defineArrayMember({type: 'proposalPhaseItem'})],
      validation: (rule) => rule.max(6).warning('Three to five phases usually reads clearer'),
    }),
  ],
  preview: {
    select: {enabled: 'enabled'},
    prepare({enabled}) {
      return {title: 'Approach', subtitle: enabled === false ? 'Hidden' : 'Shown'}
    },
  },
})

export const proposalProofSection = defineType({
  name: 'proposalProofSection',
  title: 'Proof',
  type: 'object',
  fields: [
    shownField(),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Proof',
      description: 'Heading above the work and quotes. Leave the lists empty to hide the content.',
    }),
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      description: 'Case studies already on the site. Optional.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'project'}]})],
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      description: 'Quotes already in the studio. Optional.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'testimonial'}]})],
    }),
  ],
  preview: {
    select: {enabled: 'enabled'},
    prepare({enabled}) {
      return {title: 'Proof', subtitle: enabled === false ? 'Hidden' : 'Shown'}
    },
  },
})

export const proposalPackagesSection = defineType({
  name: 'proposalPackagesSection',
  title: 'Packages',
  type: 'object',
  fields: [
    shownField(),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'The engagement',
      description:
        'Heading above the package cards. The packages themselves are chosen on the proposal.',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 2,
      description: 'One or two sentences on how to choose. Optional.',
    }),
  ],
  preview: {
    select: {enabled: 'enabled'},
    prepare({enabled}) {
      return {title: 'Packages', subtitle: enabled === false ? 'Hidden' : 'Shown'}
    },
  },
})

export const proposalAddOnsSection = defineType({
  name: 'proposalAddOnsSection',
  title: 'Add-ons',
  type: 'object',
  fields: [
    shownField(),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Add-ons',
      description: 'Heading above the add-on toggles.',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 2,
      description: 'One line on what an add-on changes. Optional.',
    }),
  ],
  preview: {
    select: {enabled: 'enabled'},
    prepare({enabled}) {
      return {title: 'Add-ons', subtitle: enabled === false ? 'Hidden' : 'Shown'}
    },
  },
})

export const proposalOfferSection = defineType({
  name: 'proposalOfferSection',
  title: 'Same-day offer',
  type: 'object',
  fields: [
    shownField(),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'If you sign today',
      description: 'Heading for the bonus. The bonus itself is set on the proposal.',
    }),
  ],
  preview: {
    select: {enabled: 'enabled'},
    prepare({enabled}) {
      return {title: 'Same-day offer', subtitle: enabled === false ? 'Hidden' : 'Shown'}
    },
  },
})

export const proposalInvestmentSection = defineType({
  name: 'proposalInvestmentSection',
  title: 'Investment',
  type: 'object',
  fields: [
    shownField(),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Investment',
      description:
        'Heading for the live total. Amounts are calculated on the server, not typed here.',
    }),
  ],
  preview: {
    select: {enabled: 'enabled'},
    prepare({enabled}) {
      return {title: 'Investment', subtitle: enabled === false ? 'Hidden' : 'Shown'}
    },
  },
})

export const proposalSowSection = defineType({
  name: 'proposalSowSection',
  title: 'Statement of Work',
  type: 'object',
  fields: [
    shownField(),
    defineField({
      name: 'overview',
      title: 'Overview',
      type: 'text',
      rows: 4,
      description: 'One paragraph: what is being built, and why.',
      validation: (rule) => rule.required().error('The signed scope needs an overview'),
    }),
    defineField({
      name: 'clientResponsibilities',
      title: 'Client responsibilities',
      type: 'array',
      description:
        'What you need from them: content, access, feedback time, and one decision-maker.',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'assumptions',
      title: 'Assumptions and dependencies',
      type: 'array',
      description: 'What has to be true for this scope and schedule to hold.',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'acceptanceProcess',
      title: 'Acceptance process',
      type: 'text',
      rows: 3,
      description: 'How “done” is confirmed: the review window and the rounds of revision.',
    }),
    defineField({
      name: 'ownership',
      title: 'Ownership',
      type: 'text',
      rows: 3,
      description:
        'Who owns the project-specific work, and what Salt keeps. Default: they own the deliverables on full payment, and Salt keeps its background tools.',
    }),
    defineField({
      name: 'postLaunch',
      title: 'After launch',
      type: 'text',
      rows: 2,
      description:
        'The care plan if they add it. Otherwise say a separate agreement covers ongoing work.',
    }),
  ],
  preview: {
    select: {enabled: 'enabled'},
    prepare({enabled}) {
      return {title: 'Statement of Work', subtitle: enabled === false ? 'Hidden' : 'Shown'}
    },
  },
})

export const proposalScheduleSection = defineType({
  name: 'proposalScheduleSection',
  title: 'Payment schedule',
  type: 'object',
  fields: [
    shownField(),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Payment schedule',
      description:
        'Heading above the payment tiles. The split itself is the schedule chosen on the proposal.',
    }),
    defineField({
      name: 'excludedNote',
      title: 'What the fee does not include',
      type: 'text',
      rows: 2,
      description: 'Third-party licenses, ad spend, and taxes, if those are extra.',
    }),
  ],
  preview: {
    select: {enabled: 'enabled'},
    prepare({enabled}) {
      return {title: 'Payment schedule', subtitle: enabled === false ? 'Hidden' : 'Shown'}
    },
  },
})

export const proposalTermsSection = defineType({
  name: 'proposalTermsSection',
  title: 'Terms',
  type: 'object',
  fields: [
    shownField(),
    defineField({
      name: 'validityNote',
      title: 'Validity',
      type: 'text',
      rows: 2,
      description:
        'How long the price and kickoff slot are held. The date itself is the “Valid until” field.',
    }),
    defineField({
      name: 'changeOrderRule',
      title: 'Change orders',
      type: 'text',
      rows: 2,
      initialValue:
        'Anything outside this scope is quoted and approved in writing before the work starts.',
      description: 'The one-line rule for work that is not in the scope.',
    }),
  ],
  preview: {
    select: {enabled: 'enabled'},
    prepare({enabled}) {
      return {title: 'Terms', subtitle: enabled === false ? 'Hidden' : 'Shown'}
    },
  },
})

export const proposalAcceptSection = defineType({
  name: 'proposalAcceptSection',
  title: 'Accept and pay',
  type: 'object',
  fields: [
    shownField(),
    defineField({
      name: 'prompt',
      title: 'Prompt',
      type: 'string',
      initialValue: 'Sign here and we start on the date you choose.',
      description: 'The line above the signature. Mention the real kickoff.',
    }),
    defineField({
      name: 'checkboxLabel',
      title: 'Acceptance checkbox',
      type: 'text',
      rows: 2,
      initialValue: 'I agree to the Master Services Agreement and this Statement of Work.',
      description: 'The exact sentence they check. The agreement version is added on the page.',
    }),
  ],
  preview: {
    select: {enabled: 'enabled'},
    prepare({enabled}) {
      return {title: 'Accept and pay', subtitle: enabled === false ? 'Hidden' : 'Shown'}
    },
  },
})

export const proposalSignedSection = defineType({
  name: 'proposalSignedSection',
  title: 'After signing',
  type: 'object',
  fields: [
    shownField(),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Signed.',
      description: 'Shown after they sign and pay, in place of the accept block.',
    }),
    defineField({
      name: 'nextSteps',
      title: 'What happens next',
      type: 'array',
      description: 'The first things they should expect after payment.',
      of: [defineArrayMember({type: 'string'})],
    }),
  ],
  preview: {
    select: {enabled: 'enabled'},
    prepare({enabled}) {
      return {title: 'After signing', subtitle: enabled === false ? 'Hidden' : 'Shown'}
    },
  },
})

export const proposalSectionTypes = [
  proposalCoverSection,
  proposalSituationSection,
  proposalOutcomesSection,
  proposalPhasesSection,
  proposalProofSection,
  proposalPackagesSection,
  proposalAddOnsSection,
  proposalOfferSection,
  proposalInvestmentSection,
  proposalSowSection,
  proposalScheduleSection,
  proposalTermsSection,
  proposalAcceptSection,
  proposalSignedSection,
]

export const proposalSectionMembers = proposalSectionTypes.map((section) =>
  defineArrayMember({type: section.name}),
)
