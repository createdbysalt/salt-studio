import {extractTallyFormId} from '@/lib/onboarding/routing'
import type {OnboardingFormMapping, OnboardingProjectMapping} from '@/lib/onboarding/types'
import {apiVersion, dataset, projectId} from '@/sanity/lib/api'
import {clientPortalAutomationByIdQuery} from '@/sanity/lib/queries'
import {token} from '@/sanity/lib/token'
import {createClient} from 'next-sanity'

const readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

type PortalAutomationDocument = {
  _id?: string | null
  name?: string | null
  enabled?: boolean | null
  slug?: string | null
  clientRef?: string | null
  checklistSource?: {
    categories?: Array<{
      items?: Array<{_key?: string | null; title?: string | null; link?: string | null} | null>
    } | null>
  } | null
  formsSource?: {
    items?: Array<{_key?: string | null; title?: string | null; link?: string | null} | null>
  } | null
}

function formMappingsFromItems(
  items: Array<{_key?: string | null; title?: string | null; link?: string | null} | null>,
) {
  const forms: OnboardingFormMapping[] = []
  for (const item of items) {
    if (!item?._key) continue
    const formId = extractTallyFormId(item.link)
    if (!formId) continue
    forms.push({itemKey: item._key, formId, title: item.title})
  }
  return forms
}

export async function getSanityOnboardingProject(
  targetProjectId: string,
): Promise<OnboardingProjectMapping | null> {
  const portal = await readClient.fetch<PortalAutomationDocument | null>(
    clientPortalAutomationByIdQuery,
    {projectId: targetProjectId},
  )
  if (!portal?._id) return null

  const checklistItems =
    portal.checklistSource?.categories?.flatMap((category) => category?.items ?? []) ?? []
  const formItems = portal.formsSource?.items ?? []
  const forms = formMappingsFromItems([...checklistItems, ...formItems])

  return {
    projectId: portal._id,
    portalSlug: portal.slug,
    clientRef: portal.clientRef,
    name: portal.name,
    enabled: portal.enabled,
    forms,
    internalTaskSystem: 'notion',
  }
}
