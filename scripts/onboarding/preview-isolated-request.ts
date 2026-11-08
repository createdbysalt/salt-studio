import {
  isPreviewIsolationEnabled,
  PREVIEW_FIXTURE_PROJECT_ID,
} from '@/lib/onboarding/preview-fixtures'
import {createOnboardingRouteToken} from '@/lib/onboarding/routing'
import {createTallySignature} from '@/lib/onboarding/tally-signature'

const PRODUCTION_HOSTS = new Set(['createdbysalt.com', 'www.createdbysalt.com'])

function previewOrigin() {
  const raw = process.env.ONBOARDING_PREVIEW_ORIGIN
  if (!raw) return ''
  const url = new URL(raw)
  if (PRODUCTION_HOSTS.has(url.hostname)) {
    throw new Error('Refusing to target the production host')
  }
  return url.origin
}

function requireEnabled() {
  if (process.env.VERCEL_ENV === 'production' || !isPreviewIsolationEnabled()) {
    console.error(
      'Isolated preview requests are unavailable. Set VERCEL_ENV=preview and ONBOARDING_PREVIEW_ISOLATION=enabled. Do not point this at production.',
    )
    process.exit(1)
  }

  if (!process.env.ONBOARDING_ROUTING_SECRET || !process.env.TALLY_WEBHOOK_SECRET) {
    console.error('Missing ONBOARDING_ROUTING_SECRET or TALLY_WEBHOOK_SECRET.')
    process.exit(1)
  }
}

requireEnabled()

const routingSecret = process.env.ONBOARDING_ROUTING_SECRET as string
const webhookSecret = process.env.TALLY_WEBHOOK_SECRET as string
const submissionId = `preview-isolated-${Date.now()}`
const token = createOnboardingRouteToken(
  {projectId: PREVIEW_FIXTURE_PROJECT_ID, itemKey: 'f-staff', formId: '814oZl'},
  routingSecret,
)
const body = JSON.stringify({
  eventId: submissionId,
  data: {
    responseId: submissionId,
    formId: '814oZl',
    fields: [
      {key: 'project_id', value: PREVIEW_FIXTURE_PROJECT_ID},
      {key: 'form_id', value: '814oZl'},
      {key: 'item_key', value: 'f-staff'},
      {key: 'salt_route', value: token},
      {key: 'staff_name', value: 'Preview Fixture'},
    ],
  },
})
const signature = createTallySignature(body, webhookSecret)
const origin = previewOrigin()
const webhookPath = '/api/onboarding/tally'
const cleanupPath = '/api/onboarding/jobs/preview-cleanup'

console.log(`POST ${origin}${webhookPath}`)
console.log(`Tally-Signature: ${signature}`)
console.log(body)
console.log('')
console.log(`POST ${origin}${cleanupPath}`)
console.log('Authorization: Bearer $ONBOARDING_JOB_SECRET')
console.log('')
console.log(
  'Cleanup deletes only salt-preview-isolated-onboarding rows. It does not target a client portal.',
)
