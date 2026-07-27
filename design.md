# Salt Studio Design System (legacy Photon look — redesign pending)

Temporary source of truth for site-wide UI until Salt Studio’s visual redesign. The homepage hero and `/work` grid are the current baseline — every other page extends these rules, it does not invent new ones.

Related: `app/globals.css` (tokens), `/brand` (token preview), `.cursor/skills/salt-design/` (agent skill).

---

## Direction

**Three words:** Cinematic · Precise · Immersive

The UI frames the work the way a cinema frames a film. Near-black stage, white type, full-bleed media. Client footage brings the color — the chrome stays neutral.

**Signature:** Telemetry-style Pitch Sans labels (tracked uppercase, hairline ghost buttons, scramble hover) over edge-to-edge video and photography. One composition per viewport. Product and work never live in padded cards.

---

## Principles

1. **The frame is invisible** — If chrome is noticed before the work, redesign it.
2. **Media bleeds; chrome insets** — Photography, video, and product touch the viewport edge. Only UI chrome (nav, titles, filters, forms) gets horizontal padding.
3. **Precision over decoration** — Hairline borders, exact spacing, monospaced labels. No gradients-as-brand, no glow, no multi-layer shadows.
4. **Dark is default, light is earned** — Portfolio surfaces stay dark. Reading pages (Capabilities, Studio, Rentals, Contact, mobile menu) may use paper.
5. **Type does the heavy lifting** — Pitch Sans at display scale _is_ the design when media is absent. On media, type anchors a corner — it does not float in the middle as a card.
6. **Motion is singular** — One motion per interaction. Opacity, scramble, hairline reveal — never bounce or scale cards.

---

## Color

### Dark mode (default — Work, homepage, projects)

| Token              | Hex                     | Role                                  |
| ------------------ | ----------------------- | ------------------------------------- |
| `background`       | `#1A1A1A`               | Stage / page base (matches live body) |
| `surface`          | `#141414`               | Elevated panels, overlays             |
| `surface-hover`    | `#1C1C1C`               | Hover lift                            |
| `foreground`       | `#FFFFFF`               | Primary type, icons                   |
| `muted-foreground` | `rgba(255,255,255,0.5)` | Secondary labels, marquee idle        |
| `border`           | `rgba(255,255,255,0.4)` | Ghost button border (idle)            |
| `border-subtle`    | `rgba(255,255,255,0.1)` | Section rules, tech row dividers      |
| `overlay`          | `rgba(0,0,0,0.4–0.5)`   | Video multiply / legibility wash      |

**White opacity ladder (prefer these over inventing new greys):**

| Opacity      | Use                                           |
| ------------ | --------------------------------------------- |
| `/90`–`/100` | Titles, active labels, CTA text               |
| `/70`–`/80`  | Overview / body on media                      |
| `/50`        | Telemetry labels (CAMERA, LENS), marquee idle |
| `/40`        | Ghost button border idle                      |
| `/20`        | Progress track                                |

### Light mode (earned — menu overlay, editorial interiors)

| Token                    | Hex                | Role                        |
| ------------------------ | ------------------ | --------------------------- |
| `background-light`       | `#F4F4F4`          | Primary light / paper white |
| `surface-light`          | `#EBEBEB`          | Nested surfaces on light    |
| `foreground-light`       | `#0D0D0D`          | Primary ink                 |
| `muted-foreground-light` | `rgba(0,0,0,0.45)` | Secondary                   |
| `border-light`           | `rgba(0,0,0,0.15)` | Hairlines                   |

### Accent

Homepage UI does **not** use a colored accent — interaction is white opacity + border strength. Keep it that way for media pages.

Optional Solar (`#E8D5A3`) from the brand brief is reserved for focus rings and rare status marks on light pages — never as a fill competing with footage.

### Semantic (forms only)

| Token     | Hex       |
| --------- | --------- |
| `success` | `#4A9B6F` |
| `warning` | `#E8A830` |
| `error`   | `#E85050` |
| `info`    | `#5080E8` |

---

## Typography

**One family:** Pitch Sans (self-hosted). Mapped to both `font-sans` and `font-mono` so existing classes keep working.

Weights in use: `300` (display nav), `400`, `500`, `600` (bold UI).

### Roles

| Role                 | Classes / tokens                                                                        | Spec                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Display / H1**     | `font-sans font-bold uppercase tracking-tight leading-[0.95]`                           | `text-4xl` → `lg:text-5xl` (project titles). Menu overlay: `text-[56px]` / `md:text-[72px]` `font-light` |
| **Section H2**       | `font-sans font-bold uppercase tracking-tight`                                          | `clamp(24px, 3vw, 48px)`                                                                                 |
| **Nav / UI label**   | `font-mono text-[11px] md:text-[12px] font-bold uppercase tracking-[0.18em]`            | Menu, Close, small chrome                                                                                |
| **Telemetry**        | `font-mono text-[10px] uppercase tracking-[0.12em–0.18em]`                              | CAMERA / LENS / LIGHT rows                                                                               |
| **Overview**         | `font-mono text-[11px] uppercase leading-[1.7] tracking-[0.08em] text-white/70`         | Hero project blurb                                                                                       |
| **Marquee**          | `font-mono text-[11px] lg:text-[13px] uppercase tracking-[0.26em–0.28em] text-white/50` | Client strip                                                                                             |
| **Body (editorial)** | `font-sans text-[18px] leading-[1.65] normal-case`                                      | Light pages — sentence case, max ~65ch                                                                   |

### Rules

- Display, nav, labels, CTAs: **uppercase**. Always.
- Body prose on light pages: **sentence case**. Never all-caps paragraphs.
- Prefer tracked Pitch Sans labels over icons.
- Do not introduce a second display face.

---

## Buttons

### Ghost (primary CTA) — homepage baseline

Matches `PhotonCTA` in `components/VideoHero.tsx`.

```
inline-flex items-center
border border-white/40
px-3 py-1.5
font-mono text-[11px] font-bold uppercase tracking-[0.18em]
text-white
transition-colors duration-300
hover:border-white
```

- Trailing glyph: `→` (nav/project) or `+` (conversation) — slides `+1` on hover (`group-hover:translate-x-1`).
- Label uses `ScrambleText` on hover when the control is primary.
- Radius: **0** (sharp).
- Utility class: `.btn-ghost` (dark) / `.btn-ghost-light` (paper).

### Solid (forms / decisive actions)

```
bg-white text-black border border-white
font-mono text-[11px] font-bold uppercase tracking-[0.18em]
px-4 py-2
hover:bg-white/90
```

Light pages invert: `bg-foreground-light text-background-light`.

### Text / chrome

Nav links and Close: no border. Opacity hover `→ 0.7` (or ink shift on paper). Same type as UI label.

### Do not

- Pill CTAs for primary actions (progress scrubbers may use `rounded-full`)
- Colored fills on media heroes
- Soft shadows on buttons
- Icon-only buttons without an accessible name

---

## Layout & spacing

### The rule (from `/work`)

```
┌─────────────────────────────────────────────┐
│  px-5 / md:px-6  ← chrome only              │  page title, search, filters, nav
├─────────────────────────────────────────────┤
│█████████████████████████████████████████████│
│████  media  ██│████  media  ████  ← bleed   │  gap = 2px hairline, NO side padding
│█████████████████████████████████████████████│
│  p-4/p-5 on media = caption inset only      │  type lives inside the frame
└─────────────────────────────────────────────┘
```

| Token                       | Value                            | Use                                                                                         |
| --------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------- |
| **Chrome inset**            | `px-5` / `md:px-6` (20px / 24px) | Nav, page H1, search, filter pills, forms, empty states — utility class `.page-chrome`      |
| **Media bleed**             | `0` horizontal padding           | Work grid, homepage hero video, project heroes, studio photography — utility `.media-bleed` |
| **Media caption inset**     | `p-4` / `md:p-5`                 | Type overlaid on a media tile (bottom-left stack) — utility `.media-caption`                |
| **Grid gap**                | `2px`                            | Between work tiles — `.gap-hairline`. Reads as one contact sheet, not a card deck           |
| **Hero content offset**     | `left-6` / `right-6`             | Homepage project info + media controls                                                      |
| **Section gap (editorial)** | `64–96px`                        | Light reading pages only — never wrap media in this                                         |
| **Prose**                   | `65ch` / `720px`                 | Long copy columns                                                                           |
| **Container**               | none on media pages              | Do not `max-w-*` + center a work grid. Editorial pages may use `max-w-4xl`                  |

### Do / don't

| Do                                                         | Don't                                                                     |
| ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| Let product/work touch left + right edges                  | Pad a media grid with `px-6` / `mx-auto max-w-*`                          |
| Put filters/search in `.page-chrome`, then drop into bleed | Wrap each project in a rounded card with gutter                           |
| Keep gutters at 2px between tiles                          | Use 16–32px gaps that turn the wall into a dashboard                      |
| Inset type _inside_ the image (`p-4`)                      | Place titles in a separate padded band below the image (unless editorial) |

**Composition model:** Edge-anchored UI. Left narrative / right controls on heroes. Interior media pages: chrome block → full-bleed grid. One job per section.

---

## Type placement

Derived from the live site + client pitch-deck frames (`PITCH DECK FRAMES`). This is what he responds to.

### What he likes (synthesis)

1. **Edge chrome, not centered chrome** — Brand top-left, tagline / `T + 17` top-right, page marks bottom-right. Thin outer margin. Nothing floats in the middle of empty space as a “hero card.”
2. **Media owns the frame** — Photography and product run edge-to-edge (or full-height slab). Type is a label _on_ or _beside_ the work, never a padded caption strip that shrinks the image.
3. **Corner stacks on media** — Primary pattern (matches `/work` cards and many deck frames): bottom-left (or bottom-right) stack — **bold display title → tracked mono credit → smaller mono tags**. Soft bottom gradient for legibility only.
4. **Asymmetry + void** — Large type or media on one side; deliberate empty field on the other. Split slabs (studio / locations), right-aligned capability titles over dark panels, left media + right black void.
5. **Vertical type as structure** — Occasional 90° or stacked-letter rails (“THE CREW”, “WE ARE”, location names along a film-strip divider). Use sparingly for section identity, not decoration.
6. **Label-maker boxes** — Small solid black rect + white mono uppercase (“THE PORTLAND STUDIO”) stamped onto photography. Sharp corners. Feels like a slate, not a badge pill.
7. **Technical glyphs** — `»`, `>`, `<<<`, `T + 17`, `/26` year marks. Production language, not emoji.
8. **Contrast discipline** — Pure white for primary info on media; muted grey for ambient/decorative columns. Client work supplies color; UI stays mono.

### Placement recipes

| Context                        | Placement                                                                          | Type stack                                                             |
| ------------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Work grid card                 | Absolute bottom-left inside tile (`.media-caption`)                                | Title (sans bold) → `Client × Photon · /YY` (mono) → tags (mono muted) |
| Homepage hero                  | Left third, vertically centered                                                    | Title → overview → telemetry → ghost CTA                               |
| Full-bleed capability / studio | Bottom-left or bottom-right over quiet area of photo                               | Label box optional + display line + mono body                          |
| Split locations                | Full-bleed halves; meta bottom of each half; optional vertical city on center rail | Mono location + `»` descriptor                                         |
| Editorial (no media)           | `.page-chrome` + prose column                                                      | H1 display + mono subhead                                              |

### Anti-patterns (type)

- Centered title over a dimmed thumbnail card
- Pill chips / floating badges on product
- Caption bar _below_ a padded image (work/product pages)
- Mixing a second display face for “personality”

---

## Surfaces & chrome

| Element | Treatment                                                                            |
| ------- | ------------------------------------------------------------------------------------ |
| Media   | Full-bleed `object-cover`. Edge-to-edge. No inset cards around product or work.      |
| Overlay | Soft bottom vignette only where type needs legibility (`from-black/80 via-black/25`) |
| Borders | 1px hairlines — never thick frames around media                                      |
| Radius  | `0` default. Exceptions: progress thumb, rare status dots                            |
| Shadows | None decorative. Focus: `0 0 0 2px` Solar or white ring                              |

---

## Motion

| Pattern        | Spec                                                              |
| -------------- | ----------------------------------------------------------------- |
| Enter          | `opacity` + slight `x`/`y` (≤20–30px), ~400–500ms, delay staged   |
| Hover ghost    | Border `white/40` → `white`, arrow nudge, scramble label          |
| Marquee        | `client-marquee` 30s linear infinite; pause on hover              |
| Progress       | Linear width; white gradient tip                                  |
| Reduced motion | Disable parallax, marquee, stagger; keep functional hover opacity |

Durations: fast `150ms` · standard `300ms` · enter `500–600ms`.

---

## Component recipes

### Nav (dark over media)

- Logo left, links right — tracked mono labels, white.
- Mobile: paper overlay `#F4F4F4`, oversized light Pitch Sans stacked right-aligned.

### Work index (`/work`) — canonical spacing page

1. `.page-chrome` header — H1 + mono subhead
2. `.page-chrome` search + specialty pills (solid = active, ghost = idle)
3. `.media-bleed` grid — 1 col mobile / 2 col desktop, `.gap-hairline`
4. Each tile: full-bleed media + bottom gradient + `.media-caption` type stack

### Hero project block

1. Title (display)
2. Overview (tracked mono)
3. Telemetry rows (`label` 4rem col + value + `/YY`)
4. Ghost CTA → project

### Client strip

Tracked names at `white/50`, hover `white/85`, infinite scroll, ghost CTA at trailing edge.

### Media controls

Counter `01 - 42`, title, play/pause, hairline progress, chevrons — all white, 1.5px stroke icons.

---

## Page modes

| Page                                   | Mode                 |
| -------------------------------------- | -------------------- |
| Home, Work, Project detail, Archives   | Dark                 |
| Capabilities, Studio, Rentals, Contact | Light (paper)        |
| Mobile menu overlay                    | Light (paper) always |
| Footer                                 | Dark always          |

Switch with `data-theme="dark" | "light"` on `<main>` or section wrappers — semantic tokens (`bg-background`, `text-foreground`) follow.

---

## Implementation map

| Concern                | Where                                            |
| ---------------------- | ------------------------------------------------ |
| Spec (this file)       | `design.md`                                      |
| CSS tokens + utilities | `app/globals.css`                                |
| Agent skill            | `.cursor/skills/photon-design/SKILL.md`          |
| Font load              | `app/layout.tsx` → `--font-sans` / `--font-mono` |
| Canonical spacing      | `/work` → `WorkCatalog` + `ProjectGrid`          |
| Ghost CTA reference    | `PhotonCTA` in `components/VideoHero.tsx`        |
| Scramble hover         | `components/ScrambleText.tsx`                    |
| Live preview           | `/brand`                                         |
| Strategic brief        | `brand-identity/design.json`                     |

### Tailwind usage

```tsx
// Chrome block (titles, filters) then bleed media
<header className="page-chrome pt-10 md:pt-14">…</header>
<ul className="media-bleed mt-12 grid grid-cols-1 gap-hairline sm:grid-cols-2">
  <li>
    <Link className="group relative block aspect-[16/9] overflow-hidden">
      {/* media */}
      <div className="absolute inset-x-0 bottom-0 media-caption">
        <h3 className="font-sans text-lg font-bold uppercase tracking-tight text-white md:text-xl">
          Combat Cookies
        </h3>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/70">
          Combat × Photon · /26
        </p>
      </div>
    </Link>
  </li>
</ul>

// Ghost CTA
<Link className="btn-ghost">
  <span className="inline-flex items-center gap-2">
    Extrapolate <span aria-hidden>→</span>
  </span>
</Link>
```

Prefer semantic tokens (`bg-background`, `text-foreground`, `border-border`) over hardcoded hex in new work. Homepage may keep literal `white/` opacities where they sit on video.

---

## Anti-patterns

- Purple / neon accent themes
- Warm cream + terracotta “AI default” editorial
- Broadsheet hairline newspaper layouts
- Card grids in heroes; padded gutters around product/work media
- Floating badges / promo chips / pill clusters on media
- Inter / Roboto / system UI as primary type
- `cn()` / `clsx` — use template literals per project convention
- Centering work in a `max-w-*` container that creates empty side bands
