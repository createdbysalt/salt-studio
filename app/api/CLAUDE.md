# app/api/

Next.js route handlers. Currently there's exactly one endpoint — the draft mode toggle — but any future API routes go here.

## Current layout

```
app/api/
└── draft-mode/
    └── enable/
        └── route.ts    ← GET: enables Sanity draft mode for the Presentation tool
```

## The only existing route: `draft-mode/enable/route.ts`

```ts
import {client} from '@/sanity/lib/client'
import {token} from '@/sanity/lib/token'
import {defineEnableDraftMode} from 'next-sanity/draft-mode'

export const {GET} = defineEnableDraftMode({
  client: client.withConfig({token}),
})
```

**What it does:** `defineEnableDraftMode` from `next-sanity/draft-mode` returns a `GET` handler that:

1. Validates the preview secret passed in the URL (uses the Sanity read token)
2. Calls `draftMode().enable()` if valid
3. Redirects to the path the editor was previewing

This is the endpoint the Sanity Studio Presentation tool hits when an editor clicks "Preview." The config registers it as the `previewUrl` in `sanity.config.ts`:

```ts
presentationTool({
  resolve,
  previewUrl: {previewMode: {enable: '/api/draft-mode/enable'}},
})
```

So if you rename or move this route, you MUST update `sanity.config.ts` to match.

**Why the token is passed explicitly:** the module-level `client` from `sanity/lib/client.ts` uses `perspective: 'published'` and doesn't carry a write token. The `client.withConfig({token})` here overrides that to authenticate the preview token check. Don't remove it.

## Conventions for new API routes

### Route handler exports

Next.js 16 route handlers export named HTTP method functions from `route.ts`:

```ts
export async function GET(request: Request) { ... }
export async function POST(request: Request) { ... }
```

Or, as the draft-mode route shows, you can re-export a named function from a library:

```ts
export const {GET} = defineEnableDraftMode({ ... })
```

Both are valid.

### File path = URL path

`app/api/draft-mode/enable/route.ts` serves at `/api/draft-mode/enable`. Match route file locations to the desired URL — this is Next.js convention, not project-specific, but worth stating because the folder nesting can get deep.

### Import tokens from `sanity/lib/token.ts`, not `process.env` directly

The token is wrapped in `server-only` — importing it guarantees the token never reaches a client bundle. Don't duplicate the pattern locally; always go through `@/sanity/lib/token`.

### If you need to write to Sanity

The existing `SANITY_API_WRITE_TOKEN` env var is defined but not consumed by any current file. When adding a route that writes to Sanity:

1. Create a new file (e.g. `sanity/lib/write-token.ts`) that imports `server-only` and exports `process.env.SANITY_API_WRITE_TOKEN` with the same assert-at-startup pattern as `token.ts`.
2. Use it to build a separate client with the write token, or with `.withConfig({token: writeToken})` on the existing client.
3. Never commit the write token.

Don't share the read token across read and write use cases — separating them makes it easier to rotate and to reason about the blast radius.

### API routes are server-only

All route handlers run on the server. You don't need to mark them `'use server'` — they're server by definition. But you also can't import them from client components, so don't try.

### Draft mode disable is a server action, not an API route

The "disable draft mode" flow doesn't live here. It's a **server action** defined inline in `app/(personal)/layout.tsx`:

```tsx
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

Server actions use `'use server'` inside an async function. They're not route handlers and don't belong here. If you want to disable draft mode from elsewhere, use the same server-action pattern rather than creating a `draft-mode/disable` API route.

## Things to verify before adding a new API route

1. Could this be a **server action** instead? Server actions are usually better for mutations triggered from client UI.
2. Are you using `sanityFetch` for reads, or importing `client` directly? (For reads on the public site, prefer `sanityFetch`; for API-route-specific logic where you need explicit client control, importing `client` is fine.)
3. If you need a write token, are you loading it via a `server-only` wrapper file?
4. Does the URL path match the file path?
5. If this route gets called from the Studio or a Presentation tool flow, have you updated `sanity.config.ts` or the plugin config to point at the new URL?
