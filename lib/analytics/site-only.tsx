'use client'

import {usePathname} from 'next/navigation'
import {isPrivateProposalPath} from './private-routes'

/**
 * Renders its children on the public site and nothing on a private proposal.
 *
 * The page view, scroll and error trackers already refused to report from a
 * /p/ route, but the tag scripts themselves sat in the root layout with no way
 * to know the route, so they still downloaded and ran. A client opening their
 * proposal pulled the Usercentrics consent bundle, Google Tag Manager, gtag
 * and an ad conversion ping: sixteen third-party endpoints and roughly 1.5 MB
 * of JavaScript, which was most of the blocking work on the page.
 *
 * Returning null means next/script never injects, so none of it is fetched.
 */
export function SiteOnly({children}: {children: React.ReactNode}) {
  const pathname = usePathname()
  if (isPrivateProposalPath(pathname)) return null
  return <>{children}</>
}
