import 'server-only'
import type {GrowthReport} from '@/lib/growth/reportSchema'
import type {GrowthStageScore} from '@/lib/growth/scoring'
import {supabaseConfig, supabaseRequest} from '@/lib/onboarding/supabase'

/**
 * Supabase rows for paid Business Growth Analysis reports. Service role only,
 * through the same REST helper the proposal payments use. A row is created
 * when a quiz taker clicks through to pay, never before: free leads live in
 * the Sanity Leads pipeline like every other quiz.
 */

export type GrowthReportStatus = 'open' | 'paid' | 'generating' | 'ready' | 'failed'

export type GrowthAnswer = {key: string; label: string; answer: string; optionKey: string | null}

export type GrowthScores = {
  score: number
  band: string | null
  stages: GrowthStageScore[]
  weakest: string | null
  foundation: number | null
}

export type GrowthSource = {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  referrer?: string
  landingPath?: string
}

export type GrowthReportRow = {
  id: string
  token: string
  email: string
  first_name: string | null
  business_name: string | null
  business_type: string | null
  website_url: string | null
  answers: GrowthAnswer[]
  scores: GrowthScores
  fit: boolean
  source: GrowthSource | null
  marketing_consent: boolean
  status: GrowthReportStatus
  amount_cents: number
  currency: string
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
  paid_at: string | null
  report: GrowthReport | null
  report_model: string | null
  report_error: string | null
  generation_started_at: string | null
  delivered_at: string | null
  diagnostic_session_id: string | null
  diagnostic_status: 'open' | 'paid' | null
  diagnostic_paid_at: string | null
  created_at: string
  updated_at: string
}

const TABLE = '/rest/v1/growth_reports'

function eq(value: string) {
  return `eq.${encodeURIComponent(value)}`
}

export function growthStoreConfigured() {
  return supabaseConfig() !== null
}

export async function insertGrowthReport(
  row: Pick<
    GrowthReportRow,
    | 'token'
    | 'email'
    | 'first_name'
    | 'business_name'
    | 'business_type'
    | 'website_url'
    | 'answers'
    | 'scores'
    | 'fit'
    | 'source'
    | 'marketing_consent'
    | 'amount_cents'
  >,
) {
  const rows = await supabaseRequest<GrowthReportRow[]>(TABLE, {
    method: 'POST',
    headers: {Prefer: 'return=representation'},
    body: JSON.stringify({...row, status: 'open', currency: 'usd'}),
  })
  return rows[0]
}

async function findOne(filter: string) {
  if (!growthStoreConfigured()) return null
  const rows = await supabaseRequest<GrowthReportRow[]>(`${TABLE}?${filter}&limit=1`)
  return rows[0] ?? null
}

export function findGrowthReportByToken(token: string) {
  return findOne(`token=${eq(token)}`)
}

export function findGrowthReportById(id: string) {
  return findOne(`id=${eq(id)}`)
}

/** The row a Stripe session belongs to, and which of its two purchases it is. */
export async function findGrowthReportBySession(sessionId: string) {
  const report = await findOne(`stripe_checkout_session_id=${eq(sessionId)}`)
  if (report) return {row: report, purchase: 'report' as const}
  const diagnostic = await findOne(`diagnostic_session_id=${eq(sessionId)}`)
  if (diagnostic) return {row: diagnostic, purchase: 'diagnostic' as const}
  return null
}

/**
 * Patches rows matching the id and an optional extra filter, and returns what
 * changed. A filtered patch that returns nothing lost the race, which is how
 * the generation claim stays single.
 */
export async function updateGrowthReport(id: string, patch: Partial<GrowthReportRow>, onlyIf = '') {
  const rows = await supabaseRequest<GrowthReportRow[]>(
    `${TABLE}?id=${eq(id)}${onlyIf ? `&${onlyIf}` : ''}`,
    {
      method: 'PATCH',
      headers: {Prefer: 'return=representation'},
      body: JSON.stringify({...patch, updated_at: new Date().toISOString()}),
    },
  )
  return rows[0] ?? null
}

/** How long a generation may run before another caller is allowed to take it over. */
const STALE_GENERATION_MS = 6 * 60 * 1000

/**
 * Takes the right to generate this report. Returns the row when this caller
 * won, null when someone else holds it or there is nothing to do.
 */
export async function claimGrowthGeneration(id: string) {
  const started = new Date().toISOString()
  const claim = {status: 'generating' as const, generation_started_at: started, report_error: null}
  const fresh = await updateGrowthReport(id, claim, 'status=in.(paid,failed)')
  if (fresh) return fresh
  const staleBefore = new Date(Date.now() - STALE_GENERATION_MS).toISOString()
  return updateGrowthReport(
    id,
    claim,
    `status=eq.generating&generation_started_at=lt.${encodeURIComponent(staleBefore)}`,
  )
}
