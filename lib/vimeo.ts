/**
 * Vimeo URL helpers shared by the homepage hero (server + client).
 * Page URLs (`vimeo.com/123`) cannot be framed — only player.vimeo.com works.
 */

export function isVimeoUrl(url: string): boolean {
  return url.includes('vimeo.com')
}

export function extractVimeoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.includes('vimeo.com')) return null

    if (parsed.hostname === 'player.vimeo.com') {
      return parsed.pathname.match(/\/video\/(\d+)/)?.[1] ?? null
    }

    return (
      parsed.pathname.match(
        /(?:\/(?:channels|groups)\/[^/]+(?:\/videos)?|\/video)?\/(\d+)/i,
      )?.[1] ?? null
    )
  } catch {
    return null
  }
}

/**
 * Turn a Vimeo page/share URL into an embeddable player URL.
 * Preserves the `h=` hash used by unlisted videos (query or path form).
 */
export function toVimeoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.includes('vimeo.com')) return null

    if (parsed.hostname === 'player.vimeo.com') {
      const match = parsed.pathname.match(/\/video\/(\d+)/)
      if (!match) return null
      const h = parsed.searchParams.get('h')
      return h
        ? `https://player.vimeo.com/video/${match[1]}?h=${h}`
        : `https://player.vimeo.com/video/${match[1]}`
    }

    const pathMatch = parsed.pathname.match(
      /(?:\/(?:channels|groups)\/[^/]+(?:\/videos)?|\/video)?\/(\d+)(?:\/([a-f0-9]+))?/i,
    )
    if (!pathMatch) return null

    const id = pathMatch[1]
    const h = parsed.searchParams.get('h') || pathMatch[2]
    return h
      ? `https://player.vimeo.com/video/${id}?h=${h}`
      : `https://player.vimeo.com/video/${id}`
  } catch {
    return null
  }
}

/** Background/autoplay iframe src for the hero. */
export function vimeoBackgroundSrc(url: string): string | null {
  const embed = toVimeoEmbedUrl(url)
  if (!embed) return null
  const sep = embed.includes('?') ? '&' : '?'
  // quality=auto lets Vimeo pick a fast start bitrate; autopause=0 keeps preload
  // iframes from fighting the active player as aggressively.
  return `${embed}${sep}background=1&dnt=1&autoplay=1&muted=1&playsinline=1&autopause=0&quality=auto`
}

/** Standard player iframe — controls on, for lightbox / inline viewing. */
export function vimeoPlayerSrc(url: string): string | null {
  const embed = toVimeoEmbedUrl(url)
  if (!embed) return null
  const sep = embed.includes('?') ? '&' : '?'
  return `${embed}${sep}autoplay=1&title=0&byline=0&portrait=0&dnt=1`
}

/**
 * Fetch a large poster from Vimeo's oEmbed API. Used when a project has no
 * Sanity coverImage so the hero isn't black while the iframe boots.
 */
export async function fetchVimeoPoster(videoUrl: string): Promise<string | undefined> {
  const id = extractVimeoId(videoUrl)
  if (!id) return undefined

  try {
    const pageUrl = `https://vimeo.com/${id}`
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(pageUrl)}&width=1920`,
      {next: {revalidate: 60 * 60 * 24, tags: [`vimeo-poster-${id}`]}},
    )
    if (!res.ok) return undefined
    const data = (await res.json()) as {thumbnail_url?: string}
    if (!data.thumbnail_url) return undefined
    // oEmbed size tokens look like `_1280` or `_1280x720` — prefer a wide frame.
    return data.thumbnail_url.replace(/_\d+x\d+/, '_1920x1080').replace(/_(\d+)(\?|$)/, '_1920$2')
  } catch {
    return undefined
  }
}
