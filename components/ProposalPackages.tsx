import {ProposalSwirlField} from '@/components/ProposalOutcomes'
import {ProposalScopePanel} from '@/components/ProposalScopePanel'
import {PortableText, type PortableTextBlock} from 'next-sanity'

export type ProposalPackageOffer = {
  id: string
  name: string
  summary: string
  items: string[]
  scope: PortableTextBlock[]
  price: string
  /** The reduced price, already formatted, when the same-day percent applies. */
  sale: string | null
  amount: number | null
  recommended: boolean
}

export type ProposalAddOnOffer = {
  id: string
  name: string
  line: string
  scope: PortableTextBlock[]
  price: string
}

/**
 * Packages and add-ons on the dotted field. Prices are shown.
 * Choosing happens later on the page.
 * Add-ons sit in the same grid, two per row.
 * One package fills the row. With two, the higher price takes the wider card.
 * A same-day percent, when set, sticks beside the heading and reduces the package prices.
 */
function featuredPackages(packages: ProposalPackageOffer[]) {
  const priced = packages.filter((pkg) => pkg.amount != null)
  const featured = priced.reduce<ProposalPackageOffer | null>(
    (best, pkg) => (!best || (pkg.amount ?? -1) > (best.amount ?? -1) ? pkg : best),
    null,
  )
  const featuredId = featured?.id ?? packages.find((pkg) => pkg.recommended)?.id ?? packages[0]?.id

  return packages.map((pkg) => ({...pkg, recommended: pkg.id === featuredId}))
}

function packageSpan(packages: ProposalPackageOffer[], index: number) {
  if (packages.length <= 1) return 'md:col-span-12'
  const recommended = packages.findIndex((item) => item.recommended)
  const wide = recommended === -1 ? 0 : recommended
  return index === wide ? 'md:col-span-7' : 'md:col-span-5'
}

function ScopeLink({
  name,
  scope,
  items,
}: {
  name: string
  scope: PortableTextBlock[]
  items: string[]
}) {
  return (
    <ProposalScopePanel
      appearance="text"
      label="View full scope of work"
      title={name}
      dismissLabel={`Dismiss ${name} scope`}
      closeLabel={`Close ${name} scope`}
    >
      <div className="max-w-[40rem] text-[1.0625rem] leading-relaxed [&_h3]:mt-[1.25rem] [&_h3]:text-[1.0625rem] [&_h3]:font-medium [&_li+li]:mt-1.5 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-4 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-[#8f8f8f]">
        {scope.length > 0 ? (
          <PortableText value={scope} />
        ) : items.length > 0 ? (
          <ul>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </ProposalScopePanel>
  )
}

const stickerStar =
  'M100 12C120 54 148 80 188 100C148 120 120 146 100 188C80 146 52 120 12 100C52 80 80 54 100 12Z'

function SameDaySticker({percent}: {percent: number}) {
  return (
    <div className="pointer-events-none relative z-20 mt-1 -mb-28 shrink-0 self-end md:mt-2 md:mb-0 md:self-start">
      <div className="relative h-[15rem] w-[15rem] rotate-[-8deg] drop-shadow-[0_0_14px_rgba(240,138,58,0.9)] drop-shadow-[0_0_32px_rgba(240,138,58,0.55)] lg:h-[14rem] lg:w-[14rem]">
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path d={stickerStar} fill="#f08a3a" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-[3em] text-center text-[1rem] text-white lg:text-[0.933rem]">
          <p className="text-[1.2em] font-medium leading-none tracking-[-0.04em]">{percent}% off</p>
          <p className="-mt-1 font-mono text-[0.625em] font-medium uppercase leading-[1.15] tracking-[0.08em] text-white/85">
            sign within
            <br />
            24 hours
          </p>
        </div>
      </div>
    </div>
  )
}

export function ProposalPackages({
  heading,
  intro,
  packages,
  addOnHeading,
  addOns,
  discountPercent,
}: {
  heading: string
  intro: string
  packages: ProposalPackageOffer[]
  addOnHeading: string
  addOns: ProposalAddOnOffer[]
  discountPercent: number | null
}) {
  if (packages.length === 0) return null

  const offers = featuredPackages(packages.slice(0, 2))

  return (
    <section className="w-full px-[max(3.5rem,var(--spacing-gutter))] pt-40 pb-24 md:px-[max(4.5rem,var(--spacing-gutter))] lg:pt-48 lg:pb-32">
      <header className="flex flex-nowrap items-start justify-between gap-x-4">
        <div className="min-w-0">
          <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
            The work
          </p>
          <h2 className="mt-3 whitespace-nowrap text-[clamp(2.5rem,6.4vw,6rem)] font-normal leading-[0.95] tracking-[-0.05em]">
            {heading}
          </h2>
          {intro ? (
            <p className="mt-4 max-w-[22rem] text-[1.05rem] font-medium leading-snug tracking-[-0.02em] text-[#5c5c5c]">
              {intro}
            </p>
          ) : null}
        </div>
        {discountPercent != null ? <SameDaySticker percent={discountPercent} /> : null}
      </header>

      <div className="mt-6 grid grid-cols-1 items-stretch gap-3 md:grid-cols-12">
        {offers.map((pkg, index) => (
          <div key={pkg.id} className={`h-full ${packageSpan(offers, index)}`}>
            <article
              className={`relative flex h-full flex-col overflow-hidden rounded-[32px] border border-white/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_30px_80px_rgba(40,30,10,0.12)] ${
                pkg.recommended ? '' : 'bg-[rgba(228,228,228,0.62)] backdrop-blur-[42px]'
              }`}
            >
              {pkg.recommended ? <ProposalSwirlField tone="ember" /> : null}
              <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
                <div className="absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.45),transparent)]" />
              </div>
              <div className="relative z-[2] flex h-full flex-col">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-[#8f8f8f]">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  {pkg.recommended ? (
                    <p className="inline-flex items-center gap-2 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#08090a]">
                      <span
                        className="size-1.5 animate-proposal-recommend rounded-full bg-[#08090a]"
                        aria-hidden="true"
                      />
                      Recommended
                    </p>
                  ) : null}
                </div>
                <h3 className="mt-5 max-w-[10em] text-[clamp(1.85rem,2.8vw,2.75rem)] font-medium leading-[1.02] tracking-[-0.045em]">
                  {pkg.name}
                </h3>
                {pkg.price ? (
                  discountPercent != null && pkg.sale ? (
                    <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="sr-only">
                        {pkg.price} crossed out. {pkg.sale} if signed within 24 hours.
                      </span>
                      <s
                        aria-hidden="true"
                        className="text-[1.15rem] font-medium leading-none tracking-[-0.03em] text-[#8f8f8f]"
                      >
                        {pkg.price}
                      </s>
                      <span
                        aria-hidden="true"
                        className={`text-[clamp(1.5rem,2.2vw,2rem)] font-medium leading-none tracking-[-0.04em] ${
                          pkg.recommended
                            ? 'text-[#08090a] [text-shadow:0_0_22px_rgba(240,138,58,0.16),0_0_44px_rgba(240,138,58,0.08)]'
                            : 'text-[#f08a3a]'
                        }`}
                      >
                        {pkg.sale}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-3 text-[clamp(1.5rem,2.2vw,2rem)] font-medium leading-none tracking-[-0.04em]">
                      {pkg.price}
                    </p>
                  )
                ) : null}
                {pkg.summary ? (
                  <p className="mt-3 max-w-[28em] text-[1.15rem] font-medium leading-snug text-[#5c5c5c] md:text-[1.25rem]">
                    {pkg.summary}
                  </p>
                ) : null}
                {pkg.items.length > 0 ? (
                  <ul className="mt-5 list-disc space-y-2 pl-5 marker:text-[#8f8f8f]">
                    {pkg.items.map((item, itemIndex) => (
                      <li
                        key={`${pkg.id}-${itemIndex}`}
                        className="text-[1.05rem] font-medium leading-snug"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <ScopeLink name={pkg.name} scope={pkg.scope} items={pkg.items} />
              </div>
            </article>
          </div>
        ))}

        {addOns.length > 0 ? (
          <div className="pt-4 md:col-span-12">
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
              {addOnHeading}
            </p>
            <div className="mt-4 grid grid-cols-2 items-stretch gap-3">
              {addOns.map((addOn) => (
                <article
                  key={addOn.id}
                  className="relative flex h-full flex-col overflow-hidden rounded-[20px] border border-white/70 bg-[rgba(228,228,228,0.62)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_40px_rgba(40,30,10,0.1)] backdrop-blur-[42px] md:px-5 md:py-5"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.4),transparent_42%)]"
                  />
                  <div className="relative flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="text-[1.15rem] font-medium leading-snug tracking-[-0.03em] md:text-[1.5rem]">
                        {addOn.name}
                      </p>
                      {addOn.line ? (
                        <p className="mt-1.5 text-[0.95rem] font-medium leading-snug text-[#5c5c5c] md:text-[1.05rem]">
                          {addOn.line}
                        </p>
                      ) : null}
                    </div>
                    {addOn.price ? (
                      <p className="shrink-0 text-[1.15rem] font-medium leading-none tracking-[-0.04em] md:pt-1 md:text-[1.35rem]">
                        {addOn.price}
                      </p>
                    ) : null}
                  </div>
                  <ScopeLink
                    name={addOn.name}
                    scope={addOn.scope}
                    items={addOn.line ? [addOn.line] : []}
                  />
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
