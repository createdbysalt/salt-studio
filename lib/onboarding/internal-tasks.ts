import type {OnboardingProjectMapping, OnboardingRecord} from '@/lib/onboarding/types'

export type InternalTaskPlan =
  | {
      system: 'notion'
      dedupeKey: string
      title: string
      reason: string
    }
  | {system: 'none'; reason: string}

function shouldCreateInternalTask(record: OnboardingRecord) {
  return record.status === 'needs_review' || record.status === 'queued_for_retry'
}

export function planInternalTaskSync({
  project,
  record,
}: {
  project: OnboardingProjectMapping
  record: OnboardingRecord
}): InternalTaskPlan {
  if (project.internalTaskSystem === 'linear' || project.portalSlug === 'simcoe-house') {
    return {system: 'none', reason: 'project_owned_elsewhere'}
  }

  if (project.isolation === 'preview-fixture') {
    return {system: 'none', reason: 'preview_fixture'}
  }

  if (project.internalTaskSystem === 'none' || !shouldCreateInternalTask(record)) {
    return {system: 'none', reason: 'no_internal_blocker'}
  }

  const reason = record.reviewReason ?? 'downstream_failed'
  return {
    system: 'notion',
    dedupeKey: `onboarding:${project.projectId}:${record.idempotencyKey}:${reason}`,
    title: `Review onboarding submission: ${project.name ?? project.projectId}`,
    reason,
  }
}
