import {
  corePageTabGroups,
  coreSearchFields,
  pageSectionsField,
} from '@/sanity/schemas/shared/corePageFields'
import {HomeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Home singleton — the 7-section homepage from the approved copy plan
 * (salt-studio-knowledge-base/studio/website/copy/homepage.md).
 * All page content lives in the Sections array (drag to reorder, toggle to hide):
 * Hero → Proof Strip → Services Triad → Selected Work → Salt Product →
 * Philosophy → Final CTA.
 */
export default defineType({
  name: 'home',
  title: 'Home',
  type: 'document',
  icon: HomeIcon,
  groups: corePageTabGroups,
  fields: [
    pageSectionsField([
      {type: 'homeHeroSection', title: 'Hero'},
      {type: 'homeProofSection', title: 'Proof Strip'},
      {type: 'homeServicesSection', title: 'Services Triad'},
      {type: 'homeWorkSection', title: 'Selected Work'},
      {type: 'homeProductSection', title: 'Salt Product'},
      {type: 'homePhilosophySection', title: 'Philosophy'},
      {type: 'homeFinalCtaSection', title: 'Final CTA'},
    ]),
    ...coreSearchFields(),
    defineField({
      name: 'hiddenH1',
      title: 'Hidden H1 (accessibility / SEO)',
      type: 'string',
      group: 'search',
      description:
        'Visually hidden on the page but available to screen readers and search engines.',
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Home', subtitle: '/', media: HomeIcon}
    },
  },
})
