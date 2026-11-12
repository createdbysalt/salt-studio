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
      name: 'problemLine',
      title: 'Problem',
      type: 'string',
      initialValue: 'One answer lives in three places.',
      description:
        'The large title. The problem, in one catchy line. The eyebrow above it always says What we heard. This line does not summarise the cards.',
      validation: (rule) => rule.max(80).warning('A short line holds the screen better'),
    }),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      description:
        'What you heard on the call. Three is the sweet spot. Two is the floor, four is the ceiling. Each card is one theme and one line they said.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'proposalSituationCard',
          fields: [
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              description:
                'A small stroke mark for the theme. Pick the closest one. Every card uses the same weight of icon, so the row stays quiet.',
              options: {
                list: [
                  {title: 'Scattered — one fact in many places', value: 'scattered'},
                  {title: 'Waiting — stuck on someone else', value: 'waiting'},
                  {title: 'Arrival — a first visit', value: 'arrival'},
                  {title: 'Missing — they cannot find it', value: 'missing'},
                  {title: 'Calling — they still phone or email', value: 'calling'},
                  {title: 'Document — it lives in a file', value: 'document'},
                  {title: 'People — the room, the team, the visitors', value: 'people'},
                  {title: 'Friction — something keeps snagging', value: 'friction'},
                ],
              },
              initialValue: 'scattered',
            }),
            defineField({
              name: 'title',
              title: 'Theme',
              type: 'string',
              description:
                'A short summary of one theme from the call. Not the quote, and not the client’s name.',
              validation: (rule) => rule.required().max(48).error('Name the theme in a few words'),
            }),
            defineField({
              name: 'quote',
              title: 'Quote',
              type: 'text',
              rows: 3,
              description:
                'A line they said on the call, or the closest true sentence from the notes. The page adds the quotation marks. One sentence.',
              validation: (rule) =>
                rule
                  .required()
                  .max(140)
                  .warning('One sentence fits the card. Two becomes a paragraph.'),
            }),
          ],
          preview: {select: {title: 'title', subtitle: 'quote'}},
        }),
      ],
      validation: (rule) =>
        rule
          .min(2)
          .max(4)
          .warning('Three cards is the sweet spot. Two is the floor and four is the ceiling.'),
    }),
  ],
  preview: {
    select: {enabled: 'enabled', problem: 'problemLine', cards: 'cards'},
    prepare({enabled, problem, cards}) {
      const count = Array.isArray(cards) ? cards.length : 0
      const detail = count === 1 ? '1 card' : `${count} cards`
      return {
        title: 'The situation',
        subtitle: enabled === false ? 'Hidden' : [problem, detail].filter(Boolean).join(' · '),
      }
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
      title: 'Goal',
      type: 'string',
      description:
        'One line. The outcome we are delivering. This is the large type. The eyebrow above it always says How Salt comes in.',
      validation: (rule) => rule.required().error('Write the goal in one line'),
    }),
    defineField({
      name: 'cards',
      title: 'Deliverables',
      type: 'array',
      description:
        'The pieces of that goal. Three is the usual set. Add another only when it is a real deliverable. No invented metrics.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'proposalOutcomeCard',
          fields: [
            defineField({
              name: 'title',
              title: 'Deliverable',
              type: 'string',
              description: 'The piece, in a few words. This is also the pill under the goal.',
              validation: (rule) => rule.required().error('Name the deliverable'),
            }),
            defineField({
              name: 'body',
              title: 'Detail',
              type: 'text',
              rows: 3,
              description: 'What that piece does for them.',
              validation: (rule) => rule.required().error('Explain the deliverable'),
            }),
          ],
          preview: {select: {title: 'title', subtitle: 'body'}},
        }),
      ],
      validation: (rule) => rule.min(1).max(6).error('Use one to six deliverables'),
    }),
  ],
  preview: {
    select: {enabled: 'enabled', heading: 'heading', cards: 'cards'},
    prepare({enabled, heading, cards}) {
      const count = Array.isArray(cards) ? cards.length : 0
      const detail = count === 1 ? '1 deliverable' : `${count} deliverables`
      return {
        title: 'The outcome',
        subtitle: enabled === false ? 'Hidden' : [heading, detail].filter(Boolean).join(' · '),
      }
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
      hidden: true,
      description: 'The page always shows How we get there. This value is not used.',
    }),
    defineField({
      name: 'intro',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description:
        'A short paragraph under the title. One or two sentences about how the work is shaped. Leave it empty to show the title alone.',
      validation: (rule) => rule.max(280).warning('Two sentences fit under the title'),
    }),
    defineField({
      name: 'phases',
      title: 'Phases',
      type: 'array',
      description:
        'The page timeline, in order. Add a phase for each stretch of the work. The signed scope uses the phases on the selected package, so keep these in step.',
      of: [defineArrayMember({type: 'proposalPhaseItem'})],
      validation: (rule) =>
        rule.min(1).warning('Add the phases. The timeline grows with this list.'),
    }),
    defineField({
      name: 'questionsHeading',
      title: 'Line',
      type: 'string',
      initialValue: 'How this gets built.',
      description:
        'The large line under the timeline. Say what you are doing and building. The eyebrow above it always says Our approach.',
    }),
    defineField({
      name: 'questions',
      title: 'Specifics',
      type: 'array',
      description:
        'Specific notes about the build. The stack, what the client edits, what they learn. Each one is a fact, then a short explanation. Add as many as this proposal needs. Leave the list empty to hide the block.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'proposalApproachQuestion',
          fields: [
            defineField({
              name: 'question',
              title: 'Line',
              type: 'string',
              description: 'The line on the closed card. A fact about the work, not a question.',
              validation: (rule) => rule.required().max(140).error('Write the line'),
            }),
            defineField({
              name: 'answer',
              title: 'Detail',
              type: 'text',
              rows: 4,
              description:
                'The text that opens under the line. A few sentences about what you are building.',
              validation: (rule) =>
                rule.required().max(500).warning('A few sentences fit the open card.'),
            }),
          ],
          preview: {select: {title: 'question', subtitle: 'answer'}},
        }),
      ],
    }),
  ],
  preview: {
    select: {enabled: 'enabled', phases: 'phases', questions: 'questions'},
    prepare({enabled, phases, questions}) {
      const count = Array.isArray(phases) ? phases.length : 0
      const notes = Array.isArray(questions) ? questions.length : 0
      const detail = `${count === 1 ? '1 phase' : `${count} phases`} · ${notes === 1 ? '1 note' : `${notes} notes`}`
      return {title: 'Approach', subtitle: enabled === false ? 'Hidden' : detail}
    },
  },
})

export const proposalProofSection = defineType({
  name: 'proposalProofSection',
  title: 'Work',
  type: 'object',
  fields: [
    shownField(),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'What we make',
      hidden: true,
      description: 'The page always shows What we make. This value is not used.',
    }),
    defineField({
      name: 'heading',
      title: 'Line',
      type: 'string',
      initialValue: "A few projects we're proud of.",
      hidden: true,
      description: "The page always shows A few projects we're proud of. This value is not used.",
    }),
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      description:
        'Work already on the site. Pick the project, then write why it matters for this client. The card uses that project’s picture and results. Add as many as this proposal needs. Drag to set the order.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'proposalProofProject',
          fields: [
            defineField({
              name: 'project',
              title: 'Project',
              type: 'reference',
              to: [{type: 'project'}],
              description: 'A project already on the site. The card uses its picture and results.',
              validation: (rule) => rule.required().error('Pick a project'),
            }),
            defineField({
              name: 'note',
              title: 'Why it matters here',
              type: 'text',
              rows: 3,
              description:
                'One or two sentences for this client. Say what this project shows them. Do not repeat the case study, and do not invent a number.',
              validation: (rule) =>
                rule.required().max(200).warning('Two sentences fit on the card'),
            }),
          ],
          preview: {
            select: {title: 'project.title', subtitle: 'note', media: 'project.coverImage'},
          },
        }),
      ],
    }),
    defineField({
      name: 'testimonials',
      title: 'Quotes',
      type: 'array',
      description:
        'Optional. The first quote’s name and role sit under the line. If Line is empty, that quote is the large sentence.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'testimonial'}]})],
    }),
  ],
  preview: {
    select: {enabled: 'enabled', projects: 'projects'},
    prepare({enabled, projects}) {
      const count = Array.isArray(projects) ? projects.length : 0
      const detail = count === 1 ? '1 project' : `${count} projects`
      return {title: 'Work', subtitle: enabled === false ? 'Hidden' : detail}
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
      initialValue: 'The investment.',
      hidden: true,
      description: 'The page always shows The investment. This value is not used.',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 2,
      hidden: true,
      description:
        "The page always shows We're excited to partner with you. This is the work we'd take on together. This value is not used.",
    }),
    defineField({
      name: 'sameDayDiscount',
      title: 'Same-day discount',
      type: 'object',
      description:
        'A percent off the package prices if they sign today. The sticker sits beside the heading. Add-ons stay at full price. It runs on the Same-day offer deadline on the proposal: no deadline, no discount.',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Show this offer',
          type: 'boolean',
          initialValue: false,
          description:
            'Turn on to show the sticker and the reduced package prices. Turn off to show the full prices only.',
        }),
        defineField({
          name: 'percent',
          title: 'Percent off',
          type: 'number',
          initialValue: 10,
          description:
            'A whole number, such as 10 or 15. The sticker reads “10% off” and “sign within 24 hours.” Each package price is reduced by this percent.',
          validation: (rule) =>
            rule.min(1).max(90).integer().error('Use a whole percent from 1 to 90'),
        }),
      ],
      validation: (rule) =>
        rule.custom((value) => {
          const offer = value as {enabled?: boolean; percent?: number} | undefined
          if (!offer?.enabled) return true
          if (
            typeof offer.percent !== 'number' ||
            !Number.isInteger(offer.percent) ||
            offer.percent < 1 ||
            offer.percent > 90
          ) {
            return 'Set a whole percent from 1 to 90 before showing the offer'
          }
          return true
        }),
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
      hidden: true,
      description: 'The page always shows Add-ons. This value is not used.',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 2,
      hidden: true,
      description: 'The page does not show an intro above the add-ons. This value is not used.',
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
      title: 'Label',
      type: 'string',
      initialValue: 'Accept & Sign',
      hidden: true,
      description: 'The page always shows Accept & Sign. This value is not used.',
    }),
    defineField({
      name: 'title',
      title: 'Heading',
      type: 'string',
      initialValue: "We can't wait to work together.",
      hidden: true,
      description: "The page always shows We can't wait to work together. This value is not used.",
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 2,
      hidden: true,
      description:
        'The page always explains how to choose, then builds the payment line from the schedule. This value is not used.',
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
      name: 'body',
      title: 'Standing terms',
      type: 'array',
      description:
        'Terms that always close the statement: who the parties are, what you need from the client, acceptance, and ownership. The page builds the document from the selected package’s scope, then each checked add-on’s scope, then this text.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Paragraph', value: 'normal'},
            {title: 'Heading', value: 'h3'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
            annotations: [],
          },
        }),
      ],
      validation: (rule) => rule.required().error('Paste the standing terms'),
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
      initialValue: 'Sign here and we can start.',
      hidden: true,
      description: 'The page always shows Sign here and we can start. This value is not used.',
    }),
    defineField({
      name: 'checkboxLabel',
      title: 'Acceptance checkbox',
      type: 'text',
      rows: 2,
      initialValue: 'I agree to the Master Services Agreement and this Statement of Work.',
      hidden: true,
      description:
        'The page always uses this sentence. The agreement version comes from the Master Services Agreement. This value is not used.',
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
