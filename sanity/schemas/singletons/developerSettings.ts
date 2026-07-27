import {CodeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Developer Settings Singleton
 *
 * Technical configuration that should only be edited by developers.
 * Clients typically shouldn't need to touch these settings.
 *
 * IMPORTANT: These fields are for documentation/reference purposes.
 * They are NOT automatically applied to the site. The actual configuration
 * happens via environment variables (.env.local):
 *
 * - NEXT_PUBLIC_GTM_ID → Google Tag Manager (replaces GA and GTM IDs here)
 * - ROBOTS_DISALLOW_ALL → Blocks crawlers (instead of robotsDirectives)
 * - RESEND_API_KEY / CONTACT_EMAIL → Email delivery (instead of Mailchimp)
 *
 * This schema exists so developers have a central place to document
 * which integrations are active for this client, but the values here
 * do not drive runtime behavior.
 */
export default defineType({
  name: 'developerSettings',
  title: 'Developer Settings',
  type: 'document',
  icon: CodeIcon,
  description:
    'Salt Studio only — analytics IDs and technical reference fields. You usually do not need to edit this.',
  groups: [
    {name: 'analytics', title: 'Analytics'},
    {name: 'integrations', title: 'Integrations'},
    {name: 'advanced', title: 'Advanced'},
  ],
  fields: [
    // ==========================================================================
    // ANALYTICS GROUP
    // ==========================================================================
    // ==========================================================================
    // CLIENT'S GOOGLE ANALYTICS (FUNCTIONAL - THIS ONE ACTUALLY WORKS)
    // ==========================================================================
    defineField({
      name: 'clientGoogleAnalyticsId',
      title: 'Your Google Analytics ID',
      type: 'string',
      group: 'analytics',
      description:
        'Your GA4 Measurement ID (starts with G-). This field IS functional — entering an ID here will send analytics data to your Google Analytics account.',
      validation: (rule) =>
        rule
          .regex(/^G-[A-Z0-9]+$/, {name: 'GA4 format'})
          .warning('Should start with G- (e.g., G-XXXXXXXXXX)'),
    }),

    // ==========================================================================
    // REFERENCE DOCUMENTATION (NOT FUNCTIONAL)
    // ==========================================================================
    defineField({
      name: 'analyticsDescription',
      title: 'Reference Documentation',
      type: 'string',
      group: 'analytics',
      description:
        'The fields below are for documentation purposes only. They do not affect site behavior.',
      readOnly: true,
      initialValue: '↓ Document additional tracking IDs below (for reference only)',
    }),
    defineField({
      name: 'googleAnalyticsId',
      title: 'Google Analytics ID (Reference)',
      type: 'string',
      group: 'analytics',
      description:
        'For documentation only. If you want functional GA4 tracking, use "Your Google Analytics ID" above.',
      validation: (rule) =>
        rule
          .regex(/^G-[A-Z0-9]+$/, {name: 'GA4 format'})
          .warning('Should start with G- followed by alphanumeric characters'),
    }),
    defineField({
      name: 'googleTagManagerId',
      title: 'Google Tag Manager ID',
      type: 'string',
      group: 'analytics',
      description:
        'GTM Container ID (starts with GTM-). The actual ID is set in NEXT_PUBLIC_GTM_ID env var.',
      validation: (rule) =>
        rule
          .regex(/^GTM-[A-Z0-9]+$/, {name: 'GTM format'})
          .warning('Should start with GTM- followed by alphanumeric characters'),
    }),
    defineField({
      name: 'facebookPixelId',
      title: 'Facebook Pixel ID',
      type: 'string',
      group: 'analytics',
      description: 'Your Meta/Facebook Pixel ID for conversion tracking.',
    }),
    defineField({
      name: 'hotjarId',
      title: 'Hotjar Site ID',
      type: 'string',
      group: 'analytics',
      description: 'Your Hotjar Site ID for heatmaps and session recordings.',
    }),

    // ==========================================================================
    // INTEGRATIONS GROUP
    // ==========================================================================
    defineField({
      name: 'integrationsDescription',
      title: 'Third-Party Integrations',
      type: 'string',
      group: 'integrations',
      description:
        'Document integration IDs for reference. Actual configuration is via environment variables.',
      readOnly: true,
      initialValue: '↓ Document your integrations below (for reference only)',
    }),
    defineField({
      name: 'mailchimpAudienceId',
      title: 'Mailchimp Audience ID',
      type: 'string',
      group: 'integrations',
      description: 'The Audience/List ID for newsletter signups.',
    }),
    defineField({
      name: 'calendlyUrl',
      title: 'Calendly URL',
      type: 'url',
      group: 'integrations',
      description: 'Your Calendly scheduling link for booking meetings.',
    }),
    defineField({
      name: 'crispWebsiteId',
      title: 'Crisp Website ID',
      type: 'string',
      group: 'integrations',
      description: 'Your Crisp chat widget ID for live chat support.',
    }),

    // ==========================================================================
    // ADVANCED GROUP
    // ==========================================================================
    defineField({
      name: 'advancedDescription',
      title: 'Advanced Configuration',
      type: 'string',
      group: 'advanced',
      description:
        'Technical settings documentation. Robot directives are controlled via ROBOTS_DISALLOW_ALL env var. Custom scripts should be added via GTM.',
      readOnly: true,
      initialValue: '↓ Advanced settings documentation (for reference only)',
    }),
    defineField({
      name: 'businessType',
      title: 'Schema.org Business Type',
      type: 'string',
      group: 'advanced',
      description: 'Used for structured data. Affects how your site appears in search results.',
      options: {
        list: [
          {title: 'Organization (default)', value: 'Organization'},
          {title: 'Local Business', value: 'LocalBusiness'},
          {title: 'Professional Service', value: 'ProfessionalService'},
          {title: 'Person / Personal Brand', value: 'Person'},
        ],
      },
      initialValue: 'Organization',
    }),
    defineField({
      name: 'robotsDirectives',
      title: 'Robots Directives',
      type: 'object',
      group: 'advanced',
      description:
        'Document robots settings for reference. Actual control is via ROBOTS_DISALLOW_ALL env var on staging.',
      fields: [
        defineField({
          name: 'noIndex',
          title: 'Block from Search Engines',
          type: 'boolean',
          description:
            'Document if staging should be blocked. Set ROBOTS_DISALLOW_ALL=true in env to actually block.',
          initialValue: false,
        }),
        defineField({
          name: 'noFollow',
          title: 'Prevent Link Following',
          type: 'boolean',
          description: 'Document if links should not be followed. Rarely needed.',
          initialValue: false,
        }),
      ],
    }),
    defineField({
      name: 'headScripts',
      title: 'Custom Head Scripts',
      type: 'text',
      rows: 6,
      group: 'advanced',
      description:
        'Document any custom scripts needed. For implementation, add scripts via GTM or contact your developer.',
    }),
    defineField({
      name: 'bodyScripts',
      title: 'Custom Body Scripts',
      type: 'text',
      rows: 6,
      group: 'advanced',
      description:
        'Document chat widgets or other body scripts. For implementation, add via GTM or contact your developer.',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Developer Settings',
        subtitle: 'Reference documentation (not auto-applied)',
      }
    },
  },
})
