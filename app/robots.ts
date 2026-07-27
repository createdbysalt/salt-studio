import type {MetadataRoute} from 'next'

// Site URL from environment - set during client onboarding
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000'

/**
 * Robots.txt configuration.
 *
 * - Allows all crawlers by default
 * - Blocks /studio (Sanity Studio) from indexing
 * - Points to dynamic sitemap
 *
 * For staging environments, set ROBOTS_DISALLOW_ALL=true to block all crawlers.
 */
export default function robots(): MetadataRoute.Robots {
  // Block all crawlers on staging/preview environments
  if (process.env.ROBOTS_DISALLOW_ALL === 'true') {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/studio', // Sanity Studio
          '/api/', // API routes
          '/_next/', // Next.js internals
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
