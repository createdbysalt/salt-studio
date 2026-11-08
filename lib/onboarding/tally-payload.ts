import {
  extractTallyFormId,
  ONBOARDING_FORM_ID_PARAM,
  ONBOARDING_ITEM_KEY_PARAM,
  ONBOARDING_PROJECT_ID_PARAM,
  ONBOARDING_ROUTE_TOKEN_PARAM,
} from '@/lib/onboarding/routing'
import type {NormalizedTallySubmission} from '@/lib/onboarding/types'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function readPath(root: unknown, path: string[]) {
  let current = root
  for (const key of path) {
    if (!isRecord(current)) return null
    current = current[key]
  }
  return readString(current)
}

function readFirstString(root: unknown, paths: string[][]) {
  for (const path of paths) {
    const value = readPath(root, path)
    if (value) return value
  }
  return null
}

function collectHiddenFields(payload: unknown) {
  const fields: Record<string, string> = {}

  function add(name: unknown, value: unknown) {
    const key = readString(name)
    const text = readString(value)
    if (key && text) fields[key] = text
  }

  function visit(value: unknown) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (!isRecord(item)) continue
        const name = item.key ?? item.name ?? item.label ?? item.title
        const answer = item.value ?? item.answer ?? item.text
        add(name, answer)
      }
      return
    }

    if (!isRecord(value)) return
    for (const [key, fieldValue] of Object.entries(value)) {
      if (typeof fieldValue === 'string') add(key, fieldValue)
    }
  }

  if (isRecord(payload)) {
    visit(payload.hiddenFields)
    visit(payload.fields)
    if (isRecord(payload.data)) {
      visit(payload.data.hiddenFields)
      visit(payload.data.fields)
    }
  }

  return fields
}

function collectAnswerFields(payload: unknown) {
  const fields: Record<string, string> = {}

  function add(name: unknown, value: unknown) {
    const key = readString(name)
    const text = readString(value)
    if (key && text) fields[key.toLowerCase()] = text
  }

  function visit(value: unknown) {
    if (!Array.isArray(value)) return
    for (const item of value) {
      if (!isRecord(item)) continue
      const name = item.key ?? item.name ?? item.label ?? item.title
      const answer = item.value ?? item.answer ?? item.text
      add(name, answer)
    }
  }

  if (isRecord(payload)) {
    visit(payload.fields)
    if (isRecord(payload.data)) visit(payload.data.fields)
  }

  return fields
}

function entryTitleFromAnswers(fields: Record<string, string>) {
  const identityKeys = [
    'name',
    'full_name',
    'full name',
    'staff_name',
    'staff name',
    'ministry_name',
    'ministry name',
    'team_name',
    'team name',
    'group_name',
    'group name',
    'event_name',
    'event name',
    'course_name',
    'course name',
    'story_title',
    'story title',
    'faq_category',
    'faq category',
    'title',
  ]

  for (const key of identityKeys) {
    const value = fields[key]
    if (value) return value
  }

  return null
}

export function normalizeTallyWebhookPayload(
  payload: unknown,
  receivedAt = new Date().toISOString(),
): NormalizedTallySubmission {
  const hidden = collectHiddenFields(payload)
  const answers = collectAnswerFields(payload)
  const formId =
    readFirstString(payload, [
      ['formId'],
      ['form_id'],
      ['data', 'formId'],
      ['data', 'form_id'],
      ['form', 'id'],
      ['data', 'form', 'id'],
    ]) ??
    hidden[ONBOARDING_FORM_ID_PARAM] ??
    extractTallyFormId(readFirstString(payload, [['formUrl'], ['data', 'formUrl']]))

  return {
    provider: 'tally',
    submissionId: readFirstString(payload, [
      ['submissionId'],
      ['submission_id'],
      ['responseId'],
      ['response_id'],
      ['eventId'],
      ['data', 'submissionId'],
      ['data', 'submission_id'],
      ['data', 'responseId'],
      ['data', 'response_id'],
    ]),
    formId,
    projectId: hidden[ONBOARDING_PROJECT_ID_PARAM] ?? null,
    itemKey: hidden[ONBOARDING_ITEM_KEY_PARAM] ?? null,
    routeToken: hidden[ONBOARDING_ROUTE_TOKEN_PARAM] ?? null,
    entryTitle: entryTitleFromAnswers(answers),
    receivedAt,
  }
}
