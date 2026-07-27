/**
 * Download Photon Portland studio images from photon.studio/studio-info
 * and upload them to Sanity Media with titles, descriptions, and tags.
 *
 * Tagging strategy: brand-identity/asset-tagging-strategy.md
 * Tags: type-photo · color-multi · use-portland-studio · use-content · style-architecture
 *
 * Usage: SANITY_AUTH_TOKEN="..." node scripts/upload-portland-studio-assets.mjs
 */

import {createClient} from '@sanity/client'
import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '../tmp/portland-studio-downloads')

const client = createClient({
  projectId: '25ywlhce',
  dataset: 'production',
  apiVersion: '2025-02-27',
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
})

const SOURCE_URLS = [
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1504892188861-VT1T2CD9CPWZYW6DFXEU/photon_1.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1504892189403-75T5CPX86QU6JZ4UEYR9/photon_2.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1504892193511-QD3TOB8FQ9LZOA5GZ7BK/photon_3.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1504892194020-QL0M2Z5M8HJJ40ZJK26N/photon_4.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1504892195838-UPBPPT6UHKPH3ARNL3D7/photon_5.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1504892197180-DLHIB8H6BRDM2ER9KJOZ/photon_6.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1504892198158-QN9Y4XB6FZ8MXZAX4638/photon_7.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1504892199082-LIMAWLYZZZO15N4M5DHJ/photon_8.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1504892200189-B9VN5NV8NREBX814P4H8/photon_9.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1504892202276-PI5HY69SUEL4UVLER63X/photon_10.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1504892202619-OQ4YLLA10J3K87UYG1Y0/photon_11.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1508434384017-8LNNKO2XZHIGHBC3H2XS/gear+van.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1508434389713-UAOOHIU5V4QD6GUIKHQT/kitchen.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1508434389886-RENDXS3UTU7DR6B63JZ1/lighting.jpg',
]

const STUDIO_TAGS = [
  'type-photo',
  'color-multi',
  'use-portland-studio',
  'use-content',
  'style-architecture',
]

const NAMED = {
  'gear van.jpg': {
    filename: 'portland-studio-gear-van.jpg',
    title: 'Portland studio — gear van',
    description:
      'Photon Portland studio gear van for location shoots and equipment transport. Use for studio info, rental, and facility pages.',
  },
  'kitchen.jpg': {
    filename: 'portland-studio-kitchen.jpg',
    title: 'Portland studio — kitchen',
    description:
      'Modern kitchen at Photon Portland studio with appliances, cooktop, and oven. Use for studio info and facility amenity sections.',
  },
  'lighting.jpg': {
    filename: 'portland-studio-lighting.jpg',
    title: 'Portland studio — lighting',
    description:
      'Lighting and grip setup at Photon Portland studio. Use for studio info, rental, and production capability sections.',
  },
}

function decodeFilename(url) {
  return decodeURIComponent(url.split('/').pop()).replace(/\+/g, ' ')
}

function assetMeta(sourceUrl) {
  const original = decodeFilename(sourceUrl)
  if (NAMED[original]) {
    return {...NAMED[original], tags: STUDIO_TAGS}
  }

  const numMatch = original.match(/^photon_(\d+)\.jpg$/i)
  if (numMatch) {
    const n = numMatch[1].padStart(2, '0')
    return {
      filename: `portland-studio-${n}.jpg`,
      title: `Portland studio — interior (${n})`,
      description:
        `Architectural interior photograph of Photon's Portland studio at 726 SE 10th Ave (frame ${n}). Full-color facility photography for studio info, rental, and content sections.`,
      tags: STUDIO_TAGS,
    }
  }

  return {
    filename: `portland-studio-${original.replace(/[^a-zA-Z0-9._-]+/g, '-')}`,
    title: `Portland studio — ${original.replace(/\.[^.]+$/, '')}`,
    description:
      'Photograph of Photon’s Portland studio facility. Use for studio info and content sections.',
    tags: STUDIO_TAGS,
  }
}

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

async function download(url, dest) {
  const candidates = [`${url}?format=original`, `${url}?format=2500w`, url]
  let lastErr
  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, {
        headers: {Accept: 'image/*,*/*', 'User-Agent': 'PhotonStudioImporter/1.0'},
      })
      if (!res.ok) {
        lastErr = new Error(`HTTP ${res.status} for ${candidate}`)
        continue
      }
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 1000) {
        lastErr = new Error(`Tiny response (${buf.length}b) for ${candidate}`)
        continue
      }
      fs.writeFileSync(dest, buf)
      return {bytes: buf.length, from: candidate}
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr
}

async function alreadyUploaded(filename, title) {
  return client.fetch(
    `*[_type == "sanity.imageAsset" && (originalFilename == $filename || title == $title)][0]._id`,
    {filename, title},
  )
}

async function main() {
  if (!process.env.SANITY_AUTH_TOKEN) {
    console.error('Missing SANITY_AUTH_TOKEN')
    process.exit(1)
  }

  fs.mkdirSync(OUT_DIR, {recursive: true})

  const metas = SOURCE_URLS.map((url) => ({url, ...assetMeta(url)}))
  console.log(`\nImporting ${metas.length} Portland studio images into Sanity Media...\n`)

  const allTags = [...new Set(metas.flatMap((a) => a.tags))].sort()
  console.log(`Ensuring ${allTags.length} tags exist...`)
  const tagIdMap = {}
  for (const tag of allTags) {
    tagIdMap[tag] = await ensureTag(tag)
  }
  console.log('Tags ready.\n')

  let uploaded = 0
  let skipped = 0
  let failed = 0

  for (const asset of metas) {
    const dest = path.join(OUT_DIR, asset.filename)

    try {
      const existingId = await alreadyUploaded(asset.filename, asset.title)
      if (existingId) {
        const tagRefs = asset.tags.map((t) => ({
          _type: 'reference',
          _ref: tagIdMap[t],
          _key: tagIdMap[t].replace(/[^a-zA-Z0-9]/g, '').slice(0, 12),
        }))
        await client
          .patch(existingId)
          .set({
            title: asset.title,
            description: asset.description,
            'opt.media.tags': tagRefs,
          })
          .commit()
        skipped++
        console.log(`SKIP/retag (${skipped}): ${asset.title}`)
        continue
      }

      if (!fs.existsSync(dest)) {
        const dl = await download(asset.url, dest)
        console.log(`  ↓ ${asset.filename} (${Math.round(dl.bytes / 1024)} KB)`)
      }

      const stream = fs.createReadStream(dest)
      const uploadedAsset = await client.assets.upload('image', stream, {
        filename: asset.filename,
        contentType: 'image/jpeg',
        title: asset.title,
        description: asset.description,
      })

      const tagRefs = asset.tags.map((t) => ({
        _type: 'reference',
        _ref: tagIdMap[t],
        _key: tagIdMap[t].replace(/[^a-zA-Z0-9]/g, '').slice(0, 12),
      }))

      await client.patch(uploadedAsset._id).set({'opt.media.tags': tagRefs}).commit()

      uploaded++
      console.log(`OK (${uploaded}): ${asset.title}`)
    } catch (err) {
      failed++
      console.log(`FAIL: ${asset.filename} — ${err.message}`)
    }
  }

  console.log(`\nDone. ${uploaded} uploaded, ${skipped} already present (retagged), ${failed} failed.`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
