import {isPreviewIsolationEnabled} from '@/lib/onboarding/preview-fixtures'
import {getOnboardingJobSecret, getOnboardingRepository} from '@/lib/onboarding/runtime'
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

  if (!isPreviewIsolationEnabled()) {
    return NextResponse.json({ok: false, error: 'preview_isolation_disabled'}, {status: 404})
  }

  const repository = getOnboardingRepository()
  if (!repository) {
    return NextResponse.json({ok: false, error: 'onboarding_cleanup_not_configured'}, {status: 503})
  }

  try {
    const deleted = await repository.deleteIsolatedPreviewSubmissions()
    return NextResponse.json({ok: true, deleted})
  } catch {
    return NextResponse.json({ok: false, error: 'onboarding_cleanup_unavailable'}, {status: 503})
  }
}
