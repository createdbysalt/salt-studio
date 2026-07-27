/** Dark portfolio / photo-hero surfaces — work, projects. Home is light paper. */
export function isDarkSurface(pathname: string): boolean {
  if (pathname === '/work' || pathname.startsWith('/work/')) return true
  if (pathname.startsWith('/projects/')) return true
  return false
}
