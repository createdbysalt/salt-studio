import {GoogleDriveFolderScanner, parseDriveScanRequest} from '@/lib/onboarding/drive-scanner'
import {getOnboardingJobSecret} from '@/lib/onboarding/runtime'
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

  if (process.env.ONBOARDING_DRIVE_SCAN !== 'enabled') {
    return NextResponse.json({ok: false, error: 'drive_scan_disabled'}, {status: 503})
  }

  const accessToken = process.env.GOOGLE_DRIVE_ACCESS_TOKEN
  if (!accessToken) {
    return NextResponse.json({ok: false, error: 'drive_credentials_missing'}, {status: 503})
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ok: false, error: 'invalid_json'}, {status: 400})
  }

  const parsed = parseDriveScanRequest(payload)
  if (!parsed.ok) return NextResponse.json({ok: false, error: parsed.error}, {status: 400})

  const summary = await new GoogleDriveFolderScanner({accessToken}).scan(parsed.value)
  const status = summary.stoppedReason === 'rate_limited' ? 429 : 200
  return NextResponse.json(
    {
      ok: status === 200,
      summary,
    },
    {status},
  )
}
