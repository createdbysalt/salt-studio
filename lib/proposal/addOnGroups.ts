export type LabeledGroup<T> = {
  label: string
  items: T[]
}

export type ChooseOneAddOn = {
  id: string
  group: string | null
}

export type AddOnChoiceBlock<T> =
  | {kind: 'checks'; items: T[]}
  | {kind: 'radios'; group: string; ids: Set<string>; items: T[]}

/**
 * Trimmed category text. Blank and whitespace-only values are no category.
 * The text is whatever was written on the add-on. Nothing here names a heading.
 */
export function categoryLabel(value: string | null | undefined) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Groups by category text, in the order each text first appears.
 * Items with no category come last, under `fallback`.
 * When nothing has a category, returns null so the caller keeps the
 * single ungrouped block.
 */
export function groupByCategory<T>(
  items: readonly T[],
  categoryOf: (item: T) => string | null | undefined,
  fallback: string,
): LabeledGroup<T>[] | null {
  const groups: LabeledGroup<T>[] = []
  const indexByLabel = new Map<string, number>()
  const uncategorized: T[] = []

  for (const item of items) {
    const label = categoryLabel(categoryOf(item))
    if (!label) {
      uncategorized.push(item)
      continue
    }
    const existing = indexByLabel.get(label)
    if (existing == null) {
      indexByLabel.set(label, groups.length)
      groups.push({label, items: [item]})
    } else {
      groups[existing].items.push(item)
    }
  }

  if (groups.length === 0) return null
  if (uncategorized.length > 0) groups.push({label: fallback, items: uncategorized})
  return groups
}

/** A group key used by only one add-on stays a checkbox. */
export function groupAddOnChoices<T extends ChooseOneAddOn>(
  addOns: readonly T[],
): AddOnChoiceBlock<T>[] {
  const counts = new Map<string, number>()
  for (const addOn of addOns) {
    if (!addOn.group) continue
    counts.set(addOn.group, (counts.get(addOn.group) ?? 0) + 1)
  }
  const seen = new Set<string>()
  const blocks: AddOnChoiceBlock<T>[] = []
  const checks: T[] = []
  const flush = () => {
    if (checks.length === 0) return
    blocks.push({kind: 'checks', items: [...checks]})
    checks.length = 0
  }
  for (const addOn of addOns) {
    const count = addOn.group ? (counts.get(addOn.group) ?? 0) : 0
    if (!addOn.group || count < 2) {
      checks.push(addOn)
      continue
    }
    flush()
    if (seen.has(addOn.group)) continue
    seen.add(addOn.group)
    const items = addOns.filter((item) => item.group === addOn.group)
    blocks.push({
      kind: 'radios',
      group: addOn.group,
      ids: new Set(items.map((item) => item.id)),
      items,
    })
  }
  flush()
  return blocks
}

/**
 * One section per category. With no categories, one section and a null label,
 * and the choose-one blocks are the same as grouping the full list.
 */
export function groupAddOnChoiceSections<T extends ChooseOneAddOn>(
  addOns: readonly T[],
  categoryOf: (item: T) => string | null | undefined,
  fallback: string,
): {label: string | null; blocks: AddOnChoiceBlock<T>[]}[] {
  const groups = groupByCategory(addOns, categoryOf, fallback)
  if (!groups) return [{label: null, blocks: groupAddOnChoices(addOns)}]
  return groups.map((group) => ({
    label: group.label,
    blocks: groupAddOnChoices(group.items),
  }))
}
