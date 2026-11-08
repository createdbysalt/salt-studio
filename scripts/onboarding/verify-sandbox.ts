import {processTallyWebhook} from '@/lib/onboarding/processor'
import {MemoryOnboardingRepository} from '@/lib/onboarding/repository'
import {createOnboardingRouteToken} from '@/lib/onboarding/routing'
import type {OnboardingProcessResult, OnboardingProjectMapping} from '@/lib/onboarding/types'

const routingSecret = 'sandbox-routing-secret'

const forms = [
  {itemKey: 'gs-form', formId: 'yP5oEB'},
  {itemKey: 'f-staff', formId: '814oZl'},
  {itemKey: 'f-ministry', formId: '0QRre9'},
  {itemKey: 'f-crew', formId: 'zx5X7k'},
  {itemKey: 'f-small-group', formId: '5BPKZN'},
  {itemKey: 'f-event', formId: 'Y5lD4N'},
  {itemKey: 'f-course', formId: 'lbkD6o'},
  {itemKey: 'f-testimony', formId: 'RGyKPK'},
  {itemKey: 'f-faq', formId: 'obL6Gb'},
]

const clients: OnboardingProjectMapping[] = [
  {
    projectId: 'sandbox-client-a',
    portalSlug: 'sandbox-a',
    enabled: true,
    forms,
    internalTaskSystem: 'notion',
  },
  {
    projectId: 'sandbox-client-b',
    portalSlug: 'sandbox-b',
    enabled: true,
    forms: forms.filter((form) => form.itemKey !== 'gs-form'),
    internalTaskSystem: 'notion',
  },
]

function payload(projectId: string, itemKey: string, formId: string, submissionId: string) {
  return {
    submissionId,
    formId,
    fields: [
      {key: 'project_id', value: projectId},
      {key: 'form_id', value: formId},
      {key: 'item_key', value: itemKey},
      {
        key: 'salt_route',
        value: createOnboardingRouteToken({projectId, itemKey, formId}, routingSecret),
      },
    ],
  }
}

async function main() {
  const repository = new MemoryOnboardingRepository()
  const projectMap = new Map(clients.map((client) => [client.projectId, client]))

  const results: OnboardingProcessResult[] = []
  for (const client of clients) {
    for (const form of client.forms) {
      const body = payload(
        client.projectId,
        form.itemKey,
        form.formId,
        `${client.projectId}-${form.itemKey}`,
      )
      results.push(
        await processTallyWebhook({
          rawBody: JSON.stringify(body),
          payload: body,
          routingSecret,
          repository,
          getProject: async (projectId) => projectMap.get(projectId) ?? null,
        }),
      )
    }
  }

  const tampered = payload('sandbox-client-b', 'gs-form', 'yP5oEB', 'sandbox-tampered')
  tampered.fields[3] = {
    key: 'salt_route',
    value: createOnboardingRouteToken(
      {projectId: 'sandbox-client-a', itemKey: 'gs-form', formId: 'yP5oEB'},
      routingSecret,
    ),
  }
  results.push(
    await processTallyWebhook({
      rawBody: JSON.stringify(tampered),
      payload: tampered,
      routingSecret,
      repository,
      getProject: async (projectId) => projectMap.get(projectId) ?? null,
    }),
  )

  console.log(
    JSON.stringify(
      {
        mode: 'synthetic-sandbox',
        liveServicesTouched: false,
        receivedForReview: results.filter((result) => result.status === 'received_for_review')
          .length,
        needsReview: results.filter((result) => result.status === 'needs_review').length,
        duplicateRecords: repository.snapshot().length !== results.length,
        statuses: results.map((result) => ({
          status: result.status,
          projectId: result.record.projectId,
          formId: result.record.formId,
          itemKey: result.record.itemKey,
          reviewReason: result.record.reviewReason,
        })),
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
