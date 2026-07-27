import {
  corePageTabGroups,
  coreSearchFields,
  pageSectionsField,
} from '@/sanity/schemas/shared/corePageFields'
import {ComposeIcon} from '@sanity/icons'
import {defineType} from 'sanity'

/**
 * Contact Page Singleton — /contact
 *
 * All page content lives in the Sections array (drag to reorder, toggle to hide).
 */
export default defineType({
  name: 'contactPage',
  title: 'Contact',
  type: 'document',
  icon: ComposeIcon,
  groups: corePageTabGroups,
  fields: [
    pageSectionsField([
      {type: 'contactHeroSection', title: 'Hero'},
      {type: 'contactBookingSection', title: 'Calendar Booking'},
      {type: 'contactCallDetailsSection', title: 'What Happens on the Call'},
      {type: 'contactDirectSection', title: 'Direct Contact'},
      {type: 'contactFormSection', title: 'Contact Form'},
      {type: 'contactFooterSection', title: 'Practical Footer'},
    ]),
    ...coreSearchFields(),
  ],
  preview: {
    prepare() {
      return {title: 'Contact', subtitle: '/contact', media: ComposeIcon}
    },
  },
})
