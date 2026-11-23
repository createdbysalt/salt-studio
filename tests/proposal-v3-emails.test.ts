import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import test from 'node:test'
import type {AcceptanceRow, PaymentRow, ProposalEmailRow} from '@/lib/proposal/acceptances'
import {buildProposalPdf} from '@/lib/proposal/documentPdf'
import {acceptanceDocumentHash, bytesFromBase64, sha256Bytes} from '@/lib/proposal/frozenDocument'
import {sendPaidProposalEmails, type ProposalEmailSend} from '@/lib/proposal/paidEmails'
import {signedSowBlocks} from '@/lib/proposal/signedSow'
import {validateSigningFields} from '@/lib/proposal/signingFields'
import {formatSigningTime} from '@/lib/proposal/signingTime'
import {
  proposalV3FixtureIds,
  proposalV3FixturePdf,
  proposalV3FixtureSigner,
} from './fixtures/proposal-v3'

const ORIGINAL_FETCH = globalThis.fetch
const ORIGINAL_ENV = {...process.env}

function restore() {
  globalThis.fetch = ORIGINAL_FETCH
  process.env = {...ORIGINAL_ENV}
}

function form(overrides: Record<string, string> = {}) {
  const data = new FormData()
  data.set('signerName', proposalV3FixtureSigner.fullName)
  data.set('legalName', proposalV3FixtureSigner.legalName)
  data.set('address', proposalV3FixtureSigner.address)
  data.set('email', proposalV3FixtureSigner.email)
  for (const [key, value] of Object.entries(overrides)) data.set(key, value)
  return data
}

function acceptance(overrides: Partial<AcceptanceRow> = {}): AcceptanceRow {
  return {
    id: 'acc_complete-msa',
    proposal_id: proposalV3FixtureIds.completeMsa,
    token_hash: 'token-hash',
    signer_name: proposalV3FixtureSigner.fullName,
    signer_email: proposalV3FixtureSigner.email,
    signer_legal_name: proposalV3FixtureSigner.legalName,
    signer_address: {
      formatted: proposalV3FixtureSigner.address,
      lines: proposalV3FixtureSigner.address.split('\n'),
    },
    client_name: 'Fixture Client',
    package_id: 'pkg-fixture',
    package_name: 'Fixture Package',
    addon_ids: ['addon-fixture'],
    selection_key: 'pkg-fixture|addon-fixture',
    kickoff_date: '2026-12-01',
    same_day_percent: null,
    total_cents: 100_000,
    first_cents: 100_000,
    steps: [{key: 'full', percent: 100, trigger: 'On signing', amountCents: 100_000}],
    schedule_name: 'Full payment',
    msa_version: 'fixture-v1',
    msa_pdf_sha256: proposalV3FixturePdf.sha256,
    msa_pdf_bytes_base64: proposalV3FixturePdf.bytesBase64,
    msa_pdf_filename: proposalV3FixturePdf.filename,
    msa_pdf_content_type: proposalV3FixturePdf.contentType,
    msa_pdf_missing_reason: null,
    sow_pdf_sha256: null,
    sow_pdf_bytes_base64: null,
    agreed_document: {
      version: 3,
      signer: {
        fullName: proposalV3FixtureSigner.fullName,
        legalName: proposalV3FixtureSigner.legalName,
        address: {
          formatted: proposalV3FixtureSigner.address,
          lines: proposalV3FixtureSigner.address.split('\n'),
        },
        email: proposalV3FixtureSigner.email,
        acceptedAt: '2026-11-12T00:00:00.000Z',
      },
      proposal: {
        id: proposalV3FixtureIds.completeMsa,
        clientName: 'Fixture Client',
        packageId: 'pkg-fixture',
        packageName: 'Fixture Package',
        addonIds: ['addon-fixture'],
        addonNames: ['Fixture Add-on'],
        selectionKey: 'pkg-fixture|addon-fixture',
        kickoffDate: '2026-12-01',
      },
      quote: {
        totalCents: 100_000,
        firstCents: 100_000,
        sameDayPercent: null,
        scheduleName: 'Full payment',
        steps: [{key: 'full', percent: 100, trigger: 'On signing', amountCents: 100_000}],
      },
      msa: {
        id: 'msa-fixture',
        version: 'fixture-v1',
        effectiveDate: '2026-01-01',
        bodyText: 'Fixture MSA body',
        pdf: {
          status: 'frozen',
          sha256: proposalV3FixturePdf.sha256,
          bytesBase64: proposalV3FixturePdf.bytesBase64,
          filename: proposalV3FixturePdf.filename,
          contentType: proposalV3FixturePdf.contentType,
        },
      },
      sow: {
        blocks: [
          {kind: 'title', text: 'Signed Statement of Work'},
          {kind: 'note', text: `Client legal name: ${proposalV3FixtureSigner.legalName}`},
          {kind: 'note', text: `Mailing address: ${proposalV3FixtureSigner.address}`},
          {kind: 'paragraph', text: 'Record hash: fixture-hash'},
        ],
      },
    },
    agreed_text_sha256: 'fixture-hash',
    ip: '203.0.113.10',
    user_agent: 'node-test',
    created_at: '2026-11-12T00:00:00.000Z',
    ...overrides,
  }
}

function payment(overrides: Partial<PaymentRow> = {}): PaymentRow {
  return {
    id: 'pay_complete-msa',
    acceptance_id: 'acc_complete-msa',
    proposal_id: proposalV3FixtureIds.completeMsa,
    step_index: 0,
    method: 'checkout',
    stripe_checkout_session_id: 'cs_test_fixture',
    stripe_payment_intent_id: 'pi_test_fixture',
    stripe_customer_id: 'cus_test_fixture',
    stripe_receipt_url: 'https://pay.stripe.com/receipts/test-fixture',
    amount_cents: 100_000,
    currency: 'usd',
    status: 'paid',
    expires_at: null,
    paid_at: '2026-11-12T00:05:00.000Z',
    created_at: '2026-11-12T00:00:00.000Z',
    updated_at: '2026-11-12T00:05:00.000Z',
    ...overrides,
  }
}

function installStore() {
  const emails: ProposalEmailRow[] = []
  process.env.SUPABASE_URL = 'https://supabase.fixture'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'
  process.env.RESEND_API_KEY = 'resend-key'
  process.env.RESEND_FROM_EMAIL = 'hello@createdbysalt.com'
  process.env.PROPOSAL_EMAIL_TEST_TO = 'proposal-test@example.test'
  process.env.CONTACT_EMAIL = 'contact@example.test'

  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input))
    if (url.hostname !== 'supabase.fixture') {
      return new Response(JSON.stringify({id: 'resend-id'}), {status: 200})
    }
    if (url.pathname !== '/rest/v1/proposal_emails') {
      return new Response(JSON.stringify([]), {status: 200})
    }
    if (init?.method === 'POST') {
      const body = JSON.parse(String(init.body)) as {
        payment_id: string
        acceptance_id: string
        kind: 'signed_docs' | 'studio_notice'
        to_email: string
        idempotency_key: string
      }
      const existing = emails.find(
        (row) => row.payment_id === body.payment_id && row.kind === body.kind,
      )
      if (existing) return new Response(JSON.stringify([]), {status: 200})
      const row: ProposalEmailRow = {
        id: `email-${emails.length + 1}`,
        payment_id: body.payment_id,
        acceptance_id: body.acceptance_id,
        kind: body.kind,
        status: 'pending',
        to_email: body.to_email,
        resend_id: null,
        idempotency_key: body.idempotency_key,
        error: null,
        claimed_at: null,
        sent_at: null,
        created_at: '2026-11-12T00:00:00.000Z',
        updated_at: '2026-11-12T00:00:00.000Z',
      }
      emails.push(row)
      return new Response(JSON.stringify([row]), {status: 200})
    }
    if (init?.method === 'PATCH') {
      const id = url.searchParams.get('id')?.replace('eq.', '')
      const allowedStatuses = url.searchParams.get('status')
      const row = emails.find((item) => item.id === id)
      if (!row) return new Response(JSON.stringify([]), {status: 200})
      if (
        allowedStatuses === 'in.(pending,failed)' &&
        !['pending', 'failed'].includes(row.status)
      ) {
        return new Response(JSON.stringify([]), {status: 200})
      }
      Object.assign(row, JSON.parse(String(init.body)))
      return new Response(JSON.stringify([row]), {status: 200})
    }
    const paymentId = url.searchParams.get('payment_id')?.replace('eq.', '')
    const kind = url.searchParams.get('kind')?.replace('eq.', '')
    return new Response(
      JSON.stringify(
        emails.filter(
          (row) => (!paymentId || row.payment_id === paymentId) && (!kind || row.kind === kind),
        ),
      ),
      {status: 200},
    )
  }
  return emails
}

test.afterEach(restore)

test('AC-10 fixture: migration stores frozen fields, MSA bytes/hash, email claims, and keeps immutability', () => {
  const migration = readFileSync(
    new URL(
      '../supabase/migrations/20261112111500_proposal_signed_paid_emails.sql',
      import.meta.url,
    ),
    'utf8',
  )
  assert.match(migration, /signer_legal_name text/)
  assert.match(migration, /signer_address jsonb/)
  assert.match(migration, /msa_pdf_sha256 text/)
  assert.match(migration, /msa_pdf_bytes_base64 text/)
  assert.match(migration, /agreed_document jsonb/)
  const baseMigration = readFileSync(
    new URL('../supabase/migrations/20261111220000_proposal_payments.sql', import.meta.url),
    'utf8',
  )
  assert.match(baseMigration, /proposal_acceptances rows are immutable/)
  assert.match(migration, /create table if not exists public\.proposal_emails/)
  assert.match(migration, /unique \(payment_id, kind\)/)
})

test('AC-14 fixture: Studio loosens legal name only and keeps signer/payment/scope validations', () => {
  const proposalSchema = readFileSync(
    new URL('../sanity/schemas/documents/proposal.ts', import.meta.url),
    'utf8',
  )
  const sectionsSchema = readFileSync(
    new URL('../sanity/schemas/objects/proposalSections.ts', import.meta.url),
    'utf8',
  )
  const packageSchema = readFileSync(
    new URL('../sanity/schemas/documents/proposalPackage.ts', import.meta.url),
    'utf8',
  )
  const addOnSchema = readFileSync(
    new URL('../sanity/schemas/documents/proposalAddOn.ts', import.meta.url),
    'utf8',
  )
  assert.match(proposalSchema, /name: 'clientLegalName'[\s\S]*Optional prefill/)
  assert.doesNotMatch(
    proposalSchema.match(/name: 'clientLegalName'[\s\S]*?defineField/)?.[0] ?? '',
    /required\(\)/,
  )
  assert.match(proposalSchema, /Add signer email before setting this proposal to sent/)
  assert.match(proposalSchema, /name: 'paymentSchedule'[\s\S]*required\(\)/)
  assert.match(sectionsSchema, /name: 'effectPhrase'[\s\S]*max\(80\)/)
  assert.match(packageSchema, /name: 'scope'[\s\S]*required\(\)\.min\(1\)/)
  assert.match(addOnSchema, /name: 'scope'[\s\S]*required\(\)\.min\(1\)/)
})

test('AC-12 fixtures: signing fields reject missing or invalid frozen signer details', () => {
  assert.equal(validateSigningFields(form()).ok, true)
  assert.equal(validateSigningFields(form({signerName: 'A'})).ok, false)
  assert.equal(validateSigningFields(form({legalName: ''})).ok, false)
  assert.equal(validateSigningFields(form({address: '100 Test Street'})).ok, false)
  assert.equal(validateSigningFields(form({email: 'not-an-email'})).ok, false)
})

test('AC-13/AC-3 fixture: v3 hash covers final SOW content and ignores only the record-hash line', () => {
  const base = acceptance().agreed_document
  assert.ok(base)
  const withIp = {
    ...base,
    sow: {
      blocks: [
        {kind: 'paragraph' as const, text: 'Record hash: user-authored clause, not generated'},
        ...base.sow.blocks.map((block) =>
          block.kind === 'paragraph' && block.text.startsWith('Record hash: ')
            ? {kind: 'paragraph' as const, text: 'IP address: 203.0.113.10'}
            : block,
        ),
      ],
    },
  }
  const hash = acceptanceDocumentHash(withIp)
  const withRecordHash = {
    ...withIp,
    sow: {
      blocks: [...withIp.sow.blocks, {kind: 'paragraph' as const, text: `Record hash: ${hash}`}],
    },
  }
  const changedScope = {
    ...withRecordHash,
    sow: {
      blocks: withRecordHash.sow.blocks.map((block, index) =>
        index === 0 ? {...block, text: `${block.text} changed`} : block,
      ),
    },
  }
  assert.equal(acceptanceDocumentHash(withRecordHash), hash)
  assert.notEqual(acceptanceDocumentHash(changedScope), hash)
  assert.notEqual(
    acceptanceDocumentHash({
      ...withRecordHash,
      sow: {
        blocks: withRecordHash.sow.blocks.map((block) =>
          block.text === 'Record hash: user-authored clause, not generated'
            ? {...block, text: 'Record hash: edited user-authored clause'}
            : block,
        ),
      },
    }),
    hash,
  )
})

test('AC-6/AC-1/AC-5 fixtures: test mode sends one signer packet with SOW, MSA, and receipt link', async () => {
  const emails = installStore()
  const sent: ProposalEmailSend[] = []
  const sender = async (message: ProposalEmailSend) => {
    sent.push(message)
    return {id: `resend-${sent.length}`}
  }

  await sendPaidProposalEmails({
    payment: payment(),
    acceptance: acceptance(),
    liveMode: false,
    sender,
  })
  await sendPaidProposalEmails({
    payment: payment(),
    acceptance: acceptance(),
    liveMode: false,
    sender,
  })

  const signerMessages = sent.filter((message) => message.idempotencyKey.startsWith('signed-docs/'))
  assert.equal(signerMessages.length, 1)
  assert.equal(signerMessages[0]?.to, 'proposal-test@example.test')
  assert.match(signerMessages[0]?.subject ?? '', /^\[TEST\]/)
  assert.equal(signerMessages[0]?.from, 'Salt Studio <hello@createdbysalt.com>')
  assert.equal(signerMessages[0]?.replyTo, 'hello@createdbysalt.com')
  assert.equal(signerMessages[0]?.attachments?.length, 2)
  assert.ok(signerMessages[0]?.html.includes('https://pay.stripe.com/receipts/test-fixture'))
  assert.ok(!signerMessages[0]?.attachments?.some((item) => /invoice/i.test(item.filename)))
  assert.equal(emails.filter((row) => row.kind === 'signed_docs').length, 1)
})

test('AC-4b/AC-2 fixtures: missing MSA PDF skips client packet and still notifies the studio inbox', async () => {
  installStore()
  const sent: ProposalEmailSend[] = []
  const missing = acceptance({
    id: 'acc_msa-body-no-pdf',
    proposal_id: proposalV3FixtureIds.msaBodyNoPdf,
    msa_pdf_sha256: null,
    msa_pdf_bytes_base64: null,
    msa_pdf_filename: null,
    msa_pdf_content_type: null,
    msa_pdf_missing_reason: 'missing_pdf_asset',
  })

  const results = await sendPaidProposalEmails({
    payment: payment({id: 'pay_msa-body-no-pdf', acceptance_id: missing.id}),
    acceptance: missing,
    liveMode: false,
    sender: async (message) => {
      sent.push(message)
      return {id: `resend-${sent.length}`}
    },
  })

  assert.deepEqual(
    results.find((item) => item.kind === 'signed_docs'),
    {kind: 'signed_docs', status: 'skipped', reason: 'missing_pdf_asset'},
  )
  assert.equal(sent.length, 1)
  assert.equal(sent[0]?.to, 'proposal-test@example.test')
  assert.match(sent[0]?.text, /MSA PDF missing at signing/)
})

test('AC-7 fixture: forced send failure leaves the row pending and a retry sends once', async () => {
  installStore()
  const sent: ProposalEmailSend[] = []
  const first = await sendPaidProposalEmails({
    payment: payment({id: 'pay_forced_failure'}),
    acceptance: acceptance({id: 'acc_forced_failure'}),
    liveMode: false,
    forceSendFailure: true,
    sender: async (message) => {
      sent.push(message)
      return {id: `resend-${sent.length}`}
    },
  })
  assert.equal(
    first.some((item) => item.status === 'pending'),
    true,
  )
  assert.equal(sent.length, 0)

  const second = await sendPaidProposalEmails({
    payment: payment({id: 'pay_forced_failure'}),
    acceptance: acceptance({id: 'acc_forced_failure'}),
    liveMode: false,
    sender: async (message) => {
      sent.push(message)
      return {id: `resend-${sent.length}`}
    },
  })
  assert.equal(
    second.some((item) => item.status === 'sent'),
    true,
  )
  assert.equal(
    sent.filter((message) => message.idempotencyKey.startsWith('signed-docs/')).length,
    1,
  )
})

test('AC-8 fixture: preview token suppresses all proposal emails', async () => {
  installStore()
  const sent: ProposalEmailSend[] = []
  const results = await sendPaidProposalEmails({
    payment: payment({proposal_id: 'preview'}),
    acceptance: acceptance({proposal_id: 'preview'}),
    liveMode: false,
    sender: async (message) => {
      sent.push(message)
      return {id: 'resend-id'}
    },
  })
  assert.equal(sent.length, 0)
  assert.equal(
    results.every((item) => item.status === 'skipped'),
    true,
  )
})

test('AC-9 fixtures: pre-ship rows send only on hash match with a current PDF', async () => {
  installStore()
  const sent: ProposalEmailSend[] = []
  const legacy = acceptance({
    id: proposalV3FixtureIds.preShipMatchWithPdf,
    agreed_document: null,
    msa_pdf_sha256: null,
    msa_pdf_bytes_base64: null,
  })
  await sendPaidProposalEmails({
    payment: payment({id: 'pay_pre_ship_match', acceptance_id: legacy.id}),
    acceptance: legacy,
    liveMode: false,
    legacyResolver: async () => ({
      kind: 'send',
      msaPdf: {status: 'frozen', ...proposalV3FixturePdf},
      scopeBlocks: [{kind: 'paragraph', text: 'Verified legacy package scope.'}],
      note: 'Pre-v3 acceptance: PDF, legal name, and mailing address were not in the original fingerprint.',
    }),
    sender: async (message) => {
      sent.push(message)
      return {id: `resend-${sent.length}`}
    },
  })
  assert.equal(
    sent.filter((message) => message.idempotencyKey.startsWith('signed-docs/')).length,
    1,
  )
  assert.match(
    sent.find((message) => message.idempotencyKey.startsWith('signed-paid-notice/'))?.text ?? '',
    /not in the original fingerprint/,
  )

  sent.length = 0
  installStore()
  await sendPaidProposalEmails({
    payment: payment({id: 'pay_pre_ship_mismatch'}),
    acceptance: acceptance({
      id: proposalV3FixtureIds.preShipMismatch,
      agreed_document: null,
      msa_pdf_sha256: null,
      msa_pdf_bytes_base64: null,
    }),
    liveMode: false,
    legacyResolver: async () => ({
      kind: 'skip',
      reason: 'legacy_hash_mismatch',
      note: 'Pre-v3 acceptance hash no longer matches the current Sanity MSA version/body.',
    }),
    sender: async (message) => {
      sent.push(message)
      return {id: `resend-${sent.length}`}
    },
  })
  assert.equal(
    sent.filter((message) => message.idempotencyKey.startsWith('signed-docs/')).length,
    0,
  )
  assert.match(sent[0]?.text ?? '', /hash no longer matches/)

  sent.length = 0
  installStore()
  await sendPaidProposalEmails({
    payment: payment({id: 'pay_pre_ship_no_pdf'}),
    acceptance: acceptance({
      id: proposalV3FixtureIds.preShipNoPdf,
      agreed_document: null,
      msa_pdf_sha256: null,
      msa_pdf_bytes_base64: null,
    }),
    liveMode: false,
    legacyResolver: async () => ({
      kind: 'skip',
      reason: 'missing_pdf_asset',
      note: 'Pre-v3 acceptance matched the current text, but no MSA PDF is available.',
    }),
    sender: async (message) => {
      sent.push(message)
      return {id: `resend-${sent.length}`}
    },
  })
  assert.equal(
    sent.filter((message) => message.idempotencyKey.startsWith('signed-docs/')).length,
    0,
  )
  assert.match(sent[0]?.text ?? '', /no MSA PDF/)
})

const MONTHLY_LINE =
  "Billed monthly: Monthly notes, $500 a month. Plan two, $2,000 a month. Not part of the total or today's payment."

test('monthly add-ons are listed apart from the total in the signer email and the studio notice', async () => {
  installStore()
  const sent: ProposalEmailSend[] = []
  const base = acceptance()
  assert.ok(base.agreed_document)
  const row = acceptance({
    total_cents: 570_000,
    first_cents: 285_000,
    steps: [
      {key: 's1', percent: 50, trigger: 'On signing', amountCents: 285_000},
      {key: 's2', percent: 50, trigger: 'When the work is accepted', amountCents: 285_000},
    ],
    agreed_document: {
      ...base.agreed_document,
      proposal: {
        ...base.agreed_document.proposal,
        addonNames: ['Video edits', 'Monthly notes', 'Plan two'],
      },
      quote: {
        ...base.agreed_document.quote,
        totalCents: 570_000,
        firstCents: 285_000,
        steps: [
          {key: 's1', percent: 50, trigger: 'On signing', amountCents: 285_000},
          {key: 's2', percent: 50, trigger: 'When the work is accepted', amountCents: 285_000},
        ],
        monthly: [
          {id: 'addon-notes', name: 'Monthly notes', amountCents: 50_000},
          {id: 'addon-plan-two', name: 'Plan two', amountCents: 200_000},
        ],
      },
    },
  })

  await sendPaidProposalEmails({
    payment: payment({id: 'pay_monthly', amount_cents: 285_000}),
    acceptance: row,
    liveMode: false,
    sender: async (message) => {
      sent.push(message)
      return {id: `resend-${sent.length}`}
    },
  })

  const signer = sent.find((message) => message.idempotencyKey.startsWith('signed-docs/'))
  const studio = sent.find((message) => message.idempotencyKey.startsWith('signed-paid-notice/'))
  assert.ok(signer && studio)
  assert.match(signer.html, /Total \$5,700/)
  assert.match(signer.html, /\$2,850/)
  assert.match(signer.text, /TOTAL \$5,700/)
  assert.ok(signer.html.includes(MONTHLY_LINE))
  assert.ok(signer.text.includes(MONTHLY_LINE))
  assert.equal(signer.html.includes('$8,200'), false)
  assert.equal(/monthly was charged|charged monthly/i.test(signer.html), false)
  assert.equal(/monthly was charged|charged monthly/i.test(signer.text), false)
  assert.equal(/monthly was charged|charged monthly/i.test(studio.text), false)
  assert.equal(MONTHLY_LINE.includes('charged'), false)
  assert.ok(studio.text.includes('Paid today'))
  assert.ok(studio.text.includes('$2,850'))
  assert.ok(studio.text.includes('Monthly notes'))
  assert.ok(studio.text.includes('$500 a month'))
  assert.ok(studio.text.includes('Plan two'))
  assert.ok(studio.text.includes('$2,000 a month'))
  assert.ok(studio.text.includes("Not part of the total or today's payment."))
  assert.ok(studio.html.includes('Monthly notes'))
  assert.ok(studio.html.includes('$500 a month'))
  assert.ok(studio.html.includes("Not part of the total or today's payment."))
  assert.equal(studio.subject, '[TEST] Signed and paid proposal')
  assert.equal(studio.to, 'proposal-test@example.test')
})

test('the statement pdf migration only adds nullable columns', () => {
  const migration = readFileSync(
    new URL(
      '../supabase/migrations/20261123120000_proposal_acceptance_sow_pdf.sql',
      import.meta.url,
    ),
    'utf8',
  )
  assert.match(migration, /add column if not exists sow_pdf_bytes_base64 text/)
  assert.match(migration, /add column if not exists sow_pdf_sha256 text/)
  assert.equal(/not null/i.test(migration), false)
  const actions = readFileSync(
    new URL('../app/(proposal)/p/[token]/actions.ts', import.meta.url),
    'utf8',
  )
  assert.match(actions, /signedSowPdfColumns\(agreedDocument\.sow\.blocks\)/)
})

function pricedAcceptance(frozenAddOns: boolean): AcceptanceRow {
  const base = acceptance()
  if (!base.agreed_document) throw new Error('fixture document missing')
  const addonNames = ['Video edits', 'Copy pass', 'Care plan']
  return acceptance({
    id: frozenAddOns ? 'acc_priced' : 'acc_legacy_names',
    signer_legal_name: 'Harbor Legal LLC',
    signer_name: 'Jordan Hale',
    signer_email: 'jordan.hale@example.test',
    client_name: 'Harbor',
    package_name: 'Brand and website',
    same_day_percent: 10,
    total_cents: 547_000,
    first_cents: 273_500,
    kickoff_date: '2026-12-08',
    steps: [
      {key: 's1', percent: 50, trigger: 'On signing', amountCents: 273_500},
      {key: 's2', percent: 50, trigger: 'When the work is accepted', amountCents: 273_500},
    ],
    agreed_document: {
      ...base.agreed_document,
      signer: {
        ...base.agreed_document.signer,
        fullName: 'Jordan Hale',
        legalName: 'Harbor Legal LLC',
        email: 'jordan.hale@example.test',
      },
      proposal: {
        ...base.agreed_document.proposal,
        clientName: 'Harbor',
        packageName: 'Brand and website',
        addonNames,
        ...(frozenAddOns
          ? {
              addons: [
                {id: 'addon-video', name: 'Video edits', amountCents: 90_000},
                {id: 'addon-copy', name: 'Copy pass', amountCents: 25_000},
              ],
            }
          : {}),
        kickoffDate: '2026-12-08',
      },
      quote: {
        ...base.agreed_document.quote,
        totalCents: 547_000,
        firstCents: 273_500,
        packageAmountCents: 480_000,
        packageDueCents: 432_000,
        sameDayPercent: 10,
        steps: [
          {key: 's1', percent: 50, trigger: 'On signing', amountCents: 273_500},
          {key: 's2', percent: 50, trigger: 'When the work is accepted', amountCents: 273_500},
        ],
        monthly: [{id: 'addon-care', name: 'Care plan', amountCents: 40_000}],
      },
    },
  })
}

async function captureEmails(row: AcceptanceRow, paymentId: string, liveMode: boolean) {
  const sent: ProposalEmailSend[] = []
  await sendPaidProposalEmails({
    payment: payment({
      id: paymentId,
      acceptance_id: row.id,
      proposal_id: row.proposal_id,
      amount_cents: 273_500,
    }),
    acceptance: row,
    liveMode,
    sender: async (message) => {
      sent.push(message)
      return {id: `resend-${sent.length}`}
    },
  })
  const signer = sent.find((message) => message.idempotencyKey.startsWith('signed-docs/'))
  const studio = sent.find((message) => message.idempotencyKey.startsWith('signed-paid-notice/'))
  assert.ok(signer && studio)
  return {signer, studio}
}

test('the studio email names the deal, prices frozen add-ons, and attaches both documents', async () => {
  installStore()
  const row = pricedAcceptance(true)
  const {signer, studio} = await captureEmails(row, 'pay_priced', false)
  assert.equal(studio.to, 'proposal-test@example.test')
  assert.equal(studio.subject, '[TEST] Signed and paid proposal')
  assert.equal(studio.from, 'Salt Studio <hello@createdbysalt.com>')
  assert.equal(studio.replyTo, 'hello@createdbysalt.com')
  for (const body of [studio.html, studio.text]) {
    assert.ok(body.includes('Harbor Legal LLC'))
    assert.ok(body.includes('Jordan Hale'))
    assert.ok(body.includes('jordan.hale@example.test'))
    assert.ok(body.includes('Brand and website'))
    assert.ok(body.includes('$4,320'))
    assert.ok(body.includes('Same-day saving of $480, 10% off the package.'))
    assert.ok(body.includes('Video edits'))
    assert.ok(body.includes('$900'))
    assert.ok(body.includes('Copy pass'))
    assert.ok(body.includes('$250'))
    assert.ok(body.includes('$5,470'))
    assert.ok(body.includes('Paid today'))
    assert.ok(body.includes('$2,735'))
    assert.ok(body.includes('Due later'))
    assert.ok(body.includes('Care plan'))
    assert.ok(body.includes('$400 a month'))
    assert.ok(body.includes("Not part of the total or today's payment."))
    assert.ok(body.includes('December 8, 2026'))
    assert.ok(body.includes('https://dashboard.stripe.com/test/payments/pi_test_fixture'))
    assert.ok(body.includes(row.proposal_id))
    assert.ok(body.includes(row.id))
    assert.equal(body.includes('\u2014'), false)
    assert.equal(body.includes('Selection:'), false)
  }
  assert.ok(studio.html.includes('50%, when the work is accepted'))
  assert.equal(studio.html.includes('When the work is accepted'), false)
  assert.ok(studio.text.includes('When the work is accepted'))
  assert.equal(studio.attachments?.length, 2)
  assert.equal(signer.attachments?.length, 2)
  assert.equal(studio.attachments?.[0]?.content, signer.attachments?.[0]?.content)
  assert.equal(studio.attachments?.[1]?.content, signer.attachments?.[1]?.content)
  assert.equal(studio.attachments?.[0]?.filename, 'Salt-Studio-Signed-Statement-of-Work.pdf')

  installStore()
  const live = await captureEmails(pricedAcceptance(true), 'pay_priced_live', true)
  assert.equal(live.studio.to, 'contact@example.test')
  assert.equal(live.studio.subject, 'Signed and paid proposal')
})

test('an older acceptance lists add-on names without prices', async () => {
  installStore()
  const {studio} = await captureEmails(pricedAcceptance(false), 'pay_names_only', false)
  assert.ok(studio.html.includes('Video edits'))
  assert.ok(studio.html.includes('Copy pass'))
  assert.ok(studio.text.includes('Video edits'))
  assert.ok(studio.text.includes('Copy pass'))
  assert.equal(studio.html.includes('$900'), false)
  assert.equal(studio.html.includes('$250'), false)
  assert.equal(studio.text.includes('$900'), false)
  assert.equal(studio.text.includes('$250'), false)
  assert.ok(studio.html.includes('Care plan'))
  assert.ok(studio.html.includes('$400 a month'))
  assert.ok(studio.html.includes('$4,320'))
  assert.ok(studio.text.includes('December 8, 2026'))
})

test('saved statement bytes are the attachment, and older rows are rebuilt', async () => {
  const savedBytes = new TextEncoder().encode('%PDF-1.4\n% saved sow fixture\n%%EOF\n')
  const savedBase64 = Buffer.from(savedBytes).toString('base64')
  const savedHash = sha256Bytes(savedBytes)

  installStore()
  const saved = acceptance({
    sow_pdf_bytes_base64: savedBase64,
    sow_pdf_sha256: savedHash,
  })
  const savedMail = await captureEmails(saved, 'pay_saved_sow', false)
  for (const message of [savedMail.signer, savedMail.studio]) {
    const sow = message.attachments?.[0]
    assert.equal(sow?.content, savedBase64)
    assert.equal(sha256Bytes(bytesFromBase64(sow?.content ?? '')), savedHash)
  }

  installStore()
  const older = acceptance()
  assert.equal(older.sow_pdf_bytes_base64, null)
  assert.ok(older.agreed_document)
  const rebuilt = Buffer.from(buildProposalPdf(older.agreed_document.sow.blocks)).toString('base64')
  const olderMail = await captureEmails(older, 'pay_rebuilt_sow', false)
  assert.notEqual(rebuilt, savedBase64)
  for (const message of [olderMail.signer, olderMail.studio]) {
    assert.equal(message.attachments?.[0]?.content, rebuilt)
  }

  installStore()
  const mismatched = acceptance({
    sow_pdf_bytes_base64: savedBase64,
    sow_pdf_sha256: '0'.repeat(64),
  })
  const mismatchedMail = await captureEmails(mismatched, 'pay_mismatched_sow', false)
  assert.equal(mismatchedMail.signer.attachments?.[0]?.content, rebuilt)
  assert.equal(mismatchedMail.studio.attachments?.[0]?.content, rebuilt)
})

const SIGNING_INSTANT = '2026-11-23T11:24:00.000Z'
const SIGNING_LABEL = 'November 23, 2026 at 3:24 AM PST'

test('a signing instant prints in Pacific time on the email and the statement', async () => {
  assert.equal(formatSigningTime(SIGNING_INSTANT), SIGNING_LABEL)
  assert.equal(formatSigningTime('2026-07-23T10:24:00.000Z'), 'July 23, 2026 at 3:24 AM PDT')

  const blocks = signedSowBlocks({
    proposal: {sections: []},
    pkg: {name: 'Foundation', scope: [], includedItems: []},
    addOns: [],
    selection: {packageId: 'pkg-fixture', addonIds: [], kickoffDate: '2026-12-01'},
    signerName: proposalV3FixtureSigner.fullName,
    signerLegalName: proposalV3FixtureSigner.legalName,
    signerAddress: {
      formatted: proposalV3FixtureSigner.address,
      lines: proposalV3FixtureSigner.address.split('\n'),
    },
    signerEmail: proposalV3FixtureSigner.email,
    acceptedAt: SIGNING_INSTANT,
    quote: {
      packageId: 'pkg-fixture',
      packageAmountCents: 100_000,
      packageDueCents: 100_000,
      percent: null,
      addOns: [],
      monthly: [],
      monthlyCents: 0,
      totalCents: 100_000,
      steps: [{key: 'full', percent: 100, trigger: 'On signing', amountCents: 100_000}],
      scheduleName: 'Full payment',
      firstCents: 100_000,
    },
    msaVersion: 'fixture-v1',
    msaPdf: null,
    agreedHash: null,
    ip: '203.0.113.10',
  })
  const accepted = blocks.find(
    (block) => block.kind === 'paragraph' && block.text.startsWith('Accepted at:'),
  )
  assert.ok(accepted && accepted.kind === 'paragraph')
  assert.equal(accepted.text, `Accepted at: ${SIGNING_LABEL}`)

  installStore()
  const sent: ProposalEmailSend[] = []
  const base = acceptance()
  assert.ok(base.agreed_document)
  await sendPaidProposalEmails({
    payment: payment({id: 'pay_pacific_time', acceptance_id: 'acc_pacific_time'}),
    acceptance: acceptance({
      id: 'acc_pacific_time',
      created_at: SIGNING_INSTANT,
      agreed_document: {
        ...base.agreed_document,
        signer: {...base.agreed_document.signer, acceptedAt: SIGNING_INSTANT},
      },
    }),
    liveMode: false,
    sender: async (message) => {
      sent.push(message)
      return {id: `resend-${sent.length}`}
    },
  })

  const signer = sent.find((message) => message.idempotencyKey.startsWith('signed-docs/'))
  assert.ok(signer)
  assert.match(signer.text, /Accepted: November 23, 2026 at 3:24 AM PST/)
  assert.match(signer.html, /November 23, 2026 at 3:24 AM PST/)
  assert.equal(signer.text.includes('11:24 AM'), false)
})

test('a stored statement keeps its UTC accepted line when the record hash is checked', () => {
  const base = acceptance().agreed_document
  assert.ok(base)
  const utcLine = 'Accepted at: November 23, 2026 at 11:24 AM'
  const stored = {
    ...base,
    signer: {...base.signer, acceptedAt: SIGNING_INSTANT},
    sow: {
      blocks: [
        ...base.sow.blocks.filter(
          (block) => !(block.kind === 'paragraph' && block.text.startsWith('Record hash: ')),
        ),
        {kind: 'paragraph' as const, text: utcLine},
      ],
    },
  }
  const hash = acceptanceDocumentHash(stored)
  assert.equal(
    stored.sow.blocks.find((block) => block.text.startsWith('Accepted at:'))?.text,
    utcLine,
  )
  assert.equal(acceptanceDocumentHash(stored), hash)
  const reformatted = {
    ...stored,
    sow: {
      blocks: stored.sow.blocks.map((block) =>
        block.text === utcLine ? {...block, text: `Accepted at: ${SIGNING_LABEL}`} : block,
      ),
    },
  }
  assert.notEqual(acceptanceDocumentHash(reformatted), hash)
})
