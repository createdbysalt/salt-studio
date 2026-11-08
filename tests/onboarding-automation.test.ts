import assert from 'node:assert/strict'
import test from 'node:test'
import {classifyDriveArrival} from '@/lib/onboarding/drive'
import {planInternalTaskSync} from '@/lib/onboarding/internal-tasks'
import {processTallyWebhook, retryFailedOnboardingSyncs} from '@/lib/onboarding/processor'
import {MemoryOnboardingRepository} from '@/lib/onboarding/repository'
import {
  appendOnboardingRoutingToTallyUrl,
  createOnboardingRouteToken,
  ONBOARDING_PROJECT_ID_PARAM,
} from '@/lib/onboarding/routing'
import {createTallySignature, verifyTallySignature} from '@/lib/onboarding/tally-signature'
import type {OnboardingProjectMapping, OnboardingReviewSink} from '@/lib/onboarding/types'
import {CHURCH_TALLY_FORMS, CLIENT_GETTING_STARTED_OVERRIDES} from '@/lib/tally/church-forms'

const ROUTING_SECRET = 'test-routing-secret'
const WEBHOOK_SECRET = 'test-webhook-secret'

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
