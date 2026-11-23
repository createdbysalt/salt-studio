/**
 * The real sign action and the real paid-email send, with the Supabase REST
 * calls answered from memory. Wire is the sign path that records the
 * acceptance and does not open a Stripe Checkout session.
 *
 * Set PROPOSAL_QA_ARTIFACTS=1 to write the HTML and PDF files under
 * /opt/cursor/artifacts/pr66-qa/. Those files are not part of the repo.
 */
import assert from 'node:assert/strict'
import {mkdirSync, writeFileSync} from 'node:fs'
import {mock, test} from 'node:test'
import {previewProposal} from '@/components/proposalPreview'
import {buildProposalPdf as realBuildProposalPdf, type PdfBlock} from '../lib/proposal/documentPdf'

process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??= 'jkqf2ng5'
process.env.NEXT_PUBLIC_SANITY_DATASET ??= 'production'
process.env.SANITY_API_READ_TOKEN ??= 'test-token'
delete process.env.STRIPE_SECRET_KEY

const STORE_ORIGIN = 'https://proposal-store.fixture'
const MSA_URL = 'https://cdn.sanity.io/files/jkqf2ng5/production/fixture-msa.pdf'
/**
 * The paid-email path does not render the agreement. Signing downloads the
 * uploaded file with freezeMsaPdf, and only from cdn.sanity.io, then the
 * email attaches those stored bytes. A local stand-in keeps the test off
 * that network. The statement is the file this suite renders.
 */
const MSA_BYTES = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 0/Kids[]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n',
)
const RECEIPT_URL = 'https://pay.stripe.com/receipts/fixture-harbor'

const proposal = fixtureProposal()
let sowRebuilds = 0
mock.module('@/lib/proposal/documentPdf', {
  namedExports: {
    buildProposalPdf(blocks: PdfBlock[]) {
      sowRebuilds += 1
      return realBuildProposalPdf(blocks)
    },
  },
})

mock.module('server-only', {namedExports: {}})
mock.module('next/headers', {
  namedExports: {
    async headers() {
      return new Headers({
        'x-forwarded-for': '203.0.113.20',
        'user-agent': 'proposal-sign-email-test',
      })
    },
    async cookies() {
      return {get: () => undefined, set() {}}
    },
  },
})
mock.module('next/cache', {
  namedExports: {
    revalidatePath() {},
  },
})
mock.module('next/navigation', {
  namedExports: {
    redirect() {},
  },
})
mock.module('@/sanity/lib/live', {
  namedExports: {
    SanityLive() {
      return null
    },
    async sanityFetch() {
      return {data: null}
    },
    async sanityFetchLive() {
      return {data: null}
    },
  },
})
mock.module('@/lib/proposal/load', {
  namedExports: {
    isDevPreview() {
      return false
    },
    async isProposalUnlocked() {
      return true
    },
    async loadProposal() {
      return proposal
    },
  },
})

type Row = Record<string, unknown>
type SentMail = {
  idempotencyKey: string
  html: string
  text: string
  attachments?: Array<{filename: string; content: string; contentType?: string}>
}

function fixtureProposal() {
  const base = previewProposal()
  const video = (base.addOns ?? []).find((item) => item._id === 'addon-video')
  if (!video) throw new Error('The preview fixture no longer has the video add-on.')
  return {
    ...base,
    _id: 'proposal_harbor',
    clientDisplayName: 'Harbor Legal',
    clientLegalName: 'Harbor Legal LLC',
    validUntil: '2027-12-31T23:59:00.000Z',
    packages: (base.packages ?? []).map((item) =>
      item._id === 'pkg-landing' ? {...item, name: 'Brand and website', amount: 20_000} : item,
    ),
    addOns: [
      video,
      {
        ...video,
        _id: 'addon-copy',
        name: 'Copy pass',
        line: 'A pass on the words.',
        amount: 250,
      },
    ],
    msa: base.msa
      ? {
          ...base.msa,
          pdfUrl: MSA_URL,
          pdfFilename: 'Master-Services-Agreement.pdf',
        }
      : base.msa,
  }
}

function requestUrl(input: RequestInfo | URL) {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.toString()
  return input.url
}

function matches(row: Row, params: URLSearchParams) {
  for (const [key, value] of params) {
    if (key === 'select' || key === 'order' || key === 'limit' || key === 'on_conflict') continue
    if (value.startsWith('eq.')) {
      if (String(row[key] ?? '') !== value.slice(3)) return false
    } else if (value.startsWith('neq.')) {
      if (String(row[key] ?? '') === value.slice(4)) return false
    } else if (value.startsWith('in.(') && value.endsWith(')')) {
      const options = value.slice(4, -1).split(',')
      if (!options.includes(String(row[key] ?? ''))) return false
    } else if (value.startsWith('lt.')) {
      if (!(String(row[key] ?? '') < value.slice(3))) return false
    }
  }
  return true
}

function installMemoryStore() {
  const tables = new Map<string, Row[]>([
    ['proposal_acceptances', []],
    ['proposal_payments', []],
    ['proposal_emails', []],
  ])
  const sent: SentMail[] = []
  const hosts = new Set<string>()
  let sequence = 0

  globalThis.fetch = async (input, init) => {
    const url = new URL(requestUrl(input))
    hosts.add(url.hostname)
    const method = init?.method ?? 'GET'

    if (url.hostname === 'cdn.sanity.io' && url.toString() === MSA_URL) {
      return new Response(MSA_BYTES, {
        status: 200,
        headers: {'content-type': 'application/pdf'},
      })
    }

    if (url.hostname === 'api.resend.com' && url.pathname === '/emails' && method === 'POST') {
      const body = JSON.parse(String(init?.body)) as SentMail
      const idempotencyKey = new Headers(init?.headers).get('Idempotency-Key') ?? ''
      sent.push({...body, idempotencyKey})
      return new Response(JSON.stringify({id: `resend-${sent.length}`}), {status: 200})
    }

    if (url.origin !== STORE_ORIGIN) {
      throw new Error(`The test refused a network call to ${url.origin}${url.pathname}`)
    }

    const table = url.pathname.replace('/rest/v1/', '')
    const rows = tables.get(table)
    if (!rows) throw new Error(`The memory store has no ${table} table.`)

    if (method === 'POST') {
      const body = JSON.parse(String(init?.body)) as Row
      if (table === 'proposal_emails') {
        const existing = rows.find(
          (row) => row.payment_id === body.payment_id && row.kind === body.kind,
        )
        if (existing) return new Response(JSON.stringify([]), {status: 200})
        const row: Row = {
          status: 'pending',
          resend_id: null,
          error: null,
          claimed_at: null,
          sent_at: null,
          created_at: '2026-11-23T12:00:00.000Z',
          updated_at: '2026-11-23T12:00:00.000Z',
          ...body,
          id: `email-${++sequence}`,
        }
        rows.push(row)
        return new Response(JSON.stringify([row]), {status: 200})
      }
      const row: Row = {
        ...(table === 'proposal_payments'
          ? {
              stripe_checkout_session_id: null,
              stripe_payment_intent_id: null,
              stripe_customer_id: null,
              stripe_receipt_url: null,
              expires_at: null,
              paid_at: null,
            }
          : {}),
        ...body,
        id: body.id ?? `${table === 'proposal_acceptances' ? 'acc' : 'pay'}_${++sequence}`,
        created_at: body.created_at ?? '2026-11-23T12:00:00.000Z',
        updated_at: '2026-11-23T12:00:00.000Z',
      }
      rows.push(row)
      return new Response(JSON.stringify([row]), {status: 200})
    }

    if (method === 'PATCH') {
      const found = rows.filter((row) => matches(row, url.searchParams))
      const patch = JSON.parse(String(init?.body)) as Row
      for (const row of found) Object.assign(row, patch, {updated_at: '2026-11-23T12:05:00.000Z'})
      return new Response(JSON.stringify(found), {status: 200})
    }

    const found = rows.filter((row) => matches(row, url.searchParams))
    const order = url.searchParams.get('order') ?? ''
    if (order.startsWith('created_at.desc')) {
      found.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    }
    const limit = Number(url.searchParams.get('limit'))
    const page = Number.isFinite(limit) && limit > 0 ? found.slice(0, limit) : found
    return new Response(JSON.stringify(page), {status: 200})
  }

  return {tables, sent, hosts}
}

function signingForm() {
  const data = new FormData()
  data.set('intent', 'wire')
  data.set('agree', 'yes')
  data.set('package', 'pkg-landing')
  data.append('addon', 'addon-video')
  data.append('addon', 'addon-copy')
  data.set('kickoff', '2026-12-01')
  data.set('signerName', 'Jordan Hale')
  data.set('legalName', 'Harbor Legal LLC')
  data.set('address', '100 Harbor Street\nPortland, OR 97201\nUnited States')
  data.set('email', 'jordan.hale@example.test')
  return data
}

function mailFor(sent: SentMail[], idempotencyKey: string) {
  const message = sent.find((item) => item.idempotencyKey === idempotencyKey)
  assert.ok(message, idempotencyKey)
  return message
}

function sowOf(message: SentMail) {
  const file = message.attachments?.find(
    (item) => item.filename === 'Salt-Studio-Signed-Statement-of-Work.pdf',
  )
  assert.ok(file)
  return file
}

test('signing through the paid emails keeps the saved statement, frozen add-on prices, and the old-row fallback', async () => {
  process.env.SUPABASE_URL = STORE_ORIGIN
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'
  process.env.RESEND_API_KEY = 'resend-key'
  process.env.RESEND_FROM_EMAIL = 'hello@createdbysalt.com'
  process.env.PROPOSAL_EMAIL_TEST_TO = 'proposal-test@example.test'
  process.env.CONTACT_EMAIL = 'contact@example.test'

  const store = installMemoryStore()
  const {bytesFromBase64, sha256Bytes} = await import('@/lib/proposal/frozenDocument')
  const {signProposal} = await import('@/app/(proposal)/p/[token]/actions')
  const {updatePayment} = await import('@/lib/proposal/acceptances')
  const {sendPaidProposalEmailsForPayment} = await import('@/lib/proposal/paidEmails')

  const signed = await signProposal('harbor-link', null, signingForm())
  assert.deepEqual(signed, {ok: true, wire: true})
  assert.equal(store.hosts.has('api.stripe.com'), false)

  const acceptances = store.tables.get('proposal_acceptances') ?? []
  const payments = store.tables.get('proposal_payments') ?? []
  assert.equal(acceptances.length, 1)
  assert.equal(payments.length, 1)
  const saved = acceptances[0]
  const payment = payments[0]
  assert.ok(saved && payment)
  assert.equal(payment.method, 'wire')
  assert.equal(payment.stripe_checkout_session_id, null)
  assert.equal(typeof saved.sow_pdf_bytes_base64, 'string')
  assert.equal(typeof saved.sow_pdf_sha256, 'string')
  const savedBytes = String(saved.sow_pdf_bytes_base64)
  const savedHash = String(saved.sow_pdf_sha256)
  assert.equal(sha256Bytes(bytesFromBase64(savedBytes)), savedHash)
  const frozen = (
    saved.agreed_document as {
      proposal?: {addons?: Array<{id: string; name: string; amountCents: number}>}
    }
  ).proposal?.addons
  assert.deepEqual(frozen, [
    {id: 'addon-video', name: 'Video edits', amountCents: 90_000},
    {id: 'addon-copy', name: 'Copy pass', amountCents: 25_000},
  ])

  await updatePayment(String(payment.id), {
    status: 'paid',
    paid_at: '2026-11-23T12:05:00.000Z',
  })
  sowRebuilds = 0
  const sent = await sendPaidProposalEmailsForPayment({
    paymentId: String(payment.id),
    receiptUrl: RECEIPT_URL,
    liveMode: false,
  })
  assert.deepEqual(
    sent.map((item) => item.status),
    ['sent', 'sent'],
  )

  const signer = mailFor(store.sent, `signed-docs/${payment.id}`)
  const owner = mailFor(store.sent, `signed-paid-notice/${payment.id}`)
  const signerSow = sowOf(signer)
  const ownerSow = sowOf(owner)
  assert.equal(sowRebuilds, 0)
  assert.equal(signerSow.content, savedBytes)
  assert.equal(ownerSow.content, savedBytes)
  assert.equal(sha256Bytes(bytesFromBase64(ownerSow.content)), savedHash)
  assert.match(owner.html, /Video edits[\s\S]{0,500}\$900/)
  assert.match(owner.html, /Copy pass[\s\S]{0,500}\$250/)

  const oldDocument = JSON.parse(JSON.stringify(saved.agreed_document)) as {
    proposal: {addons?: unknown; addonNames: string[]}
    sow: {blocks: PdfBlock[]}
  }
  delete oldDocument.proposal.addons
  assert.deepEqual(oldDocument.proposal.addonNames, ['Video edits', 'Copy pass'])
  const oldAcceptance: Row = {
    ...saved,
    id: 'acc_old',
    created_at: '2026-11-23T11:00:00.000Z',
    sow_pdf_sha256: null,
    sow_pdf_bytes_base64: null,
    agreed_document: oldDocument,
  }
  acceptances.push(oldAcceptance)
  payments.push({
    ...payment,
    id: 'pay_old',
    acceptance_id: 'acc_old',
    status: 'paid',
    paid_at: '2026-11-23T11:05:00.000Z',
    stripe_receipt_url: RECEIPT_URL,
    stripe_checkout_session_id: null,
  })

  assert.equal(oldAcceptance.sow_pdf_bytes_base64, null)
  assert.equal(oldAcceptance.sow_pdf_sha256, null)
  sowRebuilds = 0
  const fallbackSent = await sendPaidProposalEmailsForPayment({
    paymentId: 'pay_old',
    liveMode: false,
  })
  assert.equal(sowRebuilds, 1)
  assert.deepEqual(
    fallbackSent.map((item) => item.status),
    ['sent', 'sent'],
  )
  const rebuilt = Buffer.from(realBuildProposalPdf(oldDocument.sow.blocks)).toString('base64')
  const fallbackOwner = mailFor(store.sent, 'signed-paid-notice/pay_old')
  const fallbackSigner = mailFor(store.sent, 'signed-docs/pay_old')
  const fallbackSow = sowOf(fallbackOwner)
  assert.equal(fallbackSow.content, rebuilt)
  assert.equal(sowOf(fallbackSigner).content, rebuilt)
  assert.notEqual(rebuilt, '')
  assert.match(fallbackOwner.html, /Video edits/)
  assert.match(fallbackOwner.html, /Copy pass/)
  assert.equal(fallbackOwner.html.includes('$900'), false)
  assert.equal(fallbackOwner.html.includes('$250'), false)

  if (process.env.PROPOSAL_QA_ARTIFACTS === '1') {
    const dir = '/opt/cursor/artifacts/pr66-qa'
    mkdirSync(dir, {recursive: true})
    const msa = owner.attachments?.find((item) => item.filename === 'Master-Services-Agreement.pdf')
    assert.ok(msa)
    writeFileSync(`${dir}/owner-email.html`, owner.html)
    writeFileSync(`${dir}/signer-email.html`, signer.html)
    writeFileSync(`${dir}/sow.pdf`, Buffer.from(ownerSow.content, 'base64'))
    writeFileSync(`${dir}/msa.pdf`, Buffer.from(msa.content, 'base64'))
    writeFileSync(`${dir}/owner-email-fallback.html`, fallbackOwner.html)
    writeFileSync(`${dir}/sow-fallback.pdf`, Buffer.from(fallbackSow.content, 'base64'))
  }
})
