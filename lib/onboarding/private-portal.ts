import {summarizeFormSubmissions, type CollectionStatus} from '@/lib/onboarding/collection-status'
import {supabaseConfig, supabaseRequest} from '@/lib/onboarding/supabase'
import type {OnboardingRecord, PrivatePortalOverlay} from '@/lib/onboarding/types'
import {createClient} from 'next-sanity'

function privateDataset() {
  return process.env.ONBOARDING_PRIVATE_SANITY_DATASET ?? null
}

export function isSupabasePrivateMetadataEnabled() {
  return process.env.ONBOARDING_PRIVATE_METADATA_STORE === 'supabase'
}

export async function getSupabasePortalCredentials(portalId: string) {
  if (!isSupabasePrivateMetadataEnabled()) return null
  const rows = await supabaseRequest<
    Array<{
      password_hash: string
      password_salt: string
      password_iterations: number
    }>
  >(
    `/rest/v1/portal_private_metadata?portal_id=eq.${encodeURIComponent(
      portalId,
    )}&select=password_hash,password_salt,password_iterations&limit=1`,
  )
  const row = rows[0]
  if (!row) return null
  return {
    hash: row.password_hash,
    salt: row.password_salt,
    iterations: row.password_iterations,
  }
}

async function getSupabasePrivatePortalOverlay(
  portalId: string,
): Promise<PrivatePortalOverlay | null> {
  if (!supabaseConfig()) return null
  const [metadataRows, submissionRows, statusRows] = await Promise.all([
    supabaseRequest<
      Array<{
        shared_folder_url: string | null
        branding_folder_url: string | null
        media_folder_url: string | null
        preview_url: string | null
        production_url: string | null
        whatsapp_group_url: string | null
        checklist: unknown[] | null
      }>
    >(
      `/rest/v1/portal_private_metadata?portal_id=eq.${encodeURIComponent(
        portalId,
      )}&select=shared_folder_url,branding_folder_url,media_folder_url,preview_url,production_url,whatsapp_group_url,checklist&limit=1`,
    ),
    supabaseRequest<
      Array<{
        idempotency_key: string
        provider: 'tally'
        project_id: string | null
        form_id: string | null
        item_key: string | null
        submission_id: string | null
        entry_title: string | null
        status: 'received_for_review' | 'needs_review' | 'queued_for_retry'
        review_reason: string | null
        received_at: string
        attempts: number
        last_error: string | null
      }>
    >(
      `/rest/v1/onboarding_submissions?project_id=eq.${encodeURIComponent(
        portalId,
      )}&select=idempotency_key,provider,project_id,form_id,item_key,submission_id,entry_title,status,review_reason,received_at,attempts,last_error&order=received_at.asc`,
    ),
    supabaseRequest<
      Array<{
        project_id: string
        item_key: string
        collection_complete: boolean
        confirmed_at: string | null
        confirmed_by: string | null
        reopened_at: string | null
        reopened_by: string | null
      }>
    >(
      `/rest/v1/onboarding_collection_status?project_id=eq.${encodeURIComponent(
        portalId,
      )}&select=project_id,item_key,collection_complete,confirmed_at,confirmed_by,reopened_at,reopened_by`,
    ),
  ])

  const metadata = metadataRows[0]
  if (!metadata) return null

  const records: OnboardingRecord[] = submissionRows.map((row) => ({
    idempotencyKey: row.idempotency_key,
    provider: row.provider,
    projectId: row.project_id,
    formId: row.form_id,
    itemKey: row.item_key,
    submissionId: row.submission_id,
    entryTitle: row.entry_title,
    status: row.status,
    reviewReason: (row.review_reason ?? undefined) as OnboardingRecord['reviewReason'],
    receivedAt: row.received_at,
    attempts: row.attempts,
    lastError: row.last_error ?? undefined,
  }))
  const statuses = new Map<string, CollectionStatus>(
    statusRows.map((row) => [
      row.item_key,
      {
        projectId: row.project_id,
        itemKey: row.item_key,
        collectionComplete: row.collection_complete,
        confirmedAt: row.confirmed_at,
        confirmedBy: row.confirmed_by,
        reopenedAt: row.reopened_at,
        reopenedBy: row.reopened_by,
      },
    ]),
  )
  const formSubmissionSummary = Object.fromEntries(
    [...new Set(records.map((record) => record.itemKey).filter(Boolean))].map((itemKey) => {
      const summary = summarizeFormSubmissions({
        projectId: portalId,
        itemKey: itemKey as string,
        records,
        status: statuses.get(itemKey as string),
      })
      return [
        itemKey,
        {
          count: summary.submissionCount,
          latestReceivedAt: summary.entries.at(-1)?.receivedAt ?? null,
          collectionComplete: summary.collectionComplete,
          completedAt: summary.confirmedAt,
          reopenedAt: summary.reopenedAt,
          entries: summary.entries,
        },
      ]
    }),
  )

  return {
    sharedFolderUrl: metadata.shared_folder_url,
    brandingFolderUrl: metadata.branding_folder_url,
    mediaFolderUrl: metadata.media_folder_url,
    previewUrl: metadata.preview_url,
    productionUrl: metadata.production_url,
    whatsappGroupUrl: metadata.whatsapp_group_url,
    checklist: metadata.checklist,
    formSubmissionSummary,
  }
}

export async function getPrivatePortalOverlay(
  portalId: string,
): Promise<PrivatePortalOverlay | null> {
  if (isSupabasePrivateMetadataEnabled()) return getSupabasePrivatePortalOverlay(portalId)

  const dataset = privateDataset()
  if (!dataset) return null
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-27'
  const token = process.env.SANITY_API_READ_TOKEN
  if (!projectId || !token) return null

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  })

  return client.fetch<PrivatePortalOverlay | null>(
    `*[_type == "clientPortalPrivate" && portalId == $portalId][0]{
      sharedFolderUrl,
      brandingFolderUrl,
      mediaFolderUrl,
      previewUrl,
      productionUrl,
      whatsappGroupUrl,
      checklist
    }`,
    {portalId},
  )
}
