import {retryFailedOnboardingSyncs} from '@/lib/onboarding/processor'
import {
  getOnboardingJobSecret,
  getOnboardingRepository,
  getOnboardingReviewSink,
} from '@/lib/onboarding/runtime'
import {NextResponse} from 'next/server'

export const runtime = 'nodejs'

function authorized(request: Request, secret: string) {
  const header = request.headers.get('authorization')
  return header === `Bearer ${secret}`
}

export async function POST(request: Request) {
  const secret = getOnboardingJobSecret()
  if (!secret || !authorized(request, secret)) {
    return NextResponse.json({ok: false, error: 'unauthorized'}, {status: 401})
  }

  const repository = getOnboardingRepository()
  const reviewSink = getOnboardingReviewSink()
  if (!repository || !reviewSink) {
    return NextResponse.json({ok: false, error: 'onboarding_retry_not_configured'}, {status: 503})
  }

  const results = await retryFailedOnboardingSyncs({repository, reviewSink})
  return NextResponse.json({ok: true, results})
}
