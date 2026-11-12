import {defineLive} from 'next-sanity/live'
import {client} from './client'
import {token} from './token'

/**
 * The dataset is private, so every read needs the token — including the
 * published perspective the public site uses. `defineLive` only applies
 * `serverToken` to non-published perspectives, falling back to whatever
 * token the client already carries, so the token goes on the client here.
 */
export const {SanityLive, sanityFetch} = defineLive({
  client: client.withConfig({token}),
  serverToken: token,
  browserToken: token,
})
