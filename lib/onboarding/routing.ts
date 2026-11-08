import {createHmac, timingSafeEqual} from 'node:crypto'

export const ONBOARDING_PROJECT_ID_PARAM = 'project_id'
export const ONBOARDING_FORM_ID_PARAM = 'form_id'
export const ONBOARDING_ITEM_KEY_PARAM = 'item_key'
export const ONBOARDING_ROUTE_TOKEN_PARAM = 'salt_route'

const TALLY_HOSTS = new Set(['tally.so', 'www.tally.so'])
const TOKEN_VERSION = 1

export type OnboardingRoutePayload = {
  v: typeof TOKEN_VERSION
  projectId: string
  formId: string
  itemKey: string
}

export type RouteValidationResult =
  | {ok: true; payload: OnboardingRoutePayload}
  | {
      ok: false
      reason:
        | 'missing_token'
        | 'malformed_token'
        | 'unsupported_version'
        | 'invalid_signature'
        | 'project_mismatch'
        | 'form_mismatch'
        | 'item_mismatch'
    }

function base64UrlEncode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function signPayload(encodedPayload: string, secret: string) {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url')
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

export function extractTallyFormId(rawUrl: string | null | undefined) {
  if (!rawUrl) return null
  try {
    const url = new URL(rawUrl)
    if (!TALLY_HOSTS.has(url.hostname)) return null
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts[0] === 'r' && parts[1]) return parts[1]
    if (parts[0] === 'forms' && parts[1]) return parts[1]
    return null
  } catch {
    return null
  }
}

export function createOnboardingRouteToken(
  payload: Omit<OnboardingRoutePayload, 'v'>,
  secret: string,
) {
  const encodedPayload = base64UrlEncode(JSON.stringify({v: TOKEN_VERSION, ...payload}))
  return `${encodedPayload}.${signPayload(encodedPayload, secret)}`
}

export function validateOnboardingRouteToken({
  token,
  secret,
  projectId,
  formId,
  itemKey,
}: {
  token: string | null | undefined
  secret: string
  projectId?: string | null
  formId?: string | null
  itemKey?: string | null
}): RouteValidationResult {
  if (!token) return {ok: false, reason: 'missing_token'}

  const [encodedPayload, signature, extra] = token.split('.')
  if (!encodedPayload || !signature || extra) return {ok: false, reason: 'malformed_token'}

  const expectedSignature = signPayload(encodedPayload, secret)
  if (!safeEqual(signature, expectedSignature)) return {ok: false, reason: 'invalid_signature'}

  let payload: OnboardingRoutePayload
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload)) as OnboardingRoutePayload
  } catch {
    return {ok: false, reason: 'malformed_token'}
  }

  if (payload.v !== TOKEN_VERSION) return {ok: false, reason: 'unsupported_version'}
  if (!payload.projectId || !payload.formId || !payload.itemKey) {
    return {ok: false, reason: 'malformed_token'}
  }
  if (projectId && projectId !== payload.projectId) return {ok: false, reason: 'project_mismatch'}
  if (formId && formId !== payload.formId) return {ok: false, reason: 'form_mismatch'}
  if (itemKey && itemKey !== payload.itemKey) return {ok: false, reason: 'item_mismatch'}

  return {ok: true, payload}
}

export function appendOnboardingRoutingToTallyUrl({
  href,
  projectId,
  itemKey,
  secret,
}: {
  href: string | null | undefined
  projectId: string
  itemKey: string
  secret: string | null | undefined
}) {
  if (!href || !secret) return href ?? null

  const formId = extractTallyFormId(href)
  if (!formId) return href

  const url = new URL(href)
  url.searchParams.set(ONBOARDING_PROJECT_ID_PARAM, projectId)
  url.searchParams.set(ONBOARDING_FORM_ID_PARAM, formId)
  url.searchParams.set(ONBOARDING_ITEM_KEY_PARAM, itemKey)
  url.searchParams.set(
    ONBOARDING_ROUTE_TOKEN_PARAM,
    createOnboardingRouteToken({projectId, formId, itemKey}, secret),
  )
  return url.toString()
}
