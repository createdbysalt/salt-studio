export type OnboardingFormMapping = {
  itemKey: string
  formId: string
  title?: string | null
}

export type OnboardingProjectMapping = {
  projectId: string
  portalSlug?: string | null
  clientRef?: string | null
  name?: string | null
  enabled?: boolean | null
  forms: OnboardingFormMapping[]
  driveFolders?: {
    shared?: string | null
    branding?: string | null
    media?: string | null
  }
  internalTaskSystem?: 'notion' | 'linear' | 'none'
}

export type NormalizedTallySubmission = {
  provider: 'tally'
  submissionId: string | null
  formId: string | null
  projectId: string | null
  itemKey: string | null
  routeToken: string | null
  receivedAt: string
}

export type OnboardingReviewReason =
  | 'missing_submission_id'
  | 'missing_form_id'
  | 'missing_routing'
  | 'invalid_routing'
  | 'unknown_project'
  | 'disabled_project'
  | 'unknown_form'
  | 'mismatched_form'
  | 'downstream_failed'

export type OnboardingRecordStatus =
  | 'received_for_review'
  | 'needs_review'
  | 'duplicate'
  | 'queued_for_retry'

export type OnboardingRecord = {
  idempotencyKey: string
  provider: 'tally'
  projectId: string | null
  formId: string | null
  itemKey: string | null
  submissionId: string | null
  status: Exclude<OnboardingRecordStatus, 'duplicate'>
  reviewReason?: OnboardingReviewReason
  receivedAt: string
  attempts: number
  lastError?: string
}

export type OnboardingProcessResult = {
  status: OnboardingRecordStatus
  httpStatus: 200 | 202 | 503
  record: OnboardingRecord
  duplicateOf?: string
}

export type OnboardingRepository = {
  recordOnce: (
    record: OnboardingRecord,
  ) => Promise<{created: true} | {created: false; existing: OnboardingRecord}>
  markSyncSucceeded: (idempotencyKey: string) => Promise<void>
  markSyncFailed: (idempotencyKey: string, error: string) => Promise<void>
  listRetryable: () => Promise<OnboardingRecord[]>
}

export type OnboardingReviewSink = {
  enqueue: (record: OnboardingRecord) => Promise<void>
}
