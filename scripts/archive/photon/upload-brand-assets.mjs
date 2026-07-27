/**
 * Upload brand assets (logos, shapes, patterns, studio photos) to Sanity
 * with proper titles, descriptions, and tags via sanity-plugin-media.
 *
 * Tagging strategy: see brand-identity/asset-tagging-strategy.md
 * Every asset gets 3–5 tags drawn from four controlled dimensions:
 *   - type-*   (always): logo | shape | pattern | photo
 *   - color-*  (always): black | orange | white | mixed | mono | multi
 *   - use-*    (1–2):    header | footer | hero | background | accent |
 *                        social | favicon | watermark | content | print
 *   - style-*  (0–2):    horizontal | vertical | inline | wordmark | mark |
 *                        halftone | sunburst | ring | concentric | spiral |
 *                        sphere | burst | tileable | landscape | portrait |
 *                        candid | architecture
 *
 * Usage: SANITY_AUTH_TOKEN="..." node scripts/upload-brand-assets.mjs
 */

import {createClient} from '@sanity/client'
import fs from 'fs'
import path from 'path'

const client = createClient({
  projectId: '25ywlhce',
  dataset: 'production',
  apiVersion: '2025-02-27',
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
})

const SVG_DIR = '/Users/gabriellamartins/Downloads/photon-svg-logos'
const PNG_DIR = '/Users/gabriellamartins/Downloads/4x'
const IMG_DIR = '/Users/gabriellamartins/Downloads/IMAGES'

// ── Tag sets (deduped via spreads to keep definitions readable) ────────────
const LOGO_HORIZONTAL_BLACK = ['type-logo', 'color-black', 'use-header', 'use-footer', 'style-horizontal', 'style-wordmark']
const LOGO_VERTICAL_BLACK = ['type-logo', 'color-black', 'use-social', 'style-vertical', 'style-wordmark']
const LOGO_NAME_VERTICAL = ['type-logo', 'color-black', 'use-social', 'use-favicon', 'style-vertical', 'style-wordmark']
const LOGO_INLINE_BLACK = ['type-logo', 'color-black', 'use-footer', 'use-watermark', 'style-inline', 'style-wordmark']
const LOGO_INLINE_ORANGE = ['type-logo', 'color-orange', 'use-accent', 'style-inline', 'style-wordmark']
const LOGO_INLINE_MIXED = ['type-logo', 'color-mixed', 'use-hero', 'style-inline', 'style-wordmark']
const LOGO_HALFTONE = ['type-logo', 'color-black', 'use-hero', 'use-print', 'style-halftone', 'style-wordmark']
const LOGO_SUNBURST = ['type-logo', 'color-orange', 'use-hero', 'use-print', 'style-sunburst', 'style-mark']
const LOGO_TEXT_RING = ['type-logo', 'color-black', 'use-watermark', 'use-accent', 'style-ring', 'style-mark']

const SHAPE_GEOMETRIC_RING = ['type-shape', 'color-black', 'use-accent', 'style-ring']
const SHAPE_CONCENTRIC = ['type-shape', 'color-black', 'use-favicon', 'use-accent', 'style-concentric']
const SHAPE_OPEN_SPIRAL = ['type-shape', 'color-black', 'use-accent', 'style-spiral']
const SHAPE_GOLDEN_SPIRAL = ['type-shape', 'color-black', 'use-accent', 'style-spiral']
const SHAPE_DENSE_SPHERE = ['type-shape', 'color-black', 'use-hero', 'use-background', 'style-sphere']
const SHAPE_SWIRL_SPHERE = ['type-shape', 'color-black', 'use-hero', 'style-sphere']
const SHAPE_SCATTERED_BURST = ['type-shape', 'color-black', 'use-hero', 'use-background', 'style-burst']
const SHAPE_ORBITING_RING = ['type-shape', 'color-black', 'use-background', 'style-ring']
const SHAPE_ULTRA_DENSE_SPHERE = ['type-shape', 'color-black', 'use-print', 'style-sphere']

const PATTERN_SQUARE_LARGE = ['type-pattern', 'color-black', 'use-background', 'style-tileable']
const PATTERN_SQUARE_SMALL = ['type-pattern', 'color-black', 'use-background', 'style-tileable']
const PATTERN_CIRCLE_GRID = ['type-pattern', 'color-black', 'use-background', 'style-tileable']

const PHOTO_LISBON_LANDSCAPE = ['type-photo', 'color-mono', 'use-hero', 'use-content', 'style-landscape', 'style-architecture']
const PHOTO_LISBON_PORTRAIT = ['type-photo', 'color-mono', 'use-hero', 'use-content', 'style-portrait', 'style-architecture']

// ── Asset manifest ─────────────────────────────────────────────────────────
const assets = [
  // ── Logos (SVG — preferred format) ───────────────────────────────────
  {
    file: `${SVG_DIR}/photon-primary-horizontal.svg`,
    title: 'Photon logo — horizontal (black)',
    description: 'Two-line horizontal lockup in dot-matrix grid: "PHOTON" above ".STUDIO". Black on transparent. Use for website headers, email signatures, presentations, and document footers.',
    tags: LOGO_HORIZONTAL_BLACK,
  },
  {
    file: `${SVG_DIR}/photon-primary-vertical.svg`,
    title: 'Photon logo — vertical stacked (black)',
    description: 'Stacked vertical wordmark in dot-matrix grid: PHO/TON/STU/DIO on four lines. Black on transparent. Use for portrait layouts, mobile headers, social media profile images.',
    tags: LOGO_VERTICAL_BLACK,
  },
  {
    file: `${SVG_DIR}/photon-name-vertical.svg`,
    title: 'Photon logo — name only, vertical',
    description: 'Stacked "PHOTON" (no ".STUDIO") in a 2-column dot-matrix layout. Black on transparent. Use for square social avatars, app icons, and compact branding contexts.',
    tags: LOGO_NAME_VERTICAL,
  },
  {
    file: `${SVG_DIR}/photon-inline-black.svg`,
    title: 'Photon logo — inline (black)',
    description: 'Single-line "PHOTON.STUDIO" in a fine dot-matrix grid. Black on transparent. Very compact — use for footers, navigation bars, and subtle watermarks.',
    tags: LOGO_INLINE_BLACK,
  },
  {
    file: `${SVG_DIR}/photon-inline-orange.svg`,
    title: 'Photon logo — inline (orange)',
    description: 'Single-line "PHOTON.STUDIO" in a fine dot-matrix grid, rendered in brand orange. Use on white or light backgrounds for accent branding.',
    tags: LOGO_INLINE_ORANGE,
  },
  {
    file: `${SVG_DIR}/photon-inline-mixed.svg`,
    title: 'Photon logo — inline (black + orange)',
    description: 'Single-line "PHOTON.STUDIO" with dots alternating between black and orange, creating a vibrant two-tone particle effect. Use for hero sections and featured branding moments.',
    tags: LOGO_INLINE_MIXED,
  },
  {
    file: `${SVG_DIR}/photon-halftone-mark-black.svg`,
    title: 'Photon logo — halftone tube (black)',
    description: 'Lowercase "photon" where each letter is built from concentric rings of tiny dots, creating a 3D cylindrical tube illusion. Artistic and editorial. Use for about pages, hero moments, and print.',
    tags: LOGO_HALFTONE,
  },
  {
    file: `${SVG_DIR}/photon-sunburst-mark-orange.svg`,
    title: 'Photon logo — sunburst mark (orange)',
    description: 'Circular sunburst composition: "PHOTON.STUDIO" text radiates outward from a central dot-matrix ring like rays of light. Brand orange. Use for hero backgrounds, splash pages, and merch.',
    tags: LOGO_SUNBURST,
  },
  {
    file: `${SVG_DIR}/photon-text-ring.svg`,
    title: 'Photon logo — text ring seal',
    description: 'Circular typographic wreath: dot-matrix "PHOTON .STUDIO" text repeats around the circumference with an open center. Black on transparent. Use as a decorative seal, watermark, or badge.',
    tags: LOGO_TEXT_RING,
  },

  // ── Shapes (SVG — only those under 1MB) ──────────────────────────────
  {
    file: `${SVG_DIR}/shape-geometric-ring.svg`,
    title: 'Geometric ring — dot-matrix D-blocks',
    description: 'Open ring/circle built from dot-matrix letterform blocks with a large empty center. Geometric and structured. Use as a framing element around content.',
    tags: SHAPE_GEOMETRIC_RING,
  },
  {
    file: `${SVG_DIR}/shape-concentric-circles.svg`,
    title: 'Concentric circles — favicon mark',
    description: 'Three concentric circles of varying dot sizes forming a bullseye/target pattern. Semantically represents a photon (particle of light). Recommended favicon source. Also good for loading states and accent marks.',
    tags: SHAPE_CONCENTRIC,
  },
  {
    file: `${SVG_DIR}/shape-open-spiral.svg`,
    title: 'Open spiral — C-shape circles',
    description: 'Concentric dot circles with the right side broken open, creating a spiral or "C" motion. Use as a decorative accent or section marker.',
    tags: SHAPE_OPEN_SPIRAL,
  },
  {
    file: `${SVG_DIR}/shape-golden-spiral.svg`,
    title: 'Golden spiral — Fibonacci curve',
    description: 'Fibonacci/golden spiral curve built from three nested layers of overlapping large dots. Wave-like form opening to the right. Use for about pages, culture sections, artistic moments.',
    tags: SHAPE_GOLDEN_SPIRAL,
  },
  {
    file: `${SVG_DIR}/shape-dense-sphere.svg`,
    title: 'Dense dot sphere',
    description: 'Dense swirling mass of dots forming an organic sphere, like iron filings around a magnet. Nearly solid black with thin white fissure lines. Use for hero backgrounds on light surfaces.',
    tags: SHAPE_DENSE_SPHERE,
  },
  {
    file: `${SVG_DIR}/shape-scattered-burst.svg`,
    title: 'Scattered square burst',
    description: 'Dot-matrix squares spiraling outward from a tight center like an explosion of pixels. Airy and energetic. Use for background textures and hero sections.',
    tags: SHAPE_SCATTERED_BURST,
  },

  // ── Patterns (SVG) ───────────────────────────────────────────────────
  {
    file: `${SVG_DIR}/pattern-square-grid-large.svg`,
    title: 'Square grid pattern — large, tileable',
    description: 'Tileable grid of dot-matrix square shapes, medium density (~7 columns visible). Use for page backgrounds and section overlays at reduced opacity.',
    tags: PATTERN_SQUARE_LARGE,
  },
  {
    file: `${SVG_DIR}/pattern-square-grid-small.svg`,
    title: 'Square grid pattern — fine, tileable',
    description: 'Tileable grid of tiny dot-matrix squares, very fine and dense. Use for subtle textures and paper-like backgrounds.',
    tags: PATTERN_SQUARE_SMALL,
  },

  // ── Shapes & patterns (PNG @4x — for the large SVGs that are too heavy) ───
  {
    file: `${PNG_DIR}/pattern-circle-grid@4x.png`,
    title: 'Circle grid pattern — tileable',
    description: 'Repeating grid of dot-matrix circles in halftone tube style. Light and subtle on white. Use for page backgrounds and section textures. (PNG version — SVG source is 10MB.)',
    tags: PATTERN_CIRCLE_GRID,
  },
  {
    file: `${PNG_DIR}/shape-swirl-sphere@4x.png`,
    title: 'Swirling dot sphere',
    description: 'Organic sphere made of swirling dot streams. More open than the dense sphere, with visible spiral motion. Use for feature highlights and about sections.',
    tags: SHAPE_SWIRL_SPHERE,
  },
  {
    file: `${PNG_DIR}/shape-orbiting-ring@4x.png`,
    title: 'Orbiting square ring',
    description: 'Dot-matrix squares forming a loose ring or orbit pattern around a large empty center. Use for background textures and framing elements.',
    tags: SHAPE_ORBITING_RING,
  },
  {
    file: `${PNG_DIR}/shape-ultra-dense-sphere@4x.png`,
    title: 'Ultra-dense dot sphere',
    description: 'Extremely dense mass of dots forming a nearly solid organic sphere. Highly detailed at full resolution. Use for large-scale print and high-resolution backgrounds.',
    tags: SHAPE_ULTRA_DENSE_SPHERE,
  },

  // ── Logo PNGs (backup raster versions, same tags as their SVG siblings) ──
  {
    file: `${PNG_DIR}/photon-primary-horizontal@4x.png`,
    title: 'Photon logo — horizontal (black) — raster',
    description: 'Raster version of the primary horizontal wordmark at 4x resolution. Use when SVG is not supported (e.g. email clients, legacy software).',
    tags: LOGO_HORIZONTAL_BLACK,
  },
  {
    file: `${PNG_DIR}/photon-primary-vertical@4x.png`,
    title: 'Photon logo — vertical stacked (black) — raster',
    description: 'Raster version of the vertical stacked wordmark at 4x resolution. Use when SVG is not supported.',
    tags: LOGO_VERTICAL_BLACK,
  },
  {
    file: `${PNG_DIR}/photon-name-vertical@4x.png`,
    title: 'Photon logo — name only, vertical — raster',
    description: 'Raster version of the name-only vertical wordmark at 4x resolution. Use when SVG is not supported.',
    tags: LOGO_NAME_VERTICAL,
  },
  {
    file: `${PNG_DIR}/photon-inline-black@4x.png`,
    title: 'Photon logo — inline (black) — raster',
    description: 'Raster version of the black inline wordmark at 4x resolution. Use when SVG is not supported.',
    tags: LOGO_INLINE_BLACK,
  },
  {
    file: `${PNG_DIR}/photon-inline-orange@4x.png`,
    title: 'Photon logo — inline (orange) — raster',
    description: 'Raster version of the orange inline wordmark at 4x resolution. Use when SVG is not supported.',
    tags: LOGO_INLINE_ORANGE,
  },
  {
    file: `${PNG_DIR}/photon-inline-mixed@4x.png`,
    title: 'Photon logo — inline (black + orange) — raster',
    description: 'Raster version of the mixed two-tone inline wordmark at 4x resolution. Use when SVG is not supported.',
    tags: LOGO_INLINE_MIXED,
  },
  {
    file: `${PNG_DIR}/photon-halftone-mark-black@4x.png`,
    title: 'Photon logo — halftone tube (black) — raster',
    description: 'Raster version of the halftone tube wordmark at 4x resolution. Use when SVG is not supported.',
    tags: LOGO_HALFTONE,
  },
  {
    file: `${PNG_DIR}/photon-sunburst-mark-orange@4x.png`,
    title: 'Photon logo — sunburst mark (orange) — raster',
    description: 'Raster version of the sunburst mark at 4x resolution. Use when SVG is not supported.',
    tags: LOGO_SUNBURST,
  },
  {
    file: `${PNG_DIR}/photon-text-ring@4x.png`,
    title: 'Photon logo — text ring seal — raster',
    description: 'Raster version of the text ring mark at 4x resolution. Use when SVG is not supported.',
    tags: LOGO_TEXT_RING,
  },

  // ── Shape PNGs (backup raster versions) ──────────────────────────────
  {
    file: `${PNG_DIR}/shape-dense-sphere@4x.png`,
    title: 'Dense dot sphere — raster',
    description: 'Raster version of the dense dot sphere at 4x resolution.',
    tags: SHAPE_DENSE_SPHERE,
  },
  {
    file: `${PNG_DIR}/shape-geometric-ring@4x.png`,
    title: 'Geometric ring — raster',
    description: 'Raster version of the geometric D-block ring at 4x resolution.',
    tags: SHAPE_GEOMETRIC_RING,
  },
  {
    file: `${PNG_DIR}/shape-concentric-circles@4x.png`,
    title: 'Concentric circles — favicon mark — raster',
    description: 'Raster version of the concentric circles mark at 4x resolution.',
    tags: SHAPE_CONCENTRIC,
  },
  {
    file: `${PNG_DIR}/shape-open-spiral@4x.png`,
    title: 'Open spiral — raster',
    description: 'Raster version of the open spiral shape at 4x resolution.',
    tags: SHAPE_OPEN_SPIRAL,
  },
  {
    file: `${PNG_DIR}/shape-golden-spiral@4x.png`,
    title: 'Golden spiral — raster',
    description: 'Raster version of the golden spiral shape at 4x resolution.',
    tags: SHAPE_GOLDEN_SPIRAL,
  },
  {
    file: `${PNG_DIR}/shape-scattered-burst@4x.png`,
    title: 'Scattered square burst — raster',
    description: 'Raster version of the scattered square burst at 4x resolution.',
    tags: SHAPE_SCATTERED_BURST,
  },

  // ── Studio Photos ────────────────────────────────────────────────────
  {
    file: `${IMG_DIR}/lisbon.jpg`,
    title: 'Lisbon studio — landscape',
    description: 'Black-and-white architectural photograph from the Photon Studio location in Lisbon, Portugal. Upward angle between two modern white buildings with sharp angular geometry. Landscape orientation.',
    tags: PHOTO_LISBON_LANDSCAPE,
  },
  {
    file: `${IMG_DIR}/lisbon vert.jpg`,
    title: 'Lisbon studio — portrait',
    description: 'Black-and-white architectural photograph from the Photon Studio location in Lisbon, Portugal. Same upward angle between angular white buildings, cropped vertically. Portrait orientation.',
    tags: PHOTO_LISBON_PORTRAIT,
  },
]

// ── Ensure tags exist in sanity-plugin-media ────────────────────────────
async function ensureTag(tagName) {
  const existing = await client.fetch(
    `*[_type == "media.tag" && name.current == $name][0]._id`,
    {name: tagName},
  )
  if (existing) return existing

  const doc = await client.create({
    _type: 'media.tag',
    name: {_type: 'slug', current: tagName},
  })
  console.log(`  + Created tag: ${tagName}`)
  return doc._id
}

// ── Main upload loop ────────────────────────────────────────────────────
async function main() {
  console.log(`\nUploading ${assets.length} assets to Sanity...\n`)

  // Pre-create all unique tags
  const allTags = [...new Set(assets.flatMap((a) => a.tags))].sort()
  console.log(`Ensuring ${allTags.length} tags exist...`)
  const tagIdMap = {}
  for (const tag of allTags) {
    tagIdMap[tag] = await ensureTag(tag)
  }
  console.log(`Tags ready.\n`)

  let uploaded = 0
  let failed = 0

  for (const asset of assets) {
    const {file, title, description, tags} = asset
    const filename = path.basename(file)

    if (!fs.existsSync(file)) {
      console.log(`SKIP (not found): ${filename}`)
      failed++
      continue
    }

    try {
      const ext = path.extname(file).toLowerCase()
      const contentType =
        ext === '.svg'
          ? 'image/svg+xml'
          : ext === '.png'
            ? 'image/png'
            : 'image/jpeg'

      const stream = fs.createReadStream(file)
      const uploadedAsset = await client.assets.upload('image', stream, {
        filename,
        contentType,
        title,
        description,
      })

      const tagRefs = tags.map((t) => ({
        _type: 'reference',
        _ref: tagIdMap[t],
        _key: tagIdMap[t].replace(/[^a-zA-Z0-9]/g, '').slice(0, 12),
      }))

      await client.patch(uploadedAsset._id).set({'opt.media.tags': tagRefs}).commit()

      uploaded++
      console.log(`OK (${uploaded}/${assets.length}): ${title}`)
    } catch (err) {
      failed++
      console.log(`FAIL: ${filename} — ${err.message}`)
    }
  }

  console.log(`\nDone. ${uploaded} uploaded, ${failed} failed.`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
