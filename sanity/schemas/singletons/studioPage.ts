import {
  corePageTabGroups,
  coreSearchFields,
  pageSectionsField,
} from '@/sanity/schemas/shared/corePageFields'
import {CaseIcon} from '@sanity/icons'
import {defineType} from 'sanity'

/**
 * Studio Page Singleton — /studio
 *
 * All page content lives in the Sections array (drag to reorder, toggle to hide).
 * Hero and closing CTA are sections too.
 */
export default defineType({
  name: 'studioPage',
  title: 'Studio',
  type: 'document',
  icon: CaseIcon,
  groups: corePageTabGroups,
  fields: [
    pageSectionsField([
      {type: 'studioHeroSection', title: 'Hero'},
      {type: 'studioSpecsSection', title: 'Studio Specs'},
      {type: 'studioLisbonSection', title: 'Lisbon'},
      {type: 'studioCrewSection', title: 'Crew'},
      {type: 'ctaSection', title: 'Closing CTA'},
    ]),
    ...coreSearchFields(),
  ],
  preview: {
    prepare() {
      return {title: 'Studio', subtitle: '/studio', media: CaseIcon}
    },
  },
})
