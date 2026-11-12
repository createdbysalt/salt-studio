import {cleanText, parseFrozenAddress, validSignerEmail} from '@/lib/proposal/frozenDocument'

const MIN_NAME = 2

export function validateSigningFields(formData: FormData) {
  const signerName = String(formData.get('signerName') ?? '').trim()
  if (signerName.length < MIN_NAME || signerName.length > 200) {
    return {ok: false as const, error: 'Type your full name to sign.'}
  }

  const legalName = cleanText(String(formData.get('legalName') ?? ''))
  if (legalName.length < 2 || legalName.length > 300) {
    return {ok: false as const, error: 'Enter the legal name for the signed documents.'}
  }

  const address = parseFrozenAddress(String(formData.get('address') ?? ''))
  if (!address) {
    return {
      ok: false as const,
      error:
        'Enter the full mailing address: street, city, state or region, postal code, and country.',
    }
  }

  const email = validSignerEmail(String(formData.get('email') ?? ''))
  if (!email) return {ok: false as const, error: 'Enter a valid email for the signed documents.'}

  return {ok: true as const, signerName, legalName, address, email}
}
