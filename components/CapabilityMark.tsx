type CapabilityMarkProps = {
  name: string
  /** Pre-resolved Simple Icons SVG path (from `getSimpleIcon` on the server). */
  path?: string | null
  /** Pre-resolved Sanity logo URL (server-built). */
  logoUrl?: string | null
  className?: string
}

/**
 * Monochrome capability mark — Simple Icons path, or Sanity logo fallback.
 * Colors via currentColor so the parent sets ink/white.
 * Paths/URLs must be resolved on the server before passing in.
 */
export function CapabilityMark({name, path, logoUrl, className}: CapabilityMarkProps) {
  if (path) {
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden
      >
        <title>{name}</title>
        <path d={path} fill="currentColor" />
      </svg>
    )
  }

  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- small mono mark; next/image unnecessary
      <img src={logoUrl} alt="" className={className} aria-hidden />
    )
  }

  const initial = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <span
      className={`flex items-center justify-center font-mono text-[11px] font-medium uppercase tracking-label ${className ?? ''}`}
      aria-hidden
    >
      {initial}
    </span>
  )
}
