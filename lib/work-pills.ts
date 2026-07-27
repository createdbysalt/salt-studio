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
): FilterPill[] {
  if (pillSource === 'manual') {
    return (manualPills ?? []).filter((pill): pill is FilterPill => Boolean(pill))
  }
  return allCategories
}
