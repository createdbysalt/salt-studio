/**
 * Reconcile Sanity clients to the canonical CLIENT ROSTER csv.
 *
 * - Rename: Google→Google Pixel, Sounders→Seattle Sounders
 * - Split UA/JBL → Under Armour (gets the 4 co-branded projects) + JBL (roster client)
 * - Add roster-only clients (no projects): Capital One, Starbucks, Teavana, Triumph,
 *   Stages Cycling, plus Neste + Bare Republic (also arrive with case studies)
 * - Set featured + sortOrder on the 21 primary-roster clients (home strip order)
 *
 * DRY RUN by default. COMMIT=1 to write.
 *   npx sanity exec scripts/reconcile-clients.mjs --with-user-token
 *   COMMIT=1 npx sanity exec scripts/reconcile-clients.mjs --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const COMMIT = process.env.COMMIT === '1'
const c = getCliClient({apiVersion: '2025-02-27'})
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
const slugField = (name) => ({_type: 'slug', current: slugify(name)})

const RENAMES = {Google: 'Google Pixel', Sounders: 'Seattle Sounders'}

// Roster-only clients with no projects (secondary flag = not featured).
const ADD = [
  {name: 'Capital One', featured: true},
  {name: 'Starbucks', featured: true},
  {name: 'Teavana', featured: true},
  {name: 'Triumph', featured: true},
  {name: 'Stages Cycling', featured: false},
  {name: 'Neste', featured: false},
  {name: 'Bare Republic', featured: false},
  {name: 'Under Armour', featured: true},
  {name: 'JBL', featured: true},
]

// Primary roster order → featured + sortOrder (Timbers/Thorns split into two).
const PRIMARY_ORDER = [
  'Sorel',
  'Nike',
  'Jordan',
  'Under Armour',
  'Adidas',
  'Amazfit',
  'Google Pixel',
  'Capital One',
  'Starbucks',
  'Teavana',
  'Triumph',
  'Flexfit',
  'Oura',
  'Hyperice',
  'Vans',
  'Seattle Sounders',
  'Portland Timbers',
  'Portland Thorns',
  'JBL',
  'Taylor Farms',
  'GQ',
  'Rawlings',
]

const clients = await c.fetch(`*[_type=="client"]{_id, name, slug, featured, sortOrder}`)
const byName = new Map(clients.map((c) => [c.name, c]))
const plan = {renames: [], adds: [], featured: [], split: null}
const tx = c.transaction()

// 1. Renames
for (const [from, to] of Object.entries(RENAMES)) {
  const doc = byName.get(from)
  if (doc) {
    plan.renames.push(`${from} → ${to}`)
    tx.patch(doc._id, (p) => p.set({name: to, slug: slugField(to)}))
    byName.set(to, {...doc, name: to})
  }
}

// 2. Adds (createIfNotExists so we never clobber an existing one)
for (const {name} of ADD) {
  if (!byName.get(name)) {
    const _id = `client-${slugify(name)}`
    plan.adds.push(name)
    tx.createIfNotExists({
      _id,
      _type: 'client',
      name,
      slug: slugField(name),
      featured: false,
      sortOrder: 0,
    })
    byName.set(name, {_id, name})
  }
}

// 3. Split UA/JBL → reassign its projects to Under Armour, then delete UA/JBL
const uajbl = byName.get('UA/JBL')
if (uajbl) {
  const ua = byName.get('Under Armour') || {_id: `client-${slugify('Under Armour')}`}
  const projs = await c.fetch(`*[_type=="project" && client._ref==$id]{_id, title}`, {
    id: uajbl._id,
  })
  plan.split = {count: projs.length, titles: projs.map((p) => p.title), to: 'Under Armour'}
  for (const pr of projs)
    tx.patch(pr._id, (p) => p.set({client: {_type: 'reference', _ref: ua._id}}))
  tx.delete(uajbl._id)
}

// 4. featured + sortOrder for primary roster; unfeature everyone else
for (const cl of clients.concat(
  [...byName.values()].filter((v) => !clients.find((c) => c._id === v._id)),
)) {
  const name = RENAMES[cl.name] || cl.name
  if (name === 'UA/JBL') continue // being deleted
  const order = PRIMARY_ORDER.indexOf(name)
  if (order >= 0) {
    plan.featured.push(`${name} (#${order + 1})`)
    tx.patch(cl._id, (p) => p.set({featured: true, sortOrder: order + 1}))
  } else {
    tx.patch(cl._id, (p) => p.set({featured: false}))
  }
}

const bar = '─'.repeat(70)
console.log(`\n${bar}\nClient reconcile  ·  ${COMMIT ? 'COMMIT' : 'DRY RUN'}\n${bar}`)
console.log(`Renames (${plan.renames.length}): ${plan.renames.join(', ')}`)
console.log(`Add roster clients (${plan.adds.length}): ${plan.adds.join(', ')}`)
console.log(
  `Split UA/JBL: ${plan.split ? `${plan.split.count} projects → Under Armour [${plan.split.titles.join(', ')}], delete UA/JBL client` : 'not found'}`,
)
console.log(`Featured (primary roster, ${plan.featured.length}): ${plan.featured.join(', ')}`)
console.log(bar)

if (!COMMIT) {
  console.log('DRY RUN — nothing written. Re-run with COMMIT=1.\n')
  process.exit(0)
}
await tx.commit()
console.log('\n✓ Clients reconciled.\n')
