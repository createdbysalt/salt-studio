import {hashPortalPassword} from '@/lib/onboarding/portal-crypto'

/** Preview Supabase project only. Writes refuse any other host. */
export const PREVIEW_SUPABASE_PROJECT_REF = 'jnznsgkkteuuqwtscaxz'

/**
 * Sanity `clientPortal` fields that write mode copies, and that a later
 * approved step may unset. Password is stored only as a hash.
 */
export const PRIVATE_PORTAL_FIELDS = [
  'password',
  'sharedFolderUrl',
  'brandingFolderUrl',
  'mediaFolderUrl',
  'previewUrl',
  'productionUrl',
  'whatsappGroupUrl',
  'checklist',
] as const

export type PrivatePortalField = (typeof PRIVATE_PORTAL_FIELDS)[number]

/** Supabase columns written for each private field. Copy columns must cover every field that can be unset. */
export const PRIVATE_FIELD_COPY_COLUMNS = {
  password: ['password_hash', 'password_salt', 'password_iterations'],
  sharedFolderUrl: ['shared_folder_url'],
  brandingFolderUrl: ['branding_folder_url'],
  mediaFolderUrl: ['media_folder_url'],
  previewUrl: ['preview_url'],
  productionUrl: ['production_url'],
  whatsappGroupUrl: ['whatsapp_group_url'],
  checklist: ['checklist'],
} as const satisfies Record<PrivatePortalField, readonly string[]>

export const PUBLIC_PORTAL_FIELDS_TO_KEEP = [
  'name',
  'slug',
  'client',
  'clientType',
  'serviceType',
  'projectPhases',
  'checklistTemplate',
  'formsTemplate',
  'activePhase',
  'contentDue',
  'launchEstimate',
  'enabled',
] as const

const DRY_RUN_FIELD_PROJECTION = PRIVATE_PORTAL_FIELDS.map(
  (field) => `defined(${field}) => {"${field}": true}`,
).join(',\n  ')

const WRITE_FIELD_PROJECTION = PRIVATE_PORTAL_FIELDS.join(',\n  ')

/** Presence flags only. Safe to print. */
export const PRIVATE_PORTAL_DRY_RUN_PROJECTION = `{
  _id,
  "slug": slug.current,
  ${DRY_RUN_FIELD_PROJECTION}
}`

/** Values needed to copy. Never print a document fetched with this projection. */
export const PRIVATE_PORTAL_WRITE_PROJECTION = `{
  _id,
  "slug": slug.current,
  ${WRITE_FIELD_PROJECTION}
}`

export type PrivatePortalSource = {
  _id: string
  slug?: string | null
  password?: unknown
  sharedFolderUrl?: unknown
  brandingFolderUrl?: unknown
  mediaFolderUrl?: unknown
  previewUrl?: unknown
  productionUrl?: unknown
  whatsappGroupUrl?: unknown
  checklist?: unknown
}

export type PrivateMetadataRow = {
  portal_id: string
  password_hash: string
  password_salt: string
  password_iterations: number
  shared_folder_url: string | null
  branding_folder_url: string | null
  media_folder_url: string | null
  preview_url: string | null
  production_url: string | null
  whatsapp_group_url: string | null
  checklist: unknown[] | null
}

export type RedactedPortalPlan = {
  sourceDocumentId: string
  slug: string | null
  targetStore: 'supabase.portal_private_metadata'
  targetKey: string
  privateFieldsPresent: Record<PrivatePortalField, boolean>
  copiedFields: PrivatePortalField[]
  supabaseColumnsCopied: string[]
  publicFieldsToKeep: readonly string[]
  publicFieldsToUnsetAfterPrivateCopy: PrivatePortalField[]
  performsSanityUnset: false
}

export function privateFieldsPresent(portal: PrivatePortalSource) {
  return Object.fromEntries(
    PRIVATE_PORTAL_FIELDS.map((field) => [field, Boolean(portal[field])]),
  ) as Record<PrivatePortalField, boolean>
}

export function fieldsPlannedForUnset(portal: PrivatePortalSource) {
  const present = privateFieldsPresent(portal)
  return PRIVATE_PORTAL_FIELDS.filter((field) => present[field])
}

/** Throws when a later unset would drop a field the copy does not cover. */
export function assertCopyCoversUnset(
  copiedFields: readonly string[],
  unsetFields: readonly string[],
) {
  const copied = new Set(copiedFields)
  const missing = unsetFields.filter((field) => !copied.has(field))
  if (missing.length > 0) {
    throw new Error(`Private copy is missing fields planned for later unset: ${missing.join(', ')}`)
  }
}

export function supabaseColumnsForFields(fields: readonly PrivatePortalField[]) {
  return fields.flatMap((field) => [...PRIVATE_FIELD_COPY_COLUMNS[field]])
}

export function copiedFieldsForPlannedUnset(unsetFields: readonly PrivatePortalField[]) {
  const copied: PrivatePortalField[] = []
  for (const field of unsetFields) {
    if (!PRIVATE_FIELD_COPY_COLUMNS[field]?.length) {
      throw new Error(`No Supabase column for private field planned for unset: ${field}`)
    }
    copied.push(field)
  }
  assertCopyCoversUnset(copied, unsetFields)
  return copied
}

function copyString(portalId: string, field: PrivatePortalField, value: unknown) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(
      `Portal ${portalId} field ${field} cannot be copied; refusing partial private write`,
    )
  }
  return value
}

export function planPrivatePortalCopies(portals: PrivatePortalSource[]): RedactedPortalPlan[] {
  return portals.map((portal) => {
    const unsetFields = fieldsPlannedForUnset(portal)
    const copiedFields = copiedFieldsForPlannedUnset(unsetFields)
    return {
      sourceDocumentId: portal._id,
      slug: portal.slug ?? null,
      targetStore: 'supabase.portal_private_metadata',
      targetKey: portal._id,
      privateFieldsPresent: privateFieldsPresent(portal),
      copiedFields,
      supabaseColumnsCopied: supabaseColumnsForFields(copiedFields),
      publicFieldsToKeep: PUBLIC_PORTAL_FIELDS_TO_KEEP,
      publicFieldsToUnsetAfterPrivateCopy: unsetFields,
      performsSanityUnset: false,
    }
  })
}

export function buildPrivateMetadataRow(portal: PrivatePortalSource) {
  const unsetFields = fieldsPlannedForUnset(portal)
  const copiedFields = copiedFieldsForPlannedUnset(unsetFields)
  if (!copiedFields.includes('password')) {
    throw new Error(`Portal ${portal._id} is missing a password; refusing partial private write`)
  }

  const password = copyString(portal._id, 'password', portal.password)
  const hashed = hashPortalPassword(password)
  const row: PrivateMetadataRow = {
    portal_id: portal._id,
    password_hash: hashed.hash,
    password_salt: hashed.salt,
    password_iterations: hashed.iterations,
    shared_folder_url: null,
    branding_folder_url: null,
    media_folder_url: null,
    preview_url: null,
    production_url: null,
    whatsapp_group_url: null,
    checklist: null,
  }

  if (copiedFields.includes('sharedFolderUrl')) {
    row.shared_folder_url = copyString(portal._id, 'sharedFolderUrl', portal.sharedFolderUrl)
  }
  if (copiedFields.includes('brandingFolderUrl')) {
    row.branding_folder_url = copyString(portal._id, 'brandingFolderUrl', portal.brandingFolderUrl)
  }
  if (copiedFields.includes('mediaFolderUrl')) {
    row.media_folder_url = copyString(portal._id, 'mediaFolderUrl', portal.mediaFolderUrl)
  }
  if (copiedFields.includes('previewUrl')) {
    row.preview_url = copyString(portal._id, 'previewUrl', portal.previewUrl)
  }
  if (copiedFields.includes('productionUrl')) {
    row.production_url = copyString(portal._id, 'productionUrl', portal.productionUrl)
  }
  if (copiedFields.includes('whatsappGroupUrl')) {
    row.whatsapp_group_url = copyString(portal._id, 'whatsappGroupUrl', portal.whatsappGroupUrl)
  }
  if (copiedFields.includes('checklist')) {
    if (!Array.isArray(portal.checklist)) {
      throw new Error(
        `Portal ${portal._id} checklist must be copied as an array; refusing partial private write`,
      )
    }
    row.checklist = portal.checklist
  }

  const writtenColumns = new Set(Object.keys(row))
  for (const field of unsetFields) {
    for (const column of PRIVATE_FIELD_COPY_COLUMNS[field]) {
      if (!writtenColumns.has(column) || row[column as keyof PrivateMetadataRow] == null) {
        throw new Error(`Private copy row is missing ${column} for ${field}`)
      }
    }
  }
  assertCopyCoversUnset(copiedFields, unsetFields)

  return {row, copiedFields, unsetFields}
}

const PRIVATE_URL_FIELDS = [
  'sharedFolderUrl',
  'brandingFolderUrl',
  'mediaFolderUrl',
  'previewUrl',
  'productionUrl',
  'whatsappGroupUrl',
] as const satisfies readonly PrivatePortalField[]

function collectPrintedStrings(value: unknown, found: string[]) {
  if (typeof value === 'string') {
    found.push(value)
    return
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectPrintedStrings(entry, found)
    return
  }
  if (value && typeof value === 'object') {
    for (const entry of Object.values(value)) collectPrintedStrings(entry, found)
  }
}

export function assertRedactedOutput(output: string, portals: PrivatePortalSource[]) {
  const secrets = new Set<string>()
  for (const portal of portals) {
    if (typeof portal.password === 'string' && portal.password) secrets.add(portal.password)
    for (const field of PRIVATE_URL_FIELDS) {
      const value = portal[field]
      if (typeof value === 'string' && value) secrets.add(value)
    }
  }
  if (secrets.size === 0) return

  const printed: string[] = []
  collectPrintedStrings(JSON.parse(output) as unknown, printed)
  if (printed.some((value) => secrets.has(value))) {
    throw new Error('Refusing to print a private portal value')
  }
}

export function assertPreviewSupabaseTarget(supabaseUrl: string) {
  let url: URL
  try {
    url = new URL(supabaseUrl)
  } catch {
    throw new Error('SUPABASE_URL is not a valid URL')
  }
  const expectedHost = `${PREVIEW_SUPABASE_PROJECT_REF}.supabase.co`
  if (url.protocol !== 'https:' || url.hostname !== expectedHost) {
    throw new Error(
      `Private portal writes are limited to the preview Supabase project ${PREVIEW_SUPABASE_PROJECT_REF}`,
    )
  }
}

export function redactMigrationReport(report: {
  mode: 'dry-run' | 'write-private-copy'
  readMode: 'public-dataset' | 'read-token'
  projectId: string
  sourceDataset: string
  portalCount: number
  plan: RedactedPortalPlan[]
  cutoverGuardrails: string[]
}) {
  return {
    mode: report.mode,
    readMode: report.readMode,
    projectId: report.projectId,
    sourceDataset: report.sourceDataset,
    portalCount: report.portalCount,
    performsSanityUnset: false as const,
    previewSupabaseProjectRef: PREVIEW_SUPABASE_PROJECT_REF,
    plan: report.plan.map((entry) => ({
      sourceDocumentId: entry.sourceDocumentId,
      slug: entry.slug,
      targetStore: entry.targetStore,
      targetKey: entry.targetKey,
      privateFieldsPresent: Object.fromEntries(
        PRIVATE_PORTAL_FIELDS.map((field) => [field, entry.privateFieldsPresent[field] === true]),
      ),
      copiedFields: entry.copiedFields,
      supabaseColumnsCopied: entry.supabaseColumnsCopied,
      publicFieldsToKeep: entry.publicFieldsToKeep,
      publicFieldsToUnsetAfterPrivateCopy: entry.publicFieldsToUnsetAfterPrivateCopy,
      performsSanityUnset: false as const,
    })),
    cutoverGuardrails: report.cutoverGuardrails,
  }
}
