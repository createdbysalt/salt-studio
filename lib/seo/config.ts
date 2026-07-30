/**
 * SEO Configuration
 *
 * These values are set during client onboarding via setup-client.sh.
 * They're used for structured data, meta tags, and sitemap generation.
 *
 * Most of these come from environment variables so they can differ
 * between environments (localhost vs staging vs production).
 */

export type BusinessType = 'Organization' | 'LocalBusiness' | 'Person'

export interface SEOConfig {
  // Site basics
  siteUrl: string
  siteName: string
  siteDescription: string

  // Business/Organization info
  businessType: BusinessType
  businessName: string
  foundingDate?: string

  // Social links (for Organization schema sameAs)
  socialLinks: {
    twitter?: string
    linkedin?: string
    instagram?: string
    facebook?: string
    github?: string
    youtube?: string
  }

  // Contact (for LocalBusiness)
  contact?: {
    email?: string
    phone?: string
    address?: {
      street?: string
      city?: string
      region?: string
      postalCode?: string
      country?: string
    }
  }

  // Default images
  defaultOgImage?: string
  logo?: string
}

/**
 * Build SEO config from environment variables.
 *
 * Environment variables (set in .env.local during onboarding):
 * - NEXT_PUBLIC_SITE_URL - Production URL (required for sitemap/canonical)
 * - NEXT_PUBLIC_SITE_NAME - Business/site name
 * - NEXT_PUBLIC_SITE_DESCRIPTION - Default meta description
 * - NEXT_PUBLIC_BUSINESS_TYPE - Organization, LocalBusiness, or Person
 * - NEXT_PUBLIC_TWITTER_URL - Twitter profile URL
 * - NEXT_PUBLIC_LINKEDIN_URL - LinkedIn profile/company URL
 * - NEXT_PUBLIC_INSTAGRAM_URL - Instagram profile URL
 * - NEXT_PUBLIC_FACEBOOK_URL - Facebook page URL
 * - NEXT_PUBLIC_GITHUB_URL - GitHub profile/org URL
 * - NEXT_PUBLIC_YOUTUBE_URL - YouTube channel URL
 */
export function getSEOConfig(): SEOConfig {
  return {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'My Website',
    siteDescription: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Welcome to our website',

    businessType: (process.env.NEXT_PUBLIC_BUSINESS_TYPE as BusinessType) || 'Organization',
    businessName:
      process.env.NEXT_PUBLIC_SITE_NAME ||
      process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE ||
      'My Business',

    // Defaults are Salt Studio's own profiles so the Organization schema's
    // sameAs works in every environment; env vars still win when set.
    socialLinks: {
      twitter: process.env.NEXT_PUBLIC_TWITTER_URL || 'https://x.com/saltstudiohq',
      linkedin:
        process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://www.linkedin.com/company/createdbysalt/',
      instagram:
        process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/createdbysalt/',
      facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL,
      github: process.env.NEXT_PUBLIC_GITHUB_URL,
      youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL,
    },

    // Logo path - relative to public folder
    logo: '/logo.svg',
    defaultOgImage: '/og-image.png',
  }
}

// Export a singleton for convenience
export const seoConfig = getSEOConfig()
