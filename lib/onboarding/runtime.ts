import {NotionReviewSink} from '@/lib/onboarding/notion'
import {MemoryOnboardingRepository, SanityOnboardingRepository} from '@/lib/onboarding/repository'
import {SupabaseOnboardingRepository} from '@/lib/onboarding/supabase-repository'
import type {OnboardingRepository, OnboardingReviewSink} from '@/lib/onboarding/types'
import {createClient} from 'next-sanity'

const memoryRepository = new MemoryOnboardingRepository()

export function getOnboardingRoutingSecret() {
  return process.env.ONBOARDING_ROUTING_SECRET ?? null
}

export function getTallyWebhookSecret() {
  return process.env.TALLY_WEBHOOK_SECRET ?? null
}

export function getOnboardingJobSecret() {
  return process.env.ONBOARDING_JOB_SECRET ?? null
}

export function getOnboardingRepository(): OnboardingRepository | null {
  const store = process.env.ONBOARDING_AUTOMATION_STORE
  if (store === 'supabase') {
    const url = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceRoleKey) return null
    return new SupabaseOnboardingRepository({url, serviceRoleKey})
  }

  if (store === 'sanity' || process.env.NODE_ENV === 'production') {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    const dataset = process.env.ONBOARDING_PRIVATE_SANITY_DATASET
    const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-27'
    const token = process.env.SANITY_API_WRITE_TOKEN

    if (!projectId || !dataset || !token) return null
    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn: false,
    })
    return new SanityOnboardingRepository(
      client as unknown as ConstructorParameters<typeof SanityOnboardingRepository>[0],
    )
  }

  if (store === 'memory' || process.env.ONBOARDING_AUTOMATION_ALLOW_MEMORY_STORE === 'true') {
    return memoryRepository
  }

  return null
}

export function getOnboardingReviewSink(): OnboardingReviewSink | undefined {
  const token = process.env.NOTION_API_KEY
  const databaseId = process.env.NOTION_ONBOARDING_TASKS_DATABASE_ID
  if (token && databaseId) {
    return new NotionReviewSink({token, databaseId})
  }

  return undefined
}
