/**
 * Shared Tally kit for church website clients.
 *
 * Form IDs and URLs are client data and stay out of the repo. They live in the
 * NEXT_PUBLIC_TALLY_CHURCH_FORMS env var as JSON — real values in `.env.local`
 * and Vercel, shape documented in `.env.example`.
 *
 * `protected` IDs are live client forms (Enjoy Life + Before We Meet + MFI).
 * Do not PATCH, rename, or delete them. `enjoyLife` are live examples — do not
 * send new clients there. `church` is the Salt Church kit; create or refresh
 * those URLs with `node scripts/tally/church-kit.mjs`.
 */

export const CHURCH_TALLY_FORM_KEYS = [
  'gettingStarted',
  'staff',
  'ministry',
  'dreamTeam',
  'smallGroup',
  'event',
  'course',
  'testimony',
  'faq',
] as const

export type ChurchTallyFormKey = (typeof CHURCH_TALLY_FORM_KEYS)[number]

type TallyCatalog = {
  protected?: string[]
  enjoyLife?: Record<string, string>
  church?: Partial<Record<ChurchTallyFormKey, string>>
  overrides?: Record<string, {title: string; link: string; description?: string}>
}

function parseCatalog(): TallyCatalog {
  const raw = process.env.NEXT_PUBLIC_TALLY_CHURCH_FORMS
  if (!raw) return {}
  try {
    return JSON.parse(raw) as TallyCatalog
  } catch {
    console.warn('NEXT_PUBLIC_TALLY_CHURCH_FORMS is not valid JSON — Tally links are disabled')
    return {}
  }
}

const catalog = parseCatalog()

/** Live client form IDs. Never PATCH, rename, or delete. */
export const PROTECTED_TALLY_FORM_IDS: readonly string[] = catalog.protected ?? []

/** Live Enjoy Life example URLs. Do not send new clients there. */
export const ENJOY_LIFE_TALLY_FORMS: Record<string, string> = catalog.enjoyLife ?? {}

/** The Salt Church kit. Falls back to '#' when the env var is missing. */
export const CHURCH_TALLY_FORMS = Object.fromEntries(
  CHURCH_TALLY_FORM_KEYS.map((key) => [key, catalog.church?.[key] ?? '#']),
) as Record<ChurchTallyFormKey, string>

export const CHURCH_TALLY_FORM_META: Record<
  ChurchTallyFormKey,
  {title: string; sendTo: string; expect: string}
> = {
  gettingStarted: {
    title: 'Salt Church — Getting Started',
    sendTo: 'Church admin or project lead',
    expect:
      'Kickoff, then church info or “pull from current site.” Design direction, voice samples, Planning Center, and domain still required.',
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
    expect: 'One category per submit. Q: / A: pairs in one text box, blank line between each.',
  },
}

/** Per-client Getting Started replacements. Shared kit stays the default. */
export const CLIENT_GETTING_STARTED_OVERRIDES: Record<
  string,
  {title: string; link: string; description?: string}
> = catalog.overrides ?? {}
