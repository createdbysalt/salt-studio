import {defineField} from 'sanity'

/** Shared "Show this section?" toggle used by every page-builder section object. */
export const enabledField = defineField({
  name: 'enabled',
  title: 'Show this section?',
  type: 'boolean',
  initialValue: true,
  description: 'Turn off to hide this section without deleting its content.',
})

/**
 * Standard section preview keyed off a single content field (headline/subhead).
 * Shows the live content on top and the section type underneath.
 */
export function sectionPreview(contentField: string, typeLabel: string) {
  return {
    select: {internalName: 'internalName', content: contentField, enabled: 'enabled'},
    prepare({
      internalName,
      content,
      enabled,
    }: {
      internalName?: string
      content?: string
      enabled?: boolean
    }) {
      return prepareSectionPreview({internalName, contentTitle: content, typeLabel, enabled})
    },
  }
}

/** Editor-only label shown in the Sections list previews (not rendered on the site). */
export function sectionInternalNameField(defaultLabel?: string) {
  return defineField({
    name: 'internalName',
    title: 'Section label',
    type: 'string',
    description:
      'Optional. Used in the sections list only when this block has no headline or body text yet.',
    initialValue: defaultLabel,
  })
}

function truncate(value: string, max = 60): string {
  const trimmed = value.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

/**
 * Sections list preview:
 * - Title → live page content (headline, excerpt, CTA text)
 * - Subtitle → section type ("Hero", "Why Modular", …)
 * - "Hidden" appended when the section is toggled off.
 */
export function prepareSectionPreview({
  internalName,
  contentTitle,
  typeLabel,
  enabled,
}: {
  internalName?: string | null
  contentTitle?: string | null
  typeLabel: string
  enabled?: boolean | null
}) {
  const type = typeLabel.trim()
  const content = contentTitle?.trim()
  const customLabel = internalName?.trim()

  const title = content || customLabel || type

  if (enabled === false) {
    return {title, subtitle: `${type} · Hidden`}
  }

  // Content on top, section type underneath — skip subtitle when it would repeat the title.
  if (content && content !== type) {
    return {title: truncate(content), subtitle: type}
  }

  if (!content && customLabel && customLabel !== type) {
    return {title: customLabel, subtitle: type}
  }

  return {title}
}
