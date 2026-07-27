---
date: 2026-04-09
status: completed
owner: Gabriella
---

# Standard Pages Plan — Legal, Error, and Brand Pages

## Summary

Add the repeatable pages every client project needs:
- **Legal pages** — Sanity-editable, i18n-ready, with versioning
- **404 page** — Sanity-editable (singleton)
- **500 page** — Static (no Sanity dependency)
- **Brand page** — Developer tool showing design tokens (not Sanity-connected)

---

## Part A — Legal Pages (Sanity-editable)

### A.1 Sanity Schema: `legalPage`

**Location:** `sanity/schemas/documents/legalPage.ts`

**Approach:** Generic document type with `pageType` enum. Clients can create multiple legal pages, plus custom ones.

**Fields:**

| Field | Type | Notes |
|-------|------|-------|
| `pageType` | `string` (enum) | `privacy`, `terms`, `cookies`, `accessibility`, `disclaimer`, `custom` |
| `title` | `localizedString` | i18n-ready (see A.3) |
| `slug` | `slug` | Source from `pageType` for standard types, `title` for custom |
| `overview` | `localizedText` | Meta description, i18n-ready |
| `content` | `localizedBlockContent` | Portable text, i18n-ready |
| `effectiveDate` | `date` | When this version takes effect |
| `version` | `string` | e.g., "2.1", "January 2026" — freeform |
| `lastUpdated` | `datetime` | Auto-set on publish via document action or manual |

**`pageType` enum values:**

```ts
options: {
  list: [
    { title: 'Privacy Policy', value: 'privacy' },
    { title: 'Terms of Service', value: 'terms' },
    { title: 'Cookie Policy', value: 'cookies' },
    { title: 'Accessibility Statement', value: 'accessibility' },
    { title: 'Disclaimer', value: 'disclaimer' },
    { title: 'Custom', value: 'custom' },
  ]
}
```

**Slug generation logic:**
- For standard types: auto-generate from `pageType` (e.g., `privacy` → `/privacy-policy`)
- For custom: generate from `title`

### A.2 i18n Strategy: Field-level Localization

**Approach:** Define custom object types for localized fields. Each field stores an object with locale keys.

**Why field-level:**
- No plugins required
- Projects can add/remove locales without schema changes
- Works well with Sanity's portable text
- Simpler than document-level i18n for legal content (same page, multiple languages)

**Locale configuration:** `sanity/schemas/objects/locale.ts`

```ts
// Supported locales — extend per-project
export const supportedLocales = [
  { id: 'en', title: 'English', isDefault: true },
  { id: 'es', title: 'Spanish' },
  { id: 'fr', title: 'French' },
  { id: 'pt', title: 'Portuguese' },
]
```

**i18n object types to create:**

| Type | File | Purpose |
|------|------|---------|
| `localeString` | `sanity/schemas/objects/localeString.ts` | Single-line text |
| `localeText` | `sanity/schemas/objects/localeText.ts` | Multi-line plain text |
| `localeBlockContent` | `sanity/schemas/objects/localeBlockContent.ts` | Portable text |

Each type generates fields for each locale:
```ts
// localeString example structure
{
  en: "Privacy Policy",
  es: "Política de Privacidad",
  fr: "Politique de Confidentialité"
}
```

### A.3 Legal Page Route

**Location:** `app/(personal)/legal/[slug]/page.tsx`

**Why `/legal/[slug]` instead of root `[slug]`:**
- Keeps legal pages organized
- Avoids slug collision with main content pages
- Makes sitemap/crawling cleaner

**Features:**
- `generateMetadata` — pulls title and overview for meta tags
- `generateStaticParams` — pre-renders all legal pages
- Draft mode support — same pattern as existing pages
- Locale handling — reads `Accept-Language` header or URL param for preferred locale

**Query:** Add `legalPageBySlugQuery` to `sanity/lib/queries.ts`

### A.4 Legal Pages Index (optional)

**Location:** `app/(personal)/legal/page.tsx`

A simple list page at `/legal` showing all legal pages. Useful for footer links.

---

## Part B — 404 Page (Sanity-editable)

### B.1 Sanity Schema: `notFoundPage` (singleton)

**Location:** `sanity/schemas/singletons/notFoundPage.ts`

**Fields:**

| Field | Type | Notes |
|-------|------|-------|
| `headline` | `localeString` | e.g., "Page not found" |
| `message` | `localeBlockContent` | Helpful message + suggestions |
| `ctaText` | `localeString` | e.g., "Go back home" |
| `ctaLink` | `string` | Default `/` — where the CTA goes |
| `suggestedLinks` | `array` of references | Links to suggest (pages, projects) |

**Singleton registration:**
- Add to `singletonPlugin([...])` in `sanity.config.ts`
- Add to `pageStructure([...])` in `sanity.config.ts`

### B.2 Not Found Route

**Location:** `app/not-found.tsx` (root level, not inside route group)

**Why root level:** Next.js 16 `not-found.tsx` at root catches all 404s app-wide.

**Implementation:**
```ts
import { sanityFetch } from '@/sanity/lib/live'
import { notFoundPageQuery } from '@/sanity/lib/queries'

export default async function NotFound() {
  const { data } = await sanityFetch({ query: notFoundPageQuery, stega: false })
  // Render with fallback if Sanity data is unavailable
  return <NotFoundPage data={data} />
}
```

**Important:** Include fallback content in case Sanity is unreachable (network error, etc.). The 404 page should never fail to render.

### B.3 Query

Add `notFoundPageQuery` to `sanity/lib/queries.ts`:
```groq
*[_type == "notFoundPage"][0]{
  headline,
  message,
  ctaText,
  ctaLink,
  suggestedLinks[]->{ _type, title, slug }
}
```

---

## Part C — 500 Page (Static)

### C.1 Route

**Location:** `app/error.tsx` (root level) + `app/global-error.tsx`

**Why static:** If the server errors, Sanity might be the cause. Don't depend on Sanity for error display.

**`app/error.tsx`:**
- Client component (`'use client'`)
- Catches errors in the app tree
- Shows static error message + retry button

**`app/global-error.tsx`:**
- Client component
- Catches errors in root layout
- Includes its own `<html>` and `<body>` tags
- Minimal styling (inline or import a static CSS file)

### C.2 Content

Hardcoded, minimal, helpful:
- Headline: "Something went wrong"
- Message: "We're working on it. Please try again in a moment."
- CTA: "Try again" (calls `reset()` from error boundary)
- Secondary: "Go back home" link

---

## Part D — Brand Page (Developer Tool)

### D.1 Route

**Location:** `app/(personal)/brand/page.tsx`

**Purpose:** Visual reference for design tokens defined in `globals.css`. Not Sanity-connected — reads directly from CSS/config.

### D.2 What it displays

| Section | Source | Display |
|---------|--------|---------|
| **Brand Colors** | `globals.css` `@theme` block | Color swatches for `--color-primary`, `--color-secondary`, `--color-accent` |
| **Semantic Colors** | `globals.css` | `--color-background`, `--color-foreground`, `--color-muted`, `--color-border` |
| **State Colors** | `globals.css` | `--color-success`, `--color-warning`, `--color-error`, `--color-info` |
| **Full Palette** | `globals.css` | All gray, blue, purple, etc. scales |
| **Typography** | `layout.tsx` fonts | Font family samples with `--font-serif`, `--font-sans`, `--font-mono` |
| **Spacing Scale** | `globals.css` | Visual representation of `--spacing-1` through `--spacing-9` |
| **Border Radius** | `globals.css` | Visual examples of `--radius-sm` through `--radius-full` |

### D.3 Implementation approach

Server component that renders a style guide. CSS variables are read at render time via inline styles referencing the variables:

```tsx
<div style={{ backgroundColor: 'var(--color-primary)' }}>
  Primary
</div>
```

No JavaScript needed to read CSS values — just reference the variables and they resolve at paint time.

### D.4 Optional: Brand identity JSON overlay

If `brand-identity/design.json` exists (after running `/brief`), the page could overlay client-specific brand info:
- Logo preview
- Brand voice summary
- Color rationale

This makes `/brand` useful both as a token reference AND as a brand summary page.

---

## Part E — Supporting Changes

### E.1 Update `sanity.config.ts`

```ts
// New imports
import legalPage from '@/sanity/schemas/documents/legalPage'
import notFoundPage from '@/sanity/schemas/singletons/notFoundPage'
import localeString from '@/sanity/schemas/objects/localeString'
import localeText from '@/sanity/schemas/objects/localeText'
import localeBlockContent from '@/sanity/schemas/objects/localeBlockContent'
import { supportedLocales } from '@/sanity/schemas/objects/locale'

// Add to schema.types array
types: [
  // Singletons
  home,
  settings,
  notFoundPage, // NEW
  // Documents
  legalPage, // NEW
  // ... existing ...
  // Objects
  localeString, // NEW
  localeText, // NEW
  localeBlockContent, // NEW
]

// Update singletonPlugin
singletonPlugin([home.name, settings.name, notFoundPage.name])

// Update pageStructure
pageStructure([home, settings, notFoundPage])
```

### E.2 Update `sanity/plugins/resolve.ts`

Add legal pages to Presentation tool routing:
```ts
// mainDocuments
{ route: '/legal/:slug', filter: `_type == "legalPage" && slug.current == $slug` }

// locations for legalPage
defineLocations({
  select: { title: 'title.en', slug: 'slug.current' },
  resolve: (doc) => ({
    locations: [{ title: doc?.title || 'Legal Page', href: `/legal/${doc?.slug}` }]
  })
})
```

### E.3 Update `sanity/lib/utils.ts`

Extend `resolveHref` to handle `legalPage`:
```ts
case 'legalPage':
  return `/legal/${slug}`
```

### E.4 Update Settings schema (optional)

Add `legalLinks` array to settings for footer:
```ts
defineField({
  name: 'legalLinks',
  title: 'Footer Legal Links',
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'legalPage' }] }]
})
```

### E.5 Run typegen

After schema changes:
```bash
npm run typegen
```

---

## Execution Order

### Step 1: Sanity Objects (i18n foundation)
**Tool:** Manual code
- [ ] Create `sanity/schemas/objects/locale.ts` — locale config
- [ ] Create `sanity/schemas/objects/localeString.ts`
- [ ] Create `sanity/schemas/objects/localeText.ts`
- [ ] Create `sanity/schemas/objects/localeBlockContent.ts`

### Step 2: Sanity Documents
**Tool:** Manual code
- [ ] Create `sanity/schemas/documents/legalPage.ts`
- [ ] Create `sanity/schemas/singletons/notFoundPage.ts`

### Step 3: Register in Sanity Config
**Tool:** Edit `sanity.config.ts`
- [ ] Import new schemas
- [ ] Add to types array
- [ ] Add notFoundPage to singletonPlugin
- [ ] Add notFoundPage to pageStructure

### Step 4: Queries
**Tool:** Edit `sanity/lib/queries.ts`
- [ ] Add `legalPageBySlugQuery`
- [ ] Add `allLegalPagesQuery`
- [ ] Add `notFoundPageQuery`

### Step 5: Run typegen
**Tool:** `npm run typegen`

### Step 6: Presentation Tool
**Tool:** Edit `sanity/plugins/resolve.ts`, `sanity/lib/utils.ts`
- [ ] Add legal page routing
- [ ] Add `resolveHref` case

### Step 7: Next.js Routes — Error Pages
**Tool:** Manual code
- [ ] Create `app/not-found.tsx`
- [ ] Create `app/error.tsx`
- [ ] Create `app/global-error.tsx`

### Step 8: Next.js Routes — Legal Pages
**Tool:** Manual code
- [ ] Create `app/(personal)/legal/[slug]/page.tsx`
- [ ] Create `app/(personal)/legal/page.tsx` (index)

### Step 9: Brand Page
**Tool:** `/frontend-design` skill
- [ ] Create `app/(personal)/brand/page.tsx`
- [ ] Create `components/BrandStyleGuide.tsx`

### Step 10: Settings Update (optional)
**Tool:** Edit `sanity/schemas/singletons/settings.ts`
- [ ] Add `legalLinks` field for footer

### Step 11: Test
- [ ] `npm run dev`
- [ ] Create a Privacy Policy in Studio
- [ ] Visit `/legal/privacy-policy`
- [ ] Visit `/brand`
- [ ] Test 404 by visiting `/nonexistent`
- [ ] Test 500 by triggering an error (temporarily)

---

## File Inventory

### New Files

| File | Purpose |
|------|---------|
| `sanity/schemas/objects/locale.ts` | Locale configuration |
| `sanity/schemas/objects/localeString.ts` | i18n string type |
| `sanity/schemas/objects/localeText.ts` | i18n text type |
| `sanity/schemas/objects/localeBlockContent.ts` | i18n portable text type |
| `sanity/schemas/documents/legalPage.ts` | Legal page document |
| `sanity/schemas/singletons/notFoundPage.ts` | 404 singleton |
| `app/not-found.tsx` | 404 route |
| `app/error.tsx` | Error boundary |
| `app/global-error.tsx` | Root error boundary |
| `app/(personal)/legal/[slug]/page.tsx` | Legal page route |
| `app/(personal)/legal/page.tsx` | Legal index |
| `app/(personal)/brand/page.tsx` | Brand style guide |
| `components/BrandStyleGuide.tsx` | Style guide component |
| `components/NotFoundPage.tsx` | 404 UI component |

### Modified Files

| File | Changes |
|------|---------|
| `sanity.config.ts` | Register new schemas |
| `sanity/lib/queries.ts` | Add legal + 404 queries |
| `sanity/plugins/resolve.ts` | Add Presentation routing |
| `sanity/lib/utils.ts` | Add `resolveHref` case |
| `sanity/schemas/singletons/settings.ts` | Add legalLinks (optional) |

---

## Open Questions (for later)

1. **Cookie consent banner?** — Beyond the cookie policy page, do you want a GDPR-style consent banner component? (This is separate from the static page.)

2. **Legal page templates?** — Should we include starter content for Privacy/Terms/Cookies that clients can customize? (Reduces "blank page" friction.)

3. **Maintenance mode page?** — A toggle in Settings that shows a maintenance page site-wide?

---

## Estimated Effort

- **Steps 1-6 (Sanity schemas + config):** ~45 min
- **Steps 7-8 (Error + Legal routes):** ~30 min
- **Step 9 (Brand page):** ~30 min
- **Step 10-11 (Settings + Test):** ~15 min

**Total:** ~2 hours

---

Approve this plan with `qcode` to begin implementation.
