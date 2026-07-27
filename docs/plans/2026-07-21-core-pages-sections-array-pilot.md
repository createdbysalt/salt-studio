# Core Pages → Sections Array (MFI-style) — Capabilities Pilot

**Date:** 2026-07-21
**Status:** In progress (pilot)
**Goal:** Replace photon's "decoupled tabs + `sectionOrder` rows" pattern on core-page
singletons with MFI Canada's unified **sections array** page-builder pattern — one
reorderable list where each block carries its own content, an `enabled` toggle, and a
rich preview. Pilot on **Capabilities**, then roll out to studio / contact / rentals / home.

## Why now

- The core-page **frontends do not exist yet** — `capabilitiesPageQuery` (and the studio/
  contact/rentals queries) are defined in `queries.ts` but consumed nowhere; `/capabilities`
  has no route. So there is no renderer to rewrite and no live data to migrate.
- Photon is **not live** yet. Migration cost ≈ 0. This is the cheapest this refactor will
  ever be — model it right before content accumulates.

## Pattern comparison

|          | Current (photon)                                   | Target (MFI-style)                       |
| -------- | -------------------------------------------------- | ---------------------------------------- |
| Content  | flat fields in ~12 tabs                            | inside each section object               |
| Order    | separate `sectionOrder[]` of `{key, enabled}` rows | drag the actual blocks                   |
| Hero/CTA | locked in render                                   | sections in the array (full flexibility) |
| Doc tabs | 12                                                 | 2 (Sections + Search/SEO)                |

## Decisions (confirmed with user)

- **Rollout:** pilot one page (Capabilities) first, then the rest.
- **Hero + CTA:** live inside the array like MFI (reorderable), not locked.
- **Scope of pilot:** Studio-side end-to-end (schema + query + Studio + Presentation mapping).
  Public renderer is separate net-new work (no core-page renderer exists today).
- **Not porting** MFI's editable `pagePath` + middleware-rewrite machinery — photon core
  pages stay fixed-route singletons. Keep photon's existing `seoTitle`/`seoDescription`.

## Files

**New**

- `sanity/schemas/shared/sectionInternalName.ts` — `sectionInternalNameField()` +
  `prepareSectionPreview()` (ported/adapted from MFI).
- `sanity/schemas/shared/corePageFields.ts` — `pageSectionsField(ofTypes)` (reorderable
  array, unique-type validation), tab groups, `coreSearchFields()` (photon SEO fields).
- `sanity/schemas/sections/capabilitiesSections.ts` — 10 section object types:
  `capHeroSection, capWhyModularSection, capHowWeWorkSection, capWhereWeWorkSection,
capModuleTilesSection, capCreativeSection, capProductionSection, capPostSection,
capAgencyBrandsSection, ctaSection` (ctaSection is generic/reusable).

**Modified**

- `sanity/schemas/singletons/capabilitiesPage.ts` — rewrite to `pageSectionsField([...])`
  - `coreSearchFields()`; 2 tabs.
- `sanity/lib/queries.ts` — `capabilitiesPageQuery` projects `sections[]{ _type-conditional }`.
- `sanity.config.ts` — register the new section types.

**Untouched (this pilot)**

- `pageSection.ts` and studio/contact/rentals/home singletons — still use the old pattern
  until rollout. `capabilitiesSection` becomes orphaned (removed at rollout).

## Verify

- `npm run typegen` → `npm run type-check` → `npm run lint` all clean.
- In Studio: Capabilities shows one Sections list (drag to reorder, toggle to hide) + a
  Search tab. Presentation still maps `/capabilities`.

## Rollout (after pilot sign-off)

Repeat per page: studioPage, contactPage, rentalsHub, rentalPage, home. Then delete the
old `sectionOrder` machinery from `pageSection.ts` and the flat fields, and drop
`capabilitiesSection` et al. from config.
