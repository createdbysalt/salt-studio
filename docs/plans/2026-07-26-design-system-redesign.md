# Salt Studio Design System Redesign — DESIGN.md + globals.css + Motion Foundation

**Date:** 2026-07-26
**Status:** Plan approved decisions, awaiting `qcode`
**Replaces:** Legacy Photon visual system (current `DESIGN.md` + `app/globals.css`, both marked "redesign pending")

---

## 1. Context

Salt Studio (`createdbysalt.com` — _Subtle. Essential. Transformative._) is redesigning its visual system. Two references were analyzed live via Playwright (computed styles, not guesses):

- **tinywins.com** — Next.js + Sanity (same stack as us). GSAP 3.14.2 + Lenis 1.3.20.
- **glitchandgrit.com** — Webflow. GSAP 3.15 + ScrollTrigger + Flip + TextPlugin + ScrollToPlugin, SplitType, Lenis, Barba.js, Swiper.

### Decisions locked (2026-07-26)

| Decision   | Choice                                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fonts      | **Geist (titles) + Geist Mono (labels/variable)** — per the brand sheet. Both free (Vercel typefaces) → **no font-purchase blocker**. Pitch Sans, Untitled Sans, GT Flexa Mono all retired. |
| Base theme | **Light default, dark earned** — paper stage, near-black ink, dark bands for punch. Inverts the Photon logic.                                                                               |
| Accents    | **Single restrained accent = brand red `#E42927`** (user-confirmed 2026-07-26; validated inside the logo SVGs) for feature bands, status dots, focus rings. Solar `#E8D5A3` retired.        |
| Animation  | **Full Glitch&Grit-grade motion system.** Everything except **Barba.js** — page transitions are handled natively by Next.js App Router instead.                                             |

### 2.6 Salt brand sheet (screenshot, 2026-07-26)

Source: `Visual Identity — SALT STUDIO` sheet supplied by user.

| Element         | Value                                                                                | Note                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Logo            | "SALT" warped/perspective wordmark; pennant-flag lockup variant; small "studio." tag | ✅ SVGs received — see inventory below                                                                    |
| Ink (black)     | `#08090A`                                                                            | Sheet label (pixel-sampled ≈ #010005 — trust label)                                                       |
| **Accent red**  | **`#E42927`** — user-confirmed; matches fills inside the logo SVGs                   | (Sheet label `3f3f3f` was a typo)                                                                         |
| Mid gray        | `#B7B7B7`                                                                            | Muted UI, secondary                                                                                       |
| Paper (light)   | `#EAEAEA`                                                                            | Light stage candidate (with white for elevated surfaces)                                                  |
| Logo light type | `#E3E3E3`                                                                            | Light type inside logo badges — slightly darker than paper; keep as distinct token if badges sit on paper |
| Titles          | **Geist**                                                                            |                                                                                                           |
| Mono            | **Geist Mono**                                                                       | Sheet says "Variable"                                                                                     |
| Shape language  | Brand tiles use generously rounded corners                                           | Softens the legacy "radius: 0 sharp" rule — radius tokens 4/8/16px re-enter the system                    |

**Logo asset inventory** (landed 2026-07-26 in `public/brand/` for site use, mirrored in `brand-identity/assets/logo/`):

| File                                  | Contents                                                                                                                                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `salt-wordmark.svg`                   | Standalone warped SALT wordmark, transparent bg, black fill (555×339). **Primary site mark.** Default-black paths — inline it (or CSS mask) with `fill: currentColor` for use on dark/red surfaces |
| `salt-badge-black-wordmark.svg`       | Black circle badge, light wordmark                                                                                                                                                                 |
| `salt-badge-black-pennant.svg`        | Black circle badge, pennant outline + wordmark                                                                                                                                                     |
| `salt-badge-black-pennant-studio.svg` | Black circle badge, pennant + wordmark + "studio." tag                                                                                                                                             |
| `salt-badge-red-pennant.svg`          | Red (`#E42927`) circle badge, pennant + wordmark                                                                                                                                                   |
| `salt-badge-red-pennant-studio.svg`   | Red circle badge, pennant + wordmark + "studio." tag — the full lockup                                                                                                                             |
| `salt-badge-light-wordmark.svg`       | Light (`#E3E3E3`) circle badge, black wordmark                                                                                                                                                     |

---

## 2. Reference extraction (measured values — keep for implementation)

### 2.1 Fonts

| Site                   | Family                                                  | Usage                                              |
| ---------------------- | ------------------------------------------------------- | -------------------------------------------------- |
| TinyWins               | **Suisse Int'l** 400/500/600                            | Everything — display through nav                   |
| TinyWins               | ABC Gramercy 400 (serif)                                | Rare editorial accent                              |
| Glitch&Grit            | **Elza** 400/600/700/900                                | Single family; 900 for display, 600 for body/nav   |
| Salt (current)         | Pitch Sans 300–600 (legacy)                             | To be retired                                      |
| Salt (staged, unused)  | Untitled Sans + GT Flexa Mono woff2s in `public/fonts/` | Superseded by brand sheet — delete at end of qcode |
| **Salt (brand sheet)** | **Geist (titles) + Geist Mono (labels)**                | Free; `npm install geist`                          |

### 2.2 Type specs (computed at 1200px viewport)

| Role         | TinyWins                                            | Glitch&Grit                                        |
| ------------ | --------------------------------------------------- | -------------------------------------------------- |
| Display      | 103px / w600 / **ls −4%** / **lh 0.87** / uppercase | 131px / w900 / **ls −5%** / **lh 0.8** / uppercase |
| H1           | 62px / w600 / ls −3% / lh 0.9 / uppercase           | —                                                  |
| Body         | 18px / w600 / ls −2% / lh 1.2                       | 14px / w600 / ls −3.5% / lh 1.125                  |
| Nav          | 16px / w400                                         | 14px / w600 / ls −3.5%                             |
| Fluid sizing | `clamp(2rem, 5.2vw, 6.25rem)` pattern               | `clamp()`-based paddings too                       |

**Shared DNA to adopt:** tight negative tracking (−2 to −5%) on uppercase display, sub-1.0 line-heights, weight 600 as the workhorse.

### 2.3 Colors

**TinyWins (our base-theme model):**

- Stage: `#FFFFFF` bg / `#000000` ink
- Grays via **black-opacity ladder**, not hex grays: `black/15` hairlines · `black/40` muted captions · `black/6` glass washes
- Nav pill: `rgba(0,0,0,0.06)` + `backdrop-blur(42px)`, radius 4px, h 48px
- One accent band: blue `#3670E1` (rgb 54,112,225); green status dot
- Card radius 8px

**Glitch&Grit (accent-discipline model):**

- Stage: `#000000` bg / off-white `#FFFBF6` ink (warm, not pure white)
- Neon per-project accents on mono chrome: `#99F8FF` `#F98DFF` `#8CCAF5` `#9BE187` `#6081D6` `#FFBA6A` `#C6FF1B` `#F85255`
- (We take the _discipline_ — mono chrome, color used surgically — not the multi-neon system.)

### 2.4 Spacing

| Token       | TinyWins               | Glitch&Grit                                     |
| ----------- | ---------------------- | ----------------------------------------------- |
| Page gutter | **80px** (`px-20`)     | **20px** (`px-5`)                               |
| Section pad | 96px bottom            | `clamp(1rem, 0.886rem + 0.568vw, 1.5rem)` fluid |
| Grid gaps   | 16–24px                | 12px                                            |
| Nav height  | 48px pill + 16px inset | 48px bar                                        |

Salt direction: TinyWins' generous gutters on light pages (`clamp(20px, 5vw, 80px)`), keeping the existing 2px hairline gap for the work grid (it works).

### 2.5 Motion (measured)

**TinyWins easing vocabulary (the "feel" to adopt):**

- Workhorse: `0.5s cubic-bezier(0.33, 1, 0.68, 1)` (easeOutCubic) — transform, clip-path, scale
- Expansion: `0.6s cubic-bezier(0.22, 1, 0.36, 1)` (easeOutQuint) — width/height
- Fades: `0.3–0.5s` opacity
- Hero word-swap: words translate `y: −105%` out of `overflow-hidden` line masks

**Glitch&Grit mechanics (what we're replicating):**

- 37 ScrollTriggers on the homepage; batch of ~12 on one trigger (`start: "top center", end: "bottom center", scrub: true`) driving a synchronized scrubbed hero sequence
- SplitType line/word/char splits → staggered mask reveals
- `mix-blend-difference` fixed nav (pure CSS, free)
- Curtain page transition: two fixed half-width panels, `will-change: transform` (was Barba — we rebuild natively)
- Flip plugin for filter re-layout on the work grid
- TextPlugin for text scramble (we already have `components/ScrambleText.tsx`)
- Card hover: image scale + white `opacity-10` overlay + duplicated-arrow swap (one exits up-right, clone enters from bottom-left)

---

## 3. Target architecture

### 3.1 DESIGN.md (full rewrite)

New spec, same skeleton as the legacy file (it's a good skeleton): Direction → Principles → Color → Typography → Buttons → Layout & spacing → Type placement → Surfaces → **Motion (greatly expanded)** → Component recipes → Page modes → Implementation map → Anti-patterns.

Key content changes:

- Direction: light-first, ink-on-paper, dark bands earned; one accent (brand red)
- Type roles rebuilt on **Geist** display/body + **Geist Mono** labels; display spec `ls -0.03em / lh 0.9 / uppercase / w600–700`, fluid `clamp()` scale
- Color: ink `#08090A` / paper `#EAEAEA`–white + **black-opacity ladder** (6/15/40/70%) mirroring the current white ladder; mid gray `#B7B7B7`; dark-band token set; red accent rules (§2.6)
- Radius: rounded shape language from the brand sheet (4/8/16px tokens) replaces the sharp-only rule
- Motion section becomes a first-class spec: easing tokens, the full animation catalog (§3.3), reduced-motion policy
- Keep: media-bleed vs chrome-inset model, 2px hairline work grid, corner caption stacks, no-cn() convention

### 3.2 globals.css (`@theme` rewrite)

- **Semantic token names stay identical** (`--color-background`, `--color-foreground`, `--color-border`, etc.) so existing components keep compiling — only values flip (light values become the `:root` defaults; `[data-theme='dark']` gets the earned-dark set, replacing the current `[data-theme='light']` block).
- Replace Photon color ramps (blue/purple/magenta/… scales) with: ink `#08090A`, paper `#EAEAEA`/white, gray `#B7B7B7`, black-opacity ladders, one red accent ramp (base ≈`#D43E34`, pending §2.6 confirmation), semantic form states.
- New type tokens: fluid display scale (`clamp(2.5rem, 6vw, 8rem)` territory), tracking tokens (`--tracking-display: -0.03em`), label/telemetry tokens move to Geist Mono.
- Radius tokens: `--radius-sm: 4px`, `--radius: 8px`, `--radius-lg: 16px` (brand shape language) — replaces sharp-only defaults.
- New **motion tokens**: `--ease-out-cubic: cubic-bezier(0.33,1,0.68,1)`, `--ease-out-quint: cubic-bezier(0.22,1,0.36,1)`, `--duration-fast: 150ms`, `--duration-base: 300ms`, `--duration-slow: 500ms`, `--duration-reveal: 600ms`.
- Spacing: keep custom scale, add `--spacing-gutter: clamp(20px, 5vw, 80px)`; keep `--spacing-hairline: 2px`.
- Utilities: keep `.page-chrome`, `.media-bleed`, `.media-caption`, `.gap-hairline`, `.btn-*` (restyled values); add `.mask-line` (overflow-clip line wrapper) and `.blend-difference-nav` helpers.
- Keep and extend the `prefers-reduced-motion` block.

### 3.3 Motion system (Glitch&Grit-grade, no Barba)

**Dependencies to install:**

```
gsap @gsap/react lenis
```

Notes:

- GSAP is fully free since the Webflow acquisition, **including SplitText** — use official `SplitText` instead of `split-type` (better line re-splitting on resize). ScrollTrigger, Flip, TextPlugin ship in the core package.
- `lenis` provides `lenis/react` (`ReactLenis` provider).
- React Compiler is on — all GSAP work goes through `useGSAP()` from `@gsap/react` (handles cleanup/scoping; compiler-safe).

**Infrastructure (client components, new):**

| Piece                                  | Purpose                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/motion/LenisProvider.tsx`  | `ReactLenis` root; syncs Lenis → `ScrollTrigger.update()`; drives GSAP ticker; disabled under reduced motion. Mounted in `app/(personal)/layout.tsx`.                                                                                                                                                                                          |
| `components/motion/gsap.ts`            | Central `gsap.registerPlugin(ScrollTrigger, SplitText, Flip, TextPlugin)` + shared easing/duration constants mirroring the CSS tokens                                                                                                                                                                                                          |
| `components/motion/PageTransition.tsx` | **Barba replacement.** Two-panel curtain wipe on route change: fixed `z-[999]` half-width panels animate in on link click, out after navigation. Implementation: a `TransitionProvider` intercepting internal links + `useRouter`, or Next 16 View Transitions API if it proves sufficient (spike in Step 5, Context7 for current Next 16 API) |
| `components/motion/LineReveal.tsx`     | SplitText lines in `overflow-hidden` masks, y:100%→0, stagger ~0.08s, `--ease-out-cubic`, ScrollTrigger `start: "top 85%"`                                                                                                                                                                                                                     |
| `components/motion/WordSwap.tsx`       | TinyWins hero pattern: two stacked copies, per-word `y: ±105%` through line masks                                                                                                                                                                                                                                                              |
| `components/motion/ParallaxMedia.tsx`  | Oversized media in clipped frame, scrubbed `yPercent` (TinyWins negative-inset pattern)                                                                                                                                                                                                                                                        |
| `components/motion/ScrubSection.tsx`   | Pinned/sticky section wrapper, `scrub: true` timeline (G&G `home-trigger` pattern: `start: "top center", end: "bottom center"`)                                                                                                                                                                                                                |
| `components/motion/ClipReveal.tsx`     | `clip-path: inset(100% 0 0)` → `inset(0)` image wipes                                                                                                                                                                                                                                                                                          |
| Existing `components/ScrambleText.tsx` | Keep; optionally migrate to TextPlugin scramble                                                                                                                                                                                                                                                                                                |

**Animation catalog to spec in DESIGN.md (all with measured values from §2.5):**

1. Curtain page transition (route change) — ~0.8s, easeOutQuint, panels wipe from sides
2. Hero display type: SplitText line-mask reveal on load; word-swap variant for the tagline
3. Scrubbed hero/feature sections (ScrollTrigger, scrub: true)
4. Work-grid filter re-layout (Flip)
5. Card hover: media scale 1.05 @ 0.5s easeOutCubic + caption fade/slide + arrow-swap
6. `mix-blend-difference` nav (CSS only)
7. Clip-path image wipes on scroll
8. Marquee (existing keyframes, keep)
9. Reduced-motion: everything collapses to opacity-only or none (extend existing media query; Lenis off; ScrollTrigger animations `gsap.set` to end state)

---

## 4. Steps

> Per-step tools named per qplan convention. Steps 1–3 are the core ask (DESIGN.md + globals.css + fonts); Steps 4–6 are the motion foundation; Steps 7–8 close out.

**Step 0 — Fonts: Geist + Geist Mono** ✅ _no longer blocking_
Both free. Preferred: `npm install geist` (Vercel's package exposes `GeistSans`/`GeistMono` for `next/font`); fallback: `next/font/google` or self-host variable `.woff2` in `public/fonts/`. Verify the current Next 16-compatible import pattern before writing. Legacy Pitch Sans/Untitled Sans/GT Flexa Mono files can be deleted from `public/fonts/` at the end of qcode.
~~Remaining user input~~ **Done 2026-07-26:** accent red confirmed `#E42927`; logo SVGs delivered and placed in `public/brand/` (inventory in §2.6).
_Tool: `Bash (npm install geist)` + `Context7 (geist/next docs)`._

**Step 1 — Rewrite `DESIGN.md`**
Full spec per §3.1, embedding the reference tables from §2 and the animation catalog from §3.3.
_Tool: `/frontend-design` skill (aesthetic direction guardrails) + `Write`._

**Step 2 — Rewrite `app/globals.css` `@theme`**
Per §3.2. Semantic names preserved; light values to `:root`; `[data-theme='dark']` block; motion + tracking + gutter tokens; utilities restyled; prune Photon ramps.
_Tool: `Edit` (multiple hunks). Reference: Tailwind v4 CSS-config conventions already in file._

**Step 3 — Font loading in `app/layout.tsx`**
Swap Pitch Sans `localFont` blocks: `--font-sans` → **Geist**, `--font-mono` → **Geist Mono** (via the `geist` package per Step 0). Keep the same CSS-variable names so `globals.css` `@theme` mappings hold.
_Tool: `Context7 (geist + next.js docs)` → `Edit`._

**Step 4 — Install motion dependencies**
`npm install gsap @gsap/react lenis`. Confirm versions (gsap ≥3.13 for free SplitText).
_Tool: `Bash`._

**Step 5 — Motion infrastructure**
Build `components/motion/*` per §3.3; mount `LenisProvider` + `PageTransition` in `app/(personal)/layout.tsx` (NOT root layout — Studio at `/edit` must stay isolated). Spike View Transitions vs TransitionProvider for the curtain first.
_Tool: `/frontend-design` skill + `Context7` (gsap/react, lenis docs) + `Write`/`Edit`._

**Step 6 — Retrofit existing motion utilities**
Update `.work-card-media-zoom`, `.project-hero-expand-icon` etc. in globals.css to the new easing tokens; extend `prefers-reduced-motion` to cover Lenis/ScrollTrigger (html class hook).
_Tool: `Edit`._

**Step 7 — Sync docs + agent config**

- Root `CLAUDE.md` + `app/CLAUDE.md`: correct the stale font rows (still claim PT Serif/Inter/IBM Plex Mono)
- `.cursor/rules/*.mdc` design mirrors
- Fix `.claude/agents/animation-extractor.md` (+ sibling replicator agents): tool names reference `mcp__playwright__*` but this environment exposes `mcp__plugin_playwright_playwright__*` — blocks `/replicate`
  _Tool: `Grep` → `Edit`._

**Step 8 — Verify (`qcheck`)**

1. `npm run lint`
2. `npm run type-check`
3. `npm run dev` → Playwright: screenshot `/brand`, `/`, `/work` at 390/768/1440px; confirm token preview renders the new system, no layout breakage from token value flips
4. Reduced-motion smoke test (emulate `prefers-reduced-motion` in Playwright)
   _Tools: `Bash`, `mcp**plugin_playwright_playwright**_`or`/qa` skill.\*

---

## 5. Files

**Modify:** `DESIGN.md` (rewrite) · `app/globals.css` (rewrite `@theme` + utilities) · `app/layout.tsx` (fonts) · `app/(personal)/layout.tsx` (mount providers) · `CLAUDE.md` + `app/CLAUDE.md` (font rows) · `.cursor/rules/*` (mirrors) · `.claude/agents/animation-extractor.md` (tool names) · `package.json` (deps)

**Create:** `components/motion/LenisProvider.tsx` · `components/motion/gsap.ts` · `components/motion/PageTransition.tsx` · `components/motion/LineReveal.tsx` · `components/motion/WordSwap.tsx` · `components/motion/ParallaxMedia.tsx` · `components/motion/ScrubSection.tsx` · `components/motion/ClipReveal.tsx` · `components/SaltWordmark.tsx` (inline currentColor wordmark)

**Already landed (pre-qcode):** `public/brand/*.svg` + `brand-identity/assets/logo/*.svg` — 7 logo assets, inventory in §2.6.

**Untouched:** `sanity/**` (no schema impact) · `app/edit/**` (Studio stays isolated — its layout doesn't import globals.css) · generated files.

---

## 6. Risks & notes

- **Token value flip breaks visuals silently:** components hardcoding `text-white`/`bg-black` against the old dark default will invert badly on light. Step 8's screenshot pass exists for this; expect a follow-up component-sweep plan.
- **React Compiler × GSAP:** only via `useGSAP` + refs; no DOM reads in render.
- **Lenis × ScrollTrigger:** must wire `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker`; skipping this causes janky/late triggers.
- **Curtain transition without Barba:** App Router unmounts the old page on navigation — the curtain must fully cover _before_ `router.push`. The TransitionProvider approach handles this; View Transitions API may simplify it (spike in Step 5, verify against Next 16 docs, not training data).
- **`styles/index.css`** (public-site CSS) is minimal — leave as-is this pass.
- **Wordmark recoloring:** `salt-wordmark.svg` is black-fill only. For the dark-band footer / red surfaces, render it inline (React component wrapping the paths, `fill="currentColor"`) or via CSS `mask-image` — don't duplicate per-color SVG files.
- **Two light values:** paper `#EAEAEA` (stage) vs logo light `#E3E3E3` (badge fills). Keep both as tokens; don't "normalize" the logo files.
