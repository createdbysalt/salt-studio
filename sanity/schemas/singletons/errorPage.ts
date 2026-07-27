import {WarningOutlineIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Error (500) page content.
 * Singleton — only one instance exists.
 *
 * Baked into the app's error boundaries (app/error.tsx, app/global-error.tsx)
 * at BUILD time by scripts/generate-error-content.mjs. Error boundaries can't
 * safely call Sanity at error time (Sanity may be the cause), so edits here go
 * live on the next deploy, not instantly. That's why this is plain strings.
 */
export default defineType({
  name: 'errorPage',
  title: 'Error Page',
  type: 'document',
  icon: WarningOutlineIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Small label above the headline (e.g. "Error").',
      initialValue: 'Error',
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'Main headline shown when something goes wrong.',
      initialValue: 'Something went wrong.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 3,
      description: 'Reassuring line explaining what happened and what to do next.',
      initialValue: "Give it another try — or head home and we'll meet you there.",
    }),
    defineField({
      name: 'retryButtonText',
      title: 'Retry button text',
      type: 'string',
      description: 'Label for the button that reloads / retries the page.',
      initialValue: 'Try again',
    }),
    defineField({
      name: 'homeButtonText',
      title: 'Home button text',
      type: 'string',
      description: 'Label for the button that returns to the home page.',
      initialValue: 'Back home',
    }),
    defineField({
      name: 'homeButtonLink',
      title: 'Home button link',
      type: 'string',
      description: 'Where the home button goes. Defaults to "/" (home).',
      initialValue: '/',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Error Page',
        subtitle: 'Error (500) page content — updates on next deploy',
        media: WarningOutlineIcon,
      }
    },
  },
})
