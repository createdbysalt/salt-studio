import {ImageResponse} from 'next/og'

/**
 * Dynamic Open Graph image — the auto-updating "social share card".
 *
 * Renders a branded Salt Studio card from query params (no manual upload needed).
 * Because the page's title/eyebrow/subtitle are baked into the URL, the image
 * updates automatically whenever that content changes in Sanity — and the CDN
 * caches each unique card.
 *
 * Usage (from a page's generateMetadata):
 *   openGraph: { images: [ogImageUrl({title, eyebrow, subtitle})] }
 * A manually-uploaded `ogImage` in Sanity should take precedence over this.
 *
 * Fonts: Satori (behind ImageResponse) can't read .woff2, and Salt Studio's brand
 * fonts are .woff2 only — so this uses the built-in font. To match the exact
 * brand type, drop an .otf/.ttf weight into the repo and pass it via `fonts`.
 */

export const size = {width: 1200, height: 630}
export const contentType = 'image/png'

const SALT_BLACK = '#0d0e12'
const WHITE = '#ffffff'

function clamp(value: string, max: number): string {
  const trimmed = value.trim()
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1)}…`
}

export function GET(request: Request) {
  const {searchParams} = new URL(request.url)

  const title = clamp(searchParams.get('title') || 'Salt Studio', 90)
  const eyebrow = searchParams.get('eyebrow')?.trim() || ''
  const subtitle = searchParams.get('subtitle')?.trim() || ''

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: SALT_BLACK,
        color: WHITE,
        padding: 80,
        fontFamily: 'sans-serif',
      }}
    >
      {/* Top: wordmark + site */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', fontSize: 26, fontWeight: 700, letterSpacing: 8}}>SALT STUDIO</div>
        <div
          style={{
            display: 'flex',
            fontSize: 18,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          createdbysalt.com
        </div>
      </div>

      {/* Middle: eyebrow + headline + subtitle */}
      <div style={{display: 'flex', flexDirection: 'column'}}>
        {eyebrow ? (
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: 24,
            }}
          >
            {clamp(eyebrow, 40)}
          </div>
        ) : null}
        <div
          style={{
            display: 'flex',
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.05,
            maxWidth: 960,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              lineHeight: 1.35,
              color: 'rgba(255,255,255,0.7)',
              maxWidth: 900,
              marginTop: 28,
            }}
          >
            {clamp(subtitle, 140)}
          </div>
        ) : null}
      </div>

      {/* Bottom: rule + tagline */}
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', height: 1, backgroundColor: 'rgba(255,255,255,0.25)'}} />
        <div
          style={{
            display: 'flex',
            fontSize: 20,
            letterSpacing: 2,
            color: 'rgba(255,255,255,0.55)',
            marginTop: 24,
          }}
        >
          Subtle. Essential. Transformative.
        </div>
      </div>
    </div>,
    {
      ...size,
      headers: {
        'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  )
}
