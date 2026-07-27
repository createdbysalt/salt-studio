'use client'

type Theme = 'dark' | 'light'

function LoadingScan({theme}: {theme: Theme}) {
  return (
    <div
      className={`relative h-px w-full shrink-0 overflow-hidden ${
        theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
      }`}
      aria-hidden="true"
    >
      <div
        className={`absolute inset-y-0 w-1/4 animate-salt-scan ${
          theme === 'dark' ? 'bg-white/50' : 'bg-black/35'
        }`}
      />
    </div>
  )
}

function Block({
  theme,
  className,
  style,
}: {
  theme: Theme
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={`animate-salt-shimmer ${
        theme === 'dark' ? 'bg-white/10' : 'bg-black/[0.06]'
      } ${className ?? ''}`}
    />
  )
}

function LoadingStatus({label, theme}: {label: string; theme: Theme}) {
  return (
    <p
      className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
        theme === 'dark' ? 'text-white/35' : 'text-black/35'
      }`}
    >
      {label}
    </p>
  )
}

function LoadingShell({
  theme,
  label,
  children,
  className,
}: {
  theme: Theme
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      role="status"
      aria-label={`Loading ${label}`}
      className={`${theme === 'dark' ? 'bg-[#1a1a1a] text-white' : 'bg-background text-foreground'} ${className ?? ''}`}
    >
      <LoadingScan theme={theme} />
      {children}
    </div>
  )
}

/** Home — light paper stage matching the hero. */
export function HomeLoading() {
  return (
    <LoadingShell theme="light" label="home" className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <Block theme="light" className="h-4 w-28" />
        <LoadingStatus label="Loading" theme="light" />
      </div>
    </LoadingShell>
  )
}

/** Work index + category — dark header, search, pills, hairline grid. */
export function WorkLoading() {
  return (
    <LoadingShell theme="dark" label="work" className="pb-24">
      <header className="px-5 pt-10 md:px-6 md:pt-14">
        <Block theme="dark" className="h-10 w-2/3 max-w-md md:h-12" />
        <Block theme="dark" className="mt-4 h-3 w-full max-w-sm" />
        <Block theme="dark" className="mt-2 h-3 w-4/5 max-w-xs" />
      </header>

      <div className="px-5 md:px-6">
        <div className="mt-6">
          <LoadingStatus label="Search —" theme="dark" />
          <Block
            theme="dark"
            className="mt-3 h-10 w-full border-b border-white/20 bg-transparent"
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {[72, 88, 64, 96, 80].map((width) => (
            <Block key={width} theme="dark" className="h-8" style={{width: `${width}px`}} />
          ))}
        </div>
      </div>

      <ul className="mt-12 grid grid-cols-1 gap-hairline sm:grid-cols-2">
        {Array.from({length: 6}, (_, i) => (
          <li key={i} className="bg-[#1a1a1a]">
            <Block theme="dark" className="aspect-[6/5] w-full sm:aspect-[16/9]" />
            <div className="space-y-2 p-4 md:p-5">
              <Block theme="dark" className="h-5 w-3/4" />
              <Block theme="dark" className="h-3 w-1/2" />
            </div>
          </li>
        ))}
      </ul>
    </LoadingShell>
  )
}

/** Project detail — cinematic hero + spec sidebar layout. */
export function ProjectLoading() {
  return (
    <div role="status" aria-label="Loading project" className="bg-[#1a1a1a] text-white">
      <LoadingScan theme="dark" />
      <header className="relative">
        <Block theme="dark" className="aspect-[16/10] w-full md:aspect-[21/9]" />
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="-mt-16 space-y-3 md:-mt-24">
            <Block theme="dark" className="h-3 w-40" />
            <Block theme="dark" className="h-12 w-full max-w-2xl md:h-16" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pt-12 pb-24 md:px-8 md:pt-16">
        <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-[1fr_18rem]">
          <div className="order-2 space-y-4 lg:order-1">
            <Block theme="dark" className="h-4 w-full" />
            <Block theme="dark" className="h-4 w-11/12" />
            <Block theme="dark" className="h-4 w-4/5" />
            <Block theme="dark" className="mt-8 h-48 w-full" />
          </div>
          <aside className="order-1 lg:order-2">
            <LoadingStatus label="Spec" theme="dark" />
            <div className="mt-4 space-y-0 border-t border-white/10">
              {Array.from({length: 5}, (_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[5.5rem_1fr] gap-4 border-t border-white/10 py-3"
                >
                  <Block theme="dark" className="h-3 w-full" />
                  <Block theme="dark" className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

/** Paper interiors — contact (narrow), studio / capabilities (wide). */
export function EditorialLoading({width = 'wide'}: {width?: 'narrow' | 'wide'}) {
  const maxWidth = width === 'narrow' ? 'max-w-2xl' : 'max-w-4xl'

  return (
    <LoadingShell theme="light" label="page" className="pb-24">
      <div className={`mx-auto ${maxWidth} px-6 py-16`}>
        <header className="mb-16 space-y-4">
          <Block theme="light" className="h-12 w-4/5 md:h-16" />
          <Block theme="light" className="h-4 w-full" />
          <Block theme="light" className="h-4 w-2/3" />
        </header>

        <section className="mb-16 space-y-3">
          <Block theme="light" className="h-6 w-1/3" />
          <Block theme="light" className="h-4 w-full" />
          <Block theme="light" className="h-4 w-11/12" />
          <Block theme="light" className="h-4 w-4/5" />
        </section>

        <section className="space-y-0 border-y border-black/10">
          {Array.from({length: 4}, (_, i) => (
            <div key={i} className="flex justify-between gap-6 border-t border-black/10 py-3">
              <Block theme="light" className="h-3 w-24" />
              <Block theme="light" className="h-3 w-32" />
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
      <LoadingShell theme="light" label="legal page" className="pb-24">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Block theme="light" className="mb-8 h-10 w-2/3" />
          <div className="space-y-3">
            {Array.from({length: 8}, (_, i) => (
              <Block
                key={i}
                theme="light"
                className="h-4 w-full"
                style={{width: `${100 - (i % 3) * 8}%`}}
              />
            ))}
          </div>
        </div>
      </LoadingShell>
    )
  }

  return (
    <LoadingShell theme="light" label="legal" className="pb-24">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Block theme="light" className="mb-10 h-12 w-1/2" />
        <ul className="space-y-4">
          {Array.from({length: 4}, (_, i) => (
            <li key={i} className="border-b border-black/10 pb-4">
              <Block theme="light" className="h-6 w-1/3" />
            </li>
          ))}
        </ul>
      </div>
    </LoadingShell>
  )
}
