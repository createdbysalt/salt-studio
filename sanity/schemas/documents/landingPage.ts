import {
  corePageSectionsGroup,
  coreSearchFields,
  coreSearchGroup,
  pageSectionsField,
} from '@/sanity/schemas/shared/corePageFields'
import {RocketIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Landing page (paid-traffic page builder).
 *
 * One document per audience page: /churches, /nonprofits, ...
 * Renders at /[slug] alongside `page` and `person` (see resolve.ts and
 * app/(personal)/[slug]/page.tsx). Differences from `page`:
 * - one CTA label + link shared by every button and the sticky mobile bar
 * - nav can be hidden (logo only) so paid clicks are not leaked into the menu
 * - Search & Sharing tab separates the Google title from the visible H1
 * - `offer` entries feed Service JSON-LD `offers`
 *
 * Structure and evidence: Salt Studio/Marketing/churches-landing/05-landing-page-template.md
 * DRAFT: not yet run through `npm run typegen`.
 */
export default defineType({
  name: 'landingPage',
  title: 'Landing Page',
  type: 'document',
  icon: RocketIcon,
  groups: [
    {name: 'content', title: 'Setup', default: true},
    // Shared group carries default: true; Setup is the default tab here, so override it.
    {...corePageSectionsGroup, default: false},
    {name: 'layout', title: 'Layout'},
    coreSearchGroup,
    {name: 'schema', title: 'Offer (structured data)'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Internal name',
      type: 'string',
      group: 'content',
      description:
        'Editor-facing name only, e.g. "Churches landing page". Not shown on the site. The visible headline lives in the Hero section.',
      validation: (rule) => rule.required().error('Every landing page needs an internal name'),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'content',
      description:
        'The URL path, e.g. "churches" becomes /churches. Click Generate to create from the name.',
      options: {source: 'title', maxLength: 96},
      validation: (rule) =>
        rule.required().error('URL slug is required for the page to be accessible'),
    }),
    defineField({
      name: 'audience',
      title: 'Audience',
      type: 'string',
      group: 'content',
      description:
        'Who this page speaks to. Used for defaults and for the "audience" field in structured data.',
      options: {
        list: [
          {title: 'Churches', value: 'churches'},
          {title: 'Nonprofits', value: 'nonprofits'},
          {title: 'Other', value: 'other'},
        ],
        layout: 'radio',
      },
      initialValue: 'churches',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Button label (used everywhere)',
      type: 'string',
      group: 'content',
      description:
        'One label for every button on the page, including the sticky mobile bar. Keep it to 2 or 3 words, e.g. "Book a call".',
      initialValue: 'Book a call',
      validation: (rule) => rule.required().max(24).warning('Short labels fit the mobile bar'),
    }),
    defineField({
      name: 'ctaLink',
      title: 'Button link (used everywhere)',
      type: 'url',
      group: 'content',
      description:
        'Where every button goes. Use the plain Cal.com link, not an embed, so click tracking keeps working.',
      initialValue: 'https://cal.com/createdbysalt/discovery',
      validation: (rule) =>
        rule
          .required()
          .uri({scheme: ['http', 'https']})
          .error('Use a full https link'),
    }),
    defineField({
      name: 'ctaSubhead',
      title: 'Line under the buttons',
      type: 'string',
      group: 'content',
      description: 'Small reassurance under each button, e.g. "Free, 15 minutes, no pressure."',
      initialValue: 'Free, 15 minutes, no pressure.',
    }),
    defineField({
      name: 'hideNav',
      title: 'Hide the top menu?',
      type: 'boolean',
      group: 'layout',
      description:
        'On: shows the logo only, no menu, so visitors from ads stay on the page. The footer still links to the rest of the site.',
      initialValue: true,
    }),
    defineField({
      name: 'stickyMobileCta',
      title: 'Sticky button bar on phones?',
      type: 'boolean',
      group: 'layout',
      description:
        'On: a bar with the button label stays at the bottom of the screen on phones once the first screen scrolls away.',
      initialValue: true,
    }),
    pageSectionsField(
      [
        {type: 'lpHeroSection', title: 'Hero'},
        {type: 'lpLogoSection', title: 'Client logos'},
        {type: 'lpProblemSection', title: 'The problem'},
        {type: 'lpSystemSection', title: 'The system'},
        {type: 'lpDeliverableSection', title: 'Show the deliverable'},
        {type: 'lpProcessSection', title: 'How it works'},
        {type: 'lpMeasurementSection', title: 'What you will know'},
        {type: 'lpProofSection', title: 'Proof'},
        {type: 'lpCtaSection', title: 'Button'},
        {type: 'lpPricingSection', title: 'Price'},
        {type: 'lpFitSection', title: 'Fit / not a fit'},
        {type: 'lpTeamSection', title: 'Who you will work with'},
        {type: 'lpFaqSection', title: 'FAQ'},
        {type: 'lpFinalCtaSection', title: 'Final call to action'},
      ],
      {
        // The Button section may repeat (after proof, after price). Everything else once.
        uniqueTypes: false,
        description:
          'Drag to reorder. Toggle a block off to hide it without deleting its content. The recommended order is the one shown when you add them top to bottom.',
      },
    ),
    ...coreSearchFields(),
    defineField({
      name: 'offers',
      title: 'Offers for structured data',
      type: 'array',
      group: 'schema',
      description:
        'Prices Google reads from the page code (Service > offers). Match the visible price section exactly.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'lpOffer',
          title: 'Offer',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              description: 'e.g. "90-day Launch" or "Monthly plan".',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'price',
              title: 'Price (number only)',
              type: 'number',
              description: 'e.g. 4950. No currency sign.',
              validation: (rule) => rule.required().positive(),
            }),
            defineField({
              name: 'billing',
              title: 'Billing',
              type: 'string',
              options: {
                list: [
                  {title: 'One time', value: 'one-time'},
                  {title: 'Per month', value: 'monthly'},
                ],
                layout: 'radio',
              },
              initialValue: 'one-time',
            }),
            defineField({
              name: 'description',
              title: 'One-line description',
              type: 'string',
              description: 'What the price includes, in one sentence.',
            }),
          ],
          preview: {
            select: {title: 'name', price: 'price', billing: 'billing'},
            prepare({title, price, billing}) {
              return {
                title: title || 'Offer',
                subtitle: price ? `$${price}${billing === 'monthly' ? ' / month' : ''}` : undefined,
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current', audience: 'audience'},
    prepare({title, slug, audience}) {
      return {
        title: title || 'Landing page',
        subtitle: [slug ? `/${slug}` : null, audience].filter(Boolean).join(' · '),
      }
    },
  },
})
