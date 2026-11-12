import {timingSafeEqual} from 'node:crypto'
import {getStripe, stripeIsLive} from '@/lib/payments/stripe'
import {retryPendingProposalEmails} from '@/lib/proposal/paidEmails'
import {receiptUrlForPayment} from '@/lib/proposal/stripeReceipt'
import {NextResponse} from 'next/server'

export const runtime = 'nodejs'

/**
 * Compared in constant time, the same way the proposal gate compares its
 * password. A plain === returns as soon as two bytes differ, which leaks the
 * length of the matching prefix to anyone who can measure the response. The
 * length check first is fine: the length of a secret is not the secret.
 */
function authorized(request: Request, secret: string) {
  const expected = Buffer.from(`Bearer ${secret}`)
  const given = Buffer.from(request.headers.get('authorization') ?? '')
  if (given.length !== expected.length) return false
  return timingSafeEqual(given, expected)
}

export async function POST(request: Request) {
  const secret = process.env.PROPOSAL_EMAIL_JOB_SECRET
  if (!secret || !authorized(request, secret)) {
    return NextResponse.json({ok: false, error: 'unauthorized'}, {status: 401})
  }

  const forceSendFailure =
    !stripeIsLive() && request.headers.get('x-proposal-email-test-failure') === '1'
  const stripe = getStripe()
  const results = await retryPendingProposalEmails({
    liveMode: stripeIsLive(),
    forceSendFailure,
    receiptUrlResolver: stripe ? (payment) => receiptUrlForPayment(stripe, payment) : undefined,
  })
  return NextResponse.json({ok: true, results})
}
