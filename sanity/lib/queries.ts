import {defineQuery} from 'next-sanity'

export const homePageQuery = defineQuery(`
  *[_id == "home"][0]{
    _id,
    _type,
    seoTitle,
    seoDescription,
    ogImage,
    speakableSummary,
    hiddenH1,
    sections[]{
      _key,
      _type,
      enabled,
      internalName,
      _type == "homeHeroSection" => {
        headline, swapLine, subheadline, ctaLabel, ctaMicrocopy, bookingQuarter
      },
      _type == "homeProofSection" => {
        label,
        clients[]{ _key, ...@->{ _id, name, website } }
      },
      _type == "homeServicesSection" => {
        label,
        cards[]{ _key, title, body, priceLine, linkLabel }
      },
      _type == "homeWorkSection" => {
        label,
        projects[]{
          _key,
          ...@->{
            _id,
            title,
            "slug": slug.current,
            overview,
            coverImage,
            videoUrl,
            year,
            "client": client->name
          }
        },
        linkLabel
      },
      _type == "homeProductSection" => { headline, body, ctaLabel },
      _type == "homePhilosophySection" => { line1, line2 },
      _type == "homeFinalCtaSection" => { headline, body, ctaLabel, emailLine },
    },
  }
`)

// Services page singleton — the /services route ships with the frontend
// rebuild; the query is ready so typegen has the shape.
export const servicesPageQuery = defineQuery(`
  *[_id == "servicesPage"][0]{
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
      _type == "servicesHeroSection" => { headline, subheadline },
      _type == "servicesListSection" => { serviceAi, serviceSite, serviceCare },
      _type == "servicesFitSection" => {
        headline, goodFitLabel, goodFitPoints, notFitLabel, notFitPoints
      },
      _type == "servicesProcessSection" => {
        headline,
        steps[]{ _key, lead, text },
        recommendationDays,
        ctaLabel
      },
      _type == "servicesFaqSection" => { faq },
      _type == "servicesFinalCtaSection" => { headline, ctaLabel, microcopy },
    },
  }
`)

// About page singleton — the /about route ships with the frontend rebuild;
// the query is ready so typegen has the shape.
export const aboutPageQuery = defineQuery(`
  *[_id == "aboutPage"][0]{
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
      _type == "aboutOpeningSection" => { line1, line2, body },
      _type == "aboutStorySection" => { body, offHoursLine, photo },
      _type == "aboutSmallnessSection" => { headline, body },
      _type == "aboutConvictionsSection" => { headline, lines, closingLine },
      _type == "aboutProductSection" => { body, linkLabel },
      _type == "aboutClosingSection" => { body, ctaLabel, microcopy },
    },
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
    comingSoon,
    title,
    "slug": slug.current,
    seoTitle,
    seoDescription,
    ogImage,
    speakableSummary,
    overview,
    deliverables,
    sections[]{
      _key,
      _type,
      enabled,
      internalName,
      _type == "projectStatementSection" => { label, body },
      _type == "projectScopeSection" => { label, items[]{ _key, title, detail } },
      _type == "projectMediaSection" => {
        rows[]{
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
      },
      _type == "projectQuoteSection" => { quote, attribution, attributionRole },
      _type == "projectStatsSection" => { items[]{ _key, value, label } },
      _type == "projectCreditsSection" => { items[]{ _key, role, name } },
    },
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
    stack[]->{ _id, name, kind, url },
    relatedProjects[]->{ _id, title, "slug": slug.current, projectType, year, coverImage, videoUrl },
  }
`)

/** Other projects for the project-page “Next project” rail when related is empty/short. */
export const nextProjectsQuery = defineQuery(`
  *[_type == "project" && defined(slug.current) && (defined(coverImage.asset) || defined(videoUrl)) && comingSoon != true && slug.current != $slug]
    | order(featured desc, year desc, title asc)[0...3]{
    _id,
    title,
    "slug": slug.current,
    coverImage,
    videoUrl,
    year,
    "client": client->name,
  }
`)

// Card shape shared by the Work grid and category pages. A project appears
// once it has a cover image OR a video; video is optional hover flair.
export const allProjectsQuery = defineQuery(`
  *[_type == "project" && defined(slug.current) && (defined(coverImage.asset) || defined(videoUrl))]|order(year desc, title asc){
    _id,
    projectType,
    featured,
    comingSoon,
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
  *[_type == "project" && defined(slug.current) && (defined(coverImage.asset) || defined(videoUrl)) && $slug in categories[]->slug.current]|order(year desc, title asc){
    _id,
    projectType,
    featured,
    comingSoon,
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
    "capabilities": *[_type == "capability" && ^._id in categories[]._ref]
      | order(kind asc, sortOrder asc, name asc){ _id, name, kind, url, iconSlug, logo },
  }
`)

// All capabilities grouped for "what we work with" displays and the marquee.
export const capabilitiesQuery = defineQuery(`
  *[_type == "capability"] | order(kind asc, sortOrder asc, name asc){
    _id,
    name,
    kind,
    url,
    iconSlug,
    logo,
    categories[]->{ _id, filterLabel, "slug": slug.current },
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
      comingSoon,
      title,
      "slug": slug.current,
      overview,
      coverImage,
      videoUrl,
      year,
      "client": client->name,
      categories[]->{ _id, filterLabel, "slug": slug.current },
    }[defined(_id) && (defined(coverImage.asset) || defined(videoUrl))],
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
      _type == "contactBookingSection" => { calLink, fallbackNote },
      _type == "contactCallDetailsSection" => { label, bullets[]{ _key, lead, text }, recommendationDays },
      _type == "contactDirectSection" => { directContactLine },
      _type == "contactFormSection" => { formConfig },
      _type == "contactFooterSection" => { email, cityTimezone, responseLine },
    },
  }
`)

