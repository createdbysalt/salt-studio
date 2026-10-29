import {LandingHeroVideo} from '@/components/LandingHeroVideo'
import {LandingReelTile} from '@/components/LandingReelTile'
import type {LandingCta, LandingSectionOf} from '@/components/LandingSections'
import {SaltWordmark} from '@/components/SaltWordmark'
import {FAQStructuredData} from '@/lib/seo'
import {urlForImage} from '@/sanity/lib/utils'
import {ArrowUpRight, ChevronRight} from 'lucide-react'
import {stegaClean} from 'next-sanity'
import Link from 'next/link'

/**
 * Offer landing sections: the video-first "Leave it to us" layout.
 *
 * Section order (top to bottom) mirrors the reference page: ink top band with the
 * wordmark → poster video → headline + red highlighted link → client grid on ink →
 * services list in an inset ink card → statement band → big red numbers →
 * before/after rows → looping video tiles with badges → founder card → quote cards
 * → packages → "Want results like this?" gallery → FAQ on ink.
 *
 * Colors and type are Salt's (ink stage bands on a white page, Geist, mono labels,
 * the red accent only on numbers, headlines and badges). Every button is the
 * page-level CTA.
 */

const clean = (value?: string | null) => (value ? stegaClean(value).trim() : '')

function paragraphs(text?: string | null) {
  return clean(text)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

type SanityImage =
  | {
      asset?: {_ref: string} | null
      alt?: string | null
      hotspot?: unknown
      crop?: unknown
    }
  | null
  | undefined

type ImageSource = Parameters<typeof urlForImage>[0]

/** Generated query types allow `null` where the URL builder wants `undefined`. */
function sourceOf(image: SanityImage): ImageSource | null {
  if (!image?.asset?._ref) return null
  return {
    asset: {_ref: image.asset._ref},
    hotspot: image.hotspot ?? undefined,
    crop: image.crop ?? undefined,
  } as ImageSource
}

function imageUrl(image: SanityImage, width: number, height: number) {
  const source = sourceOf(image)
  if (!source) return null
  return urlForImage(source)?.width(width).height(height).fit('crop').url() ?? null
}

function Pill({children}: {children: React.ReactNode}) {
  return (
    <span className="inline-flex items-center rounded-full border border-current px-[20px] py-[8px] font-mono text-[12px] font-medium uppercase tracking-label">
      {children}
    </span>
  )
}

function CtaButton({cta, className = ''}: {cta: LandingCta; className?: string}) {
  const external = cta.href.startsWith('http')
  const inner = (
    <>
      {cta.label}
      <ArrowUpRight aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />
    </>
  )
  return external ? (
    <a
      href={cta.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-solid ${className}`}
      data-lp-cta
    >
      {inner}
    </a>
  ) : (
    <Link href={cta.href} className={`btn-solid ${className}`} data-lp-cta>
      {inner}
    </Link>
  )
}

function CtaSubhead({text}: {text?: string | null}) {
  const value = clean(text)
  if (!value) return null
  return (
    <p className="max-w-[42ch] text-center font-mono text-[12px] uppercase tracking-label text-foreground/50">
      {value}
    </p>
  )
}

/** Full-bleed ink band. Semantic tokens flip via data-theme so buttons invert. */
function Band({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <section
      id={id}
      data-theme="dark"
      className={`w-full bg-background text-foreground ${className}`}
    >
      {children}
    </section>
  )
}

/** Inset ink card on the white stage (the reference page's rounded black panels). */
function InkCard({children, className = ''}: {children: React.ReactNode; className?: string}) {
  return (
    <div
      data-theme="dark"
      className={`rounded-[16px] bg-background text-foreground md:rounded-[24px] ${className}`}
    >
      {children}
    </div>
  )
}

const inset = 'page-chrome mx-auto w-full max-w-6xl'

// ---------------------------------------------------------------------------

export function LandingVideoHeroSection({
  section,
  cta,
}: {
  section: LandingSectionOf<'lpVideoHeroSection'>
  cta: LandingCta
}) {
  const headline = clean(section.headline)
  const ctaText = clean(section.ctaText)
  const posterUrl = imageUrl(section.poster, 1200, 1380)
  const external = cta.href.startsWith('http')
  const highlight =
    'inline-block bg-accent px-3 py-0.5 text-white underline decoration-white/90 decoration-[3px] underline-offset-[6px] transition-colors duration-300 hover:bg-accent-hover'

  return (
    <section id="lp-hero">
      <div
        data-theme="dark"
        className="flex w-full justify-center bg-background py-[28px] md:py-[36px]"
      >
        <Link href="/" aria-label="Salt Studio — Home" className="inline-flex">
          <SaltWordmark title="Salt Studio" className="h-[30px] w-auto text-white md:h-[40px]" />
        </Link>
      </div>
      <div className={`${inset} pt-[32px] md:pt-[48px]`}>
        <LandingHeroVideo
          videoUrl={clean(section.videoUrl) || null}
          posterUrl={posterUrl}
          posterAlt={clean(section.poster?.alt) || headline}
          posterTitle={clean(section.posterTitle) || undefined}
        />
        <div className="mx-auto mt-10 max-w-4xl text-center md:mt-14">
          <h1 className="whitespace-pre-line text-[clamp(2.1rem,5.6vw,4.4rem)] font-semibold leading-[1] tracking-[-0.03em] text-foreground">
            {headline}
          </h1>
          {ctaText && (
            <p className="mt-[16px] text-[clamp(2.1rem,5.6vw,4.4rem)] font-semibold leading-[1.15] tracking-[-0.03em]">
              {external ? (
                <a
                  href={cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={highlight}
                  data-lp-cta
                >
                  {ctaText}
                </a>
              ) : (
                <Link href={cta.href} className={highlight} data-lp-cta>
                  {ctaText}
                </Link>
              )}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export function LandingClientGridSection({
  section,
}: {
  section: LandingSectionOf<'lpClientGridSection'>
}) {
  const clients = (section.clients ?? []).filter((c) => clean(c?.name))
  const lead = clean(section.featuredLead)
  const names = clean(section.featuredNames)
  if (clients.length === 0 && !names) return null
  return (
    <Band className="mt-14 py-14 md:mt-20 md:py-20">
      <div className={inset}>
        {clean(section.title) && (
          <h2 className="text-center text-[clamp(1.1rem,2.2vw,1.5rem)] font-semibold uppercase tracking-[-0.01em]">
            {clean(section.title)}
          </h2>
        )}
        {clients.length > 0 && (
          <ul className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-x-[24px] gap-y-[40px] sm:grid-cols-3 md:gap-x-[40px]">
            {clients.map((client) => {
              const name = clean(client.name)
              const src = imageUrl(client.image, 480, 480)
              const initials = name
                .split(/\s+/)
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase())
                .join('')
              return (
                <li key={client._key} className="flex flex-col items-center text-center">
                  <div className="relative aspect-square w-[128px] overflow-hidden rounded-full bg-surface ring-1 ring-white/80 md:w-[168px]">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt={clean(client.image?.alt) || name}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-2xl font-semibold tracking-[-0.02em] text-foreground/80">
                        {initials}
                      </span>
                    )}
                  </div>
                  <p className="mt-[16px] max-w-[18ch] font-mono text-[11px] uppercase leading-[1.4] tracking-label text-foreground/80">
                    {clean(client.label) || name}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
        {names && (
          <div className="mt-14 text-center md:mt-20">
            {lead && (
              <p className="text-[clamp(1.1rem,2.2vw,1.6rem)] font-semibold tracking-[-0.01em]">
                {lead}
              </p>
            )}
            <p className="text-display mt-1 text-[clamp(2.6rem,9vw,7rem)]">{names}</p>
          </div>
        )}
      </div>
    </Band>
  )
}

export function LandingServicesListSection({
  section,
  cta,
}: {
  section: LandingSectionOf<'lpServicesListSection'>
  cta: LandingCta
}) {
  const items = (section.items ?? []).filter((item) => clean(item?.titleTop))
  if (items.length === 0) return null
  return (
    <section className={`${inset} mt-[24px] md:mt-[32px]`}>
      <InkCard className="px-[20px] py-[48px] md:px-[64px] md:py-[64px]">
        <div className="flex justify-center">
          <Pill>{clean(section.label) || 'Our services'}</Pill>
        </div>
        <ul className="mx-auto mt-10 max-w-3xl divide-y divide-white/70 border-y border-white/70">
          {items.map((item) => {
            const src = imageUrl(item.image, 320, 320)
            return (
              <li
                key={item._key}
                className="flex items-center gap-[24px] py-[28px] md:gap-[40px] md:py-[36px]"
              >
                <div className="relative aspect-square w-[88px] shrink-0 overflow-hidden rounded-full bg-surface ring-1 ring-white/80 md:w-[128px]">
                  {src && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={clean(item.image?.alt) || clean(item.titleTop)}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-[clamp(1.5rem,3.4vw,2.6rem)] font-semibold uppercase leading-[1] tracking-[-0.02em]">
                    {clean(item.titleTop)}
                    {clean(item.titleBottom) && (
                      <>
                        <br />
                        <em className="italic">{clean(item.titleBottom)}</em>
                      </>
                    )}
                  </h3>
                  {clean(item.blurb) && (
                    <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-foreground/70 md:text-base">
                      {clean(item.blurb)}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
        {section.showButton !== false && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <CtaButton cta={cta} />
            <CtaSubhead text={cta.subhead} />
          </div>
        )}
      </InkCard>
    </section>
  )
}

export function LandingStatementSection({
  section,
}: {
  section: LandingSectionOf<'lpStatementSection'>
}) {
  const text = clean(section.text)
  if (!text) return null
  return (
    <Band className="mt-14 py-[32px] md:mt-20 md:py-[40px]">
      <p
        className={`${inset} text-center text-[clamp(1.5rem,4.6vw,3.6rem)] font-semibold uppercase leading-[1.05] tracking-[-0.03em]`}
      >
        {text}
      </p>
    </Band>
  )
}

export function LandingStatsSection({section}: {section: LandingSectionOf<'lpStatsSection'>}) {
  const stats = (section.stats ?? []).filter((s) => clean(s?.value) && clean(s?.label))
  if (stats.length === 0) return null
  return (
    <section className={`${inset} py-14 md:py-20`}>
      <dl
        className={`grid gap-10 text-center ${stats.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}
      >
        {stats.map((stat) => (
          <div key={stat._key}>
            <dd className="font-mono text-[clamp(3rem,8vw,6.5rem)] font-semibold leading-none tracking-[-0.04em] text-accent">
              {clean(stat.value)}
            </dd>
            <dt className="mt-3 text-[clamp(1.1rem,2vw,1.6rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-foreground">
              {clean(stat.label)}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  )
}

function BeforeAfterCard({
  name,
  metric,
  value,
  image,
  side,
}: {
  name: string
  metric: string
  value: string
  image: SanityImage
  side: 'Before' | 'After'
}) {
  const src = imageUrl(image, 1200, 700)
  return (
    <div className="relative min-h-[120px] overflow-hidden rounded-lg bg-white text-ink">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={clean(image?.alt) || `${name}, ${side.toLowerCase()}`}
          className="block h-auto w-full"
          loading="lazy"
        />
      ) : (
        <div className="p-[20px] md:p-[24px]">
          <p className="font-mono text-[11px] uppercase tracking-label text-ink/50">
            {side}
            {metric ? ` · ${metric}` : ''}
          </p>
          <p className="mt-2 text-lg font-semibold tracking-[-0.01em]">{name}</p>
          <p
            className={`mt-3 font-mono text-[clamp(2rem,4vw,3rem)] font-semibold leading-none tracking-[-0.03em] ${
              side === 'After' ? 'text-accent' : 'text-ink'
            }`}
          >
            {value}
          </p>
        </div>
      )}
    </div>
  )
}

export function LandingBeforeAfterSection({
  section,
}: {
  section: LandingSectionOf<'lpBeforeAfterSection'>
}) {
  const rows = (section.rows ?? []).filter((r) => clean(r?.name))
  if (rows.length === 0) return null
  return (
    <section className={`${inset} pb-14 md:pb-20`}>
      <InkCard className="mx-auto max-w-4xl p-[16px] md:p-[24px]">
        <ul className="space-y-[16px] md:space-y-[20px]">
          {rows.map((row) => {
            const name = clean(row.name)
            const metric = clean(row.metric)
            return (
              <li key={row._key}>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-[8px] md:gap-[16px]">
                  <BeforeAfterCard
                    name={name}
                    metric={metric}
                    value={clean(row.before) || '—'}
                    image={row.beforeImage}
                    side="Before"
                  />
                  <ChevronRight
                    aria-hidden
                    className="h-8 w-8 shrink-0 text-white md:h-12 md:w-12"
                    strokeWidth={3}
                  />
                  <BeforeAfterCard
                    name={name}
                    metric={metric}
                    value={clean(row.after) || '—'}
                    image={row.afterImage}
                    side="After"
                  />
                </div>
                {clean(row.caption) && (
                  <p className="mt-2 px-1 font-mono text-[11px] uppercase tracking-label text-foreground/50">
                    {clean(row.caption)}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      </InkCard>
    </section>
  )
}

/** 16-point starburst for the badge. */
function starPoints(outer = 50, inner = 41, n = 16) {
  const pts: string[] = []
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (Math.PI * i) / n - Math.PI / 2
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
}

function Badge({text}: {text: string}) {
  return (
    <span className="absolute -right-2 -top-2 flex h-[92px] w-[92px] items-center justify-center text-center md:-right-3 md:-top-3 md:h-[108px] md:w-[108px]">
      <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 h-full w-full text-accent">
        <polygon points={starPoints()} fill="currentColor" />
      </svg>
      <span className="relative max-w-[76px] px-1 font-mono text-[9px] font-semibold uppercase leading-[1.15] tracking-[0.02em] text-white md:max-w-[88px] md:text-[10px]">
        {text}
      </span>
    </span>
  )
}

export function LandingReelsSection({section}: {section: LandingSectionOf<'lpReelsSection'>}) {
  const items = (section.items ?? []).filter((i) => clean(i?.videoUrl) || i?.poster?.asset)
  if (items.length === 0) return null
  const label = clean(section.buttonLabel)
  const href = clean(section.buttonHref)
  return (
    <Band className="py-14 md:py-20">
      <div className={inset}>
        <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-[16px] md:grid-cols-4 md:gap-[24px]">
          {items.map((item) => {
            const posterUrl = imageUrl(item.poster, 800, 1000)
            const badge = clean(item.badge)
            const itemHref = clean(item.href)
            const tile = (
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface ring-1 ring-white/20">
                <LandingReelTile
                  videoUrl={clean(item.videoUrl) || null}
                  posterUrl={posterUrl}
                  alt={clean(item.poster?.alt) || badge}
                />
              </div>
            )
            return (
              <li key={item._key} className="relative">
                {itemHref ? (
                  <Link href={itemHref} className="block" aria-label={badge || 'See the project'}>
                    {tile}
                  </Link>
                ) : (
                  tile
                )}
                {badge && <Badge text={badge} />}
              </li>
            )
          })}
        </ul>
        {label && href && (
          <div className="mt-10 flex justify-center">
            <Link href={href} className="btn-solid">
              {label}
              <ArrowUpRight aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Link>
          </div>
        )}
      </div>
    </Band>
  )
}

export function LandingFounderSection({section}: {section: LandingSectionOf<'lpFounderSection'>}) {
  const bio = paragraphs(section.bio)
  const heading = clean(section.heading)
  const src = imageUrl(section.photo, 1000, 1250)
  if (!heading && bio.length === 0) return null
  return (
    <section className={`${inset} py-14 md:py-20`}>
      <InkCard className="grid items-center gap-[32px] p-[20px] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-[48px] md:p-[48px]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface md:rounded-[16px]">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={clean(section.photo?.alt) || heading}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] uppercase tracking-label text-foreground/40">
              Add a photo
            </span>
          )}
        </div>
        <div>
          {heading && (
            <h2 className="text-[clamp(2rem,4.6vw,3.6rem)] font-semibold uppercase leading-[0.95] tracking-[-0.03em]">
              {heading}
            </h2>
          )}
          <div className="mt-[24px] space-y-[16px] text-[clamp(1.05rem,1.5vw,1.25rem)] leading-relaxed text-foreground/90">
            {bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </InkCard>
    </section>
  )
}

export function LandingQuotesSection({section}: {section: LandingSectionOf<'lpQuotesSection'>}) {
  const quotes = (section.quotes ?? []).filter((q) => clean(q?.quote) && clean(q?.author))
  if (quotes.length === 0) return null
  return (
    <Band className="py-16 md:py-24">
      <ul className={`${inset} space-y-20 md:space-y-24`}>
        {quotes.map((q) => {
          const src = imageUrl(q.photo, 320, 320)
          return (
            <li key={q._key} className="relative mx-auto max-w-4xl pt-14">
              <div className="absolute left-1/2 top-0 h-[112px] w-[112px] -translate-x-1/2 overflow-hidden rounded-full bg-surface ring-1 ring-white/80">
                {src && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={clean(q.photo?.alt) || clean(q.author)}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
              <blockquote className="rounded-[32px] border border-white/80 px-[24px] pb-[40px] pt-[80px] text-center md:rounded-[48px] md:px-[64px]">
                <p className="text-[clamp(1.1rem,1.9vw,1.6rem)] leading-relaxed">
                  “{clean(q.quote)}”
                </p>
                <footer className="mt-[20px] text-lg font-semibold tracking-[-0.01em]">
                  {clean(q.author)}
                  {clean(q.handle) && (
                    <span className="font-normal text-foreground/70"> · {clean(q.handle)}</span>
                  )}
                </footer>
              </blockquote>
            </li>
          )
        })}
      </ul>
    </Band>
  )
}

export function LandingPackagesSection({
  section,
  cta,
}: {
  section: LandingSectionOf<'lpPackagesSection'>
  cta: LandingCta
}) {
  const packages = (section.packages ?? []).filter((p) => clean(p?.name))
  if (packages.length === 0) return null
  return (
    <section id="lp-pricing" className={`${inset} py-14 md:py-20`}>
      <div className="flex justify-center">
        <Pill>{clean(section.label) || 'Our packages'}</Pill>
      </div>
      <ul className="mt-10 grid gap-[24px] md:grid-cols-2 md:gap-[32px]">
        {packages.map((pkg) => {
          const features = (pkg.features ?? []).map(clean).filter(Boolean)
          return (
            <li key={pkg._key}>
              <InkCard className="flex h-full flex-col items-center px-[24px] py-[48px] text-center md:px-[48px] md:py-[64px]">
                <h3 className="text-[clamp(2rem,4vw,3.4rem)] font-semibold uppercase leading-[0.95] tracking-[-0.03em]">
                  {clean(pkg.name)}
                </h3>
                {clean(pkg.description) && (
                  <p className="mt-[20px] max-w-[36ch] text-[clamp(1.05rem,1.5vw,1.3rem)] leading-relaxed text-foreground/85">
                    {clean(pkg.description)}
                  </p>
                )}
                {features.length > 0 && (
                  <ul className="mt-[28px] space-y-[8px] text-[clamp(1rem,1.4vw,1.25rem)] font-semibold tracking-[-0.01em]">
                    {features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                )}
                {clean(pkg.price) && (
                  <p className="mt-[32px] font-mono text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold leading-none tracking-[-0.03em]">
                    {clean(pkg.price)}
                  </p>
                )}
                {clean(pkg.note) && (
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-label text-foreground/50">
                    {clean(pkg.note)}
                  </p>
                )}
                <div className="mt-[32px]">
                  <CtaButton cta={cta} />
                </div>
              </InkCard>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function LandingResultsGallerySection({
  section,
  cta,
}: {
  section: LandingSectionOf<'lpResultsGallerySection'>
  cta: LandingCta
}) {
  const headline = clean(section.headline)
  const images = (section.images ?? []).filter((img) => img?.asset)
  if (!headline && images.length === 0) return null
  return (
    <section id="lp-results">
      {headline && (
        <h2
          className={`${inset} py-10 text-center text-[clamp(2.4rem,7vw,5.6rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-accent md:py-14`}
        >
          {headline}
        </h2>
      )}
      {images.length > 0 && (
        <Band className="py-10 md:py-14">
          <ul className={`${inset} grid gap-[16px] md:grid-cols-2 md:gap-[24px]`}>
            {images.map((img) => {
              const source = sourceOf(img)
              const src = source ? urlForImage(source)?.width(1400).fit('max').url() : null
              if (!src) return null
              return (
                <li key={img._key} className="overflow-hidden rounded-lg bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={clean(img.alt) || clean(img.caption) || 'Result'}
                    className="block w-full"
                    loading="lazy"
                  />
                  {clean(img.caption) && (
                    <p className="px-4 py-3 font-mono text-[11px] uppercase tracking-label text-ink/60">
                      {clean(img.caption)}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        </Band>
      )}
      {section.showButton !== false && (
        <div className={`${inset} flex flex-col items-center gap-3 py-12 md:py-16`}>
          <CtaButton cta={cta} />
          <CtaSubhead text={cta.subhead} />
        </div>
      )}
    </section>
  )
}

/** FAQ on an ink band: pill label, hairline rules, question in caps, centered answer. */
export function LandingFaqBand({section}: {section: LandingSectionOf<'lpFaqSection'>}) {
  const items = (section.faq?.items ?? [])
    .filter((item) => clean(item?.question) && clean(item?.answer))
    .map((item) => ({_key: item._key, question: clean(item.question), answer: clean(item.answer)}))
  if (items.length === 0) return null
  return (
    <Band id="lp-faq" className="py-16 md:py-24">
      <FAQStructuredData faqs={items.map(({question, answer}) => ({question, answer}))} />
      <div className={inset}>
        <div className="flex justify-center">
          <Pill>{clean(section.faq?.title) || 'FAQs'}</Pill>
        </div>
        <dl className="mx-auto mt-12 max-w-4xl divide-y divide-white/70 border-y border-white/70">
          {items.map((item) => (
            <div key={item._key} className="py-10 text-center md:py-12">
              <dt className="text-[clamp(1.4rem,3vw,2.4rem)] font-semibold uppercase leading-[1.05] tracking-[-0.02em]">
                {item.question}
              </dt>
              <dd className="mx-auto mt-[20px] max-w-[62ch] text-[clamp(1.05rem,1.6vw,1.35rem)] leading-relaxed text-foreground/90">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Band>
  )
}
