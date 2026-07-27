import {CapReveal} from '@/components/CapabilitiesMotion'

type SanityImage = {
  asset?: {_ref?: string; _id?: string; url?: string} | null
  alt?: string | null
} | null

type ManifestoItem = {
  _key: string
  subhead?: string | null
  body?: string | null
  sideImage?: SanityImage
}

type CapabilitiesManifestoProps = {
  items: ManifestoItem[]
  /**
   * `feature` — Why Modular: headline left, body right.
   * `pair` — two-column band (How / Where).
   * `grid` — auto columns from item count.
   */
  layout?: 'feature' | 'pair' | 'grid'
}

/** Why / How / Where — hairline technical bands, not cards. */
export function CapabilitiesManifesto({items, layout = 'grid'}: CapabilitiesManifestoProps) {
  if (!items.length) return null

  const resolvedLayout =
    layout === 'grid'
      ? items.length === 1
        ? 'feature'
        : items.length === 2
          ? 'pair'
          : 'grid'
      : layout

  if (resolvedLayout === 'feature') {
    const item = items[0]
    const headline = item.subhead?.trim() || null

    return (
      <section className="border-b border-black/10">
        <CapReveal className="mx-auto grid max-w-6xl items-start gap-5 px-5 py-14 sm:gap-6 sm:px-6 sm:py-16 md:grid-cols-2 md:gap-12 md:py-20 lg:gap-16">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-black/40 sm:text-[11px]">
              Why modular
            </p>
            {headline ? (
              <h2 className="mt-4 max-w-md font-mono text-[clamp(1.55rem,3.5vw,2.65rem)] font-medium leading-[1.08] tracking-tight text-black md:mt-5">
                {headline}
              </h2>
            ) : null}
          </div>

          {item.body ? (
            <p className="text-[0.9375rem] leading-[1.75] text-black/55 md:pt-7 md:text-base md:leading-[1.8] lg:pt-8">
              {item.body}
            </p>
          ) : null}
        </CapReveal>
      </section>
    )
  }

  const colsClass =
    resolvedLayout === 'pair' ? (items.length > 1 ? 'md:grid-cols-2' : '') : 'md:grid-cols-3'

  return (
    <section className="border-b border-black/10">
      <div className={`mx-auto grid max-w-6xl ${colsClass}`}>
        {items.map((item, index) => (
          <CapReveal key={item._key} delay={index * 0.06}>
            <article
              className={`px-5 py-10 sm:px-6 md:py-16 ${
                index < items.length - 1 ? 'border-b border-black/10 md:border-b-0 md:border-r' : ''
              }`}
            >
              {item.subhead ? (
                <h2 className="font-mono text-lg font-medium leading-snug tracking-tight text-black md:text-xl">
                  {item.subhead}
                </h2>
              ) : null}
              {item.body ? (
                <p className="mt-4 text-sm leading-relaxed text-black/60 md:mt-5 md:text-[15px]">
                  {item.body}
                </p>
              ) : null}
            </article>
          </CapReveal>
        ))}
      </div>
    </section>
  )
}
