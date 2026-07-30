import {
  corePageTabGroups,
  coreSearchFields,
  pageSectionsField,
} from '@/sanity/schemas/shared/corePageFields'
import {PackageIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Services page singleton — /services (route ships with the frontend rebuild).
 * Content from the approved copy plan
 * (salt-studio-knowledge-base/studio/website/copy/services.md).
 * All page content lives in the Sections array (drag to reorder, toggle to hide):
 * Hero → Services → Fit Filter → Process → FAQ → Final CTA.
 */
export default defineType({
  name: 'servicesPage',
  title: 'Services',
  type: 'document',
  icon: PackageIcon,
  groups: corePageTabGroups,
  fields: [
    defineField({
      name: 'capabilitiesHeadline',
      title: 'Capabilities masthead headline',
      type: 'text',
      rows: 2,
      description:
        'The big masthead line on /capabilities (the paper→ink hero). Line breaks are kept exactly as typed. Leave empty to use the built-in “Built to serve”.',
    }),
    pageSectionsField([
      {type: 'servicesHeroSection', title: 'Hero'},
      {type: 'servicesListSection', title: 'Services'},
      {type: 'servicesFitSection', title: 'Fit Filter'},
      {type: 'servicesProcessSection', title: 'Process'},
      {type: 'servicesFaqSection', title: 'FAQ'},
      {type: 'servicesFinalCtaSection', title: 'Final CTA'},
    ]),
    ...coreSearchFields(),
  ],
  preview: {
    prepare() {
      return {title: 'Services', subtitle: '/services', media: PackageIcon}
    },
  },
})
