/**
 * Seed Photon crew (teamMember) from v3 copy §06 and wire studioPage references.
 *
 * Usage (recommended — uses `sanity login` session):
 *   npm run seed:team
 *
 * Or with an explicit write token:
 *   SANITY_API_WRITE_TOKEN="..." node --env-file=.env.local scripts/seed-photon-team.mjs
 */

import {createClient} from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN

if (!projectId) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
  process.exit(1)
}

if (!token) {
  console.error('Missing SANITY_API_WRITE_TOKEN or SANITY_AUTH_TOKEN')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-02-27',
  token,
  useCdn: false,
})

// Partner studios (outside collaborators). Seeded first so crew can reference them.
// orderRank drives the drag-sortable order in the Studio; leave gaps for inserts.
const PARTNER_STUDIOS = [
  {_id: 'partnerStudio-baker-bros', name: 'Baker Bros', orderRank: '0|100000:'},
  {_id: 'partnerStudio-against-the-grain', name: 'Against the Grain', orderRank: '0|100008:'},
]

const partnerRef = (id) => ({_type: 'reference', _ref: id})

// orderRank strings are LexoRank values (sorted ascending) — they replace the old
// numeric sortOrder and power drag-to-reorder in the Team desk list.
const CREW = [
  {
    _id: 'teamMember-liam-gillies',
    name: 'Liam Gillies',
    title: 'Chief Photometrics',
    tier: 'lead',
    orderRank: '0|100000:',
  },
  {
    _id: 'teamMember-chris-crary',
    name: 'Chris Crary',
    title: 'Mission Control',
    tier: 'lead',
    orderRank: '0|100008:',
  },
  {
    _id: 'teamMember-em-gillies',
    name: 'Em Gillies',
    title: 'Environmental Control',
    tier: 'support',
    orderRank: '0|10000g:',
  },
  {
    _id: 'teamMember-toni-crary',
    name: 'Toni Crary',
    title: 'Life Support',
    tier: 'support',
    orderRank: '0|10000o:',
  },
  {
    _id: 'teamMember-austin-baker',
    name: 'Austin Baker',
    title: 'Orbital Mechanic',
    affiliation: partnerRef('partnerStudio-baker-bros'),
    tier: 'support',
    orderRank: '0|10000w:',
  },
  {
    _id: 'teamMember-garrett-baker',
    name: 'Garrett Baker',
    title: 'Mission Specialist',
    affiliation: partnerRef('partnerStudio-baker-bros'),
    tier: 'support',
    orderRank: '0|100014:',
  },
  {
    _id: 'teamMember-russel-bowen',
    name: 'Russel Bowen',
    title: 'Systems Engineer',
    affiliation: partnerRef('partnerStudio-against-the-grain'),
    tier: 'support',
    orderRank: '0|10001c:',
  },
]

const STUDIO_LEAD =
  "Photon's HQ is a 6,000 sq ft studio in SE Portland, Oregon. Designed and built out by the owners, we've put our blood, sweat, and tears into this space. And with that, so much space for activities. We often integrate specialty set builds into our projects, interior weather, pyrotechnics, large format LED walls, and other creative solutions to push the envelope right here at home."

async function ensureSingleton(id, doc) {
  await client.createIfNotExists({
    _id: id,
    _type: doc._type,
    ...doc,
  })
}

async function main() {
  console.log(`Seeding team to ${projectId}/${dataset}…`)

  for (const studio of PARTNER_STUDIOS) {
    const {_id, ...fields} = studio
    await client.createOrReplace({
      _id,
      _type: 'partnerStudio',
      ...fields,
    })
    console.log(`  ✓ partner studio: ${fields.name}`)
  }

  for (const member of CREW) {
    const {_id, ...fields} = member
    await client.createOrReplace({
      _id,
      _type: 'teamMember',
      ...fields,
    })
    console.log(`  ✓ ${fields.name}`)
  }

  await ensureSingleton('workPage', {_type: 'workPage'})
  await ensureSingleton('capabilitiesPage', {_type: 'capabilitiesPage'})
  await ensureSingleton('contactPage', {_type: 'contactPage'})
  await ensureSingleton('studioPage', {
    _type: 'studioPage',
    sectionLabel: '02 — The studio',
    headline: 'Ground Control for boots on the ground.',
    lead: STUDIO_LEAD,
    seoTitle: 'The Studio — 6,000 sq ft Production Space, SE Portland | Photon',
    seoDescription:
      "Photon's HQ is a 6,000 sq ft Portland studio with a 44 × 38 cyclorama, 400 AMP power, drive-in loading, and full in-house camera, grip, lighting, and crew.",
  })

  const rentalPages = [
    {
      _id: 'rental-studio',
      kind: 'studio',
      title: 'Studio rental',
      slug: {current: 'studio', _type: 'slug'},
      headline: 'Portland Studio.',
    },
    {
      _id: 'rental-podcast',
      kind: 'podcast',
      title: 'Podcast rental',
      slug: {current: 'podcast', _type: 'slug'},
      headline: 'Portland Podcast Room.',
    },
    {
      _id: 'rental-gear',
      kind: 'gear',
      title: 'Gear rental',
      slug: {current: 'gear', _type: 'slug'},
      headline: 'Portland Gear List.',
    },
  ]

  for (const rental of rentalPages) {
    await client.createOrReplace({
      _type: 'rentalPage',
      ...rental,
    })
    console.log(`  ✓ rental page: ${rental.title}`)
  }

  await client
    .patch('studioPage')
    .set({
      crew: CREW.map((member) => ({
        _type: 'reference',
        _ref: member._id,
        _key: member._id.replace('teamMember-', ''),
      })),
    })
    .commit()

  console.log('  ✓ studioPage crew references updated')
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
