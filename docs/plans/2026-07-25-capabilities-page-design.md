# Capabilities Page — Deck → Web Design Plan

**Date:** 2026-07-25  
**Status:** Implemented (2026-07-25) — deck-informed renderer + optional Sanity media fields  
**Goal:** Make `/capabilities` feel like Photon’s pitch deck brought to life, while keeping **all copy/media driven from Sanity**.

---

## Diagnosis — why it feels bland

The page is already wired to Sanity (`capabilitiesPage` singleton → `capabilitiesPageQuery` → section switch in `app/(personal)/capabilities/page.tsx`). Content audit (production dataset):

| Section                                   | Sanity status                        |
| ----------------------------------------- | ------------------------------------ |
| Hero + founder anchor + secondary line    | ✅ populated (v3 copy)               |
| Why modular / How we work / Where we work | ✅ populated                         |
| Module tiles                              | ✅ **29 tiles**                      |
| Creative / Production / Post              | ✅ populated                         |
| Agencies & brands + pull quote            | ✅ populated                         |
| Closing CTA                               | ✅ section present (refs shared CTA) |

What’s missing is **deck language in the renderer**:

- Flat white column of text + hairline tag chips
- No imagery, no B/W equipment photography, no 3D particle forms
- No split panels, film-strip dividers, vertical type, or dark “chapter” inserts
- Module tiles are outline pills, not the deck’s technical / mission-control density

**Verdict:** Content model is ahead of design. This is a frontend + asset + light schema-enrichment job — not a copy rewrite.

---

## Deck design language (from `PITCH DECK FRAMES`)

Analyzed frames Photon 1–25 + Categories. Recurring system:

### Signature motifs

1. **Monochrome high contrast** — black / off-white / soft gray only. Color comes from client work elsewhere; Capabilities stays grayscale.
2. **Split panels** — 50/50 light|dark or image|void (e.g. WE ARE / Scalability / Motion|Stills).
3. **X-ray / radiographic objects** — spacesuit, mechanical hand, helmet — “under the hood” of production.
4. **Particle / sphere 3D forms** — torus, ribbon, helix, globe point-cloud (Few Hands, Creative Thread, Case Studies, orbiting globe).
5. **Equipment product photography** — cinema rigs, Phase One, OB7 robot arm, drone — cut out on light grounds.
6. **Film-strip spine** — Kodak Portra edge marks between diptychs (Locations, Capture).
7. **Chrome metadata** — small uppercase `PHOTON` / tagline / `T + 17` as section frame (use sparingly on web — not every block).
8. **Vertical stacked type** — Categories columns; `THE CREW`; location names.
9. **Inverted label boxes** — black rect, white caps (`THE PORTLAND STUDIO`, `LOCATIONS`, `CAPTURE`).
10. **Technical lists** — mono, hyphen bullets, spec-sheet density (studio features, service lists).

### Motion assets already on hand

`Downloads/Black on black/` and `Downloads/Black on white/` contain looping MP4s of the same 3D vocabulary (Torus, Metaball, Infinity, Spiral, Cloth, Cube, Wall, etc.). These are the fastest path to “alive” without shipping Three.js in v1.

### What the deck covers that the _website_ deliberately puts elsewhere

Per copy v3 + site IA:

| Deck chapter                     | Website home             |
| -------------------------------- | ------------------------ |
| The Crew                         | `/studio` (crew section) |
| Portland / Portugal studio specs | `/studio` + rentals      |
| Case studies                     | `/work` + project pages  |

**Do not** dump crew portraits or full studio spec sheets onto Capabilities. Borrow the _visual grammar_; keep the _approved Capabilities narrative_.

---

## Design direction (web translation)

### Mode

Keep **light editorial base** (`#F5F4F0` / white) per `design.json` — reading comfort for a long page — but insert **2–3 full-bleed dark chapters** that recreate deck tension (black void + light framed image / particle loop). Mode-shift is the brand feature; Capabilities shouldn’t stay one flat white sheet.

### Page job

A production-literate brand lead scans in **&lt; 2 minutes** and leaves knowing: modular model → what Photon can do (tiles) → creative / production / post → how they engage → contact.

### Signature element (one memorable thing)

**“Deck inserts”** — alternating light editorial blocks and dark cinematic panels that reuse Photon’s particle/equipment/x-ray assets, with Sanity-driven headlines overlaid. Everything else stays quiet and technical.

### Typography / tokens (match site, echo deck)

| Role             | Treatment                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------- |
| Section labels   | Pitch/mono, 10–11px, uppercase, tracking wide (`03 — CAPABILITIES`, `T+01`…)                  |
| Display subheads | Existing display scale, tight leading, often uppercase on dark inserts                        |
| Body             | Untitled/sans body on light; muted mono on dark                                               |
| Pull quotes      | Inverted bar or left rule — deck “MAKE LIGHT WORK” energy without recreating that exact slide |

Avoid: purple gradients, cream+terracotta, broadsheet hairline newspaper look, glow neon.

---

## Proposed page composition (maps 1:1 to Sanity sections)

Keep the current section order in Studio. Redesign each block’s presentation.

```
┌─────────────────────────────────────────────────────────────┐
│ LIGHT — Hero                                                │
│ Label 03 — CAPABILITIES                                     │
│ H1 (Sanity) + lead + founder + secondary                    │
│ Ambient: soft particle loop (black-on-white) or none        │
├─────────────────────────────────────────────────────────────┤
│ LIGHT — Why / How / Where as 3-column or stacked manifesto  │
│ (subhead + body from Sanity) — hairline grid, not cards     │
├─────────────────────────────────────────────────────────────┤
│ DARK INSERT — “Scale through reach”                         │
│ Uses hero.secondaryLine or agency pullQuote                 │
│ Framed x-ray or particle video (Sanity image/file)          │
├─────────────────────────────────────────────────────────────┤
│ LIGHT — Module tiles (technical grid, not pills)            │
│ Dense mono labels; optional in-house mark                   │
├─────────────────────────────────────────────────────────────┤
│ LIGHT/DARK — Creative → Production → Post                   │
│ Three stages: large stage title + intro + body              │
│ Optional paired equipment still per stage (Sanity image)    │
├─────────────────────────────────────────────────────────────┤
│ DARK or LIGHT — Agencies & brands + pull quote              │
│ Split: copy | particle/equipment visual                     │
├─────────────────────────────────────────────────────────────┤
│ LIGHT — CTA (shared callToAction ref)                       │
└─────────────────────────────────────────────────────────────┘
```

### Module tiles — specific upgrade

Today: flex-wrap bordered pills.  
Target (deck + copy v3): **square / near-square technical cells** in a rigid grid (4–6 cols desktop), uppercase mono, hairline separators, optional tiny `IN-HOUSE` tick when `inHouse === true`. Feels like a capability manifest, not marketing chips.

### Creative / Production / Post

Treat as a **process strip** matching the arrow in How we work. Options (pick one in approval):

- **A.** Horizontal sticky stage nav + stacked panels
- **B.** Three full-width bands with alternating image side (deck Motion|Stills energy)
- **C.** Numbered T+01 / T+02 / T+03 with shared ambient video behind text

Recommendation: **B** — strongest deck echo, still CMS-simple.

---

## Sanity content model — keep vs extend

### Keep as-is (already enough for copy)

- All existing section types + `moduleTile.label` / `inHouse`
- SEO fields, speakable summary, CTA reference

### Light enrichments (recommended so media isn’t hardcoded)

Add optional media fields so editors can swap deck assets without deploys:

| Section                                           | New optional fields                                               |
| ------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------- |
| `capHeroSection`                                  | `ambientMedia` (image or file/mux later) — particle loop or still |
| `capWhyModularSection` / How / Where              | none (text-only manifesto)                                        |
| New optional section **or** fields on agency/hero | `visualInsert` object: `{ tone: 'light'                           | 'dark', image, videoFile, caption, overlayLabel }` |
| `capCreativeSection` / Production / Post          | `sideImage` (+ alt) — equipment still                             |
| `capModuleTilesSection`                           | optional `subhead` already exists; maybe `layout: 'grid'          | 'compact'`                                         |
| `capAgencyBrandsSection`                          | `sideImage` or `ambientMedia`                                     |

**v1 minimum:** enrich Creative / Production / Post + one shared “visual insert” block used for the dark scale panel. Upload processed B/W stills + 1–2 loops to Media Library with tagging strategy.

### Explicitly out of scope for this page

- Full Motion / Lighting / Effects / Post tabbed equipment manifests from the PDF (can live later under Rentals/Gear or a future “Technical” accordion if Liam wants deck parity)
- Crew grid, studio floor plans, case-study chapter
- Live Three.js particle systems (use MP4 loops first; upgrade later if needed)
- Recreating every deck slide as a scroll section

---

## Asset plan

1. **Select 6–8 stills** from the deck language: 2 x-ray, 2 equipment product, 2 architecture/studio atmosphere (B/W).
2. **Select 2–3 loops** from Black on white / Black on black (e.g. Torus, Metaball, Infinity) — compress for web (WebM/MP4, muted, loop, `playsInline`).
3. Upload via Media Library per `brand-identity/asset-tagging-strategy.md` (`type-`, `use-capabilities`, `style-mono`, etc.).
4. Wire into Sanity fields above — **no remote hosts outside `cdn.sanity.io`** (or host loops as Sanity files / project `public/` only if file fields aren’t ready).

---

## Implementation steps (after approval)

| #   | Step                                                                        | Tool / skill                                                                |
| --- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | Confirm composition choices (A/B/C for stages; which loops/stills)          | User approval on this plan                                                  |
| 2   | Schema enrichments for optional media fields                                | Edit `capabilitiesSections.ts` + `moduleTile` if needed → `npm run typegen` |
| 3   | Extend `capabilitiesPageQuery` projections                                  | `sanity/lib/queries.ts`                                                     |
| 4   | Upload assets + attach in Studio                                            | Sanity MCP / Studio + tagging strategy                                      |
| 5   | Extract section renderers into `components/` (flat layout)                  | `components/CLAUDE.md` patterns; server-first; client only for video/hover  |
| 6   | Build visual system: light shell, dark inserts, module grid, stage bands    | `/frontend-design` + existing tokens in `globals.css` / design.json         |
| 7   | Motion: fade-in on scroll (subtle), video ambient, reduced-motion fallbacks | Client islands only where needed                                            |
| 8   | Verify Presentation overlays + live edits                                   | Studio Presentation → `/capabilities`                                       |
| 9   | `npm run type-check` + `npm run lint` + visual QA desktop/mobile            | qcheck                                                                      |

### Files likely touched

- `app/(personal)/capabilities/page.tsx` — thin route; map sections to components
- `components/Capabilities*.tsx` (new, flat) — Hero, Manifesto, DarkInsert, ModuleGrid, StageBand, Agency, CTA
- `sanity/schemas/sections/capabilitiesSections.ts`
- `sanity/lib/queries.ts`
- `app/globals.css` — only if new tokens needed for light/dark inserts
- Possibly `next.config.ts` — only if video remote patterns required (prefer Sanity files)

### Files not to touch

- Generated `sanity.types.ts` / `schema.json` by hand
- Copy v3 source of truth (already mirrored in Sanity)
- Studio/crew schemas (stay on `/studio`)

---

## Success criteria

- [ ] Every visible string on `/capabilities` comes from Sanity (no hardcoded marketing copy)
- [ ] Page reads as Photon deck DNA: mono, B/W, split tension, technical density — not a blog
- [ ] Module grid scannable in &lt; 10 seconds for an EP
- [ ] At least two intentional motions (ambient loop + scroll/hover); respects `prefers-reduced-motion`
- [ ] Mobile: stacks cleanly; no 12-column vertical category recreation that breaks
- [ ] `npm run type-check` clean

---

## Open decisions (need your call)

1. **Stage layout:** A sticky nav / B alternating image bands / C T+ numbered ambient? → recommend **B**.
2. **Dark inserts:** How many — 1 (scale), 2 (scale + agency), or 3?
3. **3D motion:** MP4 loops in v1 (recommended) vs invest in R3F/Three later?
4. **Categories slide (vertical CONCEPT / SHOT LIST / …):** decorative strip near How we work, or skip (content overlaps module tiles)?
5. **X-ray assets:** do we have rights / exportable masters beyond the PNG frames, or use the frame exports + Black-on-\* loops only?

---

## What we will not do

- Rebuild the entire 25-slide deck as a webpage
- Put Crew / full studio specs on this route
- Hand-edit generated Sanity types
- Invent new marketing copy that contradicts v3 / Studio content
