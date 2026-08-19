import {client} from '@/sanity/lib/client'
import type {MetadataRoute} from 'next'

// Site URL from environment - set during client onboarding
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000'

type SitemapEntry = MetadataRoute.Sitemap[number]

/**
 * Dynamic sitemap that pulls all published content from Sanity.
 *
 * Configure NEXT_PUBLIC_SITE_URL in .env.local during client setup.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: SitemapEntry[] = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/work`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/capabilities`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/legal`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Fetch all dynamic content from Sanity
  const [pages, projects, legalPages, workCategories, people] = await Promise.all([
    // Regular pages
    client.fetch<{slug: string; _updatedAt: string}[]>(
      `*[_type == "page" && defined(slug.current)]{
        "slug": slug.current,
        _updatedAt
      }`,
      {},
      {next: {revalidate: 3600}}, // Cache for 1 hour
    ),
    // Projects
    client.fetch<{slug: string; _updatedAt: string}[]>(
      `*[_type == "project" && defined(slug.current) && hidden != true]{
        "slug": slug.current,
        _updatedAt
      }`,
      {},
      {next: {revalidate: 3600}},
    ),
    // Legal pages
    client.fetch<{slug: string; _updatedAt: string}[]>(
      `*[_type == "legalPage" && defined(slug.current)]{
        "slug": slug.current,
        _updatedAt
      }`,
      {},
      {next: {revalidate: 3600}},
    ),
    // Work category landing pages
    client.fetch<{slug: string; _updatedAt: string}[]>(
      `*[_type == "workCategory" && defined(slug.current)]{
        "slug": slug.current,
        _updatedAt
      }`,
      {},
      {next: {revalidate: 3600}},
    ),
    client.fetch<{slug: string; _updatedAt: string}[]>(
      `*[_type == "person" && defined(slug.current)]{
        "slug": slug.current,
        _updatedAt
      }`,
      {},
      {next: {revalidate: 3600}},
    ),
  ])

  // Map pages to sitemap entries
  const pageEntries: SitemapEntry[] = pages.map((page) => ({
    url: `${siteUrl}/${page.slug}`,
    lastModified: new Date(page._updatedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const projectEntries: SitemapEntry[] = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified: new Date(project._updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const legalEntries: SitemapEntry[] = legalPages.map((legal) => ({
    url: `${siteUrl}/legal/${legal.slug}`,
    lastModified: new Date(legal._updatedAt),
    changeFrequency: 'yearly',
    priority: 0.3,
  }))

  const workCategoryEntries: SitemapEntry[] = workCategories.map((category) => ({
    url: `${siteUrl}/work/${category.slug}`,
    lastModified: new Date(category._updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const personEntries: SitemapEntry[] = people.map((person) => ({
    url: `${siteUrl}/${person.slug}`,
    lastModified: new Date(person._updatedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    ...staticPages,
    ...pageEntries,
    ...personEntries,
    ...projectEntries,
    ...legalEntries,
    ...workCategoryEntries,
  ]
}
