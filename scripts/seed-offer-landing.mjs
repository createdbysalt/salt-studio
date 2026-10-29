/**
 * Seed the "Leave it to us" offer landing page (landingPage document) into Sanity
 * (project jkqf2ng5 / production) at /leave-it-to-us.
 *
 * Copy follows the verified ledger in
 *   Salt Studio/Marketing/2026-09-22-createdbysalt-growth-results-content.md
 * Numbers that are not in the ledger are not used. Package prices are a DRAFT
 * proposal to confirm in Studio before the page ships.
 *
 * Stand-ins to replace in Studio: the hero video + poster (Salt project film),
 * the service row images (project covers), the founder photo (empty), the
 * client quotes (empty, section hides) and the results screenshots (empty).
 *
 * DRY RUN by default. COMMIT=1 to write.
 *   npx sanity exec scripts/seed-offer-landing.mjs --with-user-token
 *   COMMIT=1 npx sanity exec scripts/seed-offer-landing.mjs --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const COMMIT = process.env.COMMIT === '1'
const client = getCliClient({apiVersion: '2025-02-27'})

const DOC_ID = 'landing-leave-it-to-us'
const SLUG = 'leave-it-to-us'

let n = 0
const key = (prefix) => `${prefix}-${String(n++).padStart(2, '0')}`
const img = (ref, alt) =>
  ref ? {_type: 'image', asset: {_type: 'reference', _ref: ref}, alt} : undefined

// Project covers already in the content lake (used as stand-ins where noted).
const COVER = {
  oneYouth: 'image-fb09364feba4b3faefd0c2ee079c96cd6474d2af-1872x1080-jpg',
  viva: 'image-794b1bc6680bbfae833796c02628a9797883d670-1872x1080-jpg',
  mfi: 'image-8f77b916d8ec33e229e07c61910f446c2a7892cd-1872x1080-jpg',
  photon: 'image-aa1d136fcb405a41545ddeb869007cc2d8993ef0-3744x2160-jpg',
  playground: 'image-5302d6560a4957fbdbc7c7e1c850534a5245f454-1872x1080-jpg',
  cultivated: 'image-4231455d039a53b8d3737d5d6eb66a7feb375c15-1872x1080-jpg',
  senate: 'image-5680e35d2f66bed432db9ce54bfb9bcc936af914-1920x1080-jpg',
  education: 'image-21eb289b62a7957415d45ae22788d386e85d182e-1920x1080-jpg',
  salt: 'image-ddf5d7716070721fce7adb496cf067f0d1728aea-3744x2160-png',
}
const FILM = {
  salt: 'https://cdn.sanity.io/files/jkqf2ng5/production/2d4684cf69d4be7737f11be200f8bc52f9355c49.mp4',
  oneYouth:
    'https://cdn.sanity.io/files/jkqf2ng5/production/352da748ccceb363cc46a1ac5bdf7f487b471f1f.mp4',
  viva: 'https://cdn.sanity.io/files/jkqf2ng5/production/e2fc376ad59fcfe7f4d1431bf9551c1a827ac409.mp4',
  senate:
    'https://cdn.sanity.io/files/jkqf2ng5/production/8a4958fd42272c2a9808caf5e560990597adc951.mp4',
  education:
    'https://cdn.sanity.io/files/jkqf2ng5/production/52442a9182ba546366a8bc7cc7282777b2bc65d0.mp4',
}

const sections = [
  {
    _type: 'lpVideoHeroSection',
    _key: key('hero'),
    enabled: true,
    internalName: 'Video hero',
    videoUrl: FILM.salt, // stand-in: replace with the offer video
    poster: img(COVER.salt, 'Salt Studio'),
    posterTitle: 'First impression',
    headline: 'Marketing is a full-time job.\nYou already have one.',
    ctaText: 'Leave it to us.',
  },
  {
    _type: 'lpClientGridSection',
    _key: key('clients'),
    enabled: true,
    internalName: 'Client grid',
    title: 'Proud to have worked with:',
    clients: [
      {
        _type: 'lpClientTile',
        _key: key('c'),
        name: 'One Youth Conference',
        label: 'Youth conference, 2,000 attendees',
        image: img(COVER.oneYouth, 'One Youth Conference'),
      },
      {
        _type: 'lpClientTile',
        _key: key('c'),
        name: 'VIVA Church',
        label: 'Church, 31 years',
        image: img(COVER.viva, 'VIVA Church'),
      },
      {
        _type: 'lpClientTile',
        _key: key('c'),
        name: 'MFI Canada',
        label: 'National church network',
        image: img(COVER.mfi, 'MFI Canada'),
      },
      {
        _type: 'lpClientTile',
        _key: key('c'),
        name: 'Photon Studio',
        label: 'Creative studio',
        image: img(COVER.photon, 'Photon Studio'),
      },
      {
        _type: 'lpClientTile',
        _key: key('c'),
        name: 'Playground Studios',
        label: 'Production studio',
        image: img(COVER.playground, 'Playground Studios'),
      },
      {
        _type: 'lpClientTile',
        _key: key('c'),
        name: 'Lisa Trent',
        label: 'Personal brand',
        image: img(COVER.cultivated, 'Lisa Trent'),
      },
      {
        _type: 'lpClientTile',
        _key: key('c'),
        name: 'State senate campaign',
        label: 'Winning senate campaign',
        image: img(COVER.senate, 'State senate campaign'),
      },
      {
        _type: 'lpClientTile',
        _key: key('c'),
        name: 'Education lead generation',
        label: 'National education institution',
        image: img(COVER.education, 'Education lead generation'),
      },
      {_type: 'lpClientTile', _key: key('c'), name: 'Good Company', label: 'Church, New York City'},
    ],
    featuredLead: 'Campaigns covered by',
    featuredNames: 'Exame · Veja',
  },
  {
    _type: 'lpServicesListSection',
    _key: key('services'),
    enabled: true,
    internalName: 'Services list',
    label: 'Our services',
    showButton: true,
    items: [
      {
        _type: 'lpServiceRow',
        _key: key('s'),
        titleTop: 'Paid',
        titleBottom: 'media',
        blurb: 'Meta and Google ads run to cost per lead and payback, not impressions.',
        image: img(COVER.senate, 'Paid media'),
      },
      {
        _type: 'lpServiceRow',
        _key: key('s'),
        titleTop: 'Websites',
        titleBottom: 'that sell',
        blurb: 'Built around one action, and simple enough for your team to update.',
        image: img(COVER.viva, 'Websites'),
      },
      {
        _type: 'lpServiceRow',
        _key: key('s'),
        titleTop: 'AI',
        titleBottom: 'automations',
        blurb: 'Every lead answered in seconds, every follow-up sent without you.',
        image: img(COVER.salt, 'AI automations'),
      },
      {
        _type: 'lpServiceRow',
        _key: key('s'),
        titleTop: 'Content',
        titleBottom: '+ video',
        blurb: 'Short video and creative made for the ad, not just the feed.',
        image: img(COVER.oneYouth, 'Content and video'),
      },
    ],
  },
  {
    _type: 'lpStatementSection',
    _key: key('statement'),
    enabled: true,
    internalName: 'Statement band',
    text: 'Not just clicks. Customers.',
  },
  {
    _type: 'lpStatsSection',
    _key: key('stats'),
    enabled: true,
    internalName: 'Big numbers',
    stats: [
      {_type: 'lpStat', _key: key('n'), value: '$3.6M', label: 'paid media managed'},
      {_type: 'lpStat', _key: key('n'), value: '70+', label: 'clients since 2021'},
      {_type: 'lpStat', _key: key('n'), value: '$10M', label: 'revenue and contracts driven'},
    ],
  },
  {
    _type: 'lpBeforeAfterSection',
    _key: key('beforeafter'),
    enabled: true,
    internalName: 'Before / after',
    rows: [
      {
        _type: 'lpBeforeAfterRow',
        _key: key('r'),
        name: 'National education institution',
        metric: 'cost per lead',
        before: '$35',
        after: '$25',
        caption: 'Volume held at 1,500 to 2,000 leads a month, in one quarterly cycle',
      },
      {
        _type: 'lpBeforeAfterRow',
        _key: key('r'),
        name: 'Futsummit 2021',
        metric: 'profit from the product ladder',
        before: 'Funnel from zero',
        after: '$300K',
        caption:
          'The largest online soccer summit in Brazil, built on a free registration with a paid ladder behind it',
      },
      {
        _type: 'lpBeforeAfterRow',
        _key: key('r'),
        name: 'VIVA Church',
        metric: 'new visitors from the web',
        before: 'Old site',
        after: '+415%',
        caption: 'A new name and a site built around Plan a Visit',
      },
      {
        _type: 'lpBeforeAfterRow',
        _key: key('r'),
        name: 'Creator course launch',
        metric: 'return on the funnel',
        before: 'From zero',
        after: '10x ROI',
        caption: 'A course for moms starting a home business',
      },
    ],
  },
  {
    _type: 'lpReelsSection',
    _key: key('reels'),
    enabled: true,
    internalName: 'Video tiles',
    buttonLabel: 'Watch more',
    buttonHref: '/work',
    items: [
      {
        _type: 'lpReelTile',
        _key: key('v'),
        videoUrl: FILM.oneYouth,
        poster: img(COVER.oneYouth, 'One Youth Conference'),
        badge: '2,000 attendees',
        href: '/projects/one-youth-conference',
      },
      {
        _type: 'lpReelTile',
        _key: key('v'),
        videoUrl: FILM.viva,
        poster: img(COVER.viva, 'VIVA Church'),
        badge: '+415% web visitors',
        href: '/projects/viva-church',
      },
      {
        _type: 'lpReelTile',
        _key: key('v'),
        videoUrl: FILM.senate,
        poster: img(COVER.senate, 'State senate campaign'),
        badge: 'Winning campaign',
        href: '/projects/senate-campaign',
      },
      {
        _type: 'lpReelTile',
        _key: key('v'),
        videoUrl: FILM.education,
        poster: img(COVER.education, 'Education lead generation'),
        badge: '$35 to $25 per lead',
        href: '/projects/education-lead-generation',
      },
    ],
  },
  {
    _type: 'lpFounderSection',
    _key: key('founder'),
    enabled: true,
    internalName: 'Meet the founder',
    heading: 'Meet the founder',
    bio: [
      "Hi, I'm Matt. I've run paid media since 2018: $3.6M across North America, South America and Europe, from a 36-person agency team in Brazil, to two winning senate campaigns, to the churches and small businesses we serve today.",
      "Salt Studio is the studio I run with Gabi, who designs and builds everything you see. Since 2021 we've shipped work for 70+ clients, and every account gets run to the numbers that matter: cost per lead, payback, and what actually came in the door.",
      "You have a business to run. We'll run the marketing like it's ours, and show you the numbers every month.",
    ].join('\n\n'),
  },
  {
    _type: 'lpQuotesSection',
    _key: key('quotes'),
    enabled: true,
    internalName: 'Client quotes',
    quotes: [], // hidden until real quotes exist
  },
  {
    _type: 'lpPackagesSection',
    _key: key('packages'),
    enabled: true,
    internalName: 'Packages',
    label: 'Our packages',
    packages: [
      {
        _type: 'lpPackage',
        _key: key('p'),
        name: 'Get found',
        description:
          'Google Ads, run properly, so the people already searching for what you do find you first.',
        features: [
          'Google Ads: search + remarketing',
          'Landing page built to convert',
          'Tracking set up and verified',
          'Monthly report + strategy call',
        ],
        price: '$2,500/mo',
        note: 'Ad spend billed separately',
      },
      {
        _type: 'lpPackage',
        _key: key('p'),
        name: 'Get leads',
        description:
          'Meta + Google, 8 new creatives a month, and the Get Booked Funnel that turns clicks into calls.',
        features: [
          'Everything in Get found, plus Meta ads',
          '8 creatives a month: 4 high-quality videos + 4 ads',
          'The Get Booked Funnel: ad, landing page, booked call',
          'Email + SMS follow-up on every lead',
          'Leads tracked into your CRM',
          'Biweekly strategy calls + reports',
        ],
        price: '$3,500/mo',
        note: 'Ad spend billed separately',
      },
      {
        _type: 'lpPackage',
        _key: key('p'),
        name: 'Get sold',
        description:
          'The whole client acquisition machine: 20 creatives a month and the Get Sold Out Funnel, from first click to signed client.',
        features: [
          'Everything in Get leads',
          '20 creatives a month: 12 high-quality videos + 8 ads',
          'The Get Sold Out Funnel: retargeting, nurture and booking, start to close',
          'AI automations: reply in seconds, human in minutes',
          'Website updates and new pages as you need them',
          'Weekly optimization + monthly business review',
        ],
        price: '$5,000/mo',
        note: 'Ad spend billed separately',
      },
    ],
  },
  {
    _type: 'lpResultsGallerySection',
    _key: key('results'),
    enabled: true,
    internalName: 'Results gallery',
    headline: 'Want results like this?',
    images: [], // add real dashboard screenshots in Studio
    showButton: true,
  },
  {
    _type: 'lpFaqSection',
    _key: key('faq'),
    enabled: true,
    internalName: 'FAQ',
    faq: {
      _type: 'faq',
      title: 'FAQs',
      style: 'list',
      items: [
        {
          _type: 'faqItem',
          _key: key('q'),
          question: 'Which package is right for me?',
          answer:
            "We figure it out together on the call. Get found is Google Ads for people already searching for what you do. Get leads adds Meta, 8 creatives a month and the Get Booked Funnel, so clicks turn into calls. Get sold is the whole acquisition machine: 20 creatives a month, the Get Sold Out Funnel, and automations that answer every lead. Not sure where you fall? Book a call and we'll tell you honestly.",
        },
        {
          _type: 'faqItem',
          _key: key('q'),
          question: 'Who makes the ads and the content?',
          answer:
            "Both of us. You're the face of the business and you know the customer. We write the hooks and scripts, edit the video, design the creative, build the pages and run the campaigns. If you can film a few minutes on your phone each month, we can do the rest.",
        },
        {
          _type: 'faqItem',
          _key: key('q'),
          question: 'What kind of businesses do you work with?',
          answer:
            "Service businesses, churches and ministries, and founders with something real to sell: coaches, clinics, contractors, schools, local brands. If you measure to cost per lead and payback rather than likes, we'll get along. We're not a fit for brand-new influencers or anyone looking for cheap reach.",
        },
        {
          _type: 'faqItem',
          _key: key('q'),
          question: 'Is there a minimum commitment?',
          answer:
            "Three months to start. Ads need a few weeks of data before they get good, and we'd rather earn month four than lock you in. After that it's month to month, cancel anytime. Ad spend is paid to the platforms directly, by you.",
        },
        {
          _type: 'faqItem',
          _key: key('q'),
          question: 'What makes Salt different?',
          answer:
            "We don't post and hope. Every campaign has a number it has to hit, tracking that proves it, and a report you can read in five minutes. You get a strategist, a media buyer, a designer and a developer on one account for less than a single in-house hire. And if you ever leave, the accounts, the site and the data stay yours.",
        },
      ],
    },
  },
]

const doc = {
  _id: DOC_ID,
  _type: 'landingPage',
  title: 'Leave it to us (offer page)',
  slug: {_type: 'slug', current: SLUG},
  audience: 'businesses',
  ctaLabel: 'Book a call',
  ctaLink: 'https://cal.com/createdbysalt/discovery',
  ctaSubhead: 'Free, 15 minutes, no pressure.',
  hideNav: true,
  stickyMobileCta: true,
  seoTitle: 'Marketing, done for you',
  seoDescription:
    'Paid media, websites, AI automations and video, run by one team to cost per lead and payback. Three monthly plans. Book a free 15-minute call.',
  speakableSummary:
    'Salt Studio runs paid media, websites, AI automations and video for small businesses and churches on three monthly plans, measured to cost per lead and payback.',
  offers: [
    {
      _type: 'lpOffer',
      _key: key('o'),
      name: 'Get found',
      price: 2500,
      billing: 'monthly',
      description: 'Google Ads, landing page, tracking, monthly report.',
    },
    {
      _type: 'lpOffer',
      _key: key('o'),
      name: 'Get leads',
      price: 3500,
      billing: 'monthly',
      description:
        'Meta and Google ads, 8 creatives a month, the Get Booked Funnel, email and SMS follow-up, CRM tracking.',
    },
    {
      _type: 'lpOffer',
      _key: key('o'),
      name: 'Get sold',
      price: 5000,
      billing: 'monthly',
      description:
        '20 creatives a month, the Get Sold Out Funnel, AI automations, site updates and weekly optimization.',
    },
  ],
  sections,
}

if (!COMMIT) {
  console.log(
    'DRY RUN. Would createOrReplace:',
    DOC_ID,
    `(/${SLUG})`,
    `${sections.length} sections`,
  )
  console.log(JSON.stringify(doc, null, 1).slice(0, 1200) + '\n…')
  process.exit(0)
}

const result = await client.createOrReplace(doc)
console.log('Wrote', result._id, `→ /${SLUG}`)
