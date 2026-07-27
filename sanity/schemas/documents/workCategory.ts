import {TagIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'workCategory',
  title: 'Work Category',
  type: 'document',
  icon: TagIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'filterLabel',
      title: 'Filter label',
      type: 'string',
      group: 'content',
      description: 'Short label on the Work page filter pills (e.g. "High-Speed", "Food").',
      validation: (rule) =>
        rule.required().error('Filter label appears on the Work page category bar'),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'content',
      description: 'Used in the URL: /work/[slug]. Auto-generated from the filter label.',
      options: {source: 'filterLabel', maxLength: 96},
      validation: (rule) => rule.required().error('Slug is required for category landing pages'),
    }),
    defineField({
      name: 'headline',
      title: 'Page headline',
      type: 'string',
      group: 'content',
      description: 'Main H1 on the category landing page.',
    }),
    defineField({
      name: 'subhead',
      title: 'Subhead',
      type: 'text',
      rows: 2,
      group: 'content',
      description: 'Supporting line below the headline on the category page.',
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      group: 'seo',
      description: 'Browser tab and Google title for this category page. Keep under 60 characters.',
      validation: (rule) => rule.max(60).warning('Longer titles get truncated in search results'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'Meta description for search engines. Keep under 155 characters.',
      validation: (rule) =>
        rule.max(155).warning('Longer descriptions get cut off in Google results'),
    }),
  ],
  preview: {
    select: {
      title: 'filterLabel',
      subtitle: 'slug.current',
    },
    prepare({title, subtitle}) {
      return {
        title: title || 'Untitled category',
        subtitle: subtitle ? `/work/${subtitle}` : 'No slug',
      }
    },
  },
})
