# lib/seo/

SEO and AEO (Answer Engine Optimization) utilities for client websites. Handles structured data, meta configuration, and AI-assistant optimization.

## Architecture

```
lib/seo/
├── index.ts              # Barrel exports
├── config.ts             # Environment-driven SEO configuration
├── structured-data.tsx   # JSON-LD schema generators + components
└── CLAUDE.md             # This file
```

**Related files:**
- `app/sitemap.ts` — Dynamic sitemap generation
- `app/robots.ts` — Robots.txt configuration
- `app/(personal)/layout.tsx` — Site-wide metadata + `<SiteStructuredData />`

## Quick Start

### 1. Site-wide structured data (already set up)

The `(personal)` layout includes `<SiteStructuredData />` which renders Organization + WebSite schemas:

```tsx
// app/(personal)/layout.tsx
import {SiteStructuredData} from '@/lib/seo'

export default function Layout({children}) {
  return (
    <>
      <SiteStructuredData />
      {children}
    </>
  )
}
```

### 2. Page-specific structured data

Add structured data components to individual pages:

```tsx
// app/(personal)/services/page.tsx
import {ServiceStructuredData, BreadcrumbStructuredData} from '@/lib/seo'

export default function ServicesPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          {name: 'Home', url: '/'},
          {name: 'Services', url: '/services'},
        ]}
      />
      <ServiceStructuredData
        name="Web Development"
        description="Custom web development services for growing businesses"
        url="/services"
        serviceType="Web Development"
        areaServed="United States"
      />
      {/* Page content */}
    </>
  )
}
```

## Available Schemas

### Core Schemas (Site-wide)

| Component | Schema Type | Use Case |
|-----------|-------------|----------|
| `<SiteStructuredData />` | Organization + WebSite | Root layout (already added) |

### Page-Level Schemas

| Component | Schema Type | Use Case |
|-----------|-------------|----------|
| `<BreadcrumbStructuredData />` | BreadcrumbList | Any interior page |
| `<ArticleStructuredData />` | Article | Blog posts, news |
| `<FAQStructuredData />` | FAQPage | Pages with Q&A sections |
| `<ServiceStructuredData />` | Service | Service/offering pages |
| `<HowToStructuredData />` | HowTo | Tutorials, guides |
| `<CreativeWorkStructuredData />` | CreativeWork | Portfolio, case studies |
| `<SpeakableWebPage />` | WebPage + Speakable | AEO-optimized pages |

### Generator Functions

For custom schemas or combining multiple types:

```tsx
import {
  generateArticleSchema,
  generateFAQSchema,
  addSpeakable,
  JsonLd,
} from '@/lib/seo'

// Combine Article + FAQ + Speakable
const articleSchema = addSpeakable(
  generateArticleSchema({
    title: 'How to Build a Website',
    description: 'Complete guide...',
    url: '/blog/how-to-build-website',
    datePublished: '2024-01-15',
  }),
  ['h1', '.summary', '.key-takeaways']
)

const faqSchema = generateFAQSchema([
  {question: 'How long does it take?', answer: '4-6 weeks typically.'},
])

// Render both
<>
  <JsonLd data={articleSchema} />
  <JsonLd data={faqSchema} />
</>
```

## Adding Structured Data to New Page Types

### Step-by-step checklist

When adding a new page type (e.g., `/team`, `/case-studies/[slug]`):

1. **Identify the primary schema type**
   - Service page → `ServiceStructuredData`
   - Team/About → `SpeakableWebPage` (with key content selectors)
   - Blog post → `ArticleStructuredData`
   - Portfolio item → `CreativeWorkStructuredData`
   - FAQ section → `FAQStructuredData`
   - Tutorial → `HowToStructuredData`

2. **Add breadcrumbs** (always, for interior pages)
   ```tsx
   <BreadcrumbStructuredData
     items={[
       {name: 'Home', url: '/'},
       {name: 'Section', url: '/section'},
       {name: 'Current Page', url: '/section/current'},
     ]}
   />
   ```

3. **Add primary schema** with all available data

4. **Add speakable** for key pages (homepage, about, services)
   ```tsx
   <SpeakableWebPage
     name="About Us"
     description="..."
     url="/about"
     speakableSelectors={['h1', '.hero-text', '.value-proposition']}
   />
   ```

5. **Test with Google Rich Results Test**
   - https://search.google.com/test/rich-results

### Example: New project detail page

```tsx
// app/(personal)/projects/[slug]/page.tsx
import {
  BreadcrumbStructuredData,
  CreativeWorkStructuredData,
  addSpeakable,
  generateCreativeWorkSchema,
  JsonLd,
} from '@/lib/seo'

export default async function ProjectPage({params}) {
  const {slug} = await params
  const project = await getProject(slug)

  // For important projects, add speakable
  const schema = addSpeakable(
    generateCreativeWorkSchema({
      name: project.title,
      description: project.description,
      url: `/projects/${slug}`,
      image: project.image,
      client: project.client,
      datePublished: project.publishedAt,
    }),
    ['h1', '.project-summary', '.results']
  )

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          {name: 'Home', url: '/'},
          {name: 'Projects', url: '/projects'},
          {name: project.title, url: `/projects/${slug}`},
        ]}
      />
      <JsonLd data={schema} />
      {/* Page content */}
    </>
  )
}
```

## AEO (Answer Engine Optimization)

AEO optimizes content for AI assistants (ChatGPT, Google Gemini, Alexa, Siri) that answer questions directly rather than showing search results.

### Key AEO strategies

1. **Speakable markup** — Tell AI which content to read aloud
2. **FAQ schema** — Direct answers to common questions
3. **HowTo schema** — Step-by-step instructions AI can summarize
4. **Clear, concise content** — AI prefers direct answers

### Adding speakable content

Use CSS selectors to mark content AI should prioritize:

```tsx
import {SpeakableWebPage} from '@/lib/seo'

<SpeakableWebPage
  name="Our Services"
  description="Digital services for modern businesses"
  url="/services"
  speakableSelectors={[
    'h1',                    // Page title
    '.hero-description',     // Main value prop
    '.service-summary',      // Key offerings
    '.pricing-overview',     // Pricing info (if applicable)
  ]}
/>
```

### Best selectors for speakable

| Content Type | Suggested Selectors |
|--------------|---------------------|
| Hero section | `h1`, `.hero-text`, `.tagline` |
| Value proposition | `.value-prop`, `.benefits` |
| Key facts | `.key-stats`, `.highlights` |
| Summaries | `.summary`, `.tldr`, `.overview` |
| Pricing | `.pricing`, `.price-summary` |
| Contact | `.contact-info`, `.cta-text` |

### FAQ for AEO

FAQs are extremely valuable for AEO — AI assistants often pull answers directly:

```tsx
<FAQStructuredData
  faqs={[
    {
      question: "How much does web development cost?",
      answer: "Our web development projects typically range from $5,000 to $50,000 depending on complexity, features, and timeline."
    },
    {
      question: "How long does a website take to build?",
      answer: "Most websites take 4-8 weeks from kickoff to launch, though complex projects may take 12+ weeks."
    },
  ]}
/>
```

## Environment Configuration

Set these in `.env.local` during client onboarding:

```bash
# Required for sitemap/canonical URLs
NEXT_PUBLIC_SITE_URL=https://clientsite.com

# Site identity
NEXT_PUBLIC_SITE_NAME=Client Name
NEXT_PUBLIC_SITE_DESCRIPTION=Brief description for meta tags

# Business type for structured data
NEXT_PUBLIC_BUSINESS_TYPE=Organization  # or LocalBusiness, Person

# Social links (for Organization sameAs)
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/client
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/client
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/client
```

## Sitemap Configuration

The sitemap at `app/sitemap.ts` automatically includes:
- Homepage
- All Sanity `page` documents
- All Sanity `project` documents
- All Sanity `legalPage` documents

### Adding new content types to sitemap

```tsx
// app/sitemap.ts
const [pages, projects, legalPages, newType] = await Promise.all([
  // ... existing queries
  client.fetch<{slug: string; _updatedAt: string}[]>(
    `*[_type == "newType" && defined(slug.current)]{
      "slug": slug.current,
      _updatedAt
    }`,
    {},
    {next: {revalidate: 3600}}
  ),
])

// Add to sitemap entries
const newTypeEntries: SitemapEntry[] = newType.map((item) => ({
  url: `${siteUrl}/new-type/${item.slug}`,
  lastModified: new Date(item._updatedAt),
  changeFrequency: 'monthly',
  priority: 0.7,
}))

return [...staticPages, ...pageEntries, ...projectEntries, ...legalEntries, ...newTypeEntries]
```

## Testing Checklist

Before launching a client site:

- [ ] **Google Rich Results Test** — https://search.google.com/test/rich-results
- [ ] **Schema.org Validator** — https://validator.schema.org/
- [ ] **Sitemap accessible** — `https://site.com/sitemap.xml`
- [ ] **Robots.txt correct** — `https://site.com/robots.txt`
- [ ] **Open Graph preview** — Use social media debuggers
- [ ] **Speakable on key pages** — Homepage, About, Services

## Common Patterns

### Blog with articles

```tsx
// app/(personal)/blog/[slug]/page.tsx
<ArticleStructuredData
  title={post.title}
  description={post.excerpt}
  url={`/blog/${slug}`}
  image={post.coverImage}
  datePublished={post.publishedAt}
  dateModified={post.updatedAt}
  authorName={post.author?.name}
/>
```

### Services page with FAQ

```tsx
// app/(personal)/services/page.tsx
<>
  <ServiceStructuredData
    name="Our Services"
    description="Full-service digital agency"
    url="/services"
    serviceType="Digital Marketing"
  />
  <FAQStructuredData
    faqs={serviceFaqs}
  />
</>
```

### Portfolio with multiple projects

```tsx
// app/(personal)/projects/page.tsx (list page)
// No special schema needed — individual project pages have CreativeWork

// app/(personal)/projects/[slug]/page.tsx (detail page)
<CreativeWorkStructuredData
  name={project.title}
  description={project.description}
  url={`/projects/${slug}`}
  client={project.client}
  datePublished={project.completedAt}
  keywords={project.tags}
/>
```

### Local business with location

```tsx
// For clients with physical locations
import {generateLocalBusinessSchema, JsonLd} from '@/lib/seo'

const schema = generateLocalBusinessSchema({
  name: 'Client Business Name',
  description: 'A local business serving the community',
  phone: '+1-555-123-4567',
  email: 'hello@client.com',
  address: {
    street: '123 Main St',
    city: 'Austin',
    region: 'TX',
    postalCode: '78701',
    country: 'US',
  },
  openingHours: ['Mo-Fr 09:00-17:00'],
  priceRange: '$$',
})

<JsonLd data={schema} />
```

## Extending for New Schema Types

If you need a schema type not included:

1. Add generator function in `structured-data.tsx`:
   ```tsx
   export function generateNewTypeSchema(data: {...}, config = seoConfig) {
     return {
       '@context': 'https://schema.org',
       '@type': 'NewType',
       // ... properties
     }
   }
   ```

2. Add component wrapper:
   ```tsx
   export function NewTypeStructuredData({...props}) {
     const schema = generateNewTypeSchema(props)
     return <JsonLd data={schema} />
   }
   ```

3. Export from `index.ts`

4. Update this documentation

Reference: https://schema.org/docs/full.html
