import {CogIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const FOOTER_SOCIAL_PLATFORMS = [
  {title: 'Instagram', value: 'instagram'},
  {title: 'Vimeo', value: 'vimeo'},
  {title: 'Email', value: 'email'},
  {title: 'WhatsApp', value: 'whatsapp'},
  {title: 'YouTube', value: 'youtube'},
  {title: 'X / Twitter', value: 'x'},
  {title: 'LinkedIn', value: 'linkedin'},
  {title: 'TikTok', value: 'tiktok'},
  {title: 'Custom (upload icon)', value: 'custom'},
] as const

export default defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  icon: CogIcon,
  // Uncomment below to have edits publish automatically as you type
  // liveEdit: true,
  groups: [
    {name: 'navigation', title: 'Navigation'},
    {name: 'seo', title: 'SEO & Social'},
    {name: 'footer', title: 'Footer'},
  ],
  fields: [
    // ==========================================================================
    // SEO & SOCIAL GROUP
    // ==========================================================================
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      description:
        'The name of your website. Used in browser tabs, search results, logo alt text, and the footer copyright line (© Site Name YEAR).',
      group: 'seo',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'siteDescription',
      title: 'Site Description',
      type: 'text',
      rows: 2,
      description:
        'Default meta description for pages without their own. Keep under 160 characters.',
      group: 'seo',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'ogImage',
      title: 'Default Social Image',
      type: 'image',
      description: 'Displayed when your site is shared on social media. Recommended: 1200×630px.',
      group: 'seo',
      options: {
        hotspot: true,
        accept: 'image/png,image/jpeg,image/webp',
      },
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'object',
      group: 'seo',
      description: 'Links to your social media profiles. Used in footer and structured data.',
      fields: [
        defineField({
          name: 'twitter',
          title: 'Twitter / X',
          type: 'url',
          validation: (rule) => rule.uri({scheme: ['https']}).error('Must be a valid https URL'),
        }),
        defineField({
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url',
          validation: (rule) => rule.uri({scheme: ['https']}).error('Must be a valid https URL'),
        }),
        defineField({
          name: 'instagram',
          title: 'Instagram',
          type: 'url',
          validation: (rule) => rule.uri({scheme: ['https']}).error('Must be a valid https URL'),
        }),
        defineField({
          name: 'facebook',
          title: 'Facebook',
          type: 'url',
          validation: (rule) => rule.uri({scheme: ['https']}).error('Must be a valid https URL'),
        }),
        defineField({
          name: 'github',
          title: 'GitHub',
          type: 'url',
          validation: (rule) => rule.uri({scheme: ['https']}).error('Must be a valid https URL'),
        }),
        defineField({
          name: 'youtube',
          title: 'YouTube',
          type: 'url',
          validation: (rule) => rule.uri({scheme: ['https']}).error('Must be a valid https URL'),
        }),
        defineField({
          name: 'vimeo',
          title: 'Vimeo',
          type: 'url',
          validation: (rule) => rule.uri({scheme: ['https']}).error('Must be a valid https URL'),
        }),
      ],
      options: {
        collapsible: true,
        collapsed: true,
      },
    }),

    // ==========================================================================
    // NAVIGATION GROUP
    // ==========================================================================
    defineField({
      name: 'logo',
      title: 'Site Logo',
      type: 'image',
      group: 'navigation',
      description:
        'Horizontal wordmark for the site header, mobile menu, and footer. Prefer a black SVG or transparent PNG — it is inverted to white on dark backgrounds. Falls back to a text wordmark if empty.',
      options: {
        hotspot: true,
        accept: 'image/svg+xml,image/png,image/webp',
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the logo for screen readers (e.g. "Salt Studio").',
        }),
      ],
    }),
    defineField({
      name: 'projectBodyBackgroundVideo',
      title: 'Project page ambient background',
      type: 'file',
      group: 'navigation',
      description:
        'Looping motion graphic behind the two-column project body. Defaults to Big circle (white on black) when empty.',
      options: {
        accept: 'video/mp4',
      },
    }),
    defineField({
      name: 'menuItems',
      title: 'Main Navigation',
      description:
        'Links displayed in the site header. Drag to reorder. Give an item “Dropdown links” to turn it into a menu.',
      type: 'array',
      group: 'navigation',
      of: [defineArrayMember({type: 'navItem'})],
    }),

    // ==========================================================================
    // FOOTER GROUP — centered layout on the site:
    //   logo (Site Logo) → social icons (incl. email)
    //   bottom strip: © Site Name YEAR · credit · legal links
    // Legal links auto-list every Legal Page document (Dynamic Content → Legal Pages).
    // ==========================================================================
    defineField({
      name: 'footerSocial',
      title: 'Footer social links',
      type: 'array',
      group: 'footer',
      description:
        'Icons under the logo. Pick a platform for a built-in icon, or choose Custom and upload an SVG/PNG. For email use mailto:hello@createdbysalt.com; for WhatsApp use https://wa.me/<number>. Drag to reorder.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'footerSocialLink',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: FOOTER_SOCIAL_PLATFORMS.map((p) => p),
                layout: 'dropdown',
              },
              validation: (rule) => rule.required().error('Pick a platform'),
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description:
                'Optional display name for screen readers. Required when platform is Custom. Defaults to the platform name.',
              hidden: ({parent}) => parent?.platform !== 'custom',
              validation: (rule) =>
                rule.custom((value, context) => {
                  const platform = (context.parent as {platform?: string})?.platform
                  if (platform === 'custom' && !value?.trim()) {
                    return 'Add a label for custom links'
                  }
                  return true
                }),
            }),
            defineField({
              name: 'href',
              title: 'URL',
              type: 'string',
              description:
                'Full link — e.g. https://www.instagram.com/…, mailto:hello@createdbysalt.com for email, or https://wa.me/15551234567 for WhatsApp.',
              validation: (rule) =>
                rule.required().custom((value) => {
                  const v = typeof value === 'string' ? value.trim() : ''
                  if (!v) return 'Add a URL'
                  if (
                    v.startsWith('https://') ||
                    v.startsWith('http://') ||
                    v.startsWith('mailto:')
                  ) {
                    return true
                  }
                  return 'Use https://… or mailto:…'
                }),
            }),
            defineField({
              name: 'customIcon',
              title: 'Custom icon',
              type: 'image',
              description: 'Black SVG or PNG — inverted to white on dark footer backgrounds.',
              hidden: ({parent}) => parent?.platform !== 'custom',
              options: {
                accept: 'image/svg+xml,image/png,image/webp',
              },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt text',
                  type: 'string',
                }),
              ],
              validation: (rule) =>
                rule.custom((value, context) => {
                  const platform = (context.parent as {platform?: string})?.platform
                  if (platform === 'custom' && !value?.asset?._ref) {
                    return 'Upload an icon for custom links'
                  }
                  return true
                }),
            }),
          ],
          preview: {
            select: {
              platform: 'platform',
              label: 'label',
              href: 'href',
              media: 'customIcon',
            },
            prepare({platform, label, href, media}) {
              const platformTitle =
                FOOTER_SOCIAL_PLATFORMS.find((p) => p.value === platform)?.title ||
                platform ||
                'Link'
              return {
                title: label?.trim() || platformTitle,
                subtitle: href,
                media,
              }
            },
          },
        }),
      ],
    }),
    // Deprecated — email lives in Footer social links (Platform: Email, URL: mailto:…).
    defineField({
      name: 'footerEmail',
      title: 'Footer email (deprecated)',
      type: 'string',
      group: 'footer',
      hidden: true,
      description: 'Deprecated — add an Email item under Footer social links instead.',
    }),
    defineField({
      name: 'showFooterLegal',
      title: 'Show legal links',
      type: 'boolean',
      group: 'footer',
      description:
        'When on, every Legal Page appears in the bottom strip (Privacy · Terms · Cookies · Accessibility). Edit pages in Dynamic Content → Legal Pages.',
      initialValue: true,
    }),
    defineField({
      name: 'showBuiltWithCredit',
      title: 'Show “Built with SALT Studio”',
      type: 'boolean',
      group: 'footer',
      description:
        'When on, the footer bottom strip shows “Built with SALT Studio” linking to createdbysalt.com.',
      initialValue: true,
    }),
    // Deprecated — footer auto-lists every Legal Page document. Kept hidden so
    // existing references aren’t lost; no longer rendered on the site.
    defineField({
      name: 'legalLinks',
      title: 'Legal Links (deprecated)',
      description:
        'Deprecated — use “Show legal links” above. Pages come from Dynamic Content → Legal Pages.',
      type: 'array',
      group: 'footer',
      hidden: true,
      of: [
        {
          type: 'reference',
          to: [{type: 'legalPage'}],
        },
      ],
    }),
    // Deprecated portable-text footer — kept hidden so existing content isn’t lost
    // until editors confirm the structured fields above. Not rendered on the site.
    defineField({
      name: 'footer',
      title: 'Footer Content (deprecated)',
      description: 'Deprecated — use the structured footer fields above instead.',
      type: 'array',
      group: 'footer',
      hidden: true,
      of: [
        defineArrayMember({
          type: 'block',
          marks: {
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'Url',
                  },
                ],
              },
            ],
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Settings',
        subtitle: 'Site configuration, navigation, and SEO',
      }
    },
  },
})
