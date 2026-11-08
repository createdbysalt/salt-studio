import type {OnboardingRecord, OnboardingRepository} from '@/lib/onboarding/types'

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

  snapshot() {
    return [...this.records.values()]
  }
}
