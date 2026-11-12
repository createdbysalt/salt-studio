/**
 * Initial values for a church website client portal.
 * Create → Church website fills the checklist so you do not build it per client.
 */

import {CHURCH_TALLY_FORMS} from '@/lib/tally/church-forms'
import {CHURCH_WEBSITE_CHECKLIST_ID} from '@/sanity/schemas/documents/portalChecklist'
import {CHURCH_WEBSITE_FORMS_ID} from '@/sanity/schemas/documents/portalForms'
import {WEBSITE_PROJECT_PHASES_ID} from '@/sanity/schemas/documents/projectPhases'

const KICKOFF_URL = 'https://cal.com/createdbysalt/kickoff?overlayCalendar=true'

function item(
  key: string,
  fields: {
    title: string
    description?: string
    required?: boolean
    link?: string
    linkLabel?: string
  },
) {
  return {
    _type: 'portalChecklistItem' as const,
    _key: key,
    required: fields.required ?? true,
    ...fields,
  }
}

function category(
  key: string,
  fields: {
    title: string
    description?: string
    items: ReturnType<typeof item>[]
  },
) {
  return {
    _type: 'portalChecklistCategory' as const,
    _key: key,
    ...fields,
  }
}

/** Shared church website checklist groups — Getting Started, Branding, Photos. */
export function getChurchWebsiteChecklistCategories() {
  return [
    category('getting-started', {
      title: 'Getting Started',
      description: 'The one intake form. Then tick it when it is sent.',
      items: [
        item('gs-form', {
          title: 'Fill Getting Started',
          description:
            'Kickoff plus church info — or ask us to pull public info from the current site. Design direction, voice samples, Planning Center, and domain still go on this form.',
          link: CHURCH_TALLY_FORMS.gettingStarted,
          linkLabel: 'Open form →',
        }),
      ],
    }),
    category('branding', {
      title: 'Branding',
      description: 'Upload these files to the Branding folder, then tick the item.',
      items: [
        item('b-primary', {
          title: 'Primary logo',
          description:
            'Your main church logo as SVG, AI, or EPS. If you only have a PNG, make sure it is at least 2000px wide.',
        }),
        item('b-variations', {
          title: 'Logo variations',
          description:
            'Any other versions you have — horizontal, stacked, icon-only, or text-only. Skip if the primary logo is the only version.',
          required: false,
        }),
        item('b-favicon', {
          title: 'Favicon / icon',
          description:
            'A square version for browser tabs and app icons. If you do not have one, we can make it.',
          required: false,
        }),
        item('b-light', {
          title: 'Logo for light backgrounds',
          description:
            'Usually your standard logo. Skip if the primary already works on light backgrounds.',
          required: false,
        }),
        item('b-dark', {
          title: 'Logo for dark backgrounds',
          description:
            'Usually white or light-colored. Skip if you do not have one — we can create a version.',
          required: false,
        }),
        item('b-headline', {
          title: 'Headline font',
          description:
            'Send the font files (.ttf, .otf, or .woff2) or tell us the exact Google Font name (e.g. "Montserrat Bold").',
        }),
        item('b-body', {
          title: 'Body text font',
          description: 'Send files or the Google Font name. We need at least Regular and Bold.',
        }),
        item('b-colors', {
          title: 'Brand colors',
          description:
            'Hex codes (e.g. "Primary: #1a1a1a, Accent: #d4af37"). If you do not know them, we can pull them from your logo.',
        }),
        item('b-guide', {
          title: 'Brand guidelines document',
          description: 'Skip if you do not have a style guide.',
          required: false,
        }),
        item('b-app', {
          title: 'Church app icon',
          description: 'If you have a church app, provide the icon at 1024×1024.',
          required: false,
        }),
      ],
    }),
    category('media', {
      title: 'Photos & Video',
      description:
        'Use a real camera if you can — phone photos are a last resort. We need mostly landscape shots that can fill a wide screen; a few portraits are fine. Please sort them into labeled folders in the Photos Drive (building, services, people, and so on). Staff, ministry, and crew photos can go on the forms or in this folder. Then tick the item off the list.',
      items: [
        item('p-staff', {
          title: 'Staff headshots',
          description:
            '1 per person (3 for couples: both headshots + a couple photo). The staff form will ask for these, or you can drop them in the Photos folder.',
        }),
        item('p-ministry', {
          title: 'Ministry photos',
          description:
            'Preview image, banner, and up to 10 gallery photos per ministry. The ministry form will ask for these, or you can drop them in the Photos folder.',
        }),
        item('p-crew', {
          title: 'Crew photos',
          description:
            '2–3 per team. The crew form will ask for these, or you can drop them in the Photos folder.',
        }),
        item('p-building', {
          title: 'Building photos',
          description: 'Exterior, interior, sanctuary, lobby, kids areas. Aim for about 10.',
        }),
        item('p-service', {
          title: 'Service photos',
          description: 'Worship, preaching, congregation during services. Aim for about 30.',
        }),
        item('p-people', {
          title: 'Smiling faces & interactions',
          description: 'People connecting, greeting, laughing at church events. Aim for about 20.',
        }),
        item('p-baptism', {
          title: 'Baptisms & dedications',
          description: 'Powerful moments of life change. Aim for about 10.',
        }),
        item('p-outreach', {
          title: 'Community outreach',
          description: 'Serving others, local missions, volunteering. Aim for about 10.',
        }),
        item('p-seasonal', {
          title: 'Seasonal events',
          description: 'Easter, Christmas, VBS, special services. Aim for about 15.',
        }),
        item('p-video', {
          title: 'Homepage video',
          description:
            'A professional landscape video (16:9) that fills a computer screen. About 10 seconds, made to loop on the homepage. Shot on a real camera — this is the first thing people see.',
          required: false,
        }),
      ],
    }),
  ]
}

export const CHURCH_WEBSITE_FORMS_INTRO =
  'These are public links. Send each one to the right people on staff so they can fill out their own area — bios, ministry details, photos, and the rest. When everyone has sent theirs, tick the form so we know it is done.'

export function getChurchWebsiteFormItems() {
  return [
    item('f-staff', {
      title: 'Staff profile forms',
      description:
        'Each staff member fills out the form with their bio and headshot (1 photo for individuals, 3 for couples).',
      link: CHURCH_TALLY_FORMS.staff,
      linkLabel: 'Open form →',
    }),
    item('f-ministry', {
      title: 'Ministry info forms',
      description:
        'Each ministry leader fills out the form with details, a preview image, a banner, and up to 10 gallery photos.',
      link: CHURCH_TALLY_FORMS.ministry,
      linkLabel: 'Open form →',
    }),
    item('f-crew', {
      title: 'Crew forms',
      description: 'Each volunteer coordinator fills out the form with team info and 2–3 photos.',
      link: CHURCH_TALLY_FORMS.dreamTeam,
      linkLabel: 'Open form →',
    }),
    item('f-small-group', {
      title: 'Small group forms',
      description: 'Each group leader fills out meeting details and optional photos.',
      required: false,
      link: CHURCH_TALLY_FORMS.smallGroup,
      linkLabel: 'Open form →',
    }),
    item('f-event', {
      title: 'Event forms',
      description: 'Event coordinators submit calendar items and optional graphics.',
      required: false,
      link: CHURCH_TALLY_FORMS.event,
      linkLabel: 'Open form →',
    }),
    item('f-course', {
      title: 'Course forms',
      description: 'Class or study leaders add schedule and registration info.',
      required: false,
      link: CHURCH_TALLY_FORMS.course,
      linkLabel: 'Open form →',
    }),
    item('f-testimony', {
      title: 'Testimony forms',
      description: 'Members with a story can share it here.',
      required: false,
      link: CHURCH_TALLY_FORMS.testimony,
      linkLabel: 'Open form →',
    }),
    item('f-faq', {
      title: 'FAQ forms',
      description:
        'Pick a category and paste Q: / A: pairs. Fill the form again for the next category.',
      required: false,
      link: CHURCH_TALLY_FORMS.faq,
      linkLabel: 'Open form →',
    }),
  ]
}

export function getChurchWebsitePortalInitialValue() {
  return {
    serviceType: 'website',
    clientType: 'church',
    projectPhases: {_type: 'reference', _ref: WEBSITE_PROJECT_PHASES_ID},
    checklistTemplate: {_type: 'reference', _ref: CHURCH_WEBSITE_CHECKLIST_ID},
    formsTemplate: {_type: 'reference', _ref: CHURCH_WEBSITE_FORMS_ID},
    password: 'salt',
    enabled: true,
    checklist: [
      ...(() => {
        const groups = getChurchWebsiteChecklistCategories()
        const [start, ...rest] = groups
        return [
          {
            ...start,
            items: [
              item('gs-kickoff', {
                title: 'Book kickoff call',
                description:
                  'Schedule the kickoff call where we walk through your project together.',
                link: KICKOFF_URL,
                linkLabel: 'Book now →',
              }),
              ...(start?.items ?? []),
            ],
          },
          ...rest,
        ]
      })(),
      category('forms', {
        title: 'Forms',
        description: CHURCH_WEBSITE_FORMS_INTRO,
        items: getChurchWebsiteFormItems(),
      }),
    ],
  }
}
