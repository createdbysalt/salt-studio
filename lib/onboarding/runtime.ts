import {MemoryOnboardingRepository} from '@/lib/onboarding/repository'
import type {OnboardingRepository, OnboardingReviewSink} from '@/lib/onboarding/types'

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
  if (
    process.env.ONBOARDING_AUTOMATION_STORE === 'memory' ||
    process.env.ONBOARDING_AUTOMATION_ALLOW_MEMORY_STORE === 'true'
  ) {
    return memoryRepository
  }

  return null
}

export function getOnboardingReviewSink(): OnboardingReviewSink | undefined {
  return undefined
}
