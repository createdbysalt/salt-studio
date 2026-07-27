import {
  corePageTabGroups,
  coreSearchFields,
  pageSectionsField,
} from '@/sanity/schemas/shared/corePageFields'
import {SparklesIcon} from '@sanity/icons'
import {defineType} from 'sanity'

/**
 * Capabilities Page Singleton — /capabilities
 *
 * All page content lives in the Sections array (drag to reorder, toggle to hide).
 * Hero and closing CTA are sections too, so they can be reordered like any block.
 */
export default defineType({
  name: 'capabilitiesPage',
  title: 'Capabilities',
  type: 'document',
  icon: SparklesIcon,
  groups: corePageTabGroups,
  fields: [
    pageSectionsField([
      {type: 'capHeroSection', title: 'Hero'},
      {type: 'capWhyModularSection', title: 'Why Modular'},
      {type: 'capHowWeWorkSection', title: 'How We Work'},
      {type: 'capWhereWeWorkSection', title: 'Where We Work'},
      {type: 'capModuleTilesSection', title: 'Module Tiles'},
      {type: 'capCreativeSection', title: 'Creative'},
      {type: 'capProductionSection', title: 'Production'},
      {type: 'capPostSection', title: 'Post'},
      {type: 'capAgencyBrandsSection', title: 'Agencies & Brands'},
      {type: 'ctaSection', title: 'Closing CTA'},
    ]),
    ...coreSearchFields(),
  ],
  preview: {
    prepare() {
      return {title: 'Capabilities', subtitle: '/capabilities', media: SparklesIcon}
    },
  },
})
