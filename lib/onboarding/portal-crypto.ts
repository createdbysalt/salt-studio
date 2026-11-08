import {pbkdf2Sync, randomBytes, timingSafeEqual} from 'node:crypto'

const DEFAULT_ITERATIONS = 210_000
const KEY_LENGTH = 32
const DIGEST = 'sha256'

export function hashPortalPassword(password: string, salt = randomBytes(16).toString('base64url')) {
  const hash = pbkdf2Sync(password, salt, DEFAULT_ITERATIONS, KEY_LENGTH, DIGEST).toString(
    'base64url',
  )
  return {hash, salt, iterations: DEFAULT_ITERATIONS}
}

export function verifyPortalPassword({
  password,
  hash,
  salt,
  iterations,
}: {
  password: string
  hash: string
  salt: string
  iterations: number
}) {
  const expected = Buffer.from(hash, 'base64url')
  const actual = pbkdf2Sync(password, salt, iterations, expected.length, DIGEST)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}
