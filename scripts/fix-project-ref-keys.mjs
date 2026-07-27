/**
 * Repair non-unique / duplicate _key issues in project reference arrays.
 * De-duplicates by _ref and re-keys each item with its (now-unique) _ref.
 *
 * DRY RUN by default. COMMIT=1 to write.
 *   npx sanity exec scripts/fix-project-ref-keys.mjs --with-user-token
 *   COMMIT=1 npx sanity exec scripts/fix-project-ref-keys.mjs --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const COMMIT = process.env.COMMIT === '1'
const c = getCliClient({apiVersion: '2025-02-27'})
const FIELDS = ['services', 'cameras', 'lenses', 'lighting', 'categories', 'relatedProjects']

const projects = await c.fetch(
  `*[_type=="project"]{ _id, title, ${FIELDS.map((f) => `${f}[]{_key,_ref,_type}`).join(', ')} }`,
)

// Dedupe by _ref, set _key = _ref. Returns null if unchanged.
function fix(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null
  const seen = new Set()
  const out = []
  for (const item of arr) {
    if (!item?._ref || seen.has(item._ref)) continue
    seen.add(item._ref)
    out.push({_type: item._type || 'reference', _ref: item._ref, _key: item._ref})
  }
  const before = arr.map((i) => `${i?._key}:${i?._ref}`).join('|')
  const after = out.map((i) => `${i._key}:${i._ref}`).join('|')
  return before === after ? null : out
}

const tx = c.transaction()
let changed = 0
const report = []
for (const p of projects) {
  const patch = {}
  for (const f of FIELDS) {
    const fixed = fix(p[f])
    if (fixed) {
      patch[f] = fixed
      report.push(`  ${p.title} · ${f}: ${p[f].length} → ${fixed.length}`)
    }
  }
  if (Object.keys(patch).length) {
    changed++
    if (COMMIT) tx.patch(p._id, (pt) => pt.set(patch))
  }
}

const bar = '─'.repeat(64)
console.log(`\n${bar}\nFix ref keys  ·  ${COMMIT ? 'COMMIT' : 'DRY RUN'}  ·  ${changed}/${projects.length} projects need fixes\n${bar}`)
console.log(report.join('\n') || '  (none)')
console.log(bar)

if (!COMMIT) {
  console.log('DRY RUN — nothing written. Re-run with COMMIT=1.\n')
  process.exit(0)
}
await tx.commit()
console.log(`\n✓ Fixed ${changed} projects.\n`)
