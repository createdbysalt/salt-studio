/**
 * Resolves Sanity sectionOrder[] into enabled section keys for rendering.
 * Mirrors playground/lib/sections/resolve.ts.
 */

export interface SectionOrderEntry {
  _key: string
  key: string
  enabled: boolean
}

interface SanitySectionOrderRow {
  _key: string
  key: string | null
  enabled: boolean | null
}

interface DefaultSectionEntry {
  key: string
  enabled: boolean
}

export function resolveSectionOrder(
  fromSanity: ReadonlyArray<SanitySectionOrderRow> | null | undefined,
  fallback: ReadonlyArray<DefaultSectionEntry>,
): SectionOrderEntry[] {
  if (fromSanity && fromSanity.length > 0) {
    return fromSanity
      .filter((row) => row.key !== null && row.enabled !== false)
      .map((row) => ({
        _key: row._key,
        key: row.key as string,
        enabled: row.enabled !== false,
      }))
  }
  return fallback.map((d) => ({_key: `default-${d.key}`, key: d.key, enabled: d.enabled}))
}
