import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import test from 'node:test'
import {
  isRepeatableFormKey,
  REPEATABLE_FORM_KEYS,
  summarizeFormSubmissions,
} from '@/lib/onboarding/collection-status'
import {classifyDriveArrival} from '@/lib/onboarding/drive'
import {GoogleDriveMetadataChecker} from '@/lib/onboarding/drive-checker'
import {GoogleDriveFolderScanner, parseDriveScanRequest} from '@/lib/onboarding/drive-scanner'
import {planInternalTaskSync} from '@/lib/onboarding/internal-tasks'
import {NotionReviewSink} from '@/lib/onboarding/notion'
import {hashPortalPassword, verifyPortalPassword} from '@/lib/onboarding/portal-crypto'
import {
  getPreviewFixtureProject,
  isPreviewIsolationEnabled,
  PREVIEW_FIXTURE_PROJECT_ID,
  resolveOnboardingProject,
} from '@/lib/onboarding/preview-fixtures'
import {
  getPrivatePortalOverlay,
  getSupabasePortalCredentials,
} from '@/lib/onboarding/private-portal'
import {processTallyWebhook, retryFailedOnboardingSyncs} from '@/lib/onboarding/processor'
import {
  MemoryOnboardingRepository,
  onboardingSubmissionDocumentId,
  SanityOnboardingRepository,
} from '@/lib/onboarding/repository'
import {
  appendOnboardingRoutingToTallyUrl,
  createOnboardingRouteToken,
  ONBOARDING_PROJECT_ID_PARAM,
} from '@/lib/onboarding/routing'
import {SupabaseOnboardingRepository} from '@/lib/onboarding/supabase-repository'
import {createTallySignature, verifyTallySignature} from '@/lib/onboarding/tally-signature'
import type {OnboardingProjectMapping, OnboardingReviewSink} from '@/lib/onboarding/types'
import {CHURCH_TALLY_FORMS, CLIENT_GETTING_STARTED_OVERRIDES} from '@/lib/tally/church-forms'

const ROUTING_SECRET = 'test-routing-secret'
const WEBHOOK_SECRET = 'test-webhook-secret'
const HARDENING_MIGRATION_PATH =
  'supabase/migrations/20261108050100_harden_onboarding_updated_at_function.sql'

const CURRENT_CLC_FORM_MAPPINGS = [
  {itemKey: 'gs-form', formId: 'yP5oEB', title: 'Church Info Form'},
  {itemKey: 'f-staff', formId: '814oZl', title: 'Staff Bio'},
  {itemKey: 'f-ministry', formId: '0QRre9', title: 'Ministry'},
  {itemKey: 'f-crew', formId: 'zx5X7k', title: 'Crew'},
  {itemKey: 'f-small-group', formId: '5BPKZN', title: 'Small Group'},
  {itemKey: 'f-event', formId: 'Y5lD4N', title: 'Event'},
  {itemKey: 'f-course', formId: 'lbkD6o', title: 'Course'},
  {itemKey: 'f-testimony', formId: 'RGyKPK', title: 'Testimony'},
  {itemKey: 'f-faq', formId: 'obL6Gb', title: 'FAQ'},
] as const

const churchProject: OnboardingProjectMapping = {
  projectId: 'portal-alpha-001',
  portalSlug: 'alpha-church',
  name: 'Alpha Church',
  clientRef: 'client-alpha-church',
  enabled: true,
  internalTaskSystem: 'notion',
  forms: [...CURRENT_CLC_FORM_MAPPINGS],
  driveFolders: {
    shared: 'drive-shared-alpha',
    branding: 'drive-brand-alpha',
    media: 'drive-media-alpha',
  },
}

const secondProject: OnboardingProjectMapping = {
  projectId: 'portal-beta-002',
  portalSlug: 'beta-church',
  name: 'Beta Church',
  enabled: true,
  internalTaskSystem: 'notion',
  forms: [{itemKey: 'f-staff', formId: '814oZl', title: 'Staff Bio'}],
}

const simcoeProject: OnboardingProjectMapping = {
  projectId: 'portal-simcoe-003',
  portalSlug: 'simcoe-house',
  name: 'Simcoe House',
  enabled: true,
  internalTaskSystem: 'linear',
  forms: [{itemKey: 'f-staff', formId: '814oZl', title: 'Staff Bio'}],
}

const projects = new Map(
  [churchProject, secondProject, simcoeProject].map((project) => [project.projectId, project]),
)

async function getProject(projectId: string) {
  return projects.get(projectId) ?? null
}

function tallyPayload(
  input: {
    submissionId?: string | null
    projectId?: string | null
    itemKey?: string | null
    formId?: string | null
    token?: string | null
  } = {},
) {
  const {
    submissionId = 'sub-1',
    projectId = churchProject.projectId,
    itemKey = 'f-staff',
    formId = '814oZl',
    token,
  } = input
  const routeToken =
    token === undefined
      ? projectId && itemKey && formId
        ? createOnboardingRouteToken({projectId, itemKey, formId}, ROUTING_SECRET)
        : null
      : token

  return {
    submissionId,
    formId,
    fields: [
      {key: 'project_id', value: projectId},
      {key: 'form_id', value: formId},
      {key: 'item_key', value: itemKey},
      {key: 'salt_route', value: routeToken},
      {key: 'staff_name', value: 'Synthetic Person'},
    ],
  }
}

test('Tally links get stable project routing metadata and signed tokens', () => {
  const routed = appendOnboardingRoutingToTallyUrl({
    href: 'https://tally.so/r/814oZl',
    projectId: churchProject.projectId,
    itemKey: 'f-staff',
    secret: ROUTING_SECRET,
  })

  assert.ok(routed)
  const url = new URL(routed)
  assert.equal(url.searchParams.get(ONBOARDING_PROJECT_ID_PARAM), churchProject.projectId)
  assert.equal(url.searchParams.get('form_id'), '814oZl')
  assert.equal(url.searchParams.get('item_key'), 'f-staff')
  assert.ok(url.searchParams.get('salt_route'))
})

test('Supabase function hardening migration pins search_path and revokes execute grants', () => {
  const sql = readFileSync(HARDENING_MIGRATION_PATH, 'utf8').toLowerCase()

  assert.match(sql, /create or replace function public\.set_onboarding_updated_at\(\)/)
  assert.match(sql, /set search_path = pg_catalog, public/)
  assert.match(sql, /revoke all on function public\.set_onboarding_updated_at\(\) from public/)
  assert.match(sql, /revoke all on function public\.set_onboarding_updated_at\(\) from anon/)
  assert.match(
    sql,
    /revoke all on function public\.set_onboarding_updated_at\(\) from authenticated/,
  )
})

test('portal password hashing verifies without storing plaintext', () => {
  const hashed = hashPortalPassword('correct horse battery staple', 'fixed-test-salt')

  assert.notEqual(hashed.hash, 'correct horse battery staple')
  assert.equal(
    verifyPortalPassword({
      password: 'correct horse battery staple',
      hash: hashed.hash,
      salt: hashed.salt,
      iterations: hashed.iterations,
    }),
    true,
  )
  assert.equal(
    verifyPortalPassword({
      password: 'wrong',
      hash: hashed.hash,
      salt: hashed.salt,
      iterations: hashed.iterations,
    }),
    false,
  )
})

test('Supabase private portal overlay reads private links and submission labels server-side', async () => {
  const originalFetch = globalThis.fetch
  const originalStore = process.env.ONBOARDING_PRIVATE_METADATA_STORE
  const originalUrl = process.env.SUPABASE_URL
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  process.env.ONBOARDING_PRIVATE_METADATA_STORE = 'supabase'
  process.env.SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'

  globalThis.fetch = (async (url: string | URL | Request) => {
    const text = String(url)
    if (text.includes('select=password_hash')) {
      const hashed = hashPortalPassword('portal-pass', 'portal-salt')
      return Response.json([
        {
          password_hash: hashed.hash,
          password_salt: hashed.salt,
          password_iterations: hashed.iterations,
        },
      ])
    }
    if (text.includes('portal_private_metadata')) {
      return Response.json([
        {
          shared_folder_url: 'https://drive.example/shared',
          branding_folder_url: 'https://drive.example/brand',
          media_folder_url: 'https://drive.example/media',
          preview_url: null,
          production_url: null,
          whatsapp_group_url: null,
          checklist: [
            {
              _key: 'fixture-group',
              _type: 'portalChecklistCategory',
              title: 'Fixture group',
              items: [
                {
                  _key: 'fixture-item',
                  _type: 'portalChecklistItem',
                  title: 'Fixture item',
                  done: false,
                },
              ],
            },
          ],
        },
      ])
    }
    if (text.includes('onboarding_submissions')) {
      return Response.json([
        {
          idempotency_key: 'tally:staff-1',
          provider: 'tally',
          project_id: churchProject.projectId,
          form_id: '814oZl',
          item_key: 'f-staff',
          submission_id: 'staff-1',
          entry_title: 'Ada Staff',
          status: 'received_for_review',
          review_reason: null,
          received_at: '2026-01-01T00:00:00.000Z',
          attempts: 0,
          last_error: null,
        },
      ])
    }
    if (text.includes('onboarding_collection_status')) {
      return Response.json([])
    }
    return new Response('{}', {status: 404})
  }) as typeof fetch

  try {
    const credentials = await getSupabasePortalCredentials(churchProject.projectId)
    const overlay = await getPrivatePortalOverlay(churchProject.projectId)

    assert.ok(credentials)
    assert.equal(overlay?.sharedFolderUrl, 'https://drive.example/shared')
    assert.equal(
      (overlay?.checklist as Array<{title?: string}> | undefined)?.[0]?.title,
      'Fixture group',
    )
    assert.equal(overlay?.formSubmissionSummary?.['f-staff'].count, 1)
    assert.equal(overlay?.formSubmissionSummary?.['f-staff'].entries?.[0].label, 'Ada Staff')
    assert.equal(
      overlay?.formSubmissionSummary?.['f-staff'].entries?.[0].receivedAt,
      '2026-01-01T00:00:00.000Z',
    )
  } finally {
    globalThis.fetch = originalFetch
    process.env.ONBOARDING_PRIVATE_METADATA_STORE = originalStore
    process.env.SUPABASE_URL = originalUrl
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey
  }
})

test('repo inventory matches the nine current CLC portal Tally forms', () => {
  const inventory = new Map(
    CURRENT_CLC_FORM_MAPPINGS.map((entry) => [entry.itemKey, entry.formId] as const),
  )

  assert.equal(CLIENT_GETTING_STARTED_OVERRIDES.clc.link, 'https://tally.so/r/yP5oEB')
  assert.deepEqual(
    [...inventory.keys()],
    [
      'gs-form',
      'f-staff',
      'f-ministry',
      'f-crew',
      'f-small-group',
      'f-event',
      'f-course',
      'f-testimony',
      'f-faq',
    ],
  )
  assert.equal(inventory.get('f-staff'), CHURCH_TALLY_FORMS.staff.split('/').at(-1))
  assert.equal(inventory.get('f-ministry'), CHURCH_TALLY_FORMS.ministry.split('/').at(-1))
  assert.equal(inventory.get('f-crew'), CHURCH_TALLY_FORMS.dreamTeam.split('/').at(-1))
  assert.equal(inventory.get('f-small-group'), CHURCH_TALLY_FORMS.smallGroup.split('/').at(-1))
  assert.equal(inventory.get('f-event'), CHURCH_TALLY_FORMS.event.split('/').at(-1))
  assert.equal(inventory.get('f-course'), CHURCH_TALLY_FORMS.course.split('/').at(-1))
  assert.equal(inventory.get('f-testimony'), CHURCH_TALLY_FORMS.testimony.split('/').at(-1))
  assert.equal(inventory.get('f-faq'), CHURCH_TALLY_FORMS.faq.split('/').at(-1))
})

test('all nine current CLC portal forms receive project routing and validate', async () => {
  const repository = new MemoryOnboardingRepository()

  for (const mapping of CURRENT_CLC_FORM_MAPPINGS) {
    const routed = appendOnboardingRoutingToTallyUrl({
      href: `https://tally.so/r/${mapping.formId}`,
      projectId: churchProject.projectId,
      itemKey: mapping.itemKey,
      secret: ROUTING_SECRET,
    })
    assert.ok(routed, mapping.itemKey)
    const url = new URL(routed)
    const payload = tallyPayload({
      submissionId: `sub-${mapping.itemKey}`,
      projectId: url.searchParams.get('project_id'),
      itemKey: url.searchParams.get('item_key'),
      formId: url.searchParams.get('form_id'),
      token: url.searchParams.get('salt_route'),
    })
    const result = await processTallyWebhook({
      rawBody: JSON.stringify(payload),
      payload,
      routingSecret: ROUTING_SECRET,
      repository,
      getProject,
    })

    assert.equal(result.status, 'received_for_review', mapping.itemKey)
  }

  assert.equal(repository.snapshot().length, CURRENT_CLC_FORM_MAPPINGS.length)
})

test('CLC-specific Church Info routing cannot be reused for another client', async () => {
  const clcInfo = CURRENT_CLC_FORM_MAPPINGS.find((entry) => entry.itemKey === 'gs-form')
  assert.ok(clcInfo)
  const token = createOnboardingRouteToken(
    {projectId: churchProject.projectId, itemKey: clcInfo.itemKey, formId: clcInfo.formId},
    ROUTING_SECRET,
  )
  const payload = tallyPayload({
    submissionId: 'cross-client-gs',
    projectId: secondProject.projectId,
    itemKey: clcInfo.itemKey,
    formId: clcInfo.formId,
    token,
  })
  const result = await processTallyWebhook({
    rawBody: JSON.stringify(payload),
    payload,
    routingSecret: ROUTING_SECRET,
    repository: new MemoryOnboardingRepository(),
    getProject,
  })

  assert.equal(result.status, 'needs_review')
  assert.equal(result.record.reviewReason, 'invalid_routing')
})

test('shared form ids still require per-project signed routing', async () => {
  const token = createOnboardingRouteToken(
    {projectId: secondProject.projectId, itemKey: 'f-staff', formId: '814oZl'},
    ROUTING_SECRET,
  )
  const payload = tallyPayload({
    submissionId: 'beta-staff',
    projectId: secondProject.projectId,
    token,
  })
  const result = await processTallyWebhook({
    rawBody: JSON.stringify(payload),
    payload,
    routingSecret: ROUTING_SECRET,
    repository: new MemoryOnboardingRepository(),
    getProject,
  })

  assert.equal(result.status, 'received_for_review')
  assert.equal(result.record.projectId, secondProject.projectId)
})

test('valid Tally submission is received for review and does not complete checklist items', async () => {
  const repository = new MemoryOnboardingRepository()
  const payload = tallyPayload()
  const result = await processTallyWebhook({
    rawBody: JSON.stringify(payload),
    payload,
    routingSecret: ROUTING_SECRET,
    repository,
    getProject,
    receivedAt: '2026-01-01T00:00:00.000Z',
  })

  assert.equal(result.status, 'received_for_review')
  assert.equal(result.record.projectId, churchProject.projectId)
  assert.equal(Object.hasOwn(result.record, 'done'), false)
})

test('all eight repeatable forms keep a submission ledger separate from completion', async () => {
  assert.deepEqual(REPEATABLE_FORM_KEYS, [
    'f-staff',
    'f-ministry',
    'f-crew',
    'f-small-group',
    'f-event',
    'f-course',
    'f-testimony',
    'f-faq',
  ])
  assert.equal(isRepeatableFormKey('gs-form'), false)

  for (const itemKey of REPEATABLE_FORM_KEYS) {
    const form = CURRENT_CLC_FORM_MAPPINGS.find((entry) => entry.itemKey === itemKey)
    assert.ok(form)
    const repository = new MemoryOnboardingRepository()
    const first = tallyPayload({
      submissionId: `${itemKey}-1`,
      itemKey,
      formId: form.formId,
    })
    const second = tallyPayload({
      submissionId: `${itemKey}-2`,
      itemKey,
      formId: form.formId,
    })

    await processTallyWebhook({
      rawBody: JSON.stringify(first),
      payload: first,
      routingSecret: ROUTING_SECRET,
      repository,
      getProject,
      receivedAt: '2026-01-01T00:00:00.000Z',
    })
    await processTallyWebhook({
      rawBody: JSON.stringify(second),
      payload: second,
      routingSecret: ROUTING_SECRET,
      repository,
      getProject,
      receivedAt: '2026-01-02T00:00:00.000Z',
    })

    const summary = summarizeFormSubmissions({
      projectId: churchProject.projectId,
      itemKey,
      records: repository.snapshot(),
    })

    assert.equal(summary.submissionCount, 2, itemKey)
    assert.equal(summary.collectionComplete, false, itemKey)
    assert.equal(summary.entries[0].label, 'Synthetic Person', itemKey)
  }
})

test('client collection confirmation, reopening, and late submissions stay separate', () => {
  const records = [
    {
      idempotencyKey: 'tally:staff-1',
      provider: 'tally' as const,
      projectId: churchProject.projectId,
      formId: '814oZl',
      itemKey: 'f-staff',
      submissionId: 'staff-1',
      entryTitle: 'Ada Staff',
      status: 'received_for_review' as const,
      receivedAt: '2026-01-01T00:00:00.000Z',
      attempts: 0,
    },
    {
      idempotencyKey: 'tally:staff-late',
      provider: 'tally' as const,
      projectId: churchProject.projectId,
      formId: '814oZl',
      itemKey: 'f-staff',
      submissionId: 'staff-late',
      entryTitle: null,
      status: 'received_for_review' as const,
      receivedAt: '2026-01-03T00:00:00.000Z',
      attempts: 0,
    },
  ]

  const confirmed = summarizeFormSubmissions({
    projectId: churchProject.projectId,
    itemKey: 'f-staff',
    records,
    status: {
      projectId: churchProject.projectId,
      itemKey: 'f-staff',
      collectionComplete: true,
      confirmedAt: '2026-01-02T00:00:00.000Z',
      confirmedBy: 'client-portal:alpha-church',
    },
  })
  const reopened = summarizeFormSubmissions({
    projectId: churchProject.projectId,
    itemKey: 'f-staff',
    records,
    status: {
      projectId: churchProject.projectId,
      itemKey: 'f-staff',
      collectionComplete: false,
      confirmedAt: '2026-01-02T00:00:00.000Z',
      confirmedBy: 'client-portal:alpha-church',
      reopenedAt: '2026-01-04T00:00:00.000Z',
      reopenedBy: 'client-portal:alpha-church',
    },
  })

  assert.equal(confirmed.collectionComplete, true)
  assert.equal(confirmed.lateSubmissionCount, 1)
  assert.equal(confirmed.entries[1].label, 'Unknown submission 2')
  assert.equal(confirmed.entries[1].status, 'received_after_confirmation')
  assert.equal(reopened.collectionComplete, false)
  assert.equal(reopened.reopenedAt, '2026-01-04T00:00:00.000Z')
})

test('missing, tampered, unknown, and mismatched routing enter review', async () => {
  const cases = [
    {name: 'missing', payload: tallyPayload({token: null}), reason: 'missing_routing'},
    {
      name: 'tampered',
      payload: tallyPayload({token: 'not.a.valid-token'}),
      reason: 'invalid_routing',
    },
    {
      name: 'unknown project',
      payload: tallyPayload({
        projectId: 'portal-missing-999',
        token: createOnboardingRouteToken(
          {projectId: 'portal-missing-999', itemKey: 'f-staff', formId: '814oZl'},
          ROUTING_SECRET,
        ),
      }),
      reason: 'unknown_project',
    },
    {
      name: 'mismatched form',
      payload: tallyPayload({
        formId: '0QRre9',
        token: createOnboardingRouteToken(
          {projectId: churchProject.projectId, itemKey: 'f-staff', formId: '0QRre9'},
          ROUTING_SECRET,
        ),
      }),
      reason: 'mismatched_form',
    },
  ] as const

  for (const entry of cases) {
    const repository = new MemoryOnboardingRepository()
    const result = await processTallyWebhook({
      rawBody: JSON.stringify(entry.payload),
      payload: entry.payload,
      routingSecret: ROUTING_SECRET,
      repository,
      getProject,
    })
    assert.equal(result.status, 'needs_review', entry.name)
    assert.equal(result.record.reviewReason, entry.reason, entry.name)
  }
})

test('duplicate submission ids are idempotent', async () => {
  const repository = new MemoryOnboardingRepository()
  const payload = tallyPayload({submissionId: 'dupe-1'})

  const first = await processTallyWebhook({
    rawBody: JSON.stringify(payload),
    payload,
    routingSecret: ROUTING_SECRET,
    repository,
    getProject,
  })
  const second = await processTallyWebhook({
    rawBody: JSON.stringify(payload),
    payload,
    routingSecret: ROUTING_SECRET,
    repository,
    getProject,
  })

  assert.equal(first.status, 'received_for_review')
  assert.equal(second.status, 'duplicate')
  assert.equal(repository.snapshot().length, 1)
})

function idempotencyKeyFromSupabaseUrl(url: string) {
  const match = url.match(/idempotency_key=eq\.([^&]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

function supabaseHttpResponse(status: number, body = '') {
  // The Fetch Response constructor rejects null-body statuses. Real fetch responses can still be 204.
  if (status === 204 || status === 205 || status === 304) {
    return {
      ok: status >= 200 && status < 300,
      status,
      text: async () => '',
    } as Response
  }
  return new Response(body, {status})
}

test('Supabase repository accepts empty successful PATCH responses for unknown-project review records', async () => {
  const originalFetch = globalThis.fetch

  for (const emptySuccess of [204, 200] as const) {
    const rows = new Map<string, any>()
    const patchBodies: any[] = []
    const submissionId = `unknown-empty-patch-${emptySuccess}`

    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      const text = String(url)
      const method = init?.method ?? 'GET'

      if (method === 'POST' && text.includes('/rest/v1/onboarding_submissions')) {
        const row = JSON.parse(String(init?.body))
        if (rows.has(row.idempotency_key)) return Response.json([])
        rows.set(row.idempotency_key, row)
        return Response.json([row])
      }

      if (method === 'PATCH' && text.includes('/rest/v1/onboarding_submissions')) {
        const key = idempotencyKeyFromSupabaseUrl(text)
        assert.ok(key)
        const patch = JSON.parse(String(init?.body))
        patchBodies.push(patch)
        rows.set(key, {...rows.get(key), ...patch})
        return supabaseHttpResponse(emptySuccess, '')
      }

      if (method === 'GET' && text.includes('/rest/v1/onboarding_submissions')) {
        const key = idempotencyKeyFromSupabaseUrl(text)
        const row = key ? rows.get(key) : null
        return Response.json(row ? [row] : [])
      }

      return new Response('not found', {status: 404})
    }) as typeof fetch

    try {
      const repository = new SupabaseOnboardingRepository({
        url: 'https://example.supabase.co',
        serviceRoleKey: 'service-role',
      })
      const unknownProjectId = 'portal-unknown-404'
      const payload = tallyPayload({
        submissionId,
        projectId: unknownProjectId,
        token: createOnboardingRouteToken(
          {projectId: unknownProjectId, itemKey: 'f-staff', formId: '814oZl'},
          ROUTING_SECRET,
        ),
      })

      const first = await processTallyWebhook({
        rawBody: JSON.stringify(payload),
        payload,
        routingSecret: ROUTING_SECRET,
        repository,
        getProject: async () => null,
      })
      const duplicate = await processTallyWebhook({
        rawBody: JSON.stringify(payload),
        payload,
        routingSecret: ROUTING_SECRET,
        repository,
        getProject: async () => null,
      })
      const stored = rows.get(`tally:${submissionId}`)

      assert.equal(first.httpStatus, 202, String(emptySuccess))
      assert.equal(first.status, 'needs_review', String(emptySuccess))
      assert.equal(first.record.reviewReason, 'unknown_project', String(emptySuccess))
      assert.equal(duplicate.httpStatus, 200, String(emptySuccess))
      assert.equal(duplicate.status, 'duplicate', String(emptySuccess))
      assert.equal(duplicate.record.reviewReason, 'unknown_project', String(emptySuccess))
      assert.equal(patchBodies.length, 1, String(emptySuccess))
      assert.equal(stored.status, 'needs_review', String(emptySuccess))
      assert.equal(stored.last_error, null, String(emptySuccess))
      assert.notEqual(stored.status, 'queued_for_retry', String(emptySuccess))
    } finally {
      globalThis.fetch = originalFetch
    }
  }
})

test('Supabase repository preserves malformed JSON and non-ok response failures', async () => {
  const originalFetch = globalThis.fetch

  globalThis.fetch = (async () => new Response('not-json', {status: 200})) as typeof fetch
  try {
    const repository = new SupabaseOnboardingRepository({
      url: 'https://example.supabase.co',
      serviceRoleKey: 'service-role',
    })
    const payload = tallyPayload({submissionId: 'malformed-json-1'})

    await assert.rejects(
      () =>
        processTallyWebhook({
          rawBody: JSON.stringify(payload),
          payload,
          routingSecret: ROUTING_SECRET,
          repository,
          getProject,
        }),
      /Supabase response was not valid JSON/,
    )
  } finally {
    globalThis.fetch = originalFetch
  }

  const rows = new Map<string, any>()
  let patchCalls = 0
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    const text = String(url)
    const method = init?.method ?? 'GET'

    if (method === 'POST' && text.includes('/rest/v1/onboarding_submissions')) {
      const row = JSON.parse(String(init?.body))
      rows.set(row.idempotency_key, row)
      return Response.json([row])
    }

    if (method === 'GET' && text.includes('/rest/v1/onboarding_submissions')) {
      const key = idempotencyKeyFromSupabaseUrl(text)
      const row = key ? rows.get(key) : null
      return Response.json(row ? [row] : [])
    }

    if (method === 'PATCH' && text.includes('/rest/v1/onboarding_submissions')) {
      patchCalls += 1
      if (patchCalls === 1) return new Response('write refused', {status: 500})

      const key = idempotencyKeyFromSupabaseUrl(text)
      assert.ok(key)
      rows.set(key, {...rows.get(key), ...JSON.parse(String(init?.body))})
      return supabaseHttpResponse(204)
    }

    return new Response('not found', {status: 404})
  }) as typeof fetch

  try {
    const repository = new SupabaseOnboardingRepository({
      url: 'https://example.supabase.co',
      serviceRoleKey: 'service-role',
    })
    const payload = tallyPayload({submissionId: 'non-ok-patch-1'})

    const result = await processTallyWebhook({
      rawBody: JSON.stringify(payload),
      payload,
      routingSecret: ROUTING_SECRET,
      repository,
      getProject,
    })
    const stored = rows.get('tally:non-ok-patch-1')

    assert.equal(result.status, 'queued_for_retry')
    assert.equal(result.record.attempts, 1)
    assert.match(result.record.lastError ?? '', /Supabase request failed with 500: write refused/)
    assert.equal(stored.status, 'queued_for_retry')
    assert.equal(stored.attempts, 1)
    assert.match(stored.last_error, /Supabase request failed with 500: write refused/)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('Sanity durable repository uses atomic create-if-not-exists for concurrent idempotency', async () => {
  const documents = new Map<string, any>()
  const fakeClient = {
    async createIfNotExists(document: any) {
      const existing = documents.get(document._id)
      if (existing) return existing
      documents.set(document._id, document)
      return document
    },
    async fetch(query: string, params?: Record<string, unknown>) {
      if (query.includes('status == "queued_for_retry"')) {
        return [...documents.values()].filter((document) => document.status === 'queued_for_retry')
      }
      return documents.get(String(params?.id)) ?? null
    },
    patch(id: string) {
      return {
        set(attrs: Record<string, unknown>) {
          return {
            unset(unsetAttrs: string[]) {
              return {
                async commit() {
                  const document = documents.get(id)
                  documents.set(id, {...document, ...attrs})
                  for (const attr of unsetAttrs) delete documents.get(id)?.[attr]
                },
              }
            },
            async commit() {
              documents.set(id, {...documents.get(id), ...attrs})
            },
          }
        },
        inc(attrs: Record<string, number>) {
          return {
            set(setAttrs: Record<string, unknown>) {
              return {
                async commit() {
                  const document = documents.get(id) ?? {}
                  const next = {...document, ...setAttrs}
                  for (const [key, value] of Object.entries(attrs)) {
                    next[key] = Number(next[key] ?? 0) + value
                  }
                  documents.set(id, next)
                },
              }
            },
          }
        },
      }
    },
  }
  const repository = new SanityOnboardingRepository(fakeClient)
  const record = {
    idempotencyKey: 'tally:concurrent-1',
    provider: 'tally' as const,
    projectId: churchProject.projectId,
    formId: '814oZl',
    itemKey: 'f-staff',
    submissionId: 'concurrent-1',
    status: 'received_for_review' as const,
    receivedAt: '2026-01-01T00:00:00.000Z',
    attempts: 0,
  }

  const results = await Promise.all([repository.recordOnce(record), repository.recordOnce(record)])

  assert.equal(results.filter((result) => result.created).length, 1)
  assert.equal(documents.size, 1)
  assert.ok(documents.has(onboardingSubmissionDocumentId(record.idempotencyKey)))
})

test('downstream failures retry without duplicate review records', async () => {
  const repository = new MemoryOnboardingRepository()
  let calls = 0
  const sink: OnboardingReviewSink = {
    async enqueue() {
      calls += 1
      if (calls === 1) throw new Error('Synthetic downstream outage')
    },
  }
  const payload = tallyPayload({submissionId: 'retry-1'})

  const first = await processTallyWebhook({
    rawBody: JSON.stringify(payload),
    payload,
    routingSecret: ROUTING_SECRET,
    repository,
    getProject,
    reviewSink: sink,
  })
  const retry = await retryFailedOnboardingSyncs({repository, reviewSink: sink})

  assert.equal(first.status, 'queued_for_retry')
  assert.deepEqual(retry, [{idempotencyKey: 'tally:retry-1', ok: true}])
  assert.equal(repository.snapshot().length, 1)
  assert.equal(calls, 2)
})

test('Tally signatures reject unauthorized webhook bodies', () => {
  const body = JSON.stringify(tallyPayload())
  const signature = createTallySignature(body, WEBHOOK_SECRET)

  assert.equal(
    verifyTallySignature({rawBody: body, signature, signingSecret: WEBHOOK_SECRET}),
    true,
  )
  assert.equal(
    verifyTallySignature({
      rawBody: JSON.stringify({...tallyPayload(), submissionId: 'changed'}),
      signature,
      signingSecret: WEBHOOK_SECRET,
    }),
    false,
  )
})

test('Drive arrivals are evidence only and arbitrary folders cannot complete assets', () => {
  const known = classifyDriveArrival({
    signal: {fileId: 'file-1', folderId: 'drive-media-alpha'},
    project: churchProject,
    routingSecret: ROUTING_SECRET,
  })
  const unknown = classifyDriveArrival({
    signal: {fileId: 'file-2', folderId: 'random-folder'},
    project: churchProject,
    routingSecret: ROUTING_SECRET,
  })

  assert.equal(known.status, 'candidate_evidence')
  assert.equal(unknown.status, 'needs_review')
})

test('Google Drive checker reads metadata only and rejects wrong folders', async () => {
  const requestedUrls: string[] = []
  const checker = new GoogleDriveMetadataChecker({
    accessToken: 'sandbox-token',
    routingSecret: ROUTING_SECRET,
    fetchImpl: async (url) => {
      requestedUrls.push(String(url))
      return new Response(
        JSON.stringify({
          id: 'file-1',
          name: 'Synthetic upload.jpg',
          parents: ['wrong-folder'],
          appProperties: {},
        }),
        {status: 200},
      )
    },
  })

  const result = await checker.checkFile({fileId: 'file-1', project: churchProject})

  assert.equal(result.status, 'needs_review')
  assert.equal(
    requestedUrls[0].includes('fields=id%2Cname%2Cparents%2CappProperties%2Ctrashed'),
    true,
  )
  assert.equal(requestedUrls[0].includes('alt=media'), false)
})

test('internal blockers go to Notion except Simcoe House Linear-owned work', () => {
  const record = {
    idempotencyKey: 'tally:needs-review-1',
    provider: 'tally' as const,
    projectId: churchProject.projectId,
    formId: '814oZl',
    itemKey: 'f-staff',
    submissionId: 'needs-review-1',
    status: 'needs_review' as const,
    reviewReason: 'invalid_routing' as const,
    receivedAt: '2026-01-01T00:00:00.000Z',
    attempts: 0,
  }

  assert.equal(planInternalTaskSync({project: churchProject, record}).system, 'notion')
  assert.deepEqual(planInternalTaskSync({project: simcoeProject, record}), {
    system: 'none',
    reason: 'project_owned_elsewhere',
  })
})

test('Notion adapter dedupes Salt-internal blocker tasks', async () => {
  const calls: Array<{path: string; body: any}> = []
  let createdPage = false
  const originalFetch = globalThis.fetch
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    const path = String(url).replace('https://api.notion.com/v1', '')
    const body = init?.body ? JSON.parse(String(init.body)) : null
    calls.push({path, body})

    if (path.endsWith('/query')) {
      return Response.json({results: createdPage ? [{id: 'page-1'}] : []})
    }
    if (path === '/pages') {
      createdPage = true
      return Response.json({id: 'page-1'})
    }
    if (path === '/pages/page-1') {
      return Response.json({id: 'page-1'})
    }
    return new Response('{}', {status: 404})
  }) as typeof fetch

  try {
    const sink = new NotionReviewSink({token: 'notion-token', databaseId: 'database-id'})
    const record = {
      idempotencyKey: 'tally:notion-dupe-1',
      provider: 'tally' as const,
      projectId: churchProject.projectId,
      formId: '814oZl',
      itemKey: 'f-staff',
      submissionId: 'notion-dupe-1',
      status: 'needs_review' as const,
      reviewReason: 'invalid_routing' as const,
      receivedAt: '2026-01-01T00:00:00.000Z',
      attempts: 0,
    }

    await sink.enqueue(record)
    await sink.enqueue(record)

    assert.equal(calls.filter((call) => call.path === '/pages').length, 1)
    assert.equal(
      calls.some((call) => call.path === '/pages/page-1'),
      true,
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('webhook and retry endpoints reject unauthorized requests before processing', async () => {
  process.env.TALLY_WEBHOOK_SECRET = WEBHOOK_SECRET
  process.env.ONBOARDING_ROUTING_SECRET = ROUTING_SECRET
  process.env.ONBOARDING_AUTOMATION_STORE = 'memory'
  process.env.ONBOARDING_JOB_SECRET = 'job-secret'

  const webhookRoute = await import('@/app/api/onboarding/tally/route')
  const retryRoute = await import('@/app/api/onboarding/jobs/retry/route')

  const webhookResponse = await webhookRoute.POST(
    new Request('http://localhost/api/onboarding/tally', {
      method: 'POST',
      body: JSON.stringify(tallyPayload()),
      headers: {'Tally-Signature': 'bad-signature'},
    }),
  )
  const retryResponse = await retryRoute.POST(
    new Request('http://localhost/api/onboarding/jobs/retry', {method: 'POST'}),
  )

  assert.equal(webhookResponse.status, 401)
  assert.equal(retryResponse.status, 401)
})

function restoreEnv(previous: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
}

test('preview fixture recognition is isolated and fails closed in production', async () => {
  const previous = {
    VERCEL_ENV: process.env.VERCEL_ENV,
    ONBOARDING_PREVIEW_ISOLATION: process.env.ONBOARDING_PREVIEW_ISOLATION,
  }
  const calls: string[] = []
  const sink: OnboardingReviewSink = {
    async enqueue(record) {
      calls.push(record.projectId ?? '')
    },
  }

  try {
    process.env.VERCEL_ENV = 'production'
    process.env.ONBOARDING_PREVIEW_ISOLATION = 'enabled'
    assert.equal(isPreviewIsolationEnabled(), false)
    assert.equal(getPreviewFixtureProject(PREVIEW_FIXTURE_PROJECT_ID), null)

    process.env.VERCEL_ENV = 'preview'
    delete process.env.ONBOARDING_PREVIEW_ISOLATION
    assert.equal(getPreviewFixtureProject(PREVIEW_FIXTURE_PROJECT_ID), null)

    process.env.ONBOARDING_PREVIEW_ISOLATION = 'enabled'
    const resolvedReal = await resolveOnboardingProject(
      churchProject.projectId,
      async () => churchProject,
    )
    assert.equal(resolvedReal?.projectId, churchProject.projectId)
    assert.equal(resolvedReal?.isolation, undefined)
    const resolvedFixture = await resolveOnboardingProject(
      PREVIEW_FIXTURE_PROJECT_ID,
      async () => null,
    )
    assert.equal(resolvedFixture?.isolation, 'preview-fixture')
    assert.equal(resolvedFixture?.forms.length, 9)

    const repository = new MemoryOnboardingRepository()
    const fixturePayload = tallyPayload({
      submissionId: 'shared-submission-id',
      projectId: PREVIEW_FIXTURE_PROJECT_ID,
      token: createOnboardingRouteToken(
        {projectId: PREVIEW_FIXTURE_PROJECT_ID, itemKey: 'f-staff', formId: '814oZl'},
        ROUTING_SECRET,
      ),
    })
    const realPayload = tallyPayload({submissionId: 'shared-submission-id'})
    const fixtureResult = await processTallyWebhook({
      rawBody: JSON.stringify(fixturePayload),
      payload: fixturePayload,
      routingSecret: ROUTING_SECRET,
      repository,
      getProject: async (projectId) =>
        projectId === churchProject.projectId ? churchProject : getPreviewFixtureProject(projectId),
      reviewSink: sink,
    })
    const realResult = await processTallyWebhook({
      rawBody: JSON.stringify(realPayload),
      payload: realPayload,
      routingSecret: ROUTING_SECRET,
      repository,
      getProject,
      reviewSink: sink,
    })
    const fixtureReview = tallyPayload({
      submissionId: 'fixture-review',
      projectId: PREVIEW_FIXTURE_PROJECT_ID,
      token: 'tampered-token',
    })
    await processTallyWebhook({
      rawBody: JSON.stringify(fixtureReview),
      payload: fixtureReview,
      routingSecret: ROUTING_SECRET,
      repository,
      getProject: async () => null,
      reviewSink: sink,
    })

    assert.equal(fixtureResult.status, 'received_for_review')
    assert.equal(fixtureResult.record.idempotencyKey, 'tally:preview-fixture:shared-submission-id')
    assert.equal(Object.hasOwn(fixtureResult.record, 'done'), false)
    assert.equal(realResult.status, 'received_for_review')
    assert.equal(realResult.record.idempotencyKey, 'tally:shared-submission-id')
    assert.deepEqual(calls, [churchProject.projectId])
    assert.equal(repository.snapshot().length, 3)
  } finally {
    restoreEnv(previous)
  }
})

test('preview cleanup removes only fixture rows and production cleanup fails closed', async () => {
  const previous = {
    ONBOARDING_AUTOMATION_STORE: process.env.ONBOARDING_AUTOMATION_STORE,
    ONBOARDING_JOB_SECRET: process.env.ONBOARDING_JOB_SECRET,
    VERCEL_ENV: process.env.VERCEL_ENV,
    ONBOARDING_PREVIEW_ISOLATION: process.env.ONBOARDING_PREVIEW_ISOLATION,
  }
  process.env.ONBOARDING_AUTOMATION_STORE = 'memory'
  process.env.ONBOARDING_JOB_SECRET = 'job-secret'
  process.env.VERCEL_ENV = 'preview'
  process.env.ONBOARDING_PREVIEW_ISOLATION = 'enabled'

  const {getOnboardingRepository} = await import('@/lib/onboarding/runtime')
  const repository = getOnboardingRepository()
  assert.ok(repository instanceof MemoryOnboardingRepository)
  await repository.recordOnce({
    idempotencyKey: 'tally:preview-fixture:cleanup-1',
    provider: 'tally',
    projectId: PREVIEW_FIXTURE_PROJECT_ID,
    formId: '814oZl',
    itemKey: 'f-staff',
    submissionId: 'cleanup-1',
    status: 'received_for_review',
    receivedAt: '2026-01-01T00:00:00.000Z',
    attempts: 0,
  })
  await repository.recordOnce({
    idempotencyKey: 'tally:cleanup-real',
    provider: 'tally',
    projectId: churchProject.projectId,
    formId: '814oZl',
    itemKey: 'f-staff',
    submissionId: 'cleanup-real',
    status: 'received_for_review',
    receivedAt: '2026-01-01T00:00:00.000Z',
    attempts: 0,
  })

  const route = await import('@/app/api/onboarding/jobs/preview-cleanup/route')
  try {
    const unauthorized = await route.POST(
      new Request('http://localhost/api/onboarding/jobs/preview-cleanup', {method: 'POST'}),
    )
    assert.equal(unauthorized.status, 401)

    process.env.VERCEL_ENV = 'production'
    const production = await route.POST(
      new Request('http://localhost/api/onboarding/jobs/preview-cleanup', {
        method: 'POST',
        headers: {authorization: 'Bearer job-secret'},
      }),
    )
    assert.equal(production.status, 404)
    assert.equal(
      repository
        .snapshot()
        .some((record) => record.idempotencyKey === 'tally:preview-fixture:cleanup-1'),
      true,
    )

    process.env.VERCEL_ENV = 'preview'
    const cleaned = await route.POST(
      new Request('http://localhost/api/onboarding/jobs/preview-cleanup', {
        method: 'POST',
        headers: {authorization: 'Bearer job-secret'},
      }),
    )
    const body = await cleaned.json()
    assert.equal(cleaned.status, 200)
    assert.equal(body.deleted, 1)
    assert.equal(
      repository.snapshot().some((record) => record.projectId === PREVIEW_FIXTURE_PROJECT_ID),
      false,
    )
    assert.equal(
      repository.snapshot().some((record) => record.idempotencyKey === 'tally:cleanup-real'),
      true,
    )
  } finally {
    await repository.deleteIsolatedPreviewSubmissions()
    restoreEnv(previous)
  }
})

test('isolated request script refuses production and does not print secrets', () => {
  const production = spawnSync('npm', ['run', 'preview:onboarding:isolated'], {
    encoding: 'utf8',
    env: {
      ...process.env,
      VERCEL_ENV: 'production',
      ONBOARDING_PREVIEW_ISOLATION: 'enabled',
      ONBOARDING_ROUTING_SECRET: 'routing-secret-value',
      TALLY_WEBHOOK_SECRET: 'tally-webhook-secret-value',
    },
  })
  assert.notEqual(production.status, 0)
  assert.equal(production.stdout.includes('routing-secret-value'), false)
  assert.equal(production.stdout.includes('Tally-Signature'), false)

  const productionHost = spawnSync('npm', ['run', 'preview:onboarding:isolated'], {
    encoding: 'utf8',
    env: {
      ...process.env,
      VERCEL_ENV: 'preview',
      ONBOARDING_PREVIEW_ISOLATION: 'enabled',
      ONBOARDING_ROUTING_SECRET: 'routing-secret-value',
      TALLY_WEBHOOK_SECRET: 'tally-webhook-secret-value',
      ONBOARDING_PREVIEW_ORIGIN: 'https://www.createdbysalt.com',
    },
  })
  assert.notEqual(productionHost.status, 0)
  assert.equal(productionHost.stdout.includes('Tally-Signature'), false)
  assert.equal(productionHost.stdout.includes('routing-secret-value'), false)
})

test('Drive scanner dedupes mapped folders, keeps unknown categories, and does not auto-complete', async () => {
  assert.equal(parseDriveScanRequest({projectId: 'fixture', mappings: []}).ok, false)
  assert.equal(
    parseDriveScanRequest({
      projectId: 'fixture',
      mappings: [{itemKey: 'photos-baptisms', folderIds: ["folder'injection"]}],
    }).ok,
    false,
  )

  const requests: Array<{url: string; method: string}> = []
  const pages = new Map<string, Array<{files: unknown[]; nextPageToken?: string}>>([
    [
      'fixtureBaptismFolderA',
      [
        {
          files: [
            {
              id: 'shared-file',
              name: 'Shared.jpg',
              mimeType: 'image/jpeg',
              parents: ['fixtureBaptismFolderA'],
            },
            {
              id: 'subfolder-unknown',
              name: 'Misc',
              mimeType: 'application/vnd.google-apps.folder',
              parents: ['fixtureBaptismFolderA'],
            },
          ],
          nextPageToken: 'page-2',
        },
        {
          files: [
            {
              id: 'baptism-file',
              name: 'Baptism.jpg',
              mimeType: 'image/jpeg',
              parents: ['fixtureBaptismFolderA'],
            },
          ],
        },
      ],
    ],
    [
      'fixtureBaptismFolderB',
      [
        {
          files: [
            {
              id: 'shared-file',
              name: 'Shared.jpg',
              mimeType: 'image/jpeg',
              parents: ['fixtureBaptismFolderB'],
            },
            {
              id: 'second-baptism',
              name: 'Second.jpg',
              mimeType: 'image/jpeg',
              parents: ['fixtureBaptismFolderB'],
            },
          ],
        },
      ],
    ],
    [
      'fixtureDedicationFolder',
      [
        {
          files: [
            {
              id: 'shared-file',
              name: 'Shared.jpg',
              mimeType: 'image/jpeg',
              parents: ['fixtureDedicationFolder'],
            },
            {
              id: 'dedication-file',
              name: 'Dedication.jpg',
              mimeType: 'image/jpeg',
              parents: ['fixtureDedicationFolder'],
            },
          ],
        },
      ],
    ],
    [
      'subfolder-unknown',
      [
        {
          files: [
            {
              id: 'unknown-file',
              name: 'Unsorted.jpg',
              mimeType: 'image/jpeg',
              parents: ['subfolder-unknown'],
            },
          ],
        },
      ],
    ],
  ])
  const cursors = new Map<string, number>()
  const fetchImpl: typeof fetch = async (url, init) => {
    const text = String(url)
    requests.push({url: text, method: init?.method ?? 'GET'})
    const parsed = new URL(text)
    const query = parsed.searchParams.get('q') ?? ''
    const folderId = query.match(/^'([^']+)' in parents/)?.[1]
    assert.ok(folderId)
    const pageIndex = cursors.get(folderId) ?? 0
    cursors.set(folderId, pageIndex + 1)
    const page = pages.get(folderId)?.[pageIndex]
    assert.ok(page)
    return Response.json(page)
  }

  const scanner = new GoogleDriveFolderScanner({accessToken: 'read-only-token', fetchImpl})
  const request = {
    projectId: 'fixture-project',
    mappings: [
      {itemKey: 'photos-baptisms', folderIds: ['fixtureBaptismFolderA', 'fixtureBaptismFolderB']},
      {itemKey: 'photos-dedications', folderIds: ['fixtureDedicationFolder']},
    ],
  }
  const first = await scanner.scan(request)
  cursors.clear()
  const second = await scanner.scan(request)
  const baptisms = first.items.find((item) => item.itemKey === 'photos-baptisms')
  const dedications = first.items.find((item) => item.itemKey === 'photos-dedications')

  assert.equal(baptisms?.fileCount, 2)
  assert.deepEqual(baptisms?.files.map((file) => file.fileId).sort(), [
    'baptism-file',
    'second-baptism',
  ])
  assert.equal(dedications?.fileCount, 1)
  assert.equal(dedications?.files[0].fileId, 'dedication-file')
  assert.equal(first.unknown[0].category, 'unknown')
  assert.equal(first.unknown[0].fileId, 'unknown-file')
  assert.deepEqual(first.ambiguous, [
    {fileId: 'shared-file', itemKeys: ['photos-baptisms', 'photos-dedications']},
  ])
  assert.equal(first.autoCompletedItemKeys.length, 0)
  assert.equal(baptisms?.autoCompleted, false)
  assert.equal(baptisms?.countRole, 'guidance_only')
  assert.equal(first.formatValid, null)
  assert.equal(first.qualityApproved, null)
  assert.equal(first.clientConfirmed, null)
  assert.deepEqual(
    second.items.map((item) => item.fileCount),
    first.items.map((item) => item.fileCount),
  )
  assert.equal(
    requests.every((request) => request.method === 'GET'),
    true,
  )
  assert.equal(
    requests.every((request) => request.url.includes('supportsAllDrives=true')),
    true,
  )
  assert.equal(
    requests.every((request) => request.url.includes('includeItemsFromAllDrives=true')),
    true,
  )
  assert.equal(
    requests.every((request) => request.url.includes('alt=media')),
    false,
  )
  assert.equal(
    requests.some((request) => request.url.includes('pageToken=page-2')),
    true,
  )
})

test('Drive scanner stops on rate limits and the job route stays disabled by default', async () => {
  let calls = 0
  const scanner = new GoogleDriveFolderScanner({
    accessToken: 'read-only-token',
    fetchImpl: async () => {
      calls += 1
      return new Response('rate limited', {status: 429})
    },
  })
  const summary = await scanner.scan({
    projectId: 'fixture-project',
    mappings: [
      {itemKey: 'photos-baptisms', folderIds: ['fixtureBaptismFolderA']},
      {itemKey: 'photos-dedications', folderIds: ['fixtureDedicationFolder']},
    ],
  })
  assert.equal(summary.stoppedReason, 'rate_limited')
  assert.equal(calls, 1)
  assert.equal(
    summary.items.every((item) => item.autoCompleted === false),
    true,
  )

  const previous = {
    ONBOARDING_JOB_SECRET: process.env.ONBOARDING_JOB_SECRET,
    ONBOARDING_DRIVE_SCAN: process.env.ONBOARDING_DRIVE_SCAN,
    GOOGLE_DRIVE_ACCESS_TOKEN: process.env.GOOGLE_DRIVE_ACCESS_TOKEN,
  }
  process.env.ONBOARDING_JOB_SECRET = 'job-secret'
  delete process.env.ONBOARDING_DRIVE_SCAN
  delete process.env.GOOGLE_DRIVE_ACCESS_TOKEN
  const originalFetch = globalThis.fetch
  let routedCalls = 0
  globalThis.fetch = (async () => {
    routedCalls += 1
    return new Response('{}', {status: 200})
  }) as typeof fetch
  const route = await import('@/app/api/onboarding/jobs/drive-scan/route')

  try {
    const unauthorized = await route.POST(
      new Request('http://localhost/api/onboarding/jobs/drive-scan', {method: 'POST', body: '{}'}),
    )
    assert.equal(unauthorized.status, 401)

    const disabled = await route.POST(
      new Request('http://localhost/api/onboarding/jobs/drive-scan', {
        method: 'POST',
        headers: {authorization: 'Bearer job-secret'},
        body: JSON.stringify({
          projectId: 'fixture-project',
          mappings: [{itemKey: 'photos-baptisms', folderIds: ['fixtureBaptismFolderA']}],
        }),
      }),
    )
    assert.equal(disabled.status, 503)
    assert.equal(routedCalls, 0)

    process.env.ONBOARDING_DRIVE_SCAN = 'enabled'
    const missingCredentials = await route.POST(
      new Request('http://localhost/api/onboarding/jobs/drive-scan', {
        method: 'POST',
        headers: {authorization: 'Bearer job-secret'},
        body: JSON.stringify({
          projectId: 'fixture-project',
          mappings: [{itemKey: 'photos-baptisms', folderIds: ['fixtureBaptismFolderA']}],
        }),
      }),
    )
    assert.equal(missingCredentials.status, 503)
    assert.equal(routedCalls, 0)
  } finally {
    globalThis.fetch = originalFetch
    restoreEnv(previous)
  }
})
