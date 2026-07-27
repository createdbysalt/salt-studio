---
date: 2026-04-09
status: superseded — see 2026-04-09-template-plan.md
owner: Gabriella
---

# Velocity Import Plan

A plan for bringing AI-friendly patterns from `project_velocity_starter` into the client template **without** restructuring the codebase, plus a cleanup of the `.claude/` workspace that was copied wholesale from another project.

## Context

**What Salt Client Template is.** A single Next.js 16.2 + Sanity 5.19 personal website / portfolio. Not a monorepo. No backend, no payments, no auth, no multi-tenant database, no marketing funnel, no e-commerce. The Studio is mounted at `/studio`, content lives in Sanity, types are auto-generated via `sanity typegen`.

**What `project_velocity_starter` is.** A Turborepo monorepo (`apps/frontend` + `apps/backend` + `packages/*` + `e2e/`) with strict cross-layer dependency rules, schema-first contracts in `@repo/shared-types`, and 8 CLAUDE.md files providing folder-scoped guidance. Built to be AI-native from the ground up.

**What we want.** Pull the *patterns* that make Velocity AI-friendly into Salt Client Template — especially folder-scoped CLAUDE.md files and a real root CLAUDE.md — without forcing a layout change. Salt Client Template should keep its current shape.

**What we are NOT doing.**
- No monorepo conversion. No `apps/` or `packages/` split. No Turbo, no pnpm workspaces.
- No restructuring of `app/`, `components/`, or `sanity/`.
- No `packages/shared-types` — Sanity already generates `sanity.types.ts`. That *is* our schema-first contract.
- No empty placeholder folders (Velocity has a few; copying empty folders is anti-velocity).

**Two workstreams.** This plan has two independent halves:
1. **Add** velocity patterns that don't exist in Salt Client Template yet (CLAUDE.md files, docs/, mcp.json, .env.example).
2. **Prune** the `.claude/` workspace that was copied from another project and is now actively misleading Claude with irrelevant agents and stale state.

The pruning is arguably higher leverage than the additions, because dead weight in `.claude/` is *actively making Claude worse* — it pulls in irrelevant agents, suggests inappropriate workflows, and contains hardcoded paths from the other project.

---

# Part 1 — Velocity patterns to bring over

## Tier 1 — High leverage, do these first

### 1.1 Write a real root `CLAUDE.md`

**Current state.** `CLAUDE.md` is a one-line stub: `@AGENTS.md`. `AGENTS.md` is a single warning about Next.js 16 breaking changes. There is no central document that tells Claude how this codebase actually works.

**What to write.** Model after Velocity's root CLAUDE.md, adapted for a single app:

- **Operational commands** with the exact `npm` invocations:
  - `npm run dev` (Turbopack, with `predev` running `npm run typegen` automatically — Claude needs to know this)
  - `npm run build` (Turbopack + `sanity manifest extract`)
  - `npm run typegen` (regenerates `sanity.types.ts` and `schema.json`)
  - `npm run type-check`, `npm run lint`, `npm run lint:fix`, `npm run format`
- **Tech stack pinning** with versions: Next 16.2.2, React 19.2.4, Sanity 5.19.0, Tailwind 3.4, TypeScript 5.9.3, Turbopack. Reiterate the AGENTS.md warning that this is *not* the Next.js Claude was trained on.
- **Critical paths index** mapping concept → file:
  - Sanity schemas → `sanity/schemas/`
  - GROQ queries → `sanity/lib/queries.ts`
  - Generated types → `sanity.types.ts` (do NOT hand-edit)
  - Live revalidation hooks → `sanity/lib/live.ts`
  - Public site routes → `app/(personal)/`
  - Sanity Studio mount → `app/studio/[[...index]]/page.tsx`
  - Draft mode toggle → `app/api/draft-mode/enable/route.ts`
- **Non-negotiables**:
  - Re-run `npm run typegen` after any schema change.
  - Never hand-edit `sanity.types.ts` or `schema.json`.
  - Server components by default; `'use client'` only for interactivity.
  - Use the `cn()` utility, not string concatenation, for Tailwind classes.
  - Don't import the original Vercel `intro-template/` content into anything new.
- **Pointer to `.claude/`** explicitly stating that `.claude/agents/`, `.claude/commands/`, and `.claude/skills/` are the source of truth for *agent behavior and workflows*, while CLAUDE.md files describe the *codebase*. This prevents drift between the two systems.

**Keep `AGENTS.md` as-is** since `@AGENTS.md` is the import target. The warning is good and should stay.

**Estimated effort.** ~1 hour to write well. Single biggest unlock in this whole plan.

### 1.2 Folder-scoped CLAUDE.md files

In rough order of payoff:

| Folder | Why it's high-value | What goes in it |
|---|---|---|
| `sanity/` | Most Salt Client Template-specific surface; most easily hallucinated by Claude | GROQ query patterns with `defineQuery`, where to add a doc type vs object vs singleton, how `next-sanity/live` revalidation works, the Presentation tool resolve config in `plugins/resolve.ts`, the singleton plugin in `plugins/settings.tsx`, custom input components (the `Duration` example) |
| `sanity/schemas/` | Conventions for adding content types | document vs object vs singleton, field naming, when to extract an object, when to use a singleton, how to wire a custom React input |
| `app/` | Next 16 + App Router rules | Server-by-default, when `'use client'` is allowed, the `(personal)` route group convention, draft mode flow end-to-end, where the studio is mounted and why it's catch-all, fonts loaded via `@next/font` |
| `components/` | Lightweight; document the existing pattern, don't impose Velocity's | The flat-folder convention, `cn()` usage, when to split client/server like `OptimisticSortOrder/index.tsx` + `index.client.tsx` does, how `CustomPortableText` extends portable text rendering |
| `app/api/` | Tiny but important | Route handler conventions, draft mode specifics |

**Skip** `styles/`, `types/`, `public/` — too thin to justify a file. Claude can read them in seconds.

**Skip** `intro-template/` — it's the original Vercel onboarding card. Per the README it gets removed when you delete the import in `app/(personal)/layout.tsx`. Document its status in the root CLAUDE.md instead.

### 1.3 Lightweight `docs/` folder

Velocity's `docs/` is the unsung hero of the template. For Salt Client Template, start small and grow:

```
docs/
├── architecture/
│   ├── content-model.md     ← how Sanity schemas map to routes (home, [slug], projects/[slug])
│   ├── data-flow.md         ← request → GROQ → component → live revalidation
│   └── draft-mode.md        ← how preview works end-to-end
├── decision-log/
│   └── (start one when the next architectural call happens)
└── plans/
    └── 2026-04-09-velocity-import-plan.md   ← this file
```

**Don't pre-create** `guides/`, `design/`, `content-model/`. Empty folders rot. Add them when you have content.

## Tier 2 — Worthwhile but lower urgency

### 2.1 `mcp.json` at the project root

Salt Client Template has no project-level `mcp.json`. Velocity has one with playwright, github, postgres, stripe, context7, shadcn, etc.

For Salt Client Template, the minimum viable list is much shorter:
- **`context7`** — explicitly justified by the AGENTS.md warning (Next 16 docs aren't in training data; Context7 fetches them live)
- **`sanity`** — if Sanity has an MCP server published, otherwise skip
- **`github`** — for repo / PR / issue work
- **`playwright`** — only if you actually plan to add visual testing

Skip postgres, stripe, supabase entirely.

### 2.2 `.env.example`

Salt Client Template's `.gitignore` excludes `.env*.local` but no template is committed. A two-minute fix that ends the "what env vars do I need" question forever. Pull the keys from `.env.local` (project ID, dataset, API token, etc.) without their values.

### 2.3 Velocity triggers (`qplan` / `qcode` / `qcheck` / `qfix`)

Velocity uses these as verbal shortcuts in CLAUDE.md to enforce a structured plan→implement→audit→fix loop.

Salt Client Template already has 40+ slash commands in `.claude/commands/`. The honest move here is **map the trigger concept to existing slash commands** (e.g., "for planning, use `/analyze-codebase`; for review, use `/pragmatic-code-review`") rather than inventing parallel verbal triggers.

This is a documentation task in the root CLAUDE.md, not a separate file.

## Tier 3 — Skip

| Velocity feature | Why we skip it for Salt Client Template |
|---|---|
| Monorepo (`apps/`, `packages/`, Turbo, pnpm workspaces) | Salt Client Template is a single app. Hard no. |
| `packages/shared-types` | `sanity.types.ts` is auto-generated and already plays this role. |
| `e2e/` isolated workspace | Only if/when we actually add Playwright. Don't pre-build scaffolding. |
| `brand/` folder | Velocity's is empty. Don't copy empty folders. |
| `.cursor/rules/` | Only if you actually use Cursor. |
| `tools/workspace-plugin/` | Velocity's is barely populated; Salt Client Template's `.claude/` already does more. |

---

# Part 2 — Prune `.claude/`

## How we got here

The `.claude/` folder was copied wholesale from another project (Salt Core / studio-agency SaaS). That project was very different from Salt Client Template: B2B, multi-tenant, payments, client onboarding, proposals, calendar booking, messaging. The agents, commands, scripts, and skills are heavily weighted toward those domains.

There is also leftover **execution state** from that other project — Ralph orchestration runs, PRD JSON files, log archives — and **hardcoded paths** in `settings.local.json` pointing at `salt-core-main`.

The cost of leaving this in place isn't just disk space. It's that Claude reads these files, sees agents like `payment-keeper` and `database-keeper`, and may suggest patterns that don't apply to a Sanity-only personal site. The dead weight is actively misleading.

## What to KEEP (lean, useful for any frontend project)

### Agents (5)
- `code-reviewer` — universally useful
- `architect` — system design review
- `design-system-guardian` — design consistency
- `visual-validator` — component/design validation
- `page-director` — could pivot to portfolio content orchestration (verify it's not Salt-Core-specific before keeping)

### Commands (8)
- `code-quality`
- `pragmatic-code-review`
- `design-review`
- `security-review`
- `docs-sync`
- `analyze-codebase`
- `ds-check` (design-system check)
- `brief` (design brief creation)

### Skills (6)
- `testing-patterns`
- `webapp-testing`
- `systematic-debugging`
- `frontend-design`
- `interaction-patterns`
- `design-brief-creation`

### Hooks (all 5)
- `protect-main.sh`
- `block-heredoc-writes.sh`
- `format-on-save.sh`
- `pre-commit.sh`
- `hooks.json`

These generalize cleanly. Keep all of them.

### Settings
- `settings.json` — keep as-is. Default agent is `architect`, plugins are reasonable, `ralph-loop` is already disabled, hooks are wired. Good shape.

## What to CUT (clearly irrelevant for a Sanity portfolio)

### Agents (~18-24)

Anything tied to B2B SaaS, payments, multi-tenant DBs, marketing/conversion funnels, or studio-agency operations:

- `payment-keeper` — no payments in Salt Client Template
- `database-keeper` — assumes Supabase/Postgres + RLS; Salt Client Template uses Sanity
- `icp-analyst` — no customer targeting on a personal site
- `client-discovery` — no client model
- `ux-strategist`, `ux-analyst`, `ux-optimizer`, `ux-pattern-scout` — heavy B2B/B2C UX research; overkill for portfolio
- `marketing-copywriter`, `marketing-page-builder` (the latter is hardcoded to "Salt Core")
- `mdx-content-writer` — references "Salt Core" in context per the inventory
- `conversion-reviewer` — not a conversion-optimized site
- `search-optimizer` — minimal SEO need for a personal portfolio
- `social-orchestrator` — not relevant
- `creative-director`, `strategic-ideator` — tied to studio operations / "products" model
- `security-audit` — overkill for a static-ish personal site
- `apify-researcher`, `gemini-researcher` — heavy research infra
- `animation-extractor`, `style-extractor`, `component-replicator` — only useful if cloning others' designs (see replicator-output below)

**Decide-yourself bucket:** `brand-identity-steward`, `design-translator` — these *could* be useful for personal brand work but are probably more weight than they're worth on a solo portfolio. Lean cut.

### Commands (~24-32)

Same logic. Cut anything mapping to the agents above:
- All `payment*`, `database*`, `icp`, `discover`, `ideate`, `strategy`, `solution`, `problem`
- `ux-review`, `ux-improve`, `optimize`, `copy`, `social`, `write`
- `page`, `build-page`, `review` (conversion audit), `intelligence`, `project`, `ticket`, `research`, `replicate`, `scout`, `lyra`, `brand-check`
- **All `ralph-*` commands** (7+) — Ralph orchestration is not appropriate for a single-app personal site

### Skills (~6-10)

- `icp-development` — no ICP work
- `prd` — tied to Ralph PRD generation
- `product-planning` — Kano/JTBD/blue ocean frameworks; not for a portfolio
- `brand-voice-extraction` — heavyweight; only if doing deep brand work
- `conversion-audit` — not applicable
- `pixel-perfect-extraction` — only if cloning reference designs

**Decide-yourself bucket:** `deep-research`, `react-ui-patterns` — could go either way.

### Scripts

All 9 Ralph scripts go:
- `ralph.sh`, `ralph-docker.sh`, `ralph-orchestrate.sh`, `ralph-watchdog.sh`, `ralph-worktree.sh`, `ralph-logs.sh`, `ralph-lock.sh`, `ralph-archive.sh`, `prd-orchestrate.sh`

`gemini-research.sh` is generic but heavy — keep only if you actively use Gemini Deep Research from this project. Otherwise cut.

### `.claude/docker/`

Cut entirely. Salt Client Template deploys to Vercel/Netlify (per `netlify.toml`), not via containerized Ralph agents. The Dockerfile + compose are for running Ralph in containers, which we're not doing.

This includes `.claude/docker/ralph-logs/` which contains logs from old PRD runs (calendar-meetings, e2e, intake, knowledge-base, payments-onboarding, proposals, sprint3-foundation) — all from the other project.

### `.claude/prompts/ralph-agent.md`

Cut. Master prompt for the Ralph autonomous loop. Not used here.

### `.claude/ralph/`

Cut entirely. Two directories of stale execution state from the other project:

- `.claude/ralph/archive/exec-20260130-sprint3-client-journey/` — 8 PRD files. Quote from one: *"As a studio owner, I need a proposals table..."* with a database schema including `proposals`, `proposal_templates`, `onboarding_checklists`, `client_meetings`, `calendar_connections`. **Definitively the other project.**
- `.claude/ralph/orchestration/exec-20260202-messaging/` — 7 PRD files referencing `studio_id`, `client_id`, `conversations` table. **Also the other project.**

These are dated Jan 30 and Feb 2, 2026. They're not just irrelevant; they're stale state from a different codebase. Claude reading these will be misled.

### `.claude/replicator-output/`

Cut entirely (or move out of the project). ~348KB across these subdirs:
- `linear/` (16K), `linear-components/` (184K), `linear-extraction/` (88K), `linear-hero/` (empty)
- `vercel-extraction/` (60K)

These are extracted designs from Linear and Vercel. **Nothing in Salt Client Template's `app/` or `components/` actually imports any of this** — verified by the inventory. It's inert reference material. If you ever want to reference Linear's animations or Vercel's typography again, you can re-extract them from source.

If you want to keep them as a reference library, move them outside the project repo (e.g., a `~/Developer/design-references/` folder). Don't ship them with Salt Client Template.

### `.claude/settings.local.json` — needs surgery, not deletion

This file is git-ignored and user-specific, so it stays. But it has accumulated a lot of cruft:

**Hardcoded paths to the other project (must remove):**
```
"Bash(\"/Users/gabriellamartins/Developer/GitHub/salt-core-main/salt-core/app/(serve)/serve/branding/loading.tsx\")"
"Bash(\"/Users/gabriellamartins/Developer/GitHub/salt-core-main/salt-core/app/(serve)/serve/branding/error.tsx\")"
"Bash(app/(serve)/serve/page.tsx)"
"Bash(\"app/(serve)/serve/bridge/settings/page.tsx\")"
"Bash(\"app/(serve)/serve/page.tsx\")"
```
These reference `salt-core-main` paths and `(serve)` route groups that don't exist in Salt Client Template. Pure leftover state.

**Permissions to remove:**
- All `docker:*` and `docker-compose:*` (Salt Client Template isn't containerized)
- All Supabase MCP tool permissions (Salt Client Template uses Sanity, not Supabase)
- All Stripe MCP tool permissions (no payments)
- All `gcloud` commands (Netlify/Vercel deploy, not GCP)

**Permissions to trim:**
- The WebFetch allowlist has 100+ domains. Trim to the essentials Salt Client Template actually needs: `github.com`, `sanity.io`, `nextjs.org`, `vercel.com`, plus whatever Context7 and design references you use day-to-day.

**Backup file:** `settings.local.json.backup` exists. Delete it.

## What to ADJUST (keep but rewrite for Salt Client Template)

### `.claude/tool-registry.md`

After the prune, this index is out of date. Regenerate it to reflect the trimmed toolset. This becomes the canonical "what's actually in `.claude/` and what does it do" document.

### Add a `.claude/README.md`

There currently isn't one. After the prune, write a short README that tells the next Claude session:
- This `.claude/` was originally copied from another project and trimmed for Salt Client Template
- What's in each subfolder
- Which agents/commands/skills are active
- That the root `CLAUDE.md` describes the codebase, while `.claude/` describes agent behavior

This is the explicit boundary between the two systems and prevents future drift.

---

# Part 3 — Suggested order of operations

When you're ready to actually execute (separate session, not now):

1. **Prune `.claude/` first.** This is the highest-leverage move because the dead weight is actively misleading. Do the cuts in this order so each step is reviewable:
   1. Delete `.claude/ralph/` and `.claude/docker/` (largest stale-state items, zero risk)
   2. Delete `.claude/replicator-output/` (or move outside the project)
   3. Delete the agent files in the CUT list
   4. Delete the command files in the CUT list
   5. Delete the skill folders in the CUT list
   6. Delete `.claude/scripts/ralph-*.sh` and `prd-orchestrate.sh`
   7. Delete `.claude/prompts/ralph-agent.md`
   8. Surgery on `settings.local.json` (remove salt-core paths, docker, Supabase, Stripe, gcloud, trim WebFetch)
   9. Delete `settings.local.json.backup`
2. **Write the root `CLAUDE.md`** (Tier 1.1). Single biggest unlock for future sessions.
3. **Write `sanity/CLAUDE.md`** (Tier 1.2) — most Salt Client Template-specific surface.
4. **Write `app/CLAUDE.md` and `components/CLAUDE.md`** as a pair.
5. **Add `docs/architecture/data-flow.md`** as the first real architecture doc. Grow `docs/architecture/` only as needed.
6. **Add `mcp.json`** with at least Context7.
7. **Add `.env.example`** by templating from `.env.local`.
8. **Regenerate `.claude/tool-registry.md`** and write `.claude/README.md` to lock in the new shape.

Steps 1 and 2 are independent and could be done in either order. Everything from step 3 onward depends on having the root CLAUDE.md to anchor the cross-references.

---

# Open questions for you

Things I'd want your call on before executing:

1. **Is `page-director` actually generic, or is it a Salt Core agent?** I marked it KEEP based on the name but should verify by reading the file.
2. **Do you ever use `gemini-research.sh` for Salt Client Template?** If not, cut it with the rest of the scripts.
3. **`replicator-output/` — delete or relocate?** If you might want it as a reference library, I'd move it to `~/Developer/design-references/` rather than delete outright.
4. **Any of the CUT agents you specifically want to keep?** I was opinionated. Some of these (e.g., `creative-director`, `brand-identity-steward`) could be useful if you're doing portfolio brand work — your call.
5. **Do you want a `.cursor/rules/` bridge?** Only matters if you also use Cursor on this project. Velocity has one; Salt Client Template doesn't.
6. **Should the root `CLAUDE.md` reference specific agents from `.claude/agents/` by name?** Risk: tighter coupling between the two systems. Benefit: faster routing for Claude. I'd lean toward referencing them by category ("for code review use a code review agent") rather than by exact name, to keep the systems loosely coupled.

---

# Appendix: rough size of the cleanup

- **Remove ~21 of 29 agents** (~72%)
- **Remove ~32 of 40 commands** (~80%)
- **Remove ~10 of 16 skills** (~62%)
- **Remove 9 of 10 scripts** (~90%)
- **Remove entire `.claude/docker/`, `.claude/ralph/`, `.claude/replicator-output/`, `.claude/prompts/`**
- **Surgery on `settings.local.json`** (remove salt-core paths, ~5 hardcoded references; remove docker/Supabase/Stripe/gcloud permissions)

By file count this is a ~70-80% reduction in `.claude/`. By disk space the reduction is even larger because of the Ralph archives and replicator output. What's left is a lean, focused workspace appropriate for a single-app Next.js + Sanity personal site.
