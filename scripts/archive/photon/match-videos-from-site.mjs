/**
 * Set `videoUrl` on existing Sanity projects from photon.studio Vimeo links.
 *
 * Matches were resolved by hand against the live site (title + Vimeo id per page),
 * so the map below is explicit and auditable — no fuzzy matching at write time.
 * Never creates projects; only patches titles that already exist in the dataset.
 *
 *   npx sanity exec scripts/match-videos-from-site.mjs --with-user-token           # dry run
 *   COMMIT=1 npx sanity exec scripts/match-videos-from-site.mjs --with-user-token  # write confirmed
 *   COMMIT=1 INCLUDE=ride-icon,sounders-jimi npx sanity exec … --with-user-token   # + optional
 */
import {getCliClient} from 'sanity/cli'

const COMMIT = process.env.COMMIT === '1'
const INCLUDE = new Set((process.env.INCLUDE || '').split(',').map((s) => s.trim()).filter(Boolean))
const c = getCliClient({apiVersion: '2025-02-27'})
const V = (id) => `https://vimeo.com/${id}`

// Confirmed: exact Sanity project title → Vimeo id (high confidence).
const CONFIRMED = {
  'ADIDAS BOOST': 309531314, // Adidas Boost Multicolor (context: "Boost multicolor")
  'ADIDAS UNVAULTED': 312814645,
  'BMW I8': 309556155,
  'COMBAT SPEC A1': 1033129097,
  'GRABR': 229021320,
  'GREEN VALLEY CREAMERY': 445057646,
  'HOLDFAST': 374510925,
  'HYPERICE ATHLETE STORIES': 486196951,
  'HYPERICE COLLEEN': 640061887,
  'LINGO': 1109305088,
  'NIKE FOOTBALL - THE ONES': 390587045, // "Nike American Football - The Ones"
  'NIKE HELLO': 574188785, // "Hello Nike App"
  'NIKE ROSHE': 844394167, // "Nike Return of the Roshe"
  'NIKE WELLNESS': 915897970,
  'PORTLAND THORNS': 908432337,
  'PORTLAND TIMBERS': 908443979,
  'SOREL SS25 ART STUDIO': 1069220143, // "SOREL SS25"
  'TAYLOR FARMS': 908468844, // "Taylor Farms Mini"
  'UA/JBL FLASH': 310891738,
  'UA/JBL STREAK': 486546795,
  'UA/JBL TOUGH ENOUGH': 222248775, // "UA Tough Enough"
  'UA/JBL TRAIN': 281556474,
  'AVOLI YEAR 1': 872739150, // base "AVOLI" page
  'AVOLI YEAR 2': 1111585685,
  'AVOLI YEAR 3': 1111591066,
  'COMPHY': 915894637, // "Comphy by Coop"
  'FLEXFIT MADE FOR': 844397619,
  'SOREL FW23 ILLUSTRATED': 902447891, // "Sorel F23"
  'SOREL S21 NEW HEIGHTS / NEW HUSTLE': 519309092, // "Sorel SS21"
  'NIKE SNKRS': 391388873, // "SNKRS App"
  'JORDAN FLIGHT TEST': 797871766, // "Jordan + Nike App Week" (matches Sanity context)
  'VANS POSTAL SERVICE': 701338276, // "Vans x USPS"
  'OARA': 1109291390, // "Oura ring" (Sanity title is a typo for Oura)
  'COMBAT RODEO': 1109655789, // "Combat Rodeo / Country Club"
}

// Optional: plausible but not certain. Included only if their key is in INCLUDE=.
const OPTIONAL = {
  'ride-icon': {title: 'RIDE ICON', id: 323312094, site: 'Icon Motorsports Airform'},
  'sounders-jimi': {title: 'SOUNDERS JIMI HENDRIX', id: 533335420, site: '2021 Sounders Kit Reveal'},
  'flexfit-golf': {title: 'FLEXFIT GOLF', id: 1109678883, site: 'Flexfit Gentlemens Game'},
  'combat-cc': {title: 'COMBAT COUNTRY CLUB', id: 1109655789, site: 'Combat Rodeo / Country Club (shared)'},
}

const projects = await c.fetch(`*[_type=="project"]{_id, title, "slug": slug.current, videoUrl}`)
const byTitle = new Map(projects.map((p) => [p.title, p]))

const plan = []
for (const [title, id] of Object.entries(CONFIRMED)) {
  const p = byTitle.get(title)
  if (p) plan.push({p, url: V(id), note: ''})
  else console.log(`⚠ CONFIRMED title not found in dataset: "${title}"`)
}
for (const [key, o] of Object.entries(OPTIONAL)) {
  if (!INCLUDE.has(key)) continue
  const p = byTitle.get(o.title)
  if (p) plan.push({p, url: V(o.id), note: `(optional: ${o.site})`})
  else console.log(`⚠ OPTIONAL title not found: "${o.title}"`)
}

const bar = '─'.repeat(72)
console.log(`\n${bar}\nVideo URLs  ·  ${COMMIT ? 'COMMIT' : 'DRY RUN'}  ·  writing ${plan.length} of ${projects.length} projects\n${bar}`)
for (const {p, url, note} of plan)
  console.log(`  ${p.videoUrl ? '↻' : '+'} ${p.title.padEnd(34).slice(0, 34)} ${url} ${note}`)
const without = projects.filter((p) => !plan.find((x) => x.p._id === p._id) && !p.videoUrl)
console.log(`\nLeft without video (${without.length}): ${without.map((p) => p.title).join(' | ')}`)
console.log(bar)

if (!COMMIT) {
  console.log('DRY RUN — nothing written. Re-run with COMMIT=1 (optionally INCLUDE=…).\n')
  process.exit(0)
}

const tx = c.transaction()
for (const {p, url} of plan) tx.patch(p._id, (patch) => patch.set({videoUrl: url}))
await tx.commit()
console.log(`\n✓ Set videoUrl on ${plan.length} projects.\n`)
