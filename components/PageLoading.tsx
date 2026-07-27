'use client'

function LoadingScan() {
  return (
    <div className="relative h-px w-full shrink-0 overflow-hidden bg-foreground/10" aria-hidden="true">
      <div className="absolute inset-y-0 w-1/4 animate-salt-scan bg-foreground/35" />
    </div>
  )
}

function Block({className, style}: {className?: string; style?: React.CSSProperties}) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={`animate-salt-shimmer bg-foreground/6 ${className ?? ''}`}
    />
  )
}

function LoadingStatus({label}: {label: string}) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground/35">{label}</p>
  )
}

function LoadingShell({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      role="status"
      aria-label={`Loading ${label}`}
      className={`bg-background text-foreground ${className ?? ''}`}
    >
      <LoadingScan />
      {children}
    </div>
  )
}

/** Home — paper stage matching the hero. */
export function HomeLoading() {
  return (
    <LoadingShell label="home" className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <Block className="h-4 w-28" />
        <LoadingStatus label="Loading" />
      </div>
    </LoadingShell>
  )
}

/** Work index + category — filter masthead, search line, contact-sheet grid. */
export function WorkLoading() {
  return (
    <LoadingShell label="work" className="pb-24">
      <header className="page-chrome pt-12 md:pt-20">
        <Block className="h-3 w-20" />
        <Block className="mt-[20px] h-10 w-full max-w-3xl md:h-14" />
        <Block className="mt-2 h-10 w-3/4 max-w-xl md:h-14" />
        <Block className="mt-[24px] h-3 w-full max-w-sm" />
      </header>

      <div className="page-chrome mt-10 md:mt-14">
        <div className="md:ml-auto md:max-w-xs">
          <LoadingStatus label="Search —" />
          <Block className="mt-2 h-9 w-full border-b border-foreground/15 bg-transparent" />
        </div>
      </div>

      <ul className="mt-12 grid grid-cols-1 gap-x-hairline gap-y-10 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
        {Array.from({length: 6}, (_, i) => (
          <li key={i}>
            <Block className="aspect-[16/9] w-full" />
            <div className="mt-3 flex items-baseline gap-3 px-[16px] md:px-[20px]">
              <Block className="h-3 w-6" />
              <Block className="h-3 w-2/5" />
              <Block className="ml-auto h-3 w-16" />
            </div>
          </li>
        ))}
      </ul>
    </LoadingShell>
  )
}

/** Project detail — cinematic hero + spec sidebar layout, light chrome. */
export function ProjectLoading() {
  return (
    <LoadingShell label="project" className="pb-24">
      <header className="relative">
        <Block className="aspect-[16/10] w-full md:aspect-[21/9]" />
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="mt-8 space-y-3 md:mt-10">
            <Block className="h-3 w-40" />
            <Block className="h-12 w-full max-w-2xl md:h-16" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pt-12 pb-24 md:px-8 md:pt-16">
        <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-[1fr_18rem]">
          <div className="order-2 space-y-4 lg:order-1">
            <Block className="h-4 w-full" />
            <Block className="h-4 w-11/12" />
            <Block className="h-4 w-4/5" />
            <Block className="mt-8 h-48 w-full" />
          </div>
          <aside className="order-1 lg:order-2">
            <LoadingStatus label="Spec" />
            <div className="mt-4 space-y-0 border-t border-foreground/15">
              {Array.from({length: 5}, (_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[5.5rem_1fr] gap-4 border-t border-foreground/15 py-3"
                >
                  <Block className="h-3 w-full" />
                  <Block className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
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
          <Block className="h-12 w-4/5 md:h-16" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-2/3" />
        </header>

        <section className="mb-16 space-y-3">
          <Block className="h-6 w-1/3" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-11/12" />
          <Block className="h-4 w-4/5" />
        </section>

        <section className="space-y-0 border-y border-foreground/15">
          {Array.from({length: 4}, (_, i) => (
            <div key={i} className="flex justify-between gap-6 border-t border-foreground/15 py-3">
              <Block className="h-3 w-24" />
              <Block className="h-3 w-32" />
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
          <Block className="mb-8 h-10 w-2/3" />
          <div className="space-y-3">
            {Array.from({length: 8}, (_, i) => (
              <Block key={i} className="h-4 w-full" style={{width: `${100 - (i % 3) * 8}%`}} />
            ))}
          </div>
        </div>
      </LoadingShell>
    )
  }

  return (
    <LoadingShell label="legal" className="pb-24">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Block className="mb-10 h-12 w-1/2" />
        <ul className="space-y-4">
          {Array.from({length: 4}, (_, i) => (
            <li key={i} className="border-b border-foreground/15 pb-4">
              <Block className="h-6 w-1/3" />
            </li>
          ))}
        </ul>
      </div>
    </LoadingShell>
  )
}
