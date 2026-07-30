import {filterProjectsWithVideo, type WorkProjectCard} from '@/components/ProjectGrid'
import {stegaClean} from 'next-sanity'

/**
 * Editorial year when set; otherwise the year the doc was created in Sanity.
 * Keeps undated cards from sinking below older dated ones.
 */
function effectiveYear(project: WorkProjectCard): number {
  const year = Number.parseInt(stegaClean(project.year) || '', 10)
  if (Number.isFinite(year)) return year
  if (project._createdAt) {
    const fromCreated = new Date(project._createdAt).getUTCFullYear()
    if (Number.isFinite(fromCreated)) return fromCreated
  }
  return -1
}

/** Newest project date first: year, then `_createdAt`, then title. */
export function compareByProjectDate(a: WorkProjectCard, b: WorkProjectCard): number {
  const yearDelta = effectiveYear(b) - effectiveYear(a)
  if (yearDelta !== 0) return yearDelta

  const createdA = a._createdAt ? Date.parse(a._createdAt) : 0
  const createdB = b._createdAt ? Date.parse(b._createdAt) : 0
  if (createdB !== createdA) return createdB - createdA

  return (stegaClean(a.title) ?? '').localeCompare(stegaClean(b.title) ?? '')
}

/** Featured first; within each group, newest project date first. */
export function compareFeaturedThenRecent(a: WorkProjectCard, b: WorkProjectCard): number {
  const featuredDelta = Number(Boolean(b.featured)) - Number(Boolean(a.featured))
  if (featuredDelta !== 0) return featuredDelta
  return compareByProjectDate(a, b)
}

/**
 * Resolve the grid order from the workPage `projectSource` control. "manual"
 * uses the hand-picked list; auto modes reorder the full catalog.
 * Default / unset → featured first, then most recent by project date.
 */
export function resolveWorkProjects(
  projectSource: string | null | undefined,
  curated: Array<WorkProjectCard | null> | null | undefined,
  all: WorkProjectCard[],
): WorkProjectCard[] {
  const source = stegaClean(projectSource) || 'featured'

  const visibleCurated = (curated ?? []).filter(
    (project): project is WorkProjectCard =>
      Boolean(project?._id) &&
      project?.hidden !== true &&
      (Boolean(project?.coverImage?.asset) || Boolean(project?.videoUrl)),
  )

  switch (source) {
    case 'manual':
      return filterProjectsWithVideo(visibleCurated)
    case 'newest':
      return filterProjectsWithVideo([...all].sort(compareByProjectDate))
    case 'az':
      return filterProjectsWithVideo(
        [...all].sort((a, b) =>
          (stegaClean(a.title) ?? '').localeCompare(stegaClean(b.title) ?? ''),
        ),
      )
    case 'featured':
    default:
      return filterProjectsWithVideo([...all].sort(compareFeaturedThenRecent))
  }
}
