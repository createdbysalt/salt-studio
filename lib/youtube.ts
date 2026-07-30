/**
 * YouTube URL helpers for project gallery embeds.
 * Watch / share / youtu.be URLs cannot be framed — only youtube.com/embed works.
 */

export function isYouTubeUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'youtu.be' ||
      host === 'youtube-nocookie.com'
    )
  } catch {
    return false
  }
}

export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id || null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const fromQuery = parsed.searchParams.get('v')
      if (fromQuery) return fromQuery

      const pathMatch = parsed.pathname.match(/\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{6,})/)
      return pathMatch?.[1] ?? null
    }

    return null
  } catch {
    return null
  }
}

/** Muted looping background iframe for gallery cells. */
export function youtubeBackgroundSrc(url: string): string | null {
  const id = extractYouTubeId(url)
  if (!id) return null
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '0',
    playsinline: '1',
    loop: '1',
    playlist: id,
    modestbranding: '1',
    rel: '0',
    // Strip the remaining YouTube chrome from a background loop.
    disablekb: '1',
    fs: '0',
    iv_load_policy: '3',
  })
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
}

/** Standard player iframe — controls on, for lightbox / inline viewing. */
export function youtubePlayerSrc(url: string): string | null {
  const id = extractYouTubeId(url)
  if (!id) return null
  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
  })
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
}
