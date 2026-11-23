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
] as const

/**
 * Real projects for the Preview preview, in order.
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
    clientDisplayName: 'Preview',
    clientLegalName: 'Preview',
    signerName: 'Preview',
    signerEmail: 'preview@example.test',
    clientLogo: null,
    validUntil: '2026-11-24T23:59:00.000Z',
    kickoffOptions: [
      {_key: 'kickoff-1', label: 'Monday, November 17', date: '2026-11-17'},
      {_key: 'kickoff-2', label: 'Monday, December 1', date: '2026-12-01'},
    ],
    sameDayOffer: {
      enabled: false,
      bonusTitle: '',
      bonusDetail: '',
      deadline: null,
    },
    recommendedPackageId: 'pkg-landing',
    // One package on 50/50, one one-time add-on, one monthly add-on, and one choose-one group.
    packages: [
      {
        _id: 'pkg-landing',
        name: 'Landing page',
        paymentSchedule: null,
        summary: 'One landing page, designed and built.',
        amount: 4800,
        includedItems: ['Page structure', 'Design', 'Build and launch'],
        scope: [
          sowBlock('landing-scope', 'One landing page, designed and built.'),
          sowBullet('landing-2', 'Page structure.'),
          sowBullet('landing-3', 'Design.'),
          sowBullet('landing-4', 'Build and launch.'),
        ],
        deliverables: [
          {
            _key: 'd1',
            name: 'Landing page',
            description: 'The page, designed and built.',
            phase: 'Build',
            acceptanceCriteria: 'You review it in a browser and confirm the page.',
          },
        ],
        outOfScope: [{_key: 'o1', text: 'Extra pages'}],
        phases: [
          {
            _key: 'p1',
            name: 'Build',
            summary: 'Design and build the page.',
            weeks: 'Weeks 1–3',
          },
        ],
      },
    ],
    addOns: [
      {
        _id: 'addon-video',
        name: 'Video edits',
        line: 'A set of short edits for the launch film.',
        amount: 900,
        billingType: 'one-time',
        chooseOneGroup: null,
        scope: [sowBlock('video-scope', 'A set of short edits for the launch film.')],
        deliverables: [],
        outOfScope: [],
      },
      {
        _id: 'addon-notes',
        name: 'Monthly notes',
        line: 'Notes after launch.',
        amount: 500,
        billingType: 'monthly',
        chooseOneGroup: null,
        scope: [sowBlock('notes-scope', 'Notes after launch.')],
        deliverables: [],
        outOfScope: [],
      },
      {
        _id: 'addon-plan-one',
        name: 'Plan one',
        line: 'The smaller monthly plan.',
        amount: 1500,
        billingType: 'monthly',
        chooseOneGroup: 'plans',
        scope: [sowBlock('plan-one-scope', 'The smaller monthly plan.')],
        deliverables: [],
        outOfScope: [],
      },
      {
        _id: 'addon-plan-two',
        name: 'Plan two',
        line: 'The middle monthly plan.',
        amount: 2000,
        billingType: 'monthly',
        chooseOneGroup: 'plans',
        scope: [sowBlock('plan-two-scope', 'The middle monthly plan.')],
        deliverables: [],
        outOfScope: [],
      },
      {
        _id: 'addon-plan-three',
        name: 'Plan three',
        line: 'The larger monthly plan.',
        amount: 2500,
        billingType: 'monthly',
        chooseOneGroup: 'plans',
        scope: [sowBlock('plan-three-scope', 'The larger monthly plan.')],
        deliverables: [],
        outOfScope: [],
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
      pdfUrl:
        'https://cdn.sanity.io/files/jkqf2ng5/production/6f2313cdc7b5ac1add256890c572af39b4d9dc27.pdf',
      pdfFilename: null,
      body: [
        sowBlock(
          'msa-1',
          'This Master Services Agreement is between Salt Studio and Preview. It covers how the work is done, how it is paid for, and who owns it once it is paid for.',
        ),
        sowBlock(
          'msa-attr',
          'Based on the Common Paper Professional Services Agreement, available at https://commonpaper.com. Licensed under CC BY 4.0. Copyright Common Paper, Inc. License: https://creativecommons.org/licenses/by/4.0/. Cover Page adapted for Salt Studio LLC. The Standard Terms are used unchanged.',
        ),
        sowBlock(
          'msa-2',
          'The statement of work names the specific project. If the two differ, the statement of work governs the scope. This agreement governs everything else.',
        ),
        sowBlock(
          'msa-3',
          'On full payment, Preview owns the site built for this project. Salt Studio keeps its own tools and methods.',
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
        sameDayDiscount: {enabled: false, percent: 10},
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
            'This statement of work is between Salt Studio and Preview. The Master Services Agreement governs. This scope names the specific work.',
          ),
          sowBlock('sow-2', 'What we need from you', 'h3'),
          sowBullet('sow-3', 'One person who can approve the work.'),
          sowBullet('sow-4', 'Access to the domain and the current site.'),
          sowBullet('sow-5', 'Feedback within five business days of each review.'),
          sowBlock(
            'sow-6',
            'Each deliverable has a review window of five business days and one round of revision. Silence after the window counts as acceptance. On full payment, Preview owns the site built for this project. Salt Studio keeps its own tools and methods.',
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
        kickoffUrl: 'https://cal.com/createdbysalt/kickoff?overlayCalendar=true',
        kickoffLabel: 'Book your kickoff call',
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
