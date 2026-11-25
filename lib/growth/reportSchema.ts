import {z} from 'zod'

/**
 * The shape of a paid report. One schema is the model's output format, the
 * stored JSON, and what the report page renders, so they cannot drift.
 * Kept to strings, enums and arrays: structured outputs do not take length
 * or range limits, so those are enforced in tidyGrowthReport.
 */

export const GrowthReportSchema = z.object({
  leak_sentence: z
    .string()
    .describe('One plain sentence that names the biggest leak. No preamble.'),
  stages: z
    .array(
      z.object({
        id: z.enum(['found', 'website', 'leads', 'booking', 'followup']),
        told_us: z.string().describe('What the owner told us, in their own words where possible.'),
        read: z.enum(['strong', 'watch', 'open']),
        note: z.string().describe('One or two sentences on what this means for them.'),
      }),
    )
    .describe('All five stages, in path order.'),
  holds_in_place: z.object({
    person: z.string().describe('Who owns new inquiries today, from their answer.'),
    written_process: z.string().describe('Whether the steps are written down, from their answer.'),
    tool: z.string().describe('Whether a tool is in use for it, from their answer.'),
  }),
  website_notes: z
    .array(z.string())
    .describe('Observations from the measured site data only. Empty when no site data was given.'),
  listing_notes: z
    .array(z.string())
    .describe('Notes on their Google listing, drawn only from their own answer.'),
  plan: z
    .array(
      z.object({
        title: z.string().describe('The action, starting with a verb.'),
        why: z.string().describe('One sentence on what it fixes.'),
        owner: z.string().describe('A role, such as Owner or Front desk. Never a made-up name.'),
        due_day: z.number().describe('Day to have it done by, counted from today. 1 to 30.'),
      }),
    )
    .describe('Up to five items, ordered by what has to happen first.'),
  closing_note: z
    .string()
    .describe('One or two sentences. This is a first read from their answers, not their numbers.'),
})

export type GrowthReport = z.infer<typeof GrowthReportSchema>

const DASHES = /\s*[–—]\s*/g
const NUMBER_RANGE = /(\d)\s*[–—]\s*(?=\d)/g
// Takes the commas that set the word off with it, so no ",." is left behind.
const BANNED_WORD = /,?\s*\bgenuinely\b,?\s*/gi

/** House copy rules the model is told about and that are enforced here anyway. */
export function scrubCopy(text: string) {
  return text
    .replace(NUMBER_RANGE, '$1 to ')
    .replace(DASHES, ', ')
    .replace(BANNED_WORD, ' ')
    .replace(/ +([.,;:!?])/g, '$1')
    .replace(/ {2,}/g, ' ')
    .trim()
}

function scrubDeep<T>(value: T): T {
  if (typeof value === 'string') return scrubCopy(value) as T
  if (Array.isArray(value)) return value.map(scrubDeep) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, scrubDeep(v)]),
    ) as T
  }
  return value
}

/**
 * Applies the limits the schema cannot carry: at most five plan items, due
 * days inside 1 to 30 and in order, no website notes when nothing was
 * measured, and the copy rules on every string.
 */
export function tidyGrowthReport(report: GrowthReport, hasSiteData: boolean): GrowthReport {
  const plan = report.plan
    .slice(0, 5)
    .map((item) => ({...item, due_day: Math.min(30, Math.max(1, Math.round(item.due_day) || 1))}))
    .sort((a, b) => a.due_day - b.due_day)
  return scrubDeep({
    ...report,
    plan,
    website_notes: hasSiteData ? report.website_notes.slice(0, 6) : [],
    listing_notes: report.listing_notes.slice(0, 4),
  })
}
