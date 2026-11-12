import 'server-only'
import {base64FromBytes, sha256Bytes, type FrozenMsaPdf} from '@/lib/proposal/frozenDocument'
import {token} from '@/sanity/lib/token'

/** Strips anything that would make an awkward attachment name. */
function cleanFilename(value: string | null | undefined) {
  const name = (value ?? '')
    .trim()
    .replace(/[\\/\r\n\t]+/g, ' ')
    .trim()
  if (!name || name.length > 120) return null
  return name
}

/** Resend caps attachments around 40MB; stay well under it. */
const MAX_MSA_PDF_BYTES = 8_000_000

export async function freezeMsaPdf(
  pdfUrl: string | null | undefined,
  originalFilename?: string | null,
): Promise<FrozenMsaPdf> {
  if (!pdfUrl) return {status: 'missing', reason: 'missing_pdf_asset'}
  let url: URL
  try {
    url = new URL(pdfUrl)
  } catch {
    return {status: 'missing', reason: 'invalid_pdf_url'}
  }

  // The read token goes in this request, so it only ever goes to Sanity. The
  // URL comes from a Sanity asset today, but nothing downstream enforces
  // that, and a credential handed to an arbitrary host is not recoverable.
  if (url.protocol !== 'https:' || url.hostname !== 'cdn.sanity.io') {
    return {status: 'missing', reason: 'untrusted_pdf_host'}
  }

  const response = await fetch(url, {
    headers: {Authorization: `Bearer ${token}`},
    cache: 'no-store',
  })
  if (!response.ok) return {status: 'missing', reason: `pdf_fetch_${response.status}`}

  const bytes = new Uint8Array(await response.arrayBuffer())
  if (bytes.length === 0) return {status: 'missing', reason: 'empty_pdf_asset'}
  // Base64 of these bytes is stored on the acceptance row and attached to an
  // email. Both have limits, and an oversized agreement should be reported
  // rather than silently bloat every row and bounce every send.
  if (bytes.length > MAX_MSA_PDF_BYTES) return {status: 'missing', reason: 'pdf_too_large'}

  // Prefer the name of the file that was uploaded. A Sanity asset URL ends in
  // the asset id, so without this the client receives their contract as
  // something like acd1f8ad11c95de2223033134572f6bf33b48cc0.pdf.
  const pathName =
    cleanFilename(originalFilename) ??
    url.pathname.split('/').filter(Boolean).pop() ??
    'master-services-agreement.pdf'
  const filename = pathName.toLowerCase().endsWith('.pdf') ? pathName : `${pathName}.pdf`
  return {
    status: 'frozen',
    sha256: sha256Bytes(bytes),
    bytesBase64: base64FromBytes(bytes),
    filename,
    contentType: response.headers.get('content-type') || 'application/pdf',
  }
}
