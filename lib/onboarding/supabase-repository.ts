import type {OnboardingRecord, OnboardingRepository} from '@/lib/onboarding/types'

type SupabaseRecordRow = {
  idempotency_key: string
  provider: 'tally'
  project_id: string | null
  form_id: string | null
  item_key: string | null
  submission_id: string | null
  entry_title: string | null
  status: OnboardingRecord['status']
  review_reason: OnboardingRecord['reviewReason'] | null
  received_at: string
  attempts: number
  last_error: string | null
}

function toRow(record: OnboardingRecord): SupabaseRecordRow {
  return {
    idempotency_key: record.idempotencyKey,
    provider: record.provider,
    project_id: record.projectId,
    form_id: record.formId,
    item_key: record.itemKey,
    submission_id: record.submissionId,
    entry_title: record.entryTitle ?? null,
    status: record.status,
    review_reason: record.reviewReason ?? null,
    received_at: record.receivedAt,
    attempts: record.attempts,
    last_error: record.lastError ?? null,
  }
}

function fromRow(row: SupabaseRecordRow): OnboardingRecord {
  return {
    idempotencyKey: row.idempotency_key,
    provider: row.provider,
    projectId: row.project_id,
    formId: row.form_id,
    itemKey: row.item_key,
    submissionId: row.submission_id,
    entryTitle: row.entry_title,
    status: row.status,
    reviewReason: row.review_reason ?? undefined,
    receivedAt: row.received_at,
    attempts: row.attempts,
    lastError: row.last_error ?? undefined,
  }
}

export class SupabaseOnboardingRepository implements OnboardingRepository {
  constructor(private readonly config: {url: string; serviceRoleKey: string}) {}

  private async request<T>(path: string, init: RequestInit = {}) {
    const response = await fetch(`${this.config.url.replace(/\/$/, '')}${path}`, {
      ...init,
      headers: {
        'apikey': this.config.serviceRoleKey,
        'Authorization': `Bearer ${this.config.serviceRoleKey}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
    })
    if (!response.ok) throw new Error(`Supabase request failed with ${response.status}`)
    return response.json() as Promise<T>
  }

  private async getByKey(idempotencyKey: string) {
    const rows = await this.request<SupabaseRecordRow[]>(
      `/rest/v1/onboarding_submissions?idempotency_key=eq.${encodeURIComponent(idempotencyKey)}&limit=1`,
    )
    return rows[0] ? fromRow(rows[0]) : null
  }

  async recordOnce(record: OnboardingRecord) {
    const created = await this.request<SupabaseRecordRow[]>(
      '/rest/v1/onboarding_submissions?on_conflict=idempotency_key',
      {
        method: 'POST',
        headers: {Prefer: 'resolution=ignore-duplicates,return=representation'},
        body: JSON.stringify(toRow(record)),
      },
    )

    if (created[0]) return {created: true as const}
    const existing = await this.getByKey(record.idempotencyKey)
    if (!existing) throw new Error('Supabase idempotency insert returned no existing row')
    return {created: false as const, existing}
  }

  async markSyncSucceeded(idempotencyKey: string) {
    const existing = await this.getByKey(idempotencyKey)
    if (!existing) return
    await this.request(
      `/rest/v1/onboarding_submissions?idempotency_key=eq.${encodeURIComponent(idempotencyKey)}`,
      {
        method: 'PATCH',
        headers: {Prefer: 'return=minimal'},
        body: JSON.stringify({
          status: existing.reviewReason ? 'needs_review' : 'received_for_review',
          last_error: null,
          last_synced_at: new Date().toISOString(),
        }),
      },
    )
  }

  async markSyncFailed(idempotencyKey: string, error: string) {
    const existing = await this.getByKey(idempotencyKey)
    await this.request(
      `/rest/v1/onboarding_submissions?idempotency_key=eq.${encodeURIComponent(idempotencyKey)}`,
      {
        method: 'PATCH',
        headers: {Prefer: 'return=minimal'},
        body: JSON.stringify({
          status: 'queued_for_retry',
          review_reason: existing?.reviewReason ?? 'downstream_failed',
          attempts: (existing?.attempts ?? 0) + 1,
          last_error: error,
          last_failed_at: new Date().toISOString(),
        }),
      },
    )
  }

  async listRetryable() {
    const rows = await this.request<SupabaseRecordRow[]>(
      '/rest/v1/onboarding_submissions?status=eq.queued_for_retry&order=received_at.asc',
    )
    return rows.map(fromRow)
  }
}
