/**
 * Shared Tally kit for church website clients.
 *
 * ENJOY_LIFE_TALLY_FORMS are the live Enjoy Life examples. Do not send new
 * clients there. Do not PATCH, rename, or delete PROTECTED_TALLY_FORM_IDS.
 *
 * CHURCH_TALLY_FORMS is the Salt Church kit. Create or refresh those URLs with
 * `node scripts/tally/church-kit.mjs`.
 */

export const PROTECTED_TALLY_FORM_IDS = [
  '1AOReW',
  'oblYeV',
  'MePV4X',
  'J9GoPd',
  'gDgzld',
  'yPg1Q4',
  'Xx9Qa4',
  '812rBx',
  'ZjjkEe',
  'eqYXjq',
] as const

export type ProtectedTallyFormId = (typeof PROTECTED_TALLY_FORM_IDS)[number]

export const ENJOY_LIFE_TALLY_FORMS = {
  staff: 'https://tally.so/r/1AOReW',
  ministry: 'https://tally.so/r/oblYeV',
  dreamTeam: 'https://tally.so/r/MePV4X',
  smallGroup: 'https://tally.so/r/J9GoPd',
  event: 'https://tally.so/r/gDgzld',
  course: 'https://tally.so/r/yPg1Q4',
  testimony: 'https://tally.so/r/Xx9Qa4',
  faq: 'https://tally.so/r/812rBx',
} as const

/** New Salt Church kit. Filled after `scripts/tally/church-kit.mjs` creates the forms. */
export const CHURCH_TALLY_FORMS = {
  gettingStarted: 'https://tally.so/r/XxPl4P',
  staff: 'https://tally.so/r/814oZl',
  ministry: 'https://tally.so/r/0QRre9',
  dreamTeam: 'https://tally.so/r/zx5X7k',
  smallGroup: 'https://tally.so/r/5BPKZN',
  event: 'https://tally.so/r/Y5lD4N',
  course: 'https://tally.so/r/lbkD6o',
  testimony: 'https://tally.so/r/RGyKPK',
  faq: 'https://tally.so/r/obL6Gb',
} as const

export type ChurchTallyFormKey = keyof typeof CHURCH_TALLY_FORMS

export const CHURCH_TALLY_FORM_META: Record<
  ChurchTallyFormKey,
  {title: string; sendTo: string; expect: string}
> = {
  gettingStarted: {
    title: 'Salt Church — Getting Started',
    sendTo: 'Church admin or project lead',
    expect: 'Kickoff context plus full church intake (mission through DNS). Voice samples required.',
  },
  staff: {
    title: 'Salt Church — Staff Bio',
    sendTo: 'Each staff member',
    expect: 'Bio and headshot (1 photo, or 3 for couples).',
  },
  ministry: {
    title: 'Salt Church — Ministry',
    sendTo: 'Each ministry leader',
    expect: 'Ministry copy, preview, banner, and up to 10 gallery photos.',
  },
  dreamTeam: {
    title: 'Salt Church — Crew',
    sendTo: 'Each volunteer coordinator',
    expect: 'Team info and 2–3 action photos.',
  },
  smallGroup: {
    title: 'Salt Church — Small Group',
    sendTo: 'Each group leader',
    expect: 'Meeting details, who it is for, and optional photos.',
  },
  event: {
    title: 'Salt Church — Event',
    sendTo: 'Event coordinators',
    expect: 'Date, location, description, and optional graphic.',
  },
  course: {
    title: 'Salt Church — Course',
    sendTo: 'Class or study leaders',
    expect: 'Schedule, who it is for, and registration link.',
  },
  testimony: {
    title: 'Salt Church — Testimony',
    sendTo: 'Members with a story',
    expect: 'Story, optional photo or video.',
  },
  faq: {
    title: 'Salt Church — FAQ',
    sendTo: 'Staff and volunteer leaders',
    expect: 'Questions people ask, with suggested answers.',
  },
}
