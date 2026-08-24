import {HelpCircleIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Quiz — an editable, service-specific quiz funnel rendered at /quiz/[slug].
 *
 * Each quiz belongs to a service (AI Automations, Websites, Software) and acts
 * as a self-qualification funnel: visitors answer weighted questions, land in a
 * score band, and see that band's result copy and CTA. Submissions are stored
 * as quizSubmission documents in the Leads folder.
 *
 * Scoring: each choice option carries points; each question carries a weight.
 * The score is the weighted sum. Bands match top-down by minimum score, so the
 * highest matching band wins. The server re-scores every submission from this
 * document — editing weights here changes scoring everywhere, no deploy needed.
 */
export default defineType({
  name: 'quiz',
  title: 'Quiz',
  type: 'document',
  icon: HelpCircleIcon,
  description: 'A service quiz funnel — questions, scoring, and per-result copy.',
  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'questions', title: 'Questions'},
    {name: 'results', title: 'Results & Scoring'},
    {name: 'gate', title: 'Email Gate'},
  ],
  fields: [
    // ─── Overview ───
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'overview',
      description:
        'Internal name and the small label shown above the quiz (e.g. "Automation Fit Check").',
      validation: (rule) =>
        rule.required().error('The title labels the quiz in the Studio and on the page'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'overview',
      options: {source: 'title', maxLength: 96},
      description: 'The quiz URL: /quiz/your-slug. Changing this breaks existing links.',
      validation: (rule) => rule.required().error('The slug is the quiz URL'),
    }),
    defineField({
      name: 'service',
      title: 'Service',
      type: 'reference',
      to: [{type: 'service'}],
      group: 'overview',
      description:
        'The service this quiz qualifies leads for. Shown on submissions in the Leads folder.',
    }),
    defineField({
      name: 'introHeadline',
      title: 'Intro Headline',
      type: 'string',
      group: 'overview',
      description: 'The big opening question (e.g. "How much of your week could run itself?").',
      validation: (rule) =>
        rule.required().error('The intro headline is the first thing visitors see'),
    }),
    defineField({
      name: 'introBody',
      title: 'Intro Body',
      type: 'text',
      rows: 3,
      group: 'overview',
      description: 'One or two sentences under the headline: how long it takes and what they get.',
    }),
    defineField({
      name: 'startLabel',
      title: 'Start Button Label',
      type: 'string',
      initialValue: 'Start',
      group: 'overview',
      description: 'Text on the button that begins the quiz.',
    }),
    // ─── Questions ───
    defineField({
      name: 'questions',
      title: 'Questions',
      type: 'array',
      group: 'questions',
      description:
        'One question per screen, in order. Choice questions can carry points for scoring; text and website questions collect context.',
      validation: (rule) => rule.min(1).error('A quiz needs at least one question'),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'quizQuestionItem',
          title: 'Question',
          fields: [
            defineField({
              name: 'key',
              title: 'Question Key',
              type: 'slug',
              description:
                'Stable identifier stored on submissions (e.g. "follow-ups"). Set once, then don\'t change it — it links answers to this question.',
              options: {
                source: (_, {parent}) => (parent as {prompt?: string})?.prompt ?? '',
                maxLength: 48,
              },
              validation: (rule) =>
                rule.required().error('Every question needs a stable key for scoring and storage'),
            }),
            defineField({
              name: 'prompt',
              title: 'Question',
              type: 'string',
              description: 'The question exactly as the visitor sees it.',
              validation: (rule) =>
                rule.required().error('The question text is what the visitor answers'),
            }),
            defineField({
              name: 'hint',
              title: 'Hint',
              type: 'string',
              description: 'Optional supporting line under the question.',
            }),
            defineField({
              name: 'shortLabel',
              title: 'Short Label',
              type: 'string',
              description:
                'Short noun phrase for the results page (e.g. "chasing follow-ups"). Used in the "where it\'s leaking" list on scored questions.',
            }),
            defineField({
              name: 'kind',
              title: 'Type',
              type: 'string',
              initialValue: 'choice',
              options: {
                list: [
                  {title: 'Multiple choice', value: 'choice'},
                  {title: 'Free text', value: 'text'},
                  {title: 'Website URL (runs the live site audit)', value: 'url'},
                ],
                layout: 'radio',
              },
              description:
                'Multiple choice questions can be scored. Free text collects context. Website URL asks for their site address and powers the live audit on the results page.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'options',
              title: 'Answer Options',
              type: 'array',
              hidden: ({parent}) => parent?.kind !== 'choice',
              description:
                'The choices, in order. Points feed the score (higher = stronger signal).',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'quizOptionItem',
                  title: 'Option',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      description: 'The answer as the visitor sees it.',
                      validation: (rule) => rule.required().error('Options need visible text'),
                    }),
                    defineField({
                      name: 'points',
                      title: 'Points',
                      type: 'number',
                      initialValue: 0,
                      description:
                        'Score contribution when this option is picked (before the question weight).',
                      validation: (rule) =>
                        rule.required().min(0).error('Points must be zero or more'),
                    }),
                  ],
                  preview: {
                    select: {title: 'label', points: 'points'},
                    prepare({title, points}) {
                      return {title: title || 'Untitled option', subtitle: `${points ?? 0} pts`}
                    },
                  },
                }),
              ],
            }),
            defineField({
              name: 'weight',
              title: 'Weight',
              type: 'number',
              initialValue: 1,
              hidden: ({parent}) => parent?.kind !== 'choice',
              description:
                "Multiplier on this question's points. 1 = normal, 0 = unscored (context only), 2 = counts double.",
              validation: (rule) => rule.min(0).error("Weight can't be negative"),
            }),
          ],
          preview: {
            select: {title: 'prompt', kind: 'kind', weight: 'weight'},
            prepare({title, kind, weight}) {
              const kindLabel = kind === 'url' ? 'website' : kind
              const scored = kind === 'choice' && (weight ?? 1) > 0 ? ' · scored' : ''
              return {title: title || 'Untitled question', subtitle: `${kindLabel}${scored}`}
            },
          },
        }),
      ],
    }),
    // ─── Results & Scoring ───
    defineField({
      name: 'scoreUnit',
      title: 'Score Display',
      type: 'string',
      group: 'results',
      initialValue: 'hours',
      options: {
        list: [
          {title: 'Hours per week (shows "~N hours a week")', value: 'hours'},
          {title: 'Band label only (shows the band name, hides the number)', value: 'band'},
        ],
        layout: 'radio',
      },
      description: 'How the score is presented on the results page.',
    }),
    defineField({
      name: 'bands',
      title: 'Score Bands',
      type: 'array',
      group: 'results',
      description:
        'Result tiers, checked highest minimum first. Each band carries its own headline, copy, benefits, and call-to-action — this is where the conversion happens.',
      validation: (rule) => rule.min(1).error('A quiz needs at least one result band'),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'quizBandItem',
          title: 'Band',
          fields: [
            defineField({
              name: 'label',
              title: 'Band Label',
              type: 'string',
              description:
                'Short name for this tier (e.g. "High", "Significant", "Running tight"). Stored on submissions.',
              validation: (rule) =>
                rule.required().error('The band label identifies this result tier'),
            }),
            defineField({
              name: 'minScore',
              title: 'Minimum Score',
              type: 'number',
              description: 'The lowest score that lands in this band. Use 0 for the bottom band.',
              validation: (rule) =>
                rule
                  .required()
                  .min(0)
                  .error('Every band needs a minimum score (use 0 for the lowest)'),
            }),
            defineField({
              name: 'resultHeadline',
              title: 'Result Headline',
              type: 'string',
              description:
                'The big result line. Write {score} where the number should appear (e.g. "~{score} hours a week").',
              validation: (rule) =>
                rule.required().error('The headline is the result they came for'),
            }),
            defineField({
              name: 'resultBody',
              title: 'Result Body',
              type: 'text',
              rows: 3,
              description: 'What this result means for them — concrete, not generic.',
            }),
            defineField({
              name: 'benefits',
              title: 'Benefit Bullets',
              type: 'array',
              of: [defineArrayMember({type: 'string'})],
              description:
                'What working with Salt gets them at this level — time saved, leads handled, work removed.',
            }),
            defineField({
              name: 'ctaLead',
              title: 'CTA Lead-in',
              type: 'text',
              rows: 2,
              description: 'The sentence before the button that makes the next step obvious.',
            }),
            defineField({
              name: 'primaryCtaLabel',
              title: 'Primary Button Label',
              type: 'string',
              initialValue: 'Reach out',
              description: 'The main action for this band.',
            }),
            defineField({
              name: 'primaryCtaHref',
              title: 'Primary Button Link',
              type: 'string',
              initialValue: '/contact',
              description: 'Internal path (/contact) or full URL (Cal.com, Stripe).',
            }),
            defineField({
              name: 'secondaryCtaLabel',
              title: 'Secondary Link Label',
              type: 'string',
              description: 'Optional softer action (e.g. "See how it works").',
            }),
            defineField({
              name: 'secondaryCtaHref',
              title: 'Secondary Link',
              type: 'string',
              description: 'Where the secondary link goes.',
            }),
          ],
          preview: {
            select: {title: 'label', min: 'minScore', cta: 'primaryCtaLabel'},
            prepare({title, min, cta}) {
              return {
                title: title || 'Untitled band',
                subtitle: `from ${min ?? 0} · ${cta || 'no CTA'}`,
              }
            },
          },
        }),
      ],
    }),
    // ─── Email Gate ───
    defineField({
      name: 'gateHeadline',
      title: 'Gate Headline',
      type: 'string',
      initialValue: 'Your result is ready.',
      group: 'gate',
      description: 'Shown when asking for their email, just before results.',
    }),
    defineField({
      name: 'gateBody',
      title: 'Gate Body',
      type: 'string',
      initialValue: 'Where should we send the breakdown?',
      group: 'gate',
      description: 'The line under the gate headline.',
    }),
    defineField({
      name: 'gateButtonLabel',
      title: 'Gate Button Label',
      type: 'string',
      initialValue: 'Show my result',
      group: 'gate',
      description: 'Text on the button that reveals the result.',
    }),
    defineField({
      name: 'waitlistLabel',
      title: 'Waitlist Checkbox Label',
      type: 'string',
      initialValue: 'Keep me posted on Salt — the tool we’re building that does this work for you.',
      group: 'gate',
      description:
        'The opt-in line next to the checkbox. Leave the checkbox meaningful — it’s consent.',
    }),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current', serviceTitle: 'service.title'},
    prepare({title, slug, serviceTitle}) {
      return {
        title: title || 'Untitled quiz',
        subtitle: [serviceTitle, slug ? `/quiz/${slug}` : null].filter(Boolean).join(' · '),
        media: HelpCircleIcon,
      }
    },
  },
})
