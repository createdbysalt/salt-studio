import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import test from 'node:test'
import type {AcceptanceRow, PaymentRow, ProposalEmailRow} from '@/lib/proposal/acceptances'
import {acceptanceDocumentHash} from '@/lib/proposal/frozenDocument'
import {sendPaidProposalEmails, type ProposalEmailSend} from '@/lib/proposal/paidEmails'
import {validateSigningFields} from '@/lib/proposal/signingFields'
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
