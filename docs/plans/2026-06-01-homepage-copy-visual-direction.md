# Photon Homepage — Copy & Visual Direction

**Prepared by:** SALT Studio  
**Date:** 2026-06-01  
**Status:** Working brief — synthesizes approved copy (v2), design system, strategy, and prototype feedback  
**Sources:** `docs/2026-04-10-photon-website-copy-v2.md`, `brand-identity/design.json`, `brand-identity/strategy.json`, Liam R1 feedback (2026-04-16)

---

## Purpose

The homepage is the portfolio. Its job is to validate Photon's tier within seconds for a referred enterprise creative director or agency producer — then route the highest-intent visitors to a conversation. Copy stays minimal; the work carries the argument.

**Primary audience:** Production-literate brand lead (Nike/Sorel/Oura tier) arriving via referral or branded search.  
**Secondary audience:** Agency producer confirming caliber before pitching Photon internally.

**What the homepage is not:** No testimonials, no pricing, no service descriptions, no logo grid with "Trusted by" headers, no Archives section.

---

## Approved homepage model

**Locked in copy v2 + Liam prototype feedback:** a full-viewport, fixed-position video carousel — not a scrollable multi-section landing page.

Five featured projects rotate full-screen. Copy lives at the edges (nav, project block, client strip, bottom CTA). The visitor does not scroll the homepage; they watch, skim metadata, and navigate out via Work, Capabilities, Studio, Rentals, or Contact.

> **Note:** `brand-identity/design.json` also describes a scrollable homepage (hero → work grid → philosophy → logos → studio teaser → contact). That layout was an earlier exploration. **Copy v2 and the approved prototype supersede it** for Phase 1. If scroll sections are added later, use the copy and visual specs in the "Optional scroll sections" appendix at the bottom of this doc.

---

## Global chrome (persistent on homepage)

### Top bar

| Element             | Copy                                             | Visual direction                                                                                                                     |
| ------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Logo                | Photon horizontal wordmark (links to `/`)        | White SVG (`/logos/photon-horizontal-white.svg`). Left-aligned. Height ~20–40px responsive. No 3D/puffy logo in UI.                  |
| Desktop nav         | Work · Capabilities · Studio · Rentals · Contact | Pitch Sans (`font-mono`), 10px, uppercase, tracking `0.18em`, white/80 → white on hover. Hidden below `lg`; mobile uses menu button. |
| Mobile menu trigger | `[ / ] MENU`                                     | Same mono treatment. Opens full-screen dark nav overlay (stacked large type — see design.json Pantheon pattern).                     |
| Archives            | **Removed**                                      | Dropped in copy v2 per Liam. Do not show in nav.                                                                                     |

### Bottom bar

| Element   | Copy                        | Visual direction                                                                                                                                                                           |
| --------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Left      | **Empty** (tagline removed) | v2: persistent tagline "Modular production for the future of content." removed from homepage — "too symmetrical, too much text." Phrase still lives in SEO meta and brand story elsewhere. |
| Right CTA | `Start a conversation →`    | Mono button: white border at 40% opacity, 9px uppercase bold, tracking `0.18em`, scramble-on-hover optional. Routes to **`/contact`** (not `mailto:`).                                     |

### Page mode

- **Background:** Mission Black `#0A0A0A` (prototype uses `#1a1a1a` — align to token)
- **Overlay:** ~50% black multiply over video so peripheral UI stays legible
- **Motion:** Single primary pattern — crossfade between projects (~0.8s). Scramble text on hover for nav/CTA labels. Respect `prefers-reduced-motion`.

---

## Zone 1 — Full-screen video hero

### Copy

No fixed hero headline. The active project's CMS content drives the left info block (see Zone 2). No on-hero tagline.

**SEO (not visible on page):**

| Field              | Copy                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `<title>`          | `Photon — Modular Production Studio, Portland / Portugal`                                                                                                                |
| Meta description   | `A production studio for brands and agencies. Commercial video, stills, high-speed, based in Portland with a 5,000 sq ft studio with cyclorama and international reach.` |
| Visually hidden H1 | `Photon Studio — Photography and Video Production in Portland and Portugal`                                                                                              |

> **Open:** Studio size in meta says 5,000 sq ft; Studio page specs say 6,000 sq ft. Liam to confirm canonical figure before launch (blocks JSON-LD + trust).

### Visual direction

| Spec           | Direction                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| Layout         | Fixed `inset-0`, full viewport. Video covers frame (`object-cover` or Vimeo background embed).                  |
| Featured count | **5 projects** (locked): Sounders Bruce Lee kit, Sorel high gear, Combat Cookies, Bare Republic, Neste          |
| Video source   | CMS `videoUrl` per project (Vimeo or MP4). Autoplay muted. Advance on end (~3s before end) or manual prev/next. |
| Preload        | Preload next slide's Vimeo iframe for smooth transitions                                                        |
| Parallax       | Optional subtle scroll parallax if homepage ever scrolls; not required for fixed carousel                       |
| Play control   | Small play/pause icon **left of progress bar** — not a centered hero play button (Liam feedback)                |
| Progress       | 2px track, white gradient fill, 8px dot indicator — film-style timeline on right rail (desktop)                 |
| Counter        | `01 - 05` format + truncated project title (desktop right rail; mobile above controls)                          |
| Prev/next      | Chevron icons only — **no circles** around buttons (Liam feedback)                                              |

### CMS / assets required

- 5 showcase projects assigned in Sanity `home` singleton → `showcaseProjects`
- Each needs: hero video URL, cover image (poster), title, slug, overview (2–4 sentences), optional camera/lens/lighting fields, duration/year
- Per-project copy: **Liam/team to write** — see Combat Cookies voice example in copy v2 §02

---

## Zone 2 — Active project info block (left rail, desktop)

Updates per carousel slide. Desktop: vertically centered left (`~24px` inset). Mobile: simplified — title in bottom control area; full left block hidden on small screens.

### Copy template (per project)

```
[PROJECT TITLE — uppercase]

[2–4 sentence description in Photon voice —
 who brought you in / what was interesting / what you did]

EXTRAPOLATE →

CAMERA    [value]
LENS      [value]
LIGHT     [value]                    /[YY]
```

**Example (voice only — not final):**

```
COMBAT COOKIES
A cookie brand walked in wanting a combat-sport spot.
Full set build, choreography with real fighters, and
a lot of flying dough. We kept the dough.

EXTRAPOLATE →

CAMERA    RED Komodo X
LENS      Cooke Panchro
LIGHT     Astera Titan Tube         /26
```

### Visual direction

| Element     | Direction                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------- |
| Title       | Untitled Sans or Pitch Sans, bold uppercase, ~36–48px, white, tight leading                                    |
| Description | Pitch Sans mono, 10px uppercase, tracking `0.08em`, white/70, max-width ~16rem                                 |
| CTA         | `Extrapolate →` — bordered mono button (same family as bottom CTA). Links to `/projects/[slug]`.               |
| Tech rows   | Two-column grid: 4rem label column (8px, white/50) + value column (8px, white/80). Labels: Camera, Lens, Light |
| Year        | Large sans `/26` style — right-aligned in tech block, white/90                                                 |
| Animation   | Slide in from left on project change (~0.5s delay)                                                             |

### Voice rules

- Peer not vendor. Direct. Technical without over-explaining. Playful when earned.
- No "cutting-edge," no corporate filler, no "full-service agency"
- Uppercase in UI labels; sentence case only in description body if lowercase reads better in CMS — prototype currently uppercases description; confirm with design pass

---

## Zone 3 — Philosophy line

### Copy (approved)

> Think of us as mission control for your visual content.

Dropped in v2: ~~"A modular production studio."~~ prefix — "modular" already appears elsewhere; avoid repetition.

### Visual direction

| Spec      | Direction                                                                                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Placement | **Designer to pick** one of: (a) persistent strip above bottom CTA, (b) delayed reveal after 3s on hero, (c) full-bleed line under hero before any scroll content |
| Type      | Pitch Sans mono, small (10–13px), uppercase, white/80 on dark                                                                                                     |
| Tone      | Quiet — earns minimalism, does not compete with project block                                                                                                     |

**Status:** Not yet in prototype. Required for launch per copy v2.

---

## Zone 4 — Client roster strip

### Copy (approved list)

> SELECTED CLIENTS — Nike · Adidas · Google Pixel · Capital One · Starbucks · Teavana · Triumph · Amazfit · Flexfit · Sorel · Oura · Hyperice · Jordan · Vans · Under Armour · Seattle Sounders · Portland Thorns · Portland Timbers · JBL · Taylor Farms · Wildfang · GQ

**Removed:** BMW (spec project, not a real client engagement)

**Format:** Typewriter-style mono line. **No logo images** — permissioning and voice (specific, blunt, confident; logos read performative).

### Visual direction

| Spec       | Direction                                                           |
| ---------- | ------------------------------------------------------------------- |
| Type       | Pitch Sans mono, 10px or caption scale, uppercase, white/60–80      |
| Layout     | Full-width single line; optional slow horizontal scroll on overflow |
| Prefix     | `SELECTED CLIENTS —` as label prefix                                |
| Separators | Middle dot `·` between names                                        |

**Open:** Final sign-off on full list before public launch (copy v2 round-2 item).

---

## Zone 5 — Relationship proof line

Sits directly below client roster strip. Surfaces retention signal for first-time VPs who won't click through to Studio.

### Copy — pick one (round 2)

| Option | Line                                                                                            |
| ------ | ----------------------------------------------------------------------------------------------- |
| **A**  | Most clients hire us back. Some are ten projects deep. One is five years running.               |
| **B**  | Some clients are ten projects in. One is five years running. The relationships are the product. |
| **C**  | We measure clients in projects and years, not deliverables. The longest is five years in.       |

**Rejected v1 line:** ~~Ten projects in on some. Five years running on one. The relationships are the product.~~ (Liam: "garbled")

### Visual direction

Same as client strip — mono, small, full-width, directly below roster. Even quieter than roster (white/50–60).

**Status:** Copy decision pending Liam. Not in prototype.

---

## Zone 6 — Bottom CTA (conversion)

Already covered in global chrome. Reinforce:

- **Copy:** `Start a conversation →`
- **Destination:** `/contact`
- **Visual:** Right side of bottom bar only; left side stays clean
- **Intent:** Lowest-friction path for highest-intent visitors who don't need more proof

---

## Typography & color (homepage-specific)

From `brand-identity/design.json`:

| Role                                | Font                                               | Treatment                |
| ----------------------------------- | -------------------------------------------------- | ------------------------ |
| Nav, labels, tech metadata, CTAs    | **Pitch Sans** (`font-mono`)                       | Uppercase, wide tracking |
| Project titles                      | **Untitled Sans** (`font-sans`) or Pitch Sans bold | Uppercase display        |
| Body/description (if sentence case) | Untitled Sans                                      | 18px max, 65ch           |

| Token           | Value     | Usage on homepage                                                |
| --------------- | --------- | ---------------------------------------------------------------- |
| Mission Black   | `#0A0A0A` | Page background                                                  |
| Console Surface | `#141414` | Nav overlay, elevated UI                                         |
| Text primary    | `#FFFFFF` | Headlines, CTAs                                                  |
| Text muted      | `#A0A0A0` | Labels, client strip                                             |
| Solar accent    | `#F5A623` | Sparingly — progress dot glow optional; not required on homepage |

**Fonts:** Pitch Sans + Untitled Sans via `next/font/local` (licensed — client confirmed). IBM Plex Mono / Inter are dev stand-ins only.

---

## Interaction & motion principles

1. **Frame is invisible** — UI serves the video, never competes with it
2. **Motion is singular** — one fade per slide change; no stacked animations
3. **Peripheral occupancy** — use all four edges (top nav, left project info, right controls, bottom CTA) without crowding center frame (Liam feedback)
4. **Hover** — opacity shifts and scramble text only; no card scale on homepage
5. **Accessibility** — keyboard-accessible prev/next/play; visible focus states on controls; respect reduced motion

---

## Content explicitly excluded from homepage

| Excluded                         | Reason                                                      |
| -------------------------------- | ----------------------------------------------------------- |
| Testimonials                     | Belong on case study pages                                  |
| Pricing / rate signals           | Routes to Rentals + Contact                                 |
| Detailed capabilities            | `/capabilities`                                             |
| Team / studio specs              | `/studio`                                                   |
| Work grid below hero             | Homepage _is_ the reel; full grid lives at `/work`          |
| Logo image grid                  | Replaced by mono client roster strip                        |
| Persistent tagline in bottom bar | Removed v2 — too much symmetrical text                      |
| Archives nav/link                | Removed v2                                                  |
| Facebook / LinkedIn in footer    | Removed v2 — Instagram + Vimeo only (footer on inner pages) |

---

## Assets & dependencies checklist

| Asset                                             | Owner       | Status                                         |
| ------------------------------------------------- | ----------- | ---------------------------------------------- |
| 5 hero project videos (1080p+, ideally 4K source) | Photon      | Tentative list locked; need final files in CMS |
| Per-project 2–4 sentence descriptions             | Liam / team | Placeholder — Google Sheet linked in copy v2   |
| Camera / lens / lighting per featured project     | Liam / team | CMS fields exist                               |
| Client roster sign-off                            | Liam        | Round 2                                        |
| Relationship proof line (A/B/C)                   | Liam        | Round 2                                        |
| Studio sq ft canonical number (5k vs 6k)          | Liam        | Blocks SEO meta alignment                      |
| Pitch Sans + Untitled Sans font files             | Photon      | Licensed ✓                                     |

---

## Prototype vs spec — gaps to close

Current implementation: `components/VideoHero.tsx` + `components/HomePage.tsx`

| Item                    | Spec                 | Prototype today                                            |
| ----------------------- | -------------------- | ---------------------------------------------------------- |
| Bottom tagline          | Removed              | Still shows "Modular Production for the Future of Content" |
| Nav items               | 5 links, real routes | Includes Archives; all `href="#"`                          |
| Bottom CTA              | `/contact`           | `mailto:hello@photon.studio`                               |
| Philosophy line         | Required             | Missing                                                    |
| Client roster strip     | Required             | Missing                                                    |
| Relationship proof line | Pending copy pick    | Missing                                                    |
| Background token        | `#0A0A0A`            | `#1a1a1a`                                                  |
| Featured projects       | 5 named              | Whatever has `videoUrl` in CMS                             |

---

## Appendix — Optional scroll sections (not Phase 1 homepage)

If the homepage ever expands beyond the video carousel, `design.json` + `strategy.json` define these sections. Copy is drafted in other pages or below.

| Order | Section              | Mode            | Copy direction                                                                   | Visual direction                                         |
| ----- | -------------------- | --------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 2     | Recent work grid     | Dark            | CMS-driven; card = title + client + year; CTA `See all work →`                   | 3-col, 3:2 cards, 2px gap (`gap-hairline`), newest first |
| 3     | Philosophy statement | Light `#F5F4F0` | Same philosophy line + optional 2–4 sentences modular positioning                | Only light band on homepage — intentional contrast       |
| 4     | Client logos         | Light           | **Superseded by mono strip** in copy v2 — use text strip instead if scroll added | If logos used: grey monochrome, 32px height, slow scroll |
| 5     | Studio teaser        | Dark            | Caption: `PORTLAND, OR — [SQ FT]` + link to `/rentals`                           | One architectural studio photo, full-width               |
| 6     | Contact CTA          | Dark            | Headline option: `MISSION BRIEFING STARTS HERE.` → `/contact`                    | Large Pitch Sans, minimal                                |

---

## Sign-off checklist (homepage)

- [ ] Liam picks relationship proof line (A, B, or C, or rewrite)
- [ ] Liam confirms studio square footage for SEO meta
- [ ] Liam signs off final client roster list
- [ ] 5 featured projects populated in Sanity with video + copy + tech metadata
- [ ] Nav routes wired; Archives removed
- [ ] Bottom CTA → `/contact`; tagline removed from bottom bar
- [ ] Philosophy line + client strip + relationship line implemented
- [ ] Background color aligned to `#0A0A0A`

---

_Synthesized from approved Photon website copy v2 (2026-05-05) and brand-identity design/strategy files. For full site copy beyond homepage, see `docs/2026-04-10-photon-website-copy-v2.md`._
