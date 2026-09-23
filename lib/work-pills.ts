// A single filter pill. Shape shared by the two pill sources on the workPage
// singleton: the auto "all categories" list and the manual `categoryPills`.
export type FilterPill = {
  _id: string
  filterLabel: string | null
  slug: string | null
}

/**
 * Resolve which category pills to show, honoring the workPage `pillSource`:
 * manual → the hand-ordered `categoryPills` (dangling refs dropped); anything
 * else → every category (already alphabetised by the query).
 */
export function resolveWorkPills(
  pillSource: string | null | undefined,
  manualPills: Array<FilterPill | null> | null | undefined,
  allCategories: FilterPill[],
  usedSlugs?: Set<string>,
): FilterPill[] {
  const source =
    pillSource === 'manual'
      ? (manualPills ?? []).filter((pill): pill is FilterPill => Boolean(pill))
      : allCategories
  if (!usedSlugs) return source
  return source.filter((pill) => pill.slug && usedSlugs.has(pill.slug))
}

export function usedWorkCategorySlugs(
  projects: Array<{
    hidden?: boolean | null
    categories?: Array<{slug?: string | null} | null> | null
  }>,
): Set<string> {
  const slugs = new Set<string>()
  for (const project of projects) {
    if (project.hidden) continue
    for (const category of project.categories ?? []) {
      if (category?.slug) slugs.add(category.slug)
    }
  }
  return slugs
}
