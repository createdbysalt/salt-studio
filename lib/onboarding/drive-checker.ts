import {classifyDriveArrival, type DriveArrivalResult} from '@/lib/onboarding/drive'
import type {OnboardingProjectMapping} from '@/lib/onboarding/types'

type GoogleDriveFileMetadata = {
  id?: string
  name?: string
  parents?: string[]
  appProperties?: Record<string, string | undefined>
  trashed?: boolean
}

export class GoogleDriveMetadataChecker {
  constructor(
    private readonly config: {
      accessToken: string
      routingSecret: string
      fetchImpl?: typeof fetch
    },
  ) {}

  private get fetchImpl() {
    return this.config.fetchImpl ?? fetch
  }

  async checkFile({
    fileId,
    project,
  }: {
    fileId: string
    project: OnboardingProjectMapping
  }): Promise<DriveArrivalResult> {
    const params = new URLSearchParams({
      fields: 'id,name,parents,appProperties,trashed',
      supportsAllDrives: 'true',
    })
    const response = await this.fetchImpl(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?${params}`,
      {
        headers: {Authorization: `Bearer ${this.config.accessToken}`},
      },
    )

    if (!response.ok) {
      return {status: 'needs_review', reason: 'unknown_folder'}
    }

    const metadata = (await response.json()) as GoogleDriveFileMetadata
    if (!metadata.id || metadata.trashed) {
      return {status: 'needs_review', reason: 'missing_file_id'}
    }

    const folders = metadata.parents ?? []
    for (const folderId of folders) {
      const result = classifyDriveArrival({
        signal: {
          fileId: metadata.id,
          folderId,
          name: metadata.name,
          appProperties: metadata.appProperties,
        },
        project,
        routingSecret: this.config.routingSecret,
      })
      if (result.status === 'candidate_evidence') return result
    }

    return {status: 'needs_review', reason: 'unknown_folder'}
  }
}
