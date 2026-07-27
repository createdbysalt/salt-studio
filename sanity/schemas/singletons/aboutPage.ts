import {
  corePageTabGroups,
  coreSearchFields,
  pageSectionsField,
} from '@/sanity/schemas/shared/corePageFields'
import {UserIcon} from '@sanity/icons'
import {defineType} from 'sanity'

/**
 * About page singleton — /about (route ships with the frontend rebuild).
 * Content from the approved copy plan
 * (salt-studio-knowledge-base/studio/website/copy/about.md) — the one page
 * where poetry leads. BLOCKED until the [GABRIELLA] founder beats are filled;
 * keep it a draft until then.
 * All page content lives in the Sections array (drag to reorder, toggle to hide):
 * Opening Statement → The Story → Small on Purpose → How We Work →
 * Salt Product Bridge → Closing CTA.
 */
export default defineType({
  name: 'aboutPage',
  title: 'About',
  type: 'document',
  icon: UserIcon,
  groups: corePageTabGroups,
  fields: [
    pageSectionsField([
      {type: 'aboutOpeningSection', title: 'Opening Statement'},
      {type: 'aboutStorySection', title: 'The Story'},
      {type: 'aboutSmallnessSection', title: 'Small on Purpose'},
      {type: 'aboutConvictionsSection', title: 'How We Work'},
      {type: 'aboutProductSection', title: 'Salt Product Bridge'},
      {type: 'aboutClosingSection', title: 'Closing CTA'},
    ]),
    ...coreSearchFields(),
  ],
  preview: {
    prepare() {
      return {title: 'About', subtitle: '/about', media: UserIcon}
    },
  },
})
