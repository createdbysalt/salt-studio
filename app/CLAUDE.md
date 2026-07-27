# app/

The Next.js 16 App Router tree. This file covers routing, layouts, and the conventions used on the public site. For Sanity-specific patterns see `sanity/CLAUDE.md`. For API route handlers see `app/api/CLAUDE.md`. For components see `components/CLAUDE.md`.

> Reminder: this is Next.js 16, not the version in your training data. Params are async, `draftMode()` is async, and several other APIs have changed. When in doubt, read `node_modules/next/dist/docs/` or check Context7.

## Layout

```
app/
├── layout.tsx                         ← Root layout: <html>/<body>, fonts, globals.css
├── globals.css                        ← Root global styles (Tailwind + brand tokens)
├── favicon.ico / apple-icon.png / icon.png
├── (personal)/                        ← Route group for the public site
│   ├── layout.tsx                     ← Navbar + Footer + SanityLive + VisualEditing/DraftModeToast
│   ├── page.tsx                       ← Home (renders <HomePage />)
│   ├── [slug]/page.tsx                ← Dynamic page by slug → /:slug
│   ├── projects/[slug]/page.tsx       ← Project detail → /projects/:slug
│   ├── DraftModeToast.tsx             ← Client component: sonner toast when draft mode is on
│   └── client-functions.ts            ← `handleError` for SanityLive CORS / error display
├── admin/                             ← Sanity Studio at /edit
│   ├── layout.tsx                     ← Isolated layout (no globals.css, keeps fonts)
│   ├── [[...index]]/page.tsx          ← NextStudio mount (catch-all for Studio routing)
│   └── CLAUDE.md                      ← Studio-specific documentation
└── api/
    └── draft-mode/enable/route.ts     ← GET endpoint to enter Sanity draft mode
```

## The three distinct layers of this app

1. **Root layout (`app/layout.tsx`)** — loads the brand fonts (Geist as `--font-sans`, Geist Mono as `--font-mono`) as CSS variables, imports `globals.css`, and wraps everything in `<html>` + `<body>`. No navigation, no providers. Keep it minimal.
2. **`(personal)` route group** — the public portfolio site. Its layout loads the settings singleton, renders the Navbar and footer inside `<LenisProvider>` (smooth scroll + GSAP ScrollTrigger sync), mounts `<PageTransition />` (curtain wipe on internal navigation), includes `<SanityLive />` for live revalidation, and conditionally renders draft-mode UI. Motion primitives live in `components/motion/` — see `components/CLAUDE.md`.
3. **`admin/` route** — the Sanity Studio at `/edit`, mounted via `NextStudio`. Has its own `layout.tsx` that does NOT import `globals.css` — this isolates the Studio from client brand styles. Catch-all routing because the Studio has its own internal navigation.

These layers are independent. `(personal)` routes never render inside the Studio, and the Studio has no relationship to the public Navbar/footer. The `/edit` layout ensures client CSS customizations don't bleed into the Studio UI.

## Route groups

`(personal)` is a [route group](https://nextjs.org/docs/app/building-your-application/routing/route-groups) — parentheses around a folder name mean "this folder is a layout boundary but does NOT appear in the URL." So `app/(personal)/page.tsx` serves at `/`, not `/personal`.

**Why it exists:** so the public site can have its own layout (Navbar + SanityLive + draft-mode UI) without forcing the Studio at `/edit` to also use it. The Studio stays outside the `(personal)` group with its own isolated layout specifically so it isn't wrapped with the portfolio chrome or affected by client brand styles.

**When adding a new top-level section** (e.g. a separate admin dashboard), decide whether it belongs inside `(personal)` (public, same chrome) or alongside it in its own route group (different chrome). Don't nest unrelated UX inside `(personal)`.

## Server components by default

Every file in `app/` is a Server Component unless it has `'use client'` at the top. The React Compiler is enabled (`reactCompiler: true` in `next.config.ts`), so don't reach for `useMemo` or `useCallback` unless you're profiling a real bottleneck.

**Add `'use client'` only when you need:**

- Browser APIs (`window`, `document`, `localStorage`)
- React state (`useState`) or effects (`useEffect`)
- Event handlers that run in the browser
- Third-party client-only libraries

**Examples in this codebase:**

- `app/(personal)/DraftModeToast.tsx` — uses `useEffect` and `useIsPresentationTool`, so it's a client component
- `app/(personal)/client-functions.ts` — defines `handleError` which calls `window.open`, so it's marked `'use client'`
- Everything else in `app/(personal)/` is server

## Next.js 16 params are async

Every page that takes a dynamic segment MUST type params as a Promise:

```ts
type Props = {
  params: Promise<{slug: string}>
}

export default async function ProjectSlugRoute({params}: Props) {
  // Option A: await params directly
  const {slug} = await params

  // Option B: pass the Promise through to sanityFetch — it awaits internally
  const {data} = await sanityFetch({query: projectBySlugQuery, params})
}
```

See `app/(personal)/[slug]/page.tsx` and `app/(personal)/projects/[slug]/page.tsx` for canonical examples. Don't type `params` as a plain object — it won't compile, and it'll be subtly wrong even if you get it to typecheck with `any`.

The same rule applies to `draftMode()`:

```ts
import {draftMode} from 'next/headers'

if ((await draftMode()).isEnabled) { ... }
```

## Data fetching on the public site

**Always use `sanityFetch`** from `sanity/lib/live.ts`, never a bare `client.fetch`. `sanityFetch` wires up live revalidation and draft mode automatically.

```ts
import {sanityFetch} from '@/sanity/lib/live'
import {homePageQuery} from '@/sanity/lib/queries'

const {data} = await sanityFetch({query: homePageQuery})
```

### Parameters

- **`query`** — a `defineQuery()` value from `sanity/lib/queries.ts`
- **`params`** — either a plain object or the route's `params` Promise (it'll await)
- **`stega: false`** — set this when fetching metadata (`generateMetadata`) or static params (`generateStaticParams`). Stega embeds editable markers in strings; you don't want those in meta tags or slug lists.
- **`perspective: 'published'`** — set this for `generateStaticParams` so draft-only documents don't get static slugs generated

### The standard page pattern

```ts
// generateMetadata: fetch without stega
export async function generateMetadata({params}: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const {data} = await sanityFetch({query: projectBySlugQuery, params, stega: false})
  return {
    title: data?.title,
    description: data?.overview ? toPlainText(data.overview) : (await parent).description,
  }
}

// generateStaticParams: fetch without stega, published only
export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: slugsByTypeQuery,
    params: {type: 'project'},
    stega: false,
    perspective: 'published',
  })
  return data
}

// The route itself: fetch normally (with stega for inline editing)
export default async function ProjectSlugRoute({params}: Props) {
  const {data} = await sanityFetch({query: projectBySlugQuery, params})
  if (!data?._id && !(await draftMode()).isEnabled) {
    notFound()
  }
  return <ProjectDetail data={data} />
}
```

## The 404-in-draft-mode gotcha

Both `[slug]/page.tsx` and `projects/[slug]/page.tsx` use this check:

```ts
if (!data?._id && !(await draftMode()).isEnabled) {
  notFound()
}
```

**Why the draft-mode escape hatch:** when an editor is creating a new page at a slug that doesn't exist yet, they're probably in draft mode from the Presentation tool. If we `notFound()` in that case, the live reload breaks and they can't see their new page taking shape. So we only show 404 when NOT in draft mode.

**When adding a new slug-based route, copy this pattern.** Don't `notFound()` unconditionally on missing data.

## Draft mode flow (end to end)

1. **Editor clicks "Preview" in the Sanity Studio Presentation tool.**
2. The Studio opens a URL with a preview token; Next hits `GET /api/draft-mode/enable` (see `app/api/draft-mode/enable/route.ts`).
3. That route uses `defineEnableDraftMode` from `next-sanity/draft-mode` to call `draftMode().enable()` and validate the token.
4. The public site re-renders. In `app/(personal)/layout.tsx`:
   - `(await draftMode()).isEnabled` is now `true`
   - `<VisualEditing />` from `next-sanity/visual-editing` is rendered — this enables inline editing overlays
   - `<DraftModeToast />` is rendered — a sonner toast shown only when NOT in the Presentation iframe (see `useIsPresentationTool`)
5. Editor edits content in the Studio or inline in the preview; `<SanityLive />` picks up changes and refreshes the data on the fly.
6. Clicking "Disable" on the toast calls the server action that calls `draftMode().disable()`.

**Never show draft-only UI unconditionally.** Wrap it in `(await draftMode()).isEnabled &&` exactly like the layout does.

## `<SanityLive />` must stay in the layout

`SanityLive` is what subscribes to content changes and triggers re-renders. It's rendered once in `app/(personal)/layout.tsx`:

```tsx
<SanityLive onError={handleError} />
```

**Do not move it into child pages.** Do not render multiple copies. Do not rename `handleError`; it's imported from `./client-functions` and handles CORS errors specifically.

If you add a new top-level layout (e.g. for a separate route group), you need to render `<SanityLive />` there too or live revalidation won't work on those routes.

## Inline visual editing: `createDataAttribute`

`app/(personal)/projects/[slug]/page.tsx` shows the pattern for making a field editable inline via the Presentation tool overlay:

```ts
import {createDataAttribute} from 'next-sanity'
import {studioUrl} from '@/sanity/lib/api'

const dataAttribute = data?._id && data._type
  ? createDataAttribute({baseUrl: studioUrl, id: data._id, type: data._type})
  : null

// Then on elements:
<span data-sanity={dataAttribute?.('duration.start')}>{startYear}</span>
```

The `dataAttribute(path)` call returns a string that the Presentation tool reads to figure out which document field to open when the user clicks. Use dot notation for nested fields.

This is only necessary when you want an overlay on text that isn't already handled by stega (most strings are handled automatically by `CustomPortableText` and the client's stega filter). Use it for computed/derived values like formatted dates.

## Styles and fonts

- **Root global CSS:** `app/globals.css` — imported in `app/layout.tsx`.
- **Public site CSS:** `@/styles/index.css` — imported at the top of `app/(personal)/layout.tsx`. That's where most of the site-specific Tailwind setup lives.
- **Fonts:** loaded in `app/layout.tsx` via `next/font/google` as `--font-sans` (Geist) and `--font-mono` (Geist Mono). Tailwind references these variables in the `@theme` block in `app/globals.css`.

If you need to add a new font, do it in `app/layout.tsx` alongside the others, expose it as a CSS variable, and add it to the `@theme` block in `app/globals.css`.

## The Studio route (`app/edit/`)

The Sanity Studio is mounted at `/edit` with CSS isolation. See `app/edit/CLAUDE.md` for full documentation.

**Key files:**

- `app/edit/layout.tsx` — Isolated layout that loads fonts but NOT `globals.css`
- `app/edit/[[...index]]/page.tsx` — NextStudio mount

```ts
// app/edit/[[...index]]/page.tsx
import config from '@/sanity.config'
import {NextStudio} from 'next-sanity/studio'

export const dynamic = 'force-static'
export {metadata, viewport} from 'next-sanity/studio'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

Things that matter:

- **Catch-all route (`[[...index]]`)** — the Studio has its own routing; this catches everything under `/edit/*` and hands it to NextStudio.
- **`dynamic = 'force-static'`** — the Studio shell is static; NextStudio hydrates the dynamic bits on the client.
- **CSS isolation** — `app/edit/layout.tsx` does NOT import `globals.css`, so client brand styles don't affect the Studio.
- **Fonts are shared** — the admin layout loads the same fonts so Presentation previews render consistently.

Don't import `sanity.config.ts` from anywhere else in `app/` — that config is `'use client'` and is specifically for the Studio mount. The public site should import from `sanity/lib/*` instead.

## The Vercel `intro-template/` card

`app/(personal)/layout.tsx` imports `IntroTemplate` from `@/intro-template` and renders it inside a `<Suspense>`. That's the Vercel template welcome card — the instructional block that appears when you first spin up a new copy of this template.

**To remove it:** delete both the import and the `<IntroTemplate />` usage in `app/(personal)/layout.tsx`, then delete the `intro-template/` folder. The README and the component itself both say this is safe.

Don't build anything new on top of `intro-template/` — it's transitional content, not a component library.

## The `@/` path alias

`tsconfig.json` maps `@/*` to `./*` (project root). So:

- `@/components/Header` → `./components/Header`
- `@/sanity/lib/live` → `./sanity/lib/live`
- `@/styles/index.css` → `./styles/index.css`

Use the alias in all new code. Relative imports (`../../sanity/lib/live`) work but are discouraged for cross-tree imports.

## Things to verify before adding a new route

1. Is it server-by-default? Does it actually need `'use client'`?
2. If it's dynamic, is `params` typed as `Promise<{...}>`?
3. Are you using `sanityFetch`, not `client.fetch`?
4. For metadata fetches: `stega: false`?
5. For `generateStaticParams`: `stega: false, perspective: 'published'`?
6. If data can be missing, does the 404 check include the draft-mode escape hatch?
7. Does the new route need to be added to `sanity/plugins/resolve.ts` so Presentation edit intent works?
8. If it's a new singleton document behind a URL, does `resolveHref` in `sanity/lib/utils.ts` know about it?
