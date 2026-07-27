/**
 * Seed Photon page copy from docs/2026-04-10-photon-website-copy-v3.md
 *
 * Usage:
 *   npm run seed:copy
 *
 * Prerequisite: npm run seed:team (crew + rental page shells)
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

function sectionOrder(keys, typeName, disabled = []) {
  const hidden = new Set(disabled)
  return keys.map((key) => ({
    _key: key,
    _type: typeName,
    key,
    enabled: !hidden.has(key),
  }))
}

function specRows(rows) {
  return rows.map(([label, value]) => ({
    _key: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    _type: 'specRow',
    label,
    value,
  }))
}

function block(key, text, style = 'normal') {
  return {
    _type: 'block',
    _key: key,
    style,
    markDefs: [],
    children: [{_type: 'span', _key: `${key}-span`, text, marks: []}],
  }
}

function termsContent() {
  const sections = [
    [
      'Agreement',
      'This Agreement ("Agreement") is entered into between Photon ("Creator") and ("Client") and governs the project described in the accompanying invoice ("Project"). Together with these Terms and Conditions, this Agreement constitutes a binding agreement between the parties. All creative materials, including concepts, images, videos, designs, processes, adaptations, inventions, and techniques ("Work"), remain the sole property of the Creator unless otherwise agreed in writing. The Client is granted a license to use the Work as specified in the Usage Terms in the above project description, and upon full payment of above fees. Any additional use (e.g., extensions beyond timeframe, new platforms, sublicensing, or derivative works) requires written approval and may incur additional licensing fees.\n\nThe Client is responsible for having an authorized representative present during any shoot or production to approve the Creator\'s interpretation of the Project. In the absence of such a representative, the Creator\'s interpretation shall be deemed acceptable. Any changes which significantly impact the scope of work, orally or in writing, may result in additional charges, invoiced as a change order. The invoice expenses are estimated in good faith.',
    ],
    [
      'Payment',
      'A non-refundable 50% deposit is required upon written notice of official job awarding. The remaining balance is due within 30 days of the project completion and transfer of works. Late payments will incur a 2% monthly interest charge. Usage rights are granted only after full payment is received.',
    ],
    [
      'Cancellation / Postponement',
      'If the Client cancels or postpones the Project after written confirmation, the initial 50% deposit is non-refundable. If cancellation occurs after production has begun, the Client shall pay all costs incurred up to the date of cancellation, including any kill fees for crew, location, or talent. If postponement occurs due to circumstances beyond either party\'s control (force majeure), both parties will make reasonable efforts to reschedule. Creator is not liable for delays caused by such events.',
    ],
    [
      'Post-production & Revisions',
      'Delivery timelines will be mutually agreed upon and the estimate includes three rounds of revisions. Any additional editing, retouching, color correction, graphics, crops or other alterations requested by the Client after round 4 and beyond the agreed scope will be billed automatically at a rate of $150/hour at the completion of the project.',
    ],
    [
      'Indemnification',
      'Client agrees to indemnify and hold harmless the Creator and its agents from all claims, liabilities, and expenses (including attorney\'s fees) arising from the Client\'s use of the Work. The Creator agrees to indemnify and hold harmless the Client against claims directly arising from Creator\'s gross negligence or willful misconduct.',
    ],
    [
      'Limitation of Liability',
      'In no event shall the Creator\'s total liability exceed the total amount paid by the Client under this Agreement. The Creator shall not be liable for any consequential, incidental, or indirect damages.',
    ],
    [
      'Governing Law & Jurisdiction',
      'This Agreement shall be governed by and construed in accordance with the laws of the State of Oregon and any disputes shall be resolved in the courts of Oregon.',
    ],
  ]

  return sections.flatMap(([heading, body], index) => [
    block(`terms-h-${index}`, heading, 'h2'),
    block(`terms-p-${index}`, body, 'normal'),
  ])
}

function placeholderLegalContent() {
  return [block('placeholder', 'Placeholder — policy content to be finalized before launch.')]
}

const LEGAL_SLUGS = {
  privacy: 'privacy-policy',
  terms: 'terms',
  cookies: 'cookie-policy',
  accessibility: 'accessibility-statement',
}

const STUDIO_SPECS = specRows([
  ['Total space', '6,000 sq ft'],
  ['Cyclorama', '44 × 38 — permanent, seamless, paintable'],
  ['Power', '400 AMP, with digital 3-phase converter'],
  ['Wifi', 'Dedicated fiber, 1G'],
  ['Ceiling height', '16 ft clear, 24 ft total'],
  ['Kitchenette and bathroom', '1 of each'],
  ['Loading', 'Drive-in roll-up door, 14 ft × 12 ft'],
  ['Scissor lift', 'Genie GS-1930'],
  ['Camera, grip, lighting, crew', 'In-house'],
  ['Lighting', 'Total control — full blackout possible'],
  ['Parking', 'Street'],
  ['Address', '726 SE 10th Ave, Portland, OR 97214'],
])

const PODCAST_SPECS = specRows([
  ['Room type', 'Acoustically treated recording booth'],
  ['Mic setup', '2 × on shock mounts'],
  ['Headphones', 'Over-the-ear × 4'],
  ['Recording', 'Raw, with in-camera redundancy'],
  ['Engineer', 'Optional on-site engineer add-on'],
  ['Video capture', 'Optional Blackmagic 6K video'],
  ['Delivery', 'Raw WAV files'],
  ['Booking', 'Two-hour minimum'],
])

const MODULE_LABELS = [
  'Creative',
  'Treatment',
  'Storyboard',
  'Shot design',
  'Look development',
  'Art direction',
  'Set design',
  'Commercial video (8K / 6K / 4K)',
  'Commercial stills',
  'High-speed (1000+ fps)',
  'Anamorphic',
  'Macro',
  'Tabletop',
  'Astera lighting',
  'In-studio weather',
  'Practical FX',
  'Cyclorama',
  '400 AMP',
  '6,000 sq ft stage',
  'Edit',
  'Color',
  'Finishing',
  'Motion graphics',
  'Sound design',
  'VO',
  'Foley',
  'Retouching',
  'Lisbon hub',
  'EU production',
]

const CONTACT_FORM = {
  _type: 'contactForm',
  submitLabel: 'Launch →',
  successHeadline: 'Signal acquired.',
  successMessage:
    "Message received. We'll be back within one business day — usually faster. If it's urgent, reply to the confirmation email and we'll route it straight to whoever's on deck.",
  errorHeadline: 'Signal lost.',
  errorMessage:
    "Something didn't send. Try again, or email us directly at chris@photon.studio. We'd rather hear from you twice than not at all.",
  footerNote: 'For rentals: mention the date in your message. For agencies: mention the brand.',
  description:
    "Chris runs intake — he's the first read on every project. Liam jumps in for creative direction. You'll hear from one of them within one business day, usually faster.",
  fields: [
    {_type: 'formField', _key: 'name', name: 'name', label: 'Your name', type: 'text', required: true},
    {_type: 'formField', _key: 'email', name: 'email', label: 'Your email', type: 'email', required: true},
    {_type: 'formField', _key: 'company', name: 'company', label: 'Your company', type: 'text', required: false},
    {
      _type: 'formField',
      _key: 'projectType',
      name: 'projectType',
      label: 'What kind of project?',
      type: 'select',
      required: false,
      options: [
        'Brand campaign',
        'Product launch',
        'Case study / film',
        'Studio rental',
        'Podcast session',
        'Something else',
        'Not sure yet',
      ],
    },
    {
      _type: 'formField',
      _key: 'message',
      name: 'message',
      label: 'What are you working on?',
      type: 'textarea',
      required: true,
    },
    {
      _type: 'formField',
      _key: 'deliverables',
      name: 'deliverables',
      label: 'What are you delivering?',
      type: 'textarea',
      required: false,
      placeholder: 'e.g. 1× 60s hero, 4× :15 socials, 12× stills',
    },
    {
      _type: 'formField',
      _key: 'budget',
      name: 'budget',
      label: 'Budget range',
      type: 'select',
      required: false,
      options: ['Under $25k', '$25k–$75k', '$75k–$150k', '$150k+', 'Rather not say yet'],
    },
    {
      _type: 'formField',
      _key: 'dates',
      name: 'dates',
      label: 'Project dates',
      type: 'textarea',
      required: false,
      placeholder: 'Shoot date and delivery date if known',
    },
    {
      _type: 'formField',
      _key: 'referral',
      name: 'referral',
      label: 'How did you hear about us?',
      type: 'select',
      required: false,
      options: ['Referral', 'Search', 'Instagram or Vimeo', 'Event or press', 'Something else'],
    },
  ],
}

const WORK_CATEGORIES = [
  {
    _id: 'workCategory-sportswear',
    filterLabel: 'Sportswear',
    slug: 'sportswear',
    headline: 'Sportswear',
    subhead: 'Teams, brands, and big swings.',
    seoTitle: 'Sportswear commercial production — Photon Studio',
    seoDescription:
      'Commercial video and photography for sportswear brands and teams. Kit films, athlete stories, and campaign work for Nike, Adidas, the Sounders, and more — produced in Portland with international reach.',
  },
  {
    _id: 'workCategory-lifestyle',
    filterLabel: 'Lifestyle',
    slug: 'lifestyle',
    headline: 'Lifestyle',
    subhead: "Life's moments, lit and with a soundtrack.",
    seoTitle: 'Lifestyle Photography Production | Built for Brands',
    seoDescription:
      'Authentic lifestyle photography and video campaigns in real-life moments, designed to inspire everyday style and improve how we move through the world.',
  },
  {
    _id: 'workCategory-tech',
    filterLabel: 'Tech',
    slug: 'tech',
    headline: 'Tech',
    subhead: 'Apps, wearables and phones, oh my!',
    seoTitle: 'We Speak Fluent Gadget',
    seoDescription:
      'From app UI captures to wearable campaigns and phone launch content — production that keeps pace with the tech industry\'s relentless speed.',
  },
  {
    _id: 'workCategory-footwear',
    filterLabel: 'Footwear',
    slug: 'footwear',
    headline: 'Footwear',
    subhead: 'We help you put your best foot forward.',
    seoTitle: 'Footwear commercial production — Photon Studio',
    seoDescription:
      'Footwear campaign production in Portland with international reach. Director-led work for Sorel, Vans, and other performance and lifestyle brands — creative, production, and post under one roof.',
  },
  {
    _id: 'workCategory-food',
    filterLabel: 'Food',
    slug: 'food',
    headline: 'Food and beverage',
    subhead: 'Pour, steam, sizzle, cut.',
    seoTitle: 'Food & beverage commercial production — Photon Studio',
    seoDescription:
      'Food and beverage commercial production in Portland. Tabletop and high-speed work for brands like Taylor Farms, La Marzocco, and Tea Bar — shot and finished by the same team.',
  },
  {
    _id: 'workCategory-high-speed',
    filterLabel: 'High-Speed',
    slug: 'high-speed',
    headline: 'High-speed',
    subhead: '1,000+ frames per second, in-house.',
    seoTitle: 'High-speed cinematography Portland — Photon Studio',
    seoDescription:
      'High-speed cinematography in Portland. Freefly Ember 5K and Pixboom Spark in-house on a 6,000 sq ft stage. Tabletop, product, fluid, and athletic work at 1,000+ FPS — shot and finished by the same team.',
  },
  {
    _id: 'workCategory-music',
    filterLabel: 'Music',
    slug: 'music',
    headline: 'Music',
    subhead: 'Looking sharp',
    seoTitle: 'Rhythmically driven, music videos, rock bands and vocalists',
    seoDescription:
      'A collection of cinematic music and band videos utilizing various camera techniques, editing, graphics, and performances.',
  },
  {
    _id: 'workCategory-fashion',
    filterLabel: 'Fashion',
    slug: 'fashion',
    headline: 'Fashion',
    subhead: 'From the runway to the real world.',
    seoTitle: 'Fashion campaign, ready to wear, conceptual and avant-garde',
    seoDescription:
      'Fashion related campaigns from leading apparel companies which include film and photography to showcase seasonal or capsule collections.',
  },
  {
    _id: 'workCategory-studio',
    filterLabel: 'Studio',
    slug: 'studio',
    headline: 'Studio',
    subhead: 'For ultimate control and set builds.',
    seoTitle: 'Custom Studio Set Builds | Portland Photography Studio',
    seoDescription:
      "Commercial work shot on Photon's 6,000 sq ft Portland stage and cyclorama. Custom set builds, talent, and product work with creative, production, and post in the same building.",
  },
  {
    _id: 'workCategory-art-dept',
    filterLabel: 'Art Dept',
    slug: 'art-dept',
    headline: 'Art Dept',
    subhead: 'When our in-house team built the props, sets and practical FX.',
    seoTitle: 'Set and prop building, fabrication and other art department jobs',
    seoDescription:
      'In-studio and on location set building, prop making, set dressing, light integration, plexiglass, framing, fabrication, 3D printing, large format LED wall, digital set extensions, concrete, foam, mesh, sound dampening, paint work, and special effects.',
  },
]

async function ensureSingleton(id, _type, fields = {}) {
  await client.createIfNotExists({_id: id, _type, ...fields})
}

async function patch(id, _type, fields) {
  await ensureSingleton(id, _type)
  await client.patch(id).set(fields).commit()
  console.log(`  ✓ ${id}`)
}

async function main() {
  console.log(`Seeding copy to ${projectId}/${dataset}…`)

  await patch('home', 'home', {
    seoTitle: 'Photon — Modular Production Studio, Portland / Portugal',
    seoDescription:
      'A production studio for brands and agencies. Commercial video, stills, high-speed, based in Portland with a 6,000 sq ft studio with cyclorama and international reach.',
    hiddenH1: 'Photon Studio — Photography and Video Production in Portland and Portugal',
    philosophyLine: 'Think of us as mission control for your visual content.',
    clientRosterLine:
      'SELECTED CLIENTS — Nike · Adidas · Google Pixel · Capital One · Starbucks · Teavana · Triumph · Amazfit · Flexfit · Sorel · Oura · Hyperice · Jordan · Vans · Under Armour · Seattle Sounders · Portland Thorns · Portland Timbers · JBL · Taylor Farms · Wildfang · GQ',
    relationshipProofLine:
      'We measure clients in projects and years, not deliverables. The longest is five years in.',
    bottomCtaLabel: 'Start a conversation →',
    sectionOrder: sectionOrder(['philosophyLine', 'clientRoster', 'relationshipProof'], 'homeSection'),
  })

  await patch('workPage', 'workPage', {
    sectionLabel: '01 — Selected work',
    headline: 'All Projects',
    subhead: 'Filter by specialty — or scroll the whole thing.',
    seoTitle: 'Work — Photon Studio Portland / Portugal',
    seoDescription:
      'Selected commercial video and photography work from Photon — a production studio working with brands and agencies across sportswear, lifestyle, tech, footwear, food, and more.',
  })

  for (const cat of WORK_CATEGORIES) {
    const {_id, slug, ...fields} = cat
    await client.createOrReplace({
      _id,
      _type: 'workCategory',
      slug: {_type: 'slug', current: slug},
      ...fields,
    })
    console.log(`  ✓ workCategory: ${fields.filterLabel}`)
  }

  // Capabilities uses the MFI-style sections array (see
  // sanity/schemas/sections/capabilitiesSections.ts). createOrReplace so a
  // reseed fully supersedes any older flat-field shape.
  await client.createOrReplace({
    _id: 'capabilitiesPage',
    _type: 'capabilitiesPage',
    seoTitle: 'Capabilities — Modular Production from Creative through Post | Photon Studio',
    seoDescription:
      "Photon's modular production capabilities: creative, production, and post — all in-house. High-speed, cyclorama, in-studio weather, edit, color, sound. Portland and Lisbon.",
    speakableSummary:
      'Photon is a modular production studio in Portland, with a satellite in Lisbon. We run creative, production, and post in-house — from treatment and storyboarding to high-speed capture, cyclorama, and in-studio weather, through edit, color, and sound.',
    sections: [
      {
        _key: 'hero',
        _type: 'capHeroSection',
        enabled: true,
        eyebrow: '03 — Capabilities',
        headline: 'Modular Production, beginning to end.',
        lead: 'A giant network distilled into specialty teams, with one mission: maximize resources and elevate what\'s possible. Create once. Launch everywhere.',
        founderAnchor:
          'Founded in 2017 by Liam Gillies and immediately joined by Chris Crary. This duo has been part of Photon from day one and continues to be the core of the business.',
        secondaryLine: 'Most production scales by adding more staff. We scale through reach.',
      },
      {
        _key: 'whyModular',
        _type: 'capWhyModularSection',
        enabled: true,
        subhead: 'Everything you need, nothing you don\'t.',
        body: 'Because no two shoots are alike. We focus on nimble, specialized teams that scale to the exact need. This way, we can utilize any budget level to the best of its ability — extending creative possibilities in a smooth process.',
      },
      {
        _key: 'howWeWork',
        _type: 'capHowWeWorkSection',
        enabled: true,
        subhead: 'Creative → Production → Post.',
        body: 'Consistent creative heads from planning through post production lead to even more reduction of waste. The best result comes from a thoughtful creative idea matched with an equally thoughtful process.',
      },
      {
        _key: 'whereWeWork',
        _type: 'capWhereWeWorkSection',
        enabled: true,
        subhead: 'Portland, Portugal, and everywhere in between.',
        body: 'Portland is HQ. Portugal is our satellite. The world is our oyster.',
      },
      {
        _key: 'moduleTiles',
        _type: 'capModuleTilesSection',
        enabled: true,
        moduleTiles: MODULE_LABELS.map((label) => ({
          _key: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          _type: 'moduleTile',
          label,
          inHouse: true,
        })),
      },
      {
        _key: 'creative',
        _type: 'capCreativeSection',
        enabled: true,
        subhead: 'Creative.',
        introLine: 'Where the brief becomes a plan.',
        body: 'Treatment development, storyboarding, shot lists, look development. Every project starts with the team that will shoot it — no handoff between the room that pitched the idea and the set that executes it.',
      },
      {
        _key: 'production',
        _type: 'capProductionSection',
        enabled: true,
        subhead: 'Production.',
        introLine: 'Where every moment counts.',
        body: 'As content demands rise, so do our solutions. We manage multiple capture types to squeeze out every last drop of our opportunities on the day.',
      },
      {
        _key: 'post',
        _type: 'capPostSection',
        enabled: true,
        subhead: 'Post.',
        introLine: 'Where it all comes together.',
        body: 'Edit, color, GFX, sound design and VFX. All in-house, next door to the cameras. No shipping hard drives across town. No loss in translation from director to editor.',
      },
      {
        _key: 'agencyBrands',
        _type: 'capAgencyBrandsSection',
        enabled: true,
        subhead: 'Maximum flexibility.',
        body: 'We are a true white-label service and can interface within existing teams or build an entirely new one from scratch. Planning through post or a specific capability on its own — our goal is to execute at the highest level, regardless of scope or scale.',
        pullQuote: 'We work as an extension of your team, not in place of it.',
      },
      {
        _key: 'closingCta',
        _type: 'ctaSection',
        enabled: true,
        subhead: 'Need a specific capability on a specific date?',
        buttonLabel: 'Start a conversation →',
      },
    ],
  })
  console.log('  ✓ capabilitiesPage')

  // createOrReplace (runs after seed:team) so the crew refs live inside the
  // sections array and no old flat fields linger.
  await client.createOrReplace({
    _id: 'studioPage',
    _type: 'studioPage',
    seoTitle: 'The Studio — 6,000 sq ft Production Space, SE Portland | Photon',
    seoDescription:
      "Photon's HQ is a 6,000 sq ft Portland studio with a 44 × 38 cyclorama, 400 AMP power, drive-in loading, and full in-house camera, grip, lighting, and crew.",
    speakableSummary:
      "Photon's studio is a 6,000-square-foot production space in southeast Portland, Oregon, with a 44-by-38-foot cyclorama, 400-amp power, 16-foot ceilings, and drive-in loading. Camera, grip, lighting, and crew are all in-house. A satellite studio in Lisbon serves Europe.",
    sections: [
      {
        _key: 'hero',
        _type: 'studioHeroSection',
        enabled: true,
        eyebrow: '02 — The studio',
        headline: 'Ground Control for boots on the ground.',
        lead: "Photon's HQ is a 6,000 sq ft studio in SE Portland, Oregon. Designed and built out by the owners, we've put our blood, sweat, and tears into this space. And with that, so much space for activities. We often integrate specialty set builds into our projects, interior weather, pyrotechnics, large format LED walls, and other creative solutions to push the envelope right here at home.",
      },
      {_key: 'specs', _type: 'studioSpecsSection', enabled: true, specRows: STUDIO_SPECS},
      {
        _key: 'lisbon',
        _type: 'studioLisbonSection',
        enabled: true,
        headline: 'Satellite and EU launchpad.',
        body: "Photon's satellite office is a 150 sq m studio in Lisbon, Portugal. This is the main hub for post production and the launchpad for productions across Europe.",
      },
      {
        _key: 'crew',
        _type: 'studioCrewSection',
        enabled: true,
        subhead: 'Crew.',
        crew: [
          'liam-gillies',
          'chris-crary',
          'em-gillies',
          'toni-crary',
          'austin-baker',
          'garrett-baker',
          'russel-bowen',
        ].map((k) => ({_type: 'reference', _ref: `teamMember-${k}`, _key: k})),
      },
      {
        _key: 'closingCta',
        _type: 'ctaSection',
        enabled: true,
        subhead: "Let's talk shop.",
        buttonLabel: 'Start a conversation →',
      },
    ],
  })
  console.log('  ✓ studioPage')

  await client.createOrReplace({
    _id: 'contactPage',
    _type: 'contactPage',
    seoTitle: 'Contact Photon — Start a Conversation | Portland Production Studio',
    seoDescription:
      'Get in touch with Photon, a Portland and Lisbon production studio. Brand campaigns, case studies, studio rentals, podcast sessions. One-business-day reply.',
    speakableSummary:
      'Contact Photon to start a production project. Chris handles intake and replies within one business day, usually faster — for brand campaigns, case studies, studio rentals, and podcast sessions. Or email chris@photon.studio directly.',
    sections: [
      {
        _key: 'hero',
        _type: 'contactHeroSection',
        enabled: true,
        eyebrow: '05 — Contact',
        headline: 'Mission briefing.',
        lead: "Tell us what you're making. We'll tell you if we're the right studio to make it with you — and who to call if we're not.",
      },
      {
        _key: 'directContact',
        _type: 'contactDirectSection',
        enabled: true,
        directContactLine:
          'Rather skip the form? Email Chris directly — chris@photon.studio. He answers same day, usually same hour.',
      },
      {_key: 'contactForm', _type: 'contactFormSection', enabled: true, formConfig: CONTACT_FORM},
    ],
  })
  console.log('  ✓ contactPage')

  // No rentals hub — three pages only (/rentals redirects to /rentals/studio).
  const portlandHqId =
    (
      await client.fetch(
        `*[_type == "location" && kind == "hq"][0]._id`,
      )
    ) || null

  await client.createOrReplace({
    _id: 'cta-rental-studio',
    _type: 'callToAction',
    title: 'Rental — Book the studio',
    subhead: 'Ready to book the studio?',
    buttonLabel: 'Check availability →',
    link: '/contact',
    contactSubject: 'Studio rental',
  })
  await client.createOrReplace({
    _id: 'cta-rental-podcast',
    _type: 'callToAction',
    title: 'Rental — Book the podcast room',
    subhead: 'Ready to book the room?',
    buttonLabel: 'Check availability →',
    link: '/contact',
    contactSubject: 'Podcast session',
  })
  await client.createOrReplace({
    _id: 'cta-rental-gear',
    _type: 'callToAction',
    title: 'Rental — Gear add-on',
    subhead: 'Need to talk through a gear add-on?',
    buttonLabel: 'Check availability →',
    link: '/contact',
    contactSubject: 'Gear rental',
  })
  console.log('  ✓ rental CTAs')

  const portlandStills = [
    {
      _key: 'rg1',
      _ref: 'image-a737752372922ecf05c69b046680c5b23de231c7-2500x1667-jpg',
      alt: 'Portland studio — open floor and truss ceiling',
    },
    {
      _key: 'rg2',
      _ref: 'image-d300fc6af0985ebae17cbacf4100aac615af500c-2500x1667-jpg',
      alt: 'Portland studio — cyclorama and kitchenette',
    },
    {
      _key: 'rg3',
      _ref: 'image-8c9a93451d63c39080a6cbaefb141af7fca8036b-2500x1667-jpg',
      alt: 'Portland studio — kitchen',
    },
    {
      _key: 'rg4',
      _ref: 'image-62ec3e738379eea07ab61cd97e98984aa424daa1-2500x1667-jpg',
      alt: 'Portland studio — production floor with kitchen island',
    },
    {
      _key: 'rg5',
      _ref: 'image-d3d57965d38a686dddee3ffdaa1f8d7382ce21ab-2500x1667-jpg',
      alt: 'Portland studio — cyclorama corner',
    },
    {
      _key: 'rg6',
      _ref: 'image-f65b57f9d0f8c4497019e78bcb79cc7425f95135-2500x1667-jpg',
      alt: 'Portland studio — cyclorama and loading doors',
    },
  ].map(({_key, _ref, alt}) => ({
    _type: 'image',
    _key,
    alt,
    asset: {_type: 'reference', _ref},
  }))

  await client.createOrReplace({
    _id: 'rental-studio',
    _type: 'rentalPage',
    kind: 'studio',
    title: 'Studio rental',
    slug: {_type: 'slug', current: 'studio'},
    eyebrow: 'Rentals — Studio',
    headline: 'Portland Studio.',
    heroImage: {
      _type: 'image',
      alt: 'Portland studio — cyclorama and loading doors',
      asset: {
        _type: 'reference',
        _ref: 'image-f65b57f9d0f8c4497019e78bcb79cc7425f95135-2500x1667-jpg',
      },
    },
    gallery: portlandStills,
    gallerySubhead: 'The space.',
    useGallery: portlandStills.map((image, i) => ({...image, _key: `ug${i + 1}`})),
    specsSubhead: 'Specs.',
    ...(portlandHqId
      ? {specsLocation: {_type: 'reference', _ref: portlandHqId}}
      : {specRows: STUDIO_SPECS}),
    includedSubhead: "What's included",
    includedBody:
      'Every rental comes with the studio essentials: 60 ft × 38 ft shooting area, cyclorama with a fresh coat of paint, grip closet of goodies, studio power, climate control, wifi, kitchenette, and bathroom.',
    extraSubhead: "What's extra",
    extraBody:
      'Camera, lens, lighting, custom grip and crew beyond the house kit, specialty rigs (motion control, high-speed, anamorphics), on-set Photon crew, catering, and art-department labor are all available on request — priced per shoot day.',
    cta: {_type: 'reference', _ref: 'cta-rental-studio'},
    seoTitle: 'Portland Studio Rental — 6,000 sq ft Cyclorama | Photon Studio',
    seoDescription:
      "Rent Photon's 6,000 sq ft Portland production studio with 44 × 38 cyclorama, 400 AMP power, drive-in loading, and optional in-house crew.",
    speakableSummary:
      "Rent Photon's 6,000-square-foot Portland studio: a 60-by-38-foot shooting area, a 44-by-38 cyclorama, 400-amp power, 16-foot ceilings, and drive-in loading. Book by the day, with or without a Photon crew.",
  })
  console.log('  ✓ rental-studio')

  await client.createOrReplace({
    _id: 'rental-podcast',
    _type: 'rentalPage',
    kind: 'podcast',
    title: 'Podcast rental',
    slug: {_type: 'slug', current: 'podcast'},
    eyebrow: 'Rentals — Podcast',
    headline: 'Portland Podcast Room.',
    specsSubhead: 'Specs.',
    specRows: PODCAST_SPECS,
    whoForSubhead: "Who it's for",
    whoForBody:
      "Podcasters recording a weekly episode. Brand audio teams cutting launch spots. VO directors on deadline. Foley artists who need a quiet room that isn't their closet.",
    includedSubhead: "What's included",
    includedBody:
      "The room, the mics, the headphones, the engineer if you want one, and the kind of silence most home studios can't buy. Bring your guests. We'll bring the coffee.",
    cta: {_type: 'reference', _ref: 'cta-rental-podcast'},
    seoTitle: 'Portland Podcast Room Rental | Photon Studio',
    seoDescription:
      "Rent Photon's acoustically treated podcast room in Portland. Mics, headphones, optional engineer and video capture — two-hour minimum, books by the hour.",
    speakableSummary:
      "Rent Photon's acoustically treated podcast room in Portland: two mics on shock mounts, four headphones, raw WAV delivery, and an optional on-site engineer or 6K video capture. Books by the hour, two-hour minimum.",
  })
  console.log('  ✓ rental-podcast')

  await client.createOrReplace({
    _id: 'rental-gear',
    _type: 'rentalPage',
    kind: 'gear',
    title: 'Gear rental',
    slug: {_type: 'slug', current: 'gear'},
    eyebrow: 'Rentals — Gear',
    headline: 'Portland Gear List.',
    gearHeading: 'Photon curated gear.',
    gearIntro: 'Take your shoot even further with the same gear our creative team relies on.',
    gearListPdfUrl: '/photon-gear-list.pdf',
    gearListPdfLabel: 'Download the Photon gear list (PDF) →',
    studioSpecPdfUrl: '/photon-spec-sheet.pdf',
    studioSpecPdfLabel: 'Download the Photon studio spec sheet (PDF) →',
    cta: {_type: 'reference', _ref: 'cta-rental-gear'},
    seoTitle: 'Production Gear Rental Portland | Photon Studio',
    seoDescription:
      "Rent curated camera, grip, and lighting gear from Photon's in-house list. Download the gear sheet — same kit our creative team uses on set.",
    speakableSummary:
      "Rent curated camera, grip, and lighting from Photon's in-house kit in Portland — the same gear our creative team shoots with. Download the gear list and spec sheet, then check availability.",
  })
  console.log('  ✓ rental-gear')

  await patch('notFoundPage', 'notFoundPage', {
    headline: 'Signal lost.',
    message: [
      block(
        'not-found-body',
        "Ground control can't find that page. It may have been moved, renamed, or jettisoned in a previous orbit.",
      ),
    ],
    ctaText: 'Back to mission control →',
    ctaLink: '/',
    secondaryCtaText: 'Browse the work →',
    secondaryCtaLink: '/work',
    footerTagline: 'Photon Studio — modular production for the future of content.',
  })

  const legalPages = [
    {
      _id: 'legalPage-privacy',
      pageType: 'privacy',
      title: 'Privacy Policy',
    },
    {
      _id: 'legalPage-terms',
      pageType: 'terms',
      title: 'Terms & Conditions',
      content: termsContent(),
    },
    {
      _id: 'legalPage-cookies',
      pageType: 'cookies',
      title: 'Cookie Policy',
    },
    {
      _id: 'legalPage-accessibility',
      pageType: 'accessibility',
      title: 'Accessibility Statement',
    },
  ]

  for (const legal of legalPages) {
    const {_id, pageType, title, content} = legal
    await client.createOrReplace({
      _id,
      _type: 'legalPage',
      pageType,
      title,
      contentSource: 'custom',
      slug: {_type: 'slug', current: LEGAL_SLUGS[pageType]},
      content: content || placeholderLegalContent(),
    })
    console.log(`  ✓ legalPage: ${title}`)
  }

  await patch('settings', 'settings', {
    siteName: 'Photon Studio',
    siteDescription:
      'A production studio for brands and agencies. Commercial video, stills, high-speed, based in Portland with a 6,000 sq ft studio with cyclorama and international reach.',
    socialLinks: {
      instagram: 'https://www.instagram.com/photonportland/',
      vimeo: 'https://vimeo.com/photonportland',
    },
    footer: [
      block('footer-name', 'Photon Studio'),
      block('footer-address', '726 SE 10th Ave, Portland, OR 97214'),
      block('footer-lisbon', 'Lisbon, Portugal'),
      block('footer-email', 'hello@photon.studio'),
    ],
    legalLinks: [
      {_key: 'privacy', _type: 'reference', _ref: 'legalPage-privacy'},
      {_key: 'terms', _type: 'reference', _ref: 'legalPage-terms'},
      {_key: 'cookies', _type: 'reference', _ref: 'legalPage-cookies'},
      {_key: 'accessibility', _type: 'reference', _ref: 'legalPage-accessibility'},
    ],
  })

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
