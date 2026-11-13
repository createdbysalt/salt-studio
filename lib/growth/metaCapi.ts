import 'server-only'
import {createHash} from 'node:crypto'

/**
 * Server-side Meta Conversions API events for the growth funnel. They carry
 * the same event id the browser pushes to the dataLayer, so Meta counts each
 * event once. Sent only when the visitor allowed marketing cookies, and only
 * when META_PIXEL_ID and META_CAPI_TOKEN are set. Never throws: tracking must
 * not break a checkout or a webhook.
 */

export type MetaEvent = {
  name: 'InitiateCheckout' | 'Purchase'
  eventId: string
  email: string
  consent: boolean
  valueCents: number
  contentName: string
  sourceUrl: string
}

export function metaEventId(reportId: string, step: string) {
  return `growth-${reportId}-${step}`
}

export async function sendMetaEvent(event: MetaEvent) {
  const pixelId = process.env.META_PIXEL_ID
  const token = process.env.META_CAPI_TOKEN
  if (!pixelId || !token || !event.consent) return false

  const hashedEmail = createHash('sha256').update(event.email.trim().toLowerCase()).digest('hex')
  const version = process.env.META_GRAPH_VERSION
  const base = version ? `https://graph.facebook.com/${version}` : 'https://graph.facebook.com'
  const body = {
    data: [
      {
        event_name: event.name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        action_source: 'website',
        event_source_url: event.sourceUrl,
        user_data: {em: [hashedEmail]},
        custom_data: {
          value: event.valueCents / 100,
          currency: 'USD',
          content_name: event.contentName,
        },
      },
    ],
    ...(process.env.META_TEST_EVENT_CODE
      ? {test_event_code: process.env.META_TEST_EVENT_CODE}
      : {}),
  }

  try {
    const response = await fetch(`${base}/${encodeURIComponent(pixelId)}/events`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8_000),
    })
    if (!response.ok) {
      console.error(`[growth] Meta event ${event.name} was rejected with ${response.status}`)
      return false
    }
    return true
  } catch (error) {
    console.error(`[growth] Meta event ${event.name} failed`, error)
    return false
  }
}
