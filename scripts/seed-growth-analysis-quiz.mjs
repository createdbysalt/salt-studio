/**
 * Seed the Business Growth Analysis quiz (Black Friday 2026) into Sanity.
 *
 * Writes ONE document, as a DRAFT: drafts.quiz-growth-analysis. Nothing goes
 * live until Matt publishes it in the Studio, and it should only be published
 * after the growth-analysis code is deployed: before that, the site would
 * score this quiz with the generic engine and show the generic results page.
 *
 * Audience: owners of med spas and cash-pay clinics in Portland. Copy rules:
 * no em or en dashes, no health claims, no invented numbers.
 *
 * The question keys and the option _keys on the three fit questions are read
 * by lib/growth/config.ts. Change them in both places or not at all.
 *
 * DRY RUN by default. COMMIT=1 to write.
 *   npx sanity exec scripts/seed-growth-analysis-quiz.mjs --with-user-token
 *   COMMIT=1 npx sanity exec scripts/seed-growth-analysis-quiz.mjs --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const COMMIT = process.env.COMMIT === '1'
const client = getCliClient({apiVersion: '2025-02-27'})

const POINTS = [100, 70, 40, 15]

/** A scored question: four answers, best first, worth 100 / 70 / 40 / 15. */
function scored(key, prompt, shortLabel, labels, weight = 1) {
  return {
    _type: 'quizQuestionItem',
    _key: key,
    key: {_type: 'slug', current: key},
    prompt,
    shortLabel,
    kind: 'choice',
    weight,
    options: labels.map((label, i) => ({
      _type: 'quizOptionItem',
      _key: `${key}-${POINTS[i]}`,
      label,
      points: POINTS[i],
    })),
  }
}

/** An unscored choice. Options are [optionKey, label] pairs. */
function context(key, prompt, options) {
  return {
    _type: 'quizQuestionItem',
    _key: key,
    key: {_type: 'slug', current: key},
    prompt,
    kind: 'choice',
    weight: 0,
    options: options.map(([optionKey, label]) => ({
      _type: 'quizOptionItem',
      _key: optionKey,
      label,
      points: 0,
    })),
  }
}

function open(key, prompt, kind, hint) {
  return {
    _type: 'quizQuestionItem',
    _key: key,
    key: {_type: 'slug', current: key},
    prompt,
    hint,
    kind,
  }
}

const questions = [
  context('business-type', 'What kind of practice do you run?', [
    ['type-med-spa', 'Med spa'],
    ['type-chiropractic', 'Chiropractic'],
    ['type-physical-therapy', 'Physical therapy'],
    ['type-dermatology', 'Dermatology'],
    ['type-plastic-surgery', 'Plastic surgery'],
    ['type-iv-therapy', 'IV therapy'],
    ['type-weight-loss', 'Weight loss'],
    ['type-other', 'Something else'],
  ]),
  scored(
    'getting-found',
    'When someone nearby searches for what you do, what do they find?',
    'getting found',
    [
      'Our Google profile near the top, with recent reviews and photos',
      'Our profile is there, but reviews are old or few',
      'We show up if they search our name',
      "Honestly, I'm not sure",
    ],
  ),
  scored('website', 'What can someone do on your website in the first minute?', 'your website', [
    "See what we do and who it's for, then book a consult online",
    'Fill out a contact form',
    'Find our phone number',
    "We don't have a site, or I wouldn't send anyone to it",
  ]),
  scored('lead-capture', 'Where do new inquiries end up?', 'where inquiries land', [
    'One place, and we know where each one came from',
    "One place, but we don't track the source",
    'Spread across calls, texts, email and DMs',
    'Wherever they land. Some get missed',
  ]),
  scored(
    'first-reply',
    'How fast does a new inquiry hear back from a real person?',
    'how fast you reply',
    [
      'Within 5 minutes during business hours',
      'Within an hour',
      'Same day',
      'Next day or whenever we get to it',
    ],
  ),
  scored(
    'booking',
    'What happens between "I\'m interested" and the consult?',
    'getting people booked',
    [
      'They get a time on the calendar right away, plus reminders',
      "We go back and forth to find a time, then it's booked",
      'We send info or pricing and wait',
      "It depends on who's at the front desk",
    ],
  ),
  scored('follow-up', 'When someone asks, then goes quiet, what do you do?', 'follow-up', [
    'We follow up several times on a set schedule',
    'We check in once or twice',
    'We follow up if we remember',
    "Nothing. If they want it, they'll reach out",
  ]),
  scored('reviews', 'After a visit, what happens?', 'reviews and referrals', [
    'Every patient or client is asked for a review and a referral',
    'We ask when it feels right',
    'Happy ones sometimes leave a review on their own',
    'Nothing',
  ]),
  // Reported on its own in the paid report. Weight 0: it never moves the score.
  scored(
    'foundation',
    'For handling new inquiries, which is closest to true?',
    'who owns new inquiries',
    [
      'One person owns it, the steps are written down, and we use a tool for it',
      'The front desk owns it, but it lives in their heads',
      'Whoever is free between appointments',
      "That's me, between patients",
    ],
    0,
  ),
  context('monthly-revenue', 'About how much does the practice bring in a month?', [
    ['rev-under-10', 'Under $10k'],
    ['rev-10-30', '$10k to $30k'],
    ['rev-30-75', '$30k to $75k'],
    ['rev-75-150', '$75k to $150k'],
    ['rev-over-150', 'Over $150k'],
  ]),
  context('client-value', 'What is one new patient or client worth to you in their first year?', [
    ['value-under-500', 'Under $500'],
    ['value-500-1000', '$500 to $1,000'],
    ['value-1000-3000', '$1,000 to $3,000'],
    ['value-over-3000', 'Over $3,000'],
  ]),
  context('goal', 'What would make the next 12 months a win?', [
    ['goal-found', 'More new people finding us'],
    ['goal-booked', 'Booking more of the people who ask'],
    ['goal-showed', 'More booked consults showing up'],
    ['goal-follow-up', 'Stop losing people in follow-up'],
    ['goal-time', 'Get my time back'],
  ]),
  open(
    'business-name',
    "What's the name of your practice?",
    'text',
    'So your result has your name on it.',
  ),
  open(
    'website-url',
    "What's your website?",
    'url',
    "If you get the full report, we'll look at it for you. Skip this if you don't have one.",
  ),
  open('first-name', 'Last one. What should we call you?', 'text', 'First name is fine.'),
]

function band(key, label, minScore, resultBody) {
  return {
    _type: 'quizBandItem',
    _key: key,
    label,
    minScore,
    resultHeadline: label,
    resultBody,
  }
}

const doc = {
  _id: 'drafts.quiz-growth-analysis',
  _type: 'quiz',
  title: 'Business Growth Analysis',
  slug: {_type: 'slug', current: 'growth-analysis'},
  introHeadline: 'Where is your practice losing people who already wanted to book?',
  introBody:
    'A few quick questions about how people find you, what they see when they do, and what happens after they reach out. About 3 minutes. You get your score right away.',
  startLabel: 'Start the quiz',
  questions,
  bands: [
    band(
      'band-source',
      'Leaking at the source',
      0,
      'People want to book with you. Right now something early in the path is stopping most of them before they get the chance.',
    ),
    band(
      'band-working',
      'Working, but leaking',
      40,
      'The basics are there and people are getting through. One step is letting too many of them slip away.',
    ),
    band(
      'band-mostly',
      'Mostly covered',
      55,
      "Most of the path holds. There's one soft spot, and it's worth fixing before you spend a dollar on ads.",
    ),
    band(
      'band-well',
      'Running well',
      71,
      "This is a solid setup. What's left is tightening one step.",
    ),
    band(
      'band-dialed',
      'Dialed in',
      85,
      "There isn't much to fix here. That's the good kind of result.",
    ),
  ],
  gateHeadline: 'Your score is ready',
  gateBody: "Where should we send it? You'll see your result on the next screen.",
  gateButtonLabel: 'Show my score',
}

const scoredCount = questions.filter((q) => q.kind === 'choice' && q.weight > 0).length
console.log(`Business Growth Analysis quiz: ${questions.length} screens, ${scoredCount} scored.`)
for (const q of questions) console.log(`  ${q.key.current.padEnd(16)} ${q.prompt}`)

const json = JSON.stringify(doc)
if (/[–—]/.test(json)) throw new Error('Copy rule broken: a dash character is in the quiz copy.')

if (!COMMIT) {
  console.log('\nDRY RUN. Nothing written. Re-run with COMMIT=1 to create the draft.')
} else {
  await client.createOrReplace(doc)
  console.log(`\nWrote ${doc._id} as a draft. Publish it in the Studio after the code is deployed.`)
}
