import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {ImageResponse} from 'next/og'

/**
 * Branded Open Graph image.
 *
 * Default (no params): the site-wide statement card — mark + statement,
 * tagline left / domain right. Black & white only.
 *
 * Project cards (`?title=…&eyebrow=…`): the same frame, but the statement is
 * replaced by a small eyebrow (e.g. "Case study · 2024") over the project title.
 *
 * Usage: openGraph: { images: [ogImageUrl({title, eyebrow})] }
 */

export const size = {width: 1200, height: 630}
export const contentType = 'image/png'

const INK = '#08090a'
const WHITE = '#ffffff'
const MUTED = 'rgba(255, 255, 255, 0.5)'
/** Intentional break — avoids orphaning “there.” on its own line. */
const STATEMENT_LINES = ['We draw out the good', "that's already there."] as const
const TAGLINE = 'Subtle. Essential. Transformative.'

async function loadAssets() {
  const fontsDir = join(process.cwd(), 'app/api/og/fonts')
  const brandDir = join(process.cwd(), 'public/brand')

  const [geistBold, geistMedium, geistMono, wordmarkSvg] = await Promise.all([
    readFile(join(fontsDir, 'Geist-Bold.ttf')),
    readFile(join(fontsDir, 'Geist-Medium.ttf')),
    readFile(join(fontsDir, 'GeistMono-Medium.ttf')),
    readFile(join(brandDir, 'salt-wordmark.svg'), 'utf8'),
  ])

  const lightMark = wordmarkSvg.replace(/<path /g, '<path fill="#ffffff" ')
  const wordmarkSrc = `data:image/svg+xml;base64,${Buffer.from(lightMark).toString('base64')}`

  return {geistBold, geistMedium, geistMono, wordmarkSrc}
}

export async function GET(request: Request) {
  const {geistBold, geistMedium, geistMono, wordmarkSrc} = await loadAssets()

  const {searchParams} = new URL(request.url)
  const title = searchParams.get('title')?.trim()
  const eyebrow = searchParams.get('eyebrow')?.trim()
  const isProject = Boolean(title)
  // Bigger title for short names, smaller as it grows, so it never overflows.
  const titleSize = !title ? 72 : title.length > 24 ? 60 : title.length > 15 ? 72 : 88

  const markW = 260
  const markH = Math.round(markW * (339.25 / 555.03))

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: INK,
        color: WHITE,
        padding: '64px 80px 56px',
        fontFamily: 'Geist',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: '100%',
          flexGrow: 1,
          justifyContent: 'center',
          paddingBottom: 36,
        }}
      >
        <img
          src={wordmarkSrc}
          width={markW}
          height={markH}
          alt="Salt Studio"
          style={{display: 'flex', width: markW, height: markH, marginBottom: 28}}
        />

        {isProject ? (
          <div style={{display: 'flex', flexDirection: 'column'}}>
            {eyebrow ? (
              <div
                style={{
                  display: 'flex',
                  fontFamily: 'Geist Mono',
                  fontSize: 20,
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: MUTED,
                  marginBottom: 18,
                }}
              >
                {eyebrow}
              </div>
            ) : null}
            <div
              style={{
                display: 'flex',
                fontSize: titleSize,
                fontWeight: 700,
                lineHeight: 1.02,
                letterSpacing: '-0.04em',
                color: WHITE,
                maxWidth: 940,
              }}
            >
              {title}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: '-0.035em',
              color: WHITE,
            }}
          >
            {STATEMENT_LINES.map((line) => (
              <div key={line} style={{display: 'flex'}}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontFamily: 'Geist Mono',
            fontSize: 17,
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: MUTED,
          }}
        >
          {TAGLINE}
        </div>
        <div
          style={{
            display: 'flex',
            fontFamily: 'Geist Mono',
            fontSize: 17,
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: MUTED,
          }}
        >
          createdbysalt.com
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {name: 'Geist', data: geistBold, weight: 700, style: 'normal'},
        {name: 'Geist', data: geistMedium, weight: 500, style: 'normal'},
        {name: 'Geist Mono', data: geistMono, weight: 500, style: 'normal'},
      ],
      headers: {
        'cache-control': 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  )
}
