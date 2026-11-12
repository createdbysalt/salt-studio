import 'server-only'
import {createHash, createHmac, timingSafeEqual} from 'node:crypto'

export const PROPOSAL_GATE_COOKIE = 'proposal_gate'
export const PROPOSAL_GATE_MAX_AGE = 60 * 60 * 24 * 14

const TOKEN_PATH = /^[A-Za-z0-9_-]{1,128}$/

function gateSecret() {
  const secret = process.env.PROPOSAL_GATE_SECRET
  return secret && secret.length > 0 ? secret : null
}

/** SHA-256 both sides so a short guess is not faster to reject. */
export function proposalPasswordsMatch(submitted: string, expected: string) {
  const actual = createHash('sha256').update(submitted).digest()
  const wanted = createHash('sha256').update(expected).digest()
  return timingSafeEqual(actual, wanted)
}

export function signProposalGate(token: string, now = Date.now()) {
  const secret = gateSecret()
  if (!secret) return null
  const exp = Math.floor(now / 1000) + PROPOSAL_GATE_MAX_AGE
  const mac = createHmac('sha256', secret).update(`${token}.${exp}`).digest('base64url')
  return `${exp}.${mac}`
}

export function verifyProposalGate(
  token: string,
  value: string | undefined | null,
  now = Date.now(),
) {
  const secret = gateSecret()
  if (!secret || !value) return false
  const parts = value.split('.')
  if (parts.length !== 2) return false
  const [expRaw, mac] = parts
  if (!expRaw || !mac || !/^\d+$/.test(expRaw)) return false
  const exp = Number(expRaw)
  if (exp * 1000 <= now) return false
  const expected = createHmac('sha256', secret).update(`${token}.${exp}`).digest('base64url')
  const actualBuf = Buffer.from(mac)
  const expectedBuf = Buffer.from(expected)
  if (actualBuf.length !== expectedBuf.length) return false
  return timingSafeEqual(actualBuf, expectedBuf)
}

export function proposalGateCookiePath(token: string) {
  if (!TOKEN_PATH.test(token)) return null
  return `/p/${token}`
}
