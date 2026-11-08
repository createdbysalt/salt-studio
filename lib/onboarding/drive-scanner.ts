const FOLDER_MIME = 'application/vnd.google-apps.folder'
const FOLDER_ID_PATTERN = /^[A-Za-z0-9_-]{10,80}$/
const MAX_PAGES = 10
const PAGE_SIZE = 100
const MAX_FILES = 500
const MAX_SUBFOLDERS = 25

export type DriveScanMapping = {
  itemKey: string
  folderIds: string[]
  includeSubfolders?: boolean
}

export type DriveScanRequest = {
  projectId: string
  mappings: DriveScanMapping[]
}

export type DriveScanFile = {
  fileId: string
  name: string | null
  mimeType: string | null
  modifiedTime: string | null
  parentFolderId: string
}

export type DriveScanSummary = {
  projectId: string
  countsAreGuidanceOnly: true
  autoCompletedItemKeys: []
  formatValid: null
  qualityApproved: null
  clientConfirmed: null
  items: Array<{
    itemKey: string
    folderIds: string[]
    fileCount: number
    countRole: 'guidance_only'
    autoCompleted: false
    formatValid: null
    qualityApproved: null
    clientConfirmed: null
    files: DriveScanFile[]
  }>
  unknown: Array<DriveScanFile & {category: 'unknown'}>
  ambiguous: Array<{fileId: string; itemKeys: string[]}>
  errors: Array<{folderId: string; code: 'drive_access_denied' | 'drive_error' | 'truncated'}>
  stoppedReason: 'rate_limited' | null
  truncated: boolean
}

type ListedFile = {
  id?: string
  name?: string
  mimeType?: string
  parents?: string[]
  trashed?: boolean
  modifiedTime?: string
}

type ListResult = {
  files: ListedFile[]
  error?: DriveScanSummary['errors'][number]['code']
  rateLimited?: boolean
  truncated?: boolean
}

function unique(values: string[]) {
  return [...new Set(values)]
}

export function parseDriveScanRequest(
  input: unknown,
): {ok: true; value: DriveScanRequest} | {ok: false; error: string} {
  if (!input || typeof input !== 'object') return {ok: false, error: 'invalid_scan_request'}
  const body = input as {projectId?: unknown; mappings?: unknown}
  if (typeof body.projectId !== 'string' || body.projectId.trim() === '') {
    return {ok: false, error: 'invalid_project'}
  }
  if (!Array.isArray(body.mappings) || body.mappings.length === 0 || body.mappings.length > 30) {
    return {ok: false, error: 'invalid_mappings'}
  }

  const mappings: DriveScanMapping[] = []
  const folderOwners = new Map<string, string>()
  for (const entry of body.mappings) {
    if (!entry || typeof entry !== 'object') return {ok: false, error: 'invalid_mappings'}
    const mapping = entry as {itemKey?: unknown; folderIds?: unknown; includeSubfolders?: unknown}
    if (typeof mapping.itemKey !== 'string' || !/^[a-z0-9-]{2,80}$/.test(mapping.itemKey)) {
      return {ok: false, error: 'invalid_mappings'}
    }
    if (
      !Array.isArray(mapping.folderIds) ||
      mapping.folderIds.length === 0 ||
      mapping.folderIds.length > 10 ||
      mapping.folderIds.some((folderId) => typeof folderId !== 'string')
    ) {
      return {ok: false, error: 'invalid_mappings'}
    }
    const folderIds = unique(mapping.folderIds as string[])
    for (const folderId of folderIds) {
      if (!FOLDER_ID_PATTERN.test(folderId)) return {ok: false, error: 'invalid_folder'}
      const owner = folderOwners.get(folderId)
      if (owner && owner !== mapping.itemKey) return {ok: false, error: 'ambiguous_folder_mapping'}
      folderOwners.set(folderId, mapping.itemKey)
    }
    mappings.push({
      itemKey: mapping.itemKey,
      folderIds,
      includeSubfolders: mapping.includeSubfolders !== false,
    })
  }

  return {ok: true, value: {projectId: body.projectId, mappings}}
}

export class GoogleDriveFolderScanner {
  constructor(
    private readonly config: {
      accessToken: string
      fetchImpl?: typeof fetch
    },
  ) {}

  private get fetchImpl() {
    return this.config.fetchImpl ?? fetch
  }

  private async listFolder(folderId: string): Promise<ListResult> {
    const files: ListedFile[] = []
    let pageToken = ''

    for (let page = 0; page < MAX_PAGES && files.length < MAX_FILES; page += 1) {
      const params = new URLSearchParams({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'nextPageToken,files(id,name,mimeType,parents,trashed,modifiedTime)',
        pageSize: String(PAGE_SIZE),
        supportsAllDrives: 'true',
        includeItemsFromAllDrives: 'true',
      })
      if (pageToken) params.set('pageToken', pageToken)

      const response = await this.fetchImpl(`https://www.googleapis.com/drive/v3/files?${params}`, {
        headers: {Authorization: `Bearer ${this.config.accessToken}`},
      })
      if (response.status === 429) return {files, rateLimited: true}
      if (response.status === 401 || response.status === 403) {
        return {files, error: 'drive_access_denied'}
      }
      if (!response.ok) return {files, error: 'drive_error'}

      let body: {nextPageToken?: string; files?: ListedFile[]}
      try {
        body = (await response.json()) as {nextPageToken?: string; files?: ListedFile[]}
      } catch {
        return {files, error: 'drive_error'}
      }
      files.push(...(body.files ?? []).filter((file) => file.trashed !== true))
      if (!body.nextPageToken) return {files}
      if (files.length >= MAX_FILES) return {files, truncated: true}
      pageToken = body.nextPageToken
    }

    return {files, truncated: true}
  }

  async scan(request: DriveScanRequest): Promise<DriveScanSummary> {
    const explicitFolders = new Map<string, string>()
    for (const mapping of request.mappings) {
      for (const folderId of mapping.folderIds) explicitFolders.set(folderId, mapping.itemKey)
    }

    const seen = new Map<
      string,
      {
        name: string | null
        mimeType: string | null
        modifiedTime: string | null
        parentFolderId: string
        itemKeys: Set<string>
        unknownParent: string | null
      }
    >()
    const errors: DriveScanSummary['errors'] = []
    let stoppedReason: DriveScanSummary['stoppedReason'] = null
    let truncated = false
    const subfolders: Array<{folderId: string}> = []

    const absorb = (folderId: string, itemKey: string | null, files: ListedFile[]) => {
      for (const file of files) {
        if (!file.id || file.mimeType === FOLDER_MIME) continue
        const current = seen.get(file.id) ?? {
          name: file.name ?? null,
          mimeType: file.mimeType ?? null,
          modifiedTime: file.modifiedTime ?? null,
          parentFolderId: folderId,
          itemKeys: new Set<string>(),
          unknownParent: null,
        }
        if (itemKey) current.itemKeys.add(itemKey)
        else current.unknownParent = folderId
        seen.set(file.id, current)
      }
    }

    for (const [folderId, itemKey] of explicitFolders) {
      const listed = await this.listFolder(folderId)
      if (listed.truncated) {
        truncated = true
        errors.push({folderId, code: 'truncated'})
      }
      if (listed.error) errors.push({folderId, code: listed.error})
      absorb(folderId, itemKey, listed.files)
      if (listed.rateLimited) {
        stoppedReason = 'rate_limited'
        break
      }

      const mapping = request.mappings.find((entry) => entry.itemKey === itemKey)
      if (mapping?.includeSubfolders === false || listed.error) continue
      for (const file of listed.files) {
        if (file.mimeType !== FOLDER_MIME || !file.id || explicitFolders.has(file.id)) continue
        if (!FOLDER_ID_PATTERN.test(file.id) || subfolders.length >= MAX_SUBFOLDERS) continue
        subfolders.push({folderId: file.id})
      }
    }

    if (!stoppedReason) {
      for (const subfolder of subfolders) {
        const listed = await this.listFolder(subfolder.folderId)
        if (listed.truncated) {
          truncated = true
          errors.push({folderId: subfolder.folderId, code: 'truncated'})
        }
        if (listed.error) errors.push({folderId: subfolder.folderId, code: listed.error})
        absorb(subfolder.folderId, null, listed.files)
        if (listed.rateLimited) {
          stoppedReason = 'rate_limited'
          break
        }
      }
    }

    const items = request.mappings.map((mapping) => ({
      itemKey: mapping.itemKey,
      folderIds: mapping.folderIds,
      fileCount: 0,
      countRole: 'guidance_only' as const,
      autoCompleted: false as const,
      formatValid: null,
      qualityApproved: null,
      clientConfirmed: null,
      files: [] as DriveScanFile[],
    }))
    const byItem = new Map(items.map((item) => [item.itemKey, item]))
    const unknown: DriveScanSummary['unknown'] = []
    const ambiguous: DriveScanSummary['ambiguous'] = []

    for (const [fileId, file] of seen) {
      const itemKeys = [...file.itemKeys]
      if (itemKeys.length > 1) {
        ambiguous.push({fileId, itemKeys})
        continue
      }
      if (itemKeys.length === 1) {
        const item = byItem.get(itemKeys[0])
        if (!item) continue
        item.files.push({
          fileId,
          name: file.name,
          mimeType: file.mimeType,
          modifiedTime: file.modifiedTime,
          parentFolderId: file.parentFolderId,
        })
        continue
      }
      unknown.push({
        fileId,
        name: file.name,
        mimeType: file.mimeType,
        modifiedTime: file.modifiedTime,
        parentFolderId: file.unknownParent ?? file.parentFolderId,
        category: 'unknown',
      })
    }

    for (const item of items) item.fileCount = item.files.length

    return {
      projectId: request.projectId,
      countsAreGuidanceOnly: true,
      autoCompletedItemKeys: [],
      formatValid: null,
      qualityApproved: null,
      clientConfirmed: null,
      items,
      unknown,
      ambiguous,
      errors,
      stoppedReason,
      truncated,
    }
  }
}
