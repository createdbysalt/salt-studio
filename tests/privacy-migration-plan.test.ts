import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import test from 'node:test'
import {verifyPortalPassword} from '@/lib/onboarding/portal-crypto'
import {
  assertCopyCoversUnset,
  assertPreviewSupabaseTarget,
  assertRedactedOutput,
  buildPrivateMetadataRow,
  planPrivatePortalCopies,
  PREVIEW_SUPABASE_PROJECT_REF,
  PRIVATE_FIELD_COPY_COLUMNS,
  PRIVATE_PORTAL_DRY_RUN_PROJECTION,
  PRIVATE_PORTAL_FIELDS,
  PRIVATE_PORTAL_WRITE_PROJECTION,
  redactMigrationReport,
  type PrivatePortalSource,
} from '@/lib/onboarding/privacy-migration'

const FIXTURE_PASSWORD = 'fixture-portal-password'
const FIXTURE_CHECKLIST = [
  {
    _key: 'fixture-group',
    _type: 'portalChecklistCategory',
    title: 'Fixture group',
    items: [
      {
        _key: 'fixture-item',
        _type: 'portalChecklistItem',
        title: 'Fixture item',
        done: true,
      },
    ],
  },
]

const lisaShaped: PrivatePortalSource = {
  _id: 'portal-fixture-lisa',
  slug: 'fixture-lisa',
  password: FIXTURE_PASSWORD,
  sharedFolderUrl: 'https://example.test/shared',
  brandingFolderUrl: 'https://example.test/brand',
  mediaFolderUrl: 'https://example.test/media',
  productionUrl: 'https://example.test/live',
  checklist: FIXTURE_CHECKLIST,
}

const clcShaped: PrivatePortalSource = {
  _id: 'portal-fixture-clc',
  slug: 'fixture-clc',
  password: FIXTURE_PASSWORD,
  sharedFolderUrl: 'https://example.test/shared',
  brandingFolderUrl: 'https://example.test/brand',
  mediaFolderUrl: 'https://example.test/media',
  whatsappGroupUrl: 'https://example.test/chat',
  checklist: FIXTURE_CHECKLIST,
}

test('copy columns are a superset of every field that can later be unset', () => {
  assertCopyCoversUnset(PRIVATE_PORTAL_FIELDS, PRIVATE_PORTAL_FIELDS)
  for (const field of PRIVATE_PORTAL_FIELDS) {
    assert.ok(PRIVATE_FIELD_COPY_COLUMNS[field].length > 0, field)
  }
  assert.doesNotThrow(() =>
    assertCopyCoversUnset(['password', 'checklist', 'previewUrl'], ['password', 'checklist']),
  )
  assert.throws(
    () =>
      assertCopyCoversUnset(
        ['password', 'sharedFolderUrl'],
        ['password', 'sharedFolderUrl', 'checklist'],
      ),
    /checklist/,
  )
})

test('write mode copies checklist and every other field it would later unset', () => {
  for (const portal of [lisaShaped, clcShaped]) {
    const built = buildPrivateMetadataRow(portal)
    assert.deepEqual(built.copiedFields, built.unsetFields)
    for (const field of built.unsetFields) {
      assert.ok(built.copiedFields.includes(field), field)
      for (const column of PRIVATE_FIELD_COPY_COLUMNS[field]) {
        assert.notEqual(built.row[column as keyof typeof built.row], null, column)
      }
    }
    assert.ok(built.copiedFields.includes('checklist'))
    assert.deepEqual(built.row.checklist, FIXTURE_CHECKLIST)
    assert.equal(Object.hasOwn(built.row, 'password'), false)
    assert.notEqual(built.row.password_hash, FIXTURE_PASSWORD)
    assert.equal(built.row.password_iterations, 210_000)
    assert.equal(
      verifyPortalPassword({
        password: FIXTURE_PASSWORD,
        hash: built.row.password_hash,
        salt: built.row.password_salt,
        iterations: built.row.password_iterations,
      }),
      true,
    )
  }

  const lisa = buildPrivateMetadataRow(lisaShaped)
  assert.deepEqual(lisa.copiedFields, [
    'password',
    'sharedFolderUrl',
    'brandingFolderUrl',
    'mediaFolderUrl',
    'productionUrl',
    'checklist',
  ])
  assert.equal(lisa.row.preview_url, null)
  assert.equal(lisa.row.whatsapp_group_url, null)
  assert.equal(lisa.row.production_url, 'https://example.test/live')

  const clc = buildPrivateMetadataRow(clcShaped)
  assert.deepEqual(clc.copiedFields, [
    'password',
    'sharedFolderUrl',
    'brandingFolderUrl',
    'mediaFolderUrl',
    'whatsappGroupUrl',
    'checklist',
  ])
  assert.equal(clc.row.production_url, null)
  assert.equal(clc.row.preview_url, null)
  assert.equal(clc.row.whatsapp_group_url, 'https://example.test/chat')
})

test('write mode refuses a presence marker in place of the checklist value', () => {
  assert.throws(
    () =>
      buildPrivateMetadataRow({
        _id: 'portal-fixture',
        password: FIXTURE_PASSWORD,
        checklist: true,
      }),
    /checklist/,
  )
  assert.throws(
    () =>
      buildPrivateMetadataRow({
        _id: 'portal-fixture',
        sharedFolderUrl: 'https://example.test/shared',
        checklist: FIXTURE_CHECKLIST,
      }),
    /password/,
  )
})

test('dry-run presence still plans a checklist copy and does not unset Sanity', () => {
  const [plan] = planPrivatePortalCopies([
    {
      _id: 'portal-fixture',
      slug: 'fixture',
      password: true,
      sharedFolderUrl: true,
      checklist: true,
    },
  ])
  assert.deepEqual(plan.copiedFields, ['password', 'sharedFolderUrl', 'checklist'])
  assert.deepEqual(plan.publicFieldsToUnsetAfterPrivateCopy, plan.copiedFields)
  assert.equal(plan.performsSanityUnset, false)
  assert.ok(plan.supabaseColumnsCopied.includes('checklist'))
  assert.ok(plan.supabaseColumnsCopied.includes('password_hash'))
  assert.equal(JSON.stringify(plan).includes(FIXTURE_PASSWORD), false)
})

test('redacted report keeps field names and drops private values', () => {
  const plan = planPrivatePortalCopies([lisaShaped])
  const report = redactMigrationReport({
    mode: 'dry-run',
    readMode: 'public-dataset',
    projectId: 'fixture-project',
    sourceDataset: 'fixture',
    portalCount: plan.length,
    plan,
    cutoverGuardrails: ['Unset is not performed.'],
  })
  const output = JSON.stringify(report)
  assert.equal(report.performsSanityUnset, false)
  assert.equal(report.plan[0].performsSanityUnset, false)
  assert.equal(output.includes(FIXTURE_PASSWORD), false)
  assert.equal(output.includes('https://example.test/shared'), false)
  assert.equal(output.includes('Fixture group'), false)
  assert.doesNotThrow(() => assertRedactedOutput(output, [lisaShaped]))
  assert.throws(
    () =>
      assertRedactedOutput(
        JSON.stringify({password: FIXTURE_PASSWORD, checklist: FIXTURE_CHECKLIST}),
        [lisaShaped],
      ),
    /private portal value/,
  )
})

test('writes are limited to the preview Supabase project', () => {
  assert.equal(PREVIEW_SUPABASE_PROJECT_REF, 'jnznsgkkteuuqwtscaxz')
  assert.doesNotThrow(() => assertPreviewSupabaseTarget('https://jnznsgkkteuuqwtscaxz.supabase.co'))
  assert.throws(
    () => assertPreviewSupabaseTarget('https://example.supabase.co'),
    /preview Supabase project/,
  )
  assert.throws(
    () => assertPreviewSupabaseTarget('http://jnznsgkkteuuqwtscaxz.supabase.co'),
    /preview Supabase project/,
  )
})

test('write projection copies checklist values and dry-run projection does not', () => {
  assert.match(PRIVATE_PORTAL_DRY_RUN_PROJECTION, /defined\(checklist\) => \{"checklist": true\}/)
  assert.match(PRIVATE_PORTAL_WRITE_PROJECTION, /\n  checklist\n\}/)
  assert.equal(PRIVATE_PORTAL_WRITE_PROJECTION.includes('defined('), false)
  for (const field of PRIVATE_PORTAL_FIELDS) {
    assert.equal(PRIVATE_PORTAL_WRITE_PROJECTION.includes(field), true, field)
  }
})

test('checklist migration adds the column and the planner script does not unset Sanity', () => {
  const sql = readFileSync(
    'supabase/migrations/20261109060000_portal_private_metadata_checklist.sql',
    'utf8',
  ).toLowerCase()
  assert.match(sql, /add column if not exists checklist jsonb/)
  assert.match(sql, /revoke all on table public\.portal_private_metadata from anon, authenticated/)

  const source = readFileSync('scripts/onboarding/privacy-migration-plan.ts', 'utf8')
  assert.equal(source.includes('.patch('), false)
  assert.equal(source.includes('.mutate('), false)
  assert.equal(source.includes('.delete('), false)
  assert.equal(source.includes('unset('), false)
})
