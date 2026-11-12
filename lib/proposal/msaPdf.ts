import 'server-only'
import {base64FromBytes, sha256Bytes, type FrozenMsaPdf} from '@/lib/proposal/frozenDocument'
import {token} from '@/sanity/lib/token'

export async function freezeMsaPdf(pdfUrl: string | null | undefined): Promise<FrozenMsaPdf> {
  if (!pdfUrl) return {status: 'missing', reason: 'missing_pdf_asset'}
  let url: URL
  try {
    url = new URL(pdfUrl)
  } catch {
    return {status: 'missing', reason: 'invalid_pdf_url'}
  }

  const response = await fetch(url, {
    headers: {Authorization: `Bearer ${token}`},
    cache: 'no-store',
  })
  if (!response.ok) return {status: 'missing', reason: `pdf_fetch_${response.status}`}

  const bytes = new Uint8Array(await response.arrayBuffer())
  if (bytes.length === 0) return {status: 'missing', reason: 'empty_pdf_asset'}

  const pathName = url.pathname.split('/').filter(Boolean).pop() ?? 'master-services-agreement.pdf'
  const filename = pathName.toLowerCase().endsWith('.pdf') ? pathName : `${pathName}.pdf`
  return {
    status: 'frozen',
    sha256: sha256Bytes(bytes),
    bytesBase64: base64FromBytes(bytes),
    filename,
    contentType: response.headers.get('content-type') || 'application/pdf',
  }
}
