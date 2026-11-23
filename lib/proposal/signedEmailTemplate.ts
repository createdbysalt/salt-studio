/**
 * The email a client gets once their first payment settles.
 *
 * Built to match the proposal page: ink on white, the mono eyebrow, the
 * same greys, one clear action. Laid out in tables with inline styles
 * because that is what mail clients render reliably, and in a system font
 * stack because Geist will not load in most of them.
 *
 * It is also the record of the agreement, so it states who agreed to what,
 * when, from where, which agreement version governed it, and the checksums
 * that prove the attachments are the documents that were signed.
 */

const INK = '#08090a'
const MUTED = '#5c5c5c'
const FAINT = '#8f8f8f'
const RULE = 'rgba(8,9,10,0.10)'
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"
const MONO = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace'

function row(label: string, value: string) {
  return `<tr>
      <td style="padding:0 0 2px 0;font-family:${MONO};font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:${FAINT};">${escapeHtml(label)}</td>
    </tr>
    <tr>
      <td style="padding:0 0 14px 0;font-family:${SANS};font-size:14px;line-height:20px;color:${INK};word-break:break-word;">${escapeHtml(value)}</td>
    </tr>`
}

export function signerEmailHtml(input: {
  greetingName: string
  clientLegalName: string
  packageName: string
  addOnNames: string[]
  totalLabel: string
  paidLabel: string
  steps: Array<{percent: number; amount: string; trigger: string}>
  acceptedAtLabel: string
  signerEmail: string
  signerIp: string | null
  msaVersion: string | null
  msaFilename: string | null
  msaSha256: string | null
  recordHash: string | null
  receiptUrl: string | null
  kickoffUrl: string | null
  addressLines: string[]
  sameDayPercent: number | null
  savedLabel: string | null
  /** Null when no monthly add-on was selected, so a one-time email is unchanged. */
  monthlyLabel: string | null
}) {
  const scope = [input.packageName, ...input.addOnNames].filter(Boolean)
  const scopeList = scope
    .map(
      (name) =>
        `<tr><td style="padding:0 0 6px 0;font-family:${SANS};font-size:14px;line-height:20px;color:${INK};">${escapeHtml(name)}</td></tr>`,
    )
    .join('')
  const stepList = input.steps
    .map(
      (step) =>
        `<tr><td style="padding:0 0 6px 0;font-family:${SANS};font-size:14px;line-height:20px;color:${INK};">${step.percent}% &nbsp;${escapeHtml(step.amount)} &nbsp;<span style="color:${MUTED};">${escapeHtml(step.trigger)}</span></td></tr>`,
    )
    .join('')

  /**
   * Nothing records whether they have booked yet. The calendar is embedded
   * from Cal.com with no hook back, so the honest wording is conditional,
   * the same way the proposal page already puts it.
   */
  const action = input.kickoffUrl
    ? `<tr><td style="padding:26px 0 0 0;font-family:${SANS};font-size:15px;line-height:23px;color:${MUTED};">
        If you have not booked the kickoff call yet, pick a time that suits you and we will start.
      </td></tr>
      <tr><td style="padding:16px 0 0 0;">
        <a href="${escapeHtml(input.kickoffUrl)}" style="display:inline-block;background:${INK};color:#ffffff;font-family:${SANS};font-size:14px;font-weight:500;line-height:20px;text-decoration:none;padding:13px 22px;border-radius:999px;">Book the kickoff call</a>
      </td></tr>`
    : ''

  const record = [
    row('Agreed by', `${input.clientLegalName}`),
    row('Email', input.signerEmail),
    row('Accepted', input.acceptedAtLabel),
    input.signerIp ? row('From IP', input.signerIp) : '',
    input.msaVersion ? row('Agreement version', input.msaVersion) : '',
    input.msaFilename && input.msaSha256
      ? row('Agreement checksum (SHA-256)', `${input.msaFilename}, ${input.msaSha256}`)
      : null,
    input.recordHash ? row('Record hash (SHA-256)', input.recordHash) : '',
  ].join('')

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#ffffff;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

  <tr><td style="padding:0 0 36px 0;">
    <img src="https://www.createdbysalt.com/salt-studio-logo.png" width="92" height="23" alt="Salt Studio" style="display:block;border:0;outline:none;text-decoration:none;width:92px;height:23px;" />
  </td></tr>

  <tr><td style="padding:0 0 10px 0;font-family:${MONO};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${FAINT};">Signed and paid</td></tr>

  <tr><td style="padding:0 0 14px 0;font-family:${SANS};font-size:30px;line-height:34px;font-weight:500;letter-spacing:-0.03em;color:${INK};">${escapeHtml(input.greetingName)}, thank you so much.</td></tr>

  <tr><td style="padding:0;font-family:${SANS};font-size:15px;line-height:23px;color:${MUTED};">
    Your first payment of ${escapeHtml(input.paidLabel)} has gone through, and the agreement is signed. The signed Statement of Work and the Master Services Agreement are attached to this email. They are yours to keep.
  </td></tr>

  <tr><td style="padding:34px 0 0 0;"><div style="height:1px;background:${RULE};line-height:1px;font-size:0;">&nbsp;</div></td></tr>

  <tr><td style="padding:24px 0 10px 0;font-family:${MONO};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${FAINT};">What you agreed to</td></tr>
  <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${scopeList}</table></td></tr>

  <tr><td style="padding:18px 0 10px 0;font-family:${MONO};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${FAINT};">Total ${escapeHtml(input.totalLabel)}</td></tr>
  <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${stepList}</table></td></tr>
  ${
    input.sameDayPercent
      ? `<tr><td style="padding:4px 0 0 0;font-family:${SANS};font-size:13px;line-height:19px;color:${INK};">Same-day discount applied: ${input.sameDayPercent}% off the package${input.savedLabel ? `, saving ${escapeHtml(input.savedLabel)}` : ''}. The total above is after it.</td></tr>`
      : ''
  }
  ${
    input.monthlyLabel
      ? `<tr><td style="padding:8px 0 0 0;font-family:${SANS};font-size:13px;line-height:19px;color:${INK};">${escapeHtml(input.monthlyLabel)}</td></tr>`
      : ''
  }
  <tr><td style="padding:4px 0 0 0;font-family:${SANS};font-size:13px;line-height:19px;color:${MUTED};">The first payment was taken today. The rest are invoiced, never charged automatically.</td></tr>

  <tr><td style="padding:34px 0 0 0;"><div style="height:1px;background:${RULE};line-height:1px;font-size:0;">&nbsp;</div></td></tr>

  <tr><td style="padding:24px 0 14px 0;font-family:${MONO};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${FAINT};">The record</td></tr>
  <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${record}</table></td></tr>
  <tr><td style="padding:0 0 0 0;font-family:${SANS};font-size:13px;line-height:19px;color:${MUTED};">
    The two attached documents together form the agreement between Salt Studio and ${escapeHtml(input.clientLegalName)}. The checksums above identify those exact files, so either of us can show later that nothing has changed.
  </td></tr>

  ${
    input.receiptUrl
      ? `<tr><td style="padding:18px 0 0 0;font-family:${SANS};font-size:13px;line-height:19px;color:${MUTED};">Your Stripe receipt: <a href="${escapeHtml(input.receiptUrl)}" style="color:${INK};text-decoration:underline;">view it here</a>.</td></tr>`
      : ''
  }

  ${action}

  <tr><td style="padding:34px 0 0 0;"><div style="height:1px;background:${RULE};line-height:1px;font-size:0;">&nbsp;</div></td></tr>
  <tr><td style="padding:20px 0 0 0;font-family:${SANS};font-size:13px;line-height:19px;color:${FAINT};">
    Salt Studio &nbsp;·&nbsp; <a href="mailto:hello@createdbysalt.com" style="color:${FAINT};text-decoration:underline;">hello@createdbysalt.com</a><br />
    Reply to this email and it comes straight to us.
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`
}

export function signerEmailText(input: Parameters<typeof signerEmailHtml>[0]) {
  const scope = [input.packageName, ...input.addOnNames].filter(Boolean)
  return [
    `${input.greetingName}, thank you so much.`,
    '',
    `Your first payment of ${input.paidLabel} has gone through, and the agreement is signed. The signed Statement of Work and the Master Services Agreement are attached to this email. They are yours to keep.`,
    '',
    'WHAT YOU AGREED TO',
    ...scope.map((name) => `  ${name}`),
    '',
    `TOTAL ${input.totalLabel}`,
    ...input.steps.map((s) => `  ${s.percent}%  ${s.amount}  ${s.trigger}`),
    input.sameDayPercent
      ? `Same-day discount applied: ${input.sameDayPercent}% off the package${input.savedLabel ? `, saving ${input.savedLabel}` : ''}. The total above is after it.`
      : null,
    input.monthlyLabel,
    'The first payment was taken today. The rest are invoiced, never charged automatically.',
    '',
    'THE RECORD',
    `  Agreed by: ${input.clientLegalName}`,
    `  Email: ${input.signerEmail}`,
    `  Accepted: ${input.acceptedAtLabel}`,
    input.signerIp ? `  From IP: ${input.signerIp}` : null,
    input.msaVersion ? `  Agreement version: ${input.msaVersion}` : null,
    input.msaFilename && input.msaSha256
      ? `  Agreement checksum (SHA-256): ${input.msaFilename}, ${input.msaSha256}`
      : null,
    input.recordHash ? `  Record hash (SHA-256): ${input.recordHash}` : null,
    '',
    `The two attached documents together form the agreement between Salt Studio and ${input.clientLegalName}. The checksums above identify those exact files, so either of us can show later that nothing has changed.`,
    input.receiptUrl ? `Your Stripe receipt: ${input.receiptUrl}` : null,
    '',
    input.kickoffUrl
      ? 'If you have not booked the kickoff call yet, pick a time that suits you and we will start.'
      : null,
    input.kickoffUrl ? `Book the kickoff call: ${input.kickoffUrl}` : null,
    '',
    'Salt Studio · hello@createdbysalt.com',
    'Reply to this email and it comes straight to us.',
  ]
    .filter((line) => line != null)
    .join('\n')
}

/**
 * The note Salt gets when a proposal is signed and the first payment is in.
 * Same ink, type, and logo as the client email. A table, because this one
 * is a list of names and prices rather than a letter.
 */
export type StudioEmailFields = {
  clientLegalName: string
  signerName: string
  signerEmail: string
  packageName: string
  packagePrice: string | null
  sameDayLine: string | null
  addOns: Array<{name: string; price: string | null}>
  totalLabel: string
  paidLabel: string
  paidTrigger: string | null
  laterSteps: Array<{percent: number; amount: string; trigger: string}>
  monthly: Array<{name: string; amount: string}>
  kickoffLabel: string | null
  stripeLink: string | null
  proposalId: string
  acceptanceId: string
  note: string | null
  documentsAttached: boolean
}

function sectionLabel(text: string, first = false) {
  const pad = first ? '24px 0 10px 0' : '22px 0 10px 0'
  return `<tr><td style="padding:${pad};font-family:${MONO};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${FAINT};">${escapeHtml(text)}</td></tr>`
}

function rule() {
  return `<tr><td style="padding:28px 0 0 0;"><div style="height:1px;background:${RULE};line-height:1px;font-size:0;">&nbsp;</div></td></tr>`
}

function priceRow(name: string, price: string | null, strong = false) {
  const border = strong ? 'border-top:1px solid rgba(8,9,10,0.10);' : ''
  const weight = strong ? 'font-weight:500;' : ''
  const pad = strong ? '12px' : '0'
  return `<tr>
      <td valign="top" style="padding:${pad} 16px 10px 0;${border}font-family:${SANS};font-size:14px;line-height:20px;${weight}color:${INK};">${escapeHtml(name)}</td>
      <td valign="top" align="right" style="padding:${pad} 0 10px 0;${border}font-family:${SANS};font-size:14px;line-height:20px;${weight}color:${INK};white-space:nowrap;">${price ? escapeHtml(price) : ''}</td>
    </tr>`
}

function moneyRow(label: string, amount: string, detail: string | null) {
  return `<tr>
      <td valign="top" style="padding:0 16px 2px 0;font-family:${SANS};font-size:14px;line-height:20px;color:${INK};">${escapeHtml(label)}</td>
      <td valign="top" align="right" style="padding:0 0 2px 0;font-family:${SANS};font-size:14px;line-height:20px;color:${INK};white-space:nowrap;">${escapeHtml(amount)}</td>
    </tr>${
      detail
        ? `<tr><td colspan="2" style="padding:0 0 12px 0;font-family:${SANS};font-size:13px;line-height:19px;color:${MUTED};">${escapeHtml(detail)}</td></tr>`
        : ''
    }`
}

function stripeHref(value: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.hostname !== 'dashboard.stripe.com') return null
    return url.toString()
  } catch {
    return null
  }
}

export function studioEmailHtml(input: StudioEmailFields) {
  const title = input.clientLegalName ? `${input.clientLegalName} signed` : 'A proposal was signed'
  const intro = input.documentsAttached
    ? `The first payment of ${input.paidLabel} is in. The signed Statement of Work and the Master Services Agreement are attached.`
    : `The first payment of ${input.paidLabel} is in.`

  const who = [
    input.clientLegalName ? row('Client', input.clientLegalName) : '',
    row('Signed by', input.signerName || 'Not recorded'),
    row('Email', input.signerEmail || 'Not recorded'),
  ].join('')

  const bought = [
    priceRow(input.packageName || 'Package', input.packagePrice),
    input.sameDayLine
      ? `<tr><td colspan="2" style="padding:0 0 12px 0;font-family:${SANS};font-size:13px;line-height:19px;color:${MUTED};">${escapeHtml(input.sameDayLine)}</td></tr>`
      : '',
    ...input.addOns.map((item) => priceRow(item.name, item.price)),
    priceRow('Total', input.totalLabel, true),
  ].join('')

  const later =
    input.laterSteps.length > 0
      ? input.laterSteps
          .map((step) => moneyRow('Due later', step.amount, `${step.percent}%, ${step.trigger}`))
          .join('')
      : `<tr><td colspan="2" style="padding:0 0 10px 0;font-family:${SANS};font-size:14px;line-height:20px;color:${INK};">Nothing else is due on this agreement.</td></tr>`
  const invoiceNote =
    input.laterSteps.length > 0
      ? `<tr><td colspan="2" style="padding:2px 0 0 0;font-family:${SANS};font-size:13px;line-height:19px;color:${MUTED};">The rest is invoiced. It is never charged automatically.</td></tr>`
      : ''

  const monthly =
    input.monthly.length > 0
      ? `${rule()}${sectionLabel('Monthly')}<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${input.monthly
          .map((item) => priceRow(item.name, `${item.amount} a month`))
          .join('')}</table></td></tr>
        <tr><td style="padding:0;font-family:${SANS};font-size:13px;line-height:19px;color:${MUTED};">Not part of the total or today's payment.</td></tr>`
      : ''

  const kickoff = input.kickoffLabel
    ? `${rule()}${sectionLabel('Kickoff date')}<tr><td style="font-family:${SANS};font-size:14px;line-height:20px;color:${INK};">${escapeHtml(input.kickoffLabel)}</td></tr>`
    : ''

  const stripe = stripeHref(input.stripeLink)
  const stripeBlock = `${rule()}${sectionLabel('Stripe payment')}<tr><td style="font-family:${SANS};font-size:14px;line-height:20px;color:${INK};">${
    stripe
      ? `<a href="${escapeHtml(stripe)}" style="color:${INK};text-decoration:underline;">Open the payment in Stripe</a>`
      : 'Not available'
  }</td></tr>`

  const note = input.note
    ? `${rule()}${sectionLabel('Note')}<tr><td style="font-family:${SANS};font-size:14px;line-height:20px;color:${INK};">${escapeHtml(input.note)}</td></tr>`
    : ''

  const record = [
    row('Proposal id', input.proposalId),
    row('Acceptance id', input.acceptanceId),
  ].join('')

  return `<!doctype html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1" /><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /></head>
<body style="margin:0;padding:0;background:#ffffff;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

  <tr><td style="padding:0 0 36px 0;">
    <img src="https://www.createdbysalt.com/salt-studio-logo.png" width="92" height="23" alt="Salt Studio" style="display:block;border:0;outline:none;text-decoration:none;width:92px;height:23px;" />
  </td></tr>

  <tr><td style="padding:0 0 10px 0;font-family:${MONO};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${FAINT};">Signed and paid</td></tr>

  <tr><td style="padding:0 0 14px 0;font-family:${SANS};font-size:28px;line-height:34px;font-weight:500;letter-spacing:-0.03em;color:${INK};">${escapeHtml(title)}</td></tr>

  <tr><td style="padding:0;font-family:${SANS};font-size:15px;line-height:23px;color:${MUTED};">${escapeHtml(intro)}</td></tr>

  ${rule()}
  ${sectionLabel('Who signed', true)}
  <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${who}</table></td></tr>

  ${rule()}
  ${sectionLabel('What they bought')}
  <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${bought}</table></td></tr>

  ${rule()}
  ${sectionLabel('Payment')}
  <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${moneyRow('Paid today', input.paidLabel, input.paidTrigger)}${later}${invoiceNote}</table></td></tr>

  ${monthly}
  ${kickoff}
  ${stripeBlock}
  ${note}

  ${rule()}
  ${sectionLabel('Record')}
  <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${record}</table></td></tr>

  <tr><td style="padding:8px 0 0 0;font-family:${SANS};font-size:13px;line-height:19px;color:${FAINT};">
    Salt Studio &nbsp;·&nbsp; <a href="mailto:hello@createdbysalt.com" style="color:${FAINT};text-decoration:underline;">hello@createdbysalt.com</a>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`
}

export function studioEmailText(input: StudioEmailFields) {
  const title = input.clientLegalName ? `${input.clientLegalName} signed` : 'A proposal was signed'
  const intro = input.documentsAttached
    ? `The first payment of ${input.paidLabel} is in. The signed Statement of Work and the Master Services Agreement are attached.`
    : `The first payment of ${input.paidLabel} is in.`
  const stripe = stripeHref(input.stripeLink)
  return [
    title,
    '',
    intro,
    '',
    'WHO SIGNED',
    input.clientLegalName ? `  Client: ${input.clientLegalName}` : null,
    `  Signed by: ${input.signerName || 'Not recorded'}`,
    `  Email: ${input.signerEmail || 'Not recorded'}`,
    '',
    'WHAT THEY BOUGHT',
    `  ${input.packageName || 'Package'}${input.packagePrice ? `  ${input.packagePrice}` : ''}`,
    input.sameDayLine,
    ...input.addOns.map((item) => `  ${item.name}${item.price ? `  ${item.price}` : ''}`),
    `  Total  ${input.totalLabel}`,
    '',
    'PAYMENT',
    `  Paid today  ${[input.paidLabel, input.paidTrigger].filter(Boolean).join('  ')}`,
    ...(input.laterSteps.length > 0
      ? input.laterSteps.map(
          (step) => `  Due later  ${step.percent}%  ${step.amount}  ${step.trigger}`,
        )
      : ['  Nothing else is due on this agreement.']),
    input.laterSteps.length > 0 ? 'The rest is invoiced. It is never charged automatically.' : null,
    input.monthly.length > 0 ? '' : null,
    input.monthly.length > 0 ? 'MONTHLY' : null,
    ...input.monthly.map((item) => `  ${item.name}  ${item.amount} a month`),
    input.monthly.length > 0 ? "Not part of the total or today's payment." : null,
    input.kickoffLabel ? '' : null,
    input.kickoffLabel ? 'KICKOFF DATE' : null,
    input.kickoffLabel ? `  ${input.kickoffLabel}` : null,
    '',
    'STRIPE PAYMENT',
    stripe ? `  ${stripe}` : '  Not available',
    input.note ? '' : null,
    input.note ? 'NOTE' : null,
    input.note ? `  ${input.note}` : null,
    '',
    'RECORD',
    `  Proposal id: ${input.proposalId}`,
    `  Acceptance id: ${input.acceptanceId}`,
    '',
    'Salt Studio · hello@createdbysalt.com',
  ]
    .filter((line) => line != null)
    .join('\n')
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
