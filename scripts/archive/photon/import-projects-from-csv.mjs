/**
 * Import Photon standard projects from the CSV into the relational content model:
 * clients, cameras, lenses, lights, services, workCategories, and projects
 * (with references + best-effort relatedProjects links).
 *
 * DRY RUN by default — prints a full summary and writes nothing.
 * Add --commit to write to the dataset.
 *
 * Usage:
 *   node --env-file=.env.local scripts/import-projects-from-csv.mjs \
 *     --file="/Users/…/2026 PHOTON PROJECTS FOR WEB - STANDARD PROJECTS (1).csv"
 *   # review the summary, then:
 *   node --env-file=.env.local scripts/import-projects-from-csv.mjs --file="…" --commit
 *
 * Idempotent: reuses existing docs by slug/name (deterministic IDs), so re-running
 * updates in place instead of creating duplicates — even against Studio-made docs.
 */

import {createClient} from '@sanity/client'
import {readFileSync} from 'node:fs'

// ---------------------------------------------------------------------------
// Args / env
// ---------------------------------------------------------------------------
const args = process.argv.slice(2)
const COMMIT = args.includes('--commit') || process.env.COMMIT === '1'
const fileArg = args.find((a) => a.startsWith('--file='))?.slice('--file='.length)
const DEFAULT_FILE =
  `${process.env.HOME}/Downloads/2026 PHOTON PROJECTS FOR WEB - STANDARD PROJECTS (1).csv`
const FILE = fileArg || DEFAULT_FILE

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN

if (!projectId) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
  process.exit(1)
}
if (COMMIT && !token) {
  console.error('Missing SANITY_API_WRITE_TOKEN or SANITY_AUTH_TOKEN (required for --commit)')
  process.exit(1)
}

const client = createClient({projectId, dataset, apiVersion: '2025-02-27', token, useCdn: false})

// ---------------------------------------------------------------------------
// Minimal RFC-4180 CSV parser (handles quotes, embedded commas + newlines)
// ---------------------------------------------------------------------------
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += c
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += c
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const clean = (s) => (s ?? '').replace(/\s+/g, ' ').trim()

// Curated display names for the gear vocabulary. Anything not listed falls back
// to its cleaned CSV string, so nothing is silently dropped — just logged.
const CANON = {
  // cameras
  'RED V-RAPTOR': 'Red V-Raptor',
  'FUJI GFX 100 II': 'Fuji GFX 100 II',
  'FUJI GFX 100': 'Fuji GFX 100',
  'MAVO LF': 'Mavo LF',
  'MAVO EDGE 8K': 'Mavo Edge 8K',
  'MAVO EDGE': 'Mavo Edge',
  'NIKON D850': 'Nikon D850',
  'NIKON D810': 'Nikon D810',
  'NIKON D800': 'Nikon D800',
  'DJI MAVIC 3 CINE': 'DJI Mavic 3 Cine',
  'DJI INSPIRE': 'DJI Inspire',
  'DJI IINSPIRE': 'DJI Inspire',
  'PHASE ONE IQ1': 'Phase One IQ1',
  'FREEFLY EMBER': 'Freefly Ember',
  'BLACKMAGIC 6K': 'Blackmagic 6K',
  'PHANTOM VEO 4K': 'Phantom VEO 4K',
  'PHANTOM FLEX 4K': 'Phantom Flex 4K',
  'PHANTOM FLEX': 'Phantom Flex',
  FX3: 'Sony FX3',
  CANON: 'Canon',
  // lenses
  'SIMERA-C': 'Simera-C',
  LAOWA: 'Laowa',
  'LAOWA ARGUS': 'Laowa Argus',
  FUJI: 'Fuji',
  'LEICA SUMILUX': 'Leica Summilux',
  'ZEISS OTUS': 'Zeiss Otus',
  'ZEISS SS': 'Zeiss SS',
  SIGMA: 'Sigma',
  'SIGMA ART': 'Sigma Art',
  PHASE: 'Phase',
  'PHASE SCHNEIDER': 'Phase Schneider',
  NIKON: 'Nikon',
  'CANON CINE SERVO': 'Canon Cine Servo',
  DJI: 'DJI',
  // lights
  'APUTURE LED': 'Aputure LED',
  APUTURE: 'Aputure',
  'APUTURE XT26 / 1200X': 'Aputure XT26 / 1200X',
  ARRI: 'Arri',
  'ARRI SKYPANEL': 'Arri Skypanel',
  ASTERA: 'Astera',
  'ASTERA AX1': 'Astera AX1',
  'M18 HMI': 'M18 HMI',
  '18K HMI': '18K HMI',
  NATURAL: 'Natural',
  'FLASHPOINT STROBES': 'Flashpoint Strobes',
  'FLASHPOINT STROBE': 'Flashpoint Strobes',
  LED: 'LED',
  'SUFA LED': 'Sufa LED',
  'ULANZI LED': 'Ulanzi LED',
  FIRE: 'Fire',
  FLASH: 'Flash',
  STROBE: 'Strobe',
}

const canonGear = (raw) => {
  const key = clean(raw).toUpperCase()
  return CANON[key] || clean(raw)
}

// Split a gear/category cell on commas (equipment cells are comma-separated).
const splitList = (cell) =>
  clean(cell)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

// Split the PHOTON HANDLED cell on / // | separators.
const splitServices = (cell) =>
  clean(cell)
    .split(/\s*(?:\/\/|\/|\|)\s*/)
    .map((s) => s.replace(/\.+$/, '').trim())
    .filter(Boolean)

// Conservative service merges — spelling/tense/abbreviation variants only.
const SERVICE_ALIAS = {
  direction: 'Directing',
  concepting: 'Concept',
  crewing: 'Crew',
  'slow mo': 'Slow Motion',
  'slo mo': 'Slow Motion',
  'motion gfx': 'Motion Graphics',
  'color correction': 'Color',
  'camera op': 'Camera',
  'led video wall': 'LED Wall',
  'sound sweatening': 'Sound',
  'original music': 'Music',
}
const canonService = (raw) => {
  const c = clean(raw)
  return SERVICE_ALIAS[c.toLowerCase()] || c
}

// Category vocabulary → workCategory filter labels + slugs.
const CATEGORY = {
  FOOTWEAR: 'Footwear',
  FASHION: 'Fashion',
  'ART DEPT': 'Art Dept',
  TECH: 'Tech',
  SPORTSWEAR: 'Sportswear',
  HIGHSPEED: 'High-Speed',
  'HIGH SPEED': 'High-Speed',
  LIFESTYLE: 'Lifestyle',
  STUDIO: 'Studio',
  MUSIC: 'Music',
  FOOD: 'Food',
}
const canonCategory = (raw) => CATEGORY[clean(raw).toUpperCase()] || clean(raw)

// Brand detection from the project title (most specific prefix first).
const BRANDS = [
  ['UA/JBL', 'UA/JBL'],
  ['PORTLAND TIMBERS', 'Portland Timbers'],
  ['PORTLAND THORNS', 'Portland Thorns'],
  ['GREEN VALLEY CREAMERY', 'Green Valley Creamery'],
  ['GREEN VALLEY', 'Green Valley Creamery'],
  ['STUDIO TK', 'Studio TK'],
  ['MITCHELL & NESS', 'Mitchell & Ness'],
  ['WILEY X', 'Wiley X'],
  ['HYDRO FLASK', 'Hydro Flask'],
  ['TAYLOR FARMS', 'Taylor Farms'],
  ['SHOES FOR CREWS', 'Shoes For Crews'],
  ['PLASTIC SUNSHINE', 'Plastic Sunshine'],
  ['RIDE ICON', 'Ride Icon'],
  ['CRARY BOOTS', 'Crary Boots'],
  ['FORWARD ALWAYS', 'Forward Always'],
  ['CHILIFA NEM', 'Chilifa Nem'],
  ['SOREL', 'Sorel'],
  ['FLEXFIT', 'Flexfit'],
  ['COMBAT', 'Combat'],
  ['RAWLINGS', 'Rawlings'],
  ['GOOGLE', 'Google'],
  ['AMAZFIT', 'Amazfit'],
  ['BMW', 'BMW'],
  ['DRIVEWAY', 'Driveway'],
  ['LINGO', 'Lingo'],
  ['NIKE', 'Nike'],
  ['JORDAN', 'Jordan'],
  ['VANS', 'Vans'],
  ['ADIDAS', 'Adidas'],
  ['SOUNDERS', 'Sounders'],
  ['GQ', 'GQ'],
  ['AVOLI', 'Avoli'],
  ['WILDFANG', 'Wildfang'],
  ['GRABR', 'Grabr'],
  ['MASSIF', 'Massif'],
  ['OURA', 'Oura'],
  ['OARA', 'Oura'],
  ['COMPHY', 'Comphy'],
  ['COOP', 'Coop'],
  ['PEETS', 'Peets'],
  ['HOLDFAST', 'Holdfast'],
  ['MEYENBERG', 'Meyenberg'],
  ['CODIGO', 'Codigo'],
  ['HYPERICE', 'Hyperice'],
]
function detectBrand(title) {
  const t = clean(title).toUpperCase()
  for (const [key, name] of BRANDS) {
    if (t === key || t.startsWith(key + ' ')) return name
  }
  return null
}

function normYear(raw) {
  const s = clean(raw).replace(/^\//, '').replace(/\s*-\s*/g, '–')
  if (!s) return undefined
  return s
    .split('–')
    .map((p) => (p.trim().length === 2 ? `20${p.trim()}` : p.trim()))
    .join('–')
}

// Portable-text single block (for the required `overview` director-statement).
function overviewBlock(text) {
  const t = clean(text)
  const short = t.length > 150 ? `${t.slice(0, 149).replace(/\s+\S*$/, '')}…` : t
  if (!short) return undefined
  return [
    {
      _type: 'block',
      _key: 'overview',
      style: 'normal',
      markDefs: [],
      children: [{_type: 'span', _key: 'ov0', text: short, marks: []}],
    },
  ]
}

const ref = (id) => ({_type: 'reference', _ref: id, _key: id})
// Dedupe ids and key each item by its (unique) _ref — avoids non-unique _key errors.
const refArr = (ids) => [...new Set(ids.filter(Boolean))].map(ref)

// ---------------------------------------------------------------------------
// Parse CSV → project rows
// ---------------------------------------------------------------------------
const raw = readFileSync(FILE, 'utf8')
const records = parseCsv(raw)
const headerIdx = records.findIndex((r) => r.map(clean).includes('TITLE'))
if (headerIdx === -1) {
  console.error('Could not find a header row containing "TITLE" in', FILE)
  process.exit(1)
}
const headers = records[headerIdx].map(clean)
const col = (r, name) => clean(r[headers.indexOf(name)])

const rows = records
  .slice(headerIdx + 1)
  .filter((r) => clean(r.join('')) !== '')
  .map((r) => ({
    year: col(r, 'YEAR'),
    title: col(r, 'TITLE'),
    context: col(r, 'CONTEXT'),
    handled: col(r, 'PHOTON HANDLED'),
    bts: col(r, 'BTS NOTE'),
    categories: col(r, 'CATEGORY TAGS'),
    camera: col(r, 'CAMERA'),
    lens: col(r, 'LENS'),
    light: col(r, 'LIGHT'),
    related: col(r, 'RELATED'),
  }))
  // Skip placeholder rows with a title but no real data (IT BOYS, TUMBLE DOWN, MXPX)
  .filter((r) => r.title && (r.context || r.categories || r.handled))

// ---------------------------------------------------------------------------
// Build vocab registries (dedup by canonical slug)
// ---------------------------------------------------------------------------
function registry() {
  const byKey = new Map()
  return {
    ensure(name, extra = {}) {
      const key = slugify(name)
      if (!key) return null
      if (!byKey.has(key)) byKey.set(key, {name, slug: key, ...extra})
      return byKey.get(key)
    },
    all: () => [...byKey.values()],
  }
}

const clients = registry()
const cameras = registry()
const lenses = registry()
const lights = registry()
const services = registry()
const categories = registry()

let serviceOrder = 0
const projects = []
const brandWarnings = []

for (const r of rows) {
  const brand = detectBrand(r.title)
  if (brand) clients.ensure(brand)
  else brandWarnings.push(r.title)

  r.categories && splitList(r.categories).forEach((c) => categories.ensure(canonCategory(c)))
  r.camera && splitList(r.camera).forEach((c) => cameras.ensure(canonGear(c)))
  r.lens && splitList(r.lens).forEach((c) => lenses.ensure(canonGear(c)))
  r.light && splitList(r.light).forEach((c) => lights.ensure(canonGear(c)))
  splitServices(r.handled).forEach((s) => {
    const svc = services.ensure(canonService(s))
    if (svc && svc.sortOrder === undefined) svc.sortOrder = serviceOrder++
  })

  projects.push({
    slug: slugify(r.title),
    title: r.title,
    year: normYear(r.year),
    context: r.context || undefined,
    btsNote: r.bts || undefined,
    overview: overviewBlock(r.context || r.title),
    brand,
    categories: r.categories ? splitList(r.categories).map((c) => slugify(canonCategory(c))) : [],
    services: splitServices(r.handled).map((s) => slugify(canonService(s))),
    cameras: r.camera ? splitList(r.camera).map((c) => slugify(canonGear(c))) : [],
    lenses: r.lens ? splitList(r.lens).map((c) => slugify(canonGear(c))) : [],
    lights: r.light ? splitList(r.light).map((c) => slugify(canonGear(c))) : [],
    relatedRaw: r.related ? splitList(r.related) : [],
  })
}

// Resolve relatedProjects: match each RELATED token to a project by exact →
// startsWith → includes on the title. Unmatched tokens are logged, not invented.
const titleIndex = projects.map((p) => ({slug: p.slug, up: p.title.toUpperCase()}))
const relatedUnmatched = []
for (const p of projects) {
  p.related = []
  for (const tok of p.relatedRaw) {
    const u = tok.toUpperCase()
    const hit =
      titleIndex.find((t) => t.up === u) ||
      titleIndex.find((t) => t.up.startsWith(u)) ||
      titleIndex.find((t) => t.up.includes(u))
    if (hit && hit.slug !== p.slug) p.related.push(hit.slug)
    else if (!hit) relatedUnmatched.push(`${p.title}  →  ${tok}`)
  }
  p.related = [...new Set(p.related)]
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
const line = (n) => '─'.repeat(n)
console.log(`\n${line(64)}`)
console.log(`Photon CSV import  ·  ${projectId}/${dataset}  ·  ${COMMIT ? 'COMMIT' : 'DRY RUN'}`)
console.log(`File: ${FILE}`)
console.log(line(64))
console.log(`Projects:        ${projects.length}`)
console.log(`Clients:         ${clients.all().length}`)
console.log(`Work Categories: ${categories.all().length}  ${categories.all().map((c) => c.name).join(', ')}`)
console.log(`Services:        ${services.all().length}`)
console.log(`Cameras:         ${cameras.all().length}`)
console.log(`Lenses:          ${lenses.all().length}`)
console.log(`Lights:          ${lights.all().length}`)
console.log(line(64))
console.log(`Services vocab:  ${services.all().map((s) => s.name).join(', ')}`)
console.log(`\nCameras:  ${cameras.all().map((c) => c.name).join(', ')}`)
console.log(`Lenses:   ${lenses.all().map((c) => c.name).join(', ')}`)
console.log(`Lights:   ${lights.all().map((c) => c.name).join(', ')}`)
console.log(`\nClients:  ${clients.all().map((c) => c.name).join(', ')}`)
if (brandWarnings.length) {
  console.log(`\n⚠ No brand detected (client left blank) for: ${brandWarnings.join(' | ')}`)
}
if (relatedUnmatched.length) {
  console.log(`\n⚠ RELATED tokens with no matching project (${relatedUnmatched.length}):`)
  relatedUnmatched.forEach((w) => console.log(`   ${w}`))
}
console.log(line(64))

if (!COMMIT) {
  console.log('DRY RUN — nothing written. Re-run with --commit to write to Sanity.\n')
  process.exit(0)
}

// ---------------------------------------------------------------------------
// Commit: reuse existing docs by slug, then createOrReplace everything
// ---------------------------------------------------------------------------
async function idMapFor(type, entries) {
  // Prefer an existing doc with a matching slug; else deterministic id.
  const existing = await client.fetch(`*[_type == $type && defined(slug.current)]{_id, "slug": slug.current}`, {type})
  const bySlug = new Map(existing.map((d) => [d.slug, d._id]))
  const map = new Map()
  for (const e of entries) map.set(e.slug, bySlug.get(e.slug) || `${type}-${e.slug}`)
  return map
}

async function run() {
  console.log('Resolving existing docs…')
  const clientIds = await idMapFor('client', clients.all())
  const cameraIds = await idMapFor('camera', cameras.all())
  const lensIds = await idMapFor('lens', lenses.all())
  const lightIds = await idMapFor('light', lights.all())
  const serviceIds = await idMapFor('service', services.all())
  const categoryIds = await idMapFor('workCategory', categories.all())
  const projectIds = await idMapFor('project', projects.map((p) => ({slug: p.slug})))

  const tx = client.transaction()

  const slugField = (slug) => ({_type: 'slug', current: slug})

  for (const c of clients.all())
    tx.createOrReplace({
      _id: clientIds.get(c.slug),
      _type: 'client',
      name: c.name,
      slug: slugField(c.slug),
      featured: false,
      sortOrder: 0,
    })
  for (const c of cameras.all())
    tx.createOrReplace({_id: cameraIds.get(c.slug), _type: 'camera', name: c.name, slug: slugField(c.slug)})
  for (const c of lenses.all())
    tx.createOrReplace({_id: lensIds.get(c.slug), _type: 'lens', name: c.name, slug: slugField(c.slug)})
  for (const c of lights.all())
    tx.createOrReplace({_id: lightIds.get(c.slug), _type: 'light', name: c.name, slug: slugField(c.slug)})
  for (const s of services.all())
    tx.createOrReplace({
      _id: serviceIds.get(s.slug),
      _type: 'service',
      name: s.name,
      slug: slugField(s.slug),
      sortOrder: s.sortOrder ?? 0,
    })
  for (const c of categories.all())
    tx.createOrReplace({
      _id: categoryIds.get(c.slug),
      _type: 'workCategory',
      filterLabel: c.name,
      slug: slugField(c.slug),
    })

  for (const p of projects) {
    const doc = {
      _id: projectIds.get(p.slug),
      _type: 'project',
      projectType: 'standard',
      title: p.title,
      slug: slugField(p.slug),
      overview: p.overview,
      context: p.context,
      btsNote: p.btsNote,
      year: p.year,
      categories: refArr(p.categories.map((s) => categoryIds.get(s))),
      services: refArr(p.services.map((s) => serviceIds.get(s))),
      cameras: refArr(p.cameras.map((s) => cameraIds.get(s))),
      lenses: refArr(p.lenses.map((s) => lensIds.get(s))),
      lighting: refArr(p.lights.map((s) => lightIds.get(s))),
    }
    if (p.brand) doc.client = {_type: 'reference', _ref: clientIds.get(slugify(p.brand))}
    tx.createOrReplace(doc)
  }

  console.log('Committing vocab + projects…')
  await tx.commit()

  // Second pass: relatedProjects (needs all project ids to exist first).
  console.log('Linking relatedProjects…')
  const relTx = client.transaction()
  for (const p of projects) {
    if (!p.related.length) continue
    relTx.patch(projectIds.get(p.slug), (patch) =>
      patch.set({
        relatedProjects: refArr(p.related.map((s) => projectIds.get(s))),
      }),
    )
  }
  await relTx.commit()

  console.log(`\n✓ Done. ${projects.length} projects imported to ${projectId}/${dataset}.\n`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
