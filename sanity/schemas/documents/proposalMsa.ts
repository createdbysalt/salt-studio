import {DocumentTextIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * One version of the Master Services Agreement.
 * The proposal links to it. The agreement text is not pasted into the scope.
 */
export default defineType({
  name: 'proposalMsa',
  title: 'Master services agreement',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'version',
      title: 'Version',
      type: 'string',
      description:
        'The version the client agrees to, for example “1.0”. A lawyer should review the text before a real client signs.',
      validation: (rule) => rule.required().error('Every agreement needs a version'),
    }),
    defineField({
      name: 'effectiveDate',
      title: 'Effective date',
      type: 'date',
      description: 'The date this version took effect.',
      validation: (rule) => rule.required().error('Add the effective date'),
    }),
    defineField({
      name: 'pdf',
      title: 'PDF',
      type: 'file',
      description:
        'The agreement the client opens from the proposal. One click, not pasted into the page.',
      options: {accept: 'application/pdf'},
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description: 'Optional text version, used if there is no PDF yet. Keep the formatting plain.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
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
    }),
  ],
  preview: {
    select: {version: 'version', date: 'effectiveDate'},
    prepare({version, date}) {
      return {title: version ? `MSA ${version}` : 'Untitled agreement', subtitle: date}
    },
  },
})
