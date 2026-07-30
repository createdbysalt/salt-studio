/**
 * One-off: upload the three encoded Viva Church gallery videos as Sanity file
 * assets and print their asset IDs so they can be referenced in the project
 * gallery. Encoded copies live in /tmp/viva-encoded (1248x720, ~house spec).
 *
 * Usage:
 *   node scripts/upload-viva-videos.mjs
 * Reads SANITY_API_WRITE_TOKEN from .env.local.
 */
import {readFileSync} from 'node:fs'
import path from 'node:path'
import {createClient} from '@sanity/client'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [
        l.slice(0, i).trim(),
        l
          .slice(i + 1)
          .trim()
          .replace(/^["']|["']$/g, ''),
      ]
    }),
)

const client = createClient({
  projectId: 'jkqf2ng5',
  dataset: 'production',
  apiVersion: '2025-02-27',
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const DIR = '/tmp/viva-encoded'
const FILES =
  process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : ['viva-homepage.mp4', 'viva-kids.mp4', 'viva-church-jesus-2.mp4']

for (const name of FILES) {
  const buf = readFileSync(path.join(DIR, name))
  const asset = await client.assets.upload('file', buf, {filename: `viva-church-${name}`})
  console.log(`${name}\t${asset._id}\t${asset.url}`)
}
