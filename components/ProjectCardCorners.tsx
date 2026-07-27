/**
 * Viewfinder corner brackets — matches photon-lovable ReticleFrame on ProjectTile.
 * Hidden at rest; fades in on hover/focus. Pinned to corners, 16px arms.
 */
export function ProjectCardCorners() {
  const size = 18

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[3] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
    >
      <span
        className="absolute left-0 top-0 border-l border-t border-white/55"
        style={{width: size, height: size}}
      />
      <span
        className="absolute right-0 top-0 border-r border-t border-white/55"
        style={{width: size, height: size}}
      />
      <span
        className="absolute bottom-0 left-0 border-b border-l border-white/55"
        style={{width: size, height: size}}
      />
      <span
        className="absolute bottom-0 right-0 border-b border-r border-white/55"
        style={{width: size, height: size}}
      />
    </div>
  )
}
