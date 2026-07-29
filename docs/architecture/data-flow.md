# Data flow

How a request for content on the public site gets from the browser to a rendered page, end to end. Covers the three distinct modes:

1. **Published (production, static + ISR):** the normal visitor case
2. **Draft mode (Presentation tool):** what an editor sees while previewing
3. **Live revalidation:** what happens when content changes while someone is viewing the page

If you're reading this to understand where to make a change, the shortest version is: **content lives in Sanity → Next.js routes call `sanityFetch` from `sanity/lib/live.ts` → components render → `<SanityLive />` in the layout keeps things fresh.** Everything below is the long form of that sentence.

## The cast of characters

| File                                 | Role                                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `sanity/lib/api.ts`                  | Exports `projectId`, `dataset`, `apiVersion`, `studioUrl`. Throws at startup if env vars are missing.         |
| `sanity/lib/client.ts`               | Creates the Sanity client with `perspective: 'published'` and stega enabled.                                  |
| `sanity/lib/token.ts`                | Exports the read token with a `server-only` guard; throws if missing.                                         |
| `sanity/lib/live.ts`                 | Calls `defineLive({client, serverToken, browserToken})` and re-exports `SanityLive` + `sanityFetch`.          |
| `sanity/lib/queries.ts`              | All GROQ queries, each wrapped in `defineQuery()` so types flow into `sanity.types.ts`.                       |
| `app/(personal)/layout.tsx`          | Renders `<SanityLive />`, and conditionally `<VisualEditing />` + `<DraftModeToast />` when draft mode is on. |
| `app/(personal)/**/page.tsx`         | Calls `sanityFetch({query, params})` and renders components with the data.                                    |
| `app/api/draft-mode/enable/route.ts` | The endpoint the Presentation tool hits to enable draft mode.                                                 |
| `components/*`                       | Render the data. `CustomPortableText` is the extension point for rich content.                                |

## Mode 1: Published request (the normal path)

A visitor hits `https://example.com/projects/my-project`. Here's what happens:

```
Browser → Next.js (Vercel)
            │
            ▼
        app/(personal)/projects/[slug]/page.tsx
            │
            │ sanityFetch({query: projectBySlugQuery, params})
            ▼
        sanity/lib/live.ts → sanity/lib/client.ts → api.sanity.io
            │                       │
            │                       ▼
            │                   Sanity CDN response (JSON with stega markers in strings)
            ▼
        ProjectSlugRoute renders <Header />, <ImageBox />, <CustomPortableText />, ...
            │
            ▼
        HTML response to browser
            │
            ▼
        Browser hydrates; <SanityLive /> in the layout opens a connection
        back to Sanity for future change notifications
```

### Step by step

**1. Route match.** Next.js sees `/projects/my-project` and matches `app/(personal)/projects/[slug]/page.tsx`. The `(personal)` route group is a layout boundary — it means the Navbar, footer, and SanityLive from `app/(personal)/layout.tsx` wrap the page. The `(personal)` parentheses are stripped from the URL.

**2. Metadata fetch.** Before rendering, Next calls `generateMetadata({params})`. That function calls `sanityFetch({query: projectBySlugQuery, params, stega: false})`. The `stega: false` is important — we don't want editable markers embedded in meta tag strings.

**3. The actual page fetch.** The route's default export calls `sanityFetch({query: projectBySlugQuery, params})`. Note: no `stega: false` this time, because the rendered text should be editable in the Presentation tool.

**4. `sanityFetch` internals.** `sanityFetch` comes from `defineLive` in `sanity/lib/live.ts`:

```ts
export const {SanityLive, sanityFetch} = defineLive({
  client,
  serverToken: token,
  browserToken: token,
})
```

On the server, it uses the Sanity client to call `client.fetch(query, params)`. It also registers the fetch with the live system so that when `<SanityLive />` on the client gets a change notification for this query, the page re-renders.

**5. The Sanity client call.** `sanity/lib/client.ts` creates the client with:

- `useCdn: true` — reads go through Sanity's CDN for performance
- `perspective: 'published'` — only published documents are returned (no drafts)
- `stega: { studioUrl, filter: ... }` — embeds editing markers in string fields for the Presentation overlay

The CDN returns JSON. Strings in that JSON contain invisible stega markers that look normal when rendered but let the Presentation tool identify editable fields.

**6. Rendering.** The page unpacks the data and passes it to components. Text renders normally; stega markers don't affect visual output. Images are built with `urlForImage(image)` from `sanity/lib/utils.ts`, which generates a `cdn.sanity.io` URL and hands it to `next/image`.

**7. HTML returns to the browser.** Standard Next.js streaming/SSR.

**8. Hydration + `<SanityLive />`.** On the client, React hydrates the HTML, and `<SanityLive onError={handleError} />` from the layout opens a connection to Sanity. That connection stays open for the lifetime of the page. See "Mode 3" below for what happens when it fires.

### The 404-in-production shortcut

The page handler has this check:

```ts
if (!data?._id && !(await draftMode()).isEnabled) {
  notFound()
}
```

In production (draft mode off), a missing document returns a 404. In draft mode (see Mode 2), we skip the 404 so editors can create new content at new slugs and watch it appear live.

## Mode 2: Draft mode (the Presentation tool)

An editor is working in the Sanity Studio at `/studio` and clicks "Preview" on a document. Here's what happens:

```
Editor clicks "Preview" in Studio Presentation tool
            │
            ▼
Studio opens URL with preview token in the iframe
            │
            ▼
Next.js receives the URL → GET /api/draft-mode/enable
            │
            │ (app/api/draft-mode/enable/route.ts)
            │ uses defineEnableDraftMode from next-sanity/draft-mode
            │ validates the token, calls draftMode().enable()
            ▼
Redirect to the path the editor was previewing, e.g. /projects/my-project
            │
            ▼
app/(personal)/projects/[slug]/page.tsx runs again — but now (await draftMode()).isEnabled === true
            │
            ▼
app/(personal)/layout.tsx renders extra stuff:
  - <VisualEditing /> → enables inline editing overlays on stega-marked text
  - <DraftModeToast /> → the sonner toast with a "Disable" button (hidden inside the Presentation iframe)
            │
            ▼
Editor sees the page with editable overlays; can click text to jump to the field in the Studio
```

### What's different from Mode 1

- **Draft content is visible.** Because draft mode is enabled, `sanityFetch` returns the latest unpublished edits, not just published content.
- **404 escape hatch.** If the editor is creating a new page at a new slug, `data` is `undefined` but we don't `notFound()` — we fall through so live reload works.
- **`<VisualEditing />` is rendered.** This is what converts the stega markers in strings into clickable overlays.
- **`<DraftModeToast />` is rendered.** But only if `useIsPresentationTool()` returns `false`, meaning we're NOT inside the Presentation iframe. Inside the iframe, the Studio itself has disable controls; the toast would be redundant.
- **Inline `createDataAttribute` calls light up.** Components like `HomePage`, `Navbar`, and `TimelineSection` emit `data-sanity` attributes on elements. In draft mode, these give the overlay extra targets for derived values that stega doesn't cover natively (like formatted years).

### Disabling draft mode

The toast's "Disable" button calls a **server action** defined inline in `app/(personal)/layout.tsx`:

```ts
<DraftModeToast
  action={async () => {
    'use server'
    await Promise.allSettled([
      (await draftMode()).disable(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ])
  }}
/>
```

This is NOT a route handler. It's a server action — a Next.js feature that lets client components call server functions directly. See Next.js docs for specifics; the key point for this codebase is that draft mode disable doesn't need its own API route.

## Mode 3: Live revalidation (content changes while someone is viewing)

This is the feature that makes Sanity's Presentation tool feel magical. An editor tweaks a heading in the Studio, and the preview refreshes **without a page reload.**

```
Editor edits content in Studio
            │
            ▼
Sanity backend broadcasts a change event
            │
            ▼
<SanityLive /> (open connection since hydration in Mode 1 or 2)
  receives the event
            │
            ▼
SanityLive checks: does this document change affect any query
  currently rendered on this page?
            │
  ┌─────────┴─────────┐
  │                   │
 NO                  YES
  │                   │
  └── ignore           ▼
                  Trigger a re-render with fresh data
                  (React Server Components re-execute on the server,
                   components update without full navigation)
```

### Key points

- **`<SanityLive />` must be rendered in the layout,** not the page. That's what keeps the connection alive across navigations within the same layout. It lives in `app/(personal)/layout.tsx`.
- **The connection is per-tab.** Open two tabs → two connections. That's fine at this scale.
- **Errors go through `handleError`** from `app/(personal)/client-functions.ts`. The most common error is CORS — if a new deploy URL hasn't been added to the Sanity project's CORS allowlist, `SanityLive` can't connect and the toast shows a "Manage" link to the CORS settings.
- **Live revalidation uses the same `sanityFetch` calls the server made.** That's why wrapping reads in `sanityFetch` matters: a bare `client.fetch` wouldn't be tracked, and the page wouldn't update on changes.

## The three data safety rails

This is why the read token, `server-only`, and the `perspective: 'published'` config all matter:

1. **`sanity/lib/token.ts` has `import 'server-only'`** — the token can't accidentally end up in a client bundle. If you try to import `@/sanity/lib/token` from a client component, the build fails.
2. **The client defaults to `perspective: 'published'`** — even if the token leaked, the client would only return published content by default. To get draft content, you need explicit `draftMode()` cooperation.
3. **The API route that enables draft mode validates a secret** — `defineEnableDraftMode` won't toggle `draftMode()` unless the URL carries a valid preview token.

When adding new data-fetching code, don't break any of these rails:

- Don't read `process.env.SANITY_API_READ_TOKEN` directly — import from `@/sanity/lib/token`.
- Don't switch the client's default perspective to `drafts` — use `draftMode()` + `sanityFetch` cooperation instead.
- Don't create a new draft mode enable endpoint that skips `defineEnableDraftMode`'s token check.

## Where the stega filter comes in

`sanity/lib/client.ts` configures stega like this:

```ts
stega: {
  studioUrl,
  logger: console,
  filter: (props) => {
    if (props.sourcePath.at(-1) === 'title') {
      return true
    }
    return props.filterDefault(props)
  },
}
```

The `filter` decides which string fields get stega markers embedded. Returning `true` means "yes, embed markers"; `filterDefault` is the library's default behavior. Currently the customization is: **always embed markers in `title` fields**, otherwise defer to default.

If you find that a string field isn't clickable in the Presentation tool and you want it to be, extend the filter here.

## Where to change things

If you want to...

| ...change the                                   | ...edit                                                                                              |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| GROQ query for a page                           | `sanity/lib/queries.ts` — then `npm run typegen`                                                     |
| Markup of a rendered component                  | `components/*.tsx`                                                                                   |
| How portable text blocks render                 | `components/CustomPortableText.tsx`                                                                  |
| What fields are inline-editable in Presentation | `sanity/lib/client.ts` stega filter + per-component `createDataAttribute` calls                      |
| How a document URL resolves                     | `sanity/lib/utils.ts` `resolveHref` + `sanity/plugins/resolve.ts`                                    |
| Draft mode enable endpoint URL                  | `app/api/draft-mode/enable/route.ts` AND `sanity.config.ts` `previewUrl`                             |
| Studio mount path                               | `sanity/lib/api.ts` `studioUrl` constant (used by both the Studio route and the client stega config) |

## What could go wrong and how to notice

| Symptom                                                         | Most likely cause                                                                                           |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Page renders published content but new edits don't show up live | `<SanityLive />` isn't rendered in the current layout, or a query bypassed `sanityFetch`                    |
| 404 in draft mode when creating new content                     | The route handler is `notFound()`-ing unconditionally; add the draft-mode escape hatch                      |
| Stega markers visible as garbled text in rendered output        | A library that parses strings (e.g. `new Date(...)`) is seeing the raw string; wrap with `stegaClean` first |
| Meta tag descriptions look garbled on social shares             | The metadata fetch forgot `stega: false`                                                                    |
| `SANITY_API_READ_TOKEN` error at startup                        | Missing env var — check `.env.local` or your deployment's env config                                        |
| "CORS error" toast on a fresh deploy                            | New deploy URL not added to Sanity project CORS allowlist                                                   |
| Types out of sync with schema                                   | `npm run typegen` wasn't run after a schema change; `predev` catches dev, but build/test need it manually   |
