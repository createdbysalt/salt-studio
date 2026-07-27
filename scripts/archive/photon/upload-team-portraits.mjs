/**
 * Upload the 2026 crew portraits to Sanity, tag them as team photos via
 * sanity-plugin-media, and link each one to the matching teamMember.portrait.
 *
 * Tagging: type-photo, color-multi, use-team, style-portrait
 * (see brand-identity/asset-tagging-strategy.md — `use-team` added 2026-07).
 *
 * Auth: needs a write-capable token. Add one to .env.local as
 *   SANITY_API_WRITE_TOKEN=...   (preferred, gitignored)
 * or pass SANITY_AUTH_TOKEN=... inline. This script loads .env.local itself.
 *
 * Idempotent: skips any member who already has a portrait (pass FORCE=1 to override).
 *
 * Usage: node scripts/upload-team-portraits.mjs
 */

import {createClient} from '@sanity/client'
import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Minimal .env.local loader (no dependency on dotenv / Next runtime).
function loadEnvLocal() {
  const envPath = path.join(ROOT, '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    const key = m[1]
    let val = m[2].replace(/^["']|["']$/g, '')
    if (!(key in process.env)) process.env[key] = val
  }
}
loadEnvLocal()

const token =
  process.env.SANITY_AUTH_TOKEN ||
  process.env.SANITY_API_WRITE_TOKEN ||
  process.env.SANITY_API_READ_TOKEN

if (!token) {
  console.error(
    'No token found. Add SANITY_API_WRITE_TOKEN to .env.local (Editor-level) and re-run.',
  )
  process.exit(1)
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'jkqf2ng5',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-02-27',
  token,
  useCdn: false,
})

const DOWNLOADS = '/Users/gabriellamartins/Downloads'
const TEAM_TAGS = ['type-photo', 'color-multi', 'use-team', 'style-portrait']

// file basename → teamMember document id + display name
const PORTRAITS = [
  {file: 'photon_crew26_austin.jpg', id: 'teamMember-austin-baker', name: 'Austin Baker'},
  {file: 'photon_crew26_chris.jpg', id: 'teamMember-chris-crary', name: 'Chris Crary'},
  {file: 'photon_crew26_em.jpg', id: 'teamMember-em-gillies', name: 'Em Gillies'},
  {file: 'photon_crew26_garrett.jpg', id: 'teamMember-garrett-baker', name: 'Garrett Baker'},
  {file: 'photon_crew26_liam.jpg', id: 'teamMember-liam-gillies', name: 'Liam Gillies'},
  {file: 'photon_crew26_russ.jpg', id: 'teamMember-russel-bowen', name: 'Russel Bowen'},
  {file: 'photon_crew26_toni.jpg', id: 'teamMember-toni-crary', name: 'Toni Crary'},
]

async function ensureTag(tagName) {
  const existing = await client.fetch(
    `*[_type == "media.tag" && name.current == $name][0]._id`,
    {name: tagName},
  )
  if (existing) return existing
  const doc = await client.create({_type: 'media.tag', name: {_type: 'slug', current: tagName}})
  console.log(`  + created tag: ${tagName}`)
  return doc._id
}

async function main() {
  const force = process.env.FORCE === '1'

  console.log('Ensuring team-photo tags exist...')
  const tagIdMap = {}
  for (const tag of TEAM_TAGS) tagIdMap[tag] = await ensureTag(tag)

  let uploaded = 0
  let skipped = 0
  let failed = 0

  for (const {file, id, name} of PORTRAITS) {
    const fullPath = path.join(DOWNLOADS, file)
    try {
      if (!fs.existsSync(fullPath)) {
        console.log(`SKIP (file not found): ${file}`)
        failed++
        continue
      }

      const member = await client.fetch(
        `*[_id == $id][0]{_id, "hasPortrait": defined(portrait.asset)}`,
        {id},
      )
      if (!member?._id) {
        console.log(`SKIP (no teamMember ${id}): ${name}`)
        failed++
        continue
      }
      if (member.hasPortrait && !force) {
        console.log(`SKIP (already has portrait, FORCE=1 to override): ${name}`)
        skipped++
        continue
      }

      const asset = await client.assets.upload('image', fs.createReadStream(fullPath), {
        filename: file,
        contentType: 'image/jpeg',
        title: `${name} — crew portrait`,
        description: `Studio portrait of ${name}, Photon crew. Low-key color headshot for the /studio crew grid.`,
      })

      const tagRefs = TEAM_TAGS.map((t) => ({
        _type: 'reference',
        _ref: tagIdMap[t],
        _key: tagIdMap[t].replace(/[^a-zA-Z0-9]/g, '').slice(0, 12),
      }))
      await client.patch(asset._id).set({'opt.media.tags': tagRefs}).commit()

      await client
        .patch(id)
        .set({
          portrait: {
            _type: 'image',
            asset: {_type: 'reference', _ref: asset._id},
            alt: `Portrait of ${name}, Photon crew`,
          },
        })
        .commit()

      uploaded++
      console.log(`OK: ${name} → ${asset._id}`)
    } catch (err) {
      failed++
      console.log(`FAIL: ${name} — ${err.message}`)
    }
  }

  console.log(`\nDone. ${uploaded} uploaded, ${skipped} skipped, ${failed} failed.`)
}

main().catch((err) => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
