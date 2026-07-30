'use client'

function LoadingScan({accent = false}: {accent?: boolean}) {
  return (
    <div
      className="relative h-px w-full shrink-0 overflow-hidden bg-foreground/10"
      aria-hidden="true"
    >
      <div
        className={`absolute inset-y-0 w-1/3 animate-salt-scan ${
          accent ? 'bg-accent' : 'bg-foreground/40'
        }`}
      />
    </div>
  )
}

function Block({
  className,
  style,
  delay = 0,
}: {
  className?: string
  style?: React.CSSProperties
  delay?: number
}) {
  return (
    <div
      aria-hidden="true"
      style={{...style, animationDelay: delay ? `${delay}ms` : undefined}}
      className={`animate-salt-shimmer bg-foreground/8 ${className ?? ''}`}
    />
  )
}

function LoadingStatus({label}: {label: string}) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/40">
      {label}
      <span className="animate-salt-blink">_</span>
    </p>
  )
}

function LoadingShell({
  label,
  children,
  className,
  dark = false,
}: {
  label: string
  children: React.ReactNode
  className?: string
  dark?: boolean
}) {
  return (
    <div
      role="status"
      aria-label={`Loading ${label}`}
      data-theme={dark ? 'dark' : undefined}
      className={`bg-background text-foreground ${className ?? ''}`}
    >
      <LoadingScan accent />
      {children}
    </div>
  )
}

/**
 * Home route suspense shell — plain ink only.
 * The branded session sequence lives in SiteIntro; do not duplicate a mark here.
 */
export function HomeLoading() {
  return (
    <div
      role="status"
      aria-label="Loading home"
      aria-live="polite"
      className="min-h-screen bg-[#08090a]"
    />
  )
}

/** Work index + category — filter masthead, search line, contact-sheet grid. */
export function WorkLoading() {
  return (
    <LoadingShell label="work" dark className="pb-24">
      <header className="page-chrome pt-28 text-center md:pt-36">
        <Block className="mx-auto h-8 w-[min(90%,28rem)] md:h-10" delay={40} />
        <Block className="mx-auto mt-2 h-8 w-[min(70%,20rem)] md:h-10" delay={120} />
        <Block className="mx-auto mt-3 h-3 w-40" delay={200} />
      </header>

      <ul className="media-bleed mt-12 grid grid-cols-1 gap-x-hairline gap-y-10 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
        {Array.from({length: 6}, (_, i) => (
          <li key={i} className="animate-salt-rise" style={{animationDelay: `${i * 70}ms`}}>
            <Block className="aspect-video w-full" delay={i * 70} />
            <div className="mt-2 flex items-baseline gap-2.5 px-[16px] md:mt-2.5 md:gap-3 md:px-[20px]">
              <span className="shrink-0 font-sans text-[13px] font-bold tabular-nums tracking-[-0.02em] text-foreground/25 md:text-[17px]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <Block className="h-3 w-2/5 md:h-3.5" delay={i * 70 + 40} />
              <Block className="ml-auto h-3 w-16 md:h-3.5" delay={i * 70 + 80} />
            </div>
          </li>
        ))}
      </ul>
    </LoadingShell>
  )
}

/** Project detail — title masthead + gallery stack + sidebar. */
export function ProjectLoading() {
  return (
    <LoadingShell label="project" dark className="pb-24">
      <header className="px-5 pt-28 text-center md:px-6 md:pt-32">
        <Block className="mx-auto h-3 w-28" delay={40} />
        <Block className="mx-auto mt-1 h-3 w-24" delay={80} />
        <Block className="mx-auto mt-4 h-14 w-[min(90%,16ch)] md:h-20" delay={140} />
      </header>

      <section className="mt-4 grid grid-cols-1 gap-5 pb-16 md:mt-10 md:gap-6 lg:mt-16 lg:grid-cols-[minmax(20rem,28rem)_minmax(0,1fr)] lg:gap-x-10">
        <div className="order-1 min-w-0 lg:order-2">
          {Array.from({length: 3}, (_, i) => (
            <Block key={i} className="aspect-video w-full" delay={180 + i * 90} />
          ))}
        </div>
        <aside className="order-2 space-y-5 px-5 md:space-y-6 md:px-6 lg:order-1 lg:px-0 lg:pl-[30px]">
          <div>
            <LoadingStatus label="Idea" />
            <Block className="mt-2 h-4 w-full" delay={220} />
            <Block className="mt-2 h-4 w-11/12" delay={260} />
            <Block className="mt-2 h-4 w-4/5" delay={300} />
          </div>
          <div>
            <LoadingStatus label="Insight" />
            <Block className="mt-2 h-4 w-full" delay={340} />
            <Block className="mt-2 h-4 w-5/6" delay={380} />
          </div>
        </aside>
      </section>
    </LoadingShell>
  )
}

/** Paper interiors — contact (narrow), studio / capabilities (wide). */
export function EditorialLoading({width = 'wide'}: {width?: 'narrow' | 'wide'}) {
  const maxWidth = width === 'narrow' ? 'max-w-2xl' : 'max-w-4xl'

  return (
    <LoadingShell label="page" className="pb-24">
      <div className={`mx-auto ${maxWidth} px-6 py-16`}>
        <header className="mb-16 space-y-4">
          <Block className="h-12 w-4/5 md:h-16" delay={40} />
          <Block className="h-4 w-full" delay={100} />
          <Block className="h-4 w-2/3" delay={160} />
        </header>

        <section className="mb-16 space-y-3">
          <Block className="h-6 w-1/3" delay={200} />
          <Block className="h-4 w-full" delay={240} />
          <Block className="h-4 w-11/12" delay={280} />
          <Block className="h-4 w-4/5" delay={320} />
        </section>

        <section className="space-y-0 border-y border-foreground/15">
          {Array.from({length: 4}, (_, i) => (
            <div key={i} className="flex justify-between gap-6 border-t border-foreground/15 py-3">
              <Block className="h-3 w-24" delay={360 + i * 60} />
              <Block className="h-3 w-32" delay={400 + i * 60} />
            </div>
          ))}
        </section>
      </div>
    </LoadingShell>
  )
}

/** Legal index (list) or article (prose). */
export function LegalLoading({article = false}: {article?: boolean}) {
  if (article) {
    return (
      <LoadingShell label="legal page" className="pb-24">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Block className="mb-8 h-10 w-2/3" delay={40} />
          <div className="space-y-3">
            {Array.from({length: 8}, (_, i) => (
              <Block
                key={i}
                className="h-4 w-full"
                style={{width: `${100 - (i % 3) * 8}%`}}
                delay={80 + i * 50}
              />
            ))}
          </div>
        </div>
      </LoadingShell>
    )
  }

  return (
    <LoadingShell label="legal" className="pb-24">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Block className="mb-10 h-12 w-1/2" delay={40} />
        <ul className="space-y-4">
          {Array.from({length: 4}, (_, i) => (
            <li key={i} className="border-b border-foreground/15 pb-4">
              <Block className="h-6 w-1/3" delay={100 + i * 70} />
            </li>
          ))}
        </ul>
      </div>
    </LoadingShell>
  )
}
