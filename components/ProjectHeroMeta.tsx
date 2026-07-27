import {stegaClean} from 'next-sanity'

const META_PREFIX = 'text-foreground/40 tracking-[0.08em]'
const META_VALUE =
  'font-mono text-[10px] font-bold uppercase leading-[1.55] tracking-[0.08em] text-foreground md:text-[11px]'
const META_CATEGORY =
  'font-mono text-[10px] uppercase leading-[1.55] tracking-[0.08em] text-foreground/40 md:text-[11px]'
const META_YEAR =
  'font-mono text-[12px] font-bold uppercase leading-none tracking-[0.08em] text-foreground md:text-[14px]'

export function formatProjectYearMark(year: string | null | undefined): string | null {
  if (!year) return null
  const clean = stegaClean(year).trim()
  if (!clean) return null
  const match = clean.match(/(\d{4})/)
  if (match) return `/${match[1].slice(-2)}`
  return clean.startsWith('/') ? clean : `/${clean}`
}

type ProjectHeroMetaProps = {
  clientName: string | null
  clientWebsite?: string | null
  yearMark: string | null
  categoryItems: string[]
  className?: string
}

export function ProjectHeroMeta({
  clientName,
  clientWebsite,
  yearMark,
  categoryItems,
  className = '',
}: ProjectHeroMetaProps) {
  if (!clientName && !yearMark && !categoryItems.length) return null

  return (
    <div aria-label="Project metadata" className={`py-0 ${className}`.trim()}>
      <div className="flex items-start justify-between gap-x-6">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-6 md:gap-x-10">
          <p className={`${META_VALUE} font-normal`}>
            <span className={META_PREFIX}>Client {'>> '}</span>
            {clientName ? (
              clientWebsite ? (
                <a
                  href={clientWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold transition-opacity hover:opacity-70"
                >
                  {clientName}
                </a>
              ) : (
                <span className="font-bold">{clientName}</span>
              )
            ) : (
              <span className="font-bold text-foreground/25">—</span>
            )}
          </p>

          {yearMark ? (
            <p className={META_YEAR}>{yearMark}</p>
          ) : (
            <p className={`${META_YEAR} text-foreground/25`}>—</p>
          )}
        </div>

        <div className="shrink-0 text-right">
          {categoryItems.length > 0 ? (
            <ul className="flex flex-col items-end gap-y-1 md:flex-row md:flex-wrap md:items-baseline md:gap-x-4 md:gap-y-0">
              {categoryItems.map((item) => (
                <li key={item} className={META_CATEGORY}>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className={`${META_VALUE} text-foreground/25`}>—</p>
          )}
        </div>
      </div>
    </div>
  )
}
