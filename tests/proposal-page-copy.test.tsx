import assert from 'node:assert/strict'
import test from 'node:test'
import {ProposalPackages} from '@/components/ProposalPackages'
import {PACKAGES_INTRO, proposalInvestmentIntro} from '@/lib/proposal/copy'

const RATE_INTRO =
  "Our usual rate is $125 an hour. For this work, we're at $65, out of relationship."

const sections = [
  {
    _key: 'sec-packages',
    _type: 'proposalPackagesSection',
    enabled: true,
    intro: PACKAGES_INTRO,
  },
  {
    _key: 'sec-investment',
    _type: 'proposalInvestmentSection',
    enabled: true,
    heading: 'Accept & Sign',
    title: "We can't wait to work together.",
    intro: RATE_INTRO,
  },
]

test('the investment heading intro comes from sec-investment.intro', () => {
  assert.equal(proposalInvestmentIntro(sections), RATE_INTRO)
})

test('the CMS investment intro renders directly under The investment', () => {
  const text = textContent(
    ProposalPackages({
      heading: 'The investment.',
      intro: proposalInvestmentIntro(sections),
      packageIntro: PACKAGES_INTRO,
      packages: [
        {
          id: 'pkg-foundation',
          name: 'Foundation',
          summary: '',
          items: [],
          scope: [],
          price: '$5,500',
          sale: null,
          amount: 5500,
          recommended: true,
        },
      ],
      addOnHeading: 'Add-ons',
      addOns: [],
      discountPercent: null,
    }),
  )

  const headingIndex = text.indexOf('The investment.')
  const rateIndex = text.indexOf(RATE_INTRO)
  const packageIntroIndex = text.indexOf(PACKAGES_INTRO)

  assert.notEqual(headingIndex, -1)
  assert.ok(rateIndex > headingIndex)
  assert.ok(packageIntroIndex > rateIndex)
})

function textContent(node: unknown): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textContent).join('')
  if (typeof node === 'object' && 'props' in node) {
    return textContent((node as {props?: {children?: unknown}}).props?.children)
  }
  return ''
}
