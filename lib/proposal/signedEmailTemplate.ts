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

  const action = input.kickoffUrl
    ? `<tr><td style="padding:28px 0 0 0;">
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
      ? row('Agreement checksum (SHA-256)', `${input.msaFilename} — ${input.msaSha256}`)
      : null,
    input.recordHash ? row('Record hash (SHA-256)', input.recordHash) : '',
  ].join('')

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#ffffff;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

  <tr><td style="padding:0 0 36px 0;font-family:${SANS};font-size:15px;font-weight:700;letter-spacing:0.22em;color:${INK};">SALT</td></tr>

  <tr><td style="padding:0 0 10px 0;font-family:${MONO};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${FAINT};">Signed and paid</td></tr>

  <tr><td style="padding:0 0 14px 0;font-family:${SANS};font-size:30px;line-height:34px;font-weight:500;letter-spacing:-0.03em;color:${INK};">${escapeHtml(input.greetingName)}, thank you so much.</td></tr>

  <tr><td style="padding:0;font-family:${SANS};font-size:15px;line-height:23px;color:${MUTED};">
    Your first payment of ${escapeHtml(input.paidLabel)} has gone through, and the agreement is signed. The signed Statement of Work and the Master Services Agreement are attached to this email. They are yours to keep.
  </td></tr>

  <tr><td style="padding:14px 0 0 0;font-family:${SANS};font-size:15px;line-height:23px;color:${MUTED};">
    The last thing is the kickoff call. Pick a time that suits you and we will start.
  </td></tr>

  ${action}

  <tr><td style="padding:34px 0 0 0;"><div style="height:1px;background:${RULE};line-height:1px;font-size:0;">&nbsp;</div></td></tr>

  <tr><td style="padding:24px 0 10px 0;font-family:${MONO};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${FAINT};">What you agreed to</td></tr>
  <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${scopeList}</table></td></tr>

  <tr><td style="padding:18px 0 10px 0;font-family:${MONO};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${FAINT};">Total ${escapeHtml(input.totalLabel)}</td></tr>
  <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${stepList}</table></td></tr>
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
    'The last thing is the kickoff call. Pick a time that suits you and we will start.',
    input.kickoffUrl ? `Book the kickoff call: ${input.kickoffUrl}` : null,
    '',
    'WHAT YOU AGREED TO',
    ...scope.map((name) => `  ${name}`),
    '',
    `TOTAL ${input.totalLabel}`,
    ...input.steps.map((s) => `  ${s.percent}%  ${s.amount}  ${s.trigger}`),
    'The first payment was taken today. The rest are invoiced, never charged automatically.',
    '',
    'THE RECORD',
    `  Agreed by: ${input.clientLegalName}`,
    `  Email: ${input.signerEmail}`,
    `  Accepted: ${input.acceptedAtLabel}`,
    input.signerIp ? `  From IP: ${input.signerIp}` : null,
    input.msaVersion ? `  Agreement version: ${input.msaVersion}` : null,
    input.msaFilename && input.msaSha256
      ? `  Agreement checksum (SHA-256): ${input.msaFilename} — ${input.msaSha256}`
      : null,
    input.recordHash ? `  Record hash (SHA-256): ${input.recordHash}` : null,
    '',
    `The two attached documents together form the agreement between Salt Studio and ${input.clientLegalName}. The checksums above identify those exact files, so either of us can show later that nothing has changed.`,
    input.receiptUrl ? `Your Stripe receipt: ${input.receiptUrl}` : null,
    '',
    'Salt Studio · hello@createdbysalt.com',
    'Reply to this email and it comes straight to us.',
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
