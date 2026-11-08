import type {PrivatePortalOverlay} from '@/lib/onboarding/types'
import {apiVersion, projectId} from '@/sanity/lib/api'
import {token} from '@/sanity/lib/token'
import {createClient} from 'next-sanity'

function privateDataset() {
  return process.env.ONBOARDING_PRIVATE_SANITY_DATASET ?? null
}

export async function getPrivatePortalOverlay(
  portalId: string,
): Promise<PrivatePortalOverlay | null> {
  const dataset = privateDataset()
  if (!dataset) return null

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
