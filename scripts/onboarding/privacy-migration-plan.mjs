#!/usr/bin/env node
import {pbkdf2Sync, randomBytes} from 'node:crypto'
import {createClient} from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-27'
const token = process.env.SANITY_API_READ_TOKEN
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const writeRequested = process.argv.includes('--write')
const writeConfirmed = process.env.CONFIRM_PRIVATE_PORTAL_WRITE === 'true'

if (!projectId || !dataset || !token) {
  console.error(
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, or SANITY_API_READ_TOKEN',
  )
  process.exit(1)
}

if (writeRequested && (!writeConfirmed || !supabaseUrl || !supabaseServiceRoleKey)) {
  console.error(
    'Write requires CONFIRM_PRIVATE_PORTAL_WRITE=true, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY',
  )
  process.exit(1)
}

const client = createClient({projectId, dataset, apiVersion, token, useCdn: false})

const projection = writeRequested
  ? `{
  _id,
  name,
  "slug": slug.current,
  password,
  sharedFolderUrl,
  brandingFolderUrl,
  mediaFolderUrl,
  previewUrl,
  productionUrl,
  whatsappGroupUrl,
  defined(checklist) => {"checklist": true}
}`
  : `{
  _id,
  name,
  "slug": slug.current,
  defined(password) => {"password": true},
  defined(sharedFolderUrl) => {"sharedFolderUrl": true},
  defined(brandingFolderUrl) => {"brandingFolderUrl": true},
  defined(mediaFolderUrl) => {"mediaFolderUrl": true},
  defined(previewUrl) => {"previewUrl": true},
  defined(productionUrl) => {"productionUrl": true},
  defined(whatsappGroupUrl) => {"whatsappGroupUrl": true},
  defined(checklist) => {"checklist": true}
}`

const portals = await client.fetch(
  `*[_type == "clientPortal"] | order(_createdAt asc)${projection}`,
)

const privateFields = [
  'password',
  'sharedFolderUrl',
  'brandingFolderUrl',
  'mediaFolderUrl',
  'previewUrl',
  'productionUrl',
  'whatsappGroupUrl',
  'checklist',
]

const plan = portals.map((portal) => {
  const fieldsPresent = Object.fromEntries(
    privateFields.map((field) => [field, Boolean(portal[field])]),
  )
  return {
    sourceDocumentId: portal._id,
    slug: portal.slug,
    targetStore: 'supabase.portal_private_metadata',
    targetKey: portal._id,
    privateFieldsPresent: fieldsPresent,
    publicFieldsToKeep: [
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
    ],
    publicFieldsToUnsetAfterPrivateCopy: privateFields.filter((field) => fieldsPresent[field]),
  }
})

function hashPassword(password) {
  const salt = randomBytes(16).toString('base64url')
  const iterations = 210_000
  const hash = pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('base64url')
  return {hash, salt, iterations}
}

async function supabaseUpsert(row) {
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

if (writeRequested) {
  for (const portal of portals) {
    if (!portal.password) {
      throw new Error(`Portal ${portal._id} is missing a password; refusing partial private write`)
    }
    const password = hashPassword(portal.password)
    await supabaseUpsert({
      portal_id: portal._id,
      password_hash: password.hash,
      password_salt: password.salt,
      password_iterations: password.iterations,
      shared_folder_url: portal.sharedFolderUrl ?? null,
      branding_folder_url: portal.brandingFolderUrl ?? null,
      media_folder_url: portal.mediaFolderUrl ?? null,
      preview_url: portal.previewUrl ?? null,
      production_url: portal.productionUrl ?? null,
      whatsapp_group_url: portal.whatsappGroupUrl ?? null,
    })
  }
}

console.log(
  JSON.stringify(
    {
      mode: writeRequested ? 'write-private-copy' : 'dry-run',
      projectId,
      sourceDataset: dataset,
      portalCount: plan.length,
      plan,
      cutoverGuardrails: [
        'Copy values server-side; this script never prints passwords, Drive links, or private URLs.',
        'Verify /project/[slug] reads private overlays before unsetting public fields.',
        'Unset only listed private fields from public documents after verification.',
        'Rotate shared portal passwords only after the private read path is active.',
        'Rollback before public cleanup: unset ONBOARDING_PRIVATE_METADATA_STORE or set it away from supabase.',
        'Rollback after public cleanup: restore public fields from the approved secure backup, then unset ONBOARDING_PRIVATE_METADATA_STORE.',
      ],
    },
    null,
    2,
  ),
)
