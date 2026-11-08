#!/usr/bin/env node
import {createClient} from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-27'
const token = process.env.SANITY_API_READ_TOKEN
const targetDataset =
  process.env.ONBOARDING_PRIVATE_SANITY_DATASET || '<set ONBOARDING_PRIVATE_SANITY_DATASET>'

if (!projectId || !dataset || !token) {
  console.error(
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, or SANITY_API_READ_TOKEN',
  )
  process.exit(1)
}

const writeRequested = process.argv.includes('--write')
if (writeRequested) {
  console.error(
    'This migration planner is dry-run only in this pass. No production records changed.',
  )
  process.exit(1)
}

const client = createClient({projectId, dataset, apiVersion, token, useCdn: false})

const portals = await client.fetch(`*[_type == "clientPortal"] | order(_createdAt asc){
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
}`)

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
    targetDataset,
    targetDocumentId: `clientPortalPrivate.${portal._id}`,
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

console.log(
  JSON.stringify(
    {
      mode: 'dry-run',
      projectId,
      sourceDataset: dataset,
      portalCount: plan.length,
      plan,
      cutoverGuardrails: [
        'Create the target dataset as private before copying any portal-private data.',
        'Copy values server-side; do not print passwords, Drive links, or private URLs.',
        'Verify /project/[slug] reads private overlays before unsetting public fields.',
        'Unset only listed private fields from public documents after verification.',
        'Rotate shared portal passwords only after the private read path is active.',
      ],
    },
    null,
    2,
  ),
)
