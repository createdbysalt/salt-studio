/**
 * Hardcoded About panel copy — kept out of Sanity on purpose while the
 * long-form /about page content is still in flux. Swap to CMS when ready.
 */

export const ABOUT_VIDEO_SRC = '/about/studio.mp4'

export const ABOUT_META_LINE = {
  established: 'EST 2025',
  location: 'BASED IN PORTLAND, OREGON',
} as const

export const ABOUT_BIO = [
  "Hey, I'm Gabriella. I started Salt Studio because I kept watching good organizations get stuck with the wrong tools. Websites nobody on their team could update without calling a developer. Hours every week going to repetitive work that didn't need a person. Small teams with more mission than time.",
  "I love systems and processes. Give me a messy workflow and I'll happily lose an afternoon making it run smoother. I've also spent years inside small mission-driven teams, so I know exactly where the hours go. Salt is that obsession put to work. I build custom AI that takes the repetitive work off your plate, and websites that sound like the mission behind them, set up so you can change anything yourself in minutes.",
  "The name is the approach. Salt doesn't overpower. It draws out what's already there. If that sounds like your kind of studio, I'd love to talk.",
] as const

export const ABOUT_PRINCIPLES = [
  {
    title: "Reveal, don't impose",
    body: "Every creative decision answers one question: does this draw out what's already true about your mission, or add noise on top of it?",
  },
  {
    title: 'All in, few at a time',
    body: "A few projects a year, one build at a time. You'll know the launch week before you sign and exactly how many hours we need from you. When we commit, we're fully present, start to finish.",
  },
  {
    title: 'Your hours are the point',
    body: 'Everything we build should hand you time back. AI that takes over the repetitive work. A site you can change yourself in minutes. If it adds to your plate, we built the wrong thing.',
  },
  {
    title: 'Yours to keep',
    body: 'Your accounts, your data, your site, your tools. If you ever want to leave, you take everything with you, free. Things built to last shouldn\'t need a hostage clause.',
  },
] as const

export const ABOUT_CTA = {
  eyebrow: 'Salt software',
  body: 'The studio runs on software we\'re building ourselves — Salt — so small teams can spend less time gathering and drafting, and more time on the work that matters.',
  primaryLabel: 'Book a discovery call',
  primaryHref: '/contact',
  secondaryLabel: 'Join the waitlist',
  secondaryHref: '/contact?subject=Salt%20waitlist',
} as const

export function isAboutHref(href: string | null | undefined): boolean {
  if (!href) return false
  try {
    const path = href.startsWith('http') ? new URL(href).pathname : href.split('?')[0]?.split('#')[0]
    return path === '/about'
  } catch {
    return href === '/about'
  }
}
