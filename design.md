# Salt Studio Design System

Source of truth for createdbysalt.com's visual + motion system. Supersedes the legacy Photon spec (2026-07-26 redesign).

Related: `app/globals.css` (tokens) · `/brand` (token preview) · `public/brand/` (logo SVGs) · `docs/plans/2026-07-26-design-system-redesign.md` (the plan + measured reference data) · `salt-studio-knowledge-base/studio/website/copy/` (page copy, voice-tagged).

---

## Direction

**Three words:** Clear · Warm · Alive

Ink on paper. The site reads like a beautifully set document that *moves* — light stage, near-black type doing the heavy lifting, one red accent used the way salt is: sparingly, where it changes everything. Motion is the personality; the words stay plain.

**Signature:** oversized Geist display type with tight tracking behind `overflow-hidden` masks — every line enters by sliding up into place. A red band (`#E42927`) announces the Salt product. The nav wordmark inverts over whatever it crosses.

**The organizing rule (from WORDS.md):** *clarity where visitors decide, poetry where they linger.* Design follows the same law — DECIDE surfaces (services, pricing, CTAs, forms) are quiet and exact; LINGER surfaces (About, interludes, case narration) get the expressive type and scroll choreography.

---

## Principles

1. **Light is default, dark is earned.** Paper stage everywhere; near-black bands for punch (footer, feature moments, the occasional case interlude). Never a dark page by default.
2. **One accent, surgically.** Red `#E42927` appears as: the Salt product band, a live/status dot, focus rings, rare emphasis. Never decoration, never large text color, never competing with client work.
3. **Type does the design.** Display Geist at clamp scale with −3% tracking and sub-1.0 leading *is* the visual identity. If a section feels empty, make the type better — don't add ornament.
4. **Media bleeds; chrome insets.** Unchanged from the previous system: photography/video touch the viewport edge; UI chrome (nav, titles, filters, forms) gets the gutter.
5. **Motion is choreographed, not decorated.** Every animation is one of the eight named patterns below. No one-off effects. Reduced motion collapses everything to opacity or nothing.
6. **Rounded, softly.** The brand's shape language is the rounded rectangle — radius 4/8/16. Not pill-everything; hairlines stay hairlines.

---

## Color

### Palette (brand sheet, 2026-07-26)

| Token | Value | Role |
| --- | --- | --- |
| `ink` | `#08090A` | Primary type, dark bands, logo |
| `paper` | `#EAEAEA` | Page stage (light default) |
| `surface` | `#FFFFFF` | Elevated cards/surfaces on paper |
| `accent` | `#E42927` | THE red — Salt band, status, focus |
| `gray` | `#B7B7B7` | Muted UI, disabled, secondary marks |
| `logo-light` | `#E3E3E3` | Light fills inside logo badges only — do not "normalize" to paper |

### Opacity ladder (prefer over inventing grays)

On paper (ink at opacity): `/90–100` titles · `/70` body · `/40` muted captions, idle labels · `/15` hairlines · `/6` washes, glass nav fill.
On dark bands (white at opacity): mirror ladder — `/90` type · `/50` muted · `/10` hairlines.

### Theme switching

`:root` = light (paper stage). `[data-theme='dark']` on a section/main flips the semantic tokens (`--color-background`, `--color-foreground`, `--color-border`, …) to the dark-band set. Components use semantic tokens (`bg-background`, `text-foreground`, `border-border`) and inherit the flip for free.

### Semantic (forms only)

`success #4A9B6F` · `warning #E8A830` · `error #E42927` (shares accent) · `info #5080E8`.

---

## Typography

**Two families** (brand sheet): **Geist** (`--font-sans`) for display + body, **Geist Mono** (`--font-mono`) for labels/telemetry/technical marks. Loaded via `next/font/google` in `app/layout.tsx` — variable fonts, full weight axis.

### Roles

| Role | Spec | Notes |
| --- | --- | --- |
| **Display** | Geist 600–700 · `clamp(2.5rem, 6vw, 8rem)` · tracking `-0.03em` · leading `0.9` · uppercase | Heroes, section statements. The reference sites run −3 to −5% tracking at lh 0.8–0.9 — this is the "expensive" look |
| **H1** | Geist 600 · `clamp(2rem, 4vw, 4rem)` · tracking `-0.02em` · leading `0.95` · uppercase | Page titles |
| **H2** | Geist 600 · `clamp(1.5rem, 3vw, 3rem)` · tracking `-0.02em` · leading `1.05` | Section heads — sentence case allowed on editorial pages |
| **Body** | Geist 400/500 · 16–18px · leading `1.6` · normal case | Max ~65ch. Weight 500 for standfirst/lede paragraphs |
| **Label** | Geist Mono 500 · 11–12px · tracking `0.08em` · uppercase | Nav, buttons, card metadata. NOTE: tracking is tighter than the legacy 0.18em — Geist Mono needs less |
| **Telemetry** | Geist Mono 400 · 10px · tracking `0.08em` · uppercase | Fine print, counters, tags |

### Rules

- Display/H1 and labels: uppercase. Body and editorial H2s: sentence case. Never all-caps paragraphs.
- Negative tracking ONLY on ≥H2 sizes; body and mono stay neutral/positive.
- No third family. The logo wordmark is an SVG, not type.
- Numbers in prices/dates: Geist Mono — it's the "technical truth" voice.

---

## Logo usage

Assets in `public/brand/` (inventory in the design plan §2.6):

- **`salt-wordmark.svg`** — primary mark. Black fills; for dark/red surfaces render via `components/SaltWordmark.tsx` (inline paths, `fill="currentColor"`). Never stretch, never re-color the file itself.
- **Badges** (circle lockups, black/red/light) — avatars, favicons, social, stamps on media. The red pennant badge is the "full signature" — use where the brand is the content (About, footer).
- Clear space ≈ the height of the wordmark's "S" on all sides. Minimum width 96px.

---

## Buttons & interactive

### Primary (the call CTA)

```
inline-flex items-center gap-2
bg-foreground text-background
px-5 py-3 rounded-lg
font-mono text-[12px] font-medium uppercase tracking-[0.08em]
transition-colors duration-300 hover:bg-foreground/85
```

One per viewport. Label: "Book a discovery call" (site-wide, per copy plan).

### Ghost (secondary/routing)

```
inline-flex items-center gap-2
border border-foreground/40 text-foreground
px-4 py-2.5 rounded-lg
font-mono text-[12px] font-medium uppercase tracking-[0.08em]
transition-colors duration-300 hover:border-foreground
```

Utility classes `.btn-solid` / `.btn-ghost` in globals.css carry these.

### Accent button

Only for the Salt-product waitlist: `bg-accent text-white`, same geometry. Nothing else gets a red fill.

### Links & hovers

Text links: opacity `70 → 100` or underline-reveal. Arrow glyph `→` nudges `translate-x-1` on hover. One motion per interaction.

---

## Layout & spacing

| Token | Value | Use |
| --- | --- | --- |
| **Gutter** | `clamp(20px, 5vw, 80px)` (`--spacing-gutter`, `.page-chrome`) | Page chrome — generous like the references, collapses gracefully on mobile |
| **Media bleed** | 0 horizontal padding (`.media-bleed`) | Work grids, heroes, full-bleed bands |
| **Hairline gap** | `2px` (`.gap-hairline`) | Work-grid tiles — contact sheet, not card deck |
| **Section rhythm** | `96–160px` vertical between sections | Light pages breathe; don't compress |
| **Caption inset** | `p-4` / `md:p-5` (`.media-caption`) | Type ON media tiles |
| **Prose** | `65ch` | Long copy |
| **Radius** | `4px` sm · `8px` default · `16px` lg | Cards/media `8`, buttons `8`, brand tiles/bands `16`, hairline UI `4` |

Composition: asymmetry + void (large type one side, deliberate emptiness the other), corner-anchored captions on media, one job per section.

---

## Motion

**Stack:** GSAP 3 (+ ScrollTrigger, SplitText, Flip, TextPlugin) via `@gsap/react` `useGSAP` · Lenis smooth scroll (`lenis/react`) · mounted only in `app/(personal)/layout.tsx` — the Studio at `/edit` stays static. All plugin registration in `components/motion/gsap.ts`.

### Tokens (CSS + JS mirrors)

| Token | Value | Source |
| --- | --- | --- |
| `--ease-out-cubic` | `cubic-bezier(0.33, 1, 0.68, 1)` | Measured off tinywins.com — the workhorse |
| `--ease-out-quint` | `cubic-bezier(0.22, 1, 0.36, 1)` | Expansion/size changes |
| `--duration-fast` | `150ms` | Color/opacity micro |
| `--duration-base` | `300ms` | Hovers |
| `--duration-slow` | `500ms` | Transforms, clip-path |
| `--duration-reveal` | `600ms` | Text mask reveals |

### The eight patterns (the complete vocabulary — no others)

| # | Pattern | Component | Spec |
| --- | --- | --- | --- |
| 1 | **Line reveal** | `LineReveal` | SplitText lines in `overflow-hidden` masks; `y: 100% → 0`, 0.6s ease-out-cubic, stagger 0.08s; ScrollTrigger `top 85%`, once |
| 2 | **Word swap** | `WordSwap` | Two stacked copies; per-word `y: ±105%` through line masks (measured mechanism). Homepage hero: DECIDE headline is the default face — poetic line is the swap target, never the initial or reduced-motion state |
| 3 | **Curtain transition** | `PageTransition` | Route change: two half-width ink panels wipe in (~0.4s), swap route, wipe out (~0.4s), ease-out-quint. Native App Router (no Barba): intercept internal links, cover fully before `router.push` |
| 4 | **Parallax media** | `ParallaxMedia` | Oversized media in clipped frame; scrubbed `yPercent ±8`; `will-change: transform` |
| 5 | **Scrub section** | `ScrubSection` | Sticky viewport section in tall parent; timeline `scrub: true`, `start: "top center", end: "bottom center"` (measured off glitchandgrit) |
| 6 | **Clip reveal** | `ClipReveal` | `clip-path: inset(100% 0 0) → inset(0)`, 0.5s ease-out-cubic or scrubbed |
| 7 | **Card hover** | CSS only | Media `scale 1.05` @ 0.5s ease-out-cubic + caption fade/slide-up + arrow nudge (`.work-card-media-zoom`) |
| 8 | **Grid flip** | Flip plugin | Work-page filter re-layout; 0.5s ease-out-cubic |

Plus two CSS freebies: `mix-blend-difference` on the fixed nav wordmark; existing marquee keyframes.

### Reduced motion (non-negotiable)

`prefers-reduced-motion`: Lenis off, ScrollTrigger tweens `gsap.set` to end state, curtain becomes a 150ms fade, WordSwap shows the DECIDE face only, hovers keep opacity changes only. The global media query in globals.css is the backstop; components must also behave.

---

## Page modes

| Page | Mode |
| --- | --- |
| Home, Services, Work, About, Contact | Light (paper) |
| Footer, Salt-product band, feature interludes | Dark band (`data-theme="dark"` section) |
| Case-study media sections | Follow the work — light chrome around full-bleed media |

---

## Anti-patterns

- Dark page defaults (that was Photon; Salt is ink-on-paper)
- Red as decoration — accent fills on anything but the Salt band/waitlist/status/focus
- A second display face, or tracking wider than 0.1em on mono labels
- One-off animations outside the eight patterns
- Card grids with fat gutters around work media (hairline rule stays)
- `cn()`/`clsx` — template literals per project convention
- Centered hero cards floating in space; corner-anchor instead
- Poetry on DECIDE surfaces (see copy plan) — and its design twin: expressive motion on pricing/forms

---

## Implementation map

| Concern | Where |
| --- | --- |
| Tokens + utilities | `app/globals.css` |
| Fonts | `app/layout.tsx` (Geist + Geist Mono, `next/font/google`) |
| Logo assets | `public/brand/` · inline component `components/SaltWordmark.tsx` (to build) |
| Motion infra | `components/motion/` (to build — see design plan Step 5) |
| Live token preview | `/brand` |
| Measured reference data | `docs/plans/2026-07-26-design-system-redesign.md` §2 |
| Page copy + voice tags | `salt-studio-knowledge-base/studio/website/copy/` |
