/**
 * A proposal at /p/<key> is one private document for one client. It is
 * noindex, it sits behind a password, and nothing about it belongs in site
 * analytics or in an ad network.
 *
 * The page view, scroll and error trackers each tested the path inline, so
 * three copies of the same rule could drift apart. This is the one copy.
 * Anything site-wide that should not run on a proposal reads it from here.
 */
export function isPrivateProposalPath(pathname: string | null | undefined) {
  return typeof pathname === 'string' && pathname.startsWith('/p/')
}
