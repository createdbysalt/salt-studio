import 'server-only'
import {
  claimProposalEmail,
  ensureProposalEmail,
  findAcceptanceById,
  findPaymentById,
  markProposalEmailFailed,
  markProposalEmailSent,
  pendingProposalEmails,
  updatePayment,
  type AcceptanceRow,
  type PaymentRow,
  type ProposalEmailKind,
} from '@/lib/proposal/acceptances'
import {agreedTextFor} from '@/lib/proposal/agreementText'
import {buildProposalPdf, type PdfBlock} from '@/lib/proposal/documentPdf'
import {bytesFromBase64, sha256Bytes, type FrozenMsaPdf} from '@/lib/proposal/frozenDocument'
import {freezeMsaPdf} from '@/lib/proposal/msaPdf'
import {formatCents} from '@/lib/proposal/quote'
import {client} from '@/sanity/lib/client'
import {proposalByIdForLegacyAcceptanceQuery} from '@/sanity/lib/queries'
import {token} from '@/sanity/lib/token'

export type ProposalEmailSend = {
  from: string
  to: string
  replyTo: string
  subject: string
  text: string
  html: string
  idempotencyKey: string
  attachments?: Array<{filename: string; content: string; contentType: string}>
}

export type ProposalEmailSender = (message: ProposalEmailSend) => Promise<{id: string | null}>

export type PaidEmailResult = {
  kind: ProposalEmailKind
  status: 'sent' | 'skipped' | 'pending' | 'already_sent'
  reason?: string
}

type LegacyPacket =
  | {
      kind: 'send'
      msaPdf: Extract<FrozenMsaPdf, {status: 'frozen'}>
      note: string
      scopeBlocks: PdfBlock[]
    }
  | {kind: 'skip'; reason: string; note: string}

type EmailConfig = {
  apiKey: string
  from: string
  replyTo: string
  testTo: string | null
  contactEmail: string | null
}

type LegacyProposal = {
  sections?: Array<{_type: string; body?: unknown}> | null
}

type LegacyPackage = {
  name?: string | null
  scope?: unknown
  includedItems?: Array<string | null> | null
}

type LegacyAddOn = {
  name?: string | null
  line?: string | null
  scope?: unknown
}

const HELLO = 'hello@createdbysalt.com'

function emailConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) return null
  return {
    apiKey,
    from: `Salt Studio <${HELLO}>`,
    replyTo: HELLO,
    testTo: process.env.PROPOSAL_EMAIL_TEST_TO || null,
    contactEmail: process.env.CONTACT_EMAIL || null,
  }
}

export function makeResendSender(config = emailConfig()): ProposalEmailSender | null {
  if (!config) return null
  return async (message) => {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': message.idempotencyKey,
      },
      body: JSON.stringify({
        from: message.from,
        to: message.to,
        reply_to: message.replyTo,
        subject: message.subject,
        text: message.text,
        html: message.html,
        attachments: message.attachments,
      }),
    })
    if (!response.ok) throw new Error(`resend_${response.status}`)
    const body = (await response.json()) as {id?: string}
    return {id: body.id ?? null}
  }
}

function receiptUrl(payment: PaymentRow, override: string | null | undefined) {
  return override || payment.stripe_receipt_url || null
}

function stripePaymentLink(payment: PaymentRow, liveMode: boolean) {
  if (payment.stripe_payment_intent_id) {
    const mode = liveMode ? '' : '/test'
    return `https://dashboard.stripe.com${mode}/payments/${payment.stripe_payment_intent_id}`
  }
  if (payment.stripe_checkout_session_id) {
    const mode = liveMode ? '' : '/test'
    return `https://dashboard.stripe.com${mode}/checkout/sessions/${payment.stripe_checkout_session_id}`
  }
  return null
}

function isPreviewAcceptance(acceptance: AcceptanceRow) {
  return acceptance.proposal_id === 'preview'
}

function subject(base: string, liveMode: boolean) {
  return liveMode ? base : `[TEST] ${base}`
}

function signerRecipient(acceptance: AcceptanceRow, config: EmailConfig, liveMode: boolean) {
  if (!liveMode) return config.testTo
  return acceptance.signer_email
}

function studioRecipient(config: EmailConfig, liveMode: boolean) {
  if (!liveMode) return config.testTo
  return config.contactEmail
}

function hasFrozenMsa(acceptance: AcceptanceRow) {
  return acceptance.msa_pdf_sha256 && acceptance.msa_pdf_bytes_base64
}

function signedDocsAttachments(
  acceptance: AcceptanceRow,
  payment: PaymentRow,
  msaPdf: Extract<FrozenMsaPdf, {status: 'frozen'}>,
  paymentReceiptUrl: string,
  legacyScopeBlocks: PdfBlock[] | null,
) {
  const blocks =
    acceptance.agreed_document?.sow.blocks ??
    preShipSowBlocks(acceptance, payment, paymentReceiptUrl, legacyScopeBlocks)
  const sowPdf = buildProposalPdf(blocks)
  return [
    {
      filename: 'Salt-Studio-Signed-Statement-of-Work.pdf',
      content: Buffer.from(sowPdf).toString('base64'),
      contentType: 'application/pdf',
    },
    {
      filename: msaPdf.filename,
      content: msaPdf.bytesBase64,
      contentType: msaPdf.contentType,
    },
  ]
}

function preShipSowBlocks(
  acceptance: AcceptanceRow,
  payment: PaymentRow,
  paymentReceiptUrl: string,
  legacyScopeBlocks: PdfBlock[] | null,
) {
  return [
    {kind: 'kicker' as const, text: 'Salt Studio'},
    {kind: 'title' as const, text: 'Signed Statement of Work'},
    {
      kind: 'note' as const,
      text: 'Pre-v3 acceptance: legal name and mailing address were not captured.',
    },
    {kind: 'heading' as const, text: 'Accepted selection'},
    {
      kind: 'paragraph' as const,
      text: `Package: ${acceptance.package_name ?? acceptance.package_id}`,
    },
    ...acceptance.addon_ids.map((id) => ({kind: 'bullet' as const, marker: '•', text: id})),
    ...(legacyScopeBlocks ?? []),
    {kind: 'heading' as const, text: 'Fees and payment steps'},
    {kind: 'paragraph' as const, text: `Total fee: ${formatCents(acceptance.total_cents)}.`},
    {kind: 'paragraph' as const, text: `Payment made now: ${formatCents(payment.amount_cents)}.`},
    ...acceptance.steps.map((step) => ({
      kind: 'bullet' as const,
      marker: '•',
      text: `${step.percent}% (${formatCents(step.amountCents)}) — ${step.trigger}`,
    })),
    {kind: 'heading' as const, text: 'Receipt'},
    {kind: 'paragraph' as const, text: paymentReceiptUrl},
    {kind: 'heading' as const, text: 'Acceptance block'},
    {kind: 'paragraph' as const, text: `Accepted by: ${acceptance.signer_name}`},
    {kind: 'paragraph' as const, text: `Email: ${acceptance.signer_email}`},
    {kind: 'paragraph' as const, text: `Accepted at: ${acceptance.created_at}`},
    {kind: 'paragraph' as const, text: `IP address: ${acceptance.ip ?? 'Not recorded'}`},
    {kind: 'paragraph' as const, text: `MSA version: ${acceptance.msa_version ?? 'Not recorded'}`},
    {kind: 'paragraph' as const, text: `Record hash: ${acceptance.agreed_text_sha256}`},
  ]
}

function signerMessage(input: {
  acceptance: AcceptanceRow
  payment: PaymentRow
  msaPdf: Extract<FrozenMsaPdf, {status: 'frozen'}>
  paymentReceiptUrl: string
  legacyScopeBlocks: PdfBlock[] | null
  to: string
  config: EmailConfig
  liveMode: boolean
}) {
  const legalName = input.acceptance.signer_legal_name
  const address = input.acceptance.signer_address?.lines.join(', ')
  const cover = [
    legalName ? `Legal name: ${legalName}` : null,
    address ? `Address: ${address}` : null,
  ]
    .filter(Boolean)
    .join('\n')
  const text = [
    `Hi ${input.acceptance.signer_name},`,
    '',
    'Your first payment is marked paid. Attached are the signed Statement of Work and the Master Services Agreement PDF frozen at signing.',
    cover ? `\n${cover}` : '',
    '',
    `Stripe receipt: ${input.paymentReceiptUrl}`,
  ].join('\n')
  const html = `<p>Hi ${escapeHtml(input.acceptance.signer_name)},</p><p>Your first payment is marked paid. Attached are the signed Statement of Work and the Master Services Agreement PDF frozen at signing.</p>${
    cover ? `<pre>${escapeHtml(cover)}</pre>` : ''
  }<p>Stripe receipt: <a href="${escapeHtml(input.paymentReceiptUrl)}">${escapeHtml(
    input.paymentReceiptUrl,
  )}</a></p>`
  return {
    from: input.config.from,
    to: input.to,
    replyTo: input.config.replyTo,
    subject: subject('Your signed Salt Studio documents', input.liveMode),
    text,
    html,
    idempotencyKey: `signed-docs/${input.payment.id}`,
    attachments: signedDocsAttachments(
      input.acceptance,
      input.payment,
      input.msaPdf,
      input.paymentReceiptUrl,
      input.legacyScopeBlocks,
    ),
  }
}

function studioMessage(input: {
  acceptance: AcceptanceRow
  payment: PaymentRow
  to: string
  config: EmailConfig
  liveMode: boolean
  stripeLink: string | null
  note: string | null
}) {
  const lines = [
    'A proposal was signed and the first payment is marked paid.',
    '',
    `Proposal id: ${input.acceptance.proposal_id}`,
    `Acceptance id: ${input.acceptance.id}`,
    `Selection: ${input.acceptance.selection_key}`,
    `Amount: ${formatCents(input.payment.amount_cents)}`,
    `Stripe payment: ${input.stripeLink ?? 'Not available'}`,
    input.note ? `Note: ${input.note}` : null,
  ].filter(Boolean)
  const text = lines.join('\n')
  const html = `<p>A proposal was signed and the first payment is marked paid.</p><ul><li>Proposal id: ${escapeHtml(
    input.acceptance.proposal_id,
  )}</li><li>Acceptance id: ${escapeHtml(input.acceptance.id)}</li><li>Selection: ${escapeHtml(
    input.acceptance.selection_key,
  )}</li><li>Amount: ${escapeHtml(formatCents(input.payment.amount_cents))}</li><li>Stripe payment: ${
    input.stripeLink
      ? `<a href="${escapeHtml(input.stripeLink)}">${escapeHtml(input.stripeLink)}</a>`
      : 'Not available'
  }</li>${input.note ? `<li>Note: ${escapeHtml(input.note)}</li>` : ''}</ul>`
  return {
    from: input.config.from,
    to: input.to,
    replyTo: input.config.replyTo,
    subject: subject('Signed and paid proposal', input.liveMode),
    text,
    html,
    idempotencyKey: `signed-paid-notice/${input.payment.id}`,
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

async function legacyPacket(acceptance: AcceptanceRow): Promise<LegacyPacket> {
  const proposal = await client
    .withConfig({token, useCdn: false, stega: false})
    .fetch(proposalByIdForLegacyAcceptanceQuery, {id: acceptance.proposal_id})
  if (!proposal?._id) {
    return {kind: 'skip', reason: 'legacy_proposal_missing', note: 'Legacy proposal was not found.'}
  }
  const pkg = (proposal.packages ?? []).find((item) => item._id === acceptance.package_id)
  if (!pkg) {
    return {kind: 'skip', reason: 'legacy_package_missing', note: 'Legacy package was not found.'}
  }
  const addOns = (proposal.addOns ?? []).filter((item) => acceptance.addon_ids.includes(item._id))
  const currentHash = agreedTextFor(proposal, pkg, addOns)
  if (currentHash !== acceptance.agreed_text_sha256) {
    return {
      kind: 'skip',
      reason: 'legacy_hash_mismatch',
      note: 'Pre-v3 acceptance hash no longer matches the current Sanity MSA version/body.',
    }
  }
  const frozen = await freezeMsaPdf(proposal.msa?.pdfUrl)
  if (frozen.status !== 'frozen') {
    return {
      kind: 'skip',
      reason: frozen.reason,
      note: 'Pre-v3 acceptance matched the current text, but no MSA PDF is available.',
    }
  }
  return {
    kind: 'send',
    msaPdf: frozen,
    scopeBlocks: legacyScopeBlocks(proposal, pkg, addOns),
    note: 'Pre-v3 acceptance: PDF, legal name, and mailing address were not in the original fingerprint.',
  }
}

function legacyScopeBlocks(
  proposal: LegacyProposal,
  pkg: LegacyPackage,
  addOns: LegacyAddOn[],
): PdfBlock[] {
  const sow = (proposal.sections ?? []).find((section) => section._type === 'proposalSowSection')
  const standing = sow && 'body' in sow ? sow.body : null
  return [
    {kind: 'heading' as const, text: pkg.name ?? 'Package scope'},
    ...portableBlocksToLegacyPdf(pkg.scope),
    ...(pkg.includedItems ?? [])
      .filter((item): item is string => Boolean(item))
      .map((text) => ({kind: 'bullet' as const, marker: '•', text})),
    ...addOns.flatMap((addOn) => [
      {kind: 'heading' as const, text: addOn.name ?? 'Add-on scope'},
      ...portableBlocksToLegacyPdf(addOn.scope),
      ...(addOn.line ? [{kind: 'bullet' as const, marker: '•', text: addOn.line}] : []),
    ]),
    {kind: 'heading' as const, text: 'Standing terms'},
    ...portableBlocksToLegacyPdf(standing),
  ]
}

function portableBlocksToLegacyPdf(blocks: unknown): PdfBlock[] {
  if (!Array.isArray(blocks)) return []
  return blocks.flatMap((block): PdfBlock[] => {
    const item = block as {
      children?: Array<{text?: string}>
      style?: string
      listItem?: string
    }
    const text = (item.children ?? [])
      .map((child) => child.text ?? '')
      .join('')
      .trim()
    if (!text) return []
    if (item.listItem) return [{kind: 'bullet', marker: '•', text}]
    if (item.style && item.style !== 'normal') return [{kind: 'heading', text}]
    return [{kind: 'paragraph', text}]
  })
}

async function sendClaimedEmail(
  rowInput: {
    paymentId: string
    acceptanceId: string
    kind: ProposalEmailKind
    toEmail: string | null
    idempotencyKey: string
  },
  message: ProposalEmailSend | null,
  sender: ProposalEmailSender | null,
) {
  const row = await ensureProposalEmail(rowInput)
  if (row.status === 'sent') return {kind: row.kind, status: 'already_sent' as const}
  if (!message || !sender) {
    return {kind: row.kind, status: 'pending' as const, reason: 'message_not_ready'}
  }
  const claim = await claimProposalEmail(row.id)
  if (!claim) return {kind: row.kind, status: 'already_sent' as const}
  /**
   * The send and the record of it are separate failures.
   *
   * Recording was inside this try, so a database blip after the mail had gone
   * put the row back to pending. A later retry then sent the client a second
   * copy of their contract. Resend's idempotency key only covers a 24 hour
   * window, and nothing here runs on a schedule, so a retry days later would
   * have been a fresh send.
   *
   * Now only the send itself can mark the row for retry. If the mail went but
   * the write failed, the row stays claimed: it will not be sent again, and
   * the stale-claim sweep plus the log is how a human picks it up.
   */
  let sent: {id: string | null}
  try {
    sent = await sender(message)
  } catch (error) {
    await markProposalEmailFailed(claim.id, error instanceof Error ? error.message : 'send_failed')
    return {kind: claim.kind, status: 'pending' as const, reason: 'send_failed'}
  }
  await markProposalEmailSent(claim.id, sent.id).catch((error) => {
    console.error(
      `[proposal emails] ${claim.kind} for payment ${rowInput.paymentId} was sent but not recorded`,
      error,
    )
  })
  return {kind: claim.kind, status: 'sent' as const}
}

export async function sendPaidProposalEmails(input: {
  payment: PaymentRow
  acceptance: AcceptanceRow
  receiptUrl?: string | null
  liveMode: boolean
  forceSendFailure?: boolean
  sender?: ProposalEmailSender
  legacyResolver?: (acceptance: AcceptanceRow) => Promise<LegacyPacket>
}): Promise<PaidEmailResult[]> {
  if (isPreviewAcceptance(input.acceptance)) {
    return [
      {kind: 'signed_docs', status: 'skipped', reason: 'preview_token'},
      {kind: 'studio_notice', status: 'skipped', reason: 'preview_token'},
    ]
  }
  const config = emailConfig()
  const configuredSender = input.sender ?? makeResendSender(config)
  const sender: ProposalEmailSender | null = input.forceSendFailure
    ? async () => {
        throw new Error('forced_test_failure')
      }
    : (configuredSender ?? null)
  const paidReceiptUrl = receiptUrl(input.payment, input.receiptUrl)
  const studioTo = config ? studioRecipient(config, input.liveMode) : null
  const signerTo = config ? signerRecipient(input.acceptance, config, input.liveMode) : null
  const stripeLink = stripePaymentLink(input.payment, input.liveMode)

  let msaPdf: Extract<FrozenMsaPdf, {status: 'frozen'}> | null = null
  let legacyScope: PdfBlock[] | null = null
  let signerSkipReason: string | null = null
  let studioNote: string | null = null

  if (hasFrozenMsa(input.acceptance)) {
    const candidate: Extract<FrozenMsaPdf, {status: 'frozen'}> = {
      status: 'frozen',
      sha256: input.acceptance.msa_pdf_sha256 as string,
      bytesBase64: input.acceptance.msa_pdf_bytes_base64 as string,
      filename: input.acceptance.msa_pdf_filename ?? 'Master-Services-Agreement.pdf',
      contentType: input.acceptance.msa_pdf_content_type ?? 'application/pdf',
    }
    /**
     * Check the bytes against the hash that was stored with them.
     *
     * Freezing the bytes and the hash together is only worth anything if the
     * pair is verified before use. The previous code decoded the base64 and
     * threw the result away, which proves nothing: Buffer.from drops invalid
     * base64 characters silently rather than failing, so a truncated or
     * corrupted column would decode to something shorter and be attached to
     * the client's contract with nobody the wiser.
     *
     * On a mismatch the signer packet is held back and the studio is told,
     * rather than sending a document that cannot be shown to match what was
     * signed. The payment is already settled either way.
     */
    if (sha256Bytes(bytesFromBase64(candidate.bytesBase64)) === candidate.sha256) {
      msaPdf = candidate
    } else {
      signerSkipReason = 'msa_pdf_hash_mismatch'
      studioNote =
        'The stored agreement PDF does not match the hash recorded when it was signed, so the signer packet was not sent. The payment went through.'
    }
  } else if (input.acceptance.agreed_document) {
    signerSkipReason = input.acceptance.msa_pdf_missing_reason ?? 'missing_msa_pdf'
    studioNote = `MSA PDF missing at signing (${signerSkipReason}); signer packet was not sent.`
  } else {
    const legacy = await (input.legacyResolver ?? legacyPacket)(input.acceptance)
    if (legacy.kind === 'send') {
      msaPdf = legacy.msaPdf
      legacyScope = legacy.scopeBlocks
      studioNote = legacy.note
    } else {
      signerSkipReason = legacy.reason
      studioNote = legacy.note
    }
  }

  const results: PaidEmailResult[] = []
  const signerMessageReady =
    msaPdf && paidReceiptUrl && signerTo && config
      ? signerMessage({
          acceptance: input.acceptance,
          payment: input.payment,
          msaPdf,
          paymentReceiptUrl: paidReceiptUrl,
          legacyScopeBlocks: legacyScope,
          to: signerTo,
          config,
          liveMode: input.liveMode,
        })
      : null
  if (signerMessageReady) {
    results.push(
      await sendClaimedEmail(
        {
          paymentId: input.payment.id,
          acceptanceId: input.acceptance.id,
          kind: 'signed_docs',
          toEmail: signerTo,
          idempotencyKey: `signed-docs/${input.payment.id}`,
        },
        signerMessageReady,
        sender,
      ),
    )
  } else {
    const reason =
      signerSkipReason ??
      (!paidReceiptUrl
        ? 'missing_receipt_url'
        : !config
          ? 'email_not_configured'
          : 'missing_recipient')
    if (msaPdf && reason !== 'missing_recipient') {
      results.push(
        await sendClaimedEmail(
          {
            paymentId: input.payment.id,
            acceptanceId: input.acceptance.id,
            kind: 'signed_docs',
            toEmail: signerTo,
            idempotencyKey: `signed-docs/${input.payment.id}`,
          },
          null,
          sender,
        ),
      )
    } else {
      results.push({kind: 'signed_docs', status: 'skipped', reason})
    }
  }

  if (studioTo && config) {
    results.push(
      await sendClaimedEmail(
        {
          paymentId: input.payment.id,
          acceptanceId: input.acceptance.id,
          kind: 'studio_notice',
          toEmail: studioTo,
          idempotencyKey: `signed-paid-notice/${input.payment.id}`,
        },
        studioMessage({
          acceptance: input.acceptance,
          payment: input.payment,
          to: studioTo,
          config,
          liveMode: input.liveMode,
          stripeLink,
          note: studioNote,
        }),
        sender,
      ),
    )
  } else {
    results.push(
      await sendClaimedEmail(
        {
          paymentId: input.payment.id,
          acceptanceId: input.acceptance.id,
          kind: 'studio_notice',
          toEmail: studioTo,
          idempotencyKey: `signed-paid-notice/${input.payment.id}`,
        },
        null,
        sender,
      ),
    )
  }

  return results
}

export async function sendPaidProposalEmailsForPayment(input: {
  paymentId: string
  receiptUrl?: string | null
  liveMode: boolean
  forceSendFailure?: boolean
  receiptUrlResolver?: (payment: PaymentRow) => Promise<string | null>
}) {
  const payment = await findPaymentById(input.paymentId)
  if (!payment || payment.status !== 'paid') return []
  const refreshedReceipt =
    input.receiptUrl ??
    payment.stripe_receipt_url ??
    (input.receiptUrlResolver ? await input.receiptUrlResolver(payment) : null)
  if (refreshedReceipt && !payment.stripe_receipt_url) {
    await updatePayment(payment.id, {stripe_receipt_url: refreshedReceipt}).catch(() => undefined)
    payment.stripe_receipt_url = refreshedReceipt
  }
  const acceptance = await findAcceptanceById(payment.acceptance_id)
  if (!acceptance) return []
  return sendPaidProposalEmails({
    payment,
    acceptance,
    receiptUrl: refreshedReceipt,
    liveMode: input.liveMode,
    forceSendFailure: input.forceSendFailure,
  })
}

export async function retryPendingProposalEmails(input: {
  liveMode: boolean
  forceSendFailure?: boolean
  limit?: number
  receiptUrlResolver?: (payment: PaymentRow) => Promise<string | null>
}) {
  /**
   * Only rows that are already queued, never a sweep over paid payments.
   *
   * This used to also pull "paid payments with no studio_notice row", which
   * every payment taken before this feature shipped satisfies. The first
   * authenticated call would then have mailed signed documents to a batch of
   * past clients, months after the fact, for a payment they completed long
   * ago. A backfill is only safe deliberately and with a cutoff, so it is not
   * something the routine retry should do on its own.
   *
   * To re-send for one payment, pass its id to sendPaidProposalEmailsForPayment.
   */
  const rows = await pendingProposalEmails(input.limit)
  const paymentIds = Array.from(new Set(rows.map((row) => row.payment_id)))
  const results: Array<{paymentId: string; results: PaidEmailResult[]}> = []
  for (const paymentId of paymentIds) {
    results.push({
      paymentId,
      results: await sendPaidProposalEmailsForPayment({
        paymentId,
        liveMode: input.liveMode,
        forceSendFailure: input.forceSendFailure,
        receiptUrlResolver: input.receiptUrlResolver,
      }),
    })
  }
  return results
}
