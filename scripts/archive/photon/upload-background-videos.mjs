/**
 * Upload background-loop videos to Sanity as file assets, browsable and
 * filterable in the Media Library (sanity-plugin-media v4, which previews video).
 *
 * Source: four "<shape> on <field>" folders of monochrome motion-graphic loops.
 * Tagging strategy: see brand-identity/asset-tagging-strategy.md → "Video / motion backgrounds".
 * Each clip gets 5 tags across the controlled vocabulary:
 *   - type-video          (always)
 *   - color-{black|white} (the moving shape's color — the subject)
 *   - style-on-{black|white} (the field it sits on)
 *   - use-background, use-hero
 * The motif (Torus, Cube, Tube…) lives in the title/description, not a tag —
 * the Media search bar hits titles, so it stays findable without bloating tags.
 *
 * Usage:
 *   node scripts/upload-background-videos.mjs --dry     # preview, no uploads
 *   SANITY_AUTH_TOKEN="..." node scripts/upload-background-videos.mjs
 * If SANITY_AUTH_TOKEN is unset, falls back to the Sanity CLI token in
 * ~/.config/sanity/config.json.
 */

import {createClient} from '@sanity/client'
import fs from 'fs'
import os from 'os'
import path from 'path'

const DRY = process.argv.includes('--dry')

// ── Auth: env token, else the logged-in Sanity CLI token ───────────────────
function resolveToken() {
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN
  try {
    const cfg = JSON.parse(
      fs.readFileSync(path.join(os.homedir(), '.config/sanity/config.json'), 'utf8'),
    )
    if (cfg.authToken) return cfg.authToken
  } catch {
    /* ignore */
  }
  return undefined
}

const token = resolveToken()
if (!token && !DRY) {
  console.error('No token. Set SANITY_AUTH_TOKEN or run `sanity login`.')
  process.exit(1)
}

const client = createClient({
  projectId: '25ywlhce',
  dataset: 'production',
  apiVersion: '2025-02-27',
  token,
  useCdn: false,
})

// ── Source folders → (shape color, field color) ────────────────────────────
const BASE = '/Users/gabriellamartins/Downloads'
const SCHEMES = [
  {dir: 'Black on black', shape: 'black', field: 'black'},
  {dir: 'Black on white', shape: 'black', field: 'white'},
  {dir: 'White on black', shape: 'white', field: 'black'},
  {dir: 'White on white', shape: 'white', field: 'white'},
]

// ── Motif normalization (fixes source filename typos) ───────────────────────
const MOTIF_MAP = {
  abstract: 'Abstract',
  abstact: 'Abstract',
  'big circle': 'Big circle',
  'bif circle': 'Big circle',
  circle: 'Circle',
  cloth: 'Cloth',
  cube: 'Cube',
  'infinity big': 'Infinity big',
  infinity: 'Infinity',
  metaball: 'Metaball',
  metaballs: 'Metaball',
  spiral: 'Spiral',
  'torus #1': 'Torus #1',
  'torus #2': 'Torus #2',
  'torus #3': 'Torus #3',
  tube: 'Tube',
  wall: 'Wall',
}

const MOTIF_DESC = {
  Abstract: 'Flowing abstract motion-graphic forms.',
  'Big circle': 'A large circular form pulsing and turning.',
  Circle: 'A rotating circular ring.',
  Cloth: 'A rippling cloth / fabric simulation.',
  Cube: 'A slowly rotating cube.',
  'Infinity big': 'A large infinity-loop (figure-eight) ribbon.',
  Infinity: 'An infinity-loop (figure-eight) ribbon.',
  Metaball: 'Merging, blobby metaball spheres.',
  Spiral: 'A turning spiral.',
  Torus: 'A rotating torus (donut) form.',
  Tube: 'A twisting tube / cylinder.',
  Wall: 'A shifting wall of repeated forms.',
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/#/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function motifOf(basename) {
  const key = basename.toLowerCase().replace(/\s+/g, ' ').trim()
  return MOTIF_MAP[key] || cap(key)
}
function descOf(motif) {
  return MOTIF_DESC[motif] || MOTIF_DESC[motif.replace(/ #\d+$/, '')] || 'Monochrome motion-graphic clip.'
}

// ── Build the asset manifest from disk ─────────────────────────────────────
function buildManifest() {
  const assets = []
  for (const {dir, shape, field} of SCHEMES) {
    const abs = path.join(BASE, dir)
    if (!fs.existsSync(abs)) {
      console.warn(`SKIP folder (not found): ${abs}`)
      continue
    }
    for (const file of fs.readdirSync(abs)) {
      if (path.extname(file).toLowerCase() !== '.mp4') continue
      const motif = motifOf(path.basename(file, path.extname(file)))
      const scheme = `${shape} on ${field}`
      assets.push({
        file: path.join(abs, file),
        filename: `bg-${slugify(motif)}-${shape}-on-${field}.mp4`,
        title: `${motif} — background (${scheme})`,
        description: `${descOf(motif)} ${cap(shape)} form on a ${field} field. Use as a hero or section background loop.`,
        tags: ['type-video', `color-${shape}`, `style-on-${field}`, 'use-background', 'use-hero'],
      })
    }
  }
  return assets
}

// ── Tags as media.tag documents (idempotent) ───────────────────────────────
async function ensureTag(tagName) {
  const existing = await client.fetch(`*[_type == "media.tag" && name.current == $name][0]._id`, {
    name: tagName,
  })
  if (existing) return existing
  const doc = await client.create({_type: 'media.tag', name: {_type: 'slug', current: tagName}})
  console.log(`  + Created tag: ${tagName}`)
  return doc._id
}

async function main() {
  const assets = buildManifest()
  console.log(`\n${DRY ? '[DRY RUN] ' : ''}Found ${assets.length} video files across ${SCHEMES.length} folders.\n`)

  if (DRY) {
    for (const a of assets) {
      console.log(`• ${a.title}`)
      console.log(`    ${path.basename(a.file)}  →  ${a.filename}`)
      console.log(`    tags: ${a.tags.join(', ')}`)
    }
    const total = assets.reduce((n, a) => n + fs.statSync(a.file).size, 0)
    console.log(`\nTotal: ${assets.length} files, ${(total / 1e9).toFixed(2)} GB. No uploads performed.`)
    return
  }

  const allTags = [...new Set(assets.flatMap((a) => a.tags))].sort()
  console.log(`Ensuring ${allTags.length} tags exist...`)
  const tagIdMap = {}
  for (const t of allTags) tagIdMap[t] = await ensureTag(t)
  console.log(`Tags ready.\n`)

  let uploaded = 0
  let skipped = 0
  let failed = 0

  for (const asset of assets) {
    const {file, filename, title, description, tags} = asset
    if (!fs.existsSync(file)) {
      console.log(`SKIP (not found): ${filename}`)
      failed++
      continue
    }

    // Idempotent: skip if a file asset with this normalized name already exists.
    const existing = await client.fetch(
      `*[_type == "sanity.fileAsset" && originalFilename == $fn][0]._id`,
      {fn: filename},
    )
    if (existing) {
      skipped++
      console.log(`SKIP (already uploaded): ${title}`)
      continue
    }

    try {
      const uploadedAsset = await client.assets.upload('file', fs.createReadStream(file), {
        filename,
        contentType: 'video/mp4',
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

  console.log(`\nDone. ${uploaded} uploaded, ${skipped} skipped, ${failed} failed.`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
