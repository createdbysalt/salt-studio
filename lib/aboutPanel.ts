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
  "Hey — I'm Gabriella. I started Salt Studio because I kept watching good organizations stay invisible online. Churches, nonprofits, people carrying something bigger than themselves — stuck with tools that couldn't carry their voice.",
  "I'm a youth pastor and a lifelong computer nerd. For a long time those felt like separate lives. Salt is what happened when they stopped being separate. I build for the people I sit with on Tuesday nights: small teams with real missions and no time to waste on noise.",
  'We work quietly and carefully. Subtle. Essential. Transformative. If that sounds like your kind of partner, I\'d love to talk.',
] as const

export const ABOUT_PRINCIPLES = [
  {
    title: 'Reveal, don\'t impose',
    body: 'Every creative decision answers one question: does this draw out what\'s already true about your mission — or add noise on top of it?',
  },
  {
    title: 'All in, few at a time',
    body: 'We take fewer projects so each one gets everything. When we commit, we\'re fully present — start to finish, no handoffs into the void.',
  },
  {
    title: 'People before platforms',
    body: 'Behind every brand is a person with real stakes. We never lose sight of that. The most powerful digital experiences are the ones that feel unmistakably human.',
  },
  {
    title: 'Built to endure',
    body: 'Trends fade. We make things quiet enough to last and clear enough to work — years later, still right.',
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
