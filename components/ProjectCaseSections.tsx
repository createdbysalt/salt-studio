import {CustomPortableText} from '@/components/CustomPortableText'
import ImageBox from '@/components/ImageBox'
import {ProjectGalleryVideoCell} from '@/components/ProjectGalleryVideoCell'
import type {ProjectStatItem} from '@/components/ProjectStatsReveal'
import type {ProjectBySlugQueryResult} from '@/sanity.types'
import {stegaClean, type PortableTextBlock} from 'next-sanity'

type Project = NonNullable<ProjectBySlugQueryResult>
type CaseSection = NonNullable<Project['sections']>[number]
type MediaSection = Extract<CaseSection, {_type: 'projectMediaSection'}>
type MediaRow = NonNullable<MediaSection['rows']>[number]
type MediaItem = NonNullable<MediaRow['items']>[number]

// Mirrors the sidebar type scale in ProjectDetail (Idea / Insight / Result).
const SIDE_LABEL =
  'font-sans text-[13px] font-bold uppercase tracking-[-0.02em] text-foreground/40 md:text-[14px]'
const SIDE_BODY =
  'mt-2 max-w-lg font-sans text-[16px] font-semibold leading-[1.35] tracking-[-0.02em] text-foreground/90 md:text-[17px]'

type ScopeSection = Extract<CaseSection, {_type: 'projectScopeSection'}>
type StatsSection = Extract<CaseSection, {_type: 'projectStatsSection'}>

const isMedia = (s: CaseSection): s is MediaSection => s._type === 'projectMediaSection'
const isScope = (s: CaseSection): s is ScopeSection => s._type === 'projectScopeSection'
const isStats = (s: CaseSection): s is StatsSection => s._type === 'projectStatsSection'
// Scope → meta panel; media → gallery; stats → under the title. Sidebar gets the rest.
const isSidebarCopy = (s: CaseSection) => !isMedia(s) && !isScope(s) && !isStats(s)

/** True when there is any statement/quote/credits copy to show in the sidebar. */
export function hasCaseSidebar(sections: Project['sections']): boolean {
  return (sections ?? []).some((s) => s && s.enabled !== false && isSidebarCopy(s))
}

/** Measured result stats — rendered under the project title, not in the sidebar. */
export function getCaseStats(sections: Project['sections']): ProjectStatItem[] {
  return (sections ?? [])
    .filter((s): s is StatsSection => Boolean(s) && s.enabled !== false && isStats(s))
    .flatMap((s) => s.items ?? [])
    .filter((it) => Boolean(it?.value))
    .map((it) => ({_key: it._key, value: it.value ?? null, label: it.label ?? null}))
}

/** The first enabled Scope section, for rendering as meta rows under "Built with". */
export function getCaseScope(sections: Project['sections']): {
  label: string
  items: NonNullable<ScopeSection['items']>
} | null {
  const scope = (sections ?? []).find(
    (s): s is ScopeSection => Boolean(s) && s.enabled !== false && isScope(s),
  )
  const items = (scope?.items ?? []).filter((it) => it?.title)
  if (!scope || items.length === 0) return null
  return {label: scope.label || 'What we delivered', items}
}

/** True when there are any media rows to show in the gallery column. */
export function hasCaseMedia(sections: Project['sections']): boolean {
  return (sections ?? []).some(
    (s) => s && s.enabled !== false && isMedia(s) && (s.rows ?? []).length > 0,
  )
}

/**
 * The case-study copy, rendered in the sticky sidebar in the same label + body
 * rhythm as the legacy Idea / Insight / Result blocks. Statements, Quote and
 * Credits stack top to bottom; Stats sit under the title; Media is on the right.
 */
export function ProjectCaseSidebar({sections}: {sections: Project['sections']}) {
  const enabled = (sections ?? []).filter(
    (s): s is CaseSection => Boolean(s) && s.enabled !== false,
  )
  const stack = enabled.filter(
    (s) =>
      s._type === 'projectStatementSection' ||
      s._type === 'projectQuoteSection' ||
      s._type === 'projectCreditsSection',
  )
  if (stack.length === 0) return null

  return (
    <div className="space-y-6 md:space-y-8 lg:space-y-10">
      {stack.map((section) => {
        switch (section._type) {
          case 'projectStatementSection': {
            const body = (section.body ?? []) as PortableTextBlock[]
            if (body.length === 0) return null
            return (
              <div key={section._key}>
                {section.label ? <p className={SIDE_LABEL}>{section.label}</p> : null}
                <CustomPortableText
                  id={null}
                  type={null}
                  path={[]}
                  paragraphClasses={SIDE_BODY}
                  value={body}
                />
              </div>
            )
          }

          case 'projectQuoteSection': {
            const quote = section.quote ? stegaClean(section.quote).trim() : ''
            if (!quote) return null
            const who = [section.attribution, section.attributionRole]
              .map((p) => (p ? stegaClean(p).trim() : ''))
              .filter(Boolean)
            return (
              <figure key={section._key}>
                <blockquote className="font-sans text-[20px] font-semibold leading-[1.3] tracking-[-0.02em] text-foreground md:text-[22px]">
                  “{quote}”
                </blockquote>
                {who.length ? (
                  <figcaption className={`${SIDE_LABEL} mt-3`}>{who.join(', ')}</figcaption>
                ) : null}
              </figure>
            )
          }

          case 'projectCreditsSection': {
            const items = (section.items ?? []).filter((it) => it?.role || it?.name)
            if (items.length === 0) return null
            return (
              <div key={section._key}>
                <p className={SIDE_LABEL}>Credits</p>
                <dl className="mt-2.5 space-y-2">
                  {items.map((it) => (
                    <div key={it._key} className="flex items-baseline justify-between gap-4">
                      <dt className="font-sans text-[14px] text-foreground/45 md:text-[15px]">
                        {it.role}
                      </dt>
                      <dd className="text-right font-sans text-[15px] font-semibold tracking-[-0.02em] text-foreground/90 md:text-[16px]">
                        {it.name}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )
          }

          default:
            return null
        }
      })}
    </div>
  )
}

/** A single photo or video cell inside a Media row. */
function MediaCell({item, title}: {item: MediaItem; title: string}) {
  if (item._type === 'projectGalleryPhoto') {
    if (!item.image?.asset) return null
    return (
      <ImageBox
        image={item.image}
        alt={item.image.alt ?? `${title} case study image`}
        classesWrapper="relative aspect-[16/9] overflow-hidden bg-muted"
      />
    )
  }

  const url = item.videoUrl ? stegaClean(item.videoUrl).trim() : ''
  const fileUrl = item.videoFileUrl ? stegaClean(item.videoFileUrl).trim() : ''
  if (!url && !fileUrl) return null
  return (
    <ProjectGalleryVideoCell
      videoUrl={item.videoUrl}
      videoFileUrl={item.videoFileUrl}
      poster={item.poster}
      title={title}
      aspectClass="aspect-[16/9]"
    />
  )
}

/** Media rows from case-study Media sections, rendered in the gallery column. */
export function ProjectCaseMedia({
  sections,
  title,
}: {
  sections: Project['sections']
  title: string
}) {
  const rows = (sections ?? [])
    .filter((s): s is MediaSection => Boolean(s) && s.enabled !== false && isMedia(s))
    .flatMap((s) => s.rows ?? [])
    .filter((row) => (row?.items ?? []).length > 0)
  if (rows.length === 0) return null

  return (
    <div className="mt-4 space-y-4 md:mt-6 md:space-y-6">
      {rows.map((row) => (
        <div
          key={row._key}
          className={`grid gap-4 md:gap-6 ${
            row._type === 'projectGalleryRowTwo' ? 'md:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {(row.items ?? []).map((item) => (
            <MediaCell key={item._key} item={item} title={title} />
          ))}
        </div>
      ))}
    </div>
  )
}
