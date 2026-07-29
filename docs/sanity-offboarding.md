# Offboarding from Sanity

This document explains how to export your content and migrate away from Sanity if you decide to use a different content management system.

## Your Data Belongs to You

Sanity is a headless CMS, which means your content is stored separately from your website code. You can export all of your content at any time — there's no lock-in.

## What You'll Get

When you export from Sanity, you receive:

1. **All your content** — pages, blog posts, projects, settings, everything
2. **All your media** — images, PDFs, videos, and other uploaded files
3. **The content structure** — how your content types are organized

## How to Export Your Content

### Option 1: From the Sanity Dashboard (Easiest)

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. Go to **Datasets** in the left sidebar
4. Click the **Export** button next to your dataset (usually "production")
5. Download the `.tar.gz` file

This file contains all your content in a format called NDJSON (one JSON object per line).

### Option 2: From the Command Line

If you have access to the codebase:

```bash
# Export everything as a compressed archive
npx sanity dataset export production ./my-content-backup.tar.gz

# Or export as plain text (easier to read)
npx sanity dataset export production ./my-content-backup.ndjson --no-compress
```

## Understanding the Export File

The export contains JSON objects, one per line. Each object looks like:

```json
{
  "_id": "page-about",
  "_type": "page",
  "title": "About Us",
  "slug": { "current": "about" },
  "content": [...]
}
```

Key fields:

- `_id` — unique identifier for this piece of content
- `_type` — what kind of content it is (page, post, project, etc.)
- Everything else — your actual content

Images are stored as separate asset objects with URLs pointing to Sanity's CDN.

## Migration Paths

### Moving to Another Headless CMS

Popular alternatives include Contentful, Strapi, Payload, or Directus.

**What's involved:**

1. Set up the new CMS with similar content types
2. Write a migration script to transform and import your content
3. Update the website code to fetch from the new CMS
4. Migrate your images to the new system

**Estimated effort:** 2-4 weeks depending on content complexity

### Moving to a Database

If you want to manage content directly in a database (PostgreSQL, MySQL, etc.):

**What's involved:**

1. Design database tables based on your content types
2. Import your content into the database
3. Build an admin interface (or use something like Directus/Strapi)
4. Update the website to query the database

**Estimated effort:** 3-6 weeks

### Moving to File-Based Content

For simpler sites, you might use Markdown/MDX files stored in the codebase:

**What's involved:**

1. Convert your content to Markdown files
2. Update the website to read from files instead of Sanity
3. Content editing happens by editing files (often via GitHub)

**Estimated effort:** 1-2 weeks for simple sites

## What Changes in the Website

The current website fetches content from Sanity using queries. When migrating:

| Current (Sanity)           | Needs Replacement              |
| -------------------------- | ------------------------------ |
| Content queries            | New data fetching logic        |
| Image optimization         | New image handling             |
| Live preview               | New preview system (if needed) |
| Content studio (`/studio`) | New editing interface          |

The visual design, styling, and overall structure of your website remain unchanged — only the content source changes.

## Files to Remove After Migration

Once migrated, these Sanity-specific files can be deleted:

```
sanity/                    # Sanity configuration
app/studio/                # The /studio admin interface
app/api/draft-mode/        # Preview mode endpoints
sanity.config.ts           # Studio configuration
sanity.cli.ts              # CLI configuration
sanity.types.ts            # Generated types
schema.json                # Generated schema
```

## Questions?

If you're considering migrating away from Sanity:

1. **Export a backup first** — always good to have
2. **Evaluate alternatives** — what features do you need?
3. **Get a migration estimate** — complexity varies by site

We're happy to discuss options and provide a migration quote if needed.

---

_Last updated: April 2026_
