# sanity/

Everything related to Sanity lives here: the Studio schemas, the queries used by the public site, the client setup, and the Presentation tool plumbing. The Studio itself is mounted at `/edit` via `app/edit/[[...index]]/page.tsx`, which imports `sanity.config.ts` at the project root.

> **Why `/edit`?** More intuitive for clients — "go to yourdomain.com/edit" is clearer than explaining what a "studio" is. The URL is configured in `sanity/lib/api.ts` as `studioUrl`. See `app/edit/CLAUDE.md` for Studio-specific documentation.

## Layout

```
sanity/
├── lib/
│   ├── api.ts        ← Env vars (projectId, dataset, apiVersion) + studioUrl constant
│   ├── client.ts     ← createClient() with stega enabled for Presentation overlays
│   ├── live.ts       ← defineLive() → exports SanityLive + sanityFetch
│   ├── queries.ts    ← All GROQ queries, wrapped in defineQuery()
│   ├── token.ts      ← Server-only read token; throws at startup if missing
│   └── utils.ts      ← urlForImage, urlForOpenGraphImage, resolveHref
├── plugins/
│   ├── resolve.ts    ← Presentation Resolver: route↔document mapping + locations
│   └── settings.tsx  ← singletonPlugin (hide dupe) + pageStructure (desk layout)
└── schemas/
    ├── documents/
    │   ├── page.ts       ← Generic pages accessed by slug → /[slug]
    │   └── project.ts    ← Portfolio projects → /projects/[slug]
    ├── singletons/
    │   ├── home.ts       ← Front page content (singleton)
    │   └── settings.ts   ← Global menu, footer, OG image (singleton)
    └── objects/
        ├── duration/
        │   ├── index.ts          ← Start/end datetime object
        │   └── DurationInput.tsx ← Custom React input showing start → end inline
        ├── timeline.ts   ← Array of items, each with milestones (max 2 items)
        └── milestone.ts  ← Title, description, image, tags, duration
```

## How everything connects

Three files collaborate to register a schema:

1. **`sanity/schemas/<kind>/<name>.ts`** — defines the type with `defineType`
2. **`sanity.config.ts`** (at project root) — imports and adds it to the `schema.types` array
3. **`sanity.config.ts`** again — singletons also go into `singletonPlugin([...])` and `pageStructure([...])`

If you add a new schema file and forget to register it in `sanity.config.ts`, it won't appear in the Studio. If you forget to re-run `npm run typegen`, your queries won't have types for it.

## Client-Friendly Schema Conventions (REQUIRED)

**Every schema in this template will be edited by non-technical clients.** Follow these rules without exception:

### 1. Every field MUST have a description

```ts
// BAD
defineField({
  name: 'overview',
  title: 'Overview',
  type: 'text',
})

// GOOD
defineField({
  name: 'overview',
  title: 'Overview',
  type: 'text',
  description: 'A brief summary for search engines. Keep under 155 characters.',
})
```

Descriptions should:

- Explain what the field is for in plain English
- Include character limits if applicable
- Mention where the content appears (e.g., "Displayed in the header")

### 2. Use field groups to organize complex documents

```ts
groups: [
  {name: 'content', title: 'Content', default: true},
  {name: 'seo', title: 'SEO'},
  {name: 'settings', title: 'Settings'},
],
```

Then assign each field to a group: `group: 'content'`

### 3. Validation messages should explain WHY

```ts
// BAD
validation: (rule) => rule.required()

// GOOD
validation: (rule) => rule.required().error('Title appears in browser tabs and search results')

// ALSO GOOD
validation: (rule) => rule.max(155).warning('Longer descriptions get cut off in Google results')
```

Use `.error()` for must-fix issues, `.warning()` for recommendations.

### 4. Use helpful initial values

```ts
defineField({
  name: 'ctaText',
  title: 'Button Text',
  type: 'string',
  initialValue: 'Learn more',
  description: 'The text shown on the call-to-action button.',
})
```

### 5. Limit portable text options

Don't give clients 50 formatting options. Give them what they need:

```ts
// Minimal (for short descriptions)
marks: {
  decorators: [
    {title: 'Bold', value: 'strong'},
    {title: 'Italic', value: 'em'},
  ],
  annotations: [], // No links in short text
}

// Standard (for body content)
marks: {
  decorators: [
    {title: 'Bold', value: 'strong'},
    {title: 'Italic', value: 'em'},
  ],
  annotations: [
    {name: 'link', type: 'object', title: 'Link', fields: [{name: 'href', type: 'url'}]},
  ],
}
```

### 6. Preview configurations should be informative

```ts
preview: {
  select: {
    title: 'title',
    subtitle: 'pageType',
    media: 'coverImage',
    status: 'status',
  },
  prepare({title, subtitle, media, status}) {
    return {
      title: title || 'Untitled',
      subtitle: `${subtitle} ${status === 'draft' ? '(Draft)' : ''}`,
      media,
    }
  },
}
```

### 7. Collapsible sections for advanced options

```ts
defineField({
  name: 'advancedOptions',
  title: 'Advanced Options',
  type: 'object',
  options: {
    collapsible: true,
    collapsed: true, // Hidden by default
  },
  fields: [...],
})
```

### 8. Image fields should request alt text

```ts
defineField({
  name: 'coverImage',
  title: 'Cover Image',
  type: 'image',
  description: 'Recommended size: 1200×630px',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      description: 'Describe the image for screen readers and SEO.',
      validation: (rule) => rule.required().warning('Alt text improves accessibility and SEO'),
    }),
  ],
})
```

---

## Conventions

### Document vs Object vs Singleton

- **Document** (`type: 'document'`) — standalone, can have many instances. Use for content like pages and projects. Users create, edit, delete freely.
- **Object** (`type: 'object'`) — reusable structured field, lives inside documents. Use for things like `timeline`, `milestone`, `duration`. Never standalone; only referenced from document fields.
- **Singleton** — a document there is only ever one of, like `home` or `settings`. Technically still `type: 'document'`, but registered with the `singletonPlugin` in `sanity.config.ts` to hide the "new" and "duplicate" actions. Structure tool puts them at the top of the desk via `pageStructure`.

**Rule of thumb:** if it will have one instance ever, it's a singleton. If it has a slug and can have many, it's a document. If it's a structured field used inside other content, it's an object.

### Schema files always use `defineType`/`defineField`

Every schema file imports from `sanity`:

```ts
import {defineArrayMember, defineField, defineType} from 'sanity'
```

Never use plain object literals for schema definitions — `defineType` and friends give you type checking and autocomplete in the Studio config. See `sanity/schemas/documents/page.ts` for the canonical shape.

### Icons

Documents and singletons set an icon from `@sanity/icons`:

```ts
import {CogIcon, DocumentIcon, HomeIcon} from '@sanity/icons'
```

Not strictly required but makes the desk tool readable. The singletons each pick a unique icon.

### Validation

Use `validation: (rule) => rule.required()` for required fields. Chain with `.max(N)` for length limits. Example patterns from the existing schemas:

- `rule.required()` — required
- `rule.max(155).required()` — overview fields are capped at 155 chars so they fit in a meta description
- `Rule.max(2)` — timeline is limited to 2 items by schema

### Portable text (rich content)

Rich content uses `type: 'array'` with `defineArrayMember({type: 'block', ...})`. The overview fields on `home`, `page`, `project` use a minimal shape (em/strong decorators only, no lists). The body fields allow link annotations and embedded objects (timeline, image).

When adding a new portable-text field, decide which **decorators**, **annotations**, and **inline objects** it needs — keep the list minimal. The renderer on the frontend is `components/CustomPortableText.tsx`; if you add a new annotation or inline object, the renderer has to handle it.

### Custom input components

`sanity/schemas/objects/duration/` is the reference pattern for a custom React input inside the Studio:

1. `index.ts` defines the schema field and passes `components: {input: DurationInput}`
2. `DurationInput.tsx` imports from `@sanity/ui` (Box, Flex, Text) and uses `ObjectInputProps` + `MemberField` to render a custom layout (start arrow end on one row)

Use this pattern sparingly — only when the default input materially hurts the editor experience. Don't rebuild inputs that Sanity already provides well.

### Slug fields

```ts
defineField({
  type: 'slug',
  name: 'slug',
  options: {source: 'title'},
  validation: (rule) => rule.required(),
})
```

`project.ts` additionally sets `maxLength: 96` and a custom `isUnique`. Match these patterns when adding new slug fields.

## Queries (`sanity/lib/queries.ts`)

**Every query must use `defineQuery`** from `next-sanity`. That's what makes the generated `sanity.types.ts` aware of them.

```ts
import {defineQuery} from 'next-sanity'

export const homePageQuery = defineQuery(`
  *[_type == "home"][0]{ ... }
`)
```

### Existing query inventory

| Query                | Purpose                                                         | Parameters |
| -------------------- | --------------------------------------------------------------- | ---------- |
| `homePageQuery`      | Home singleton with dereferenced `showcaseProjects`             | none       |
| `pagesBySlugQuery`   | Single page by slug                                             | `$slug`    |
| `projectBySlugQuery` | Single project by slug                                          | `$slug`    |
| `settingsQuery`      | Settings singleton with dereferenced `menuItems`                | none       |
| `slugsByTypeQuery`   | All slugs of a given document type (for `generateStaticParams`) | `$type`    |

### GROQ patterns to follow

- **Singleton fetch:** `*[_type == "home"][0]{ ... }` — the `[0]` is essential, otherwise you get an array.
- **Filter by slug:** `*[_type == "page" && slug.current == $slug][0]` — use the reserved `$slug` parameter, not string interpolation.
- **Dereference references inside arrays:** `menuItems[]{ _key, ...@->{...} }` — the `@->` dereferences and `...` spreads the referenced doc's fields. Keep `_key` so React list rendering works.
- **Project slug to plain string:** `"slug": slug.current` — flattens the slug object.
- **Only defined slugs:** `*[_type == $type && defined(slug.current)]` — filters out drafts without slugs.

When adding a new query, follow these conventions or the types regen won't line up with the frontend.

### After changing queries OR schemas

```bash
npm run typegen
```

This runs `sanity schema extract` (updates `schema.json`) then `sanity typegen generate` (updates `sanity.types.ts`). Both files are committed. Neither should ever be hand-edited.

The `predev` npm hook runs `typegen` automatically before `npm run dev`, so the common case is handled. But if you're working on a build or test run without going through dev, run it manually.

## Fetching at request time — use `sanityFetch`, not `client.fetch`

`sanity/lib/live.ts` exports `SanityLive` (a component) and `sanityFetch` (a function):

```ts
import {defineLive} from 'next-sanity/live'
import {client} from './client'
import {token} from './token'

export const {SanityLive, sanityFetch} = defineLive({
  client,
  serverToken: token,
  browserToken: token,
})
```

Rules:

1. **`sanityFetch` is how the site reads content at request time.** It's what wires up live revalidation and draft mode. Importing `client` directly and calling `client.fetch` bypasses all of that.
2. **`<SanityLive />` must be rendered somewhere in the layout tree** to enable the live subscription on the client. It's placed in `app/(personal)/layout.tsx`. If you add a new top-level layout, include it there too.
3. **The client has `stega` enabled** (see `sanity/lib/client.ts`) so Presentation tool overlays can identify editable fields. The stega `filter` currently allows editing `title` fields inline. If you want more fields inline-editable, extend the filter there.

## Tokens (`sanity/lib/token.ts`)

```ts
import 'server-only'

export const token = process.env.SANITY_API_READ_TOKEN
if (!token) {
  throw new Error('Missing SANITY_API_READ_TOKEN')
}
```

Notes:

- **`server-only`** — importing this file from a client component will fail at build time. That's intentional: the token must never reach the browser.
- The token is **required**, and the app throws at startup if it's missing. No fallback.
- A separate `SANITY_API_WRITE_TOKEN` exists in env but is not loaded by any current file; it's only needed when adding write-capable API routes.

## Presentation tool (`sanity/plugins/resolve.ts`)

The Presentation tool lets editors click a field in a preview and jump into the Studio to edit it. For this to work, we tell Presentation two things:

1. **`mainDocuments`** — a `defineDocuments` call that maps URL routes to document filters. Current routes: `/projects/:slug` → `_type == "project"`, `/:slug` → `_type == "page"`.
2. **`locations`** — a `defineLocations` per document type that tells Presentation which URLs show this document. Home is static (`/`). Page and project resolve from slug via the `resolveHref` helper in `sanity/lib/utils.ts`.

When adding a new document type that's accessible at a URL, add it to both `mainDocuments` and `locations`, and extend `resolveHref` to handle the new `documentType`.

## Singletons plugin (`sanity/plugins/settings.tsx`)

Two exports:

- **`singletonPlugin(types: string[])`** — a Sanity plugin that hides the "new document" option and the "duplicate" action for the listed types. Called as `singletonPlugin([home.name, settings.name])` in `sanity.config.ts`.
- **`pageStructure(typeDefArray)`** — a `StructureResolver` that puts the singletons at the top of the desk tool list (above a divider, above the default document type list items). Called as `pageStructure([home, settings])`.

When adding a new singleton:

1. Create the schema in `sanity/schemas/singletons/` with a unique `name`.
2. Import it into `sanity.config.ts`.
3. Add it to the `schema.types` array.
4. Add its `name` to the `singletonPlugin([...])` call.
5. Add the type definition to `pageStructure([...])`.

Miss any step and the singleton either shows up with duplicate buttons, or doesn't show up at all, or appears in the wrong place in the desk.

## Media Library (sanity-plugin-media)

The plugin at `/edit/media` is the client's primary interface for browsing and reusing brand assets. It has very specific constraints (tag names are slugs, text search ignores tags, tag facets AND together, etc.) that dictate a strict tagging convention.

**Before uploading any new asset or modifying `scripts/upload-brand-assets.mjs`, read [`brand-identity/asset-tagging-strategy.md`](../brand-identity/asset-tagging-strategy.md).** It's the canonical source for:

- The 4 tag dimensions (`type-`, `color-`, `use-`, `style-`) and their controlled vocabulary
- Title and description conventions (they matter — titles are what the search bar actually hits)
- How to extend the vocabulary without breaking existing assets
- Anti-patterns to avoid (colons, format tags, novel one-off tags)

Do not invent new tag conventions ad-hoc. If the controlled vocabulary doesn't cover something, update the strategy doc first, then use the new tag.

## Images

Use `urlForImage` from `sanity/lib/utils.ts` to build image URLs:

```ts
import {urlForImage, urlForOpenGraphImage} from '@/sanity/lib/utils'

const url = urlForImage(image)?.width(800).height(600).url()
const ogUrl = urlForOpenGraphImage(image) // 1200×627, crop fit
```

Both return `undefined` if the image is missing its asset ref, so always handle the undefined case.

Only `cdn.sanity.io` is whitelisted in `next.config.ts` `remotePatterns`. Any other image source requires updating that file.

## Things to verify before touching schemas

1. Is `predev` going to catch your schema change, or do you need to run `npm run typegen` manually?
2. Are there queries in `queries.ts` that project the field you're renaming or removing?
3. Are there components that consume the field via `sanity.types.ts` types?
4. If it's a new document type with a URL, does `resolve.ts` know about it?
5. If it's a singleton, is it in `singletonPlugin` and `pageStructure`?
6. Does the Presentation tool's `locations` config cover it so editors can click through from the preview?

Forgetting any of 4–6 results in silent degradation of the editor experience, not a build error. Worth checking.
