import {
  generateBreadcrumbSchema,
  generateSpeakableWebPageSchema,
  JsonLdMultiple,
} from './structured-data'

/**
 * Per-page structured data for core pages (SEO + AEO), in one component.
 *
 * Emits, in order:
 *  1. BreadcrumbList — from `breadcrumbs`
 *  2. The page's primary schema.org type — pass one of the `generate*Schema`
 *     objects (Service, LocalBusiness, Product, FAQPage, …). Optional.
 *  3. WebPage + SpeakableSpecification — the AEO block. Point `speakableSelectors`
 *     at on-page elements (e.g. `['h1', '.speakable-summary']`).
 *
 * @example
 * <CorePageSchema
 *   breadcrumbs={[{name: 'Home', url: '/'}, {name: 'Capabilities', url: '/capabilities'}]}
 *   name={headline}
 *   description={seoDescription}
 *   url="/capabilities"
 *   speakableSelectors={['h1', '.speakable-summary']}
 *   primarySchema={generateServiceSchema({ name, description, url: '/services', serviceType: 'Web design and AI development' })}
 * />
 */
export function CorePageSchema({
  breadcrumbs,
  name,
  description,
  url,
  speakableSelectors = ['h1'],
  primarySchema,
}: {
  breadcrumbs: {name: string; url: string}[]
  name: string
  description: string
  url: string
  speakableSelectors?: string[]
  primarySchema?: Record<string, unknown>
}) {
  const schemas: Record<string, unknown>[] = [generateBreadcrumbSchema(breadcrumbs)]
  if (primarySchema) schemas.push(primarySchema)
  schemas.push(generateSpeakableWebPageSchema({name, description, url, speakableSelectors}))

  return <JsonLdMultiple data={schemas} />
}
