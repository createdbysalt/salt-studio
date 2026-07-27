# Photon — Website copy, v3

**Prepared by:** SALT Studio
**For:** Liam, Photon
**Status:** v3 — round 2 feedback applied, ready for launch copy lock
**Language:** English
**Date:** 2026-05-17

**Archive:** v2 (`docs/2026-04-10-photon-website-copy-v2.md`) is frozen at post–R1 / pre–R2. All R2 edits live in this file only.

---

## 00 — How to read this draft

This is a first draft of every word that will live on the new Photon site — from navigation labels to 404 microcopy. It's grounded in the voice we agreed on in the copy proposal you approved on 2026-04-10: peer not vendor, direct, technical without explaining, playful when it counts.

**What's in here**

- Every headline, subhead, paragraph, button, form label, and system message on every Phase 1 page.
- Suggested SEO page titles and meta descriptions for each page.
- Templates (with worked examples) for project pages and case studies. The per-project copy is yours to write — the structure and example set the pattern.

**What's flagged with [brackets]**

- `[TBC: Liam]` — a spec or fact we need you to confirm before this line ships.
- `[PLACEHOLDER: …]` — content you'll provide later (project descriptions, testimonials, team bios).
- `[SEO]` — metadata layer; doesn't appear on the page itself.

**How to review**

- You collect team feedback and send one consolidated round per section.
- Mark anything that sounds wrong, off-brand, or factually incorrect — we'd rather rewrite now than after launch.
- If a line is fine, say nothing. Silence is approval.
- Round 1 focused on voice, facts, and structure. Round 2 (May 2026) locked remaining copy decisions — see §12 for what's still open before launch.

**Voice reminder.** If anything in this draft drifts from the voice in the copy proposal — corporate, salesy, performative, or "cutting-edge" — flag it. We'd rather cut a good line than keep a wrong one.

**Note on layout.** This is the words layer, not the design layer. Once we lock the visual direction and start laying pages out, some lines will need minor tweaks — a headline that's a hair too long for a card, a paragraph that breaks weirdly next to an image, a label that needs to shrink or stretch to fit its module. None of that changes the meaning; it just means final copy is a conversation with the final design. Keep that in mind as you review — we're approving intent and voice here, not pixel-perfect line breaks.

**Note on brackets.** Anything in this draft wrapped in brackets — `[TBC: …]`, `[PLACEHOLDER: …]`, `[Why …]`, `[Email housekeeping: …]` — is editorial commentary for you, not live copy. All brackets get stripped before launch. If a `[Why …]` note makes an argument for a specific move, that argument is meant to help you decide whether to keep, cut, or reword the line above it — not to ship on the public site.

### What changed in v3 (round 2)

V3 applies Liam's round-2 feedback (received 2026-05-17) on top of v2 (round 1, 2026-04-16). Headline moves:

- **Homepage relationship line locked** — Option C (see §02).
- **Studio size unified** — 6,000 sq ft everywhere (homepage SEO, Work category pages, Studio, Rentals).
- **Work category meta filled** — High-speed, Music, Fashion, Art Dept (R2 verbatim).
- **All filter pills at launch** — Liam confirmed enough projects per category; no launch gating.
- **Rentals IA** — three pages (`/rentals/studio`, `/rentals/podcast`, `/rentals/gear`) with one **Rentals** nav item and hover dropdown (clean nav + SEO depth). See §08.
- **Rentals booking copy** — studio by the day (overtime after 10 hours); podcast by the hour (two-hour minimum).
- **Email** — Liam setting up `hello@` Google forwarding to Chris + Liam; form routes to both.
- **Legal** — existing terms pasted in §13 for Terms page at build (not footer copy).

### What changed in v2 (round 1 — archive summary)

V2 applied Liam's round-1 feedback (received 2026-04-16). Headline moves:

- **Email contradiction resolved.** `hello@photon.studio` on the footer (team alias). `chris@photon.studio` on the Contact page (direct, named-person trust signal). `liam@photon.studio` stays internal — server-side form routing handles creative inquiries. See "Email setup recommendation" below.
- **Archives section dropped.** Removed from nav and from the doc.
- **Structural move on Capabilities.** "Why modular," "How we work," "Where we work," and the founder anchor migrate from About to Capabilities. About narrows to a focused Studio + Crew page.
- **Work taxonomy expanded.** 11 filter pills (was 8). New categories: Lifestyle, Music, Fashion, Art Dept. Motion Control category dropped (not in-house — survives only as "available on request" in Rentals).
- **Rentals (v2 draft).** One `/rentals` page with three anchored sections — **superseded in v3** by three URLs + nav dropdown. See §08.
- **Three sections deleted from Capabilities:** "We're known for" (replaced with module-square design placeholder), "How we engage," "What we don't do."
- **Two pages re-titled:** About → "The studio." Persistent homepage tagline removed entirely.

### Editorial notes for Photon team (implementation, not copy)

These describe what to set up before launch — they're not website copy and won't appear on the public site. They're here so Photon's team has the context.

#### Email setup recommendation

The cleanest way to handle Liam's email setup (hello@ on footer, chris@ on contact, liam@ for creative routing, plus any legacy pre-rebrand inbox) is:

1. **Footer publishes one address only:** `hello@photon.studio` (the team alias). All public traffic flows here. UX rule — a footer with two emails dilutes the contact CTA, so we keep it to one.
2. **Contact page surfaces one direct address:** `chris@photon.studio` for the trust-signal escape hatch above the contact form.
3. **`liam@photon.studio` stays internal.** Creative-question routing happens server-side from the contact form: when a submission's project type is `Brand campaign`, `Case study / film`, or `Something else`, the form CCs `liam@`. Users see one form; the right person reads it.
4. **Legacy email forwarding (DNS-level).** If Photon has a pre-rebrand inbox they want to keep working, set up forwarding so anything sent to the old address routes into the same `hello@photon.studio` inbox. The public site only shows the new address; nothing is lost.

This avoids putting four emails on the site (which dilutes the CTA) while still routing every kind of inquiry to the right person. **R2:** Liam will configure `hello@` Google forwarding to both Chris and Liam; contact form submissions should reach both as well.

`[R2 closed — no further sign-off needed on email strategy.]`

---

## 01 — System copy

Small, global, sets the tone on every page.

### Primary navigation (top, persistent)

- Work
- Capabilities
- Studio
- Rentals _(hover/focus dropdown: Studio · Podcast · Gear — links to `/rentals/studio`, `/rentals/podcast`, `/rentals/gear`)_
- Contact

`[Changed in v3: Rentals is one nav label with a dropdown to three rental pages — Liam's R2 preference (clean top nav + separate URLs for SEO). Parent "Rentals" click can route to `/rentals`hub or default to`/rentals/studio` — dev decision at build.]`

`[Why Rentals stays in the top nav: studio, podcast, and gear rentals are SEO-priority landing targets for agency producers and local creatives. Five primary labels — clean.]`

`[About → "Studio." The label in nav and the section header throughout the site now reads "Studio" rather than "About," reflecting the page's narrowed focus on the physical studio + crew. Strategic content (Why modular, How we work, Where we work) migrated to Capabilities in v2.]`

**Menu button on mobile / tablet:** `[ / ] MENU`

**Brand lockup:** `PHOTON / .STUDIO` (dot-matrix lockup, already in place in the prototype).

### Persistent bottom bar (homepage)

- CTA (right): `Start a conversation →`

`[Tagline removed in v2 per Liam: "feels too symmetrical and too much text for the landing." Bottom bar now has the right-side CTA only — left side stays clean. The "Modular production for the future of content." line lives in the SEO meta description and as part of the brand story, not as on-page copy.]`

### CTA library — where each one lives

| CTA                       | Where it appears                                       | Intent                                                               |
| ------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- |
| `Start a conversation →`  | Homepage, Studio, Capabilities, Rentals, Project pages | The main site CTA. Always routes to `/contact`.                      |
| `Extrapolate →`           | Homepage project info block, Work grid cards           | Opens the full project page. Replaces "Read more" per your feedback. |
| `Launch →`                | Contact form submit button                             | Space-theme framing for the send action.                             |
| `Mission briefing`        | Contact page headline                                  | Space-theme framing for the form itself.                             |
| `Signal acquired`         | Contact form success state                             | Confirmation after a successful submission.                          |
| `Signal lost`             | 404 page + contact form error state                    | The theme moment — doubles as honest error copy.                     |
| `Rent the studio →`       | Capabilities, Work / Studio category, cross-links      | Routes to `/rentals/studio`. Replaces v2 anchor-only pattern.        |
| `Rent the podcast room →` | Cross-links where podcast rental is relevant           | Routes to `/rentals/podcast`.                                        |
| `Browse the gear list →`  | Capabilities, cross-links                              | Routes to `/rentals/gear`.                                           |
| `Check availability →`    | All three rental page CTAs                             | Routes to `/contact` with the rental subject prefilled.              |
| `See the full case →`     | Work grid cards (case studies only)                    | Routes to the case study version of the project page.                |

### Footer (minimal — low friction to conversation)

Left column:

```
Photon Studio
726 SE 10th Ave, Portland, OR 97214
Lisbon, Portugal
hello@photon.studio
```

`[Why we kept the Portland street address: local SEO. Google's "Portland production studio" / "Portland video production" rankings lean heavily on NAP (Name, Address, Phone) consistency, and the LocalBusiness JSON-LD schema in lib/seo/structured-data.tsx requires a real streetAddress to validate. Dropping it for "Portland, OR" alone would cost local rank. The Lisbon line gives us the broader two-location signal Liam asked for without sacrificing local SEO.]`

Right column:

```
Instagram   →   @photonportland
Vimeo       →   vimeo.com/photonportland
```

`[Facebook removed in v2 per Liam. LinkedIn skipped — no Photon LinkedIn URL exists.]`

**Note:** Per the strategy doc, we're intentionally not publishing a phone number — the contact form is the single path in. Flag if you want that to change.

Bottom strip:

```
© Photon Studio 2026 · Built with SALT Studio · Privacy · Terms · Cookies · Accessibility
```

`[Why four legal links instead of one: enterprise buyers at Nike/Capital One run vendor-compliance checks before onboarding. A footer with only "Privacy" is a minor trust ding on those checks. Placeholders are fine for round 1 — the actual policy content can be filled in before launch.]`

---

## 02 — Homepage

The homepage is mostly visual. Five projects rotate full-screen; copy lives in three spots.

`[Changed in v2: per Liam's R1 note, the persistent bottom-right "Modular production for the future of content." tagline is removed from the homepage. Reason given — "feels too symmetrical and too much text for the landing." The phrase still lives in the system copy (open graph, share cards) and in the /capabilities H1, so we don't lose the positioning weight, just the visual repetition.]`

### Philosophy line (delayed reveal, or inline with the project info block)

> `Think of us as mission control for your visual content.`

`[Changed in v2: dropped "A modular production studio." prefix per Liam — "modular too repetitive" given it already appears in nav/capabilities/system copy.]`

### Client roster strip (persistent or delayed reveal — mono, quiet, full-width)

A typewriter-style line of client names, set small in mono. No logos (permissioning headache, and it reads more performatively than Photon's voice). Just a proud list that does two jobs: confirms tier for the VP who's never heard of Photon before, and earns the rest of the page the right to be minimal.

> `SELECTED CLIENTS — Nike · Adidas · Google Pixel · Capital One · Starbucks · Teavana · Triumph · Amazfit · Flexfit · Sorel · Oura · Hyperice · Jordan · Vans · Under Armour · Seattle Sounders · Portland Thorns · Portland Timbers · JBL · Taylor Farms · Wildfang · GQ`

`[Changed in v2: added Starbucks, Teavana, Triumph, Amazfit, Flexfit per Liam's R1 add-list. Removed BMW per Liam — "spec project, not a real client engagement." The five additions are placed in the second tier of the strip (after the top-five anchors Nike/Adidas/Google Pixel/Capital One/[next]) so the anchor brands still hit first.]`

**Relationship proof line (small mono, set directly below the client strip):**

> `We measure clients in projects and years, not deliverables. The longest is five years in.`

`[Changed in v3: Liam picked Option C in R2 (replacing the garbled v1 line and the A/B/C options from v2).]`

`[Why this line is on the homepage: our peer-studio research found that zero competitors surface client retention this way — everyone lists logos or project titles, nobody says "how long." This is Photon's single strongest trust signal for the first-time VP visitor from a Nike/Sorel/Oura-tier brand. Surfacing a compressed version here earns the rest of the homepage's minimalism — the VP doesn't have to click through to Studio to find the reassurance that makes the minimalism feel confident rather than thin.]`

**Placement options (designer to pick):**

- Persistent strip just above the bottom CTA bar (small, mono, always visible)
- Delayed reveal after 3 seconds of the video hero (fades in, stays)
- Full-bleed line directly under the hero, before the first grid section scroll

**Note:** This strip replaces what a more traditional site would do with a logo grid. It leans on Photon's "the work talks" voice — specific, blunt, confident, no adjectives. If a brand wants a logo grid later, this line doubles as the source list.

### Active project info block (per-project, pulled from CMS)

**Format for each CMS entry:**

- **Title** — project name, uppercase
- **Description** — 2–4 sentences in Photon voice (who brought you in / what was interesting / what you did)
- **Tech** — Camera, Lens, Light rows (pulled from CMS fields)
- **Year** — from duration field, styled as `/26`
- **CTA** — `Extrapolate →`

**Example using one of the tentative featured projects — Combat Cookies:**

```
COMBAT COOKIES
A cookie brand walked in wanting a combat-sport spot.
Full set build, choreography with real fighters, and
a lot of flying dough. We kept the dough.

CAMERA    RED Komodo X
LENS      Cooke Panchro
LIGHT     Astera Titan Tube         /26

EXTRAPOLATE →
```

`[PLACEHOLDER: Liam / team to write the real per-project copy. The above is a voice example, not final.]`

### [SEO] Homepage metadata

- **Title:** `Photon — Modular Production Studio, Portland / Portugal`
- **Meta description:** `A production studio for brands and agencies. Commercial video, stills, high-speed, based in Portland with a 6,000 sq ft studio with cyclorama and international reach.`
- **H1 (visually hidden for SEO):** `Photon Studio — Photography and Video Production in Portland and Portugal`

`[Changed in v2: title now signals two-location reach (Portland / Portugal). Meta description drops "motion control" per Liam — "we do not have that service in house, so it shouldn't be touted quite so heavily" — and adds "international reach" to surface the Portugal hub. H1 broadened from "Commercial Video Production" to "Photography and Video Production" since stills are equal weight to motion in Photon's catalog.]`

---

## 03 — Work (index)

Full-bleed grid with a single horizontal row of filter pills above it. Filters are **URL routes**, not JavaScript toggles — each category is its own page with its own metadata, H1, and intro line. See dependency #14 for the reasoning (we're reversing the original "no filters" preference for ICP + SEO reasons).

### Page header (the unfiltered `/work` view)

**Label:** `01 — Selected work`

**H1:** `All Projects`

**Subhead:** `Filter by specialty — or scroll the whole thing.`

`[Changed in v2: H1 and subhead replaced with Liam's R1 versions ("All Projects" / "Filter by specialty — or scroll the whole thing"). Tighter, less editorial — matches Photon voice better.]`

### Filter bar (above the grid, persistent on all `/work/*` routes)

A single row of mono-text pills. Active pill is filled; inactive pills are outlined. On mobile, the row scrolls horizontally. Each pill is a real link (`<a href>`), not a JS onClick.

**Label above pills:** `Filter —`

**Full taxonomy (10 categories — all ship as pills at launch per R2):**

```
ALL  /  SPORTSWEAR  /  LIFESTYLE  /  TECH  /  FOOTWEAR  /  FOOD  /  HIGH-SPEED  /  MUSIC  /  FASHION  /  STUDIO  /  ART DEPT
```

> Routing: `ALL` → `/work`. Every other pill → `/work/[slug]` (e.g. `/work/sportswear`, `/work/high-speed`, `/work/art-dept`).

`[Changed in v3: Liam confirmed in R2 that all categories will have enough projects to support a pill at launch — the v2 "≥4 projects" gating rule is retired.]`

`[Changed in v2: full taxonomy expanded from 7 → 10 per Liam's R1. Motion Control category removed (not in-house).]`

### Empty state (only appears if the grid is empty during dev)

> `Nothing here yet. [Start a conversation →](/contact)`

### Per-card copy (pulled from CMS)

Each card shows: project title, client, year, category tag. No descriptions on the grid itself — the work carries the load.

**Example card:**

```
COMBAT COOKIES
Combat Cookies × Photon · /26
Campaign · Motion · Set build
```

### [SEO] Work index metadata (the unfiltered `/work` page)

- **Title:** `Work — Photon Studio Portland / Portugal`
- **Meta description:** `Selected commercial video and photography work from Photon — a production studio working with brands and agencies across sportswear, lifestyle, tech, footwear, food, and more.`

`[Changed in v2: meta dropped "motion control" reference and broadened to two-location framing (Portland / Portugal) to match the homepage SEO change.]`

---

### Category landing pages (`/work/[category]`)

Each category route reuses the same grid + filter bar shell but gets its own H1, intro line, and metadata. This is what makes the filters work for SEO and AEO — every specialty is a real indexable URL with its own copy for Google and LLM crawlers to cite.

Copy for each category below. Pattern: **Label → H1 → Subhead → Meta title → Meta description.** Grid below is filtered to projects tagged with that category.

`[Changed in v2: all 10 categories below use Liam's R1 H1s and subheads where provided. R2 filled High-speed, Music, Fashion, and Art Dept meta. Footwear and Studio meta still use v1 drafts — see §12.]`

#### `/work/sportswear`

**Label:** `01.1 — Sportswear`
**H1:** `Sportswear`
**Subhead:** `Teams, brands, and big swings.`
**Meta title:** `Sportswear commercial production — Photon Studio`
**Meta description:** `Commercial video and photography for sportswear brands and teams. Kit films, athlete stories, and campaign work for Nike, Adidas, the Sounders, and more — produced in Portland with international reach.`

`[TBC: Liam — meta title/description not provided in R1; kept v1's draft adapted to the new "Sportswear" name. Confirm or replace in round 2.]`

#### `/work/lifestyle`

**Label:** `01.2 — Lifestyle`
**H1:** `Lifestyle`
**Subhead:** `Life's moments, lit and with a soundtrack.`
**Meta title:** `Lifestyle Photography Production | Built for Brands`
**Meta description:** `Authentic lifestyle photography and video campaigns in real-life moments, designed to inspire everyday style and improve how we move through the world.`

`[Changed in v2: NEW category per Liam's R1. All copy verbatim from feedback doc.]`

#### `/work/tech`

**Label:** `01.3 — Tech`
**H1:** `Tech`
**Subhead:** `Apps, wearables and phones, oh my!`
**Meta title:** `We Speak Fluent Gadget`
**Meta description:** `From app UI captures to wearable campaigns and phone launch content — production that keeps pace with the tech industry's relentless speed.`

`[Changed in v2: H1, subhead, meta title, and meta description all replaced with Liam's R1 versions. Renamed from "Tech & Wearables" to "Tech."]`

#### `/work/footwear`

**Label:** `01.4 — Footwear`
**H1:** `Footwear`
**Subhead:** `We help you put your best foot forward.`
**Meta title:** `Footwear commercial production — Photon Studio`
**Meta description:** `Footwear campaign production in Portland with international reach. Director-led work for Sorel, Vans, and other performance and lifestyle brands — creative, production, and post under one roof.`

`[Changed in v2: H1 and subhead replaced with Liam's R1 versions (subhead now plays on the "best foot forward" pun — peer voice with a wink). Meta title/description left blank in R1; v1 draft kept and flagged.]`

`[TBC: Liam — meta title/description not provided in R1. Confirm v1 draft above or replace in round 2.]`

#### `/work/food`

**Label:** `01.5 — Food`
**H1:** `Food and beverage`
**Subhead:** `Pour, steam, sizzle, cut.`
**Meta title:** `Food & beverage commercial production — Photon Studio`
**Meta description:** `Food and beverage commercial production in Portland. Tabletop and high-speed work for brands like Taylor Farms, La Marzocco, and Tea Bar — shot and finished by the same team.`

`[Changed in v2: filter pill label is "Food" per Liam's R1; full H1 keeps "Food and beverage" per his explicit category H1. Meta description dropped the "motion control" mention to match the global cut.]`

#### `/work/high-speed`

**Label:** `01.6 — High-speed`
**H1:** `High-speed`
**Subhead:** `1,000+ frames per second, in-house.`
**Meta title:** `High-speed cinematography Portland — Photon Studio`
**Meta description:** `High-speed cinematography in Portland. Freefly Ember 5K and Pixboom Spark in-house on a 6,000 sq ft stage. Tabletop, product, fluid, and athletic work at 1,000+ FPS — shot and finished by the same team.`

`[Changed in v3: meta description replaced per Liam's R2 — Freefly Ember 5K + Pixboom Spark (replaces Phantom/VEO draft); 6,000 sq ft stage.]`

#### `/work/music`

**Label:** `01.7 — Music`
**H1:** `Music`
**Subhead:** `Looking sharp`
**Meta title:** `Rhythmically driven, music videos, rock bands and vocalists`
**Meta description:** `A collection of cinematic music and band videos utilizing various camera techniques, editing, graphics, and performances.`

`[Changed in v3: subhead + meta filled per Liam's R2.]`

#### `/work/fashion`

**Label:** `01.8 — Fashion`
**H1:** `Fashion`
**Subhead:** `From the runway to the real world.`
**Meta title:** `Fashion campaign, ready to wear, conceptual and avant-garde`
**Meta description:** `Fashion related campaigns from leading apparel companies which include film and photography to showcase seasonal or capsule collections.`

`[Changed in v3: meta filled per Liam's R2. Live copy uses "avant-garde" (R2 feedback had "avante garde").]`

#### `/work/studio`

**Label:** `01.9 — Studio`
**H1:** `Studio`
**Subhead:** `For ultimate control and set builds.`
**Meta title:** `Custom Studio Set Builds | Portland Photography Studio`
**Meta description:** `Commercial work shot on Photon's 6,000 sq ft Portland stage and cyclorama. Custom set builds, talent, and product work with creative, production, and post in the same building.`

`[Changed in v2: H1, subhead, and meta title replaced with Liam's R1 versions. Meta description left blank in R1; v1 draft kept and adapted to the new "set builds" framing.]`

`[Pre-launch: Liam did not supply R2 meta for Studio category — v1 draft retained. See §12.]`

#### `/work/art-dept`

**Label:** `01.10 — Art Dept`
**H1:** `Art Dept`
**Subhead:** `When our in-house team built the props, sets and practical FX.`
**Meta title:** `Set and prop building, fabrication and other art department jobs`
**Meta description:** `In-studio and on location set building, prop making, set dressing, light integration, plexiglass, framing, fabrication, 3D printing, large format LED wall, digital set extensions, concrete, foam, mesh, sound dampening, paint work, and special effects.`

`[Changed in v3: H1 drops "!" per R2; meta title/description filled per R2.]`

---

## 04 — Project page (standard template)

The template for most projects on the site. You and the team fill in per-project content through the CMS; the structure and placeholder labels below are what the Sanity entry form will guide.

`[Content population: per-project descriptions, Photon handled lists, and hero media will be imported from Liam's Google Sheet → Sanity in a later pass — not duplicated into this copy doc. Sheet: https://docs.google.com/spreadsheets/d/1rAYVequdGKmqYrb-PUhiFF04hqyQGHHkafch-YypyO0/edit?usp=sharing — hero video/cover via Dropbox TBD.]`

### Structure

1. **Hero** — full-bleed video or cover image, project title overlaid.
2. **Meta strip** — client, year, category tags.
3. **Context** — 2–4 sentences on the brief and what was interesting.
4. **Photon handled** — capability list (what Photon delivered on this project). Replaces the traditional "credits" block per Liam's R1 note.
5. **Craft callout** — optional camera / lens / light / frame-rate block.
6. **Gallery** — stills and additional frames.
7. **BTS** — optional section with behind-the-scenes photos and a short note.
8. **Related projects** — three recent or related entries.
9. **CTA** — `Start a conversation →`

`[Changed in v2: the traditional named-credits block (Director / DP / Production / Editor names) is replaced by a "Photon handled:" capability list per Liam's R1 — *"Instead of full credits, can we approach this more as: Photon handled this list of things..."* Reasons this matches Photon's positioning: (1) it answers "what did Photon actually do here?" — which is the only question a brand-side decision-maker is asking; (2) it surfaces capability breadth on every project page, reinforcing the modular-services story; (3) it removes named-individual credits that Photon's white-label clients (agencies) often prefer not to publish; (4) it's better for AEO — LLMs can directly cite "Photon handled X for Y" as a fact about Photon's capability set. Named credits for crew can still appear in the BTS note if a project warrants it.]`

### Worked example using Sorel high gear (tentative featured project)

**Hero title:** `Sorel High Gear`

**Meta strip:**

- Client: `Sorel`
- Year: `/26`
- Category: `Campaign · Product · Lifestyle`

**Photon handled:**

```
Creative direction · Treatment · Production
Direction · Cinematography · In-studio weather rig
Edit · Color · Sound design · Final delivery
```

`[Pattern: a 2–3 line list of what Photon delivered on this project, set in mono. Items map to Photon's capability vocabulary (Creative / Production / Post sections in /capabilities). Per-project copy is filled through the CMS — a multi-select field tied to the same vocabulary keeps it consistent across the site.]`

**Context (2–4 sentences — example of the pattern):**

> `[PLACEHOLDER — pattern example:] Sorel brought us in to shoot their High Gear boot line. We loved the texture contrasts — technical outerwear against raw snow and wet rock — and the chance to push our in-studio weather rig. Shot over two days in Portland, plus a third on Mt. Hood.`

**Craft callout (optional):**

```
CAMERA       ARRI Alexa Mini LF       [TBC]
LENS         Cooke S4/i Classic       [TBC]
LIGHT        Astera Titan, ARRI SkyPanel  [TBC]
FRAME RATE   Up to 200 fps            [TBC]
```

**BTS note (optional, 1–2 sentences):**

> `[PLACEHOLDER — pattern example:] The trickiest part was keeping the snow convincing under studio light. We ended up building a slow-melt rig that let us re-wet the set between takes without losing continuity.`

**CTA:** `Start a conversation →`

### [SEO] Standard project page metadata template

- **Title:** `[Client] — [Project title] | Photon Studio`
- **Meta description:** The first sentence of the context, trimmed to 150 characters.
- **URL slug:** `/work/[client-project-slug]`
- **Schema markup:** `CreativeWork` + `Organization` (handled automatically in the template)

---

## 05 — Project page (case study template)

Same structure as the standard template, plus narrative depth and a testimonial. Used for Photon's hero relationships — Sorel, Nike, Hyperice, Oura — and the new Sounders case study if it lands.

### Additions over the standard template

1. **The brief** — one paragraph on what the client came in with.
2. **The approach** — one paragraph on how Photon solved it.
3. **The result** — one short paragraph plus an optional metric.
4. **Testimonial** — a real client quote, pulled in the most prominent position on the page.
5. **Extended gallery** — more frames, wider crops.

### Worked example using the Sounders Bruce Lee kit (tentative hero case study)

**The brief (example — Liam to edit):**

> `[PLACEHOLDER — pattern example:] Seattle Sounders were launching the Bruce Lee kit — a limited-edition jersey tied to Bruce Lee's Seattle roots. They needed a campaign that honored the legacy without turning into a costume. Fast, physical, and visually unmistakable.`

**The approach:**

> `[PLACEHOLDER — pattern example:] We built the shoot around motion — real players, real sparring, real sweat. Ran 1000fps slow motion to catch the kit moving the way fabric is supposed to move. Lighting was hard-edge, single-source, styled after Lee's training footage. No doubles. No stunt rigs.`

**The result:**

> `[PLACEHOLDER — pattern example:] The launch film ran across Sounders social, in-stadium video boards, and MLS broadcast lead-ins. The kit sold out the day it dropped.`

**Testimonial block (this is the biggest missing piece on the current site — even one real quote changes the credibility equation):**

> `[PLACEHOLDER — real quote required from Sounders marketing contact.]`
> — `[Name], [Title], Seattle Sounders FC`

### [SEO] Case study metadata template

- **Title:** `[Client] × [Project] — Case Study | Photon Studio`
- **Meta description:** The brief in one sentence, ending with "A case study from Photon, a Portland production studio."
- **Schema markup:** `Article` + `CreativeWork` + `Review` (for the testimonial).

---

## 06 — Studio

This page is now Studio-only. Per Liam's R1, the broader About content (founder anchor, why modular, how we work, where we work) migrated to /capabilities. What's left here is what the section header has always implied: the physical place and the people who run it.

### Hero

**Label:** `02 — The studio`

**H1:** `Ground Control for boots on the ground.`

**Lead paragraph:**

> `Photon's HQ is a 6,000 sq ft studio in SE Portland, Oregon. Designed and built out by the owners, we've put our blood, sweat, and tears into this space. And with that, so much space for activities. We often integrate specialty set builds into our projects, interior weather, pyrotechnics, large format LED walls, and other creative solutions to push the envelope right here at home.`

`[Changed in v2: hero fully replaced per Liam's R1. v3 aligns homepage SEO to 6,000 sq ft per R2.]`

### Specs block

| Spec                         | Value                                      |
| ---------------------------- | ------------------------------------------ |
| Total space                  | `6,000 sq ft`                              |
| Cyclorama                    | `44 × 38 — permanent, seamless, paintable` |
| Power                        | `400 AMP, with digital 3-phase converter`  |
| Wifi                         | `Dedicated fiber, 1G`                      |
| Ceiling height               | `16 ft clear, 24 ft total`                 |
| Kitchenette and bathroom     | `1 of each`                                |
| Loading                      | `Drive-in roll-up door, 14 ft × 12 ft`     |
| Scissor lift                 | `Genie GS-1930`                            |
| Camera, grip, lighting, crew | `In-house`                                 |
| Lighting                     | `Total control — full blackout possible`   |
| Parking                      | `Street`                                   |
| Address                      | `726 SE 10th Ave, Portland, OR 97214`      |

`[Changed in v2: spec block fully populated from Liam's R1 — every TBC field in v1 is now filled. This block lives on /studio (this page) AND in shorter form on /rentals (since rental clients need the same specs). When rounds 2/3 update any spec, both pages need to update — design/dev should consider one shared content source in Sanity.]`

### Section — Satellite and EU launchpad

**H2:** `Satellite and EU launchpad.`

> `Photon's satellite office is a 150 sq m studio in Lisbon, Portugal. This is the main hub for post production and the launchpad for productions across Europe.`

`[Changed in v2: section added per Liam's R1 — first time the Lisbon hub gets its own structured block on /studio. Verbatim from feedback. Pairs with the homepage SEO meta and /capabilities "Where we work" line ("Portland, Portugal, and everywhere in between").]`

### Section — Crew

**Subhead:** `Crew.`

**Format:** Liam and Chris feature in two larger portraits on the top row as the heads of the company. The five support crew share a row below in smaller portraits. Per Liam's R1 — _"we will be adding a 7th crew so ideally we could have two portraits of Chris and I bigger as the heads of the company on one line and then a 'support crew' line of the other 5 personnel sharing a line below."_

**Top row — heads of the company:**

```
[PHOTO]                          [PHOTO]
LIAM GILLIES                     CHRIS CRARY
Chief Photometrics               Mission Control
```

**Bottom row — support crew:**

```
[PHOTO]            [PHOTO]            [PHOTO]            [PHOTO]            [PHOTO]
EM GILLIES         TONI CRARY         AUSTIN BAKER       GARRETT BAKER      RUSSEL BOWEN
Environmental      Life Support       Orbital Mechanic   Mission Specialist Systems Engineer
Control                               [Baker Bros]       [Baker Bros]       [Against the Grain]
```

`[Changed in v2: crew section fully restructured per Liam's R1. Names, titles, and partner-studio attributions ([Baker Bros], [Against the Grain]) are verbatim from feedback. Layout: 2 large portraits on top (Liam + Chris as company heads), 5 smaller portraits below as support crew. The v1 placeholder grid with [TBC] names is now resolved.]`

### CTA

**Subhead:** `Let's talk shop.`
**CTA:** `Start a conversation →`

`[Changed in v2: CTA subhead per Liam's R1 — "Let's talk shop." (was "Want to talk shop?"). Cleaner, more declarative.]`

### [SEO] Studio metadata

- **Title:** `The Studio — 6,000 sq ft Production Space, SE Portland | Photon`
- **Meta description:** `Photon's HQ is a 6,000 sq ft Portland studio with a 44 × 38 cyclorama, 400 AMP power, drive-in loading, and full in-house camera, grip, lighting, and crew.`

`[Changed in v2: title and meta updated to match Liam's new "Ground Control" framing and the 6,000 sq ft spec. Specs in the meta are pulled from the new R1 spec block — these are the keywords agency producers search for ("Portland production studio cyclorama," "400 AMP studio Portland," etc).]`

---

## 07 — Capabilities

The biggest page on the site. Restructured per Liam's R1: this page now carries the founder anchor, the why-modular argument, the how-we-work argument, and the where-we-work argument — material that previously lived in /about. About narrows to Studio + Crew. Everything moved here is rewritten in Liam's R1 voice.

`[Capabilities module/tile labels: final list lives on Google Sheet tab 3 → Sanity later. Not imported into this copy doc in v3.]`

### Hero

**Label:** `03 — Capabilities`

**H1:** `Modular Production, beginning to end.`

**Lead paragraph:**

> `A giant network distilled into specialty teams, with one mission: maximize resources and elevate what's possible. Create once. Launch everywhere.`

**Founder anchor (small, sits below the lead):**

> `Founded in 2017 by Liam Gillies and immediately joined by Chris Crary. This duo has been part of Photon from day one and continues to be the core of the business.`

`[Changed in v2: founder anchor moved here from /about per Liam's R1, and rewritten with the actual founding year (2017) and Chris Crary's name. The earlier v1 [TBC] placeholder is now resolved.]`

**Secondary line:**

> `Most production scales by adding more staff. We scale through reach.`

`[Changed in v2: hero block fully replaced per Liam's R1. H1 ("Modular Production, beginning to end."), lead paragraph, founder anchor, and secondary line are all verbatim from feedback. The v1 "Why-modular callout" and v1 "Pick the ones you need" line are dropped — Liam's R1 secondary line ("scale through reach") replaces both.]`

### Section — Why modular

**Subhead:** `Everything you need, nothing you don't.`

> `Because no two shoots are alike. We focus on nimble, specialized teams that scale to the exact need. This way, we can utilize any budget level to the best of its ability — extending creative possibilities in a smooth process.`

`[Changed in v2: section migrated from /about per Liam's R1, with new subhead and new copy (verbatim). The v1 "Creating like children, editing like scientists" pull quote is dropped — this section is a full rewrite, so per the survival rule it doesn't carry over.]`

### Section — How we work

**Subhead:** `Creative → Production → Post.`

> `Consistent creative heads from planning through post production lead to even more reduction of waste. The best result comes from a thoughtful creative idea matched with an equally thoughtful process.`

`[Changed in v2: section migrated from /about per Liam's R1. Subhead is the same arrow string as v1 (kept on purpose — it's the cleanest one-line summary of the workflow). Body copy is verbatim from R1.]`

### Section — Where we work

**Subhead:** `Portland, Portugal, and everywhere in between.`

> `Portland is HQ. Portugal is our satellite. The world is our oyster.`

`[Changed in v2: section migrated from /about per Liam's R1. Three-line punch — short, confident, peer voice. Verbatim from R1.]`

### Section — Modules (replaces v1 "We're known for")

A grid of small square tiles, each tile a single specialty module. Visual-first — each square shows a label, optional spec, and an in-house indicator. Designer to build the tile pattern; copy below is the module taxonomy.

**Tile labels (designer to map to a 3×N or 4×N grid):**

```
Creative · Treatment · Storyboard · Shot design
Look development · Art direction · Set design
Commercial video (8K / 6K / 4K) · Commercial stills
High-speed (1000+ fps) · Anamorphic · Macro · Tabletop
Astera lighting · In-studio weather · Practical FX
Cyclorama · 400 AMP · 6,000 sq ft stage
Edit · Color · Finishing · Motion graphics
Sound design · VO · Foley · Retouching
Lisbon hub · EU production
```

`[Changed in v2: the v1 "We're known for" prose list and the downloadable PDF spec sheet CTA are both dropped from this page per Liam's R1 — *"Lets remove the 'we're known for' section and add the module squares instead"* and *"Why is the downloadable spec sheet in capabilities if its for studio rental?"* The spec sheet CTA moves to /rentals (where it's audience-appropriate). Module copy is repointed: instead of a prose list naming six headline capabilities, the page now shows the full modular vocabulary as discrete tiles. Same content, different scan-pattern — agency EPs reading this for capability fit get a denser at-a-glance scan; brand leads reading for confidence still get the headline modules in the first row of tiles.]`

`[Note: motion control was in the v1 list; it is removed here per Liam's broader R1 instruction — "we do not have that service in house, so it shouldn't be touted quite so heavily."]`

### Section — Creative

**Subhead:** `Creative.`
**Intro line:** `Where the brief becomes a plan.`

> `Treatment development, storyboarding, shot lists, look development. Every project starts with the team that will shoot it — no handoff between the room that pitched the idea and the set that executes it.`

`[Changed in v2: intro line updated per Liam's R1 — "Where the brief becomes a plan." (was "Where the brief becomes a shot."). Body copy slightly tightened to match R1 verbatim ("Every project starts with the team that will shoot it" replaces "Every shoot starts with..."). The v1 module sub-list is dropped — module names now live in the Modules tile grid above.]`

### Section — Production

**Subhead:** `Production.`
**Intro line:** `Where every moment counts.`

> `As content demands rise, so do our solutions. We manage multiple capture types to squeeze out every last drop of our opportunities on the day.`

`[Changed in v2: intro line and body copy fully replaced per Liam's R1. The v1 "Capture" and "On-set technical" sub-lists are dropped — module names now live in the Modules tile grid above.]`

### Section — Post

**Subhead:** `Post.`
**Intro line:** `Where it all comes together.`

> `Edit, color, GFX, sound design and VFX. All in-house, next door to the cameras. No shipping hard drives across town. No loss in translation from director to editor.`

`[Changed in v2: intro line updated per Liam's R1 ("Where it all comes together") and body copy replaced verbatim. The v1 module sub-list is dropped — module names live in the Modules tile grid above.]`

### Section — How we work with agencies and brands

**Subhead:** `Maximum flexibility.`

> `We are a true white-label service and can interface within existing teams or build an entirely new one from scratch. Planning through post or a specific capability on its own — our goal is to execute at the highest level, regardless of scope or scale.`

`[Changed in v2: subhead and body fully replaced per Liam's R1. The v1 four-paragraph block — including the "extension of your team" opener and the named SGK / Nike example — is dropped. Liam's R1 framing is tighter: positions Photon as a true white-label service and reinforces the modular promise. The v1 "extension of your team" line was Liam-approved in DEPENDENCIES #17 ("Im ok with working in 'We work as an extension of your team, not in place of it.' Its clean and true") — we've folded that line in below as an optional secondary, designer can decide whether to surface it as a callout.]`

**Optional secondary line (Liam approved in DEPENDENCIES #17 — designer to decide if it surfaces here as a callout or pull-quote):**

> `We work as an extension of your team, not in place of it.`

### Sections dropped in v2

- **How we engage** — dropped per Liam's R1 (_"Lets lose — How we engage"_).
- **What we don't do** — dropped per Liam's R1 (_"Lets lose — What we don't do"_).

### CTA

**Subhead:** `Need a specific capability on a specific date?`
**CTA:** `Start a conversation →`

### [SEO] Capabilities metadata

- **Title:** `Capabilities — Modular Production from Creative through Post | Photon Studio`
- **Meta description:** `Photon's modular production capabilities: creative, production, and post — all in-house. High-speed, cyclorama, in-studio weather, edit, color, sound. Portland and Lisbon.`

`[Changed in v2: title reframed away from "Commercial Video, High-Speed, Motion Control" — motion control reference removed (per Liam's global R1 cut), and the title now leads with the modular Creative/Production/Post structure of the page. Meta description rewritten to mirror the page's new section order.]`

---

## 08 — Rentals

**Site structure (v3):** Three indexable rental pages plus an optional thin hub. Top nav shows one label — **Rentals** — with a hover/focus dropdown to Studio, Podcast, and Gear (Liam's R2 preference: clean nav + SEO depth).

| Route              | Purpose                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `/rentals`         | Optional hub — three cards linking to the pages below (or 301 to `/rentals/studio` if you want one default landing) |
| `/rentals/studio`  | Portland production studio rental                                                                                   |
| `/rentals/podcast` | Portland podcast room rental                                                                                        |
| `/rentals/gear`    | Curated gear list + PDF downloads                                                                                   |

> **Editorial note (SALT recommendation, R2):** Liam was torn between one consolidated page (v2) and three URLs (original). We recommend **three pages + Rentals dropdown** — it keeps the top nav at five items while giving Google three keyword targets ("Portland studio rental," "podcast studio Portland," "production gear rental Portland"). Each page gets its own `[SEO]` block and one `Service` JSON-LD at build. If a single-page prototype URL exists, 301 to the matching `/rentals/*` route.

**Shared copy — Good to know (can appear on all three rental pages or studio + podcast only):**

> `We book the studio by the day; over 10 hours adds overtime. The podcast room books by the hour, with a two-hour minimum. If you're scouting, we'll walk you through in person or send a full virtual tour. Holds are first-come, first-served. Deposits secure the hold date.`

`[Changed in v3: booking rules per Liam's R2 — replaces v2 "two-day minimum on most productions" framing.]`

---

### Optional hub — `/rentals`

**Label:** `04 — Rentals`

**H1:** `Space and gear available for creators.`

**Lead paragraph:**

> `Photon rents three things: the 6,000 sq ft Portland studio, the treated podcast room, and a curated gear list. Each comes with the option of a Photon crew on the day — or rent it bare and bring your own.`

**Hub cards (three links):** Studio → `/rentals/studio` · Podcast → `/rentals/podcast` · Gear → `/rentals/gear`

### [SEO] Rentals hub metadata (if hub ships)

- **Title:** `Studio, Podcast Room, and Gear Rentals — Photon Studio Portland`
- **Meta description:** `Rent Photon's 6,000 sq ft Portland production studio with cyclorama and 400 AMP power, the treated podcast room, or curated gear from our in-house list.`

---

### Page — `/rentals/studio` (Portland Studio)

**Label:** `04.1 — Studio rental`

**H1:** `Portland Studio.`

**Specs block:**

| Spec                         | Value                                      |
| ---------------------------- | ------------------------------------------ |
| Total space                  | `6,000 sq ft`                              |
| Shooting area                | `60 ft × 38 ft`                            |
| Cyclorama                    | `44 × 38 — permanent, seamless, paintable` |
| Power                        | `400 AMP, with digital 3-phase converter`  |
| Wifi                         | `Dedicated fiber, 1G`                      |
| Ceiling height               | `16 ft clear, 24 ft total`                 |
| Loading                      | `Drive-in roll-up door, 14 ft × 12 ft`     |
| Scissor lift                 | `Genie GS-1930`                            |
| Lighting                     | `Total control — full blackout possible`   |
| Camera, grip, lighting, crew | `In-house`                                 |
| Kitchenette and bathroom     | `1 of each`                                |
| Parking                      | `Street`                                   |
| Address                      | `726 SE 10th Ave, Portland, OR 97214`      |

`[Spec block now sourced from Liam's R1 Studio block — same data as on /studio. Designer/dev should consider one shared content source in Sanity so updates propagate to both pages.]`

#### What's included

> `Every rental comes with the studio essentials: 60 ft × 38 ft shooting area, cyclorama with a fresh coat of paint, grip closet of goodies, studio power, climate control, wifi, kitchenette, and bathroom.`

`[Verbatim from Liam's R1.]`

#### What's extra

> `Camera, lens, lighting, custom grip and crew beyond the house kit, specialty rigs (motion control, high-speed, anamorphics), on-set Photon crew, catering, and art-department labor are all available on request — priced per shoot day.`

`[Verbatim from Liam's R1. Note: motion control is mentioned here as a rental capability — distinct from /capabilities, where Liam removed it from the headline service list because it isn't run as an in-house everyday service. This is consistent: it's a rig/capability we'll set up on a rental day, not a default service we tout.]`

#### Section CTA

**Headline:** `Ready to book the studio?`
**CTA:** `Check availability →` (routes to `/contact` with the studio rental subject prefilled)

### [SEO] `/rentals/studio` metadata

- **Title:** `Portland Studio Rental — 6,000 sq ft Cyclorama | Photon Studio`
- **Meta description:** `Rent Photon's 6,000 sq ft Portland production studio with 44 × 38 cyclorama, 400 AMP power, drive-in loading, and optional in-house crew.`

`[Dev: one Service JSON-LD block on this page — studio rental offering.]`

---

### Page — `/rentals/podcast` (Portland Podcast Room)

**Label:** `04.2 — Podcast rental`

**H1:** `Portland Podcast Room.`

**Specs block:**

| Spec          | Value                                  |
| ------------- | -------------------------------------- |
| Room type     | `Acoustically treated recording booth` |
| Mic setup     | `2 × on shock mounts`                  |
| Headphones    | `Over-the-ear × 4`                     |
| Recording     | `Raw, with in-camera redundancy`       |
| Engineer      | `Optional on-site engineer add-on`     |
| Video capture | `Optional Blackmagic 6K video`         |
| Delivery      | `Raw WAV files`                        |
| Booking       | `Two-hour minimum`                     |

`[Changed in v2: every TBC field from v1 is now filled per Liam's R1. Mic models still TBC per Liam's DEPENDENCIES #10 — "Will gather more technical info for podcast room." Default applied: list mic count without specific model so the spec table reads complete; we'll swap in models once Liam provides them.]`

#### Who it's for

> `Podcasters recording a weekly episode. Brand audio teams cutting launch spots. VO directors on deadline. Foley artists who need a quiet room that isn't their closet.`

`[Survives from v1 — Liam's R1 didn't address this section, and the surrounding section (specs + What's included) isn't a full rewrite. Per the survival rule: if Liam didn't mention it and it isn't replaced, it stays.]`

#### What's included

> `The room, the mics, the headphones, the engineer if you want one, and the kind of silence most home studios can't buy. Bring your guests. We'll bring the coffee.`

`[Survives from v1 — same survival rule as above.]`

#### Section CTA

**Headline:** `Ready to book the room?`
**CTA:** `Check availability →` (routes to `/contact` with the podcast rental subject prefilled)

**CTA:** `Check availability →` (routes to `/contact` with the podcast rental subject prefilled)

### [SEO] `/rentals/podcast` metadata

- **Title:** `Portland Podcast Room Rental | Photon Studio`
- **Meta description:** `Rent Photon's acoustically treated podcast room in Portland. Mics, headphones, optional engineer and video capture — two-hour minimum, books by the hour.`

`[Dev: one Service JSON-LD block on this page — podcast room offering. Mic models still TBC — Liam gathering podcast room tech.]`

---

### Page — `/rentals/gear` (Portland Gear List)

**Label:** `04.3 — Gear list`

**H1:** `Portland Gear List.`

**Section H1 (above the gear sheet — Liam's verbatim):** `Photon curated gear.`

**Lead paragraph (Liam's verbatim):**

> `Take your shoot even further with the same gear our creative team relies on.`

**Downloadable gear sheet:**

> `[Download the Photon gear list (PDF) →](/photon-gear-list.pdf)`

`[Changed in v2: ENTIRELY NEW section per Liam's R1 — "Insert downloadable gear sheet." This is also where the studio spec sheet PDF that was on /capabilities now lives, since Liam asked "Why is the downloadable spec sheet in capabilities if its for studio rental?" Both PDFs (gear list + studio spec sheet) live here. Owner of the PDF assets: TBC: Liam (per DEPENDENCIES #17c — "Should a spec sheet for the studio live in the studio section? Super down to make one.").]`

**Studio spec sheet (also moved here from /capabilities):**

> `[Download the Photon studio spec sheet (PDF) →](/photon-spec-sheet.pdf)`

`[TBC: Liam — both PDFs are placeholders. Studio spec sheet content can be auto-generated from the spec table on /studio (single source of truth). Gear list content needs to come from Liam's inventory list — we'll need a Google Sheet or doc to start from.]`

#### Section CTA

**Headline:** `Need to talk through a gear add-on?`
**CTA:** `Check availability →` (routes to `/contact` with the gear rental subject prefilled)

### [SEO] `/rentals/gear` metadata

- **Title:** `Production Gear Rental Portland | Photon Studio`
- **Meta description:** `Rent curated camera, grip, and lighting gear from Photon's in-house list. Download the gear sheet — same kit our creative team uses on set.`

`[Dev: one Service JSON-LD block on this page — gear rental offering. PDFs: Liam to produce gear list + studio spec sheet.]`

---

## 09 — Contact

Minimal. No friction. You flagged this explicitly — low friction to conversation is the goal.

### Hero

**Label:** `05 — Contact`

**H1:** `Mission briefing.`

**Lead paragraph:**

> `Tell us what you're making. We'll tell you if we're the right studio to make it with you — and who to call if we're not.`

### Direct contact (sits above the form, styled small but prominent)

> `Rather skip the form? Email Chris directly — [chris@photon.studio](mailto:chris@photon.studio). He answers same day, usually same hour.`

`[Why this line is here: every peer studio we reached (Stept, 1stAveMachine, Hungry Man, Park Pictures, Buck, Stink, Iconoclast) surfaces a direct email or named contact, and several have no web form at all. Our form is higher-friction than the category norm — which is fine for intake quality, but risks losing the agency producer with a Friday RFP who won't fill out a dropdown at 6pm Thursday. Surfacing Chris's direct email above the form gives that EP an escape hatch without sacrificing the structured intake for everyone else. Confirmed by Liam in DEPENDENCIES #17b — "Yes, chris should be intake and always an option with no friction."]`

### Form fields

- `Your name *`
- `Your email *`
- `Your company` (optional)
- `What kind of project?` (optional dropdown): `Brand campaign`, `Product launch`, `Case study / film`, `Studio rental`, `Podcast session`, `Something else`, `Not sure yet`
- `What are you working on? *` (textarea)
- `What are you delivering?` (optional textarea — short list: e.g. "1× 60s hero, 4× :15 socials, 12× stills")
- `Budget range` (optional dropdown): `Under $25k`, `$25k–$75k`, `$75k–$150k`, `$150k+`, `Rather not say yet`
- `Project dates` (optional textarea — shoot date and delivery date if known)
- `How did you hear about us?` (optional dropdown): `Referral`, `Search`, `Instagram or Vimeo`, `Event or press`, `Something else`

**Submit button:** `Launch →`

`[Changed in v2 per Liam's DEPENDENCIES #11 — "Maybe we add an optional field in the contact form for the things we always need: Budget range, timeline/shoot and delivery date and list of deliverables." Two new optional fields added: "What are you delivering?" (deliverables list) and "Project dates" (shoot + delivery dates as a single textarea, since they're often related and producers often know one before the other). The previous "Timeline" dropdown is replaced by "Project dates" — dropdown ranges aren't useful when an EP already has a real shoot date in mind.]`

### Who you're reaching

Small text, set below the form. Names the humans at the other end so this doesn't feel like a message dropping into a void.

> `Chris runs intake — he's the first read on every project. Liam jumps in for creative direction. You'll hear from one of them within one business day, usually faster.`

### Success state

**H2:** `Signal acquired.`

> `Message received. We'll be back within one business day — usually faster. If it's urgent, reply to the confirmation email and we'll route it straight to whoever's on deck.`

### Error state

**H2:** `Signal lost.`

> `Something didn't send. Try again, or email us directly at chris@photon.studio. We'd rather hear from you twice than not at all.`

### Alternate contact (small text under the form)

> `For rentals: mention the date in your message. For agencies: mention the brand.`

`[Email setup (resolved in v2 — see Editorial notes for Photon team in §00 above for the full recommendation): the contact page surfaces chris@photon.studio as the direct line. The footer carries hello@photon.studio as the public alias. Internally, hello@ routes to chris@ + liam@ (or a forwarding rule both can configure). The form itself routes the same way — chris@ + liam@ both receive it. This resolves Liam's R1 ambiguity ("hello@ on the footer and chris@ everywhere else, liam@ for creative questions") with zero friction for the buyer (one form, one email surfaced) and zero missed emails for the team (server-side routing covers the rest).]`

### [SEO] Contact metadata

- **Title:** `Contact Photon — Start a Conversation | Portland Production Studio`
- **Meta description:** `Get in touch with Photon, a Portland and Lisbon production studio. Brand campaigns, case studies, studio rentals, podcast sessions. One-business-day reply.`

`[Changed in v2: meta description broadened to include Lisbon ("Portland and Lisbon production studio") to match the global two-location framing.]`

---

## 10 — 404 / Signal Lost

The space-theme moment.

**H1:** `Signal lost.`

> `Ground control can't find that page. It may have been moved, renamed, or jettisoned in a previous orbit.`

**CTAs (side by side):**

- `Back to mission control →` (routes to `/`)
- `Browse the work →` (routes to `/work`)

**Footer line (small mono, below the CTAs):**

> `Photon Studio — modular production for the future of content.`

`[Why this line: the 404 body uses "ground control" as functional metaphor (the narrator is the one searching for a lost signal — that works here because Photon literally can't find the page you asked for). But the footer signature should match the brand tagline that lives on the bottom bar everywhere else on the site. Don't have two competing one-liners.]`

### [SEO] 404 metadata

- **Title:** `Signal Lost — 404 | Photon Studio`
- **Meta description:** `The page you were looking for can't be found. Head back to Photon's work, or say hello.` (88 chars)

---

## 11 — Dependencies & handoffs

### Resolved in round 2 (v3)

| Item                            | Resolution                                                   |
| ------------------------------- | ------------------------------------------------------------ |
| Homepage relationship line      | **Option C** locked (§02)                                    |
| Studio square footage           | **6,000 sq ft** everywhere                                   |
| Work filter pills at launch     | **All 10 categories** ship as pills                          |
| Music / Fashion / Art Dept meta | Filled per R2                                                |
| High-speed meta                 | Freefly Ember 5K + Pixboom Spark per R2                      |
| Email                           | Liam configuring `hello@` Google forwarding to Chris + Liam  |
| Rentals IA                      | Three pages + Rentals nav dropdown (§08)                     |
| Rentals booking copy            | Studio by day (overtime after 10h); podcast by hour (2h min) |
| Legal — Terms                   | Existing agreement text in §13 (R2)                          |

### Still open before launch (copy doc)

| Item                                         | Owner       | Notes                                                 |
| -------------------------------------------- | ----------- | ----------------------------------------------------- |
| Footwear + Studio category meta descriptions | Liam        | Still `[TBC]` from R1 — v1 drafts remain in §03       |
| Podcast room mic models                      | Liam        | Spec table uses counts only until tech detail arrives |
| Testimonials (5 hero projects)               | Liam        | TBD                                                   |
| Gear + studio PDFs                           | Liam        | Placeholder links in §08                              |
| Privacy / Cookies / Accessibility            | Liam / SALT | Terms body in §13; other policies TBD                 |

### Deferred — not in this copy doc (CMS / sheet)

| Item                                      | Source                                                                                                                       | Notes                                         |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Per-project descriptions + Photon handled | [Google Sheet](https://docs.google.com/spreadsheets/d/1rAYVequdGKmqYrb-PUhiFF04hqyQGHHkafch-YypyO0/edit?usp=sharing)         | Sheet → Sanity later; do not paste into v3 MD |
| Capabilities tile labels                  | Sheet tab 3                                                                                                                  | Same sheet → Sanity later                     |
| Client roster (CMS)                       | Sheet                                                                                                                        | Liam adding roster language to sheet          |
| Studio + team photography                 | [Dropbox](https://www.dropbox.com/scl/fo/zhpkj52r7ty707q4upgny/ANFzAZL2wmMoUjAD0BcsZhE?rlkey=ux3zh6lugivj6q3uh49qq8qxj&dl=0) | Assets for Studio page + crew                 |
| Hero video / cover per project            | Dropbox TBD                                                                                                                  | Per R2                                        |

### Hand-off items for design / dev (build phase)

| #   | Task                                                                 |
| --- | -------------------------------------------------------------------- |
| D1  | `hello@` forwarding + contact form to Chris + Liam                   |
| D2  | Three rental routes + nav dropdown; optional `/rentals` hub          |
| D3  | One `Service` JSON-LD per rental page                                |
| D4  | v3 copy doc → Sanity (all page copy)                                 |
| D5  | Google Sheet → Sanity (projects, Photon handled, tiles)              |
| D6  | Shared Sanity source for studio specs (Studio + Rentals studio page) |
| D7  | Terms page from §13; Privacy/Cookies/Accessibility TBD               |

---

## 12 — Pre-launch checklist

Copy-doc sign-off for v3 is complete when Liam has reviewed `docs/2026-04-10-photon-website-copy-v3.md`. Remaining work before ship is mostly assets and CMS population (§11).

| #   | Item                                       | Status          |
| --- | ------------------------------------------ | --------------- |
| 1   | Footwear `/work/footwear` meta description | Open            |
| 2   | Studio `/work/studio` meta description     | Open            |
| 3   | Podcast mic model in spec table            | Open            |
| 4   | Testimonials                               | TBD             |
| 5   | PDFs (gear list + studio spec)             | Liam to create  |
| 6   | Sheet → Sanity import                      | Phase 2         |
| 7   | Photography                                | Dropbox / shoot |

---

## 13 — Legal — Terms & Conditions (placeholder page copy)

`[Source: Liam's existing terms, provided in R2 feedback. Ship on `/terms` or equivalent at build — not in footer strip. Privacy, Cookies, and Accessibility remain separate placeholders unless Liam provides.]`

### Agreement

This Agreement ("Agreement") is entered into between Photon ("Creator") and ("Client") and governs the project described in the accompanying invoice ("Project"). Together with these Terms and Conditions, this Agreement constitutes a binding agreement between the parties. All creative materials, including concepts, images, videos, designs, processes, adaptations, inventions, and techniques ("Work"), remain the sole property of the Creator unless otherwise agreed in writing. The Client is granted a license to use the Work as specified in the Usage Terms in the above project description, and upon full payment of above fees. Any additional use (e.g., extensions beyond timeframe, new platforms, sublicensing, or derivative works) requires written approval and may incur additional licensing fees.

The Client is responsible for having an authorized representative present during any shoot or production to approve the Creator's interpretation of the Project. In the absence of such a representative, the Creator's interpretation shall be deemed acceptable. Any changes which significantly impact the scope of work, orally or in writing, may result in additional charges, invoiced as a change order. The invoice expenses are estimated in good faith.

### Payment

A non-refundable 50% deposit is required upon written notice of official job awarding. The remaining balance is due within 30 days of the project completion and transfer of works. Late payments will incur a 2% monthly interest charge. Usage rights are granted only after full payment is received.

### Cancellation / Postponement

If the Client cancels or postpones the Project after written confirmation, the initial 50% deposit is non-refundable. If cancellation occurs after production has begun, the Client shall pay all costs incurred up to the date of cancellation, including any kill fees for crew, location, or talent. If postponement occurs due to circumstances beyond either party's control (force majeure), both parties will make reasonable efforts to reschedule. Creator is not liable for delays caused by such events.

### Post-production & Revisions

Delivery timelines will be mutually agreed upon and the estimate includes three rounds of revisions. Any additional editing, retouching, color correction, graphics, crops or other alterations requested by the Client after round 4 and beyond the agreed scope will be billed automatically at a rate of $150/hour at the completion of the project.

### Indemnification

Client agrees to indemnify and hold harmless the Creator and its agents from all claims, liabilities, and expenses (including attorney's fees) arising from the Client's use of the Work. The Creator agrees to indemnify and hold harmless the Client against claims directly arising from Creator's gross negligence or willful misconduct.

### Limitation of Liability

In no event shall the Creator's total liability exceed the total amount paid by the Client under this Agreement. The Creator shall not be liable for any consequential, incidental, or indirect damages.

### Governing Law & Jurisdiction

This Agreement shall be governed by and construed in accordance with the laws of the State of Oregon and any disputes shall be resolved in the courts of Oregon.

---

_Third draft (v3) — SALT Studio for Photon._
_v2 frozen at round 1 (2026-04-16). v3 — round 2 feedback applied (Liam Gillies, 2026-05-17)._
