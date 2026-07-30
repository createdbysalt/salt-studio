import {ClipboardIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Quiz Submission — a lead captured by the Salt Score quiz (/quiz).
 *
 * Created programmatically by the quiz server action (app/actions/quiz.ts),
 * never by editors — every field is read-only in the Studio. Submissions are
 * also emailed to the studio inbox; this document is the queryable archive
 * that powers attribution and score calibration.
 */
export default defineType({
  name: 'quizSubmission',
  title: 'Quiz Submission',
  type: 'document',
  icon: ClipboardIcon,
  description:
    'A quiz submission. Created automatically when someone completes a quiz — only the pipeline status is editable.',
  fields: [
    defineField({
      name: 'status',
      title: 'Pipeline Status',
      type: 'string',
      initialValue: 'new',
      description:
        'Where this lead is in your pipeline. The only field you edit here — update it as you follow up.',
      options: {
        list: [
          {title: 'New', value: 'new'},
          {title: 'Contacted', value: 'contacted'},
          {title: 'Call booked', value: 'call-booked'},
          {title: 'Won', value: 'won'},
          {title: 'Lost', value: 'lost'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'quiz',
      title: 'Quiz',
      type: 'reference',
      to: [{type: 'quiz'}],
      readOnly: true,
      description: 'Which quiz produced this submission. Empty for legacy Salt Score submissions.',
    }),
    defineField({
      name: 'quizTitle',
      title: 'Quiz Title',
      type: 'string',
      readOnly: true,
      description: 'Snapshot of the quiz title at submission time.',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      readOnly: true,
      description: 'The email entered at the results gate.',
      validation: (rule) => rule.required().error('Submissions always include the gate email'),
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      readOnly: true,
      description: 'When the quiz was completed.',
    }),
    defineField({
      name: 'track',
      title: 'Track',
      type: 'string',
      readOnly: true,
      description: 'Which question track the respondent was routed through.',
      options: {
        list: [
          {title: 'Solo / small service business', value: 'solo'},
          {title: 'Organization / institution', value: 'org'},
        ],
      },
    }),
    defineField({
      name: 'businessType',
      title: 'Business Type',
      type: 'string',
      readOnly: true,
      description: 'Answer to “What kind of business are you?”',
    }),
    defineField({
      name: 'teamSize',
      title: 'Team Size',
      type: 'string',
      readOnly: true,
      description: 'Answer to “How many people are on your team?”',
    }),
    defineField({
      name: 'neverAgain',
      title: '“Pay to never do again”',
      type: 'text',
      rows: 2,
      readOnly: true,
      description:
        'Free-text answer to “What’s the one task you’d pay to never do again?” — the single most valuable field in every submission.',
    }),
    defineField({
      name: 'workflowAnswers',
      title: 'Workflow Answers',
      type: 'array',
      readOnly: true,
      description: 'The track-specific diagnostic answers, in the order they were asked.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'workflowAnswer',
          fields: [
            defineField({
              name: 'key',
              title: 'Question Key',
              type: 'string',
              description: 'Stable question identifier from the quiz config.',
            }),
            defineField({
              name: 'label',
              title: 'Question',
              type: 'string',
              description: 'The question as shown to the respondent.',
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'string',
              description: 'The selected option label.',
            }),
          ],
          preview: {
            select: {title: 'label', subtitle: 'answer'},
          },
        }),
      ],
    }),
    defineField({
      name: 'websiteFlag',
      title: 'Website Part of the Problem?',
      type: 'string',
      readOnly: true,
      description: 'Answer to the website question — “yes” and “sort-of” surface the site CTA.',
    }),
    defineField({
      name: 'score',
      title: 'Score (hours/week)',
      type: 'number',
      readOnly: true,
      description: 'Solo track: estimated automatable hours per week. Empty for org track.',
    }),
    defineField({
      name: 'scoreBand',
      title: 'Score Band',
      type: 'string',
      readOnly: true,
      description: 'Org track: qualitative automation-potential band. Empty for solo track.',
    }),
    defineField({
      name: 'topWorkflows',
      title: 'Top Workflows',
      type: 'array',
      readOnly: true,
      description: 'The highest-scoring workflow labels shown on the results page.',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'waitlistOptIn',
      title: 'Salt Waitlist Opt-in',
      type: 'boolean',
      readOnly: true,
      description: 'Whether they checked “keep me posted on Salt” at the gate.',
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'object',
      readOnly: true,
      description: 'Where this respondent came from — powers lead attribution.',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({name: 'utmSource', title: 'UTM Source', type: 'string'}),
        defineField({name: 'utmMedium', title: 'UTM Medium', type: 'string'}),
        defineField({name: 'utmCampaign', title: 'UTM Campaign', type: 'string'}),
        defineField({name: 'referrer', title: 'Referrer', type: 'string'}),
        defineField({name: 'landingPath', title: 'Landing Path', type: 'string'}),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'email',
      track: 'track',
      score: 'score',
      scoreBand: 'scoreBand',
      waitlist: 'waitlistOptIn',
      status: 'status',
      quizTitle: 'quizTitle',
    },
    prepare({title, track, score, scoreBand, waitlist, status, quizTitle}) {
      const result = scoreBand || (score != null ? `~${score} hrs/wk` : '')
      const origin = quizTitle || (track ? `Salt Score · ${track}` : null)
      return {
        title: title || 'No email',
        subtitle: [
          status && status !== 'new' ? status : null,
          origin,
          result,
          waitlist ? '· waitlist' : '',
        ]
          .filter(Boolean)
          .join(' · '),
        media: ClipboardIcon,
      }
    },
  },
  orderings: [
    {
      title: 'Newest First',
      name: 'submittedAtDesc',
      by: [{field: 'submittedAt', direction: 'desc'}],
    },
  ],
})
