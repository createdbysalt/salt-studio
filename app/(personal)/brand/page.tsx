import type {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'Brand Style Guide',
  description: 'Visual reference for all design tokens and components',
}

export default function BrandPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Brand Style Guide</h1>
        <p className="mt-2 text-lg text-foreground/70">
          Ink on paper — light is the default stage. Source of truth:{' '}
          <code className="rounded bg-foreground/6 px-1.5 py-0.5 font-mono text-sm">DESIGN.md</code>{' '}
          · tokens in{' '}
          <code className="rounded bg-foreground/6 px-1.5 py-0.5 font-mono text-sm">
            app/globals.css
          </code>
          .
        </p>
      </header>

      {/* Brand Colors */}
      <Section title="Brand Colors" description="Primary tokens to customize per-client">
        <div className="grid gap-6 sm:grid-cols-3">
          <ColorCard
            name="Primary"
            colors={[
              {label: 'primary', className: 'bg-primary'},
              {label: 'primary-hover', className: 'bg-primary-hover'},
              {label: 'primary-light', className: 'bg-primary-light'},
            ]}
          />
          <ColorCard
            name="Secondary"
            colors={[
              {label: 'secondary', className: 'bg-secondary'},
              {label: 'secondary-hover', className: 'bg-secondary-hover'},
              {label: 'secondary-light', className: 'bg-secondary-light'},
            ]}
          />
          <ColorCard
            name="Accent"
            colors={[
              {label: 'accent', className: 'bg-accent'},
              {label: 'accent-hover', className: 'bg-accent-hover'},
              {label: 'accent-light', className: 'bg-accent-light'},
            ]}
          />
        </div>
      </Section>

      {/* Semantic Colors */}
      <Section title="Semantic Colors" description="Background, foreground, and UI colors">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-border p-4">
            <div className="mb-2 h-16 rounded bg-background border border-border" />
            <p className="text-sm font-medium">background</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="mb-2 h-16 rounded bg-foreground" />
            <p className="text-sm font-medium">foreground</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="mb-2 h-16 rounded bg-muted" />
            <p className="text-sm font-medium">muted</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="mb-2 h-16 rounded bg-muted-foreground" />
            <p className="text-sm font-medium">muted-foreground</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="mb-2 h-16 rounded bg-border" />
            <p className="text-sm font-medium">border</p>
          </div>
        </div>
      </Section>

      {/* State Colors */}
      <Section title="State Colors" description="Feedback and status indicators">
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border p-4">
            <div className="mb-2 h-16 rounded bg-success" />
            <p className="text-sm font-medium">success</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="mb-2 h-16 rounded bg-warning" />
            <p className="text-sm font-medium">warning</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="mb-2 h-16 rounded bg-error" />
            <p className="text-sm font-medium">error</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="mb-2 h-16 rounded bg-info" />
            <p className="text-sm font-medium">info</p>
          </div>
        </div>
      </Section>

      {/* Brand Palette */}
      <Section title="Brand Palette" description="The full set — ink on paper, one red accent (DESIGN.md)">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            {label: 'ink', className: 'bg-ink'},
            {label: 'paper', className: 'border border-border bg-paper'},
            {label: 'surface', className: 'border border-border bg-surface'},
            {label: 'accent', className: 'bg-accent'},
            {label: 'gray-brand', className: 'bg-gray-brand'},
            {label: 'logo-light', className: 'border border-border bg-logo-light'},
          ].map(({label, className}) => (
            <div key={label} className="rounded-lg border border-border bg-surface p-4">
              <div className={`mb-2 h-16 rounded ${className}`} />
              <p className="text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Opacity Ladder */}
      <Section
        title="Opacity Ladder"
        description="Ink at opacity — prefer these over inventing grays"
      >
        <div className="rounded-lg border border-border bg-surface p-6">
          <div className="space-y-4">
            <div>
              <p className="text-lg font-semibold text-foreground">Titles — foreground /90–100</p>
            </div>
            <div>
              <p className="text-foreground/70">Body copy — foreground/70</p>
            </div>
            <div>
              <p className="text-foreground/40">Muted captions, idle labels — foreground/40</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-foreground/15" />
              <span className="text-sm text-muted-foreground">hairlines — foreground/15</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 flex-1 rounded bg-foreground/6" />
              <span className="text-sm text-muted-foreground">washes — foreground/6</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typography" description="Font families and text styles">
        <div className="space-y-8">
          <div className="rounded-lg border border-border p-6">
            <p className="mb-4 text-sm font-medium text-muted-foreground">Font Families</p>
            <div className="space-y-4">
              <div>
                <p className="font-sans text-2xl font-semibold uppercase tracking-[-0.02em]">
                  Geist — display + body
                </p>
                <p className="text-sm text-muted-foreground">font-sans · DESIGN.md</p>
              </div>
              <div>
                <p className="text-label">Geist Mono — labels / telemetry / technical marks</p>
                <p className="text-sm text-muted-foreground">
                  font-mono · .text-label / .text-telemetry · tracking 0.08em
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-6">
            <p className="mb-4 text-sm font-medium text-muted-foreground">Type roles</p>
            <div className="space-y-4">
              <div>
                <p className="font-sans text-4xl font-semibold uppercase leading-[0.95] tracking-[-0.02em] lg:text-5xl">
                  Subtle. Essential.
                </p>
                <p className="text-sm text-muted-foreground">Display / H1 — heroes, page titles</p>
              </div>
              <div>
                <p className="text-h2 font-sans font-semibold tracking-[-0.02em]">
                  Clarity where visitors decide
                </p>
                <p className="text-sm text-muted-foreground">text-h2 — section headers</p>
              </div>
              <div>
                <p className="text-label text-foreground/40">Work · Services · About · Contact</p>
                <p className="text-sm text-muted-foreground">.text-label — nav / UI chrome</p>
              </div>
              <div>
                <p className="text-telemetry text-foreground/40">Case 01 — Brand & Site · 2026</p>
                <p className="text-sm text-muted-foreground">.text-telemetry — fine print, tags</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Buttons */}
      <Section
        title="Buttons"
        description="Specs in DESIGN.md — mono labels, tracking 0.08em, radius 8"
      >
        <div className="space-y-8">
          <div className="rounded-lg border border-border bg-surface p-6">
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              On paper (light default)
            </p>
            <div className="flex flex-wrap gap-4">
              <button type="button" className="btn-solid group">
                <span className="inline-flex items-center gap-2">
                  Book a discovery call
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </button>
              <button type="button" className="btn-ghost group">
                <span className="inline-flex items-center gap-2">
                  See the work
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </button>
              <button type="button" className="btn-accent">
                Join the waitlist
              </button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              .btn-accent is reserved for the Salt-product waitlist — nothing else gets a red fill.
            </p>
          </div>

          <div data-theme="dark" className="rounded-lg bg-background p-6 text-foreground">
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              On a dark band (data-theme=&quot;dark&quot;) — same classes, tokens flip
            </p>
            <div className="flex flex-wrap gap-4">
              <button type="button" className="btn-solid">
                Book a discovery call
              </button>
              <button type="button" className="btn-ghost group">
                <span className="inline-flex items-center gap-2">
                  See the work
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* Form Elements */}
      <Section title="Form Elements" description="Inputs, selects, and other form controls">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border p-6">
            <p className="mb-4 text-sm font-medium text-muted-foreground">Text Inputs</p>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Default Input</label>
                <input
                  type="text"
                  placeholder="Enter text..."
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Disabled Input</label>
                <input
                  type="text"
                  placeholder="Disabled..."
                  disabled
                  className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm placeholder:text-muted-foreground cursor-not-allowed opacity-50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">With Error</label>
                <input
                  type="text"
                  placeholder="Invalid input..."
                  className="w-full rounded-md border border-error bg-surface px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-error focus:outline-none focus:ring-1 focus:ring-error"
                />
                <p className="mt-1 text-sm text-error">This field is required</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-6">
            <p className="mb-4 text-sm font-medium text-muted-foreground">Other Controls</p>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Select</label>
                <select className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Textarea</label>
                <textarea
                  placeholder="Enter long text..."
                  rows={3}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="checkbox"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-accent"
                />
                <label htmlFor="checkbox" className="text-sm">
                  Checkbox label
                </label>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Cards */}
      <Section title="Cards" description="Container patterns">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface p-6">
            <h3 className="text-lg font-semibold">Default Card</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A simple card with border and padding. Good for grouping related content.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Card with Shadow</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Adds subtle elevation for visual hierarchy.
            </p>
          </div>
          <div className="rounded-lg bg-muted p-6">
            <h3 className="text-lg font-semibold">Muted Card</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Uses muted background for less prominent sections.
            </p>
          </div>
          <div className="rounded-lg bg-primary p-6 text-background">
            <h3 className="text-lg font-semibold">Primary Card</h3>
            <p className="mt-2 text-sm opacity-90">Highlighted card using primary brand color.</p>
          </div>
          <div className="rounded-lg border-2 border-primary bg-primary-light p-6">
            <h3 className="text-lg font-semibold text-primary">Featured Card</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Uses primary light background with primary border.
            </p>
          </div>
          <div className="group rounded-lg border border-border bg-surface p-6 transition-all hover:border-primary hover:shadow-md cursor-pointer">
            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
              Interactive Card
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">Hover state for clickable cards.</p>
          </div>
        </div>
      </Section>

      {/* Spacing */}
      <Section title="Spacing Scale" description="Custom spacing values from the theme">
        <div className="rounded-lg border border-border p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <div key={n} className="flex items-center gap-4">
                <span className="w-8 text-sm font-mono text-muted-foreground">{n}</span>
                <div
                  className={`h-4 bg-primary rounded spacing-${n}`}
                  style={{width: `var(--spacing-${n})`}}
                />
                <span className="text-sm text-muted-foreground">
                  {n === 1 && '4px'}
                  {n === 2 && '8px'}
                  {n === 3 && '12px'}
                  {n === 4 && '20px'}
                  {n === 5 && '32px'}
                  {n === 6 && '52px'}
                  {n === 7 && '84px'}
                  {n === 8 && '136px'}
                  {n === 9 && '220px'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Border Radius */}
      <Section
        title="Border Radius"
        description="Rounded-rectangle shape language — 4 (sm) / 8 (default) / 16 (lg)"
      >
        <div className="flex flex-wrap gap-6">
          {[
            {name: 'none', className: 'rounded-none'},
            {name: 'sm', className: 'rounded-sm'},
            {name: 'default', className: 'rounded'},
            {name: 'md', className: 'rounded-md'},
            {name: 'lg', className: 'rounded-lg'},
            {name: 'full', className: 'rounded-full'},
          ].map(({name, className}) => (
            <div key={name} className="text-center">
              <div className={`h-16 w-16 bg-primary ${className}`} />
              <p className="mt-2 text-sm text-muted-foreground">{name}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      <p className="mt-1 text-muted-foreground">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function ColorCard({name, colors}: {name: string; colors: {label: string; className: string}[]}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="mb-3 text-sm font-medium">{name}</p>
      <div className="space-y-2">
        {colors.map(({label, className}) => (
          <div key={label} className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded ${className}`} />
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
