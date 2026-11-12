import {getStripe, stripeIsLive} from '@/lib/payments/stripe'
import {retryPendingProposalEmails} from '@/lib/proposal/paidEmails'
import {receiptUrlForPayment} from '@/lib/proposal/stripeReceipt'
import {NextResponse} from 'next/server'

export const runtime = 'nodejs'

function authorized(request: Request, secret: string) {
  return request.headers.get('authorization') === `Bearer ${secret}`
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
