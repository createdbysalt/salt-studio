import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {ImageResponse} from 'next/og'

/**
 * Dynamic Open Graph image — the auto-updating "social share card".
 *
 * Earned ink stage (reads in social feeds) + Salt red product band.
 * Brand cards: white wordmark + tagline. Interior: page title as display.
 *
 * Usage (from a page's generateMetadata):
 *   openGraph: { images: [ogImageUrl({title, eyebrow, subtitle})] }
 * A manually-uploaded `ogImage` in Sanity should take precedence over this.
 */

export const size = {width: 1200, height: 630}
export const contentType = 'image/png'

const INK = '#08090a'
const WHITE = '#ffffff'
const PAPER = '#eaeaea'
const ACCENT = '#e42927'
const MUTED_ON_INK = 'rgba(255, 255, 255, 0.5)'
const TAGLINE = 'Subtle. Essential. Transformative.'

function clamp(value: string, max: number): string {
  const trimmed = value.trim()
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1)}…`
}

function isBrandTitle(title: string) {
  return /^salt\s*studio$/i.test(title.trim())
}

async function loadAssets() {
  const fontsDir = join(process.cwd(), 'app/api/og/fonts')
  const brandDir = join(process.cwd(), 'public/brand')

  const [geistBold, geistMedium, geistMono, wordmarkSvg, badgeSvg] = await Promise.all([
    readFile(join(fontsDir, 'Geist-Bold.ttf')),
    readFile(join(fontsDir, 'Geist-Medium.ttf')),
    readFile(join(fontsDir, 'GeistMono-Medium.ttf')),
    readFile(join(brandDir, 'salt-wordmark.svg'), 'utf8'),
    readFile(join(brandDir, 'salt-badge-red-pennant.svg'), 'utf8'),
  ])

  const lightMark = wordmarkSvg.replace(/<path /g, '<path fill="#e3e3e3" ')
  const wordmarkSrc = `data:image/svg+xml;base64,${Buffer.from(lightMark).toString('base64')}`
  const badgeSrc = `data:image/svg+xml;base64,${Buffer.from(badgeSvg).toString('base64')}`

  return {geistBold, geistMedium, geistMono, wordmarkSrc, badgeSrc}
}

function RedBand({label}: {label: string}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: 88,
        backgroundColor: ACCENT,
        paddingLeft: 72,
        paddingRight: 72,
      }}
    >
      <div
        style={{
          display: 'flex',
          fontFamily: 'Geist Mono',
          fontSize: 18,
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: WHITE,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: 'flex',
          fontFamily: 'Geist Mono',
          fontSize: 18,
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: WHITE,
        }}
      >
        createdbysalt.com
      </div>
    </div>
  )
}

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url)

  const title = clamp(searchParams.get('title') || 'Salt Studio', 72)
  const eyebrow = searchParams.get('eyebrow')?.trim() || ''
  const subtitleRaw = searchParams.get('subtitle')?.trim() || ''
  const brandCard = isBrandTitle(title)
  const subtitle = !brandCard && subtitleRaw ? clamp(subtitleRaw, 120) : ''

  const {geistBold, geistMedium, geistMono, wordmarkSrc, badgeSrc} = await loadAssets()

  return new ImageResponse(
    brandCard ? (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: INK,
          color: WHITE,
          fontFamily: 'Geist',
        }}
      >
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 72,
            paddingRight: 72,
            paddingTop: 48,
            paddingBottom: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              maxWidth: 720,
            }}
          >
            <img
              src={wordmarkSrc}
              width={420}
              height={257}
              alt="Salt Studio"
              style={{display: 'flex', width: 420, height: 257}}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: 36,
                fontSize: 42,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                color: PAPER,
              }}
            >
              <span style={{display: 'flex'}}>Subtle.</span>
              <span style={{display: 'flex'}}>Essential.</span>
              <span style={{display: 'flex'}}>Transformative.</span>
            </div>
          </div>

          <img
            src={badgeSrc}
            width={280}
            height={280}
            alt=""
            style={{display: 'flex', width: 280, height: 280}}
          />
        </div>

        <RedBand label="Design studio" />
      </div>
    ) : (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: INK,
          color: WHITE,
          fontFamily: 'Geist',
        }}
      >
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-between',
            paddingLeft: 72,
            paddingRight: 72,
            paddingTop: 52,
            paddingBottom: 44,
          }}
        >
          <img
            src={wordmarkSrc}
            width={160}
            height={98}
            alt="Salt Studio"
            style={{display: 'flex', width: 160, height: 98}}
          />

          <div style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
            {eyebrow ? (
              <div
                style={{
                  display: 'flex',
                  fontFamily: 'Geist Mono',
                  fontSize: 18,
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: MUTED_ON_INK,
                  marginBottom: 18,
                }}
              >
                {clamp(eyebrow, 40)}
              </div>
            ) : null}
            <div
              style={{
                display: 'flex',
                fontSize: title.length > 28 ? 64 : 84,
                fontWeight: 700,
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                maxWidth: 1000,
                color: WHITE,
              }}
            >
              {title}
            </div>
            {subtitle ? (
              <div
                style={{
                  display: 'flex',
                  fontSize: 28,
                  fontWeight: 500,
                  lineHeight: 1.35,
                  color: MUTED_ON_INK,
                  maxWidth: 820,
                  marginTop: 24,
                }}
              >
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>

        <RedBand label={TAGLINE} />
      </div>
    ),
    {
      ...size,
      fonts: [
        {name: 'Geist', data: geistBold, weight: 700, style: 'normal'},
        {name: 'Geist', data: geistMedium, weight: 500, style: 'normal'},
        {name: 'Geist Mono', data: geistMono, weight: 500, style: 'normal'},
      ],
      headers: {
        'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  )
}
