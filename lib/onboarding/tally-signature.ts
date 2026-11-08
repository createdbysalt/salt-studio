import {createHmac, timingSafeEqual} from 'node:crypto'

function normalizeSignature(value: string) {
  return value.trim().replace(/^sha256=/i, '')
}

function safeEqualHex(a: string, b: string) {
  const left = Buffer.from(normalizeSignature(a), 'hex')
  const right = Buffer.from(normalizeSignature(b), 'hex')
  return left.length > 0 && left.length === right.length && timingSafeEqual(left, right)
}

export function createTallySignature(rawBody: string, signingSecret: string) {
  return createHmac('sha256', signingSecret).update(rawBody).digest('hex')
}

export function verifyTallySignature({
  rawBody,
  signature,
  signingSecret,
}: {
  rawBody: string
  signature: string | null | undefined
  signingSecret: string
}) {
  if (!signature) return false
  return safeEqualHex(signature, createTallySignature(rawBody, signingSecret))
}
