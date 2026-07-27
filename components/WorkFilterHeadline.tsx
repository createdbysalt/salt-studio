import type {FilterPill} from '@/lib/work-pills'
import Link from 'next/link'

/**
 * The Work masthead — Glitch&Grit filter-as-headline on a light stage.
 * Full chrome width, flex-wrap centered so items sit on one line and wrap
 * as a sentence (not a stacked list). Displayed uppercase.
 */
export function WorkFilterHeadline({
  allLabel,
  categories,
  activeSlug = null,
}: {
  /** Label for the unfiltered index (workPage.headline). */
  allLabel: string
  categories: FilterPill[]
  activeSlug?: string | null
}) {
  const items = [
    {key: 'all', label: allLabel, href: '/work', slug: null as string | null},
    ...categories
      .filter((category) => Boolean(category.filterLabel && category.slug))
      .map((category) => ({
        key: category._id,
        label: category.filterLabel as string,
        href: `/work/${category.slug}`,
        slug: category.slug,
      })),
  ]

  return (
    <nav aria-label="Filter work by specialty" className="mx-auto w-full max-w-[90rem]">
      <ul
        role="list"
        className="flex flex-wrap justify-center gap-x-0 gap-y-[0.08em] text-center font-sans text-[clamp(1.5rem,2.75vw,2.5rem)] font-bold uppercase leading-[1.15] tracking-[-0.035em]"
      >
        {items.map((item, index) => {
          const active = item.slug === activeSlug
          const isLast = index === items.length - 1
          return (
            <li key={item.key} className="inline-flex items-baseline whitespace-nowrap">
              {active ? (
                <span aria-current="page" className="text-foreground">
                  {item.label}
                  {/* The one red on the page — a status dot marking where you are. */}
                  <span
                    aria-hidden
                    className="ml-[0.18em] inline-block h-[0.14em] w-[0.14em] -translate-y-[0.55em] rounded-full bg-accent"
                  />
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-foreground/30 transition-colors duration-300 hover:text-foreground/60 focus-visible:text-foreground/60"
                >
                  {item.label}
                </Link>
              )}
              {/* Comma glued to the word; a touch of air after before the next item. */}
              {isLast ? null : (
                <span
                  aria-hidden
                  className={`pr-[0.28em] ${active ? 'text-foreground' : 'text-foreground/30'}`}
                >
                  ,
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
