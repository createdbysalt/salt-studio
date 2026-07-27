'use client'

import {isCorsOriginError} from 'next-sanity/live'
import {toast} from 'sonner'

export function handleError(error: unknown) {
  // Sanity's Live Content API recycles its SSE stream periodically (and after
  // idle), surfacing a `DisconnectError: forced by provider`. The client
  // reconnects on its own, so log it quietly instead of raising a fatal toast.
  if (error instanceof Error && error.name === 'DisconnectError') {
    console.warn('[SanityLive] stream disconnected, reconnecting…', error.message)
    return
  }

  if (isCorsOriginError(error)) {
    const {addOriginUrl} = error
    toast.error(`Sanity Live couldn't connect`, {
      description: `Your origin is blocked by CORS policy`,
      duration: Infinity,
      action: addOriginUrl
        ? {
            label: 'Manage',
            onClick: () => window.open(addOriginUrl.toString(), '_blank'),
          }
        : undefined,
    })
  } else if (error instanceof Error) {
    console.error(error)
    toast.error(error.name, {description: error.message, duration: Infinity})
  } else {
    console.error(error)
    toast.error('Unknown error', {
      description: 'Check the console for more details',
      duration: Infinity,
    })
  }
}
