# app/edit/

The Sanity Studio, mounted at `/edit`. This is the content management interface where clients (and you) edit pages, projects, settings, and all other content.

## Why `/edit` instead of `/studio`?

The URL `/edit` is more intuitive for non-technical clients. "Go to yourdomain.com/edit to edit your website" is clearer than explaining what a "studio" is.

The constant is defined in `sanity/lib/api.ts`:

```ts
export const studioUrl = '/edit'
```

## Files

```
app/edit/
├── layout.tsx           ← Isolated layout (no globals.css, keeps fonts)
├── [[...index]]/
│   └── page.tsx         ← NextStudio mount (catch-all for Studio routing)
└── CLAUDE.md            ← This file
```

## CSS Isolation

The `/edit` route has its own `layout.tsx` that:

- **Does NOT import `globals.css`** — no Tailwind, no client brand tokens
- **Does NOT import Tailwind preflight** — no CSS resets affecting Studio
- **DOES load the same fonts** — so Presentation previews render consistently

This prevents client brand customizations from bleeding into the Studio UI. The Sanity Studio has its own design system and should look consistent regardless of client branding.

### If you need to style the Studio

Sanity provides theming via `sanity.config.ts`:

```ts
// sanity.config.ts
import {saltStudioTheme} from '@/sanity/plugins/studioTheme'

export default defineConfig({
  // ...
  theme: saltStudioTheme,
})
```

See `sanity/plugins/studioTheme.ts` for the current theme configuration.

## How the Studio Mount Works

```tsx
// app/edit/[[...index]]/page.tsx
import config from '@/sanity.config'
import {NextStudio} from 'next-sanity/studio'

export const dynamic = 'force-static'
export {metadata, viewport} from 'next-sanity/studio'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

- **Catch-all route (`[[...index]]`)** — The Studio has internal routing (documents, tools, settings). This catches all `/edit/*` paths and hands them to NextStudio.
- **`dynamic = 'force-static'`** — The Studio shell is static; client-side hydration handles the dynamic parts.
- **Re-exported metadata/viewport** — The Studio sets its own page title, viewport settings, etc.

## Authentication

Sanity handles authentication. When someone visits `/edit`:

1. If not logged in → Sanity login screen
2. If logged in but no access → "You don't have access" message
3. If logged in with access → Full Studio

Manage team access at [manage.sanity.io](https://manage.sanity.io).

## Draft Mode & Presentation

The Studio includes the Presentation tool for live previewing. When an editor clicks "Preview":

1. A new tab opens with the public site + a preview token
2. The token hits `/api/draft-mode/enable` which enables Next.js draft mode
3. The public site now shows draft content and visual editing overlays
4. `<SanityLive />` in the public layout subscribes to real-time changes

This flow is independent of the Studio's CSS isolation — the preview opens the public site (with its own layout and styles), not something inside `/edit`.

## Customization Points

| What             | Where                                 | Notes                 |
| ---------------- | ------------------------------------- | --------------------- |
| Studio URL       | `sanity/lib/api.ts`                   | Change `studioUrl`    |
| Studio theme     | `sanity/plugins/studioTheme.ts`       | Colors, fonts         |
| Studio logo      | `sanity/plugins/studioComponents.tsx` | Custom navbar logo    |
| Desk structure   | `sanity/plugins/settings.tsx`         | Sidebar organization  |
| Document actions | `sanity.config.ts`                    | Publish, delete, etc. |

## Common Tasks

### Give a client access

1. Go to [manage.sanity.io](https://manage.sanity.io)
2. Select the project
3. Click "Invite member"
4. Set role (Editor for content, Admin for settings)

### Change the Studio branding

Edit `sanity/plugins/studioTheme.ts` for colors, or `sanity/plugins/studioComponents.tsx` for the logo.

### Add a new document type to the sidebar

1. Create schema in `sanity/schemas/documents/`
2. Register in `sanity.config.ts` → `schema.types`
3. If singleton, add to `singletonPlugin()` and `pageStructure()`
4. Run `npm run typegen`

## Troubleshooting

### "Styles look broken in the Studio"

The Studio should be completely unstyled by client CSS. If you're seeing Tailwind styles affecting the Studio:

1. Check that `app/edit/layout.tsx` exists and doesn't import `globals.css`
2. Make sure there's no `app/layout.tsx` override that forces globals everywhere

### "Fonts don't match preview"

The admin layout loads the same fonts as the public site. If fonts look different:

1. Verify `app/edit/layout.tsx` imports the same fonts as `app/layout.tsx`
2. Check the font CSS variables match (`--font-serif`, `--font-sans`, `--font-mono`)

### "I need analytics in the Studio"

Don't. The Studio is an internal tool, not a client-facing page. Analytics belong on the public site only.
