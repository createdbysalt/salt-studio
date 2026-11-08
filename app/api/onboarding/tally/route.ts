import {processTallyWebhook} from '@/lib/onboarding/processor'
import {
  getOnboardingRepository,
  getOnboardingReviewSink,
  getOnboardingRoutingSecret,
  getTallyWebhookSecret,
} from '@/lib/onboarding/runtime'
import {verifyTallySignature} from '@/lib/onboarding/tally-signature'
import {NextResponse} from 'next/server'

export const runtime = 'nodejs'

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, {status})
}

export async function POST(request: Request) {
  const webhookSecret = getTallyWebhookSecret()
  const routingSecret = getOnboardingRoutingSecret()
  const repository = getOnboardingRepository()

  if (!webhookSecret || !routingSecret || !repository) {
    return json(503, {
      ok: false,
      error: 'onboarding_automation_not_configured',
    })
  }

  const rawBody = await request.text()
  const signature = request.headers.get('Tally-Signature')

  if (!verifyTallySignature({rawBody, signature, signingSecret: webhookSecret})) {
    return json(401, {ok: false, error: 'invalid_signature'})
  }

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return json(400, {ok: false, error: 'invalid_json'})
  }

  const {resolveOnboardingProject} = await import('@/lib/onboarding/preview-fixtures')
  const result = await processTallyWebhook({
    rawBody,
    payload,
    routingSecret,
    repository,
    getProject: resolveOnboardingProject,
    reviewSink: getOnboardingReviewSink(),
  })

  return json(result.httpStatus, {
    ok: true,
    status: result.status,
    reviewReason: result.record.reviewReason,
  })
}
