/**
 * Seed the approved site copy into Sanity (project jkqf2ng5 / production).
 *
 * Source of truth: salt-studio-knowledge-base/studio/website/copy/*.md
 * (2026-07-26, conversion-reviewed). What gets written:
 *
 *   PUBLISHED  clients ×5 · CTA ×1 · services ×3 · home · workPage · contactPage
 *              · servicesPage · settings (patched, not replaced)
 *   DRAFTS     project ×5 (case studies — STATUS: HOLD until launches/permissions)
 *              · page "About" (BLOCKED on [GABRIELLA] founder beats)
 *
 * Gated facts are NOT invented: bookingQuarter, recommendationDays, calLink and
 * cityTimezone are left empty (their lines hide on the site until filled), and
 * [GABRIELLA]/[PERMISSION]/[VERIFY]/[UPDATE] markers stay in draft text as
 * visible pre-publish gates. Never publish the drafts from this script.
 *
 * DRY RUN by default. COMMIT=1 to write.
 *   npx sanity exec scripts/seed-site-copy.mjs --with-user-token
 *   COMMIT=1 npx sanity exec scripts/seed-site-copy.mjs --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const COMMIT = process.env.COMMIT === '1'
const c = getCliClient({apiVersion: '2025-02-27'})

// --- helpers ---------------------------------------------------------------
const slugFld = (current) => ({_type: 'slug', current})
const ref = (id) => ({_type: 'reference', _ref: id})
const keyedRef = (id) => ({_type: 'reference', _ref: id, _key: id})

/** One portable-text block. Deterministic _key from a prefix + counter. */
let blockN = 0
const block = (text, style = 'normal') => ({
  _type: 'block',
  _key: `b${String(blockN++).padStart(3, '0')}`,
  style,
  markDefs: [],
  children: [{_type: 'span', _key: 's0', text, marks: []}],
})
const paragraphs = (texts) => texts.map((t) => block(t))

// --- clients (published — power the homepage proof strip) -------------------
const CLIENTS = [
  {id: 'client-cultivated', name: 'Cultivated', slug: 'cultivated', sortOrder: 1},
  {
    id: 'client-enjoy-life-church',
    name: 'Enjoy Life Church',
    slug: 'enjoy-life-church',
    sortOrder: 2,
  },
  {id: 'client-mfi-canada', name: 'MFI Canada', slug: 'mfi-canada', sortOrder: 3},
  {
    id: 'client-crossroads-life-church',
    name: 'Crossroads Life Church',
    slug: 'crossroads-life-church',
    sortOrder: 4,
  },
  {id: 'client-photon-studio', name: 'Photon Studio', slug: 'photon-studio', sortOrder: 5},
]
const clientDocs = CLIENTS.map((cl) => ({
  _id: cl.id,
  _type: 'client',
  name: cl.name,
  slug: slugFld(cl.slug),
  tier: 'less-known',
  sortOrder: cl.sortOrder,
}))

// --- work categories (published — /work filter pills + landing pages) -------
// Service-type taxonomy per Gabriella (2026-07-27). "All Work" is the built-in
// first pill (the Work page headline), not a category doc. Design work routes
// by intent: identity-level → Brand & Identity, marketing-facing creative →
// Content & Marketing (Design & Creative was merged away, 2026-07-27).
// AI & Automation (the flagship) starts empty — fills as AI builds publish.
const WORK_CATEGORIES = [
  {id: 'workCategory-brand-identity', label: 'Brand & Identity', slug: 'brand-identity'},
  {id: 'workCategory-content-marketing', label: 'Content & Marketing', slug: 'content-marketing'},
  {id: 'workCategory-web-software', label: 'Web & Software', slug: 'web-software'},
  {id: 'workCategory-ai-automation', label: 'AI & Automation', slug: 'ai-automation'},
]
const workCategoryDocs = WORK_CATEGORIES.map((cat) => ({
  _id: cat.id,
  _type: 'workCategory',
  filterLabel: cat.label,
  slug: slugFld(cat.slug),
}))

// --- capabilities (published — verified from the actual project repos, -------
// 2026-07-27: salt-studio-projects/in-production/* + live/mfi-canada, plus the
// Claude-based agent infrastructure in hermes-salt-studio). Headline items
// only — dev hygiene (eslint, prettier, husky) is not a capability. Design
// tools (Figma etc.) to be added by Gabriella/designer where we'd be guessing.
const CAT = {
  web: 'workCategory-web-software',
  content: 'workCategory-content-marketing',
  brand: 'workCategory-brand-identity',
  ai: 'workCategory-ai-automation',
}
const CAPABILITIES = [
  // Languages
  {
    id: 'capability-typescript',
    name: 'TypeScript',
    kind: 'language',
    cats: [CAT.web],
    url: 'https://www.typescriptlang.org',
  },
  {id: 'capability-javascript', name: 'JavaScript', kind: 'language', cats: [CAT.web]},
  // Frameworks / libraries
  {
    id: 'capability-nextjs',
    name: 'Next.js',
    kind: 'framework',
    cats: [CAT.web],
    url: 'https://nextjs.org',
  },
  {
    id: 'capability-react',
    name: 'React',
    kind: 'framework',
    cats: [CAT.web],
    url: 'https://react.dev',
  },
  {
    id: 'capability-tailwind',
    name: 'Tailwind CSS',
    kind: 'framework',
    cats: [CAT.web],
    url: 'https://tailwindcss.com',
  },
  {
    id: 'capability-framer-motion',
    name: 'Framer Motion',
    kind: 'framework',
    cats: [CAT.web],
    url: 'https://motion.dev',
  },
  {
    id: 'capability-gsap',
    name: 'GSAP',
    kind: 'framework',
    cats: [CAT.web],
    url: 'https://gsap.com',
  },
  {
    id: 'capability-shadcn',
    name: 'shadcn/ui',
    kind: 'framework',
    cats: [CAT.web],
    url: 'https://ui.shadcn.com',
  },
  // Platforms / services
  {
    id: 'capability-sanity',
    name: 'Sanity',
    kind: 'platform',
    cats: [CAT.web, CAT.content],
    url: 'https://www.sanity.io',
  },
  {
    id: 'capability-supabase',
    name: 'Supabase',
    kind: 'platform',
    cats: [CAT.web],
    url: 'https://supabase.com',
  },
  {
    id: 'capability-vercel',
    name: 'Vercel',
    kind: 'platform',
    cats: [CAT.web],
    url: 'https://vercel.com',
  },
  {
    id: 'capability-nodejs',
    name: 'Node.js',
    kind: 'platform',
    cats: [CAT.web],
    url: 'https://nodejs.org',
  },
  {
    id: 'capability-resend',
    name: 'Resend',
    kind: 'platform',
    cats: [CAT.web, CAT.content],
    url: 'https://resend.com',
  },
  {
    id: 'capability-mapbox',
    name: 'Mapbox',
    kind: 'platform',
    cats: [CAT.web],
    url: 'https://www.mapbox.com',
  },
  {
    id: 'capability-claude',
    name: 'Claude (Anthropic)',
    kind: 'platform',
    cats: [CAT.ai],
    url: 'https://www.anthropic.com',
  },
  // Tools
  {
    id: 'capability-playwright',
    name: 'Playwright',
    kind: 'tool',
    cats: [CAT.web],
    url: 'https://playwright.dev',
  },
]
const capabilityDocs = CAPABILITIES.map((cap) => ({
  _id: cap.id,
  _type: 'capability',
  name: cap.name,
  kind: cap.kind,
  categories: cap.cats.map(keyedRef),
  ...(cap.url ? {url: cap.url} : {}),
  sortOrder: 0,
}))

// The shared stack every Salt site build ships on (verified per repo).
const SITE_STACK = [
  'capability-nextjs',
  'capability-react',
  'capability-typescript',
  'capability-tailwind',
  'capability-sanity',
  'capability-framer-motion',
  'capability-resend',
  'capability-vercel',
]

// --- CTA library (published) -----------------------------------------------
const ctaDoc = {
  _id: 'cta-book-discovery-call',
  _type: 'callToAction',
  title: 'Primary — Book a discovery call',
  buttonLabel: 'Book a discovery call',
  link: '/contact',
}

const deliverable = (key, title, detail) => ({
  _type: 'serviceDeliverable',
  _key: key,
  title,
  detail,
})
const serviceStep = (key, text, lead) => ({
  _type: 'serviceDetailStep',
  _key: key,
  ...(lead ? {lead} : {}),
  text,
})
const timelinePhase = (key, label, duration, detail) => ({
  _type: 'serviceTimelinePhase',
  _key: key,
  label,
  duration,
  ...(detail ? {detail} : {}),
})

// --- Services (published) — homepage How we can help + detail panel --------
const serviceDocs = [
  {
    _id: 'service-ai-builds',
    _type: 'service',
    title: 'AI builds',
    slug: slugFld('ai-builds'),
    headline: 'AI, built around you',
    shortDescription:
      'Custom AI tools built around how your organization actually works — assistants that know your content, answer your people, and carry your voice.',
    priceLine: 'Pilots from $15,000 · full builds from $75,000',
    timelineLine: 'Pilot in weeks · full build by milestone',
    linkLabel: 'See how it works',
    sortOrder: 1,
    timeline: [
      timelinePhase(
        'ai-t1',
        'Pilot',
        '2–4 weeks',
        'Bounded assessment on your real content, with success criteria agreed up front.',
      ),
      timelinePhase(
        'ai-t2',
        'Build',
        'By milestone',
        'Fixed scope, milestone billing, a hard end date.',
      ),
      timelinePhase(
        'ai-t3',
        'Handoff',
        '1 week',
        'Training, admin access, and ownership — your data, your accounts, your tool.',
      ),
    ],
    detailEyebrow: 'How it works',
    detailBody:
      'Custom AI tools for organizations with a mission — assistants that know your content, answer your people, and carry your voice. Not a chatbot bolted on. A tool built around how your organization actually works.\n\nWe take one build at a time. Fixed scope, clear milestones, a hard timeline — so you always know where things stand.',
    sceneLine:
      'Monday morning: thirty questions came in overnight. All answered, in your voice, with your actual information. Your team reads coffee-in-hand instead of triaging.',
    stepsLabel: 'How it works',
    steps: [
      serviceStep(
        'ai-step-1',
        'A bounded assessment on your real content, with success criteria we agree on before we start. Enough for a board to approve without a leap of faith.',
        'Pilot first.',
      ),
      serviceStep(
        'ai-step-2',
        'Fixed scope, milestone billing, a hard timeline.',
        'Then the build.',
      ),
      serviceStep('ai-step-3', 'Your data, your accounts, your tool.', 'Then it’s yours.'),
    ],
    deliverables: [
      deliverable(
        'ai-d1',
        'Scoped AI pilot',
        'Working proof on your real content, with success criteria written down before we start.',
      ),
      deliverable(
        'ai-d2',
        'Production assistant or tool',
        'Built around your workflows — not a generic chatbot skin.',
      ),
      deliverable(
        'ai-d3',
        'Knowledge connected to your content',
        'Grounded answers from the sources your organization already trusts.',
      ),
      deliverable(
        'ai-d4',
        'Admin handoff & training',
        'Your team can run it — accounts, data, and ownership stay with you.',
      ),
      deliverable(
        'ai-d5',
        'Milestone plan & timeline',
        'Fixed scope, visible checkpoints, no open-ended build.',
      ),
    ],
    capabilities: [
      'capability-openai',
      'capability-claude',
      'capability-ai-sdk',
      'capability-mcp',
      'capability-hermes',
      'capability-nextjs',
      'capability-sanity',
      'capability-typescript',
      'capability-python',
      'capability-supabase',
    ].map(keyedRef),
    workCategories: [keyedRef('workCategory-ai-automation')],
    idealFor: [
      'Your organization has a mission — and real content people ask about every day',
      'You’d rather prove it works with a pilot than bet the budget on a promise',
      'You want fixed scope, clear milestones, and one build at a time',
    ],
    notAFit: [
      'You need an open-ended R&D engagement with no success criteria',
      'You want a generic off-the-shelf chatbot with a logo slap',
      'You’re looking for an agency of record to staff a standing AI team',
    ],
    featuredProjects: [keyedRef('project-mfi-canada')],
    clients: [keyedRef('client-mfi-canada')],
    proofAnchor:
      'Built alongside our work with churches, ministries, and small teams — organizations with real content and real questions.',
    nextStep: ref('cta-book-discovery-call'),
  },
  {
    _id: 'service-salt-site',
    _type: 'service',
    title: 'The Salt site',
    slug: slugFld('the-salt-site'),
    headline: 'The Salt site',
    shortDescription:
      'A complete website — brand, copy, design, build — delivered in weeks, not months. One fixed investment, built closely with the one person who can say yes.',
    priceLine: 'From $5,500 · a limited number each year',
    timelineLine: 'Delivered in weeks, not months',
    linkLabel: 'See how it works',
    sortOrder: 2,
    timeline: [
      timelinePhase(
        'site-t1',
        'Kickoff & scope',
        'Week 1',
        'Scope written down, launch week locked, your time commitment listed in hours.',
      ),
      timelinePhase(
        'site-t2',
        'Brand, copy & design',
        '2–4 weeks',
        'Direction, writing, and design in one focused pass — not an endless loop.',
      ),
      timelinePhase(
        'site-t3',
        'Build & launch',
        '2–3 weeks',
        'Build, CMS handoff, analytics, and a known launch week.',
      ),
    ],
    detailEyebrow: 'How it works',
    detailBody:
      'A complete website — brand, copy, design, build — delivered in weeks, not months. One fixed investment, one focused process, built closely with the one person who can say yes.\n\nWe run the project. Your total time commitment is listed in hours, up front. You’ll know the launch week before you sign.',
    stepsLabel: 'The deal, plainly',
    steps: [
      serviceStep(
        'site-step-1',
        'Scope is written down before we start. New ideas go to a parked list you can buy later — the price you signed is the price.',
      ),
      serviceStep('site-step-2', 'You’ll know the launch week before you sign.'),
      serviceStep(
        'site-step-3',
        'We run the project. Your total time commitment is listed in hours, up front.',
      ),
    ],
    deliverables: [
      deliverable(
        'site-d1',
        'Brand direction',
        'Visual identity and voice that fit the organization — not a template skin.',
      ),
      deliverable(
        'site-d2',
        'Site copy',
        'Clear, conversion-minded writing that says what you do and who it’s for.',
      ),
      deliverable(
        'site-d3',
        'Design & build',
        'A fast, modern site on a stack you can keep — typically Next.js + Sanity.',
      ),
      deliverable(
        'site-d4',
        'CMS handoff',
        'Editable content without a developer for every change.',
      ),
      deliverable(
        'site-d5',
        'Launch-ready analytics',
        'Tracking set up so you can see what the site is actually doing.',
      ),
    ],
    capabilities: [
      'capability-brand-strategy',
      'capability-visual-identity',
      'capability-copywriting',
      'capability-content-strategy',
      'capability-figma',
      'capability-nextjs',
      'capability-sanity',
      'capability-tailwind',
      'capability-typescript',
      'capability-seo-aeo',
      'capability-conversion-design',
      'capability-vercel',
    ].map(keyedRef),
    workCategories: [
      keyedRef('workCategory-web-software'),
      keyedRef('workCategory-brand-identity'),
    ],
    idealFor: [
      'One person who can say yes — websites are single-decision-maker by design',
      'You want a fixed scope, a visible price, and a known launch week',
      'You’re ready for a complete site, not an endless redesign loop',
    ],
    notAFit: [
      'The scope needs to stay open while we build',
      'Decisions run through a committee',
      'You need an agency of record — we take a few projects a year, and give them everything',
    ],
    featuredProjects: [
      keyedRef('project-crossroads-life-church'),
      keyedRef('project-cultivated'),
      keyedRef('project-photon-studio'),
    ],
    clients: [
      keyedRef('client-crossroads-life-church'),
      keyedRef('client-cultivated'),
      keyedRef('client-photon-studio'),
      keyedRef('client-enjoy-life-church'),
    ],
    nextStep: ref('cta-book-discovery-call'),
  },
  {
    _id: 'service-site-care',
    _type: 'service',
    title: 'Site care',
    slug: slugFld('site-care'),
    headline: 'Site care',
    shortDescription:
      'For the sites we’ve built: fast, secure, and cared for — so you never think about them.',
    priceLine: 'From $100/month',
    timelineLine: 'Ongoing, month to month',
    linkLabel: 'See how it works',
    sortOrder: 3,
    timeline: [
      timelinePhase(
        'care-t1',
        'Onboarding',
        'First week',
        'Access, monitoring, and a clear picture of what’s covered.',
      ),
      timelinePhase(
        'care-t2',
        'Ongoing care',
        'Month to month',
        'Updates, performance, security — so you never think about the site.',
      ),
      timelinePhase(
        'care-t3',
        'Exit (anytime)',
        'Free',
        'You take everything with you. No ransom, no lock-in.',
      ),
    ],
    detailEyebrow: 'How it works',
    detailBody:
      'For the sites we’ve built: we keep them fast, secure, and cared for — so you never think about them.\n\nAnd if you ever want to leave, you take everything with you. Free. That’s the deal.',
    stepsLabel: 'What’s covered',
    steps: [
      serviceStep(
        'care-step-1',
        'Performance watched and tended — so the site stays as quick as the day it launched.',
        'Keep it fast.',
      ),
      serviceStep(
        'care-step-2',
        'Updates, monitoring, and the unglamorous work that keeps things from breaking.',
        'Keep it secure.',
      ),
      serviceStep(
        'care-step-3',
        'If you ever want out, you take everything with you. No ransom, no lock-in.',
        'Leave free.',
      ),
    ],
    deliverables: [
      deliverable('care-d1', 'Hosting & upkeep', 'The site stays online, updated, and watched.'),
      deliverable(
        'care-d2',
        'Security & dependency updates',
        'The boring maintenance that prevents expensive surprises.',
      ),
      deliverable(
        'care-d3',
        'Performance check-ins',
        'We notice when things slow down — before your visitors do.',
      ),
      deliverable(
        'care-d4',
        'Content help when you need it',
        'Light edits and guidance so you’re never stuck in the CMS alone.',
      ),
      deliverable('care-d5', 'Clean exit, anytime', 'You own the site. Leaving costs nothing.'),
    ],
    capabilities: [
      'capability-vercel',
      'capability-sanity',
      'capability-nextjs',
      'capability-ga4',
      'capability-gtm',
      'capability-resend',
    ].map(keyedRef),
    workCategories: [keyedRef('workCategory-web-software')],
    idealFor: [
      'You already have a Salt-built site (or one we’re about to launch)',
      'You want the site cared for without thinking about it every month',
      'You value an exit that’s free and clean',
    ],
    notAFit: [
      'You’re looking for a cold entry point — care is for sites we’ve built',
      'You need a full retainer agency for ongoing marketing campaigns',
      'You want us to maintain a site we didn’t build without a conversation first',
    ],
    featuredProjects: [
      keyedRef('project-crossroads-life-church'),
      keyedRef('project-cultivated'),
      keyedRef('project-enjoy-life-church'),
    ],
    clients: [
      keyedRef('client-crossroads-life-church'),
      keyedRef('client-cultivated'),
      keyedRef('client-enjoy-life-church'),
    ],
    routingLine:
      'Have a site that needs a caretaker? Worth asking on the call — sometimes the answer is yes.',
  },
]

// --- home (published) — homepage.md ----------------------------------------
const homeDoc = {
  _id: 'home',
  _type: 'home',
  sections: [
    {
      // §1 Hero (bookingQuarter deliberately unset — only fill with a true quarter)
      _type: 'homeHeroSection',
      _key: 'hero',
      enabled: true,
      internalName: 'Hero',
      headline: 'AI assistants and refined websites for organizations with a mission.',
      swapLine: 'Salt doesn’t overpower. It draws out what’s already there.',
      subheadline:
        'We build tools that know your content, answer your people, and carry your voice — and the digital spaces to match.',
      ctaLabel: 'Book a discovery call',
      ctaMicrocopy: '30 minutes. You leave with a clear next step — either way.',
    },
    {
      // §2 Proof strip
      _type: 'homeProofSection',
      _key: 'proof',
      enabled: true,
      internalName: 'Proof Strip',
      label: 'Recent work with',
      clients: CLIENTS.map((cl) => keyedRef(cl.id)),
    },
    {
      // §3 Services triad
      _type: 'homeServicesSection',
      _key: 'services',
      enabled: true,
      internalName: 'Services Triad',
      label: 'How we can help',
      services: [
        {_type: 'reference', _ref: 'service-ai-builds', _key: 'svc-ai'},
        {_type: 'reference', _ref: 'service-salt-site', _key: 'svc-site'},
        {_type: 'reference', _ref: 'service-site-care', _key: 'svc-care'},
      ],
    },
    {
      // §4 Selected work teaser — projects stay empty until case studies publish
      // (a published doc must not strong-reference drafts).
      _type: 'homeWorkSection',
      _key: 'work',
      enabled: true,
      internalName: 'Selected Work',
      label: 'Selected work',
      linkLabel: 'All work',
    },
    {
      // §5 Salt product flag
      _type: 'homeProductSection',
      _key: 'product',
      enabled: true,
      internalName: 'Salt Product',
      headline: 'What we’re building',
      body: 'The studio runs on software we’re building ourselves — Salt, a tool that handles the gathering and drafting so small teams can do the meaningful part. It’s how we work. Soon it’s how you’ll work.',
      ctaLabel: 'Join the waitlist',
    },
    {
      // §6 Philosophy interlude
      _type: 'homePhilosophySection',
      _key: 'philosophy',
      enabled: true,
      internalName: 'Philosophy',
      line1: 'Subtle. Essential. Transformative.',
      line2: 'We draw out the good that’s already there.',
    },
    {
      // §7 Final CTA
      _type: 'homeFinalCtaSection',
      _key: 'final-cta',
      enabled: true,
      internalName: 'Final CTA',
      headline: 'One build at a time.',
      body: 'We take on a few projects a year and give them everything. If you’re carrying a mission and your tools aren’t carrying their weight — let’s talk.',
      ctaLabel: 'Book a discovery call',
      emailLine: 'hello@createdbysalt.com if calls aren’t your thing.',
    },
  ],
  // Search & sharing
  seoTitle: 'Salt Studio',
  seoDescription: 'AI assistants and refined websites for organizations with a mission.',
  speakableSummary:
    'Salt Studio builds AI assistants and refined websites for organizations with a mission.',
}

// --- workPage (published) — work.md §1 --------------------------------------
const workPageDoc = {
  _id: 'workPage',
  _type: 'workPage',
  headline: 'Selected work',
  subhead: 'A few projects a year, taken seriously. Here’s what that looks like.',
}

// --- contactPage (published) — contact.md -----------------------------------
const contactPageDoc = {
  _id: 'contactPage',
  _type: 'contactPage',
  sections: [
    {
      _type: 'contactHeroSection',
      _key: 'hero',
      enabled: true,
      internalName: 'Hero',
      headline: 'Book a discovery call',
      lead: 'Bring the problem — you don’t need a spec, a brief, or a budget document.',
    },
    {
      // calLink deliberately unset — the embed hides until the Cal.com link exists
      _type: 'contactBookingSection',
      _key: 'booking',
      enabled: true,
      internalName: 'Calendar Booking',
    },
    {
      // recommendationDays deliberately unset — the "within X days" phrase hides until filled
      _type: 'contactCallDetailsSection',
      _key: 'call-details',
      enabled: true,
      internalName: 'What Happens on the Call',
      label: 'How it works',
      bullets: [
        {
          _type: 'callDetailBullet',
          _key: 'cd1',
          lead: '30 minutes, with the person who’d do the work.',
          text: 'Not a sales rep — there isn’t one.',
        },
        {
          _type: 'callDetailBullet',
          _key: 'cd2',
          lead: 'A diagnosis, not a pitch.',
          text: 'We’ll figure out together whether this fits. If it doesn’t, we’ll say so on the call.',
        },
        {
          _type: 'callDetailBullet',
          _key: 'cd3',
          lead: 'A written recommendation.',
          text: 'What we’d build, the investment, the timeline — or the honest “you don’t need us for this.”',
        },
      ],
    },
    {
      _type: 'contactFormSection',
      _key: 'form',
      enabled: true,
      internalName: 'Contact Form',
      formConfig: {
        _type: 'contactForm',
        title: 'Calls aren’t your thing?',
        description: 'Tell us about your project — we respond within 48 hours.',
        fields: [
          {
            _type: 'formField',
            _key: 'f-name',
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true,
          },
          {
            _type: 'formField',
            _key: 'f-email',
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true,
          },
          {
            _type: 'formField',
            _key: 'f-org',
            name: 'organization',
            label: 'Organization',
            type: 'text',
            required: false,
          },
          {
            _type: 'formField',
            _key: 'f-project',
            name: 'project',
            label: 'What are you hoping to build?',
            type: 'textarea',
            required: true,
          },
          {
            _type: 'formField',
            _key: 'f-range',
            name: 'investmentRange',
            label: 'Rough investment range',
            type: 'select',
            required: false,
            options: [
              'Under $5,500',
              '$5,500–15,000',
              '$15,000–75,000',
              '$75,000+',
              'Not sure yet',
            ],
          },
          {
            _type: 'formField',
            _key: 'f-decision',
            name: 'decisionMakers',
            label: 'Who else is part of this decision?',
            type: 'text',
            required: false,
          },
        ],
        submitLabel: 'Send it',
        successMessage: 'Got it — you’ll hear from us within 48 hours, from a human.',
        style: 'stacked',
      },
    },
    {
      // cityTimezone deliberately unset — decide what to make public first
      _type: 'contactFooterSection',
      _key: 'footer',
      enabled: true,
      internalName: 'Practical Footer',
      email: 'hello@createdbysalt.com',
      responseLine: 'We respond within 48 hours, usually faster.',
    },
  ],
}

// --- servicesPage (published) — services.md ---------------------------------
const servicesPageDoc = {
  _id: 'servicesPage',
  _type: 'servicesPage',
  sections: [
    {
      _type: 'servicesHeroSection',
      _key: 'hero',
      enabled: true,
      internalName: 'Hero',
      headline: 'What we build, and what it costs.',
      subheadline:
        'Three ways of working. Fixed scopes, visible prices, one build at a time. If the fit isn’t right, this page will tell you before a call has to.',
    },
    {
      _type: 'servicesListSection',
      _key: 'services',
      enabled: true,
      internalName: 'Services',
      serviceAi: {
        _type: 'serviceBlock',
        headline: 'AI, built around you',
        body: 'Custom AI tools for organizations with a mission — assistants that know your content, answer your people, and carry your voice. Not a chatbot bolted on. A tool built around how your organization actually works.\n\nWe take one build at a time. Fixed scope, clear milestones, a hard timeline — so you always know where things stand.',
        stepsLabel: 'How it works',
        steps: [
          {
            _type: 'serviceStep',
            _key: 'ai1',
            lead: 'Pilot first.',
            text: 'A bounded assessment on your real content, with success criteria we agree on before we start. Enough for a board to approve without a leap of faith.',
          },
          {
            _type: 'serviceStep',
            _key: 'ai2',
            lead: 'Then the build.',
            text: 'Fixed scope, milestone billing, a hard timeline.',
          },
          {
            _type: 'serviceStep',
            _key: 'ai3',
            lead: 'Then it’s yours.',
            text: 'Your data, your accounts, your tool.',
          },
        ],
        investmentLine: 'pilots from $15,000 · full builds from $75,000',
        sceneLine:
          'Monday morning: thirty questions came in overnight. All answered, in your voice, with your actual information. Your team reads coffee-in-hand instead of triaging.',
        proofAnchor:
          'Built alongside our work with churches, ministries, and small teams — organizations with real content and real questions.',
        ctaLabel: 'Book a discovery call',
      },
      serviceSite: {
        _type: 'serviceBlock',
        headline: 'The Salt site',
        body: 'A complete website — brand, copy, design, build — delivered in weeks, not months. One fixed investment, one focused process, built closely with the one person who can say yes.',
        stepsLabel: 'The deal, plainly',
        steps: [
          {
            _type: 'serviceStep',
            _key: 'site1',
            text: 'Scope is written down before we start. New ideas go to a parked list you can buy later — the price you signed is the price.',
          },
          {
            _type: 'serviceStep',
            _key: 'site2',
            text: 'You’ll know the launch week before you sign.',
          },
          {
            _type: 'serviceStep',
            _key: 'site3',
            text: 'We run the project. Your total time commitment is listed in hours, up front.',
          },
        ],
        investmentLine: 'from $5,500 · a limited number each year',
        ctaLabel: 'Book a discovery call',
      },
      serviceCare: {
        // No ctaLabel by design — care is the ascension path, not a cold entry point.
        _type: 'serviceBlock',
        headline: 'Site care',
        body: 'For the sites we’ve built: we keep them fast, secure, and cared for — so you never think about them. And if you ever want to leave, you take everything with you. Free. That’s the deal.',
        investmentLine: 'from $100/month',
        routingLine:
          'Have a site that needs a caretaker? Worth asking on the call — sometimes the answer is yes.',
      },
    },
    {
      _type: 'servicesFitSection',
      _key: 'fit',
      enabled: true,
      internalName: 'Fit Filter',
      headline: 'Are we a fit?',
      goodFitLabel: 'We’re a good fit if:',
      goodFitPoints: [
        'Your organization has a mission — and one person who can say yes',
        'You want a fixed scope, a visible price, and a known launch week',
        'For AI: you’d rather prove it works with a pilot than bet the budget on a promise',
      ],
      notFitLabel: 'We’re probably not, if:',
      notFitPoints: [
        'The scope needs to stay open while we build',
        'Decisions run through a committee — for websites, at least. For AI, the pilot exists precisely to give a board something real to approve',
        'You need an agency of record. We take a few projects a year, and give them everything',
      ],
    },
    {
      // recommendationDays deliberately unset — the "within X days" phrase hides until filled
      _type: 'servicesProcessSection',
      _key: 'process',
      enabled: true,
      internalName: 'Process',
      headline: 'How it starts',
      steps: [
        {
          _type: 'processStep',
          _key: 'p1',
          lead: 'Discovery call — 30 minutes.',
          text: 'You bring the problem; no spec needed. We ask honest questions about what the status quo is costing.',
        },
        {
          _type: 'processStep',
          _key: 'p2',
          lead: 'A written recommendation.',
          text: 'What we’d build, what it costs, how long it takes. Sometimes the recommendation is “don’t hire us.” That’s free.',
        },
        {
          _type: 'processStep',
          _key: 'p3',
          lead: 'The build.',
          text: 'Fixed scope, milestones you can see, one point of contact.',
        },
      ],
      ctaLabel: 'Book a discovery call',
    },
    {
      _type: 'servicesFaqSection',
      _key: 'faq',
      enabled: true,
      internalName: 'FAQ',
      faq: {
        _type: 'faq',
        title: 'FAQ',
        style: 'accordion',
        items: [
          {
            _type: 'faqItem',
            _key: 'q1',
            question: 'What if scope changes mid-project?',
            answer:
              'Scope is written down before we start. New ideas go into a parked list you can buy later — the price you signed is the price.',
          },
          {
            _type: 'faqItem',
            _key: 'q2',
            question: 'Isn’t a freelancer or Squarespace cheaper?',
            answer:
              'Up front, yes. You’re not buying pages, though — you’re buying a fixed scope, a named process, and someone accountable after launch. Count the cost of building it twice.',
          },
          {
            _type: 'faqItem',
            _key: 'q3',
            question: 'I need board or committee sign-off.',
            answer:
              'Websites are single-decision-maker only, by design. For AI builds, the pilot exists precisely to give your board something real to approve — or we’ll say it’s not the moment.',
          },
          {
            _type: 'faqItem',
            _key: 'q4',
            question: 'Will AI actually work for an organization like ours? Is it safe?',
            answer:
              'That’s what the pilot is for: a bounded test on your real content, with success criteria agreed in writing, before anyone commits to a full build.',
          },
          {
            _type: 'faqItem',
            _key: 'q5',
            question: 'What happens after launch?',
            answer:
              'Care plans from $100/month keep the site fast, secure, and updated. Launch creates new questions; you’re never left holding the keys alone.',
          },
          {
            _type: 'faqItem',
            _key: 'q6',
            question: 'What if we want to leave later?',
            answer:
              'You take everything — code, content, accounts. Free. If we’re worth keeping, it won’t be because leaving is hard.',
          },
          {
            _type: 'faqItem',
            _key: 'q7',
            question: 'Why such a small studio?',
            answer:
              'Small is the feature. One build at a time means the person you met on the call is the person doing the work.',
          },
          {
            _type: 'faqItem',
            _key: 'q8',
            question: 'We already have a volunteer who does this.',
            answer:
              'Great — we build so your team can run it. The real question is whether the current setup lets your people focus on the mission, or takes their time to maintain. If it genuinely works, keep it — but that’s worth 30 minutes to figure out.',
          },
        ],
      },
    },
    {
      _type: 'servicesFinalCtaSection',
      _key: 'final-cta',
      enabled: true,
      internalName: 'Final CTA',
      headline: 'Bring the problem.',
      ctaLabel: 'Book a discovery call',
      microcopy: '30 minutes. A clear next step, either way.',
    },
  ],
}

// --- draft projects ×5 (work.md §2–3 — STATUS: HOLD, never published here) --
const outcomeBlock = (text) => [block(text)]

const PROJECTS = [
  {
    id: 'project-enjoy-life-church',
    title: 'Enjoy Life Church',
    slug: 'enjoy-life-church',
    clientId: 'client-enjoy-life-church',
    role: 'Full site + strategy + copy',
    categories: ['workCategory-web-software', 'workCategory-content-marketing'],
    stack: SITE_STACK,
    outcome:
      'An Edmonton church trading a “poster-board” website for one that matches who they are today — simple enough for their volunteers to run.',
    brief:
      'A newly formed creative team, an outdated site on ShareFaith. Victory’s words: “It’s more of like a poster board.” Kickoff form: “It functions, but it does not represent who we are today or where we are going.” The deliberate choice: “we just want to do everything once and for all.”',
    context:
      'A smaller congregation, mostly older, few tech-savvy volunteers — so volunteer-friendliness became a design requirement, not a nice-to-have. Audience: “people in Edmonton and surrounding communities who are looking for something real.”',
    approach:
      'Strategy → portal (“the table”) → 346 photos into Sanity → page-by-page copy in ELC’s voice. Honest beat: early copy drafts missed their voice and got corrected round by round — that’s what “built closely with” means in practice.',
    result:
      'Launch targeted Sept 1, 2026 (their date, chosen so it’s “not rush rush”). [UPDATE at ship time]',
  },
  {
    id: 'project-crossroads-life-church',
    title: 'Crossroads Life Church',
    slug: 'crossroads-life-church',
    clientId: 'client-crossroads-life-church',
    role: 'Rebrand + site',
    categories: ['workCategory-brand-identity', 'workCategory-web-software'],
    stack: SITE_STACK,
    outcome:
      'After six years of wanting a redesign, a small-town church gets a full rebrand and a site built around one word — LIFE.',
    brief:
      '“It’s probably been six years I’ve been trying to get our website redesigned.” — David, lead pastor. New pastors in a 40-year-old church, meeting in a donated former cheese factory, growing fast (kids ministry ~94, youth tripled). “They have the passion without the skill.”',
    context:
      'They didn’t want “the rural default — disorganized and messy.” And the reference site they’d named? On the call they rated it 5–6/10: “too plastic… a teeny bit cold.” The real direction (warmer, with a vintage thread) only emerged by talking. That’s what discovery is for.',
    approach:
      'A transition year meant the original budget wasn’t there — so the work was phased: brand first, then the site, month by month. [PERMISSION from David before publishing the budget-phasing beat] Three logo concepts, full visual system, custom site replacing Squarespace and an unused $275/mo app.',
    result:
      'Launch targeted for their September calendar reset. “They can find LIFE in Jesus and at CLC.” [UPDATE at ship time]',
  },
  {
    id: 'project-cultivated',
    title: 'Cultivated',
    slug: 'cultivated',
    clientId: 'client-cultivated',
    role: 'Brand + site + funnel',
    categories: [
      'workCategory-brand-identity',
      'workCategory-web-software',
      'workCategory-content-marketing',
    ],
    stack: SITE_STACK,
    outcome:
      'Twenty-five years of ministry, a brand-new business, no website, no clear lane — becoming a named method, a Clarity quiz, and a site built around one word: clarity.',
    brief:
      'Lisa, 25 years a pastor and builder of the local church, starting over with a new LLC. No website. Her own question: “What is a lane that I can be known for?”',
    context:
      'The lane was already in her language — clarity. “I feel most called to guide people to a place of clarity around what is keeping them stuck.” Everything got built around that word.',
    approach:
      'Brand direction, site strategy, full copy, and a Sanity-driven Clarity quiz that routes to a free intro call. The honest beat: her audience started as “all of the above — I know I need to narrow it” — narrowing it WAS the work. [VERIFY at ship: if the blur-to-focus scroll effect shipped, mention it — “the Clarity Method, enacted.”]',
    result: 'August launch target; quiz-to-call funnel in place. [UPDATE at ship time]',
  },
  {
    id: 'project-mfi-canada',
    title: 'MFI Canada',
    slug: 'mfi-canada',
    clientId: 'client-mfi-canada',
    role: 'Platform migration',
    categories: ['workCategory-web-software'],
    stack: [
      ...SITE_STACK,
      'capability-supabase',
      'capability-mapbox',
      'capability-shadcn',
      'capability-playwright',
    ],
    outcome:
      'A national ministry network moved off Webflow onto a platform their own team can edit — conference pages built section by section, and a member Resource Hub.',
    brief:
      'A ministry network on Webflow — content edits bottlenecked, conference pages rebuilt by hand each time. [VERIFY trigger framing with Gabriella before publishing — no client-voice discovery notes exist]',
    context:
      'The need wasn’t a prettier site; it was ownership — a platform their admin could actually run.',
    approach:
      'Full migration to a self-editable platform: core pages, a conference page-builder (speakers, schedules, registration), and a login-gated Resource Hub at hub.mficanada.ca with ten ministry resource categories. Affinity Groups: “Find Your People. Share Your Calling.” (their copy).',
    result: 'Their team edits everything in one admin. [VERIFY live status]',
  },
  {
    id: 'project-photon-studio',
    title: 'Photon Studio',
    slug: 'photon-studio',
    clientId: 'client-photon-studio',
    role: 'Site rebuild',
    categories: ['workCategory-web-software', 'workCategory-content-marketing'],
    stack: SITE_STACK,
    outcome:
      'A six-person studio shooting for Nike, Adidas, and Google — with a site search engines couldn’t read. Now they can find it.',
    brief:
      'Six people in Portland + Lisbon shooting for Nike, Adidas, Google Pixel, Oura — and a site that was, bluntly, invisible to search, with no client voices on it.',
    context:
      'The voice was never the problem — “the voice is the voice” — so the rebuild kept their language (“mission control for your visual content”) and fixed findability: category pages, structured data, the work front and center.',
    approach:
      'Two copy rounds with real pushback — Liam cut a tagline that “felt too symmetrical,” and a service we’d over-touted got walked back because they don’t offer it in-house. The copy got truer both times. [PERMISSION: Liam quotes]',
    result:
      'Prototype-first rebuild on the new stack. [VERIFY launch — planned end of June 2026, unconfirmed]',
  },
]

const projectDrafts = PROJECTS.map((p) => ({
  _id: `drafts.${p.id}`,
  _type: 'project',
  projectType: 'case-study',
  featured: false,
  title: p.title,
  slug: slugFld(p.slug),
  year: '2026',
  role: p.role,
  client: ref(p.clientId),
  overview: outcomeBlock(p.outcome),
  categories: p.categories.map(keyedRef),
  stack: p.stack.map(keyedRef),
  brief: p.brief,
  context: p.context,
  approach: p.approach,
  result: p.result,
  showTestimonials: false,
}))

// --- draft About page singleton (about.md — BLOCKED on [GABRIELLA] beats) ---
const aboutDraft = {
  _id: 'drafts.aboutPage',
  _type: 'aboutPage',
  sections: [
    {
      // §1 Opening statement
      _type: 'aboutOpeningSection',
      _key: 'opening',
      enabled: true,
      internalName: 'Opening Statement',
      line1: 'Salt doesn’t overpower.',
      line2: 'It draws out what’s already there.',
      body: 'That’s how we build, too. The mission was always yours — our work is to make it unmistakable.',
    },
    {
      // §2 The story — founder arc, beats 1–4 (photo still needed)
      _type: 'aboutStorySection',
      _key: 'story',
      enabled: true,
      internalName: 'The Story',
      body: [
        // Beat 1: two lives
        ...paragraphs([
          'Most weeks you’ll find me in one of two rooms: at a keyboard, or at church with a room full of teenagers.',
          'I’m a youth pastor. I’m also a lifelong computer nerd. For a long time those felt like separate lives — one for Sundays, one for everything else.',
        ]),
        // Beat 2: the call
        ...paragraphs([
          'Salt is what happened when they stopped being separate.',
          'I kept watching the organizations I love — churches, nonprofits, people carrying something bigger than themselves — make do with tools that couldn’t carry their voice. The tech world builds for startups. Ministries get the leftovers, or a volunteer’s weekend, or a template that sounds like everyone.',
          '[GABRIELLA: one honest sentence about the doubt — the season you almost didn’t do this, or nearly stayed on the default path. The near-quit beat is what makes the rest credible.]',
        ]),
        // Beat 3: the mentors
        ...paragraphs([
          '[GABRIELLA: who helped? Name them generously — honoring your guides is what lets a reader cast Salt as theirs. e.g. “________ taught me ________. I’d be somewhere worse without them.”]',
        ]),
        // Beat 4: why Salt exists now
        ...paragraphs([
          'I love Jesus. That’s not a branding line — it’s why I keep ending up in rooms full of people trying to serve something bigger than themselves, and why I build for them.',
          'Not websites for their own sake. What they unlock: a church heard clearly, a nonprofit that answers at 2 a.m., a mission that finally sounds like itself online. I’m not a vendor who discovered a niche. On Tuesday nights I’m the one answering the same forty questions from parents — I build the things I wish existed.',
          'And there’s a part of my brain that simply can’t leave a repeated task alone. If something steals the same hour from someone twice, I want to build the thing that gives it back. Time is the one resource a small team can’t buy more of. That’s what we’re really building for.',
        ]),
      ],
      offHoursLine:
        'Off the clock: the beach with my husband, Matheus; a podcast about AI or the CIA — usually both, thanks to Diary of a CEO; and a dog named Milo, who has never missed a workday.',
    },
    {
      // §3 Smallness as focus
      _type: 'aboutSmallnessSection',
      _key: 'smallness',
      enabled: true,
      internalName: 'Small on Purpose',
      headline: 'Small on purpose',
      body: 'We take a few projects a year. Not because we can’t take more — because each one gets the person you met on the call, start to finish. One build at a time isn’t a limitation we manage. It’s the product.',
    },
    {
      // §4 How we work
      _type: 'aboutConvictionsSection',
      _key: 'convictions',
      enabled: true,
      internalName: 'How We Work',
      headline: 'How we work',
      lines: ['Reveal, don’t impose.', 'Refine, don’t complicate.', 'Endure, don’t chase.'],
      closingLine: 'If a thing adds noise, it goes.',
    },
    {
      // §5 The Salt product bridge
      _type: 'aboutProductSection',
      _key: 'product',
      enabled: true,
      internalName: 'Salt Product Bridge',
      body: 'The studio runs on software we’re building ourselves — Salt, a tool that handles the gathering and drafting so small teams can do the meaningful part. The studio taught us what to build. Now we’re building it.',
      linkLabel: 'Join the waitlist',
    },
    {
      // §6 Closing CTA — soft
      _type: 'aboutClosingSection',
      _key: 'closing',
      enabled: true,
      internalName: 'Closing CTA',
      body: 'If this sounds like your kind of partner — let’s talk.',
      ctaLabel: 'Book a discovery call',
      microcopy:
        '30 minutes with [GABRIELLA: first person? “with Gabriella” humanizes the ask]. No pitch. A clear next step, either way.',
    },
  ],
}

// The About copy originally seeded as a generic page doc — superseded by the
// aboutPage singleton above. Deleting is idempotent (no-op once gone).
const OBSOLETE_IDS = [
  'drafts.page-about', // About re-homed as the aboutPage singleton
  'workCategory-design-creative', // merged into Brand & Identity / Content & Marketing
  'workCategory-web-digital', // renamed to Web & Software (workCategory-web-software)
]

// --- settings (patched — may already hold logo/config) ----------------------
const settingsPatch = {
  siteName: 'Salt Studio',
  siteDescription: 'AI assistants and refined websites for organizations with a mission.',
  menuItems: [
    {_type: 'navItem', _key: 'nav-work', label: 'Work', link: ref('workPage')},
    {_type: 'navItem', _key: 'nav-contact', label: 'Contact', link: ref('contactPage')},
  ],
  footerSocial: [
    {
      _type: 'footerSocialLink',
      _key: 'fs-email',
      platform: 'email',
      href: 'mailto:hello@createdbysalt.com',
    },
  ],
  showFooterLegal: true,
  showBuiltWithCredit: true,
}

// --- report + commit --------------------------------------------------------
const published = [
  ...clientDocs,
  ...workCategoryDocs,
  ...capabilityDocs,
  ctaDoc,
  ...serviceDocs,
  homeDoc,
  workPageDoc,
  contactPageDoc,
  servicesPageDoc,
]
const drafts = [...projectDrafts, aboutDraft]

const bar = '─'.repeat(72)
console.log(`\n${bar}\nSeed site copy  ·  ${COMMIT ? 'COMMIT' : 'DRY RUN'}\n${bar}`)
console.log('\nPublished (createOrReplace):')
for (const d of published) console.log(`  + ${d._id}  (${d._type})`)
console.log('\nDrafts (createOrReplace — never published by this script):')
for (const d of drafts) console.log(`  + ${d._id}  (${d._type})`)
console.log('\nSettings (patch):')
for (const k of Object.keys(settingsPatch)) console.log(`  ~ settings.${k}`)
console.log('\nObsolete (delete):')
for (const id of OBSOLETE_IDS) console.log(`  - ${id}`)
console.log(
  '\nLeft empty on purpose: home.bookingQuarter · contact calLink · contact/services recommendationDays · contact cityTimezone',
)
console.log(bar)

if (!COMMIT) {
  console.log('DRY RUN — nothing written. Re-run with COMMIT=1.\n')
  process.exit(0)
}

const tx = c.transaction()
for (const d of published) tx.createOrReplace(d)
tx.createIfNotExists({_id: 'settings', _type: 'settings'})
tx.patch('settings', (p) => p.set(settingsPatch))
for (const d of drafts) tx.createOrReplace(d)
await tx.commit()
console.log(
  `\n✓ Seeded ${published.length} published docs, ${drafts.length} drafts, and patched settings.`,
)

// Obsolete cleanup runs separately so a still-referenced doc (e.g. a published
// project pointing at a renamed category) doesn't roll back the seed itself.
for (const id of OBSOLETE_IDS) {
  try {
    await c.delete(id)
    console.log(`✓ Deleted obsolete ${id}`)
  } catch (err) {
    console.log(`⚠ Could not delete ${id} yet: ${err.message?.split('\n')[0] ?? err}`)
  }
}
console.log('')
