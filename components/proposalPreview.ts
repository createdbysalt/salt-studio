import type {PreviewProofProjectsQueryResult, ProposalByTokenQueryResult} from '@/sanity.types'

/**
 * In-memory sample for local design at /p/preview.
 * It is not written to Sanity.
 */
const SITUATION_CARDS = [
  {
    _key: 'sit1',
    icon: 'scattered',
    title: 'Three places for one fact',
    quote: 'Service times live on a PDF, in a Facebook post, and in the Friday email.',
  },
  {
    _key: 'sit2',
    icon: 'waiting',
    title: 'Updates wait on someone else',
    quote: 'Updating a page means emailing someone outside the parish and waiting.',
  },
  {
    _key: 'sit3',
    icon: 'arrival',
    title: 'A first Sunday stalls',
    quote: 'They can find the address. They cannot tell what Sunday feels like.',
  },
  {
    _key: 'sit4',
    icon: 'calling',
    title: 'They still call the office',
    quote: 'If the times are not on the site, someone phones and a person has to answer.',
  },
]

/**
 * Real projects for the Harbor Parish preview, in order.
 * The note is written for this client. The picture and the numbers come from the project.
 */
export const previewProofPicks = [
  {
    slug: 'one-youth-conference',
    note: 'A conference site the room could use. The schedule lived in one place, and people stopped having to ask.',
  },
  {
    slug: 'mfi-canada',
    note: 'One person publishes the whole site. Updating a page no longer waits on a team.',
  },
  {
    slug: 'playground',
    note: 'New work goes up without a developer in the middle.',
  },
] as const

export function withPreviewProofProjects(
  proposal: NonNullable<ProposalByTokenQueryResult>,
  found: PreviewProofProjectsQueryResult,
): NonNullable<ProposalByTokenQueryResult> {
  const bySlug = new Map(found.map((project) => [project.slug, project]))
  const projects = previewProofPicks.flatMap((pick) => {
    const project = bySlug.get(pick.slug)
    if (!project) return []
    return [{_key: project._id, note: pick.note, project}]
  })
  if (projects.length === 0) return proposal

  return {
    ...proposal,
    sections: (proposal.sections ?? []).map((section) =>
      section._type === 'proposalProofSection' ? {...section, projects} : section,
    ),
  }
}

/** Preview only. 2 or 4 swap the sample card count. Anything else stays at 3. */
export function previewProposal(cardCount?: number): NonNullable<ProposalByTokenQueryResult> {
  const count = cardCount === 2 || cardCount === 4 ? cardCount : 3
  const situationCards = SITUATION_CARDS.slice(0, count)
  return {
    _id: 'preview',
    status: 'draft',
    clientDisplayName: 'Harbor Parish',
    clientLegalName: 'Harbor Parish',
    signerName: 'Ruth Alvarez',
    signerEmail: 'ruth@harborparish.example',
    clientLogo: null,
    validUntil: '2026-11-24T23:59:00.000Z',
    kickoffOptions: [
      {_key: 'kickoff-1', label: 'Monday, November 17', date: '2026-11-17'},
      {_key: 'kickoff-2', label: 'Monday, December 1', date: '2026-12-01'},
    ],
    sameDayOffer: {
      enabled: true,
      bonusTitle: 'Homepage copy',
      bonusDetail: 'Sign and pay the deposit today, and the homepage copy is included.',
      deadline: null,
    },
    recommendedPackageId: 'pkg-complete',
    // Preview figures so the cards have prices to design against.
    packages: [
      {
        _id: 'pkg-foundation',
        name: 'Foundation',
        summary: 'A clear site the office can update, built around how people actually arrive.',
        amount: 5500,
        includedItems: [
          'Discovery workshop',
          'Site structure and design',
          'Build and launch',
          'A short training session',
        ],
        scope: [
          sowBlock(
            'f-scope-1',
            'A clear site the office can update, built around how people actually arrive.',
          ),
          sowBullet('f-scope-2', 'Discovery workshop.'),
          sowBullet('f-scope-3', 'Site structure and design.'),
          sowBullet('f-scope-4', 'Build and launch.'),
          sowBullet('f-scope-5', 'A short training session so the office can publish a page.'),
        ],
        deliverables: [
          {
            _key: 'd1',
            name: 'Site map and page list',
            description: 'The pages, and what each one is for.',
            phase: 'Foundation',
            acceptanceCriteria: 'You confirm the page list before design starts.',
          },
          {
            _key: 'd2',
            name: 'Designed and built site',
            description: 'The public site, set up so the office can edit the pages we agreed.',
            phase: 'Build',
            acceptanceCriteria: 'You review it in a browser and confirm the agreed pages.',
          },
          {
            _key: 'd3',
            name: 'Launch and handoff',
            description: 'The site goes live, with a short session on how to update it.',
            phase: 'Launch',
            acceptanceCriteria:
              'The site is on your domain and one person on your team has published a change.',
          },
        ],
        outOfScope: [
          {_key: 'o1', text: 'Copywriting'},
          {_key: 'o2', text: 'Photography'},
          {_key: 'o3', text: 'Advertising'},
        ],
        phases: [
          {
            _key: 'p1',
            name: 'Foundation',
            summary: 'We learn how the parish works and lock the page list.',
            weeks: 'Week 1',
          },
          {
            _key: 'p2',
            name: 'Build',
            summary: 'Design and build the site, with one review round.',
            weeks: 'Weeks 2–4',
          },
          {
            _key: 'p3',
            name: 'Launch',
            summary: 'We put it on your domain and walk the office through updates.',
            weeks: 'Week 5',
          },
        ],
      },
      {
        _id: 'pkg-complete',
        name: 'Complete',
        summary: 'Foundation, plus the words on the main pages and a month of care after launch.',
        amount: 8500,
        includedItems: [
          'Everything in Foundation',
          'Copy for the main pages',
          'One month of care after launch',
        ],
        scope: [
          sowBlock(
            'c-scope-1',
            'Foundation, plus the words on the main pages and a month of care after launch.',
          ),
          sowBullet('c-scope-2', 'Everything in Foundation.'),
          sowBullet('c-scope-3', 'Copy for the homepage, visit, and about pages.'),
          sowBullet('c-scope-4', 'One month of small fixes after launch.'),
        ],
        deliverables: [
          {
            _key: 'c1',
            name: 'Site map and page list',
            description: 'The pages, and what each one is for.',
            phase: 'Foundation',
            acceptanceCriteria: 'You confirm the page list before design starts.',
          },
          {
            _key: 'c2',
            name: 'Page copy',
            description:
              'Words for the homepage, visit, and about pages, from interviews with your team.',
            phase: 'Foundation',
            acceptanceCriteria: 'You approve the copy before it goes into the design.',
          },
          {
            _key: 'c3',
            name: 'Designed and built site',
            description: 'The public site, with the approved copy in place.',
            phase: 'Build',
            acceptanceCriteria: 'You review it in a browser and confirm the agreed pages.',
          },
          {
            _key: 'c4',
            name: 'Launch, handoff, and one month of care',
            description:
              'Launch, a training session, and a month of small fixes after the site is live.',
            phase: 'Launch',
            acceptanceCriteria: 'The site is live, and the care month has a written end date.',
          },
        ],
        outOfScope: [
          {_key: 'co1', text: 'Photography'},
          {_key: 'co2', text: 'Advertising'},
        ],
        phases: [
          {
            _key: 'cp1',
            name: 'Foundation',
            summary: 'Page list and interviews for the main pages.',
            weeks: 'Weeks 1–2',
          },
          {
            _key: 'cp2',
            name: 'Build',
            summary: 'Design and build, with the approved copy.',
            weeks: 'Weeks 3–5',
          },
          {
            _key: 'cp3',
            name: 'Launch',
            summary: 'Launch, training, and one month of care.',
            weeks: 'Week 6',
          },
        ],
      },
    ],
    addOns: [
      {
        _id: 'addon-copy',
        name: 'Copywriting',
        line: 'Words for the homepage, visit, and about pages.',
        amount: 1800,
        scope: [
          sowBlock(
            'copy-scope',
            'Words for the homepage, visit, and about pages, from interviews with your team.',
          ),
        ],
        deliverables: [
          {
            _key: 'ad1',
            name: 'Page copy',
            description: 'Words for the homepage, visit, and about pages.',
            phase: 'Foundation',
            acceptanceCriteria: 'You approve the copy before it goes into the design.',
          },
        ],
        outOfScope: [],
      },
      {
        _id: 'addon-care',
        name: 'Care plan',
        line: 'A month of small fixes after launch.',
        amount: 600,
        scope: [
          sowBlock('care-scope', 'A month of small fixes and questions for 30 days after launch.'),
        ],
        deliverables: [
          {
            _key: 'ad2',
            name: 'One month of care',
            description: 'Small fixes and questions for 30 days after launch.',
            phase: 'Launch',
            acceptanceCriteria: 'The care month has a written start and end date.',
          },
        ],
        outOfScope: [{_key: 'ado1', text: 'New pages beyond the agreed list'}],
      },
    ],
    paymentSchedule: {
      _id: 'schedule-50',
      name: '50/50',
      steps: [
        {_key: 's1', percent: 50, trigger: 'On signing'},
        {_key: 's2', percent: 50, trigger: 'When the work is accepted'},
      ],
    },
    msa: {
      _id: 'msa-1',
      version: '1.0',
      effectiveDate: '2026-11-01',
      pdfUrl: null,
      body: [
        sowBlock(
          'msa-1',
          'This Master Services Agreement is between Salt Studio and Harbor Parish. It covers how the work is done, how it is paid for, and who owns it once it is paid for.',
        ),
        sowBlock(
          'msa-2',
          'The statement of work names the specific project. If the two differ, the statement of work governs the scope. This agreement governs everything else.',
        ),
        sowBlock(
          'msa-3',
          'On full payment, Harbor Parish owns the site built for this project. Salt Studio keeps its own tools and methods.',
        ),
      ],
    },
    sections: [
      {
        _key: 'sec-cover',
        _type: 'proposalCoverSection',
        enabled: true,
        outcomeHeadline: 'A website the parish can keep.',
        headlineEmphasis: 'keep',
        effectPhrase: 'The office can publish it.',
        preparedBy: 'Gabriella Martins, Salt Studio',
        coverImage: null,
      },
      {
        _key: 'sec-situation',
        _type: 'proposalSituationSection',
        enabled: true,
        problemLine: 'One answer lives in three places.',
        cards: situationCards,
      },
      {
        _key: 'sec-outcomes',
        _type: 'proposalOutcomesSection',
        enabled: true,
        heading: 'A site the office can publish.',
        cards: [
          {
            _key: 'out1',
            title: 'One place for the facts',
            body: 'Service times, the address, and what to expect on a first Sunday live on the site.',
          },
          {
            _key: 'out2',
            title: 'The office can publish',
            body: 'A page change does not wait on an outside person.',
          },
          {
            _key: 'out3',
            title: 'A clear next step',
            body: 'A visitor knows how to come, and how to ask a question.',
          },
        ],
      },
      {
        _key: 'sec-phases',
        _type: 'proposalPhasesSection',
        enabled: true,
        heading: 'How we get there',
        intro:
          'Three stretches. We learn how the parish works, build the site, and leave the office able to publish it.',
        phases: [
          {
            _key: 'ph1',
            name: 'Foundation',
            summary: 'We learn how the parish works and lock the page list.',
            weeks: 'Week 1',
          },
          {
            _key: 'ph2',
            name: 'Build',
            summary: 'Design and build the site, with one review round.',
            weeks: 'Weeks 2–4',
          },
          {
            _key: 'ph3',
            name: 'Launch',
            summary: 'We put it on your domain and walk the office through updates.',
            weeks: 'Week 5',
          },
        ],
        questionsHeading: 'How this gets built.',
        questions: [
          {
            _key: 'aq1',
            question: 'Next.js and Sanity.',
            answer:
              'The pages the office edits live in Sanity. You change a service time or an event in the browser, and the site updates.',
          },
          {
            _key: 'aq2',
            question: 'The office changes the words.',
            answer:
              'The structure of the site stays put. A page builder would hand that structure to a template. This keeps the pages we design, and lets the parish publish them.',
          },
          {
            _key: 'aq3',
            question: 'One session at launch.',
            answer: 'After that, publishing a page does not wait on us.',
          },
        ],
      },
      {
        _key: 'sec-proof',
        _type: 'proposalProofSection',
        enabled: true,
        eyebrow: 'What we make',
        heading: "A few projects we're proud of.",
        projects: [],
        testimonials: [],
      },
      {
        _key: 'sec-packages',
        _type: 'proposalPackagesSection',
        enabled: true,
        heading: 'The investment.',
        intro: "We're excited to partner with you. This is the work we'd take on together.",
        sameDayDiscount: {enabled: true, percent: 10},
      },
      {
        _key: 'sec-addons',
        _type: 'proposalAddOnsSection',
        enabled: true,
        heading: 'Add-ons',
        intro: '',
      },
      {
        _key: 'sec-investment',
        _type: 'proposalInvestmentSection',
        enabled: true,
        heading: 'Accept & Sign',
        title: "We can't wait to work together.",
        intro:
          'Select a package, then any add-ons. The total and the scope of work update as you go.',
      },
      {
        _key: 'sec-sow',
        _type: 'proposalSowSection',
        enabled: true,
        body: [
          sowBlock(
            'sow-1',
            'This statement of work is between Salt Studio and Harbor Parish. The Master Services Agreement governs. This scope names the specific work.',
          ),
          sowBlock('sow-2', 'What we need from you', 'h3'),
          sowBullet('sow-3', 'One person who can approve the work.'),
          sowBullet('sow-4', 'Access to the domain and the current site.'),
          sowBullet('sow-5', 'Feedback within five business days of each review.'),
          sowBlock(
            'sow-6',
            'Each deliverable has a review window of five business days and one round of revision. Silence after the window counts as acceptance. On full payment, Harbor Parish owns the site built for this project. Salt Studio keeps its own tools and methods.',
          ),
        ],
      },
      {
        _key: 'sec-schedule',
        _type: 'proposalScheduleSection',
        enabled: true,
        heading: 'Payment schedule',
        excludedNote: 'Domain registration, third-party software, and taxes are not included.',
      },
      {
        _key: 'sec-terms',
        _type: 'proposalTermsSection',
        enabled: true,
        validityNote: 'The kickoff dates above are held until the proposal expires.',
        changeOrderRule:
          'Anything outside this scope is quoted and approved in writing before the work starts.',
      },
      {
        _key: 'sec-accept',
        _type: 'proposalAcceptSection',
        enabled: true,
        prompt: 'Sign here and we can start.',
        checkboxLabel: 'I agree to the Master Services Agreement and this Statement of Work.',
      },
      {
        _key: 'sec-signed',
        _type: 'proposalSignedSection',
        enabled: true,
        heading: 'Signed.',
        nextSteps: [
          'You get a copy of the signed scope and the receipt.',
          'We send the kickoff questions.',
          'Work starts on the date you chose.',
        ],
      },
    ],
  }
}

function sowBlock(key: string, text: string, style: 'normal' | 'h3' = 'normal') {
  return {
    _key: key,
    _type: 'block' as const,
    style,
    markDefs: null,
    children: [{_key: `${key}-span`, _type: 'span' as const, text, marks: [] as string[]}],
  }
}

function sowBullet(key: string, text: string) {
  return {
    ...sowBlock(key, text),
    listItem: 'bullet' as const,
    level: 1,
  }
}
