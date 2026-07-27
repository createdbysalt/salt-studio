# Photon — Website copy, first draft

**Prepared by:** SALT Studio
**For:** Liam, Photon
**Status:** First draft — ready for round 1 review
**Language:** English

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

### One contradiction you'll hit before anything else

Round-1 decision needed on the **public contact email**. The draft currently publishes `chris@photon.studio` on the footer, above the contact form, in the error state, and in the alternate-contact block. The codebase only has `chris@photon.studio` — there is no `hello@photon.studio` alias yet.

We need one answer: **`chris@photon.studio` or a new `hello@photon.studio` alias?**

- **`chris@`** — personal, direct, highest-trust signal for the agency producer the draft is trying to reach. Risk: if Chris is out, mail piles up; a hello@ alias forwards to multiple inboxes.
- **`hello@`** — team inbox, survives vacations, feels slightly less personal. Could forward to Chris by default.

We've assumed `chris@` throughout the draft so it's readable end-to-end. One word from you and we swap the variable in every location. This is the single decision that has to come back in round 1 — every other question can wait.

---

## 01 — System copy

Small, global, sets the tone on every page.

### Primary navigation (top, persistent)

- Work
- Capabilities
- Studio
- Rentals
- Archives
- Contact

`[Why Rentals is in the top nav: the Rentals hub, studio rental, and podcast rental pages are SEO-priority landing targets for agency producers and local creatives searching "Portland studio rental" or "podcast studio Portland." Without a top-nav link they have no global entry point, which hurts both conversion and crawl depth. Six links instead of five; still clean.]`

**Menu button on mobile / tablet:** `[ / ] MENU`

**Brand lockup:** `PHOTON / .STUDIO` (dot-matrix lockup, already in place in the prototype).

### Persistent bottom bar (homepage)

- Tagline (left): `Modular production for the future of content.`
- CTA (right): `Start a conversation →`

### CTA library — where each one lives

| CTA                       | Where it appears                                      | Intent                                                               |
| ------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------- |
| `Start a conversation →`  | Homepage, About, Capabilities, Rentals, Project pages | The main site CTA. Always routes to `/contact`.                      |
| `Extrapolate →`           | Homepage project info block, Work grid cards          | Opens the full project page. Replaces "Read more" per your feedback. |
| `Launch →`                | Contact form submit button                            | Space-theme framing for the send action.                             |
| `Mission briefing`        | Contact page headline                                 | Space-theme framing for the form itself.                             |
| `Signal acquired`         | Contact form success state                            | Confirmation after a successful submission.                          |
| `Signal lost`             | 404 page + contact form error state                   | The theme moment — doubles as honest error copy.                     |
| `Rent the studio →`       | Rentals hub, Studio rental footer                     | Routes to `/rentals/studio`.                                         |
| `Rent the podcast room →` | Rentals hub                                           | Routes to `/rentals/podcast`.                                        |
| `See the full case →`     | Work grid cards (case studies only)                   | Routes to the case study version of the project page.                |

### Footer (minimal — low friction to conversation)

Left column:

```
Photon Studio
726 SE 10th Ave, Portland, OR 97214
chris@photon.studio                 [see top-of-doc flag: chris@ or hello@?]
```

Right column:

```
Instagram   →   @photonportland
Vimeo       →   vimeo.com/photonportland
Facebook    →   facebook.com/Photon-297686637334584
LinkedIn    →   [TBC: Liam — do you want a LinkedIn link? none in the codebase]
```

**Note:** Per the strategy doc, we're intentionally not publishing a phone number — the contact form is the single path in. Flag if you want that to change.

Bottom strip:

```
© Photon Studio 2026 · Built with SALT Studio · Privacy · Terms · Cookies · Accessibility
```

`[Why four legal links instead of one: enterprise buyers at Nike/BMW/Capital One run vendor-compliance checks before onboarding. A footer with only "Privacy" is a minor trust ding on those checks. Placeholders are fine for round 1 — the actual policy content can be filled in before launch.]`

---

## 02 — Homepage

The homepage is mostly visual. Five projects rotate full-screen; copy lives in four spots.

### Tagline (bottom bar, persistent)

> `Modular production for the future of content.`

This is the line we're keeping. It's specific, it positions Photon in one breath, and you confirmed it in the proposal.

### Philosophy line (delayed reveal, or inline with the project info block)

> `A modular production studio. Think of us as mission control for your visual content.`

### Client roster strip (persistent or delayed reveal — mono, quiet, full-width)

A typewriter-style line of client names, set small in mono. No logos (permissioning headache, and it reads more performatively than Photon's voice). Just a proud list that does two jobs: confirms tier for the VP who's never heard of Photon before, and earns the rest of the page the right to be minimal.

> `SELECTED CLIENTS — Nike · Adidas · BMW · Google Pixel · Capital One · Sorel · Oura · Hyperice · Jordan · Vans · Under Armour · Seattle Sounders · Portland Thorns · Portland Timbers · JBL · Taylor Farms · Wildfang · GQ`

**Relationship proof line (small mono, set directly below the client strip):**

> `Ten projects in on some. Five years running on one. The relationships are the product.`

`[Why this line is on the homepage: our peer-studio research found that zero competitors surface client retention this way — everyone lists logos or project titles, nobody says "how long." This is Photon's single strongest trust signal for the first-time VP visitor from a Nike/Sorel/Oura-tier brand, and right now it only lives on the About page. Surfacing a compressed version here earns the rest of the homepage's minimalism — the VP doesn't have to click through to About to find the reassurance that makes the minimalism feel confident rather than thin.]`

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

- **Title:** `Photon — Modular Production Studio, Portland`
- **Meta description:** `A Portland production studio for brands and agencies. Commercial video, stills, high-speed, motion control, and a 5,000 sq ft studio with cyclorama.` (150 chars)
- **H1 (visually hidden for SEO):** `Photon Studio — Commercial Video Production in Portland, Oregon`

---

## 03 — Work (index)

Full-bleed grid with a single horizontal row of filter pills above it. Filters are **URL routes**, not JavaScript toggles — each category is its own page with its own metadata, H1, and intro line. See dependency #14 for the reasoning (we're reversing the original "no filters" preference for ICP + SEO reasons).

### Page header (the unfiltered `/work` view)

**Label:** `01 — Selected work`

**H1:** `Every project, one grid.`

**Subhead:** `Sorted by recency. Filter by sector or specialty — or scroll the whole thing.`

### Filter bar (above the grid, persistent on all `/work/*` routes)

A single row of mono-text pills. Active pill is filled; inactive pills are outlined. On mobile, the row scrolls horizontally. Each pill is a real link (`<a href>`), not a JS onClick.

**Label above pills:** `Filter —`

**Pills (in this order):**

```
ALL  /  SPORT  /  TECH & WEARABLES  /  FOOTWEAR  /  FOOD & BEVERAGE  /  HIGH-SPEED  /  MOTION CONTROL  /  STUDIO
```

> Routing: `ALL` → `/work`. Every other pill → `/work/[slug]` (e.g. `/work/sport`, `/work/high-speed`). Seven categories at launch, plus `ALL`. Labels are suggestions — Liam to finalize naming and order in round 1.

`[Why seven, not nine: we originally drafted copy for nine categories including Auto & Finance (BMW, Capital One) and Fashion (Wildfang, Woolrich, GQ). Neither cleared the 4-project threshold we set for "dedicated URL worth it" — two clients isn't a category, it's a coincidence. Both are dropped from the filter bar and category-route structure at launch. **The projects still exist and still appear in the main unfiltered `/work`grid** — they just don't get their own landing page until the grid supports it. The Sanity schema still has`auto-finance`and`fashion` as taggable categories so nothing is lost at the data layer. If either vertical grows past four projects post-launch, we add the pill and the route back in a 20-minute change.]`

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

- **Title:** `Work — Photon Studio Portland`
- **Meta description:** `Selected commercial video and photography work from Photon — a Portland production studio working with brands and agencies across sport, lifestyle, beauty, and motion.` (167 chars)

---

### Category landing pages (`/work/[category]`)

Each category route reuses the same grid + filter bar shell but gets its own H1, intro line, and metadata. This is what makes the filters work for SEO and AEO — every specialty is a real indexable URL with its own copy for Google and LLM crawlers to cite.

Copy for each category below. Pattern: **Label → H1 → Subhead → Meta title → Meta description.** Grid below is filtered to projects tagged with that category.

`[Note on labels: all category names below (Sport, Tech & Wearables, Footwear, etc.) and the numbering (01.1, 01.2...) are suggestions. Liam to finalize the taxonomy in round 1 — rename, reorder, merge, or split any of them. Once names are locked, the Sanity schema options update to match in a five-minute change.]`

#### `/work/sport`

**Label:** `01.1 — Sport`
**H1:** `Work for teams, brands, and the people who wear them.`
**Subhead:** `Kit reveals, on-field films, athlete stories. Made with Nike, the Sounders, and the brands behind half the kits in the stadium.`
**Meta title:** `Sport commercial production — Photon Studio Portland`
**Meta description:** `Commercial video for sport brands and teams. Kit films, athlete stories, and campaign work produced in Photon's Portland studio with Nike, Adidas, the Sounders, and more.` (169 chars)

#### `/work/tech`

**Label:** `01.2 — Tech & Wearables`
**H1:** `Small products. Big tables. Controlled light.`
**Subhead:** `Consumer tech and wearables work for Google Pixel, Oura, Hyperice, JBL — product films, launch campaigns, and tabletop that makes a 40-gram ring feel like a flagship.`
**Meta title:** `Tech & wearables commercial production — Photon Studio Portland`
**Meta description:** `Product films and launch campaigns for consumer tech and wearables. Pixel, Oura, Hyperice, JBL. Produced in Photon's Portland studio with in-house creative, production, and post.` (177 chars)

#### `/work/footwear`

**Label:** `01.3 — Footwear`
**H1:** `Footwear that earns the weather.`
**Subhead:** `Campaigns where the boot, the conditions, and the craft all have to land in the same frame. Sorel, Vans, and more.`
**Meta title:** `Footwear commercial production — Photon Studio Portland`
**Meta description:** `Footwear campaign production in Portland. Director-led work for Sorel, Vans, and other performance and lifestyle brands. Creative, production, and post under one roof.` (166 chars)

#### `/work/food-beverage`

**Label:** `01.4 — Food & Beverage`
**H1:** `Pour, steam, sizzle, cut.`
**Subhead:** `Food and beverage films that hold up under a loupe. Taylor Farms, La Marzocco, Tea Bar, Green Valley Creamery — tabletop, motion control, and high-speed on our 5,000 sq ft stage.`
**Meta title:** `Food & beverage commercial production — Photon Studio Portland`
**Meta description:** `Food and beverage commercial production in Portland. Tabletop, motion control, and high-speed work for brands like Taylor Farms, La Marzocco, and Tea Bar.` (154 chars)

#### `/work/high-speed`

**Label:** `01.5 — High-speed`
**H1:** `1,000+ frames per second, in-house.`
**Subhead:** `High-speed cinematography is one of the things we're known for. Phantom Flex, Phantom VEO — table-top, product, fluid, athletic. Shot and finished on the same floor.`
**Meta title:** `High-speed cinematography Portland — Photon Studio`
**Meta description:** `High-speed cinematography in Portland. Phantom Flex and VEO in-house on a 5,000 sq ft stage. Tabletop, product, fluid, and athletic work at 1,000+ FPS — shot and finished by the same team.` (187 chars)

#### `/work/motion-control`

**Label:** `01.6 — Motion control`
**H1:** `Repeatable moves. Frame-accurate every time.`
**Subhead:** `Motion-control rigs on our stage for product reveals, tabletop, and any shot that has to match across takes. Programmed by the same team that shoots, grades, and delivers it.`
**Meta title:** `Motion control cinematography Portland — Photon Studio`
**Meta description:** `Motion control cinematography in Portland. In-house rigs, repeatable moves, and frame-accurate product, tabletop, and beauty work — all delivered under one roof.` (160 chars)

#### `/work/studio`

**Label:** `01.7 — Studio / Cyclorama`
**H1:** `Built on our floor.`
**Subhead:** `Work shot on our 5,000 sq ft Portland stage and cyclorama. Talent, product, set build, and full creative control from the first brief to final delivery.`
**Meta title:** `Portland studio cyclorama production — Photon Studio`
**Meta description:** `Commercial work shot on Photon's 5,000 sq ft Portland stage and cyclorama. Talent, product, and set build with creative, production, and post in the same building.` (162 chars)

---

## 04 — Project page (standard template)

The template for most projects on the site. You and the team fill in per-project content through the CMS; the structure and placeholder labels below are what the Sanity entry form will guide.

### Structure

1. **Hero** — full-bleed video or cover image, project title overlaid.
2. **Meta strip** — client, year, category tags, credits.
3. **Context** — 2–4 sentences on the brief and what was interesting.
4. **Craft callout** — optional camera / lens / light / frame-rate block.
5. **Gallery** — stills and additional frames.
6. **BTS** — optional section with behind-the-scenes photos and a short note.
7. **Related projects** — three recent or related entries.
8. **CTA** — `Start a conversation →`

### Worked example using Sorel high gear (tentative featured project)

**Hero title:** `Sorel High Gear`

**Meta strip:**

- Client: `Sorel`
- Year: `/26`
- Category: `Campaign · Product · Lifestyle`
- Credits: `Direction — Photon. DP — [name]. Production — Photon.`

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

## 06 — About / Studio

This page does one job: convince the visitor that they want to work with Photon as people, not just as a vendor. Warm, direct, personal. Where the brand personality can breathe.

### Hero

**Label:** `02 — The studio`

**H1:** `Few hands, light work.`

**Lead paragraph:**

> `Photon is six people in a 5,000 square-foot studio in Portland, Oregon. We're a modular production company — small by design, scaling by plugging specialty teams in only when the work calls for them. Built to move at the speed of content without the coordination tax of a full agency.`

**Founder anchor (new — placeholder, Liam to confirm context):**

> `[TBC: Liam — who founded Photon, and in what year? We don't want to guess. If you and Chris founded it together, we'll say so; if it's a longer story, give us the one-line version. Example we'd drop in: "Founded in [year] by Liam Gillies and Chris [last name]. Six people, one roof, one time zone."]`

**Secondary paragraph (relationship proof — this is the trust signal for buyers who have never heard of Photon before):**

> `Some of these relationships are ten projects in. One's five years running. We build the kind of production partnership that gets better with every shoot, not worse — because the same people who pitched you the treatment are the ones on set, in the grade, and on the call when something needs to move.`

### Section — Why modular

**Subhead:** `A different production math.`

> `Most studios scale by adding people. We scale by adding modules — small, specialized teams that plug into a shoot when the work calls for them and go quiet when it doesn't. Overhead stays low, speed stays high, and quality stays relentless. The right hands, in the right room, at the right time.`

**Featured pull quote:**

> `"Creating like children, editing like scientists."`

### Section — How we work

**Subhead:** `Creative → Production → Post.`

> `We work direct with brands and alongside agencies when the project calls for it. Creative briefs turn into shot lists in days, not weeks. Shots turn into stills, motion, and BTS in one pass through the studio. Post happens in-house, next door to the cameras.`

> `That means the person shading your hero frame was in the room when you shot it. It means reshoots are an hour, not a month. It means your director, your gaffer, your colorist, and your editor all share the same phone number.`

### Section — Where we work

**Subhead:** `Portland, and wherever the shoot asks us to be.`

> `We're based in Portland. Most of our clients aren't. Some fly in for the studio — the cyclorama, the power, the quiet, the drive-in door. Some fly us out to their location, their factory, their mountain, their coast. We've produced for brands on both US coasts and across the Atlantic through our Lisbon satellite. Portland is where the work is built. It's not a limit on where it ships.`

### Section — The crew

**Subhead:** `The crew.`

**Format:** grid of team portraits with names and space-themed titles. No bios unless you want them later.

```
[PHOTO]                [PHOTO]                [PHOTO]
[NAME]                 LIAM GILLIES           [NAME]
Mission Control        Orbital Mechanic       Chief Photometrics

[PHOTO]                [PHOTO]                [PHOTO]
[NAME]                 [NAME]                 [NAME]
[Title]                [Title]                [Title]
```

`[TBC: Liam — full team list, titles, and portrait shoot on your next studio visit.]`

### CTA

**Subhead:** `Want to talk shop?`
**CTA:** `Start a conversation →`

### [SEO] About metadata

- **Title:** `About Photon — A Modular Production Studio in Portland`
- **Meta description:** `Meet Photon: six people, one 5,000 sq ft Portland studio, and a modular production system built for brands that ship content fast.` (131 chars)

---

## 07 — Capabilities

The biggest page on the site. Your deck translated into a web experience, restructured from internal departments (Motion, Lighting, Effects, Post) into client-facing phases (Creative → Production → Post). The modular concept leads. Technical inventory lives inside each phase as scannable detail.

### Hero

**Label:** `03 — Capabilities`

**H1:** `Modular production, end to end.`

**Lead paragraph:**

> `A giant network distilled into specialty teams, with one mission: maximize resources and elevate what's possible. Create once. Launch everywhere.`

**Why-modular callout (the blunt version — lives directly below the lead):**

> `Most production math scales by adding people. Ours scales by adding modules — so you get six people who know your brief, not forty people who've never read it.`

**Secondary line:**

> `Every module below is something we can run on its own or roll into a full production. Pick the ones you need. We'll bring the rest.`

### Section — We're known for

The specialty capabilities, surfaced at the top of the page for scannability. An agency EP searching for "high-speed cinematography Portland" or "motion control production studio" lands here and gets their answer in 15 seconds. A brand lead reads it as a proud, plain list.

**Subhead:** `We're known for.`

```
High-speed cinematography, up to 1000 fps.         [TBC]
Motion control and robotic camera moves.
A permanent seamless cyclorama, 400 AMP power.     [TBC]
In-studio weather rigs — rain, snow, wind.
Full in-house post, next door to the cameras.
Cross-continent production between Portland and Lisbon.
```

> `Everything else lives below.`

**Download CTA (small, mono, directly under the list):**

> `[Download the spec sheet (PDF) →](/photon-spec-sheet.pdf)`

`[Why this PDF: zero peer studios we surveyed (Stept, 1stAveMachine, Hungry Man, Park Pictures, Biscuit, Buck, Stink, Iconoclast) offer a downloadable spec sheet. Agency producers share docs like this internally with their DP before ever emailing a studio — it's a pre-qualifying tool disguised as a convenience. One page: 5,000 sq ft dimensions, ceiling height, cyc specs, 400 AMP power, drive-in dimensions, high-speed frame rates (Phantom Flex / VEO), motion-control rig specs, rental rates if we choose to publish them. Someone has to keep it current — worth it. Round 1 decision: who owns the PDF, and do we ship with rental rates on it or off it?]`

### Section — Creative

**Subhead:** `Creative.`
**Intro line:** `Where the brief becomes a shot.`

> `Treatment development, storyboarding, shot lists, look development. Every shoot starts with the team that will shoot it — no handoff between the room that pitched the idea and the set that executes it.`

**Module list:**

- Concept and treatment
- Storyboarding and shot design
- Look development and lighting diagrams
- Art direction and set design
- Pre-vis and location scouting

### Section — Production

**Subhead:** `Production.`
**Intro line:** `Where we earn the shoot.`

> `Full crew, full kit, full studio. Stills, motion, product, food, lifestyle, sport, and whatever new format a brand is testing next. Nothing on this list is outsourced — it all happens under our roof, with our people.`

**Capture:**

- Commercial video (8K / 6K / 4K)
- Commercial stills
- High-speed cinematography up to 1000 fps `[TBC]`
- Motion control rigs
- Anamorphic and split-diopter work
- Macro and product photography
- Food and beverage photography

**On-set technical:**

- Astera lighting systems
- Practical and pyrotechnic effects `[TBC]`
- In-studio weather rigs — rain, snow, wind
- 400 AMP, 3-phase power `[TBC]`
- 5,000 sq ft of flexible shoot space
- Permanent seamless cyclorama `[TBC: dimensions]`

### Section — Post

**Subhead:** `Post.`
**Intro line:** `Where it becomes what you ship.`

> `Edit, color, finishing, motion graphics, sound design. All in-house, next door to the cameras. No shipping hard drives across town. No "the colorist is booked until next month." When a reshoot is faster than a revision, we'll tell you.`

**Module list:**

- Edit and offline
- Color grade
- Finishing and VFX cleanup
- Motion graphics and title design
- Sound design and audio mixing (in our dedicated audio room)
- Retouching

### Section — How we engage

**Subhead:** `Three ways in.`

> `We engage three ways: full production — Creative through Production through Post; a specific capability on its own, like a cyc day, a high-speed session, or a grade-only pass; or as a plugged-in specialty team inside your existing production. No minimums on the first two. Day rates quoted per project.`

`[Why this section exists (optional — flag if you'd rather leave it out): the modular positioning promises flexibility throughout the site, but nowhere does the draft tell an agency producer what "modular" actually means in commitment terms. Can they book just the cyc day? Just the grade? Is there a minimum? This three-line block answers those questions without publishing rates (per the peer research — nobody publishes rates). It's the bridge from "modular is a philosophy" to "modular is something I can actually buy." If this feels like too much specificity, cut it and we'll lean on the "Pick the ones you need. We'll bring the rest." line in the hero to carry the same promise.]`

### Section — How we work with agencies and brands

**Subhead:** `Direct, or alongside.`

**Opening line (the new crisp one):**

> `We work as an extension of your team, not in place of it.`

> `Most of our work comes direct from brands. A growing share comes through agency producers who bring us in for a specific capability — high-speed, cyclorama, motion control — or for the whole shoot with their own creative direction. Either way works.`

> `If you're an agency EP bringing us in, the client relationship stays yours. We take the brief from you, ship call sheets and status on your cadence, and don't cold-email your client after we wrap. We've run this play with SGK on Nike. It works.`

> `If you're an agency producer checking specs, everything you need is on [Studio Rental →](/rentals/studio). If you're a brand lead comparing studios, [start a conversation →](/contact).`

`[Why this line: three peer studios — Stept, Stink, Buck — use a variant of "extension of your team" as the single crispest psychological bridge for agency producers (ICP 2). Our current agency-reassurance paragraph does the same work in 80 words; this line does it in 10, up front, where a skimming EP will actually read it. Zero-cost steal from the closest analog in the category (Stept). See peer research brief for verbatim sources.]`

### Section — What we don't do

**Subhead:** `A short list, in the interest of honesty.`

> `We don't do long-form broadcast episodic, scripted features, documentary features, or traditional ad-agency strategy work. We're not a post house. We're not a content farm. If what you need is on that list, we'll tell you — and we can usually recommend someone better suited.`

`[Optional section — flag if you'd rather leave it out. We think it's a trust signal, but some studios skip it.]`

### CTA

**Subhead:** `Need a specific capability on a specific date?`
**CTA:** `Start a conversation →`

### [SEO] Capabilities metadata

- **Title:** `Capabilities — Commercial Video, High-Speed, Motion Control | Photon Studio`
- **Meta description:** `Photon's full capability inventory: commercial video and stills, high-speed cinematography, motion control, in-studio weather, and a 5,000 sq ft Portland studio.` (158 chars)

---

## 08 — Rentals (hub)

Short page. Two routes out.

### Hero

**Label:** `04 — Rentals`

**H1:** `Rent the studio. Bring your crew.`

**Lead paragraph:**

> `You don't always need a full production partner. Sometimes you just need the right space — cyclorama, power, quiet, and a loading dock big enough to swallow a grip truck. We rent two rooms for that.`

### Two cards

**Card 1 — Studio rental**

- Title: `The 5,000 sq ft studio`
- Line: `Permanent cyclorama, 400 AMP power, drive-in loading, lighting and grip available.`
- CTA: `Rent the studio →`

**Card 2 — Podcast rental**

- Title: `The audio room`
- Line: `Treated podcast / VO / Foley recording room. Two mics, one operator, no bleed.`
- CTA: `Rent the podcast room →`

### Footer line

> `Not sure which fits? [Start a conversation →](/contact) and we'll route you.`

### [SEO] Rentals hub metadata

- **Title:** `Studio Rentals — Production & Podcast | Photon Studio Portland`
- **Meta description:** `Rent Photon's 5,000 sq ft Portland production studio or our treated audio room for podcast, VO, and Foley. Cyclorama, 400 AMP, loading dock, crew add-ons.` (153 chars)

---

## 09 — Studio rental

SEO priority page. Reads practical and specs-forward — an agency producer in a hurry is the primary reader.

### Hero

**Label:** `04.1 — Studio rental`

**H1:** `5,000 square feet, built for production.`

**Lead paragraph:**

> `A permanent cyclorama, 400 AMP power, drive-in loading, blackout capability, and enough grip inventory to lock a set down in an afternoon. Rent it bare or add a Photon crew for any part of the day.`

### Specs block (the page's most-read section)

| Spec           | Value                                                             |
| -------------- | ----------------------------------------------------------------- |
| Total space    | `5,000 sq ft`                                                     |
| Cyclorama      | `[TBC: dimensions] — permanent, seamless`                         |
| Power          | `400 AMP, 3-phase` `[TBC]`                                        |
| Ceiling height | `[TBC: ft clear]`                                                 |
| Loading        | `Drive-in roll-up door, [TBC: height × width]`                    |
| Grip package   | `Available — priced per shoot day`                                |
| Lighting       | `House Astera + ARRI kit; additional rental inventory on request` |
| Crew           | `Optional Photon crew add-on — DP, gaffer, grips, AC`             |
| Blackout       | `Full blackout — no windows, no bleed`                            |
| Parking        | `[TBC: # of spots, location]`                                     |
| Address        | `726 SE 10th Ave, Portland, OR 97214`                             |

### Section — What's included

> `Every rental comes with the studio essentials: cyclorama prep between setups, basic grip stand inventory, studio power, climate control, wifi, green room with kitchen, and a production office.`

### Section — What's extra

> `Camera packages, lighting packages beyond the house kit, specialty rigs (motion control, high-speed, anamorphics), on-set Photon crew, catering, and art-department labor are all available on request — priced per shoot day.`

### Section — Good to know

> `We book by the day, with a two-day minimum on most productions. If you're scouting, we'll walk you through in person or send a full virtual tour. Holds are first-come, first-served — a deposit secures the date.`

### CTA block

**Headline:** `Ready to book?`
**CTA:** `Check availability →` (routes to `/contact` with the rental subject prefilled)

### [SEO] Studio rental metadata

- **Title:** `Studio Rental Portland — 5,000 sq ft with Cyclorama | Photon`
- **Meta description:** `Rent Photon's 5,000 sq ft Portland production studio: permanent cyclorama, 400 AMP power, drive-in loading, blackout, grip and lighting packages, optional crew.` (160 chars)

---

## 10 — Podcast rental

Separate page for separate SEO and separate audience.

### Hero

**Label:** `04.2 — Podcast rental`

**H1:** `A quiet room for loud ideas.`

**Lead paragraph:**

> `A fully treated audio room for podcast recording, voice-over sessions, Foley, and brand audio. Two-mic setup, engineer optional, bleed impossible.`

### Specs block

| Spec          | Value                                   |
| ------------- | --------------------------------------- |
| Room type     | `Acoustically treated recording booth`  |
| Mic setup     | `2 × [TBC: mic model] on shock mounts`  |
| Headphones    | `[TBC: brand / model] — up to 4 guests` |
| Recording     | `[TBC: DAW, sample rate]`               |
| Engineer      | `Optional on-site engineer add-on`      |
| Video capture | `Optional 4K multi-cam podcast video`   |
| Delivery      | `[TBC: raw WAV / edited MP3 / stems]`   |
| Booking       | `By the hour — two-hour minimum`        |

### Section — Who it's for

> `Podcasters recording a weekly episode. Brand audio teams cutting launch spots. VO directors on deadline. Foley artists who need a quiet room that isn't their closet.`

### Section — What's included

> `The room, the mics, the headphones, the engineer if you want one, and the kind of silence most home studios can't buy. Bring your guests. We'll bring the coffee.`

### CTA

**CTA:** `Book the room →`

### [SEO] Podcast rental metadata

- **Title:** `Podcast Studio Rental Portland — VO & Foley | Photon Studio`
- **Meta description:** `Book Photon's treated audio room in Portland for podcast recording, VO sessions, Foley, and brand audio. Two-mic setup, optional engineer, 4K video capture.` (157 chars)

---

## 11 — Archives

Loose, BTS-leaning, personal. Where the "Pitch Me Harder" energy lives. Storytelling-forward, voice unrestricted.

### Hero

**Label:** `05 — Archives`

**H1:** `BTS, outtakes, and the stuff that didn't make the edit.`

**Lead paragraph:**

> `The Archives are the honest half of the studio — process, personality, the moment right before someone yelled action. If the Work page is the final cut, this is the dailies.`

### Intro tagline (small mono, under the lead)

> `Pitch me harder. — Archives motto, mostly serious.`

### Content types

Visual grid, mixed media. Curated over time. Posts rather than pages, with short captions. The CMS schema already supports it.

**Per-post template:**

- Cover media (photo or short loop)
- Title (short, punchy)
- Caption (1–3 sentences, voice unrestricted — this is where the personality lives)
- Optional tags: `Set`, `Kit`, `Crew`, `Unused`, `Lesson learned`

**Example post (to set the voice):**

> **The rain rig that almost drowned a DP.**
> `We built a three-story rain rig for a beauty spot. It worked. It also rained inside the camera housing for six seconds. Insurance was fine. The DP was not.`

### Empty state

> `Nothing in the archive yet. Check back — we stash new things in here whenever a shoot wraps.`

### [SEO] Archives metadata

- **Title:** `Archives — BTS, Outtakes & Studio Notes | Photon`
- **Meta description:** `Behind the scenes from Photon: rigs, experiments, lessons learned, and the half-finished ideas that keep a production studio honest.` (134 chars)

---

## 12 — Contact

Minimal. No friction. You flagged this explicitly — low friction to conversation is the goal.

### Hero

**Label:** `06 — Contact`

**H1:** `Mission briefing.`

**Lead paragraph:**

> `Tell us what you're making. We'll tell you if we're the right studio to make it with you — and who to call if we're not.`

### Direct contact (new — sits above the form, styled small but prominent)

> `Rather skip the form? Email Chris directly — [chris@photon.studio](mailto:chris@photon.studio). He answers same day, usually same hour.`

`[Why this line is here: every peer studio we reached (Stept, 1stAveMachine, Hungry Man, Park Pictures, Buck, Stink, Iconoclast) surfaces a direct email or named contact, and several have no web form at all. Our 7-field form is higher-friction than the category norm — which is fine for intake quality, but risks losing the agency producer with a Friday RFP who won't fill out a dropdown at 6pm Thursday. Surfacing Chris's direct email above the form gives that EP an escape hatch without sacrificing the structured intake for everyone else. Trade-off: some leads that should've been form submissions will come in as emails. Chris can link the form in the reply.]`

### Form fields

- `Your name *`
- `Your email *`
- `Your company` (optional)
- `What kind of project?` (optional dropdown): `Brand campaign`, `Product launch`, `Case study / film`, `Studio rental`, `Podcast session`, `Something else`, `Not sure yet`
- `What are you working on? *` (textarea)
- `Budget range` (optional dropdown): `Under $25k`, `$25k–$75k`, `$75k–$150k`, `$150k+`, `Rather not say yet`
- `Timeline` (optional dropdown): `This month`, `Next three months`, `Later this year`, `Flexible`
- `How did you hear about us?` (optional dropdown): `Referral`, `Search`, `Instagram or Vimeo`, `Event or press`, `Something else`

**Submit button:** `Launch →`

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

`[Email housekeeping: we removed the separate "hello@photon.studio" reference that was in this block earlier. The draft had contradicting email addresses — chris@ above the form, hello@ below and in error state — and hello@ doesn't exist yet in the codebase. Everything now uses chris@. If Liam wants a hello@ alias as the public inbox instead, we'll swap one variable and it propagates everywhere. See top-of-doc flag list.]`

### [SEO] Contact metadata

- **Title:** `Contact Photon — Start a Conversation | Portland Production Studio`
- **Meta description:** `Get in touch with Photon, a Portland production studio. Brand campaigns, case studies, studio rentals, and podcast sessions. One-business-day reply.` (148 chars)

---

## 13 — 404 / Signal Lost

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

## 14 — Dependencies & decisions we need from you

Grouped by urgency, so you know what to chase first.

### Blocking — needed in round 1

1. Confirm the top-5 featured projects. Tentative: **Sounders Bruce Lee kit, Sorel high gear, Combat Cookies, Bare Republic, Neste.**
2. Confirm studio specs for the Rentals pages: cyclorama dimensions, ceiling height, loading door size, parking, public address.
3. Confirm public contact details: is `chris@photon.studio` the right inbox to publish, or do you want a `hello@` alias? Do you want a LinkedIn link (we have IG, Vimeo, Facebook from discovery)?
4. Confirm the team list for the About page — names plus space-themed titles.
5. Flag anything in this draft that's factually wrong or off-voice.

### Soft — needed before launch, not before round 1

6. Per-project descriptions (2–4 sentences each, Photon voice) for the Work grid.
7. At least one real client testimonial for the first case study. Sounders if possible; Sorel as the fallback, via Ryan.
8. Studio + team photography from your next studio visit.
9. Decision: does the "What we don't do" section stay in Capabilities?
10. Podcast room specs — mic model, DAW, headphones, delivery format.

### Open questions for the team

11. Do you want budget range and timeline fields in the contact form, or keep it to name / email / message only?
12. Any line in the Capabilities "What we don't do" list that would accidentally close the door on work you actually want?
13. Is there a specific Sorel case study coming from Ryan we should build the first case study template around?
14. **Selected-clients strip** — we added a full-width mono strip listing clients on the homepage. Any names on that list you'd rather not publish? Any missing? The current list: Nike, Adidas, BMW, Google Pixel, Capital One, Sorel, Oura, Hyperice, Jordan, Vans, Under Armour, Seattle Sounders, Portland Thorns, Portland Timbers, JBL, Taylor Farms, Wildfang, GQ.
15. **SGK / Nike name-drop** — the agency-relationship paragraph on Capabilities references SGK on Nike by name as proof of how we operate inside an agency structure. Confirm that's OK to publish, or give us a version you'd prefer (e.g., "a major sports brand through their lead agency").

16. **Reversing "no filters" on the Work page.** Your original preference was a single unfiltered grid. We're recommending we reverse that and ship URL-routed category filters (`/work/sport`, `/work/high-speed`, etc.) at launch. Three reasons:
    - **ICP research says so — twice.** The brand-side decision-maker profile (Nike/Sorel/Oura-tier buyers) explicitly says logos and project grids should be _"organized by vertical to help buyers find their industry peers."_ The agency-producer profile says _"Photon's specialty capabilities must be searchable and easy to evaluate."_ Both of our two target audiences are explicitly better served by filters than by one long grid.
    - **SEO / AEO — every category is a real indexable URL.** A search like _"high-speed cinematography Portland"_ or _"motion control commercial studio Oregon"_ can land on `/work/high-speed`, not on a JavaScript tab inside `/work`. Google can crawl it, Perplexity and ChatGPT can cite it, and the meta description for each category gets to actually speak to the searcher's intent. A single-page grid with JS filters is invisible to all of that.

    **Trade-off to confirm:** we only want to create dedicated `/work/[category]` routes for categories that have 4+ projects at launch — thin categories look weak and hurt SEO. Our tentative nine (Sport, Tech & Wearables, Footwear, Food & Beverage, Auto & Finance, Fashion, High-Speed, Motion Control, Studio) is what we'd _like_ to ship. Please flag any that won't hit four projects by launch, and we'll drop those from the filter bar until the grid fills out.

    Sign-off needed: **"Yes, ship filters"** or **"No, keep it one grid."**

17. **Three moves layered in from peer-studio research.** We audited seven live competitor sites (Stept, 1stAveMachine, Hungry Man, Park Pictures, Biscuit, Buck, Stink, Iconoclast). The top-line finding: **Photon's current draft beats the peer set on 6 of 7 dimensions.** This is a layering exercise, not a rewrite. Three specific moves from the research are now in the draft — each needs a quick sign-off:

    **(a) "We work as an extension of your team, not in place of it."** — added as the opening line of the agency-relationship section on Capabilities (§07). Three peers (Stept, Stink, Buck) use a variant of this line as the crispest psychological bridge for agency producers. Our existing agency-reassurance paragraph says the same thing in 80 words; this line does it in 10, up front. **Sign-off:** keep, cut, or reword.

    **(b) "Or email Chris directly — chris@photon.studio"** — added above the contact form (§12). Every peer studio we reached surfaces a direct email; most have no form at all. Our 7-field form is higher-friction than category norm — fine for intake quality, risky for the Friday-RFP agency producer. The direct-email line is an escape hatch that preserves the form for everyone else. **Sign-off:** confirm `chris@photon.studio` is the right inbox, and confirm Chris is OK being the public face of intake.

    **(c) Downloadable spec sheet PDF** — added under the "We're known for" block on Capabilities (§07). **Zero** peer studios in our set offer this. Agency producers share docs like this internally with their DP before ever emailing a studio — it's a pre-qualifying tool disguised as a convenience. One page, mono layout, matches the rest of the site: dimensions, ceiling height, cyc specs, 400 AMP power, drive-in dimensions, high-speed frame rates (Phantom Flex / VEO), motion-control rig specs. **Sign-off:** (1) who owns keeping the PDF current, and (2) do we publish rental rates on it or keep those quoted per-project?

    Full research findings, verbatim peer quotes, and the three moves we _didn't_ apply (Directors page, founder-year anchor, aggressive form cut) are in the brief linked above. Happy to walk through any of them.

---

## 15 — Round-1 review checklist (everything flagged, in one place)

If you read nothing else, read this. Every `[TBC]`, `[PLACEHOLDER]`, and round-1 decision consolidated into one scannable list so you don't have to hunt through fifteen sections to find the asks.

### Must-answer to unblock round 2

| #   | Section                                  | The ask                                                                                                                                                                                                     | Why it blocks                                                                                                                                                                                                                                           |
| --- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | §00, §01 footer, §12 Contact             | **Public email — `chris@photon.studio` or a new `hello@` alias?**                                                                                                                                           | This is the only contradiction in the draft. Draft currently assumes `chris@` everywhere. One-word answer from you and we swap the variable globally.                                                                                                   |
| 2   | §02 Homepage, §14 #14                    | **Selected-clients strip approval.** Any names on the 18-name list you'd rather not publish? Any missing?                                                                                                   | The strip is the homepage's main trust signal and replaces a traditional logo grid. Has to be publishable as-is.                                                                                                                                        |
| 3   | §05 Case study, §14 #7                   | **One real client testimonial for the first case study** — Sounders if possible, Sorel via Ryan as fallback.                                                                                                | The case study template has a prominent testimonial slot that currently holds a placeholder. One real quote changes the credibility equation more than any copy edit we could make.                                                                     |
| 4   | §06 About hero                           | **Founder anchor.** Who founded Photon and in what year? Is it you and Chris, you alone, a longer story?                                                                                                    | We don't want to guess. Copy currently has a `[TBC]` placeholder awaiting your context.                                                                                                                                                                 |
| 5   | §06 About crew                           | **Full team list — names + space-themed titles.** Portrait shoot on your next studio visit.                                                                                                                 | The crew grid is six placeholder tiles until you confirm names and titles.                                                                                                                                                                              |
| 6   | §07 Capabilities, §14 #15                | **SGK / Nike name-drop approval.** The agency-relationship paragraph calls out SGK on Nike by name as proof of how Photon operates inside an agency structure.                                              | If it's not OK to publish, we'll swap for a generic version ("a major sports brand through their lead agency").                                                                                                                                         |
| 7   | §07 Capabilities, §14 #17a               | **Sign-off on "We work as an extension of your team, not in place of it."** Keep, cut, or reword.                                                                                                           | Added from peer research as the crispest agency-producer bridge. Validated by 3 peer studios.                                                                                                                                                           |
| 8   | §07 Capabilities "We're known for" specs | **Confirm these specs**, currently all flagged `[TBC]`: high-speed 1000 fps, cyclorama 400 AMP, permanent seamless cyc dimensions, ceiling height clear, drive-in door height × width, parking count.       | The "We're known for" block is the single highest-value SEO + agency-producer conversion moment on the site. Specs have to be accurate.                                                                                                                 |
| 9   | §07 Capabilities, §14 #17c               | **Downloadable spec sheet PDF.** Who owns keeping the PDF current? Do we publish rental rates on it or keep those quoted per-project?                                                                       | Added from peer research — zero competitors offer this. Agency producers share docs like this internally before they email you.                                                                                                                         |
| 10  | §07 Capabilities, §14 #9                 | **Does the "What we don't do" section stay in Capabilities?**                                                                                                                                               | Zero peers do this. We think it's a trust signal; some studios skip it. Your call.                                                                                                                                                                      |
| 11  | §07 Capabilities "How we engage"         | **New optional section.** Three-line block describing full production / specific capability / plugged-in team. Keep or cut?                                                                                 | Bridges the gap between "modular is a philosophy" and "modular is something I can buy." Flagged optional — cut it if it feels like too much specificity.                                                                                                |
| 12  | §03 Work, §14 #16                        | **Ship filters on the Work page?** Reverses the original "no filters" preference. Two-word sign-off: **"Yes, ship filters"** or **"No, keep it one grid."**                                                 | Biggest structural decision in the draft. ICP research says yes (both target audiences want filters). SEO says yes (every category becomes an indexable URL). We dropped Auto & Finance and Fashion from the launch filter set — confirm that's OK too. |
| 13  | §03 Work category names                  | **Finalize category taxonomy and numbering.** Current suggestions: Sport / Tech & Wearables / Footwear / Food & Beverage / High-Speed / Motion Control / Studio. Rename, reorder, merge, or split anything. | Once names are locked, the Sanity schema options update to match in five minutes. The labels (01.1, 01.2...) are also suggestions.                                                                                                                      |
| 14  | §09 Studio rental specs block            | **Confirm rentals specs**, currently `[TBC]`: cyclorama dimensions, power, ceiling height clear, loading door dimensions, parking count.                                                                    | The specs table is the page's most-read section — agency producers open this tab before emailing anyone.                                                                                                                                                |
| 15  | §10 Podcast rental specs                 | **Confirm podcast room specs**: mic model, DAW + sample rate, headphones brand/model, delivery format (raw WAV / edited MP3 / stems).                                                                       | Same reason as #14.                                                                                                                                                                                                                                     |
| 16  | §12 Contact, §14 #11                     | **Contact form field count.** Keep all 7 fields, or cut to 5, or cut to 3?                                                                                                                                  | Peer norm is closer to 3. Our 7-field form protects intake quality but risks losing the Friday-RFP agency producer.                                                                                                                                     |
| 17  | §01 footer                               | **LinkedIn link?** We have IG, Vimeo, and Facebook from discovery. No LinkedIn URL in the codebase.                                                                                                         | If there's no Photon LinkedIn, we drop the line. If there is, we add it.                                                                                                                                                                                |
| 18  | §01 nav                                  | **Rentals in the top nav.** We added it as the 6th link. Keep or remove?                                                                                                                                    | Recommended add — it's an SEO-priority landing target for agency producers and deserves a global entry point.                                                                                                                                           |
| 19  | §02 Homepage                             | **Relationship-length line on the homepage** ("Ten projects in on some. Five years running on one.") Keep, move, or cut?                                                                                    | Added from peer research — it's Photon's strongest proof point and currently buried on About.                                                                                                                                                           |

### Soft — needed before launch, not before round 1

| #   | Section                | The ask                                                                                                                                                                                                                                                                                                                                   |
| --- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | §02 Homepage, §03 Work | **Per-project descriptions** (2–4 sentences each, Photon voice) for the homepage rotation and the Work grid. Tentative top-5 to start with: Sounders Bruce Lee kit, Sorel high gear, Combat Cookies, Bare Republic, Neste.                                                                                                                |
| S2  | §06 About              | **Studio photography + team portraits** from your next studio visit.                                                                                                                                                                                                                                                                      |
| S3  | All                    | **Testimonials.** Currently only slotted into §05 case study template. We should talk about surfacing pull quotes in 2–3 additional places: above the contact form (conversion moment), on About (humanize the pitch), and possibly near "We're known for" on Capabilities. Depends on how many real quotes you can get us and from whom. |
| S4  | §07 Capabilities       | **Confirm effects capability** — practical and pyrotechnic effects is currently `[TBC]`. Is it a real offering you want listed?                                                                                                                                                                                                           |

### Open questions (no wrong answer)

| #   | Section                             | The question                                                                                                                    |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| O1  | §07 Capabilities "What we don't do" | Anything on the "we don't do" list that would accidentally close the door on work you actually want?                            |
| O2  | §05 Case study                      | Is there a specific Sorel case study coming from Ryan we should build the first case study template around?                     |
| O3  | §01 footer                          | Four legal links (Privacy / Terms / Cookies / Accessibility) — do you already have policy content, or do we draft placeholders? |

### Completed in this draft (no action needed — just fyi)

- Filter structure on Work page reversed from original "no filters" preference (ICP + SEO reasoning in dependency #16)
- "Extension of your team" line added to Capabilities agency section (peer research)
- Direct email surfaced above the contact form (peer research)
- Downloadable spec sheet PDF CTA added to Capabilities (peer research)
- "How we engage" section added to Capabilities as a new optional block
- Homepage relationship-length proof line added (peer research)
- Rentals added to the top nav
- Category label numbering fixed (01.1 → 01.7)
- Auto & Finance and Fashion dropped from category routes (thin — projects still live in the main grid)
- Email contradiction between `chris@` and `hello@` resolved to `chris@` placeholder pending your answer
- "Mission control" vs "ground control" metaphor clash resolved (ground control stays on 404 as functional metaphor; brand signature unified to modular-production tagline)
- "A giant network distilled into specialty teams" consolidated to a single home on Capabilities (Homepage and About rewritten to avoid repetition)
- Footwear H1 rewritten from generic "Built to last. Shot to match." to "Footwear that earns the weather."
- Sport subhead trimmed from 8-name brag list to 3 anchors
- Footer legal links expanded from "Privacy" to four placeholders
- About "Few hands make light work" echo rewritten to break the H1 repetition
- Combat Cookies voice example rewritten to remove filler ("We changed things up")

---

_First draft — SALT Studio for Photon._
_This is the starting point. Nothing here is final. Everything is up for discussion in round 1._
