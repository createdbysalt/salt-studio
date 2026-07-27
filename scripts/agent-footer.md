## Project context (required reading)

This is the **SALT Studio Client Template**, a Next.js 16 + Sanity 5 starter for building client websites. Before editing or suggesting changes, read the relevant CLAUDE.md files — they were written by reading the actual code and are authoritative.

**Start here:**

- **`CLAUDE.md`** (project root) — tech stack with exact versions, operational commands, critical paths index, non-negotiables
- **`sanity/CLAUDE.md`** — schemas (document vs object vs singleton), GROQ queries via `defineQuery`, live revalidation with `sanityFetch` + `<SanityLive />`, Presentation tool plumbing
- **`app/CLAUDE.md`** — Next.js 16 App Router rules (async `params`, async `draftMode()`), the `(personal)` route group, server-by-default, draft mode end-to-end
- **`components/CLAUDE.md`** — flat component layout, named exports, template-literal Tailwind convention (there is no `cn()` utility), visual editing with `createDataAttribute`, the `OptimisticSortOrder/` server/client split pattern
- **`app/api/CLAUDE.md`** — route handler conventions and draft mode enable endpoint

**Critical:** This template uses Next.js 16.2, React 19.2, Sanity 5.19, and Turbopack. Next.js 16 has breaking changes from the version in your training data. When in doubt about Next.js syntax, read `node_modules/next/dist/docs/` or the CLAUDE.md files above — do not guess from older Next.js knowledge.

**Brand Identity Workflow:** Client projects use the `brand-identity/` folder structure:

- `discovery.json` — Client DNA and voice profile (from `/discover`)
- `audience.json` — ICP profiles and user journey (from `/icp`)
- `strategy.json` — Sitemap and page briefs (from `/strategy`)
- `design.json` — Visual system and components (from `/brief`)
- `research/` — Competitive analysis outputs (from `/research`)
