#!/usr/bin/env node
import {
  assertPreviewSupabaseTarget,
  assertRedactedOutput,
  buildPrivateMetadataRow,
  planPrivatePortalCopies,
  PREVIEW_SUPABASE_PROJECT_REF,
  PRIVATE_PORTAL_DRY_RUN_PROJECTION,
  PRIVATE_PORTAL_WRITE_PROJECTION,
  redactMigrationReport,
  type PrivatePortalSource,
} from '@/lib/onboarding/privacy-migration'
import {createClient} from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-27'
const token = process.env.SANITY_API_READ_TOKEN || undefined
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const writeRequested = process.argv.includes('--write')
const writeConfirmed = process.env.CONFIRM_PRIVATE_PORTAL_WRITE === 'true'

if (!projectId || !dataset) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET')
  process.exit(1)
}

if (writeRequested && !token) {
  console.error(
    'Write requires SANITY_API_READ_TOKEN. Dry-run can omit it and read the public dataset.',
  )
  process.exit(1)
}

if (writeRequested && (!writeConfirmed || !supabaseUrl || !supabaseServiceRoleKey)) {
  console.error(
    'Write requires CONFIRM_PRIVATE_PORTAL_WRITE=true, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY',
  )
  process.exit(1)
}

if (writeRequested && supabaseUrl) {
  try {
    assertPreviewSupabaseTarget(supabaseUrl)
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Refusing private portal write')
    process.exit(1)
  }
}

const sanityProjectId: string = projectId
const sanityDataset: string = dataset

async function main() {
  const client = createClient({
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion,
    token,
    useCdn: false,
  })

  const projection = writeRequested
    ? PRIVATE_PORTAL_WRITE_PROJECTION
    : PRIVATE_PORTAL_DRY_RUN_PROJECTION
  const portals = (await client.fetch(
    `*[_type == "clientPortal"] | order(_createdAt asc)${projection}`,
  )) as PrivatePortalSource[]

  const plan = planPrivatePortalCopies(portals)
  const report = redactMigrationReport({
    mode: writeRequested ? 'write-private-copy' : 'dry-run',
    readMode: token ? 'read-token' : 'public-dataset',
    projectId: sanityProjectId,
    sourceDataset: sanityDataset,
    portalCount: plan.length,
    plan,
    cutoverGuardrails: [
      'Copy values server-side; this script never prints passwords, Drive links, checklist contents, or private URLs.',
      'Write mode copies every private field it lists for a later unset, including checklist. Password is stored only as a PBKDF2 hash.',
      'This script does not patch, unset, or delete Sanity documents. Unset stays a separate approved step.',
      `Writes are limited to the preview Supabase project ${PREVIEW_SUPABASE_PROJECT_REF}.`,
      'Apply the checklist column migration before the first write.',
      'Verify /project/[slug] reads private overlays before unsetting public fields.',
      'Rotate shared portal passwords only after the private read path is active.',
      'Rollback before public cleanup: unset ONBOARDING_PRIVATE_METADATA_STORE or set it away from supabase.',
      'Rollback after public cleanup: restore public fields from the approved secure backup, then unset ONBOARDING_PRIVATE_METADATA_STORE.',
    ],
  })
  const output = JSON.stringify(report, null, 2)
  assertRedactedOutput(output, portals)

  if (writeRequested && supabaseUrl && supabaseServiceRoleKey) {
    const rows = portals.map((portal) => buildPrivateMetadataRow(portal).row)
    for (const row of rows) {
      const response = await fetch(
        `${supabaseUrl.replace(/\/$/, '')}/rest/v1/portal_private_metadata?on_conflict=portal_id`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceRoleKey,
            'Authorization': `Bearer ${supabaseServiceRoleKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates,return=minimal',
          },
          body: JSON.stringify(row),
        },
      )
      if (!response.ok) throw new Error(`Supabase upsert failed with ${response.status}`)
    }
  }

  console.log(output)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : ''
  const safe =
    message.startsWith('Missing ') ||
    message.startsWith('Write requires') ||
    message.startsWith('Private ') ||
    message.startsWith('Portal ') ||
    message.startsWith('Refusing ') ||
    message.startsWith('SUPABASE_URL') ||
    message.startsWith('No Supabase') ||
    message.startsWith('Supabase upsert failed')
  console.error(safe ? message : 'Privacy migration plan failed')
  process.exit(1)
})
