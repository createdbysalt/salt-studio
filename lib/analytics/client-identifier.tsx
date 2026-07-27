'use client'

import {useEffect} from 'react'
import {pushToDataLayer} from './gtm'

const CLIENT_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Unknown Client'

/**
 * Client Identifier
 *
 * Pushes client name to dataLayer on initial load.
 * GTM uses this for per-client filtering in GA4.
 *
 * Include once in your root layout (inside ConsentProvider).
 */
export function ClientIdentifier() {
  useEffect(() => {
    pushToDataLayer({
      clientName: CLIENT_NAME,
    })
  }, [])

  return null
}
