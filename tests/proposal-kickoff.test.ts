import assert from 'node:assert/strict'
import test from 'node:test'
import {kickoffLink} from '@/lib/proposal/kickoff'

const BASE = 'https://cal.com/createdbysalt/kickoff?overlayCalendar=true'

test('the chosen date, name, and email are added to the Cal.com link', () => {
  const link = kickoffLink(BASE, {
    date: '2026-11-17',
    name: 'Ruth Adeyemi',
    email: 'ruth@harborparish.example',
  })
  assert.ok(link)
  const url = new URL(link.href)
  assert.equal(url.searchParams.get('overlayCalendar'), 'true')
  assert.equal(url.searchParams.get('date'), '2026-11-17')
  assert.equal(url.searchParams.get('month'), '2026-11')
  assert.equal(url.searchParams.get('name'), 'Ruth Adeyemi')
  assert.equal(url.searchParams.get('email'), 'ruth@harborparish.example')
  assert.ok(link.calLink.startsWith('createdbysalt/kickoff?'))
  assert.ok(!link.calLink.startsWith('/'))
})

test('missing details are left out and a bad date is ignored', () => {
  const link = kickoffLink(BASE, {date: 'next monday', name: null, email: null})
  assert.ok(link)
  const url = new URL(link.href)
  assert.equal(url.searchParams.has('date'), false)
  assert.equal(url.searchParams.has('name'), false)
  assert.equal(url.searchParams.has('email'), false)
})

test('only https Cal.com links are embedded', () => {
  const prefill = {date: null, name: null, email: null}
  assert.equal(kickoffLink('http://cal.com/createdbysalt/kickoff', prefill), null)
  assert.equal(kickoffLink('https://example.com/book', prefill), null)
  assert.equal(kickoffLink('https://cal.com/', prefill), null)
  assert.equal(kickoffLink('not a url', prefill), null)
  assert.equal(kickoffLink(null, prefill), null)
})
