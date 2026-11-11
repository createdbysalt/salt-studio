import type {ProposalByTokenQueryResult} from '@/sanity.types'

/**
 * In-memory sample for local design at /p/preview.
 * It is not written to Sanity.
 */
export function previewProposal(): NonNullable<ProposalByTokenQueryResult> {
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
    recommendedPackageId: 'pkg-foundation',
    packages: [
      {
        _id: 'pkg-foundation',
        name: 'Foundation',
        summary: 'A clear site the office can update, built around how people actually arrive.',
        includedItems: [
          'Discovery workshop',
          'Site structure and design',
          'Build and launch',
          'A short training session',
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
        includedItems: [
          'Everything in Foundation',
          'Copy for the main pages',
          'One month of care after launch',
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
        {_key: 's2', percent: 50, trigger: 'When the site is accepted'},
      ],
    },
    msa: {
      _id: 'msa-1',
      version: '1.0',
      effectiveDate: '2026-11-01',
      pdfUrl: null,
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
        heading: 'The situation',
        cards: [
          {
            _key: 'sit1',
            title: 'Three places for one answer',
            body: 'Service times live on a PDF, in a Facebook post, and in the Friday email. Visitors still call the office to ask.',
          },
          {
            _key: 'sit2',
            title: 'The site is stuck',
            body: 'Updating a page means emailing someone outside the parish and waiting. Events go up late, or not at all.',
          },
          {
            _key: 'sit3',
            title: 'First visits stall',
            body: 'A new person can find the address. They cannot tell what Sunday feels like, or what to do when they arrive.',
          },
        ],
      },
      {
        _key: 'sec-outcomes',
        _type: 'proposalOutcomesSection',
        enabled: true,
        heading: 'What changes',
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
      },
      {
        _key: 'sec-proof',
        _type: 'proposalProofSection',
        enabled: true,
        heading: 'Proof',
        projects: [],
        testimonials: [
          {
            _id: 'quote-1',
            quote: 'We stopped answering the same three questions every Monday.',
            author: 'Sample quote',
            role: 'For layout only',
          },
        ],
      },
      {
        _key: 'sec-packages',
        _type: 'proposalPackagesSection',
        enabled: true,
        heading: 'The engagement',
        intro:
          'Two ways to do this. Foundation is the site. Complete adds the words and a month of care.',
      },
      {
        _key: 'sec-addons',
        _type: 'proposalAddOnsSection',
        enabled: true,
        heading: 'Add-ons',
        intro: 'Each one changes the total and the signed scope.',
      },
      {
        _key: 'sec-offer',
        _type: 'proposalOfferSection',
        enabled: true,
        heading: 'If you sign today',
      },
      {
        _key: 'sec-investment',
        _type: 'proposalInvestmentSection',
        enabled: true,
        heading: 'Investment',
      },
      {
        _key: 'sec-sow',
        _type: 'proposalSowSection',
        enabled: true,
        overview:
          'Salt Studio will design and build a website for Harbor Parish so the office can publish service times, events, and a clear welcome for first-time visitors.',
        clientResponsibilities: [
          'One person who can approve the work',
          'Access to the domain and current site',
          'Feedback within five business days of each review',
        ],
        assumptions: [
          'The page list confirmed in Foundation is the scope',
          'Copy and photos, unless added, come from the parish',
        ],
        acceptanceProcess:
          'Each deliverable has a review window of five business days and one round of revision. Silence after the window counts as acceptance.',
        ownership:
          'On full payment, Harbor Parish owns the site built for this project. Salt Studio keeps its own tools and methods.',
        postLaunch: 'Ongoing care after the included window is a separate agreement.',
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
        prompt: 'Sign here and we start on the date you choose.',
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
