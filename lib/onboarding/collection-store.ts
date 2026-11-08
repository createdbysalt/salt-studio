import {
  collectionStatusDocumentId,
  isRepeatableFormKey,
  type CollectionStatus,
} from '@/lib/onboarding/collection-status'
import {apiVersion, projectId} from '@/sanity/lib/api'
import {writeToken} from '@/sanity/lib/write-token'
import {createClient} from 'next-sanity'

function privateDataset() {
  return process.env.ONBOARDING_PRIVATE_SANITY_DATASET ?? null
}

function privateWriteClient() {
  const dataset = privateDataset()
  if (!dataset || !writeToken) return null
  return createClient({
    projectId,
    dataset,
    apiVersion,
    token: writeToken,
    useCdn: false,
  })
}

async function setSupabaseCollectionComplete({
  projectId: targetProjectId,
  itemKey,
  actor,
  complete,
  at,
}: {
  projectId: string
  itemKey: string
  actor: string
  complete: boolean
  at: string
}) {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return null

  const body = complete
    ? {
        project_id: targetProjectId,
        item_key: itemKey,
        collection_complete: true,
        confirmed_at: at,
        confirmed_by: actor,
      }
    : {
        project_id: targetProjectId,
        item_key: itemKey,
        collection_complete: false,
        reopened_at: at,
        reopened_by: actor,
      }

  const response = await fetch(
    `${url.replace(/\/$/, '')}/rest/v1/onboarding_collection_status?on_conflict=project_id,item_key`,
    {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(body),
    },
  )
  if (!response.ok) throw new Error(`Supabase collection status failed with ${response.status}`)
  const rows = (await response.json()) as Array<{
    project_id: string
    item_key: string
    collection_complete: boolean
    confirmed_at?: string | null
    confirmed_by?: string | null
    reopened_at?: string | null
    reopened_by?: string | null
  }>
  const row = rows[0]
  if (!row) throw new Error('Supabase collection status returned no row')
  return {
    projectId: row.project_id,
    itemKey: row.item_key,
    collectionComplete: row.collection_complete,
    confirmedAt: row.confirmed_at,
    confirmedBy: row.confirmed_by,
    reopenedAt: row.reopened_at,
    reopenedBy: row.reopened_by,
  }
}

export async function setCollectionComplete({
  projectId: targetProjectId,
  itemKey,
  actor,
  complete,
  at = new Date().toISOString(),
}: {
  projectId: string
  itemKey: string
  actor: string
  complete: boolean
  at?: string
}): Promise<{ok: true; status: CollectionStatus} | {ok: false; error: string}> {
  if (!isRepeatableFormKey(itemKey)) {
    return {ok: false, error: 'Only repeatable forms can be collection-complete.'}
  }

  if (process.env.ONBOARDING_AUTOMATION_STORE === 'supabase') {
    try {
      const status = await setSupabaseCollectionComplete({
        projectId: targetProjectId,
        itemKey,
        actor,
        complete,
        at,
      })
      if (status) return {ok: true, status}
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Could not update collection status.',
      }
    }
  }

  const client = privateWriteClient()
  if (!client) return {ok: false, error: 'Private onboarding storage is not configured.'}

  const id = collectionStatusDocumentId(targetProjectId, itemKey)
  const base = {
    _id: id,
    _type: 'onboardingCollectionStatus',
    projectId: targetProjectId,
    itemKey,
    collectionComplete: false,
  }

  await client.createIfNotExists(base)
  const patch = complete
    ? {
        collectionComplete: true,
        confirmedAt: at,
        confirmedBy: actor,
      }
    : {
        collectionComplete: false,
        reopenedAt: at,
        reopenedBy: actor,
      }

  const status = await client.patch(id).set(patch).commit<CollectionStatus>()
  return {ok: true, status}
}
