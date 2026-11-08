import {createHash, randomUUID} from 'node:crypto'
import {PREVIEW_FIXTURE_PROJECT_ID} from '@/lib/onboarding/preview-fixtures'
import type {OnboardingRecord, OnboardingRepository} from '@/lib/onboarding/types'

type StoredOnboardingDocument = OnboardingRecord & {
  _id: string
  _type: 'onboardingSubmission'
  nonce?: string
}

type SanityRepositoryClient = {
  createIfNotExists: (
    document: StoredOnboardingDocument,
    ...args: unknown[]
  ) => Promise<StoredOnboardingDocument>
  fetch: <T>(query: string, params?: Record<string, unknown>) => Promise<T>
  patch: (id: string) => {
    set: (attrs: Record<string, unknown>) => {
      unset: (attrs: string[]) => {
        commit: () => Promise<unknown>
      }
      commit: () => Promise<unknown>
    }
    inc: (attrs: Record<string, number>) => {
      set: (attrs: Record<string, unknown>) => {
        commit: () => Promise<unknown>
      }
    }
  }
}

export function onboardingSubmissionDocumentId(idempotencyKey: string) {
  const digest = createHash('sha256').update(idempotencyKey).digest('hex')
  return `onboardingSubmission.${digest}`
}

export class MemoryOnboardingRepository implements OnboardingRepository {
  private records = new Map<string, OnboardingRecord>()

  async recordOnce(record: OnboardingRecord) {
    const existing = this.records.get(record.idempotencyKey)
    if (existing) return {created: false as const, existing}

    this.records.set(record.idempotencyKey, record)
    return {created: true as const}
  }

  async markSyncSucceeded(idempotencyKey: string) {
    const record = this.records.get(idempotencyKey)
    if (!record) return
    this.records.set(idempotencyKey, {
      ...record,
      status: record.reviewReason ? 'needs_review' : 'received_for_review',
      lastError: undefined,
    })
  }

  async markSyncFailed(idempotencyKey: string, error: string) {
    const record = this.records.get(idempotencyKey)
    if (!record) return
    this.records.set(idempotencyKey, {
      ...record,
      status: 'queued_for_retry',
      reviewReason: record.reviewReason ?? 'downstream_failed',
      attempts: record.attempts + 1,
      lastError: error,
    })
  }

  async listRetryable() {
    return [...this.records.values()].filter((record) => record.status === 'queued_for_retry')
  }

  async deleteIsolatedPreviewSubmissions() {
    let deleted = 0
    for (const [key, record] of this.records) {
      if (record.projectId !== PREVIEW_FIXTURE_PROJECT_ID) continue
      this.records.delete(key)
      deleted += 1
    }
    return deleted
  }

  snapshot() {
    return [...this.records.values()]
  }
}

export class SanityOnboardingRepository implements OnboardingRepository {
  constructor(private readonly client: SanityRepositoryClient) {}

  async recordOnce(record: OnboardingRecord) {
    const nonce = randomUUID()
    const document = await this.client.createIfNotExists({
      _id: onboardingSubmissionDocumentId(record.idempotencyKey),
      _type: 'onboardingSubmission',
      ...record,
      nonce,
    })

    if (document.nonce === nonce) return {created: true as const}
    return {created: false as const, existing: document}
  }

  async markSyncSucceeded(idempotencyKey: string) {
    const id = onboardingSubmissionDocumentId(idempotencyKey)
    const record = await this.client.fetch<StoredOnboardingDocument | null>('*[_id == $id][0]', {
      id,
    })
    if (!record) return

    await this.client
      .patch(id)
      .set({
        status: record.reviewReason ? 'needs_review' : 'received_for_review',
        lastSyncedAt: new Date().toISOString(),
      })
      .unset(['lastError'])
      .commit()
  }

  async markSyncFailed(idempotencyKey: string, error: string) {
    await this.client
      .patch(onboardingSubmissionDocumentId(idempotencyKey))
      .inc({attempts: 1})
      .set({
        status: 'queued_for_retry',
        reviewReason: 'downstream_failed',
        lastError: error,
        lastFailedAt: new Date().toISOString(),
      })
      .commit()
  }

  async listRetryable() {
    return this.client.fetch<OnboardingRecord[]>(
      '*[_type == "onboardingSubmission" && status == "queued_for_retry"] | order(receivedAt asc)',
    )
  }

  async deleteIsolatedPreviewSubmissions(): Promise<number> {
    throw new Error('Isolated preview cleanup is not available for the Sanity store')
  }
}
