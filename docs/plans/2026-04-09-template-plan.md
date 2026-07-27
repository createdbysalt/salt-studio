---
date: 2026-04-09
status: in-progress
owner: Gabriella
supersedes: docs/plans/2026-04-09-velocity-import-plan.md (partially — that plan was premised on this being a specific personal site)
---

# Salt Client Template — unified plan

## Decisions (resolved 2026-04-09)

| Question | Decision |
|----------|----------|
| **C.1 Template name** | "Salt Client Template - Next.js and Sanity" |
| **C.2 Does template run as working site?** | Yes (Option A) — runs out of the box with placeholder content |
| **C.3 Per-client Sanity project** | Use Sanity MCP server (`https://mcp.sanity.io`) to create projects automatically during onboarding |
| **C.4 Client artifact folder structure** | Minimal `brand-identity/` folder (see below) |
| **C.5 intro-template/ folder** | Keep it; onboarding script removes it |
| **C.6 Keep velocity-import plan?** | Yes, as historical reference |
| **C.7 Add context block to commands?** | Yes |

### Client artifact structure (Option C — minimal)

```
brand-identity/
├── discovery.json    # Client DNA, voice profile, constraints — everything about the client
├── audience.json     # ICP profiles, user journeys — who they're talking to
├── strategy.json     # Sitemap, page briefs, content requirements — site planning
├── design.json       # Design brief, visual system — look and feel
└── assets/
    ├── logo/
    ├── fonts/
    └── images/
```

Each JSON file consolidates what was previously split across multiple files. Simpler to manage, easier to reference.

### Sanity MCP integration

The template will use Sanity's official MCP server for project creation:
- Server: `https://mcp.sanity.io`
- Setup: `npx sanity mcp setup` (auto-configures Claude Code)
- Capability: Create projects, schemas, datasets, and content programmatically
- Auth: OAuth with Salt Studio's Sanity account

### Already completed

- [x] Renamed from "Photon" to "Salt Client Template"
- [x] Upgraded to Tailwind v4 with CSS-based config
- [x] Added semantic brand tokens in `globals.css`
- [x] Created `/brand` style guide page
- [x] Updated all 25 agent context blocks
- [x] Updated documentation references

---

## The reframe

Up until now, every CLAUDE.md file, doc, and agent context block in this project describes Salt Client Template as "a single-app personal portfolio" for one specific person. That framing was the working assumption for the whole velocity-import session earlier today.

Salt Client Template is actually going to be a **starter template** — a reusable Next.js 16 + Sanity 5 scaffold that you use whenever you're spinning up a new client website. When you start a new client project, you:

1. Clone or copy Salt Client Template as your starting point
2. Run an onboarding script that customizes it for that specific client
3. Use slash commands (`/discover`, `/icp`, `/strategy`, `/brief`) to go through the discovery → strategy → design → implementation workflow

The template itself stays generic. Each client project is a customized copy with its own Sanity project, brand identity, content, and routes.

You already have all the pieces — they're just scattered across two projects:

| Piece | Where it lives now |
|---|---|
| Next 16 + Sanity 5 codebase (the starting point) | Salt Client Template (this project) |
| `/discover`, `/icp`, `/strategy`, `/brief` slash commands + backing agents | Salt Client Template (kept in earlier prune) |
| Onboarding shell script (`setup-new-client.sh`) | `nextjs-starter-template/scripts/` |
| Template files with placeholders (`CLAUDE.template.md`, etc.) | `nextjs-starter-template/` root |
| Phase directory structure (`project/{codename}/outputs/1_discovery/...`) | `nextjs-starter-template` (created by the script) |
| Design token templates (`colors.ts`, `typography.ts`) | `nextjs-starter-template/design-system/tokens/` |
| Workflow/setup/conventions docs | `nextjs-starter-template/docs/` |

The plan is to **pull the onboarding layer from nextjs-starter-template into Salt Client Template** while **re-writing Salt Client Template's existing docs to describe a template, not a specific site.**

## What "becomes a template" actually means

Two independent but related changes:

**A. Generalization (rewrite existing files):** Every file that says "Salt Client Template is a personal portfolio" becomes "Salt Client Template is a Next.js 16 + Sanity 5 starter template". Technical details (schemas, routes, GROQ queries, live revalidation) are accurate for the generic template and don't need to change — only the framing and examples do.

**B. Onboarding addition (new files):** Add the shell script + template files + documentation needed to kick off a new client project on top of the generic template.

Neither change is large individually. The generalization touches ~10 files; the onboarding addition creates maybe ~15 new files. Doing them together is the right call because the onboarding script's templates need to match the generic files it's customizing.

---

# Part A — Generalize existing files

Files that currently say "Salt Client Template is X" and need to become "Salt Client Template is a template for X":

## A.1 Root `CLAUDE.md`

**Current opening:** *"Salt Client Template — A Next.js 16 + Sanity 5 personal website / portfolio. Single app, no monorepo."*

**Target opening:** *"Salt Client Template — A Next.js 16 + Sanity 5 starter template for building client websites. When you start a new client project, run the onboarding script (see below), which customizes this template for the specific client."*

**Specific edits:**
- Rewrite the first paragraph to frame as a template
- Add an "Onboarding" section near the top pointing to `scripts/setup-new-client.sh`
- Keep the tech stack, operational commands, critical paths index, and non-negotiables — they're accurate for the template
- The "Environment variables" section should note that `.env.local` is populated by the onboarding script; `.env.example` becomes the canonical template
- Add a pointer to the `project/{codename}/` client work tree that onboarding creates

## A.2 Folder `CLAUDE.md` files

These describe code conventions. They're mostly generic already, but they have phrases like "Salt Client Template's `(personal)` route group" or "in Salt Client Template, we..." that should become "in the template" or just "this template".

**Files to update:**
- `sanity/CLAUDE.md` — search/replace "Salt Client Template" → "the template" where it frames the project
- `app/CLAUDE.md` — same, plus note that the `(personal)` route group is a *template-provided* starting point and can be renamed or expanded per-client
- `components/CLAUDE.md` — same
- `app/api/CLAUDE.md` — same

The technical content (async params, `sanityFetch`, `defineQuery`, `OptimisticSortOrder` pattern) is accurate for the template and stays.

## A.3 `docs/architecture/data-flow.md`

The request-flow diagrams are accurate. Only the opening paragraph frames this as a specific site. Rewrite to describe the template's data flow, which applies to any client project built from it.

## A.4 `.claude/README.md` and `.claude/tool-registry.md`

Both currently reference "Salt Client Template, a single-app Next.js + Sanity personal website" in their history sections. Update to:
- Frame `.claude/` as the template's agent workspace
- Note that client-specific agent tweaks happen downstream (per-client copies can customize)
- Keep the prune history accurate — that's historical context

## A.5 The agent context block in all 25 agents

This is the important one — you specifically called it out.

**Current state (the block I appended earlier today):**
> "This project is **Salt Client Template**, a Next.js 16 + Sanity 5 single-app personal portfolio. Before editing or suggesting changes, read the relevant CLAUDE.md files..."

**Target state:**
> "This is the **Salt Client Template starter template** — a Next.js 16 + Sanity 5 scaffold for building client websites. Before editing or suggesting changes, read the relevant CLAUDE.md files..."

**Specific changes to the block:**
- Rename the heading from `## Salt Client Template codebase context (required reading)` to `## Project context (required reading)` — no project-specific word
- First paragraph: rewrite as "This is a Next.js 16 + Sanity 5 starter template" instead of "This project is Salt Client Template, a ... personal portfolio"
- The six CLAUDE.md file references stay exactly as-is (they're filenames, not framing)
- The Next.js 16 warning stays
- The "ignore Salt Core references" paragraph stays (still relevant — `.claude/` was copied from Salt Core)
- Add a sentence: "When this template is being used for a specific client project, the client's name, brand, content model, and routes will be customized — but the conventions in these CLAUDE.md files are the starting point."

**Execution:** remove the old block from each of the 25 agent files, write the new block to a temp file, append it to each agent file. Same mechanism as before. The old block has a distinctive heading (`## Salt Client Template codebase context (required reading)`) so removal is a clean `sed` — or better, a scripted Edit that targets the heading line through the end of file.

Actually cleaner: since the block I appended ends at the end of the file in each case, we can use the heading as an anchor and delete from there to end-of-file. Then append the new block. One pass.

## A.6 Root `README.md`

Currently describes the Vercel Sanity template defaults. For the template, it should become:
- One-paragraph intro: "This is the Salt Client Template starter template, a Next.js 16 + Sanity 5 scaffold for client websites"
- Quick-start: `npm install`, then `bash scripts/setup-new-client.sh`
- Link to `docs/architecture/data-flow.md` for how things connect
- Link to `docs/WORKFLOW.md` for the discover → strategy → design → build flow (new doc, see Part B)

## A.7 `package.json`

Current name: `"sanity-template-template-nextjs-personal-website"`. 

Options:
1. Rename to `"salt-client-template-starter-template"` and leave it hardcoded
2. Make it a placeholder (`{{PROJECT_CODENAME}}`) that the onboarding script fills in per client
3. Leave as-is and let the onboarding script override it

Recommend **option 2** — the onboarding script should replace the package name with the client's codename. That's the whole point of having an onboarding script. The template repo itself has a literal string in `package.json`, and the onboarding step replaces it.

## A.8 `.env.local`

Currently contains real Sanity credentials for *your* Sanity project. Two paths:

1. **Keep it:** treat it as "template dev mode" credentials — when you're working ON the template itself, you have a live Sanity project to test against. Each client project created via onboarding uses its own credentials (stored in the client copy's `.env.local`).
2. **Empty it:** clear the credentials and require anyone working on the template to set up their own Sanity dev project.

Recommend **option 1**. You've been working with real content against that Sanity project, and having it connected makes template work much easier. The Sanity project title is already "Salt Client Template - STAGING" which signals its role.

**But:** the template's `.env.local` is git-ignored, so it's already not shipped with the template. Fine to keep real credentials locally.

**Important:** the `.env.example` file (which IS committed) already has empty placeholders, which is correct. No change there.

---

# Part B — Import the onboarding system

## B.1 What to bring over verbatim (with adaptation)

### `scripts/setup-new-client.sh`

Port from `nextjs-starter-template/scripts/setup-new-client.sh`. Key adaptations needed:

| Original behavior | Adapt to |
|---|---|
| Enforces `pnpm ≥ 9.0.0` | Use `npm` (Salt Client Template uses npm, not pnpm) |
| Runs `pnpm dlx shadcn@latest init` | Remove — Salt Client Template doesn't use shadcn/ui |
| Adds shadcn components (button, card, input, textarea) | Remove — not applicable |
| Fills `package.template.json` | Keep, adapted for Salt Client Template's actual dependencies (Next 16, React 19, Sanity, next-sanity, Tailwind 3, etc.) |
| Fills `CLAUDE.template.md` | Keep, adapted for Salt Client Template's current CLAUDE.md structure |
| Fills `README.template.md` | Keep |
| Prompts for Sanity CMS (Y/N) | Change — Sanity is mandatory in Salt Client Template, so remove the prompt |
| Prompts for Supabase (Y/N) | Remove — not used |
| Creates `project/{codename}/outputs/1_discovery` through `6_review` | Keep verbatim |
| Creates `design-system/brand-guidelines.md` | Keep |
| Creates `design-system/tokens/{colors,typography}.ts` | Keep but ensure these integrate with Salt Client Template's existing Tailwind config (otherwise they're dangling files) |
| Generates `project/{codename}/_project_status.json` | Keep |
| Runs `pnpm install` | Change to `npm install` |
| Removes `.template` files | Keep |
| Initializes git | Keep |

**Net result:** a simpler script than the original — fewer prompts, no shadcn, no Supabase, no pnpm. Maybe 250 lines instead of 443.

### Template files to create

These are new files in the template repo, each with `{{PLACEHOLDER}}` substitutions:

- `CLAUDE.template.md` — becomes the client's root `CLAUDE.md` after onboarding. Contains the generic template content PLUS client-specific sections that get filled in (client name, industry, production URL, etc.).
- `package.template.json` — contains `{{PROJECT_CODENAME}}` as the `name` field; all other dependencies are identical to the current `package.json`.
- `README.template.md` — per-client README.
- `.env.template` — template for `.env.local` with Sanity credential placeholders. Commits the shape without the values.

**Open question:** do we need a `.mcp.template.json`? The current `mcp.json` I added has Context7 only; it's generic and doesn't need per-client customization. Probably skip — no template version needed.

### Workflow docs

Port from `nextjs-starter-template/docs/`:

- `docs/WORKFLOW.md` — describes the discover → strategy → design → build → review flow using the existing slash commands
- `docs/SETUP.md` — describes the onboarding script, prerequisites (node, npm, Sanity account), common first-run issues
- `docs/CONVENTIONS.md` — code conventions (already partially covered by the folder CLAUDE.md files; this might be redundant — recommend SKIP and point to CLAUDE.md files)
- `docs/DEPLOYMENT.md` — Vercel/Netlify deploy (already covered by `netlify.toml` and `vercel-installation-instructions.md`; maybe just consolidate)

**Recommendation:** port WORKFLOW.md and SETUP.md, skip the others since Salt Client Template already has coverage.

## B.2 What to leave behind

Not everything in the nextjs-starter-template onboarding system makes sense here:

- **shadcn/ui setup** — Salt Client Template uses plain Tailwind, no shadcn. Cut.
- **Supabase integration** — Salt Client Template uses Sanity, no Supabase. Cut.
- **Next.js 15 framing** — already handled, Salt Client Template is Next 16. Just update versions.
- **Tailwind v4 setup** — Salt Client Template uses Tailwind 3 (with the Sanity demo theme). Keep Salt Client Template's existing setup; don't force v4.
- **The nextjs-starter-template's own CLAUDE.md structure** — Salt Client Template has its own more detailed CLAUDE.md files now; don't overwrite them.
- **Vercel-specific deployment script** — Salt Client Template already has `netlify.toml` and `vercel-installation-instructions.md`. Don't duplicate.
- **The older template's pnpm enforcement** — Salt Client Template is npm.

## B.3 What Salt Client Template already has that aligns

The earlier prune kept all of these because they're harmless + useful:

- `.claude/commands/discover.md`
- `.claude/commands/icp.md`
- `.claude/commands/strategy.md`
- `.claude/commands/brief.md`
- `.claude/agents/client-discovery.md`
- `.claude/agents/icp-analyst.md`
- `.claude/agents/ux-strategist.md`
- `.claude/agents/design-translator.md`
- `.claude/skills/brand-voice-extraction/`
- `.claude/skills/icp-development/`
- `.claude/skills/design-brief-creation/`
- `.claude/skills/product-planning/`
- `.claude/skills/conversion-audit/`

**These are already wired into Salt Client Template.** They might need small adjustments to reference the new `project/{codename}/outputs/` directory structure (instead of whatever paths they currently assume from the Salt Core project), but the agents and skills themselves are reusable as-is.

**Action item:** after setup, read each of these 13 files and verify the output paths they reference. If any of them say "write output to `outputs/...`" without a `project/{codename}/` prefix, update them to match the new structure.

## B.4 Client-specific directory structure

When onboarding runs for a new client, it creates:

```
brand-identity/
├── discovery.json    # /discover writes here — client DNA, voice, constraints
├── audience.json     # /icp writes here — ICP profiles, journeys
├── strategy.json     # /strategy writes here — sitemap, page briefs
├── design.json       # /brief writes here — visual system, component specs
└── assets/
    ├── logo/
    ├── fonts/
    └── images/
```

Each JSON file consolidates related data into a single source of truth. Commands append/update these files rather than creating many small ones.

This directory is git-ignored by default (per-client, doesn't belong in the template repo). The template should `.gitignore` `brand-identity/` but the onboarding script creates it fresh each time.

## B.5 Design system tokens

The nextjs-starter-template creates `design-system/tokens/{colors,typography}.ts`. Salt Client Template currently has `styles/index.css` and relies on the Sanity demo theme for Tailwind.

**Question:** do we keep Salt Client Template's existing styling as the default, and have the onboarding script *add* the client's brand tokens in a new `design-system/` folder? Or do we replace Salt Client Template's styling with a token-driven system that each client fills in?

Recommend **add, don't replace**. The existing Tailwind/demo-theme setup works for a template's out-of-the-box state. The onboarding creates a new `design-system/tokens/` folder that components can optionally reference for client-specific colors/fonts. Over time the template's starting components could migrate to token references.

---

# Part C — Open questions (**ALL RESOLVED** — see Decisions section at top)

---

# Part D — Suggested order of execution

## Phase 1: Decisions
Answer the open questions in Part C. The most load-bearing decisions are C.2 (does the template run as-is) and C.3 (per-client Sanity), because they affect what the onboarding script has to do.

## Phase 2: Generalize existing files (Workstream A)
Lower risk, smaller scope, touches files already in the repo. Do this first so Workstream B has a clean slate.

1. Rewrite root `CLAUDE.md` as a template description
2. Rewrite the agent context block (new heading, new first paragraph) and apply to all 25 agents — replace the old block, don't stack
3. Update the 4 folder `CLAUDE.md` files to use template framing
4. Update `docs/architecture/data-flow.md` opening
5. Update `.claude/README.md` and `.claude/tool-registry.md` history sections
6. Rewrite root `README.md` as a template intro
7. Optionally: append the context block to `.claude/commands/*.md` too (decision C.7)

## Phase 3: Port the onboarding script (Workstream B)
Higher risk because it involves new files and shell scripting.

1. Port `setup-new-client.sh` with adaptations (npm not pnpm, no shadcn, no Supabase, Sanity mandatory)
2. Create `CLAUDE.template.md` — start from the current (generalized) `CLAUDE.md` and add `{{PLACEHOLDER}}` substitutions for client-specific content
3. Create `package.template.json` from the current `package.json`
4. Create `README.template.md`
5. Create `.env.template` — already have `.env.example`; this is almost the same
6. Port `docs/WORKFLOW.md` and `docs/SETUP.md` from nextjs-starter-template (adapted)
7. Add `project/` to `.gitignore`

## Phase 4: Align the existing commands with the new structure
1. Read each of the 13 kept commands/agents/skills that are part of the discover→build flow
2. Update output paths to use `brand-identity/` structure (discovery.json, audience.json, etc.)
3. Add context block to all command files
4. Verify agent instructions don't reference Salt Core paths

## Phase 5: Set up Sanity MCP integration
1. Run `npx sanity mcp setup` to configure Claude Code
2. Test project creation flow via MCP
3. Document the onboarding workflow with MCP

## Phase 6: Test
1. On a fresh clone (or a git worktree), run the onboarding script
2. Verify `brand-identity/` structure is created
3. Run `npm install && npm run dev` on the customized result
4. Try invoking `/discover` and verify output lands in `brand-identity/discovery.json`

---

# Net effect

| Thing | Before | After |
|---|---|---|
| What Salt Client Template "is" | A personal portfolio project | A reusable Next 16 + Sanity 5 template |
| How you start a client project | Clone the repo, manually rename things | Clone, run onboarding, Sanity MCP creates project |
| Client-specific artifacts | Ad hoc | `brand-identity/{discovery,audience,strategy,design}.json` |
| Design tokens | Hardcoded in config | Semantic tokens in `globals.css`, visual at `/brand` |
| Sanity project creation | Manual at manage.sanity.io | Automated via Sanity MCP server |
| `/discover`, `/icp`, `/strategy`, `/brief` | Present but not wired | Write to consolidated `brand-identity/*.json` files |

## Rough size of work

- **Workstream A (generalization):** ~10 files touched, mostly search-and-replace or rewrite-the-first-paragraph. ~1 hour of focused work.
- **Workstream B (onboarding import):** ~15 new files, one ported shell script, template adaptations. Longer — couple hours.
- **Phase 4 (command alignment):** depends on how much the kept commands reference old paths. Could be quick or could be significant. Read-through before estimating.

The big wins from this reframe:
1. **One place to make template improvements** — instead of upgrading Next.js in 5 different client repos, you upgrade it in Salt Client Template and re-onboard (or cherry-pick).
2. **Standardized client project structure** — every client has the same `project/{codename}/` tree, so muscle memory transfers.
3. **Onboarding script codifies your intake process** — less "what did I forget to set up this time?"
4. **The 25 agent context blocks become evergreen** — they talk about the template, not any one project, so they don't drift.
