import {defineField, defineType} from 'sanity'

/**
 * One item on a client portal checklist — what Salt needs from them.
 * Links (Tally, Cal.com) live on the item so there is no separate links list.
 */
export default defineType({
  name: 'portalChecklistItem',
  title: 'Checklist item',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'What you need from the client (e.g. "Primary logo", "Book kickoff call").',
      validation: (rule) =>
        rule.required().error('Every item needs a title so the client knows what to do'),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description:
        'A short note that tells them what to send or how to do it. Shown under the title.',
    }),
    defineField({
      name: 'required',
      title: 'Required?',
      type: 'boolean',
      initialValue: true,
      description: 'Required items are listed first. Optional items sit in a quieter group below.',
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'url',
      description: 'Optional. A form or booking link for this item (Tally, Cal.com, etc.).',
      validation: (rule) =>
        rule.uri({allowRelative: false, scheme: ['http', 'https']}).warning('Use a full https URL'),
    }),
    defineField({
      name: 'linkLabel',
      title: 'Link label',
      type: 'string',
      description: 'Button text for the link. Leave blank to use “Open →”.',
    }),
    defineField({
      name: 'done',
      title: 'Done',
      type: 'boolean',
      initialValue: false,
      hidden: ({document}) =>
        document?._type === 'portalChecklist' || document?._type === 'portalForms',
      description: 'The client can tick this on /table. Means they have provided it.',
    }),
  ],
  preview: {
    select: {title: 'title', required: 'required', link: 'link'},
    prepare({title, required, link}) {
      const flags = [required === false ? 'Optional' : 'Required', link ? 'Has link' : null]
        .filter(Boolean)
        .join(' · ')
      return {
        title: title || 'Untitled item',
        subtitle: flags || undefined,
      }
    },
  },
})
