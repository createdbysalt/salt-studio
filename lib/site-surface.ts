/** Dark portfolio / photo-hero surfaces — home, work, projects. */
export function isDarkSurface(pathname: string): boolean {
  if (pathname === '/') return true
  if (pathname === '/work' || pathname.startsWith('/work/')) return true
  if (pathname.startsWith('/projects/')) return true
  return false
}
