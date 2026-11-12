import assert from 'node:assert/strict'
import test from 'node:test'
import {
  matchesSignedFigures,
  sameSignedDeal,
  signedContentHash,
  type SignedRecord,
} from '@/lib/proposal/quote'

// --- does a signature carry over to a later visit? -------------------------
//
// The first step of the split is what checkout charges, so getting this wrong
// is a wrong charge rather than a wrong label. These cover the case that an
// earlier version of this feature allowed through: a price corrected in the
// CMS after someone signed and walked away, then charged at the old number
// with the screen and the charge agreeing and both being wrong.

const CONTENT = 'a'.repeat(64)
const OTHER_CONTENT = 'b'.repeat(64)

function signature(overrides: Partial<SignedRecord> = {}): SignedRecord {
  return {
    selection_key: 'pkg-complete|addon-copy',
    total_cents: 850_000,
    first_cents: 255_000,
    agreed_text_sha256: CONTENT,
    ...overrides,
  }
}

test('a v3 document carries its content hash inside the document', () => {
  const row = signature({
    agreed_text_sha256: 'hash-of-the-document-not-the-content',
    agreed_document: {contentSha256: CONTENT},
  })
  assert.equal(signedContentHash(row), CONTENT)
})

test('an older row keeps the content hash in agreed_text_sha256', () => {
  assert.equal(signedContentHash(signature()), CONTENT)
})

test('a v3 document with no content hash refuses to carry over', () => {
  // Frozen before the field existed. Nothing to compare, so the client signs
  // again rather than being charged against a signature we cannot check.
  const row = signature({agreed_text_sha256: null, agreed_document: {}})
  assert.equal(signedContentHash(row), null)
  assert.equal(sameSignedDeal(row, 'pkg-complete|addon-copy', CONTENT), false)
})

test('the same deal with unchanged wording carries over', () => {
  assert.equal(sameSignedDeal(signature(), 'pkg-complete|addon-copy', CONTENT), true)
})

test('changing the package breaks the carry-over', () => {
  assert.equal(sameSignedDeal(signature(), 'pkg-foundation', CONTENT), false)
})

test('editing the proposal after they signed breaks the carry-over', () => {
  assert.equal(sameSignedDeal(signature(), 'pkg-complete|addon-copy', OTHER_CONTENT), false)
})

test('no signature at all never carries over', () => {
  assert.equal(sameSignedDeal(null, 'pkg-complete|addon-copy', CONTENT), false)
})

test('re-pricing to the same figures honours the signature', () => {
  const frozen = {totalCents: 850_000, firstCents: 255_000}
  assert.equal(matchesSignedFigures(frozen, signature()), true)
})

test('a corrected price refuses the signature rather than charging the old one', () => {
  // Signed at $8,500, the studio then fixed the package to $20,000.
  const frozen = {totalCents: 2_000_000, firstCents: 600_000}
  assert.equal(matchesSignedFigures(frozen, signature()), false)
})

test('a total that still matches but a changed first step refuses too', () => {
  // Same money overall, different split, so a different amount today.
  const frozen = {totalCents: 850_000, firstCents: 425_000}
  assert.equal(matchesSignedFigures(frozen, signature()), false)
})

test('one cent of drift is enough to refuse', () => {
  const frozen = {totalCents: 850_001, firstCents: 255_000}
  assert.equal(matchesSignedFigures(frozen, signature()), false)
})

test('nothing to compare against never honours a signature', () => {
  assert.equal(matchesSignedFigures(null, signature()), false)
  assert.equal(matchesSignedFigures({totalCents: 1, firstCents: 1}, null), false)
})
