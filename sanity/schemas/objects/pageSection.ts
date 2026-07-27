import {defineField, defineType} from 'sanity'

/**
 * Page section order rows — same pattern as playground.
 * Content lives in tabbed groups; sectionOrder only controls reorder + visibility
 * for the middle body. Hero and closing CTA stay locked in the route render.
 */

export interface PageSectionKeyOption {
  value: string
  title: string
}

export const SECTION_LABELS: Record<string, string> = {
  // home
  philosophyLine: 'Philosophy line',
  clientRoster: 'Client roster strip',
  relationshipProof: 'Relationship proof line',
  // capabilities
  whyModular: 'Why modular',
  howWeWork: 'How we work',
  whereWeWork: 'Where we work',
  moduleTiles: 'Module tiles',
  creative: 'Creative',
  production: 'Production',
  post: 'Post',
  agencyBrands: 'Agencies & brands',
  // studio
  specs: 'Studio specs',
  lisbon: 'Lisbon satellite',
  crew: 'Crew grid',
  // contact
  directContact: 'Direct email line',
  contactForm: 'Contact form',
  // rentals hub
  hubCards: 'Hub cards',
  goodToKnow: 'Good to know',
  // rental page
  whatsIncluded: "What's included",
  whatsExtra: "What's extra",
  whoItsFor: "Who it's for",
  gearDownloads: 'Gear downloads',
  rentalCta: 'Section CTA',
}

export const HOME_SECTION_KEYS: PageSectionKeyOption[] = [
  {value: 'philosophyLine', title: SECTION_LABELS.philosophyLine},
  {value: 'clientRoster', title: SECTION_LABELS.clientRoster},
  {value: 'relationshipProof', title: SECTION_LABELS.relationshipProof},
]

export const CAPABILITIES_SECTION_KEYS: PageSectionKeyOption[] = [
  {value: 'whyModular', title: SECTION_LABELS.whyModular},
  {value: 'howWeWork', title: SECTION_LABELS.howWeWork},
  {value: 'whereWeWork', title: SECTION_LABELS.whereWeWork},
  {value: 'moduleTiles', title: SECTION_LABELS.moduleTiles},
  {value: 'creative', title: SECTION_LABELS.creative},
  {value: 'production', title: SECTION_LABELS.production},
  {value: 'post', title: SECTION_LABELS.post},
  {value: 'agencyBrands', title: SECTION_LABELS.agencyBrands},
]

export const STUDIO_SECTION_KEYS: PageSectionKeyOption[] = [
  {value: 'specs', title: SECTION_LABELS.specs},
  {value: 'lisbon', title: SECTION_LABELS.lisbon},
  {value: 'crew', title: SECTION_LABELS.crew},
]

export const CONTACT_SECTION_KEYS: PageSectionKeyOption[] = [
  {value: 'directContact', title: SECTION_LABELS.directContact},
  {value: 'contactForm', title: SECTION_LABELS.contactForm},
]

export const RENTALS_HUB_SECTION_KEYS: PageSectionKeyOption[] = [
  {value: 'hubCards', title: SECTION_LABELS.hubCards},
  {value: 'goodToKnow', title: SECTION_LABELS.goodToKnow},
]

export const RENTAL_PAGE_SECTION_KEYS: PageSectionKeyOption[] = [
  {value: 'specs', title: SECTION_LABELS.specs},
  {value: 'whatsIncluded', title: SECTION_LABELS.whatsIncluded},
  {value: 'whatsExtra', title: SECTION_LABELS.whatsExtra},
  {value: 'whoItsFor', title: SECTION_LABELS.whoItsFor},
  {value: 'gearDownloads', title: SECTION_LABELS.gearDownloads},
  {value: 'goodToKnow', title: SECTION_LABELS.goodToKnow},
  {value: 'rentalCta', title: SECTION_LABELS.rentalCta},
]

interface CreatePageSectionTypeArgs {
  name: string
  title: string
  options: PageSectionKeyOption[]
}

export function createPageSectionType({name, title, options}: CreatePageSectionTypeArgs) {
  return defineType({
    name,
    title,
    type: 'object',
    fields: [
      defineField({
        name: 'key',
        title: 'Section',
        type: 'string',
        description: 'Drag rows to change section order on the live page.',
        options: {list: options, layout: 'dropdown'},
        validation: (rule) => rule.required().error('Pick a section from the list for each row'),
      }),
      defineField({
        name: 'enabled',
        title: 'Show this section',
        type: 'boolean',
        description: 'Turn off to hide without deleting copy.',
        initialValue: true,
      }),
    ],
    preview: {
      select: {key: 'key', enabled: 'enabled'},
      prepare({key, enabled}) {
        const label = SECTION_LABELS[key as string] ?? (key as string) ?? 'Unknown section'
        return {
          title: label,
          subtitle: enabled === false ? 'Hidden' : 'Visible',
        }
      },
    },
  })
}

export function defaultSectionOrder(options: PageSectionKeyOption[], typeName: string) {
  return options.map((opt) => ({_type: typeName, key: opt.value, enabled: true}))
}

export function validateSectionOrder(options: PageSectionKeyOption[]) {
  const validKeys = new Set(options.map((opt) => opt.value))
  const labelFor = (key: string) => SECTION_LABELS[key] ?? key

  return (value: unknown) => {
    if (!Array.isArray(value)) return true

    const keys = value.map((row: {key?: string}) => row?.key).filter((k): k is string => Boolean(k))

    const seen = new Set<string>()
    const dupes: string[] = []
    for (const k of keys) {
      if (seen.has(k)) dupes.push(k)
      seen.add(k)
    }
    if (dupes.length > 0) {
      const labels = [...new Set(dupes)].map(labelFor).join(', ')
      return `Each section should only appear once — duplicate: ${labels}.`
    }

    const missing = options.filter((opt) => !seen.has(opt.value)).map((opt) => opt.title)
    if (missing.length > 0) {
      return `Missing sections: ${missing.join(', ')}. Add a row for each, or toggle "Show this section" off to hide instead of deleting.`
    }

    const invalid = keys.filter((k) => !validKeys.has(k))
    if (invalid.length > 0) {
      return `Unknown section${invalid.length > 1 ? 's' : ''}: ${invalid.join(', ')}.`
    }

    return true
  }
}

export const homeSection = createPageSectionType({
  name: 'homeSection',
  title: 'Home Page Section',
  options: HOME_SECTION_KEYS,
})

export const capabilitiesSection = createPageSectionType({
  name: 'capabilitiesSection',
  title: 'Capabilities Page Section',
  options: CAPABILITIES_SECTION_KEYS,
})

export const studioSection = createPageSectionType({
  name: 'studioSection',
  title: 'Studio Page Section',
  options: STUDIO_SECTION_KEYS,
})

export const contactSection = createPageSectionType({
  name: 'contactSection',
  title: 'Contact Page Section',
  options: CONTACT_SECTION_KEYS,
})

export const rentalsHubSection = createPageSectionType({
  name: 'rentalsHubSection',
  title: 'Rentals Hub Section',
  options: RENTALS_HUB_SECTION_KEYS,
})

export const rentalPageSection = createPageSectionType({
  name: 'rentalPageSection',
  title: 'Rental Page Section',
  options: RENTAL_PAGE_SECTION_KEYS,
})
