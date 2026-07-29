/**
 * Import the 5 case studies from the CASE STUDIES csv as projectType='case-study'.
 *
 * Reuses existing clients/categories/services/equipment by slug (creates any new
 * ones), sets brief/approach/result/testimonial + videoUrl, and links
 * relatedProjects against the whole dataset. Never duplicates existing projects.
 *
 * DRY RUN by default. COMMIT=1 to write.
 *   npx sanity exec scripts/import-case-studies.mjs --with-user-token
 *   COMMIT=1 npx sanity exec scripts/import-case-studies.mjs --with-user-token
 */
import {readFileSync} from 'node:fs'
import {getCliClient} from 'sanity/cli'

const COMMIT = process.env.COMMIT === '1'
const FILE =
  process.env.FILE ||
  `${process.env.HOME}/Downloads/2026 PHOTON PROJECTS FOR WEB - CASE STUDIES.csv`
const c = getCliClient({apiVersion: '2025-02-27'})

// --- shared helpers (mirror import-projects-from-csv.mjs) ---
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
const clean = (s) => (s ?? '').replace(/\s+/g, ' ').trim()
const slugFld = (name) => ({_type: 'slug', current: slugify(name)})

const CANON = {
  'RED V-RAPTOR': 'Red V-Raptor',
  'FREEFLY EMBER': 'Freefly Ember',
  'PHANTOM FLEX 4K': 'Phantom Flex 4K',
  'MAVO EDGE 8K': 'Mavo Edge 8K',
  'NIKON D850': 'Nikon D850',
  'D850': 'Nikon D850',
  'PHASE ONE IQ1': 'Phase One IQ1',
  'LEICA SUMILUX': 'Leica Summilux',
  'LAOWA': 'Laowa',
  'SIGMA': 'Sigma',
  'PHASE': 'Phase',
  'ANGENIEUX OPTIMO': 'Angenieux Optimo',
  'APUTURE LED': 'Aputure LED',
  'FIRE': 'Fire',
  'NATURAL': 'Natural',
  'ASTERA': 'Astera',
  'MIRROR BOARD': 'Mirror Board',
}
const canonGear = (raw) => CANON[clean(raw).toUpperCase()] || clean(raw)
const CATEGORY = {
  'FOOTWEAR': 'Footwear',
  'FASHION': 'Fashion',
  'ART DEPT': 'Art Dept',
  'TECH': 'Tech',
  'SPORTSWEAR': 'Sportswear',
  'HIGHSPEED': 'High-Speed',
  'HIGH SPEED': 'High-Speed',
  'LIFESTYLE': 'Lifestyle',
  'STUDIO': 'Studio',
  'MUSIC': 'Music',
  'FOOD': 'Food',
}
const canonCategory = (raw) => CATEGORY[clean(raw).toUpperCase()] || clean(raw)
const SERVICE_ALIAS = {
  'direction': 'Directing',
  'concepting': 'Concept',
  'crewing': 'Crew',
  'slow mo': 'Slow Motion',
  'slo mo': 'Slow Motion',
  'motion gfx': 'Motion Graphics',
  'color correction': 'Color',
  'camera op': 'Camera',
  'led video wall': 'LED Wall',
  'sound sweatening': 'Sound',
  'original music': 'Music',
}
const canonService = (raw) => SERVICE_ALIAS[clean(raw).toLowerCase()] || clean(raw)
const splitList = (cell) =>
  clean(cell)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
const splitServices = (cell) =>
  clean(cell)
    .split(/\s*(?:\/\/|\/|\|)\s*/)
    .map((s) => s.replace(/\.+$/, '').trim())
    .filter(Boolean)
const normYear = (raw) => {
  const s = clean(raw)
    .replace(/^\//, '')
    .replace(/\s*-\s*/g, '–')
  return s
    ? s
        .split('–')
        .map((p) => (p.trim().length === 2 ? `20${p.trim()}` : p.trim()))
        .join('–')
    : undefined
}
const overviewBlock = (text) => {
  const t = clean(text)
  const short = t.length > 150 ? `${t.slice(0, 149).replace(/\s+\S*$/, '')}…` : t
  return short
    ? [
        {
          _type: 'block',
          _key: 'ov',
          style: 'normal',
          markDefs: [],
          children: [{_type: 'span', _key: 's', text: short, marks: []}],
        },
      ]
    : undefined
}
function parseCsv(text) {
  const rows = []
  let row = [],
    field = '',
    q = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (q) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else q = false
      } else field += ch
    } else if (ch === '"') q = true
    else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += ch
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

// Explicit per-row overrides (brand detection can't infer renamed/new clients).
const CLIENT_BY_TITLE = {
  'SOUNDERS BRUCE LEE': 'Seattle Sounders',
  'COMBAT COOKIES': 'Combat',
  'BARE REPUBLIC MINERAL SUNSCREEN': 'Bare Republic',
  'SOREL SS23 HIGH GEAR': 'Sorel',
  'NESTE': 'Neste',
}
const VIDEO_BY_TITLE = {
  'SOUNDERS BRUCE LEE': 803158825,
  'COMBAT COOKIES': 1180843562,
  'BARE REPUBLIC MINERAL SUNSCREEN': 707055621,
  'SOREL SS23 HIGH GEAR': 797783572,
  'NESTE': 689797700,
}

// --- parse the case-studies csv ---
const records = parseCsv(readFileSync(FILE, 'utf8'))
const headers = records[0].map(clean)
const col = (r, name) => clean(r[headers.indexOf(name)])
const rows = records.slice(1).filter((r) => clean(r.join('')) && col(r, 'TITLE'))

// --- resolve existing docs ---
async function idMap(type) {
  const rows = await c.fetch(
    `*[_type==$type && defined(slug.current)]{_id, "slug": slug.current}`,
    {type},
  )
  return new Map(rows.map((d) => [d.slug, d._id]))
}
const [catIds, svcIds, camIds, lensIds, lightIds] = await Promise.all(
  ['workCategory', 'service', 'camera', 'lens', 'light'].map(idMap),
)
const clientByName = new Map(
  (await c.fetch(`*[_type=="client"]{_id, name}`)).map((d) => [d.name, d._id]),
)
const allProjects = await c.fetch(`*[_type=="project"]{_id, title, "slug": slug.current}`)

// Registries for NEW vocab we need to create.
const create = {
  workCategory: new Map(),
  service: new Map(),
  camera: new Map(),
  lens: new Map(),
  light: new Map(),
}
const ref = (id) => ({_type: 'reference', _ref: id, _key: id})
// Dedupe ids and key each item by its (unique) _ref — avoids non-unique _key errors.
const refArr = (ids) => [...new Set(ids.filter(Boolean))].map(ref)

function resolveVocab(type, name, existing, extraFields = {}) {
  const slug = slugify(name)
  if (existing.has(slug)) return existing.get(slug)
  const id = `${type}-${slug}`
  if (!create[type].has(slug))
    create[type].set(slug, {_id: id, _type: type, slug: slugFld(name), ...extraFields})
  return id
}

let svcOrder = 900
const built = []
for (const r of rows) {
  const title = col(r, 'TITLE')
  const clientName = CLIENT_BY_TITLE[title.toUpperCase()]
  const clientId = clientName ? clientByName.get(clientName) : undefined

  const cats = splitList(col(r, 'CATEGORY TAGS')).map((x) =>
    resolveVocab('workCategory', canonCategory(x), catIds, {filterLabel: canonCategory(x)}),
  )
  const svcs = splitServices(col(r, 'PHOTON HANDLED')).map((x) =>
    resolveVocab('service', canonService(x), svcIds, {
      name: canonService(x),
      sortOrder: svcOrder++,
    }),
  )
  const cams = splitList(col(r, 'CAMERA')).map((x) =>
    resolveVocab('camera', canonGear(x), camIds, {name: canonGear(x)}),
  )
  const lens = splitList(col(r, 'LENS')).map((x) =>
    resolveVocab('lens', canonGear(x), lensIds, {name: canonGear(x)}),
  )
  const light = splitList(col(r, 'LIGHT')).map((x) =>
    resolveVocab('light', canonGear(x), lightIds, {name: canonGear(x)}),
  )
  const vid = VIDEO_BY_TITLE[title.toUpperCase()]

  built.push({
    title,
    clientName,
    clientMissing: clientName && !clientId,
    doc: {
      _id: `project-${slugify(title)}`,
      _type: 'project',
      projectType: 'case-study',
      featured: false,
      title,
      slug: slugFld(title),
      year: normYear(col(r, 'YEAR')),
      overview: overviewBlock(col(r, 'CONTEXT') || title),
      context: col(r, 'CONTEXT') || undefined,
      btsNote: col(r, 'BTS NOTE') || undefined,
      brief: col(r, 'THE BRIEF') || undefined,
      approach: col(r, 'THE APPROACH') || undefined,
      result: col(r, 'THE RESULT') || undefined,
      ...(col(r, 'TESTIMONIAL') ? {testimonial: {quote: col(r, 'TESTIMONIAL')}} : {}),
      ...(clientId ? {client: {_type: 'reference', _ref: clientId}} : {}),
      ...(vid ? {videoUrl: `https://vimeo.com/${vid}`} : {}),
      categories: refArr(cats),
      services: refArr(svcs),
      cameras: refArr(cams),
      lenses: refArr(lens),
      lighting: refArr(light),
    },
    relatedRaw: splitList(col(r, 'RELATED')),
  })
}

// relatedProjects: match RELATED tokens against ALL projects (existing + these 5).
const titleIndex = allProjects
  .map((p) => ({id: p._id, up: p.title.toUpperCase()}))
  .concat(built.map((b) => ({id: b.doc._id, up: b.title.toUpperCase()})))
const relUnmatched = []
for (const b of built) {
  const rels = []
  for (const tok of b.relatedRaw) {
    const u = tok.toUpperCase()
    const hit =
      titleIndex.find((t) => t.up === u) ||
      titleIndex.find((t) => t.up.startsWith(u)) ||
      titleIndex.find((t) => t.up.includes(u))
    if (hit && hit.id !== b.doc._id) rels.push(hit.id)
    else if (!hit) relUnmatched.push(`${b.title} → ${tok}`)
  }
  b.doc.relatedProjects = refArr(rels)
}

const bar = '─'.repeat(72)
console.log(
  `\n${bar}\nCase studies  ·  ${COMMIT ? 'COMMIT' : 'DRY RUN'}  ·  ${built.length} projects\n${bar}`,
)
for (const b of built) {
  console.log(`  + ${b.title}`)
  console.log(
    `      client=${b.clientName || '—'}${b.clientMissing ? ' ⚠MISSING' : ''}  video=${b.doc.videoUrl || '—'}  related=${b.doc.relatedProjects.length}`,
  )
}
const newVocab = Object.entries(create)
  .filter(([, m]) => m.size)
  .map(([t, m]) => `${t}: ${[...m.values()].map((v) => v.name || v.filterLabel).join(', ')}`)
console.log(`\nNew vocab created: ${newVocab.length ? newVocab.join(' | ') : 'none'}`)
if (relUnmatched.length)
  console.log(`Unmatched RELATED (${relUnmatched.length}): ${relUnmatched.join(' | ')}`)
console.log(bar)

if (!COMMIT) {
  console.log('DRY RUN — nothing written. Re-run with COMMIT=1.\n')
  process.exit(0)
}

const tx = c.transaction()
for (const m of Object.values(create)) for (const doc of m.values()) tx.createIfNotExists(doc)
for (const b of built) tx.createOrReplace(b.doc)
await tx.commit()
console.log(`\n✓ Imported ${built.length} case studies.\n`)
