import {validateOnboardingRouteToken} from '@/lib/onboarding/routing'
import type {OnboardingProjectMapping, OnboardingReviewReason} from '@/lib/onboarding/types'

export type DriveArrivalSignal = {
  fileId: string
  folderId: string
  name?: string | null
  appProperties?: Record<string, string | undefined>
}

export type DriveArrivalResult =
  | {
      status: 'candidate_evidence'
      folderRole: 'shared' | 'branding' | 'media'
      projectId: string
      note: 'file_arrived_in_known_project_folder'
    }
  | {
      status: 'needs_review'
      reason: OnboardingReviewReason | 'unknown_folder' | 'missing_file_id'
    }

function folderRoleForSignal(signal: DriveArrivalSignal, project: OnboardingProjectMapping) {
  const folders = project.driveFolders
  if (!folders) return null
  if (signal.folderId === folders.shared) return 'shared'
  if (signal.folderId === folders.branding) return 'branding'
  if (signal.folderId === folders.media) return 'media'
  return null
}

export function classifyDriveArrival({
  signal,
  project,
  routingSecret,
}: {
  signal: DriveArrivalSignal
  project: OnboardingProjectMapping
  routingSecret: string
}): DriveArrivalResult {
  if (!signal.fileId) return {status: 'needs_review', reason: 'missing_file_id'}

  const role = folderRoleForSignal(signal, project)
  if (!role) return {status: 'needs_review', reason: 'unknown_folder'}

  const token = signal.appProperties?.salt_route
  if (token) {
    const route = validateOnboardingRouteToken({
      token,
      secret: routingSecret,
      projectId: project.projectId,
      formId: signal.appProperties?.form_id,
      itemKey: signal.appProperties?.item_key,
    })
    if (!route.ok) return {status: 'needs_review', reason: 'invalid_routing'}
  }

  return {
    status: 'candidate_evidence',
    folderRole: role,
    projectId: project.projectId,
    note: 'file_arrived_in_known_project_folder',
  }
}
