import {createHash} from 'node:crypto'
import type {OnboardingRecord} from '@/lib/onboarding/types'

export const REPEATABLE_FORM_KEYS = [
  'f-staff',
  'f-ministry',
  'f-crew',
  'f-small-group',
  'f-event',
  'f-course',
  'f-testimony',
  'f-faq',
] as const

export type RepeatableFormKey = (typeof REPEATABLE_FORM_KEYS)[number]

export type CollectionStatus = {
  projectId: string
  itemKey: string
  collectionComplete: boolean
  confirmedAt?: string | null
  confirmedBy?: string | null
  reopenedAt?: string | null
  reopenedBy?: string | null
}

export function isRepeatableFormKey(
  itemKey: string | null | undefined,
): itemKey is RepeatableFormKey {
  return REPEATABLE_FORM_KEYS.includes(itemKey as RepeatableFormKey)
}

export function collectionStatusDocumentId(projectId: string, itemKey: string) {
  const digest = createHash('sha256').update(`${projectId}:${itemKey}`).digest('hex')
  return `onboardingCollection.${digest}`
}

export function summarizeFormSubmissions({
  projectId,
  itemKey,
  records,
  status,
}: {
  projectId: string
  itemKey: string
  records: OnboardingRecord[]
  status?: CollectionStatus | null
}) {
  const matching = records
    .filter((record) => record.projectId === projectId && record.itemKey === itemKey)
    .sort((a, b) => a.receivedAt.localeCompare(b.receivedAt))

  const confirmedAt = status?.collectionComplete ? status.confirmedAt : null
  const lateSubmissions = confirmedAt
    ? matching.filter((record) => record.receivedAt > confirmedAt)
    : []

  return {
    projectId,
    itemKey,
    submissionCount: matching.length,
    collectionComplete: Boolean(status?.collectionComplete),
    confirmedAt,
    confirmedBy: status?.confirmedBy ?? null,
    reopenedAt: status?.reopenedAt ?? null,
    entries: matching.map((record, index) => ({
      submissionId: record.submissionId,
      receivedAt: record.receivedAt,
      label: record.entryTitle?.trim() || `Unknown submission ${index + 1}`,
      status:
        confirmedAt && record.receivedAt > confirmedAt
          ? ('received_after_confirmation' as const)
          : ('received' as const),
    })),
    lateSubmissionCount: lateSubmissions.length,
  }
}
