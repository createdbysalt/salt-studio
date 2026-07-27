---
date: 2026-07-22
status: shipped
owner: Gabriella
feature: Scalable project content model (clients, equipment, services, unified projects)
source: docs/../Downloads/2026 PHOTON PROJECTS FOR WEB - STANDARD PROJECTS.csv (76 rows)
---

## Shipped 2026-07-22

Schemas built, registered, typegen + type-check + lint green. CSV imported to
`25ywlhce/production` via `scripts/import-projects-from-csv.mjs`:
**71 projects, 42 clients, 20 cameras, 15 lenses, 16 lights, 58 services, 10 work categories.**

Re-run the importer (idempotent): `npm run import:projects` (dry run) →
`COMMIT=1 npm run import:projects` (writes). Or `node --env-file=.env.local
scripts/import-projects-from-csv.mjs [--commit] [--file=…]`.

Known follow-ups: (a) ~69 RELATED tokens point to projects not in this CSV
(High Gear, Neste, Bare Republic, Sounders Bruce Lee…) — they link once the rest
of the catalog is imported; (b) "Phase" exists as both a camera and a lens (CSV
lists it in the CAMERA column once) — merge in Studio if desired.

### Rendering templates — shipped 2026-07-22

`components/ProjectDetail.tsx` renders `/projects/[slug]` in the dark mission-control
aesthetic (design.json): green eyebrow, bold uppercase title, serif narrative,
mono coordinate-style spec panel (client/year/categories/services/camera/lens/light),
green-accented "Flight log" (btsNote), and a "Related missions" grid. `projectType`
branches the layout — Case Study additionally renders the long-form `description`
portable-text body. `page.tsx` slimmed to fetch → 404-guard → `<ProjectDetail />`.
Verified live (200 + screenshot). Cover images/video not yet in the dataset, so
hero + related thumbnails show placeholders until uploaded in Studio.

# Photon — Scalable Project Content Model

## Goal

Translate the standard-projects CSV into a **relational, reference-based** content model in
Sanity so repeating values (clients, gear, services, categories) are typed once and reused
everywhere. Kill the free-text drift (`FUJI GFX 100 II` vs `FUJI GFX 100`, `PHANTOM FLEX 4K`
vs `PHANTOM FLEX`, `DJI IINSPIRE`) by moving these to controlled documents.

## Decisions (locked with Gabriella, 2026-07-22)

1. **Equipment → three separate document types**: `camera`, `lens`, `light`.
2. **Categories → reference the existing `workCategory` documents** (one source of truth,
   already power `/work` filters).
3. **Services (PHOTON HANDLED) → new `service` document type** (referenced, reorderable).
4. **Standard + Case Study → one `project` document** with a `projectType` selector.

## CSV column → content model mapping

| CSV column             | Destination                                                              |
| ---------------------- | ------------------------------------------------------------------------ |
| TITLE                  | `project.title` (exists)                                                 |
| YEAR (`/25`, `/21-22`) | **new** `project.year` (string, allows ranges)                           |
| CONTEXT (paragraph)    | **new** `project.context` (text — project-page intro)                    |
| PHOTON HANDLED         | **new** `project.services[]` → `service` refs                            |
| BTS NOTE               | **new** `project.btsNote` (text)                                         |
| CATEGORY TAGS          | `project.categories[]` → change to `workCategory` refs                   |
| CAMERA                 | **new** `project.cameras[]` → `camera` refs (replaces `camera` string)   |
| LENS                   | **new** `project.lenses[]` → `lens` refs (replaces `lens` string)        |
| LIGHT                  | **new** `project.lighting[]` → `light` refs (replaces `lighting` string) |
| RELATED                | **new** `project.relatedProjects[]` → `project` refs                     |

## New / changed schemas

### New document: `client` (`sanity/schemas/documents/client.ts`)

- `name` (string, required)
- `slug` (slug, source `name`, optional — future `/clients/[slug]`)
- `website` (url)
- `logo` (image, **optional/blank for now**, accepts svg/png/jpeg/webp, with `alt`)
- `featured` (boolean) + `sortOrder` (number) — drives the home "SELECTED CLIENTS" strip
- preview: name + logo

### New documents: `camera`, `lens`, `light` (`sanity/schemas/documents/equipment.ts`)

Built from one shared factory (`equipmentType(name, title, icon)`); each has:

- `name` (string, required) — e.g. "Red V-Raptor"
- `manufacturer` (string, optional) — Red, Fuji, Nikon…
- `slug` (optional)
- preview: name + manufacturer

### New document: `service` (`sanity/schemas/documents/service.ts`)

- `name` (string, required) — e.g. "Cinematography"
- `slug` (optional)
- `sortOrder` (number) — canonical display order
- `description` (text, optional) — can later feed the Capabilities page
- preview: name

### Changed document: `project` (`sanity/schemas/documents/project.ts`)

- **add** `projectType` (string, radio: `standard` | `case-study`, default `standard`, required) — top of Content group; picks the render template
- **change** `client`: string → `reference` to `client`
- **change** `categories`: string list → array of `reference` to `workCategory`
- **add** `year` (string), `context` (text), `btsNote` (text)
- **add** `services[]` (ref → service)
- **add** `cameras[]` / `lenses[]` / `lighting[]` (ref → camera/lens/light) — remove the three string fields
- **add** `relatedProjects[]` (ref → project)
- keep: `slug`, `overview` (short home/SEO summary ≤155), `coverImage`, `videoUrl`, `role`,
  `duration`, `site`, `tags`, `description`

## Studio desk (Dynamic Content) — new shape

```
Dynamic Content
├── Projects
├── Clients
├── Work Categories
├── Services
├── Equipment
│   ├── Cameras
│   ├── Lenses
│   └── Lights
├── Team
└── Legal Pages
```

## Registration checklist (per sanity/CLAUDE.md)

1. Add `client`, `camera`, `lens`, `light`, `service` to `schema.types` in `sanity.config.ts`.
2. Update `sanity/plugins/deskStructure.tsx` (Equipment sub-folder, new list items).
3. `resolve.ts` — only if clients get public URLs (not this pass).
4. `npm run typegen`.

## Queries (`sanity/lib/queries.ts`)

- `homePageQuery` → showcase: `"camera": array::join(cameras[]->name, ", ")` (+ lens, lighting)
  so **VideoHero stays untouched**; `"client": client->name` if used.
- `projectBySlugQuery` → deref new refs: `client->{name, website}`, `context`, `btsNote`,
  `year`, `projectType`, `categories[]->{filterLabel, "slug": slug.current}`,
  `services[]->name`, `cameras[]->name`, `lenses[]->name`, `lighting[]->name`,
  `relatedProjects[]->{title, "slug": slug.current, coverImage}`.
- **new** `allProjectsQuery` + `projectsByCategoryQuery` — for the Work grid / category pages.
- **new** `clientRosterQuery` — `*[_type=="client" && featured==true]|order(sortOrder asc)`.

## Frontend impact

- **VideoHero.tsx** — no change if GROQ joins gear refs to strings (lines 484–486).
- **projects/[slug]/page.tsx** — change `client` (string) → `client?.name` (line 68/112);
  new-field rendering (case-study vs standard template) is follow-up work, not blocking.
- **Home client marquee** — optional: source from `featured` client docs; keep
  `clientRosterLine` as fallback. Deferred unless requested.

## Data import — `scripts/import-projects-from-csv.mjs`

Idempotent (`createOrReplace`, deterministic slug IDs), uses `SANITY_API_WRITE_TOKEN`.

1. Parse CSV.
2. Build normalized vocab maps and create docs:
   - clients (from TITLE brand + RELATED names)
   - cameras / lenses / lights (with a normalization map: merge `MAVO EDGE 8K`→`Mavo Edge`,
     fix `DJI IINSPIRE`→`DJI Inspire`, etc.)
   - services (from PHOTON HANDLED, split on `/`, `//`, `|`)
   - workCategories (from CATEGORY TAGS; normalize `HIGH SPEED`==`HIGHSPEED`)
3. Create `project` docs with references.
4. **Second pass**: patch `relatedProjects` by matching RELATED titles → project IDs.

Notes: RELATED sometimes points to a client, not a project — unmatched names are logged and
skipped, not invented. Rows with no data (`IT BOYS`, `TUMBLE DOWN`, `MXPX`) are skipped.

## Open questions / follow-ups (not blocking schema work)

- Client vs agency: `client` = brand (Sorel/Nike). Add optional `agency` string later if wanted.
- Should the home marquee switch to `client` docs now, or stay on `clientRosterLine`?
- Case-study vs standard **templates** (rendering) — separate task after the model lands.

## Sequence

1. Write the 5 new schemas + `project` changes.
2. Register in `sanity.config.ts` + `deskStructure.tsx`; `npm run typegen`.
3. Update queries; adjust `projects/[slug]` client deref; verify `npm run type-check`.
4. Write + dry-run the CSV importer, review output, then run against the dataset (**gated —
   confirm before writing to live Sanity**).
