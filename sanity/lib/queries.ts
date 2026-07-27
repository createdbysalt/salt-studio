import {defineQuery} from 'next-sanity'

// Fields the homepage video hero needs from each project. Shared across the
// three showcase-source branches (manual / featured / by-type) so they always
// return the same shape.
const showcaseProjectFields = `
  _id,
  _type,
  coverImage,
  overview,
  "slug": slug.current,
  title,
  videoUrl,
  role,
  year
`

export const homePageQuery = defineQuery(`
  *[_id == "home"][0]{
    _id,
    _type,
    seoTitle,
    seoDescription,
    ogImage,
    speakableSummary,
    hiddenH1,
    heroCtaLabel,
    clientSource,
    cta->{ _id, subhead, buttonLabel, link, contactSubject },
    "showcaseProjects": select(
      showcaseSource == "all" =>
        *[_type == "project" && defined(slug.current) && defined(videoUrl)]
          | order(year desc, title asc){ "_key": _id, ${showcaseProjectFields} },
      showcaseSource == "featured" =>
        *[_type == "project" && featured == true && defined(slug.current) && defined(videoUrl)]
          | order(year desc, title asc){ "_key": _id, ${showcaseProjectFields} },
      showcaseSource == "type" =>
        *[_type == "project" && projectType == ^.showcaseType && defined(slug.current) && defined(videoUrl)]
          | order(year desc, title asc){ "_key": _id, ${showcaseProjectFields} },
      showcaseProjects[]{ _key, ...@->{ ${showcaseProjectFields} } }[defined(videoUrl)]
    ),
    "marqueeClients": select(
      clientSource == "manual" =>
        clientList[]{ "_key": _key, ...@->{ _id, name, website } },
      clientSource == "all" =>
        *[_type == "client" && defined(name)]
          | order(sortOrder asc, name asc){ "_key": _id, _id, name, website },
      clientSource == "known" =>
        *[_type == "client" && tier == "known" && defined(name)]
          | order(sortOrder asc, name asc){ "_key": _id, _id, name, website },
      clientSource == "less-known" =>
        *[_type == "client" && tier == "less-known" && defined(name)]
          | order(sortOrder asc, name asc){ "_key": _id, _id, name, website },
      *[_type == "client" && tier == "known" && defined(name)]
        | order(sortOrder asc, name asc){ "_key": _id, _id, name, website }
    ),
  }
`)

export const pagesBySlugQuery = defineQuery(`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    _type,
    body[]{
      ...,
      _type == "ctaRef" => {
        "cta": @->{subhead, buttonLabel, link, contactSubject}
      }
    },
    overview,
    title,
    "slug": slug.current,
  }
`)

export const projectBySlugQuery = defineQuery(`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    _type,
    projectType,
    title,
    "slug": slug.current,
    seoTitle,
    seoDescription,
    ogImage,
    speakableSummary,
    overview,
    context,
    btsNote,
    brief,
    approach,
    result,
    showTestimonials,
    "testimonials": *[_type == "testimonial" && project._ref == ^._id] | order(_createdAt asc){
      _id, quote, author, role
    },
    coverImage,
    videoUrl,
    gallery[]{
      _key,
      _type,
      items[]{
        _key,
        _type,
        _type == "projectGalleryPhoto" => {
          image{ asset, alt, caption, hotspot, crop },
        },
        _type == "projectGalleryVideo" => {
          videoUrl,
          caption,
          poster{ asset, alt, hotspot, crop },
        },
      },
    },
    btsImages[]{
      _key,
      _type,
      items[]{
        _key,
        _type,
        _type == "projectGalleryPhoto" => {
          image{ asset, alt, caption, hotspot, crop },
        },
        _type == "projectGalleryVideo" => {
          videoUrl,
          caption,
          poster{ asset, alt, hotspot, crop },
        },
      },
    },
    role,
    year,
    site,
    siteButtonLabel,
    client->{ _id, name, website },
    categories[]->{ _id, filterLabel, "slug": slug.current },
    relatedProjects[]->{ _id, title, "slug": slug.current, projectType, year, coverImage, videoUrl },
  }
`)

// Card shape shared by the Work grid and category pages.
export const allProjectsQuery = defineQuery(`
  *[_type == "project" && defined(slug.current) && defined(videoUrl)]|order(year desc, title asc){
    _id,
    projectType,
    featured,
    title,
    "slug": slug.current,
    overview,
    coverImage,
    videoUrl,
    year,
    "client": client->name,
    categories[]->{ _id, filterLabel, "slug": slug.current },
  }
`)

// Projects in one category, by the category's slug (for /work/[slug]).
export const projectsByCategoryQuery = defineQuery(`
  *[_type == "project" && defined(slug.current) && defined(videoUrl) && $slug in categories[]->slug.current]|order(year desc, title asc){
    _id,
    projectType,
    featured,
    title,
    "slug": slug.current,
    overview,
    coverImage,
    videoUrl,
    year,
    "client": client->name,
    categories[]->{ _id, filterLabel, "slug": slug.current },
  }
`)

// All work categories, for the Work page filter bar (alphabetical by label).
export const workCategoriesQuery = defineQuery(`
  *[_type == "workCategory" && defined(slug.current)]|order(filterLabel asc){
    _id,
    filterLabel,
    "slug": slug.current,
  }
`)

// A single work category landing page, by slug (for /work/[category]).
export const workCategoryBySlugQuery = defineQuery(`
  *[_type == "workCategory" && slug.current == $slug][0]{
    _id,
    _type,
    filterLabel,
    "slug": slug.current,
    headline,
    subhead,
    seoTitle,
    seoDescription,
  }
`)

// Featured projects (both standard and case study) for home / highlight views.
export const featuredProjectsQuery = defineQuery(`
  *[_type == "project" && featured == true && defined(slug.current)]|order(year desc, title asc){
    _id,
    projectType,
    featured,
    title,
    "slug": slug.current,
    overview,
    coverImage,
    videoUrl,
    year,
    "client": client->name,
    categories[]->{ _id, filterLabel, "slug": slug.current },
  }
`)

// Clients flagged for the home "SELECTED CLIENTS" strip, in editor order.
export const clientRosterQuery = defineQuery(`
  *[_type == "client" && featured == true]|order(sortOrder asc, name asc){
    _id,
    name,
    website,
    logo,
  }
`)

export const settingsQuery = defineQuery(`
  *[_type == "settings"][0]{
    _id,
    _type,
    siteName,
    siteDescription,
    footerSocial[]{
      _key,
      platform,
      label,
      href,
      customIcon,
    },
    showFooterLegal,
    showBuiltWithCredit,
    logo,
    menuItems[]{
      _key,
      label,
      "link": link->{
        _type,
        "slug": slug.current,
        title
      },
      children[]{
        _key,
        label,
        "link": link->{
          _type,
          "slug": slug.current,
          title
        }
      }
    },
    ogImage,
    socialLinks,
    projectBodyBackgroundVideo,
  }
`)

/** Ambient loop for the project detail two-column body (Settings only — no cross-project CDN fallback). */
export const projectBodyBackgroundVideoQuery = defineQuery(`
  *[_type == "settings"][0].projectBodyBackgroundVideo.asset->url
`)

export const slugsByTypeQuery = defineQuery(`
  *[_type == $type && defined(slug.current)]{"slug": slug.current}
`)

export const developerSettingsQuery = defineQuery(`
  *[_type == "developerSettings"][0]{
    clientGoogleAnalyticsId
  }
`)

// Legal pages
export const legalPageBySlugQuery = defineQuery(`
  *[_type == "legalPage" && slug.current == $slug][0] {
    _id,
    _type,
    pageType,
    title,
    "slug": slug.current,
    overview,
    contentSource,
    policyUrl,
    introText,
    content,
    effectiveDate,
    version,
    lastUpdated,
  }
`)

export const allLegalPagesQuery = defineQuery(`
  *[_type == "legalPage" && defined(slug.current)] | order(pageType asc) {
    _id,
    _type,
    pageType,
    title,
    "slug": slug.current,
    overview,
    effectiveDate,
    version,
  }
`)

/** Footer strip — every published legal page, ordered Privacy → Terms → Cookies → Accessibility. */
export const footerLegalPagesQuery = defineQuery(`
  *[_type == "legalPage" && defined(slug.current)] | order(
    select(
      pageType == "privacy" => 0,
      pageType == "terms" => 1,
      pageType == "cookies" => 2,
      pageType == "accessibility" => 3,
      4
    ) asc,
    title asc
  ) {
    _type,
    title,
    pageType,
    "slug": slug.current,
  }
`)

// 404 page
export const notFoundPageQuery = defineQuery(`
  *[_type == "notFoundPage"][0] {
    _id,
    _type,
    headline,
    message,
    ctaText,
    ctaLink,
    secondaryCtaText,
    secondaryCtaLink,
    footerTagline,
    suggestedLinks[]-> {
      _id,
      _type,
      title,
      "slug": slug.current,
    },
  }
`)

export const errorPageQuery = defineQuery(`
  *[_type == "errorPage"][0]{
    _id,
    _type,
    eyebrow,
    headline,
    message,
    retryButtonText,
    homeButtonText,
    homeButtonLink,
  }
`)

export const workPageQuery = defineQuery(`
  *[_id == "workPage"][0]{
    _id,
    _type,
    headline,
    subhead,
    projectSource,
    // Hand-picked grid (manual mode) — same card shape as allProjectsQuery.
    curatedProjects[]->{
      _id,
      projectType,
      featured,
      title,
      "slug": slug.current,
      overview,
      coverImage,
      videoUrl,
      year,
      "client": client->name,
      categories[]->{ _id, filterLabel, "slug": slug.current },
    }[defined(_id) && defined(videoUrl)],
    pillSource,
    categoryPills[]->{ _id, filterLabel, "slug": slug.current },
    videoPlayback,
    emptyState,
    seoTitle,
    seoDescription,
    ogImage,
    speakableSummary,
  }
`)

export const contactPageQuery = defineQuery(`
  *[_id == "contactPage"][0]{
    _id,
    _type,
    seoTitle,
    seoDescription,
    ogImage,
    speakableSummary,
    sections[]{
      _key,
      _type,
      enabled,
      internalName,
      _type == "contactHeroSection" => { headline, lead },
      _type == "contactDirectSection" => { directContactLine },
      _type == "contactFormSection" => { formConfig },
    },
  }
`)

