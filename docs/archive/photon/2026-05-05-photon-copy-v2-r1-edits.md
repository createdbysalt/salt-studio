# Photon Website Copy v2 — Round 1 Feedback Edits

**Date:** 2026-05-05
**Source:** `~/Downloads/04.16.26 PHOTON WEB COPY R1 Feedback.md` (Liam's R1 feedback)
**Target files (all v2):**

- `docs/2026-04-10-photon-website-copy-v2.md` (source of truth)
- `docs/photon-website-copy-v2.html` (styled deliverable)
- `public/photon-website-copy-v2.html` (mirror, served at `/photon-website-copy-v2.html`)

**Workflow:** edit MD first, mirror into both HTMLs after each section is locked. v1 files stay untouched.

---

## Decisions locked before editing

1. **Structural move:** "Why modular," "How we work," "Where we work," and "Founder anchor" migrate from §06 About → §07 Capabilities. About becomes a focused Studio + Crew page. (Confirmed via citations: feedback lines 97–113 sit under `CAPABILITIES` header, but in v1 these sections live in §06 About at lines 414–444.)
2. **Spec block:** full 12-row spec table lives only on the new Studio page (§06 About). Rentals gets prose-only "What's included / What's extra," no duplicate spec table.
3. **Production / Post sub-lists:** killed. Liam's rewrites are paragraph-only; the v1 capture/on-set/post bullet sub-lists go.
4. **Motion control:** Liam's edits already handle the sweep. Survives only as "available on request" in Rentals/What's extra. No additional places to scrub.
5. **Relationship line rewrite:** I'll draft 3 options inline in chat; Gabriella picks.
6. **Footer location wording (Q1):** keep Portland street address (local SEO + LocalBusiness JSON-LD), add Lisbon line. Final block:
   ```
   Photon Studio
   726 SE 10th Ave, Portland, OR 97214
   Lisbon, Portugal
   hello@photon.studio
   ```
7. **Email setup (Q3):** ONE alias on the footer (`hello@`), ONE direct address on the Contact page (`chris@`), `liam@` never publicly published (server-side form routing for creative project types). Editorial note added to v2 explaining the recommended implementation for Photon's team.
8. **Filter pill list (Q2):** 11 pills total. All / Sportswear / Lifestyle / Tech / Footwear / Food / High-speed / Music / Fashion / Studio / Art Dept.
9. **Rentals consolidation (Q5):** ONE `/rentals` page with three anchored sections (`#studio`, `#podcast`, `#gear`). Child URLs deprecated; redirects added. SEO recovery via passage indexing + strong keyword H2s + `Service` JSON-LD per offering.
10. **Contact form (Q6):** treated as soft suggestion. Add ONE new optional field (`What are you delivering?` textarea). Existing 7-field structure otherwise intact.
11. **Survival rule (Q7/Q8):** anything Liam didn't address survives unless the surrounding section is a full rewrite. About hero is a full rewrite (new H1 + new lead) → secondary "relationship proof" paragraph dies with it. Capabilities CTA at bottom survives unchanged.

---

## Section-by-section edit plan

### A. System copy & nav (§01)

- [ ] Remove `Archives` from primary nav (6 links → 5: Work, Capabilities, Studio, Rentals, Contact)
- [ ] Remove persistent bottom-bar tagline ("Modular production for the future of content."). Keep right-side `Start a conversation →` CTA only.
- [ ] Update philosophy line: drop "A modular production studio." → final line reads only `Think of us as mission control for your visual content.`
- [ ] Update CTA library table: remove rows that referenced Archives (none exist — verify).

### B. Footer (§01)

- [ ] Left column: 4 lines → `Photon Studio` / `726 SE 10th Ave, Portland, OR 97214` / `Lisbon, Portugal` / `hello@photon.studio`
- [ ] Right column: keep Instagram + Vimeo. Remove Facebook line. Remove LinkedIn `[TBC]` placeholder.
- [ ] Update §00 contradiction note: `chris@` vs `hello@` resolved per Liam (hello@ footer, chris@ everywhere else).
- [ ] **Add editorial note for Photon team** (placement: §00, near the email decision callout — see "Editorial notes for Photon" section below).

### C. Homepage (§02)

- [ ] Drop persistent bottom-bar tagline (already in §A).
- [ ] Update philosophy line (already in §A).
- [ ] Client roster strip:
  - Add: `Starbucks`, `Teavana`, `Triumph`, `Amazfit`, `Flexfit`
  - Remove: `BMW` (dep 14 — was a spec project)
  - Final list: Nike · Adidas · Google Pixel · Capital One · Sorel · Oura · Hyperice · Jordan · Vans · Under Armour · Seattle Sounders · Portland Thorns · Portland Timbers · JBL · Taylor Farms · Wildfang · GQ · Starbucks · Teavana · Triumph · Amazfit · Flexfit (22 names)
- [ ] Rephrase relationship line. Current: `Ten projects in on some. Five years running on one. The relationships are the product.` Draft 3 options inline in chat → Gabriella picks → I edit.
- [ ] Update homepage SEO metadata (verbatim from feedback lines 24, 26):
  - Title: `Photon — Modular Production Studio, Portland / Portugal`
  - Meta description: `A production studio for brands and agencies. Commercial video, stills, high-speed, based in Portland with a 5,000 sq ft studio with cyclorama and international reach.`
  - Hidden H1: `Photon Studio — Photography and Video Production in Portland and Portugal`
- [ ] Active project info block (per-project) → no copy change. Note that project descriptions move to CMS per dep 06.

### D. Work index + category landing pages (§03)

- [ ] `/work` page header:
  - Label: `01 — Selected work` (no change)
  - H1: `All Projects` (was `Every project, one grid.`)
  - Subhead: `Filter by specialty — or scroll the whole thing.` (drop "Sorted by recency")
- [ ] Filter pill row — final 11 pills in this order: `ALL / SPORTSWEAR / LIFESTYLE / TECH / FOOTWEAR / FOOD / HIGH-SPEED / MUSIC / FASHION / STUDIO / ART DEPT`
- [ ] Pill-launch gating: keep the "4+ projects per pill at launch" rule. Once Liam confirms project counts per category, pills under threshold get held back from the launch nav (still indexable URLs, just not surfaced).
- [ ] Update `[Why seven, not nine]` editorial note → rewrite for the new taxonomy. The launch-vs-final pill list explanation now references the 11-category taxonomy with the "4+" gate.

**Category pages — rewrite per feedback (lines 40–92):**

- [ ] `01.1 — Sportswear` (renamed from Sport)
  - H1: `Sportswear`
  - Subhead: `Teams, brands, and big swings.`
  - Meta: I'll draft (Liam left blank), flag for round 2.
- [ ] `01.2 — Lifestyle` (NEW — replaces Tech & Wearables in slot 2)
  - H1: `Lifestyle`
  - Subhead: `Life's moments, lit and with a soundtrack.`
  - Meta title: `Lifestyle Photography Production | Built for Brands`
  - Meta description: `Authentic lifestyle photography and video campaigns in real-life moments, designed to inspire everyday style and improve how we move through the world.`
- [ ] `01.3 — Tech`
  - H1: `Tech`
  - Subhead: `Apps, wearables and phones, oh my!`
  - Meta title: `We Speak Fluent Gadget`
  - Meta description: `From app UI captures to wearable campaigns and phone launch content — production that keeps pace with the tech industry's relentless speed.`
- [ ] `01.4 — Footwear`
  - H1: `Footwear`
  - Subhead: `We help you put your best foot forward.`
  - Meta: I'll draft (Liam left blank).
- [ ] `01.5 — Food` (renamed from Food & Beverage)
  - H1: `Food and beverage`
  - Subhead: `Pour, steam, sizzle, cut.`
  - Meta: keep v1's existing copy unless Liam objects.
- [ ] `01.6 — High-speed`
  - H1: `High-speed`
  - Subhead: `1,000+ frames per second, in-house.`
  - Meta: keep v1's existing copy.
- [ ] `01.7 — Music` (NEW)
  - H1: `Music`
  - Subhead: I'll draft (Liam left blank).
  - Meta: I'll draft.
- [ ] `01.8 — Fashion` (NEW)
  - H1: `Fashion`
  - Subhead: `From the runway to the real world.`
  - Meta: I'll draft.
- [ ] `01.9 — Studio`
  - H1: `Studio`
  - Subhead: `For ultimate control and set builds`
  - Meta title: `Custom Studio Set Builds | Portland Photography Studio`
  - Meta description: I'll draft.
- [ ] `01.10 — Art Dept` (NEW)
  - H1: `Art Dept!`
  - Subhead: `When our in-house team built the props, sets and practical FX.`
  - Meta: I'll draft.
- [ ] **Delete the entire `/work/motion-control` category page** (lines 290–296 in v1).

### E. Project page (§04 standard, §05 case study)

- [ ] **Credits restructure:** swap the v1 credit string (`Direction — Photon. DP — [name]. Production — Photon.`) for a "Photon handled:" capability list. Format suggestion: `Photon handled: Direction · DP · Production · Edit · Color · Sound · GFX` (mono, scannable, dot-separated).
- [ ] Apply the same change to the case study template (§05).
- [ ] Worked examples — leave Sorel + Sounders pattern examples as-is unless Liam asks for rewrites.

### F. Capabilities — major restructure (§07)

This is the largest section. Why modular / How we work / Where we work / Founder anchor migrate IN; How we engage / What we don't do migrate OUT.

**Hero:**

- [ ] H1: `Modular Production, beginning to end.` (was `Modular production, end to end.`)
- [ ] Lead paragraph: keep verbatim (no change in feedback).
- [ ] **NEW — Founder anchor** (migrated from About §06 hero): `Founded in 2017 by Liam Gillies and immediately joined by Chris Crary. This duo has been part of Photon from day 1 and continue to be the core of the business.`
- [ ] **NEW — Secondary paragraph** (replaces v1's "Why-modular callout"): `Most production scales by adding more staff. We scale through reach.`

**NEW section — Why Modular** (migrated from About §06):

- [ ] Subhead: `Everything you need, nothing you don't.`
- [ ] Paragraph: `Because no two shoots are alike. We focus on nimble, specialized teams that scale to the exact need. This way, we can utilize any budget level to the best of its ability — extending creative possibilities in a smooth process.`

**NEW section — How we work** (migrated from About §06):

- [ ] Subhead: `Creative → Production → Post.` (no change)
- [ ] Paragraph: `Consistent creative heads from planning through post production lead to even more reduction of waste. The best result comes from a thoughtful creative idea matched with an equally thoughtful process.`

**NEW section — Where we work** (migrated from About §06):

- [ ] Subhead: `Portland, Portugal, and everywhere in between.`
- [ ] Paragraph: `Portland is HQ. Portugal is our satellite. The world is our oyster.`

**Replace "We're known for" section:**

- [ ] Delete the v1 "We're known for" specs block (lines 500–519).
- [ ] Insert placeholder: `[DESIGN: module squares — visual treatment of specialty capabilities. Final visuals locked in design layer.]`
- [ ] **Move the spec sheet PDF CTA** out of Capabilities entirely → relocate to the new `/rentals#studio` section (per Liam's question on line 116 + dep 17c).

**Section — Creative:**

- [ ] Subhead: `Creative.` (no change)
- [ ] Intro line: `Where the brief becomes a plan.` (was `Where the brief becomes a shot.`)
- [ ] Paragraph: `Treatment development, storyboarding, shot lists, look development. Every project starts with the team that will shoot it — no handoff between the room that pitched the idea and the set that executes it.` (small change: "shoot" → "project")
- [ ] **Kill the module bullet sub-list** (Concept, Storyboarding, Look development, etc.) — no replacement.

**Section — Production:**

- [ ] Subhead: `Production.` (no change)
- [ ] Intro line: `Where every moment counts.` (was `Where we earn the shoot.`)
- [ ] Paragraph: `As content demands rise, so do our solutions. We manage multiple capture types to squeeze out every last drop of our opportunities on the day.`
- [ ] **Kill both bullet sub-lists** (Capture / On-set technical) — no replacement.

**Section — Post:**

- [ ] Subhead: `Post.` (no change)
- [ ] Intro line: `Where it all comes together.` (was `Where it becomes what you ship.`)
- [ ] Paragraph: `Edit, color, GFX, sound design and VFX. All in-house, next door to the cameras. No shipping hard drives across town. No loss in translation from director to editor.`
- [ ] **Kill the module bullet sub-list** — no replacement.

**Delete entire section — How we engage** (v1 lines 580–584).

**Section — How we work with agencies and brands:**

- [ ] **Keep opening line** (Liam approved in dep 17a, line 247): `We work as an extension of your team, not in place of it.`
- [ ] **NEW subhead** (replaces "Direct, or alongside."): `Maximum flexibility`
- [ ] **NEW paragraph** (replaces all three v1 paragraphs): `We are a true white label service and can interface within existing teams or build an entirely new one from scratch. Planning through Post or a specific capability on its own, our goal is to execute at the highest level, regardless of scope or scale.`
- [ ] **SGK / Nike name-drop** — Liam approved in dep 15 ("Always ok to mention agencies by name"). But the new paragraph doesn't include it. Decision: drop the SGK reference (the new paragraph is leaner; SGK / Nike can surface naturally on the case study page if/when it gets one).

**Delete entire section — What we don't do** (v1 lines 604–608).

**Bottom CTA:** keep unchanged (per Q8 — Liam didn't address, not a full rewrite).

### G. About → renamed "Studio" (§06)

About narrows to a focused studio-and-crew page. Strategic content (Why modular / How we work / Where we work / Founder anchor) has migrated to Capabilities.

**Hero — full rewrite:**

- [ ] Label: `02 — The studio` (no change)
- [ ] H1: `Ground Control for boots on the ground` (was `Few hands, light work.`)
- [ ] Paragraph: `Photon's HQ is a 6,000 sq ft studio in SE Portland, Oregon. Designed and built out by the owners, we've put our blood sweat and tears into this space. And with that, so much space for activities. We often integrate specialty set builds into our projects, interior weather, pyrotechnics, large format LED walls and other creative solutions to push the envelope right here at home.`
- [ ] **Kill v1 secondary "relationship proof" paragraph** (lines 419–420). Hero is a full rewrite per survival rule. Relationship-proof energy lives on homepage and (to a lesser extent) the new Capabilities migration.

**NEW — Studio specs block** (12 rows, embedded directly under hero paragraph):

- [ ] Total space — 6,000 sq ft
- [ ] Cyclorama — 44×38 permanent, seamless and paintable
- [ ] Power — 400 AMP w/ digital 3-phase converter
- [ ] Wifi — Dedicated Fiber 1G
- [ ] Ceiling height — 16ft clear / 24ft total
- [ ] Kitchenette and 1 bathroom
- [ ] Loading — Drive-in roll-up door, 14ft × 12ft
- [ ] Scissor Lift — Genie GS-1930
- [ ] Camera, grip, lighting and crew — In house
- [ ] Lighting — Total control, full blackout possible
- [ ] Parking — Street
- [ ] Address — 726 SE 10th Ave, Portland, OR 97214

**NEW H2 — Satellite and EU launchpad:**

- [ ] Paragraph: `Photon's satellite office is a 150 sq m studio in Lisbon Portugal. This is the main hub for post production and the launchpad for productions across Europe.`

**Crew restructure** (replaces v1 lines 447–462):

- [ ] H1: `CREW`
- [ ] Top row — 2 leaders (bigger portraits, side by side):
  - `Liam Gillies` — `Chief Photometrics`
  - `Chris Crary` — `Mission Control`
- [ ] H2: `SUPPORT CREW`
- [ ] Second row — 5 portraits, smaller:
  - `Em Gillies` — `Environmental Control`
  - `Toni Crary` — `Life Support`
  - `Austin Baker` — `Orbital Mechanic` `[Baker Bros]`
  - `Garrett Baker` — `Mission Specialist` `[Baker Bros]`
  - `Russel Bowen` — `Systems Engineer` `[Against the Grain]`
- [ ] **Kill v1 `[TBC]` placeholder note** under crew (no longer needed — full list confirmed).

**CTA:**

- [ ] Subhead: `Let's talk shop.` (was `Want to talk shop?`)
- [ ] CTA button: `Start a conversation →` (no change)

**Delete entire sections (migrated to Capabilities):**

- [ ] Why modular (v1 lines 423–431)
- [ ] How we work (v1 lines 433–438)
- [ ] Where we work (v1 lines 441–444)

**[SEO] About metadata** — update title and description to match new "Studio" framing (drop "Modular Production Studio" → use "Photon Studio — Production Studio in Portland and Portugal" or similar). I'll draft.

### H. Rentals — single page, three sections (§08, §09, §10 collapse)

Collapse v1 §08 hub + §09 studio rental + §10 podcast rental into ONE page at `/rentals` with three anchored sections.

**Page-level:**

- [ ] Page label: `04 — Rentals`
- [ ] H1: `Space and gear available for creators` (Liam's line — kept as the brand framing)
- [ ] Lead paragraph: short, sets up the three sections. I'll draft.
- [ ] **SEO meta:**
  - Title: `Studio, Podcast & Gear Rentals — Portland Production Studio | Photon`
  - Description: I'll draft (lead with studio rental keyword, signal podcast + gear as secondary, ~155 chars).

**Section 1 — `#studio`:**

- [ ] Brand H2: `Portland Studio` (Liam's framing)
- [ ] **SEO H2** (the actually-rendered keyword-loaded H2): `Portland studio rental — 6,000 sq ft with cyclorama`
  - _Implementation note: brand H2 vs SEO H2 conflict — recommendation is to render ONE H2 that does both jobs ("Portland studio rental — 6,000 sq ft with cyclorama") and leave Liam's brand framing as a smaller eyebrow label above. I'll write both options into v2 and Gabriella picks._
- [ ] Section copy:
  - Lead paragraph: short — what the rental gives you.
  - **What's included:** `Every rental comes with the studio essentials: 60ft × 38ft shooting area, cyclorama with a fresh coat of paint, grip closet of goodies, studio power, climate control, wifi, kitchenette, and bathroom.`
  - **What's extra:** `Camera, lens, lighting, custom grip and crew beyond the house kit, specialty rigs (motion control, high-speed, anamorphics), on-set Photon crew, catering, and art-department labor are all available on request — priced per shoot day.`
- [ ] **Spec sheet PDF download CTA** (relocated from Capabilities). Mono, small, sits under "What's extra."
- [ ] No spec table on this section (full table lives on /studio).

**Section 2 — `#podcast`:**

- [ ] Brand H2: `Portland Podcast Room`
- [ ] **SEO H2**: `Portland podcast studio rental — treated audio room`
- [ ] Lead paragraph: short.
- [ ] Specs block:
  - Room type — Acoustically treated recording booth
  - Mic setup — 2 × on shock mounts `[TBC: model, dep 10]`
  - Headphones — Over-the-ear × 4
  - Recording — Raw with in-camera redundancy
  - Engineer — Optional on-site engineer add-on
  - Video capture — Optional Blackmagic 6K Video
  - Delivery — Raw WAV files
  - Booking — Two-hour minimum
- [ ] Note: still pending tech detail per dep 10 — leave `[TBC]` flags in for round 2.

**Section 3 — `#gear`:**

- [ ] Brand H2: `Portland Gear List`
- [ ] **SEO H2**: `Portland production gear rental — Photon-curated kit`
- [ ] H3: `Photon curated gear` (Liam wrote this as H1, but H1 nesting inside a subsection is invalid — promote to H3)
- [ ] Paragraph: `Take your shoot even further with the same gear our creative team relies on.`
- [ ] Downloadable gear sheet placeholder: `[Download the Photon gear list (PDF) →]`

**[SEO] Hand-off items (dev tickets, not copy):**

- [ ] Three `Service` JSON-LD schema blocks injected on `/rentals` (one per offering). Use existing helpers in `lib/seo/structured-data.tsx`.
- [ ] 301 redirects: `/rentals/studio → /rentals#studio`, `/rentals/podcast → /rentals#podcast`. Add to `next.config.ts` or middleware.
- [ ] Internal linking: `/work/studio` deep-links to `/rentals#studio` (anchor link in the category page subhead or footer CTA).

**Editorial trade-off note (lives inline in v2):**

- [ ] Insert the "Trade-off note for Liam (consolidated `/rentals` decision)" callout (full text in the "Editorial notes for Photon team" section below) directly under the §08 Rentals section header in v2 — bracketed editorial block, gets stripped before launch like every other `[Why ...]` note in the doc. Liam needs to see the SEO trade-off he's accepting by going one-page so he can flag if he wants to revisit before round 2.

### I. Contact (§12)

**Direct contact above form:** keep `chris@photon.studio` (no change).

**Form fields — add ONE new optional field:**

- [ ] Add: `What are you delivering?` (textarea, optional) — placed after the existing `What are you working on?` textarea or before `Budget range`.
- [ ] Existing 7 fields stay intact.
- [ ] **Hand-off (dev ticket):** server-side form routing — when project type matches `Brand campaign`, `Case study / film`, or `Something else`, CC `liam@photon.studio` on the inbound email. Otherwise route to `chris@`.

**Error state copy:** keep `chris@photon.studio` (line 855 v1).

**[SEO] Contact metadata:** keep v1 unless Liam updates.

### J. Archives — delete entire §11

- [ ] Delete §11 in full (v1 lines 762–802).
- [ ] Update §00 "How to read this draft" intro line if it counts sections (renumber affected sections — Contact moves from §12 to §11, 404 from §13 to §12, etc.).

### K. Dependencies + checklist tables (§14, §15)

- [ ] Rewrite §14 with all resolved answers from feedback lines 229–249. Format as "Resolved" + "Still pending."
- [ ] Rewrite §15 (round-1 checklist) — collapse to a much shorter "Still pending for round 2" list:
  - Per-project descriptions (going to CMS via Liam's Google Sheet — link)
  - Studio + team photography
  - Podcast room tech detail (mic models, etc.)
  - Real testimonials for the 5 hero projects
  - Meta titles/descriptions I drafted for new categories (Liam to approve in round 2)
- [ ] Add reference to Liam's project descriptions sheet: `https://docs.google.com/spreadsheets/d/1rAYVequdGKmqYrb-PUhiFF04hqyQGHHkafch-YypyO0/edit?usp=sharing`

### L. Housekeeping

- [ ] Update doc header (lines 3–6):
  - `Status:` → `v2 — round 1 feedback applied, ready for round 2 review`
  - Date stays as `2026-04-10` in filename for traceability; in-doc date can update to `2026-05-05` (or stay — Gabriella picks).
- [ ] Update §00 "How to read this draft":
  - Drop the "One contradiction you'll hit before anything else" block (chris@/hello@ resolved).
  - Replace with a "What's resolved since v1 / what's still open" mini-block.

---

## Editorial notes for Photon team (added inline to v2 copy)

These get added to v2 as a small "For Photon's team — implementation notes" callout block. Placement: §00 "How to read this draft" or as an appendix section before §14 dependencies.

### Email setup recommendation

> **Recommended email setup for Photon's team to implement before launch:**
>
> 1. **Footer publishes one address:** `hello@photon.studio` (the team alias). All public traffic flows here.
> 2. **Contact page surfaces one direct address:** `chris@photon.studio` for the trust signal — high-friction agency producers and named-person emailers land here.
> 3. **`liam@photon.studio` stays internal.** Creative-question routing happens server-side from the contact form: when a submission's project type is `Brand campaign`, `Case study / film`, or `Something else`, the form CCs `liam@`. User sees one form; the right person reads it.
> 4. **Legacy email forwarding:** if Photon has a pre-rebrand inbox they want to keep working (e.g. an old `info@`-style address), set up DNS-level forwarding so it routes into the same `hello@photon.studio` inbox. The public site only shows the new address.
>
> This avoids putting four email addresses on the site (which dilutes the contact CTA) while still routing every kind of inquiry to the right person. Implementation is two DNS records + one form-routing rule.

### SEO recommendation for Rentals

> **Recommended SEO setup for the consolidated `/rentals` page:**
>
> 1. Each section gets a strong, keyword-loaded H2 (e.g. `Portland studio rental — 6,000 sq ft with cyclorama`) + a brand-friendly eyebrow label above it.
> 2. Three `Service` JSON-LD schema blocks on the page (one per offering) — uses existing helpers in `lib/seo/structured-data.tsx`.
> 3. 301 redirects for the deprecated child URLs (`/rentals/studio → /rentals#studio`, `/rentals/podcast → /rentals#podcast`) — captures any pre-launch link equity.
> 4. Internal links from category pages: `/work/studio` deep-links to `/rentals#studio` (passes topical authority).
>
> This lets one page rank for distinct long-tail queries via Google's passage indexing — recovers ~80–90% of the SEO depth a three-URL setup would have given, without the UX overhead.

### Trade-off note for Liam (consolidated `/rentals` decision)

> **Heads-up — the trade-off on going one-page instead of three:**
>
> Three URLs (`/rentals`, `/rentals/studio`, `/rentals/podcast`) would have ranked slightly stronger for distinct long-tail searches like "Portland studio rental" vs "Portland podcast studio rental" — each URL gets its own H1, meta description, and crawl surface, so each can be optimized independently for one specific search intent.
>
> Collapsing into one page wins on UX (cleaner navigation, less hopping between pages) and content cohesion (everything a renter needs in one scroll), but costs roughly **10–20% on long-tail SEO depth** — the page has to share its H1 + meta description across three offerings instead of dedicating them to one.
>
> We recover most of that loss through (1) keyword-loaded H2 per section, (2) anchored URLs (`/rentals#podcast`) that Google indexes via passage indexing, (3) three `Service` JSON-LD schema blocks signalling distinct offerings, and (4) 301 redirects from the old child URLs preserving any prior link equity.
>
> **Net call:** one page is the right move if you value the simpler structure more than the incremental long-tail traffic. If post-launch analytics show meaningful search demand for "Portland podcast studio rental" specifically, we can split the podcast section back out into its own URL in a half-day change.

---

## Items I'll draft inline during editing (need Gabriella's pick)

1. **Three options for the homepage relationship-line rewrite.** Current: `Ten projects in on some. Five years running on one. The relationships are the product.`
2. **Lead paragraph for the consolidated `/rentals` page.**
3. **About → "Studio" SEO meta title + description** (new framing).
4. **Meta titles/descriptions for category pages where Liam left them blank** (Sportswear, Footwear, Music, Fashion, Studio, Art Dept).
5. **Section H2 rendering decision for Rentals** (single keyword-loaded H2 vs eyebrow label + brand H2).

---

## Items still pending Liam (round 2)

- Per-project descriptions (going to CMS via the Google Sheet)
- Studio + team photography (next studio visit)
- Podcast room tech detail (mic models, DAW, headphones brand)
- Real client testimonials for the 5 hero projects
- Approval of the meta titles/descriptions I drafted for new categories
- Final pill list (4+ per category gate — depends on confirmed project counts)

---

## Execution order

1. **A + B** — system, nav, footer (small, isolated edits)
2. **J** — delete Archives (clean slate)
3. **C** — homepage (3 relationship-line drafts → Gabriella picks → finalize)
4. **D** — work index + 11 categories
5. **E** — project page credits restructure
6. **F** — Capabilities full restructure (largest)
7. **G** — About → Studio rewrite
8. **H** — Rentals consolidation
9. **I** — Contact form addition
10. **K** — dependencies + checklist rewrite
11. **L** — header housekeeping
12. **HTML mirror** — once MD is locked, replicate every change into both HTML files

---

_Plan locked. Ready to execute on Gabriella's go-ahead._
