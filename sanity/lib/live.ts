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

/**
 * Reads for the private proposal pages, which never cache.
 *
 * The normal `sanityFetch` passes `next: {revalidate: false}` in production,
 * so a result is cached until something clears it by tag. On the public site
 * `<SanityLive />` does the clearing. The proposal layout has no
 * `<SanityLive />` on purpose, because a page handed to an outside client
 * should not hold an open stream to the dataset or carry a browser token.
 *
 * With nothing to clear the entry, an edit published in the Studio never
 * showed up on refresh. Issuing a new link appeared to fix it only because a
 * different token is a different cache entry.
 *
 * `fetchOptions.revalidate` is the only knob that reaches that value, since
 * an explicit `next.revalidate` on the fetch beats `export const revalidate`
 * on the page. It is marked deprecated upstream in favour of the page export,
 * which does not work here for that reason; revisit on the next major.
 *
 * Scoped to proposals so the public site keeps its cache. The cost is one
 * query per view of a page a handful of people ever open, and in exchange
 * publish-then-refresh behaves the way anyone would expect.
 *
 * `browserToken: false` because nothing here renders `SanityLive`, and the
 * token must not reach a client's browser.
 */
export const {sanityFetch: sanityFetchLive} = defineLive({
  client: client.withConfig({token}),
  serverToken: token,
  browserToken: false,
  fetchOptions: {revalidate: 0},
})
