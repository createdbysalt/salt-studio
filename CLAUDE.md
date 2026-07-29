See **`AGENTS.md`** for the Next.js 16 warning and the AI-assistant index (Cursor + Claude Code).

# Salt Studio

A Next.js 16 + Sanity 5 website for **Salt Studio** (`createdbysalt.com`). Tagline: _Subtle. Essential. Transformative._ Content lives in Sanity project `jkqf2ng5`, the Studio is mounted at `/edit`, and the public site lives under the `(personal)` route group.

**Do not write to Photon’s Sanity project (`25ywlhce`).** Env secrets live in 1Password vault `salt-studio-development`, item `salt-studio-sanity` — see `.env.example`.

> **This is Next.js 16**, which has breaking changes from the version in your training data. When in doubt about Next.js syntax or APIs, read `node_modules/next/dist/docs/` or use Context7 instead of guessing. Full warning in `AGENTS.md`.

## Project Status

```bash
bash scripts/setup-client.sh
```

This script:

1. Creates the `brand-identity/` folder with JSON templates for discovery, audience, strategy, and design
2. Updates `package.json` with the client codename
3. Optionally sets up Sanity via MCP or manual credentials
4. Optionally removes the intro-template welcome card
5. Optionally initializes fresh git history

After setup, use the workflow commands:

- `/discover` → Fills `brand-identity/discovery.json`
- `/icp` → Fills `brand-identity/audience.json`
- `/strategy` → Fills `brand-identity/strategy.json`
- `/brief` → Fills `brand-identity/design.json`

Visit `/brand` to see and customize the visual design tokens.

## Tech stack (exact versions pinned)

| Thing        | Version            | Notes                                                                         |
| ------------ | ------------------ | ----------------------------------------------------------------------------- |
| Next.js      | 16.2.2             | App Router, Turbopack for both dev and build                                  |
| React        | 19.2.4             | React Compiler **enabled** (`reactCompiler: true` in `next.config.ts`)        |
| Sanity       | 5.19.0             | Studio mounted at `/edit` via `app/edit/[[...index]]/page.tsx`                |
| next-sanity  | 12.2.1             | Provides `defineQuery`, `defineLive`, `defineEnableDraftMode`                 |
| Tailwind CSS | 4.2                | CSS-based config in `app/globals.css`; includes `@tailwindcss/typography`     |
| TypeScript   | 5.9.3              | `strict: false` but `strictNullChecks: true`                                  |
| Turbopack    | built-in           | Used in both `dev` and `build` scripts                                        |
| Fonts        | `next/font/google` | Geist (`--font-sans`) + Geist Mono (`--font-mono`) loaded in `app/layout.tsx` |

Don't assume patterns from older Next.js versions work here. When writing Next-specific code, verify against the installed version first.

## Operational commands

```bash
# Development
npm run dev          # Turbopack dev server — auto-runs `typegen` first via the `predev` hook
npm run build        # `next build --turbopack && sanity manifest extract --path public/studio/static`
npm run start        # Next production server

# Types and schema
npm run typegen      # `sanity schema extract && sanity typegen generate` — regenerates sanity.types.ts and schema.json
npm run type-check   # Runs typegen again, then `tsc --noEmit`

# Lint / format
npm run lint         # `eslint .`
npm run lint:fix     # Runs format, then `eslint . --fix`
npm run format       # `prettier --write . --ignore-path .gitignore`

# Other
npm run analyze      # `next experimental-analyze --serve` — bundle analyzer
```

**Key gotcha:** `predev` runs `npm run typegen` automatically before `dev`. After changing a Sanity schema, the next `npm run dev` will pick up the new types. But if you're running in some other mode (running tests, running build), you must run `npm run typegen` manually or types will be stale.

## Critical paths — where things live

### Sanity

| Concept                                          | Path                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------- |
| Studio config (plugins, schemas, presentation)   | `sanity.config.ts`                                                     |
| CLI config (for `sanity` commands)               | `sanity.cli.ts`                                                        |
| Env vars + `studioUrl` constant                  | `sanity/lib/api.ts`                                                    |
| `createClient` — the Sanity client               | `sanity/lib/client.ts`                                                 |
| `SanityLive` + `sanityFetch` — live revalidation | `sanity/lib/live.ts`                                                   |
| GROQ queries (all use `defineQuery`)             | `sanity/lib/queries.ts`                                                |
| Server-only read token                           | `sanity/lib/token.ts`                                                  |
| Image URL builder + `resolveHref` helper         | `sanity/lib/utils.ts`                                                  |
| Presentation tool resolve config                 | `sanity/plugins/resolve.ts`                                            |
| Singleton plugin + structure builder             | `sanity/plugins/settings.tsx`                                          |
| Schemas — documents                              | `sanity/schemas/documents/` (`page.ts`, `project.ts`)                  |
| Schemas — singletons                             | `sanity/schemas/singletons/` (`home.ts`, `settings.ts`)                |
| Schemas — objects                                | `sanity/schemas/objects/` (`duration/`, `timeline.ts`, `milestone.ts`) |
| **Generated** — TypeScript types                 | `sanity.types.ts` ⚠️ never hand-edit                                   |
| **Generated** — schema extract                   | `schema.json` ⚠️ never hand-edit                                       |

### App Router

| Concept                                          | Path                                      |
| ------------------------------------------------ | ----------------------------------------- |
| Root layout (fonts, `<html>`/`<body>`)           | `app/layout.tsx`                          |
| Global CSS                                       | `app/globals.css`                         |
| Public site route group                          | `app/(personal)/`                         |
| Public site layout (Navbar, Toaster, SanityLive) | `app/(personal)/layout.tsx`               |
| Home page                                        | `app/(personal)/page.tsx`                 |
| Dynamic pages by slug                            | `app/(personal)/[slug]/page.tsx`          |
| Project detail                                   | `app/(personal)/projects/[slug]/page.tsx` |
| Sanity Studio mount (catch-all)                  | `app/edit/[[...index]]/page.tsx`          |
| Draft mode enable endpoint                       | `app/api/draft-mode/enable/route.ts`      |

### Components

Flat layout — no feature subdirectories. Read `components/CLAUDE.md` for conventions. One exception: `components/OptimisticSortOrder/` splits into `index.tsx` (server) + `index.client.tsx` (client) — that's the pattern for any component that needs both halves.

### Analytics

| Concept                    | Path                                  |
| -------------------------- | ------------------------------------- |
| All exports (barrel)       | `lib/analytics/index.ts`              |
| Salt's GTM (from env)      | `lib/analytics/gtm.tsx`               |
| Client's GA4 (from Sanity) | `lib/analytics/client-ga.tsx`         |
| Consent banner + provider  | `lib/analytics/consent.tsx`           |
| Typed event helpers        | `lib/analytics/events.ts`             |
| Page view tracking         | `lib/analytics/page-view-tracker.tsx` |
| Scroll depth tracking      | `lib/analytics/scroll-tracker.tsx`    |
| Web Vitals tracking        | `lib/analytics/web-vitals.tsx`        |
| Error tracking             | `lib/analytics/error-tracker.tsx`     |
| Debug overlay (dev only)   | `lib/analytics/debug-overlay.tsx`     |
| Type definitions           | `lib/analytics/types.ts`              |

**Dual tracking:** Salt Studio and clients each get their own analytics data.

- **Salt's GTM/GA4** — Set `NEXT_PUBLIC_GTM_ID` in `.env.local` AND Vercel. Client cannot edit this.
- **Client's GA4** — Set in Sanity (Developer Settings → "Your Google Analytics ID"). Client can self-serve.

See `lib/analytics/CLAUDE.md` for full documentation.

### SEO & AEO

| Concept                   | Path                          |
| ------------------------- | ----------------------------- |
| All exports (barrel)      | `lib/seo/index.ts`            |
| Environment config        | `lib/seo/config.ts`           |
| Structured data (JSON-LD) | `lib/seo/structured-data.tsx` |
| Dynamic sitemap           | `app/sitemap.ts`              |
| Robots.txt                | `app/robots.ts`               |

Schemas available: Organization, WebSite, BreadcrumbList, Article, FAQ, Service, HowTo, CreativeWork, LocalBusiness, SpeakableWebPage. See `lib/seo/CLAUDE.md` for full documentation on adding structured data to new pages.

### Other

| Thing                         | Path                                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| Tailwind config               | `app/globals.css` (CSS-based, v4 style)                                                 |
| Prettier config               | `prettier.config.cjs` (extends Sanity's)                                                |
| ESLint config                 | `eslint.config.mjs` (flat config, minimal — react-hooks only)                           |
| PostCSS config                | `postcss.config.js`                                                                     |
| TS config                     | `tsconfig.json` (`@/*` → `./*`)                                                         |
| Vercel intro card (removable) | `intro-template/index.tsx` — delete the import in `app/(personal)/layout.tsx` to remove |
| Deployment config (Netlify)   | `netlify.toml`                                                                          |

## Non-negotiables

1. **Never hand-edit `sanity.types.ts` or `schema.json`.** They're generated by `sanity schema extract && sanity typegen generate`. If you need to change them, change the schema in `sanity/schemas/` and re-run `npm run typegen`.
2. **Re-run `npm run typegen` after any schema change.** `predev` does this automatically before `npm run dev`, but not before tests or builds in isolation.
3. **Server components by default.** Only add `'use client'` when the component needs browser APIs, state, effects, or event handlers. React Compiler is on — don't manually memoize.
4. **Tailwind classes go inline in `className`, with template literals for conditionals.** There is no `cn()` / `clsx` / `classnames` utility in use (despite `classnames` being listed in `package.json`, nothing actually imports it). Don't add one just to look tidier — match the existing pattern. See `components/Navbar.tsx` and `components/Header.tsx` for examples.
5. **All GROQ queries must use `defineQuery`** from `next-sanity`. That's what gives you end-to-end types through `sanity.types.ts`.
6. **Sanity reads at request time must go through `sanityFetch`** (from `sanity/lib/live.ts`), not a bare `client.fetch`. That's what wires up live revalidation and draft mode.
7. **Image sources:** only `cdn.sanity.io` is allowed in `next.config.ts` `remotePatterns`. Adding another source requires updating that file.
8. **Don't edit `AGENTS.md` content inside the `<!-- BEGIN:nextjs-agent-rules -->` / `<!-- END:nextjs-agent-rules -->` markers** — those markers suggest it's managed by tooling. If you need to add project rules, add them outside the markers or in this file.
9. **`next.config.ts` sets `typescript.ignoreBuildErrors = true` on Vercel production builds.** Don't treat this as a safety net — always run `npm run type-check` before shipping.
10. **`.env.local` is gitignored** and contains real secrets (Sanity tokens). Never commit it. Use `.env.example` as the template when onboarding.

## Environment variables

Required:

- `NEXT_PUBLIC_SANITY_PROJECT_ID` — public, referenced in `sanity/lib/api.ts`
- `NEXT_PUBLIC_SANITY_DATASET` — public, referenced in `sanity/lib/api.ts`
- `SANITY_API_READ_TOKEN` — server-only, referenced in `sanity/lib/token.ts` (wrapped in `server-only` import; throws at startup if missing)

Optional:

- `NEXT_PUBLIC_SANITY_API_VERSION` — defaults to `2025-02-27`
- `NEXT_PUBLIC_SANITY_PROJECT_TITLE` — defaults to `"Next.js Personal Website with Sanity.io"`; controls Studio navbar
- `SANITY_API_WRITE_TOKEN` — only needed if adding write-capable API routes
- `NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER` / `NEXT_PUBLIC_VERCEL_GIT_PROVIDER` / `NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG` — only used by `intro-template/` for the welcome card; can be removed alongside that component

See `.env.example` for a template.

## The relationship between docs, Cursor, and `.claude/`

- **`CLAUDE.md` files (root + per-folder) describe the codebase** — what exists, where it lives, conventions, generated vs hand-written.
- **`AGENTS.md`** — unified entry for Cursor and other assistants; summarizes non-negotiables and points here.
- **`.cursor/rules/*.mdc`** — Cursor rule bridge; scoped rules mirror folder `CLAUDE.md` files. Keep in sync when you change conventions.
- **`.claude/agents/`, `.claude/commands/`, `.claude/skills/`** — Claude Code workflows (review, audit, design), not codebase layout.

When editing a file, read the relevant `CLAUDE.md`. When running a workflow, check `.claude/commands/` and `.claude/agents/`. Don't duplicate between layers.

The `.claude/` workspace was originally copied from a different project (Salt Core) and has been trimmed for this template. See `.claude/README.md` for the current shape.

## Folder-scoped guides

- `sanity/CLAUDE.md` — schema conventions, GROQ patterns, live revalidation
- `app/CLAUDE.md` — route groups, server vs client, draft mode
- `app/api/CLAUDE.md` — route handler conventions
- `app/edit/CLAUDE.md` — Studio at `/edit`, CSS isolation, NextStudio mount
- `components/CLAUDE.md` — flat layout, template-literal Tailwind, server/client splits
- `lib/analytics/CLAUDE.md` — GTM setup, event helpers, consent, debugging
- `lib/seo/CLAUDE.md` — structured data, AEO, sitemap, adding schemas to new pages
- `brand-identity/asset-tagging-strategy.md` — **read before uploading anything to the Sanity Media Library.** Canonical tagging convention (4 prefix dimensions: `type-`, `color-`, `use-`, `style-`), title/description rules, how to extend the vocabulary. `scripts/upload-brand-assets.mjs` is the reference implementation.

## Velocity Shortcuts (Trigger Words)

Use these triggers to enforce reliable workflows:

| Trigger    | Action                                                                                                                                                                                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `qplan`    | Analyze the request and codebase. Draft a step-by-step plan. Identify files to create/modify. **For EACH step, include the specific tool/skill/command to use** (see skills list in system prompt). **Save plan to `docs/plans/YYYY-MM-DD-<feature-name>.md`**. DO NOT write code yet. |
| `qcode`    | Implement the approved plan. **Use the tools specified for each step** (e.g., `/frontend-design` for UI). Run `npm run lint` before finishing.                                                                                                                                         |
| `qcheck`   | Review changes for: 1) Security vulnerabilities 2) Type safety 3) Performance bottlenecks 4) Alignment with project patterns. **Run `npm run type-check` to verify types.**                                                                                                            |
| `qfix`     | Read the error message, analyze the stack trace with `grep`, and propose a fix. Use `/systematic-debugging` skill for complex issues.                                                                                                                                                  |
| `qrestart` | Kill any process on port 4000 (`lsof -ti:4000                                                                                                                                                                                                                                          | xargs kill -9`), then start the dev server (`npm run dev`). Use when port 4000 is occupied or the server needs a fresh restart. |
| `qtypes`   | Run `npm run typegen` to regenerate Sanity types after schema changes. Required before builds if schemas changed outside of `npm run dev`.                                                                                                                                             |
