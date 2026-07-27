/**
 * Download Photon archives images from photon.studio/archives and upload
 * them to Sanity Media with titles, descriptions, and tags.
 *
 * Tagging strategy: brand-identity/asset-tagging-strategy.md
 * Tags: type-photo · color-multi|color-white · use-archives · use-content · style-candid|style-landscape
 *
 * Usage: SANITY_AUTH_TOKEN="..." node scripts/upload-archives-assets.mjs
 */

import {createClient} from '@sanity/client'
import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '../tmp/archives-downloads')

const client = createClient({
  projectId: '25ywlhce',
  dataset: 'production',
  apiVersion: '2025-02-27',
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
})

const SOURCE_URLS = [
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701259294483-0JBVB4RXV4I76C0VQTDT/BTS%2B2023%2Btitle%2Bwhite.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701259909825-WTCG8ALIZMCFDWPL97LF/000070130036.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276018411-HWGB4IRHMEUUW6TFXASF/1.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276018202-RXMWEKLDF6ZEMSH11TGS/2.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276019284-6N8ERQZMOAF4KY9ZGCZF/3.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276019534-EKGV8TJVO10N0WO0OWAX/4.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276020754-3SBSGZ5EDIP9WMJ5VZQ0/5.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276020845-U3C28TCPFUY733P52ULK/6.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276022103-V0D412KRM5JVGV3R4H0Y/7.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276022182-H2K7PQXVGPNPIW7DOHHX/8.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276023159-ERSR1JNQ8KG48YYCHCPP/9.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276023583-QI1FRAFW0FKN32KWD2KY/10.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276024368-W8QRGUK1916CA6QEO1JH/11.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276024798-QHHD89RN3ZG8UTL63CXW/12.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276025442-QPYBN9YD5FFFEHLD3Y4P/13.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276025908-48OMRQXRSCVU1OOST13E/14.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276026536-DAP8Y9QZX0PWZ9TFPR95/15.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276027113-DHITZ4LAGQSW6ZHMFLQC/16.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276027949-KMOCVFRKN8CAHHIJMOLW/17.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276028414-MDM6RAOXAE5VVK64X75L/18.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276029576-V0X2O91DGGZJV9ZPSE0F/19.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276029835-1QB9D9GD27H2WUAYLU8K/20.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276030792-KVC18YB78JQ9C4FH1RXB/21.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276031082-2GXPEL4XS8V3PRTS1F2W/22.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276031946-X2UJP42GUHVS0H3VOP6X/23.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276033150-P6Q9B7ZM6PIIP92YHT9A/25.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276033467-0O644KZ06HKEW8R1JSN8/26.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276034348-I8VB07AFOEAWG4Z6JJHL/27.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276034689-4G9FIO9UZFU452CRNOPZ/28.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276035394-1689AKXAHRBAD7ZFXOYW/29.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276035942-CQPWVU9IBJKBXDISY2YX/30.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276036608-2QEG51NZT8V0UXWKNS0Q/31.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276037150-6Y8UCZBI22ONL39RVQSJ/32.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276038060-XEZ8NCHWLL8GGHNNJJHQ/33.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276040297-F35Y80233W3GHBR8CB7Z/35.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701277157503-5CGUZGONVTGHOJ5P9XV3/36.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276041611-R8KJAJHMGU8XRHQWIQHG/37.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276041704-WMMW74PERW1QDCAWGV41/38.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276042582-Z409UIM39Z7GBS5ZZZSC/39.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276042905-6NK4IM88QKVZW5LMUHDO/40.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276044078-44FE1LQA5ZUPVPFP66TT/41.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276044154-TF8OAQ80F8XILLF8KF51/42.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276045474-OG6VR384HNAYV21R02TO/43.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276045909-863X8UM965WJOOS920FD/44.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276046680-3JRRPP0R692GTL9THTXY/45.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276047056-FMZ8X4D9R8AZC678NH8T/46.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276047836-SH1EETGY3UFHDUZ7R63P/47.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276048044-PCDE8DQIKG7WRG6LYMZN/48.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276049085-GKWZPDADRBMWVXQ00BYI/49.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276049307-GDDUU0HY2LQMH1J8SJ6Y/50.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276050451-VHTOXLL3G0226XO6WU6F/51.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276050469-6OAKOHFYVYOS40IF5AXQ/52.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276051844-JE7FV2DCCGTY2C5T84XG/53.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276052052-71J1ALYCISKOVE17J2HZ/54.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d32a38e4fcb51bf3a5bdf8/1701276053084-ACSG0GGJMYOJQC10SFBK/55.jpg',
]

const PHOTO_TAGS = ['type-photo', 'color-multi', 'use-archives', 'use-content', 'style-candid']
const TITLE_TAGS = ['type-photo', 'color-white', 'use-archives', 'use-content', 'style-landscape']

function decodeFilename(url) {
  const raw = decodeURIComponent(url.split('/').pop())
  return raw.replace(/\+/g, ' ')
}

function safeFilename(name) {
  return name
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function assetMeta(sourceUrl) {
  const original = decodeFilename(sourceUrl)
  const filename = safeFilename(original)

  if (original.toLowerCase().includes('bts') && original.toLowerCase().includes('title')) {
    return {
      filename,
      title: 'Archives — BTS 2023 title',
      description:
        'White title graphic from the Photon archives BTS 2023 gallery. Use for archives page headers and behind-the-scenes section markers.',
      tags: TITLE_TAGS,
    }
  }

  const numMatch = original.match(/^(\d+)\.jpg$/i)
  if (numMatch) {
    const n = numMatch[1].padStart(2, '0')
    return {
      filename: `archives-bts-2023-${n}.jpg`,
      title: `Archives — BTS 2023 (${n})`,
      description:
        `Behind-the-scenes production still from Photon's 2023 archives gallery (frame ${n}). Full-color candid photography for archives, case studies, and content sections.`,
      tags: PHOTO_TAGS,
    }
  }

  return {
    filename: `archives-${filename}`,
    title: `Archives — ${original.replace(/\.[^.]+$/, '')}`,
    description:
      'Behind-the-scenes archive photograph from photon.studio/archives. Use for archives gallery and content sections.',
    tags: PHOTO_TAGS,
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
  // Prefer original / largest available from Squarespace CDN
  const candidates = [`${url}?format=original`, `${url}?format=2500w`, url]
  let lastErr
  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, {
        headers: {Accept: 'image/*,*/*', 'User-Agent': 'PhotonArchivesImporter/1.0'},
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
  console.log(`\nImporting ${metas.length} archives images into Sanity Media...\n`)

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
        // Re-apply tags/title/description if asset already exists
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
  console.log(`Local copies: ${OUT_DIR}`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
