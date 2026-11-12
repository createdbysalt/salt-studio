<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# AI assistant guide (Cursor, Claude Code, and others)

**Salt Studio** — Next.js 16 + Sanity 5 website (`createdbysalt.com`). Sanity project `jkqf2ng5`; Studio at `/edit`; public site under `app/(personal)/`. Env: 1Password vault `salt-studio-development` / item `salt-studio-sanity`. Never use Photon’s project `25ywlhce`.

Before editing code, read the relevant **`CLAUDE.md`** file for that area. Those files are authoritative — written from the actual codebase. Cursor loads them via `.cursor/rules/`; Claude Code reads them directly.

## Folder guides (read before editing)

| Area         | Guide                                      | When to read                               |
| ------------ | ------------------------------------------ | ------------------------------------------ |
| Project-wide | `CLAUDE.md`                                | Stack, commands, paths, non-negotiables    |
| Sanity       | `sanity/CLAUDE.md`                         | Schemas, GROQ, `sanityFetch`, Presentation |
| App Router   | `app/CLAUDE.md`                            | Routes, layouts, draft mode, async params  |
| API routes   | `app/api/CLAUDE.md`                        | Route handlers, draft-mode enable          |
| Studio mount | `app/edit/CLAUDE.md`                       | `/edit` CSS isolation, NextStudio          |
| Components   | `components/CLAUDE.md`                     | Flat layout, Tailwind, visual editing      |
| Analytics    | `lib/analytics/CLAUDE.md`                  | GTM, GA4, consent, event helpers           |
| SEO / AEO    | `lib/seo/CLAUDE.md`                        | JSON-LD, sitemap, structured data          |
| Church Tally | `lib/tally/CLAUDE.md`                      | Church kit forms, protected IDs            |
| Brand assets | `brand-identity/asset-tagging-strategy.md` | Before Sanity Media Library uploads        |

## Non-negotiables (summary)

1. Never hand-edit `sanity.types.ts` or `schema.json` — run `npm run typegen` after schema changes.
2. Server components by default; `'use client'` only when needed.
3. All GROQ queries use `defineQuery`; reads use `sanityFetch`, not bare `client.fetch`.
4. Tailwind inline in `className` — no `cn()` / `clsx` utility.
5. Only `cdn.sanity.io` in `next.config.ts` `remotePatterns`.
6. Run `npm run type-check` before shipping (`ignoreBuildErrors` is on in prod builds).

## Commands

```bash
npm run dev       # port 4000; predev runs typegen
npm run typegen   # after Sanity schema changes (if not using dev)
npm run type-check
npm run lint
```

## Claude Code workflows (`.claude/`)

**Codebase docs** → `CLAUDE.md` files (above). **Agent workflows** → `.claude/commands/`, `.claude/agents/`, `.claude/skills/`. See `.claude/README.md`.

## Velocity shortcuts

| Trigger    | Action                                                   |
| ---------- | -------------------------------------------------------- |
| `qplan`    | Plan only → save to `docs/plans/YYYY-MM-DD-<feature>.md` |
| `qcode`    | Implement approved plan; run `npm run lint`              |
| `qcheck`   | Review + `npm run type-check`                            |
| `qfix`     | Debug from error message                                 |
| `qrestart` | Kill port 4000, `npm run dev`                            |
| `qtypes`   | `npm run typegen`                                        |

## Learned User Preferences

- On proposals, the recommended package is the higher-priced option and should be the larger card.
- Proposal scope of work should stay easy to paste as paragraphs and bullets for legal coverage. Each package and each add-on has its own scope, and the signed statement is assembled from the selection.
- One shared password can unlock every proposal. Each client still gets their own link, and that link is what keeps one client from opening another proposal.

## Learned Workspace Facts

- Client proposals are served at `/p/[token]` from `app/(proposal)/`, outside the public `(personal)` site. `token` is the unguessable private link key on the Sanity `proposal` document.
- The shared gate password and cookie signing secret are `PROPOSAL_GATE_PASSWORD` and `PROPOSAL_GATE_SECRET` on the 1Password item `salt-studio-sanity`. Unlock sets an httpOnly `proposal_gate` cookie scoped to that proposal path. The sign-in page may show the client name; prices, scope, and legal text load only after the cookie is valid.
- Proposal content uses Sanity types `proposal`, `proposalPackage`, `proposalAddOn`, and `proposalMsa`. A proposal has at most two packages. The page sends selected ids and the server recomputes the total.
- The production Sanity dataset is still public. Do not store a real client's legal details on a proposal until proposals move to a private dataset.
