# Salt Studio

A Next.js 16 + Sanity 5 website for **Salt Studio** (`createdbysalt.com`). Content lives in Sanity project `jkqf2ng5`, the Studio is mounted at `/edit`, and the public site uses the App Router with server components by default.

> Page IA currently mirrors the Photon production-studio template (Work / Capabilities / Studio / Rentals). Visual redesign and service reframing are separate follow-ups.

## Tech Stack

| Technology   | Version | Notes                                             |
| ------------ | ------- | ------------------------------------------------- |
| Next.js      | 16.2    | App Router, Turbopack for dev and build           |
| React        | 19.2    | React Compiler enabled                            |
| Sanity       | 5.19    | Studio at `/edit`, Presentation tool for previews |
| next-sanity  | 12.2    | Live revalidation, draft mode                     |
| Tailwind CSS | 4.2     | CSS-based config in `app/globals.css`             |
| TypeScript   | 5.9     | Strict null checks enabled                        |

## Getting Started

### New Client Project

```bash
bash scripts/setup-client.sh
```

This creates the `brand-identity/` folder, updates `package.json` with the client codename, and optionally configures Sanity credentials.

### Development

```bash
npm run dev        # Start dev server on localhost:4000
npm run build      # Production build with Turbopack
npm run typegen    # Regenerate Sanity types after schema changes
npm run type-check # Run typegen + tsc --noEmit
npm run lint:fix   # Format + lint fix
```

### Environment Variables (1Password)

**Sanity secrets source of truth:** 1Password vault `salt-studio-development`, item `salt-studio-sanity`.

| 1Password field | Env var |
| --------------- | ------- |
| `project-id` | `NEXT_PUBLIC_SANITY_PROJECT_ID` |
| `dataset` | `NEXT_PUBLIC_SANITY_DATASET` |
| `read-token` | `SANITY_API_READ_TOKEN` |
| `write-token` | `SANITY_API_WRITE_TOKEN` |

Site/SEO/Resend/social/agent keys can be added to the same item over time; until then keep them in `.env.local` / Vercel. Never store Photon’s `25ywlhce` tokens here.

```bash
# Required (Salt Sanity project — never Photon’s 25ywlhce)
NEXT_PUBLIC_SANITY_PROJECT_ID=jkqf2ng5
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=

# Optional
NEXT_PUBLIC_SANITY_API_VERSION=2025-02-27
NEXT_PUBLIC_GTM_ID=              # Salt Studio GTM container
```

Client analytics (GA4) are configured in Sanity under Developer Settings.

## Project Structure

```
app/
├── (personal)/          # Public site route group
│   ├── layout.tsx       # Navbar, analytics, SanityLive
│   ├── page.tsx         # Home page
│   └── [slug]/          # Dynamic pages
├── studio/[[...index]]/ # Sanity Studio mount
├── api/draft-mode/      # Draft mode endpoints
├── globals.css          # Tailwind v4 config
└── layout.tsx           # Root layout, fonts

sanity/
├── schemas/
│   ├── documents/       # page.ts, project.ts
│   ├── singletons/      # home.ts, settings.ts
│   └── objects/         # Reusable field types
├── lib/
│   ├── client.ts        # Sanity client
│   ├── live.ts          # sanityFetch + SanityLive
│   └── queries.ts       # GROQ queries (use defineQuery)
└── plugins/             # Studio customization

lib/
├── analytics/           # GTM, GA4, consent, events
└── seo/                 # Structured data, sitemap

components/              # Flat layout, server-first

brand-identity/          # Client brand docs (gitignored)
```

## Key Conventions

1. **Server components by default** — only add `'use client'` when needed
2. **All GROQ queries use `defineQuery`** — enables end-to-end types
3. **Sanity reads go through `sanityFetch`** — wires up live revalidation
4. **Never hand-edit `sanity.types.ts`** — run `npm run typegen` instead
5. **Tailwind classes inline** — no `cn()` utility, use template literals

## Salt Studio Workflows

After running the setup script, use these commands to build out client brand docs:

| Command     | Purpose                              |
| ----------- | ------------------------------------ |
| `/discover` | Fill `brand-identity/discovery.json` |
| `/icp`      | Fill `brand-identity/audience.json`  |
| `/strategy` | Fill `brand-identity/strategy.json`  |
| `/brief`    | Fill `brand-identity/design.json`    |

Visit `/brand` to preview and customize design tokens.

## Analytics

Dual tracking system:

- **Salt Studio GTM** — Set `NEXT_PUBLIC_GTM_ID` in env (client cannot edit)
- **Client GA4** — Set in Sanity Developer Settings (client self-service)

See `lib/analytics/CLAUDE.md` for implementation details.

## Deployment

Deployed to Vercel. The build uses Turbopack and extracts the Sanity manifest to `public/studio/static`.

```bash
npm run build   # next build --turbopack && sanity manifest extract
```

TypeScript errors are ignored on production builds (`typescript.ignoreBuildErrors = true`), but always run `npm run type-check` locally before pushing.

## Documentation

- `CLAUDE.md` — Full codebase reference for AI assistants
- `lib/analytics/CLAUDE.md` — Analytics implementation
- `lib/seo/CLAUDE.md` — SEO and structured data
- `components/CLAUDE.md` — Component conventions
