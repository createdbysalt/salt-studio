import {ogImageUrl} from '@/lib/seo'
import type {Metadata} from 'next'
import {redirect} from 'next/navigation'

/**
 * About lives as a side panel now (Monolog-style), not a full page.
 * Keep /about as a deep-link that opens the panel on the home route.
 */
export const metadata: Metadata = {
  title: 'About',
  description:
    'Salt Studio — a Portland design and software studio. Subtle. Essential. Transformative.',
  openGraph: {
    title: 'About | Salt Studio',
    description:
      'Salt Studio — a Portland design and software studio. Subtle. Essential. Transformative.',
    images: [{url: ogImageUrl(), width: 1200, height: 630}],
  },
}

export default function AboutRoute() {
  redirect('/?about=1')
}
