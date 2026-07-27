/**
 * Import the TILE LABELS csv (8 department columns) into Sanity documents:
 *   PRE-PRODUCTION / PRODUCTION / POST → service docs (tagged by department)
 *   CAMERA → camera · LENS → lens · LIGHTING → light · RIGGING → rigging · ART DEPARTMENT → artDepartment
 *
 * Reuses existing docs by slug (and sets department on matching existing services);
 * creates the rest. DRY RUN by default; COMMIT=1 to write.
 *   npx sanity exec scripts/import-tile-labels.mjs --with-user-token
 *   COMMIT=1 npx sanity exec scripts/import-tile-labels.mjs --with-user-token
 */
import {getCliClient} from 'sanity/cli'
import {readFileSync} from 'node:fs'

const COMMIT = process.env.COMMIT === '1'
const FILE =
  process.env.FILE || `${process.env.HOME}/Downloads/2026 PHOTON PROJECTS FOR WEB - TILE LABELS.csv`
const c = getCliClient({apiVersion: '2025-02-27'})

const slugify = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-')
const slugFld = (name) => ({_type: 'slug', current: slugify(name)})

// Nice display case with acronym + connector handling.
const ACRONYMS = new Set(['LED', 'HMI', 'RGB', 'DMX', 'VO', 'DIT', 'MUAH', 'AC', 'SFX', 'VFX', '3D'])
const CONNECTORS = new Set(['AND', 'OF', 'THE'])
const titleCase = (label) =>
  label
    .trim()
    .split(/\s+/)
    .map((w, i) => {
      const u = w.toUpperCase()
      if (ACRONYMS.has(u)) return u
      if (i > 0 && CONNECTORS.has(u)) return w.toLowerCase()
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    })
    .join(' ')

function parseCsv(text) {
  const rows = []
  let row = [], field = '', q = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else q = false } else field += ch
    } else if (ch === '"') q = true
    else if (ch === ',') { row.push(field); field = '' }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = '' }
    else field += ch
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows
}

const COLS = {
  'PRE-PRODUCTION': {type: 'service', department: 'pre-production'},
  PRODUCTION: {type: 'service', department: 'production'},
  POST: {type: 'service', department: 'post'},
  CAMERA: {type: 'camera'},
  LENS: {type: 'lens'},
  LIGHTING: {type: 'light'},
  RIGGING: {type: 'rigging'},
  'ART DEPARTMENT': {type: 'artDepartment'},
}

const records = parseCsv(readFileSync(FILE, 'utf8'))
const headers = records[0].map((h) => h.trim())

// Collect labels per column.
const labels = [] // {name, type, department}
for (let colIdx = 0; colIdx < headers.length; colIdx++) {
  const spec = COLS[headers[colIdx].toUpperCase()]
  if (!spec) continue
  for (let r = 1; r < records.length; r++) {
    const raw = (records[r][colIdx] || '').trim()
    if (!raw) continue
    labels.push({name: titleCase(raw), type: spec.type, department: spec.department})
  }
}

// Existing docs by slug, per type.
async function slugIds(type) {
  const rows = await c.fetch(`*[_type==$type && defined(slug.current)]{_id, "slug": slug.current}`, {type})
  return new Map(rows.map((d) => [d.slug, d._id]))
}
const types = ['service', 'camera', 'lens', 'light', 'rigging', 'artDepartment']
const existing = Object.fromEntries(await Promise.all(types.map(async (t) => [t, await slugIds(t)])))

const tx = c.transaction()
const summary = {}
let deptOrder = 100
for (const {name, type, department} of labels) {
  const slug = slugify(name)
  const key = type === 'service' ? `service:${department}` : type
  summary[key] = summary[key] || {create: 0, reuse: 0, names: []}
  summary[key].names.push(name)
  const existingId = existing[type].get(slug)
  if (type === 'service') {
    if (existingId) {
      summary[key].reuse++
      if (COMMIT) tx.patch(existingId, (p) => p.set({department}))
    } else {
      summary[key].create++
      if (COMMIT) tx.createIfNotExists({_id: `service-${slug}`, _type: 'service', name, slug: slugFld(name), department, sortOrder: deptOrder++})
    }
  } else {
    if (existingId) summary[key].reuse++
    else {
      summary[key].create++
      if (COMMIT) tx.createIfNotExists({_id: `${type}-${slug}`, _type: type, name, slug: slugFld(name)})
    }
  }
}

const bar = '─'.repeat(74)
console.log(`\n${bar}\nTile labels  ·  ${COMMIT ? 'COMMIT' : 'DRY RUN'}  ·  ${labels.length} labels\n${bar}`)
for (const [key, s] of Object.entries(summary)) {
  console.log(`${key.padEnd(20)} +${s.create} new, ${s.reuse} reused`)
  console.log(`   ${s.names.join(', ')}`)
}
console.log(bar)

if (!COMMIT) {
  console.log('DRY RUN — nothing written. Re-run with COMMIT=1.\n')
  process.exit(0)
}
await tx.commit()
console.log(`\n✓ Imported ${labels.length} tile labels.\n`)
