import type {OnboardingProjectLookup} from '@/lib/onboarding/processor'
import type {OnboardingProjectMapping} from '@/lib/onboarding/types'

export const PREVIEW_FIXTURE_PROJECT_ID = 'salt-preview-isolated-onboarding'

const PREVIEW_FIXTURE_FORMS = [
  {itemKey: 'gs-form', formId: 'yP5oEB', title: 'Church Info Form'},
  {itemKey: 'f-staff', formId: '814oZl', title: 'Staff Bio'},
  {itemKey: 'f-ministry', formId: '0QRre9', title: 'Ministry'},
  {itemKey: 'f-crew', formId: 'zx5X7k', title: 'Crew'},
  {itemKey: 'f-small-group', formId: '5BPKZN', title: 'Small Group'},
  {itemKey: 'f-event', formId: 'Y5lD4N', title: 'Event'},
  {itemKey: 'f-course', formId: 'lbkD6o', title: 'Course'},
  {itemKey: 'f-testimony', formId: 'RGyKPK', title: 'Testimony'},
  {itemKey: 'f-faq', formId: 'obL6Gb', title: 'FAQ'},
] as const

export function isPreviewIsolationEnabled(env: NodeJS.ProcessEnv = process.env) {
  if (env.VERCEL_ENV === 'production') return false
  return env.VERCEL_ENV === 'preview' && env.ONBOARDING_PREVIEW_ISOLATION === 'enabled'
}

export function isPreviewFixtureProjectId(projectId: string | null | undefined) {
  return projectId === PREVIEW_FIXTURE_PROJECT_ID
}

export function getPreviewFixtureProject(projectId: string): OnboardingProjectMapping | null {
  if (!isPreviewIsolationEnabled() || !isPreviewFixtureProjectId(projectId)) return null

  return {
    projectId: PREVIEW_FIXTURE_PROJECT_ID,
    portalSlug: null,
    clientRef: null,
    name: 'Preview isolated onboarding fixture',
    enabled: true,
    internalTaskSystem: 'none',
    isolation: 'preview-fixture',
    forms: PREVIEW_FIXTURE_FORMS.map((form) => ({...form})),
  }
}

async function defaultProjectLookup(projectId: string) {
  const {getSanityOnboardingProject} = await import('@/lib/onboarding/sanity-projects')
  return getSanityOnboardingProject(projectId)
}

export async function resolveOnboardingProject(
  projectId: string,
  lookup: OnboardingProjectLookup = defaultProjectLookup,
) {
  const real = await lookup(projectId)
  if (real) return real
  return getPreviewFixtureProject(projectId)
}
