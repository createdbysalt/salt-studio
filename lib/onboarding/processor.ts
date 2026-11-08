import {createHash} from 'node:crypto'
import {validateOnboardingRouteToken} from '@/lib/onboarding/routing'
import {normalizeTallyWebhookPayload} from '@/lib/onboarding/tally-payload'
import type {
  NormalizedTallySubmission,
  OnboardingProcessResult,
  OnboardingProjectMapping,
  OnboardingRecord,
  OnboardingRepository,
  OnboardingReviewReason,
  OnboardingReviewSink,
} from '@/lib/onboarding/types'

export type OnboardingProjectLookup = (
  projectId: string,
) => Promise<OnboardingProjectMapping | null>

function payloadDigest(rawBody: string) {
  return createHash('sha256').update(rawBody).digest('hex').slice(0, 24)
}

function idempotencyKey(submission: NormalizedTallySubmission, rawBody: string) {
  if (submission.submissionId) return `tally:${submission.submissionId}`
  return `tally:missing-submission:${payloadDigest(rawBody)}`
}

function reviewRecord(
  submission: NormalizedTallySubmission,
  rawBody: string,
  reason: OnboardingReviewReason,
): OnboardingRecord {
  return {
    idempotencyKey: idempotencyKey(submission, rawBody),
    provider: 'tally',
    projectId: submission.projectId,
    formId: submission.formId,
    itemKey: submission.itemKey,
    submissionId: submission.submissionId,
    status: 'needs_review',
    reviewReason: reason,
    receivedAt: submission.receivedAt,
    attempts: 0,
  }
}

async function classifySubmission({
  rawBody,
  submission,
  routingSecret,
  getProject,
}: {
  rawBody: string
  submission: NormalizedTallySubmission
  routingSecret: string
  getProject: OnboardingProjectLookup
}): Promise<OnboardingRecord> {
  if (!submission.submissionId) return reviewRecord(submission, rawBody, 'missing_submission_id')
  if (!submission.formId) return reviewRecord(submission, rawBody, 'missing_form_id')
  if (!submission.projectId || !submission.routeToken) {
    return reviewRecord(submission, rawBody, 'missing_routing')
  }

  const route = validateOnboardingRouteToken({
    token: submission.routeToken,
    secret: routingSecret,
    projectId: submission.projectId,
    formId: submission.formId,
    itemKey: submission.itemKey,
  })

  if (!route.ok) return reviewRecord(submission, rawBody, 'invalid_routing')

  const project = await getProject(route.payload.projectId)
  if (!project) return reviewRecord(submission, rawBody, 'unknown_project')
  if (project.enabled === false) return reviewRecord(submission, rawBody, 'disabled_project')

  const byItem = project.forms.find((form) => form.itemKey === route.payload.itemKey)
  if (!byItem) return reviewRecord(submission, rawBody, 'unknown_form')
  if (byItem.formId !== route.payload.formId || byItem.formId !== submission.formId) {
    return reviewRecord(submission, rawBody, 'mismatched_form')
  }

  return {
    idempotencyKey: idempotencyKey(submission, rawBody),
    provider: 'tally',
    projectId: project.projectId,
    formId: submission.formId,
    itemKey: route.payload.itemKey,
    submissionId: submission.submissionId,
    status: 'received_for_review',
    receivedAt: submission.receivedAt,
    attempts: 0,
  }
}

export async function processTallyWebhook({
  rawBody,
  payload,
  routingSecret,
  repository,
  getProject,
  reviewSink,
  receivedAt,
}: {
  rawBody: string
  payload: unknown
  routingSecret: string
  repository: OnboardingRepository
  getProject: OnboardingProjectLookup
  reviewSink?: OnboardingReviewSink
  receivedAt?: string
}): Promise<OnboardingProcessResult> {
  const submission = normalizeTallyWebhookPayload(payload, receivedAt)
  const record = await classifySubmission({rawBody, submission, routingSecret, getProject})
  const stored = await repository.recordOnce(record)

  if (!stored.created) {
    return {
      status: 'duplicate',
      httpStatus: 200,
      record: stored.existing,
      duplicateOf: stored.existing.idempotencyKey,
    }
  }

  try {
    await reviewSink?.enqueue(record)
    await repository.markSyncSucceeded(record.idempotencyKey)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown downstream error'
    await repository.markSyncFailed(record.idempotencyKey, message)
    return {
      status: 'queued_for_retry',
      httpStatus: 202,
      record: {...record, status: 'queued_for_retry', lastError: message, attempts: 1},
    }
  }

  return {status: record.status, httpStatus: 202, record}
}

export async function retryFailedOnboardingSyncs({
  repository,
  reviewSink,
}: {
  repository: OnboardingRepository
  reviewSink: OnboardingReviewSink
}) {
  const retryable = await repository.listRetryable()
  const results: Array<
    {idempotencyKey: string; ok: true} | {idempotencyKey: string; ok: false; error: string}
  > = []

  for (const record of retryable) {
    try {
      await reviewSink.enqueue(record)
      await repository.markSyncSucceeded(record.idempotencyKey)
      results.push({idempotencyKey: record.idempotencyKey, ok: true})
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown downstream error'
      await repository.markSyncFailed(record.idempotencyKey, message)
      results.push({idempotencyKey: record.idempotencyKey, ok: false, error: message})
    }
  }

  return results
}
