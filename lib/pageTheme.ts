/**
 * Routes whose page stage is dark — shared by SiteShell, footer, and page wipe.
 * Keep in sync with any new dark route shells.
 */
export function pageIsDark(pathname: string): boolean {
  return (
    pathname.startsWith('/projects/') ||
    pathname === '/work' ||
    pathname.startsWith('/work/') ||
    pathname === '/legal' ||
    pathname.startsWith('/legal/')
  )
}

export function isHomePath(pathname: string): boolean {
  return pathname === '/'
}
