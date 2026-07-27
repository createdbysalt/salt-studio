# Photon — Website copy, v2

**Prepared by:** SALT Studio
**For:** Liam, Photon
**Status:** v2 — round 1 feedback applied, ready for round 2 review
**Language:** English
**Date:** 2026-05-05

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
- Round 1 focuses on voice, facts, and structural feedback. Round 2 is polish.

**Voice reminder.** If anything in this draft drifts from the voice in the copy proposal — corporate, salesy, performative, or "cutting-edge" — flag it. We'd rather cut a good line than keep a wrong one.

**Note on layout.** This is the words layer, not the design layer. Once we lock the visual direction and start laying pages out, some lines will need minor tweaks — a headline that's a hair too long for a card, a paragraph that breaks weirdly next to an image, a label that needs to shrink or stretch to fit its module. None of that changes the meaning; it just means final copy is a conversation with the final design. Keep that in mind as you review — we're approving intent and voice here, not pixel-perfect line breaks.

**Note on brackets.** Anything in this draft wrapped in brackets — `[TBC: …]`, `[PLACEHOLDER: …]`, `[Why …]`, `[Email housekeeping: …]` — is editorial commentary for you, not live copy. All brackets get stripped before launch. If a `[Why …]` note makes an argument for a specific move, that argument is meant to help you decide whether to keep, cut, or reword the line above it — not to ship on the public site.

### What changed in v2

V2 applies Liam's round-1 feedback (received 2026-04-16). Headline moves:

- **Email contradiction resolved.** `hello@photon.studio` on the footer (team alias). `chris@photon.studio` on the Contact page (direct, named-person trust signal). `liam@photon.studio` stays internal — server-side form routing handles creative inquiries. See "Email setup recommendation" below.
- **Archives section dropped.** Removed from nav and from the doc.
- **Structural move on Capabilities.** "Why modular," "How we work," "Where we work," and the founder anchor migrate from About to Capabilities. About narrows to a focused Studio + Crew page.
- **Work taxonomy expanded.** 11 filter pills (was 8). New categories: Lifestyle, Music, Fashion, Art Dept. Motion Control category dropped (not in-house — survives only as "available on request" in Rentals).
- **Rentals consolidated.** One `/rentals` page with three anchored sections (`#studio`, `#podcast`, `#gear`) replaces the prior three-URL structure. SEO recovery via passage indexing + keyword H2s + `Service` JSON-LD per offering. See "Rentals SEO trade-off" callout in §08.
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

This avoids putting four emails on the site (which dilutes the CTA) while still routing every kind of inquiry to the right person. Implementation: two DNS records + one form-routing rule.

---

## 01 — System copy

Small, global, sets the tone on every page.

### Primary navigation (top, persistent)

- Work
- Capabilities
- Studio
- Rentals
- Contact

`[Why Rentals is in the top nav: the consolidated /rentals page is an SEO-priority landing target for agency producers and local creatives searching "Portland studio rental" or "podcast studio Portland." Without a top-nav link it has no global entry point, which hurts both conversion and crawl depth. Five links — clean.]`

`[About → "Studio." The label in nav and the section header throughout the site now reads "Studio" rather than "About," reflecting the page's narrowed focus on the physical studio + crew. Strategic content (Why modular, How we work, Where we work) migrated to Capabilities in v2.]`

**Menu button on mobile / tablet:** `[ / ] MENU`

**Brand lockup:** `PHOTON / .STUDIO` (dot-matrix lockup, already in place in the prototype).

### Persistent bottom bar (homepage)

- CTA (right): `Start a conversation →`

`[Tagline removed in v2 per Liam: "feels too symmetrical and too much text for the landing." Bottom bar now has the right-side CTA only — left side stays clean. The "Modular production for the future of content." line lives in the SEO meta description and as part of the brand story, not as on-page copy.]`

### CTA library — where each one lives

| CTA                          | Where it appears                                       | Intent                                                                                       |
| ---------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `Start a conversation →`     | Homepage, Studio, Capabilities, Rentals, Project pages | The main site CTA. Always routes to `/contact`.                                              |
| `Extrapolate →`              | Homepage project info block, Work grid cards           | Opens the full project page. Replaces "Read more" per your feedback.                         |
| `Launch →`                   | Contact form submit button                             | Space-theme framing for the send action.                                                     |
| `Mission briefing`           | Contact page headline                                  | Space-theme framing for the form itself.                                                     |
| `Signal acquired`            | Contact form success state                             | Confirmation after a successful submission.                                                  |
| `Signal lost`                | 404 page + contact form error state                    | The theme moment — doubles as honest error copy.                                             |
| `Jump to the studio →`       | Top of `/rentals` page                                 | Anchor link to `#studio` section. Replaces the v1 `Rent the studio →` cross-page CTA.        |
| `Jump to the podcast room →` | Top of `/rentals` page                                 | Anchor link to `#podcast` section. Replaces the v1 `Rent the podcast room →` cross-page CTA. |
| `Check availability →`       | All three rental section CTAs                          | Routes to `/contact` with the rental subject prefilled.                                      |
| `See the full case →`        | Work grid cards (case studies only)                    | Routes to the case study version of the project page.                                        |

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

> `[TBC: Liam — pick one of the three options below, or rewrite. R1 note: "Let's rephrase. Love the intent towards client retention, but this feels garbled."]`

**Three options for the rephrase (Photon voice — direct, no adjectives, peer not vendor):**

- **Option A — plain math:** `Most clients hire us back. Some are ten projects deep. One is five years running.`
- **Option B — single arc:** `Some clients are ten projects in. One is five years running. The relationships are the product.`
- **Option C — reframe:** `We measure clients in projects and years, not deliverables. The longest is five years in.`

`[Why this line is on the homepage: our peer-studio research found that zero competitors surface client retention this way — everyone lists logos or project titles, nobody says "how long." This is Photon's single strongest trust signal for the first-time VP visitor from a Nike/Sorel/Oura-tier brand, and right now it only lives on the About page. Surfacing a compressed version here earns the rest of the homepage's minimalism — the VP doesn't have to click through to About to find the reassurance that makes the minimalism feel confident rather than thin.]`

`[Changed in v2: original line ("Ten projects in on some. Five years running on one. The relationships are the product.") flagged by Liam as "garbled." Three rephrase options above for round-2 selection. All three preserve the retention signal but vary on whether to keep the "the product" framing.]`

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
- **Meta description:** `A production studio for brands and agencies. Commercial video, stills, high-speed, based in Portland with a 5,000 sq ft studio with cyclorama and international reach.`
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

**Full taxonomy (10 categories — only those with 4+ projects launch as pills):**

```
ALL  /  SPORTSWEAR  /  LIFESTYLE  /  TECH  /  FOOTWEAR  /  FOOD  /  HIGH-SPEED  /  MUSIC  /  FASHION  /  STUDIO  /  ART DEPT
```

> Routing: `ALL` → `/work`. Every other pill → `/work/[slug]` (e.g. `/work/sportswear`, `/work/high-speed`, `/work/art-dept`). Per Liam's R1 note — _"under 4 projects doesn't constitute a pill, so not all at launch"_ — only the categories that clear the 4-project threshold ship as pills on day one. The rest stay in the Sanity schema and become pills automatically as the grid fills out.

`[Changed in v2: full taxonomy expanded from 7 → 10 per Liam's R1. **Added:** Sportswear (rename from Sport), Lifestyle, Music, Fashion, Art Dept. **Removed:** Motion Control entirely — Liam: "while motion control is a good differentiator, we do not have that service in house, so it shouldn't be touted quite so heavily." Mentions of motion control elsewhere on the site (homepage SEO meta, Food & Beverage subhead) are also dropped. **Renamed:** Tech & Wearables → Tech, Food & Beverage → Food (filter pill label only — full H1 keeps "Food and beverage"), Studio / Cyclorama → Studio.]`

`[Launch-vs-schema note: ship as pills only the categories with ≥4 published projects. Liam to flag during round 2 which clear the threshold — Sportswear and Studio almost certainly do; Music and Fashion may not. Pills hidden at launch still keep their /work/[slug] route live (so the URL is indexable for SEO once content fills in) but no pill renders in the filter bar until the threshold is met.]`

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

`[Changed in v2: all 10 categories below use Liam's R1 H1s and subheads where provided. Where Liam left meta title/description blank, v1's draft is kept and flagged [TBC: Liam] so round 2 can confirm or replace.]`

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
**Meta description:** `High-speed cinematography in Portland. Phantom Flex and VEO in-house on a 5,000 sq ft stage. Tabletop, product, fluid, and athletic work at 1,000+ FPS — shot and finished by the same team.`

`[Changed in v2: H1 simplified to "High-speed" per Liam's R1 (was "1,000+ frames per second, in-house"). Subhead now carries the rate. Meta unchanged.]`

#### `/work/music`

**Label:** `01.7 — Music`
**H1:** `Music`
**Subhead:** `[TBC: Liam — subhead not provided in R1.]`
**Meta title:** `[TBC: Liam — meta title not provided in R1.]`
**Meta description:** `[TBC: Liam — meta description not provided in R1.]`

`[Changed in v2: NEW category per Liam's R1. Copy fields left blank in feedback doc — flagged for round 2 fill-in.]`

#### `/work/fashion`

**Label:** `01.8 — Fashion`
**H1:** `Fashion`
**Subhead:** `From the runway to the real world.`
**Meta title:** `[TBC: Liam — meta title not provided in R1.]`
**Meta description:** `[TBC: Liam — meta description not provided in R1.]`

`[Changed in v2: NEW category per Liam's R1. H1 and subhead given; meta title/description blank in feedback — flagged for round 2.]`

#### `/work/studio`

**Label:** `01.9 — Studio`
**H1:** `Studio`
**Subhead:** `For ultimate control and set builds.`
**Meta title:** `Custom Studio Set Builds | Portland Photography Studio`
**Meta description:** `Commercial work shot on Photon's 5,000 sq ft Portland stage and cyclorama. Custom set builds, talent, and product work with creative, production, and post in the same building.`

`[Changed in v2: H1, subhead, and meta title replaced with Liam's R1 versions. Meta description left blank in R1; v1 draft kept and adapted to the new "set builds" framing.]`

`[TBC: Liam — meta description not provided in R1. Confirm or replace.]`

#### `/work/art-dept`

**Label:** `01.10 — Art Dept!`
**H1:** `Art Dept!`
**Subhead:** `When our in-house team built the props, sets and practical FX.`
**Meta title:** `[TBC: Liam — meta title not provided in R1.]`
**Meta description:** `[TBC: Liam — meta description not provided in R1.]`

`[Changed in v2: NEW category per Liam's R1 (and confirmed via Q2 — "it gets a pill for sure"). H1 and subhead given; meta title/description blank in feedback — flagged for round 2.]`

---

## 04 — Project page (standard template)

The template for most projects on the site. You and the team fill in per-project content through the CMS; the structure and placeholder labels below are what the Sanity entry form will guide.

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

`[Changed in v2: hero fully replaced per Liam's R1. New H1 ("Ground Control for boots on the ground") leans into Photon's space-program theme and pairs with the new Crew titles below. Lead paragraph and specs block are verbatim from R1 — 6,000 sq ft throughout the Studio page. The homepage SEO meta description retains Liam's verbatim "5,000 sq ft" framing per his R1 wording.]`

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

Per Liam's R1: rentals consolidated from three URLs (`/rentals` hub + `/rentals/studio` + `/rentals/podcast`) into a single `/rentals` page with three anchored sections — `#studio`, `#podcast`, `#gear`. The third section (gear list) is **new in v2** per Liam's R1.

> **Editorial trade-off note for the Photon team — please read before approving v2:**
>
> Collapsing /rentals from three URLs to one page is what Liam asked for, and it makes the page faster to scan and easier to maintain. The trade-off is SEO depth. Three pages each ranking for "Portland production studio rental," "Portland podcast room rental," and "production gear rental Portland" gives Google three independent footholds; one page consolidates all three keyword sets into one URL.
>
> **What we're doing to recover most of that depth on a single page:**
>
> 1. **Three keyword-rich H2s** — `Portland Studio`, `Portland Podcast Room`, `Portland Gear List` — each becomes its own anchor (`#studio`, `#podcast`, `#gear`). Google's passage-indexing system can rank a single H2-anchored section like a standalone page for the right query, so the section-as-page pattern recovers most long-tail rankings.
> 2. **Cross-page CTAs become anchor jumps.** The CTA library above already has `Jump to the studio →` and `Jump to the podcast room →` (both anchor links). The original `Rent the studio →` cross-page CTA is retired.
> 3. **Service JSON-LD per section.** Each of the three sections gets its own `Service` schema block (one for studio rental, one for podcast room, one for gear rental) so AEO/LLM crawlers see three discrete services on one URL — same as if they were three pages.
> 4. **301 redirects from the old URLs.** `/rentals/studio` → `/rentals#studio`, `/rentals/podcast` → `/rentals#podcast`. This preserves any inbound links or shared URLs from before the consolidation.
>
> **Net SEO impact estimate:** ~10–20% drop in long-tail rankings vs. three separate pages, recovered in 60–90 days as the single page accumulates passage-rank signals. If rankings matter more than page-load simplicity, we can split back out — but the consolidation is the right call for a small studio with limited content per rental type.

---

### Page header (sits above the three sections)

**Label:** `04 — Rentals`

**H1:** `Space and gear available for creators.`

**Lead paragraph:**

> `Photon rents three things: the 6,000 sq ft Portland studio, the treated podcast room, and a curated gear list. Each comes with the option of a Photon crew on the day — or rent it bare and bring your own.`

`[Lead paragraph drafted by us — Liam's R1 only provided the H1 and the three subheads. This three-line lead orients the reader to the three sections below and reinforces the "three things, your choice" framing without burying the H1.]`

**Anchor nav (sticky on desktop, collapses to a top-of-page bar on mobile):**

```
#studio   ·   #podcast   ·   #gear
```

`[Why anchor nav: Liam's R1 calls these three sections, but a single 2,000-word page with no in-page navigation forces every visitor to scroll the whole thing. The anchor bar gives the agency producer searching for "Portland podcast room" a one-click path to #podcast — the closest thing to the original "go straight to the right page" experience while keeping the consolidation Liam asked for.]`

---

### Section 1 — Portland Studio (#studio)

**Subhead:** `Portland Studio.`

**H2 (visible, anchor target):** `Portland Studio.`

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

---

### Section 2 — Portland Podcast Room (#podcast)

**Subhead:** `Portland Podcast Room.`

**H2 (visible, anchor target):** `Portland Podcast Room.`

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

`[Changed in v2: CTA now uses the global "Check availability →" pattern (same as studio rental and gear rental) instead of v1's "Book the room →" — keeps the rentals page consistent and routes everything to the same contact form.]`

---

### Section 3 — Portland Gear List (#gear) — NEW

**Subhead:** `Portland Gear List.`

**H2 (visible, anchor target):** `Portland Gear List.`

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

---

### Section — Good to know (sits below all three sections)

> `We book the studio by the day, with a two-day minimum on most productions. The podcast room books by the hour, with a two-hour minimum. If you're scouting, we'll walk you through in person or send a full virtual tour. Holds are first-come, first-served — a deposit secures the date.`

`[Survives from v1's Studio Rental "Good to know" — Liam didn't address this directly in R1 but it answers practical booking questions for both studio and podcast. Lightly edited to cover both rental types in one paragraph.]`

### [SEO] Rentals page metadata

- **Title:** `Studio, Podcast Room, and Gear Rentals — Photon Studio Portland`
- **Meta description:** `Rent Photon's 6,000 sq ft Portland production studio with cyclorama and 400 AMP power, the treated podcast room, or curated gear from our in-house list.`

`[Changed in v2: meta now reflects the consolidated single-page structure and three rental products. Studio sq ft updated to 6,000 to match Liam's R1 spec block.]`

`[Service schema (round 2 dev task): three discrete \`Service\` JSON-LD blocks emitted on this page, one per anchored section. Each block includes name, description, areaServed (Portland), provider (Photon Studio LLC). This is the AEO/LLM compensation for collapsing three URLs to one — covered in detail in the trade-off note at the top of this section.]`

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

## 11 — Dependencies & decisions resolved in round 1

This section was the open-question list at the end of v1. Liam's R1 feedback resolved most of it. What's left below are the items still open going into round 2 — much shorter than v1.

### Resolved in R1 (no action needed — fyi)

| #   | v1 question                                   | R1 resolution                                                                                                                                                             |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Confirm top-5 featured projects               | **Sounders Bruce Lee kit, Sorel high gear, Combat Cookies, Bare Republic, Neste.** Locked.                                                                                |
| 2   | Confirm studio specs                          | All specs provided — see /studio spec block (Total 6,000 sq ft / Cyclorama 44 × 38 / 400 AMP / 16 ft clear / Drive-in 14 × 12 / Genie GS-1930 / Address 726 SE 10th Ave). |
| 3   | Public contact details                        | hello@photon.studio in footer; chris@photon.studio on Contact direct line; liam@ for creative questions (handled via internal routing). No Facebook. No LinkedIn.         |
| 4   | Team list                                     | 7 crew confirmed — Liam Gillies, Chris Crary (heads); Em Gillies, Toni Crary, Austin Baker, Garrett Baker, Russel Bowen (support).                                        |
| 5   | "Anything factually wrong or off-voice?"      | Liam confirmed in DEPENDENCIES #5 — "CHecked." [sic]                                                                                                                      |
| 9   | Does "What we don't do" stay in Capabilities? | **Cut.** Liam: "No what we don't do."                                                                                                                                     |
| 13  | Sorel case study via Ryan?                    | Liam confirmed: "High gear" (Sorel high gear) is the lead Sorel project — already in the top-5.                                                                           |
| 14  | Client roster names                           | **Add:** Starbucks, Teavana, Triumph, Amazfit, Flexfit. **Remove:** BMW (spec project, not real engagement).                                                              |
| 15  | SGK / Nike name-drop                          | Liam: "Always ok to mention agencies by name." (The line itself was cut from /capabilities in the agency-section rewrite, but the principle holds for future copy.)       |
| 16  | Filters on Work page                          | **Approved.** Filters ship. Taxonomy locked at 10 categories (see §03).                                                                                                   |
| 17a | "Extension of your team" line                 | **Approved.** Folded in as optional secondary callout on /capabilities agency section.                                                                                    |
| 17b | Chris as public intake                        | **Approved.** Chris is the named public-facing intake on /contact.                                                                                                        |
| 17c | Downloadable studio spec sheet                | **Approved.** Moved to /rentals (audience-appropriate). Liam: "Super down to make one."                                                                                   |
| 18  | Rentals in nav                                | **Kept.** (Confirmed by Liam in earlier nav review.)                                                                                                                      |
| 19  | Relationship-length line on homepage          | **Kept** as a section. Liam flagged the v1 wording as garbled — three rephrase options provided in §02 for round 2 selection.                                             |

### Still open going into round 2

These are the only items that block round 2 sign-off.

| #   | Section                             | The ask                                                                                                                                                                                     |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| O1  | §02 Homepage relationship line      | **Pick one of the three rephrase options** (Option A, B, or C) — or rewrite. See §02 for the three drafts.                                                                                  |
| O2  | §06 Studio + §02 Homepage SEO       | **Sq ft figure — 5,000 or 6,000?** Liam's R1 has both: 6,000 in the Studio block, 5,000 in the homepage SEO meta. Confirm canonical figure for round 2 alignment.                           |
| O3  | §03 Work filter pills               | **Which categories clear the 4+ project threshold for launch?** Liam's R1 says under-4 categories shouldn't get pills at launch. Need a yes/no per category from the 10.                    |
| O4  | §03 Work — Music, Fashion, Art Dept | **Meta titles + descriptions** for these three categories — left blank in R1 feedback.                                                                                                      |
| O5  | §03 Work — Footwear, Studio         | **Meta description** for /work/footwear and /work/studio — left blank in R1 feedback.                                                                                                       |
| O6  | §08 Rentals — Podcast room mics     | **Mic model.** Liam in DEPENDENCIES #10: "Will gather more technical info for podcast room." Pending.                                                                                       |
| O7  | §04 Project descriptions            | **Per-project copy.** Liam linked a Google Sheet — content lift from sheet → CMS once schema is ready.                                                                                      |
| O8  | All                                 | **Studio + team photography.** Pending Liam's next studio visit (DEPENDENCIES #8).                                                                                                          |
| O9  | All                                 | **Real testimonials** for the 5 hero projects. Liam: "Will try to get a testimonial for all 5 key projects." (DEPENDENCIES #7)                                                              |
| O10 | All                                 | **Email setup decision.** See "Email setup" in the §00 Editorial notes block — recommended setup is hello@ (footer alias) → chris@ + liam@ via routing rule. Sign-off needed before launch. |

### Hand-off items for design / dev (not Liam decisions)

These are dev/design tasks created by the v2 changes. No action from Liam — flagging here so the team has a punch list.

| #   | Section                  | Task                                                                                                                                                    |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | §01 Footer               | Set up `hello@photon.studio` DNS forwarding to `chris@` + `liam@`. Confirm both inboxes receive a test send before launch.                              |
| D2  | §09 Contact form         | Server-side form routing to `chris@` + `liam@` (mirror the hello@ rule). Subject prefill rules per "What kind of project?" dropdown.                    |
| D3  | §08 Rentals              | Three `Service` JSON-LD blocks emitted on /rentals (one per anchored section). See §08 SEO block.                                                       |
| D4  | §08 Rentals              | 301 redirects: `/rentals/studio` → `/rentals#studio`, `/rentals/podcast` → `/rentals#podcast`. Set in `next.config.ts` redirects array.                 |
| D5  | §03 Work                 | 10 category routes (`/work/[slug]`) live in routing even when the pill is hidden — pill render is a "≥4 projects published" check, route always exists. |
| D6  | §06 Studio + §08 Rentals | Single shared content source in Sanity for the studio specs (so updates propagate to both pages without manual sync).                                   |
| D7  | §04 Project page         | Sanity field for "Photon handled" — multi-select tied to the Modules vocabulary used on /capabilities. Same vocabulary surfaces on every project page.  |
| D8  | §08 Rentals              | Two PDF assets — gear list + studio spec sheet. Liam to provide content; designer to lay out in Photon visual identity.                                 |

---

## 12 — Round-2 review checklist (only what's still open)

If you read nothing else, read this. Round 1 closed most of the open questions — the list below is only what's still blocking round 2 sign-off.

### Must-answer to unblock round 2

| #   | Section                       | The ask                                                                                                                                                                                                                                                                                                          | Why it blocks                                                                                                                                 |
| --- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | §02 Homepage                  | **Pick a relationship-length line.** Three options drafted (A / B / C) replacing the R1 "Ten projects in on some. Five years running on one. The relationships are the product." which Liam flagged as garbled. One-letter answer.                                                                               | It's the homepage's strongest proof point — needs to be locked before design.                                                                 |
| 2   | §02 Homepage / §06 Studio     | **Studio square footage — 5,000 or 6,000?** R1 has 5,000 in the homepage SEO meta and 6,000 in the Studio specs block. Draft currently uses 6,000 in §06 (canonical detail) and Liam-verbatim 5,000 in homepage meta. Pick one number for both surfaces.                                                         | LocalBusiness JSON-LD and the Studio H1 paragraph both reference this. Inconsistency hurts trust + SEO.                                       |
| 3   | §02 Homepage clients strip    | **Final client roster sign-off.** R1 added Starbucks, Teavana, Triumph, Amazfit, Flexfit and dropped BMW. Anything else to drop or add before the list goes public?                                                                                                                                              | Strip is the homepage's main trust signal. Once design ships, edits become CMS-only.                                                          |
| 4   | §05 Case study                | **Five testimonial pulls.** R1 #07: "Will try to get a testimonial for all 5 key projects." Confirm the 5 anchor projects are Sounders Bruce Lee kit, Sorel high gear, Combat Cookies, Bare Republic, Neste — and which contact owns each ask.                                                                   | Case study templates are testimonial-led. One real quote per project is the credibility shift.                                                |
| 5   | §06 Studio                    | **Studio + crew photography.** R1 #08: "Studio and team photography coming." Confirm shoot date so design can plan the hero, the spec block layout, and the seven crew portraits (two leads larger, five support smaller per R1 layout note).                                                                    | Studio page is photo-led. Without final assets, design ships with placeholders.                                                               |
| 6   | §08 Rentals → Podcast room    | **Additional podcast specs.** R1 #10: "Will gather more technical info for podcast room." Current draft uses Liam's verbatim line items (2 mics on shock mounts, 4 over-ear, raw + redundancy, optional Blackmagic 6K, raw WAV, two-hour minimum). Add mic model, headphone model, recording surface dimensions? | Podcast booking is a discrete revenue line. Producers compare specs row-for-row before booking.                                               |
| 7   | §08 Rentals → Gear list + PDF | **Two PDF assets.** R1 #17c: spec sheet for studio + Liam-curated gear list. Liam to provide content; we'll lay out in Photon visual identity. Confirm: who owns keeping each PDF current after launch, and do rental rates live on the spec sheet or stay quoted per-project?                                   | Both are referenced in §07 Capabilities and §08 Rentals as downloadable assets. Without final files, those CTAs link to placeholders at ship. |

### Soft — needed before launch, not before round 2

| #   | Section                 | The ask                                                                                                                                                                                                                           |
| --- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | §02 Homepage / §03 Work | **Per-project descriptions** (2–4 sentences each, Photon voice) for the homepage rotation and the Work grid. R1 #06 asked: should descriptions go straight into the CMS? Yes — but we still need a first batch from Liam to seed. |
| S2  | All surfaces            | **Email setup.** Three addresses recommended: `hello@photon.studio` (footer + contact), `chris@photon.studio` (Contact intake), `liam@photon.studio` (creative questions). Confirm aliases exist and any inbound routing rules.   |
| S3  | §05 Case study + others | **Pull-quote placement beyond case studies.** Once testimonials land, we should consider surfacing them on the homepage, above the contact form, and on Studio. Volume of real quotes drives where they go.                       |
| S4  | §01 footer              | **Legal pages.** Privacy / Terms / Cookies / Accessibility — do you have existing policy content, or should we draft placeholders for round 2?                                                                                    |

### Resolved in R1 (recap — see §11 Dependencies for the full table)

Liam's R1 closed 15 of the original 19 must-answer items. Highlights: filter taxonomy locked (10 categories, with launch pills only above 4 projects), Capabilities restructured (no "How we engage", no "What we don't do"), modular language de-repeated on Philosophy line, agency name-drops cleared, full crew list with space-themed titles confirmed, footer LinkedIn dropped, About narrowed to Studio + Crew, Rentals consolidated to one page with anchor jumps, contact form gets two new optional fields (deliverables list + project dates), motion-control de-emphasised in Work copy.

---

_Second draft — SALT Studio for Photon._
_Round 1 feedback applied (Liam Gillies, 04.16.26). Round 2 review pending._
