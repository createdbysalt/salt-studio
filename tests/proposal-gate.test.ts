import assert from 'node:assert/strict'
import test from 'node:test'
import {
  PROPOSAL_GATE_MAX_AGE,
  proposalPasswordsMatch,
  signProposalGate,
  verifyProposalGate,
} from '@/lib/proposal/gate'

const HARBOR = 'a'.repeat(32)
const OTHER = 'b'.repeat(32)
const NOW = Date.UTC(2026, 0, 1)

test('password matches only the same string', () => {
  assert.equal(proposalPasswordsMatch('salt', 'salt'), true)
  assert.equal(proposalPasswordsMatch('Salt', 'salt'), false)
  assert.equal(proposalPasswordsMatch('salt ', 'salt'), false)
  assert.equal(proposalPasswordsMatch('', 'salt'), false)
})

test('cookie is bound to one token, one secret, and one window', () => {
  const previous = process.env.PROPOSAL_GATE_SECRET
  process.env.PROPOSAL_GATE_SECRET = 'test-secret'
  try {
    const value = signProposalGate(HARBOR, NOW)
    assert.ok(value)
    assert.equal(verifyProposalGate(HARBOR, value, NOW + 1000), true)
    assert.equal(verifyProposalGate(OTHER, value, NOW + 1000), false)
    assert.equal(verifyProposalGate(HARBOR, '1', NOW + 1000), false)

    const later = NOW + (PROPOSAL_GATE_MAX_AGE + 5) * 1000
    assert.equal(verifyProposalGate(HARBOR, value, later), false)

    process.env.PROPOSAL_GATE_SECRET = 'other-secret'
    assert.equal(verifyProposalGate(HARBOR, value, NOW + 1000), false)

    delete process.env.PROPOSAL_GATE_SECRET
    assert.equal(signProposalGate(HARBOR, NOW), null)
    assert.equal(verifyProposalGate(HARBOR, value, NOW + 1000), false)
  } finally {
    if (previous === undefined) delete process.env.PROPOSAL_GATE_SECRET
    else process.env.PROPOSAL_GATE_SECRET = previous
  }
})
