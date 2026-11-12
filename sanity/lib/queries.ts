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
        headline, swapLine, subheadline, ctaLabel, ctaMicrocopy, bookingQuarter,
        splitPrimaryLeft, splitPrimaryRight, splitSecondaryLeft, splitSecondaryRight
      },
      _type == "homeProofSection" => {
        label,
        clients[]{ _key, ...@->{ _id, name, website } }
      },
      _type == "homeServicesSection" => {
        label,
        services[]{
          _key,
          ...@->{
            _id,
            title,
            "slug": slug.current,
            headline,
            shortDescription,
            priceLine,
            timelineLine,
            linkLabel,
            timeline[]{ _key, label, duration, detail },
            deliverables[]{ _key, title, detail },
            plans[]{ _key, name, price, summary, features, highlight },
            capabilities[]->{ _id, name, kind },
            idealFor,
            notAFit,
            detailEyebrow,
            detailBody,
            sceneLine,
            stepsLabel,
            steps[]{ _key, lead, text },
            detailImage{ asset, alt, hotspot, crop },
            backgroundImage{ asset, alt, hotspot, crop },
            backgroundVideoUrl,
            featuredProjects[]->{
              _id,
              title,
              "slug": slug.current,
              coverImage,
              "client": client->name,
              "thought": pt::text(overview),
              hidden
            },
            testimonials[]->{
              _id,
              quote,
              author,
              role
            },
            clients[]->{ _id, name },
            proofAnchor,
            nextStep->{
              _id,
              subhead,
              buttonLabel,
              link,
              contactSubject
            },
            fitCheckLabel,
            fitCheckHref,
            routingLine
          }
        },
        cards[]{
          _key,
          title,
          body,
          priceLine,
          linkLabel,
          detailEyebrow,
          detailBody,
          detailImage{ asset, alt, hotspot, crop },
          hoverImage{ asset, alt, hotspot, crop },
          backgroundVideoUrl,
        }
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
            "client": client->name,
            featured,
            hidden
          }
        },
        linkLabel
      },
      _type == "homeProductSection" => { headline, body, ctaLabel },
      _type == "homePhilosophySection" => { line1, line2 },
      _type == "homeFinalCtaSection" => {
        headline,
        body,
        emailLine,
        cta->{
          buttonLabel,
          link,
          contactSubject
        }
      },
    },
  }
`)

// Services page singleton — the /services route ships with the frontend
// rebuild; the query is ready so typegen has the shape.
export const servicesPageQuery = defineQuery(`
  *[_id == "servicesPage"][0]{
    _id,
    _type,
    capabilitiesHeadline,
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
    hidden,
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
              source,
              videoUrl,
              caption,
              poster{ asset, alt, hotspot, crop },
              "videoFileUrl": videoFile.asset->url,
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
      _type == "projectGalleryPhoto" => {
        image{ asset, alt, caption, hotspot, crop },
      },
      _type == "projectGalleryVideo" => {
        source,
        videoUrl,
        caption,
        poster{ asset, alt, hotspot, crop },
        "videoFileUrl": videoFile.asset->url,
      },
      // Legacy row shape (pre–Gallery tab) — flatten on the frontend if present.
      _type in ["projectGalleryRowOne", "projectGalleryRowTwo"] => {
        items[]{
          _key,
          _type,
          _type == "projectGalleryPhoto" => {
            image{ asset, alt, caption, hotspot, crop },
          },
          _type == "projectGalleryVideo" => {
            source,
            videoUrl,
            caption,
            poster{ asset, alt, hotspot, crop },
            "videoFileUrl": videoFile.asset->url,
          },
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
          source,
          videoUrl,
          caption,
          poster{ asset, alt, hotspot, crop },
          "videoFileUrl": videoFile.asset->url,
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
    relatedProjects[]->{
      _id,
      title,
      "slug": slug.current,
      projectType,
      year,
      coverImage,
      videoUrl,
      hidden
    },
  }
`)

/** Other projects for the project-page “Next project” rail when related is empty/short. */
export const nextProjectsQuery = defineQuery(`
  *[_type == "project" && defined(slug.current) && (defined(coverImage.asset) || defined(videoUrl)) && comingSoon != true && hidden != true && slug.current != $slug]
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
  *[_type == "project" && defined(slug.current) && hidden != true && (defined(coverImage.asset) || defined(videoUrl))]|order(featured desc, year desc, _createdAt desc, title asc){
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
    _createdAt,
    "client": client->name,
    categories[]->{ _id, filterLabel, "slug": slug.current },
  }
`)

// Projects in one category, by the category's slug (for /work/[slug]).
export const projectsByCategoryQuery = defineQuery(`
  *[_type == "project" && defined(slug.current) && hidden != true && (defined(coverImage.asset) || defined(videoUrl)) && $slug in categories[]->slug.current]|order(featured desc, year desc, _createdAt desc, title asc){
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
    _createdAt,
    "client": client->name,
    categories[]->{ _id, filterLabel, "slug": slug.current },
  }
`)

// All work categories, for the Work page filter bar (alphabetical by label).
export const workCategoriesQuery = defineQuery(`
  *[_type == "workCategory" && defined(slug.current) && count(*[_type == "project" && hidden != true && defined(slug.current) && ^._id in categories[]._ref]) > 0]|order(filterLabel asc){
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
  *[_type == "project" && featured == true && hidden != true && defined(slug.current)]|order(year desc, title asc){
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
  *[_type == $type && defined(slug.current) && hidden != true]{"slug": slug.current}
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
      hidden,
      title,
      "slug": slug.current,
      overview,
      coverImage,
      videoUrl,
      year,
      _createdAt,
      "client": client->name,
      categories[]->{ _id, filterLabel, "slug": slug.current },
    },
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

export const quizBySlugQuery = defineQuery(`
  *[_type == "quiz" && slug.current == $slug][0]{
    _id,
    _type,
    title,
    "slug": slug.current,
    "serviceTitle": service->title,
    introHeadline,
    introBody,
    startLabel,
    questions[]{
      _key,
      "key": key.current,
      prompt,
      hint,
      shortLabel,
      kind,
      weight,
      options[]{ _key, label, points },
    },
    scoreUnit,
    bands[]{
      _key,
      label,
      minScore,
      resultHeadline,
      resultBody,
      benefits,
      ctaLead,
      primaryCtaLabel,
      primaryCtaHref,
      secondaryCtaLabel,
      secondaryCtaHref,
    },
    gateHeadline,
    gateBody,
    gateButtonLabel,
    waitlistLabel,
  }
`)

export const quizSlugsQuery = defineQuery(`
  *[_type == "quiz" && defined(slug.current)]{"slug": slug.current}
`)

export const personBySlugQuery = defineQuery(`
  *[_type == "person" && slug.current == $slug][0]{
    _id,
    _type,
    name,
    shortName,
    "slug": slug.current,
    role,
    headline,
    photo,
    location,
    availability,
    body,
    showStudioVideo,
    principles[]{ _key, title, body },
    highlights[]{ _key, metric, label },
    cases[]{
      _key,
      title,
      role,
      problem,
      whatTheyDid,
      result,
      year,
      "relatedProject": relatedProject->{ _id, title, "slug": slug.current }
    },
    howTheyWork,
    studioNote,
    email,
    linkedinUrl,
    "resumeUrl": resume.asset->url,
    primaryCta,
    seoTitle,
    seoDescription,
    ogImage,
    sortOrder
  }
`)

export const peopleQuery = defineQuery(`
  *[_type == "person" && defined(slug.current)]|order(sortOrder asc, name asc){
    _id,
    _type,
    name,
    shortName,
    "slug": slug.current,
    role,
    headline,
    photo,
    location,
    availability,
    body,
    showStudioVideo,
    principles[]{ _key, title, body },
    highlights[]{ _key, metric, label },
    cases[]{
      _key,
      title,
      role,
      problem,
      whatTheyDid,
      result,
      year,
      "relatedProject": relatedProject->{ _id, title, "slug": slug.current }
    },
    howTheyWork,
    studioNote,
    email,
    linkedinUrl,
    "resumeUrl": resume.asset->url,
    primaryCta,
    seoTitle,
    seoDescription,
    ogImage,
    sortOrder
  }
`)

export const personSlugsQuery = defineQuery(`
  *[_type == "person" && defined(slug.current)]{"slug": slug.current}
`)

export const clientPortalBySlugQuery = defineQuery(`
  *[_type == "clientPortal" && slug.current == $slug][0]{
    _id,
    _type,
    name,
    "slug": slug.current,
    serviceType,
    clientType,
    "hasOverview": defined(projectPhases),
    "hasChecklist": defined(checklistTemplate),
    "hasForms": defined(formsTemplate),
    "checklistSource": checklistTemplate->{
      categories[]{
        _key,
        title,
        description,
        items[]{
          _key,
          title,
          description,
          required,
          link,
          linkLabel
        }
      }
    },
    "formsSource": formsTemplate->{
      heading,
      description,
      items[]{
        _key,
        title,
        description,
        required,
        link,
        linkLabel
      }
    },
    "projectPhases": projectPhases->{
      heading,
      phases[]{ _key, name, note }
    },
    activePhase,
    sharedFolderUrl,
    brandingFolderUrl,
    mediaFolderUrl,
    previewUrl,
    productionUrl,
    whatsappGroupUrl,
    "contentDue": coalesce(contentDue, checklistDue, formsDue),
    launchEstimate,
    enabled,
    checklist[]{
      _key,
      title,
      description,
      items[]{
        _key,
        title,
        description,
        required,
        link,
        linkLabel,
        done
      }
    }
  }
`)

export const clientPortalAuthQuery = defineQuery(`
  *[_type == "clientPortal" && slug.current == $slug][0]{
    _id,
    enabled,
    password
  }
`)

export const clientPortalAuthShellQuery = defineQuery(`
  *[_type == "clientPortal" && slug.current == $slug][0]{
    _id,
    enabled
  }
`)

export const clientPortalShellBySlugQuery = defineQuery(`
  *[_type == "clientPortal" && slug.current == $slug][0]{
    _id,
    name,
    enabled
  }
`)

export const clientPortalAutomationByIdQuery = defineQuery(`
  *[_type == "clientPortal" && _id == $projectId][0]{
    _id,
    name,
    enabled,
    "slug": slug.current,
    "clientRef": client._ref,
    "checklistSource": checklistTemplate->{
      categories[]{
        items[]{
          _key,
          title,
          link
        }
      }
    },
    "formsSource": formsTemplate->{
      items[]{
        _key,
        title,
        link
      }
    }
  }
`)

export const clientPortalSlugsQuery = defineQuery(`
  *[_type == "clientPortal" && defined(slug.current) && enabled != false]{"slug": slug.current}
`)

/**
 * The name on the sign-in page. Prices, scope, and legal details stay on
 * `proposalByTokenQuery`, which runs only after the gate cookie is valid.
 */
export const proposalGateIdentityQuery = defineQuery(`
  *[_type == "proposal" && token == $key][0]{
    _id,
    clientDisplayName
  }
`)

/**
 * One proposal, loaded by its unguessable link key.
 * The card price is `amount` on each package and add-on. Charging reads
 * the same field on the server through lib/proposal/quote.ts.
 */
export const proposalByTokenQuery = defineQuery(`
  *[_type == "proposal" && token == $key][0]{
    _id,
    status,
    clientDisplayName,
    clientLegalName,
    signerName,
    signerEmail,
    clientLogo{ asset, alt, hotspot, crop },
    validUntil,
    kickoffOptions[]{ _key, label, date },
    sameDayOffer{ enabled, bonusTitle, bonusDetail, deadline },
    packages[]->{
      _id,
      name,
      summary,
      amount,
      includedItems,
      scope,
      deliverables[]{ _key, name, description, phase, acceptanceCriteria },
      outOfScope[]{ _key, text },
      phases[]{ _key, name, summary, weeks },
      paymentSchedule->{
        _id,
        name,
        steps[]{ _key, percent, trigger }
      }
    },
    "recommendedPackageId": recommendedPackage._ref,
    addOns[]->{
      _id,
      name,
      line,
      amount,
      scope,
      deliverables[]{ _key, name, description, phase, acceptanceCriteria },
      outOfScope[]{ _key, text }
    },
    paymentSchedule->{
      _id,
      name,
      steps[]{ _key, percent, trigger }
    },
    msa->{
      _id,
      version,
      effectiveDate,
      "pdfUrl": pdf.asset->url,
      body
    },
    sections[]{
      _key,
      _type,
      enabled,
      _type == "proposalCoverSection" => {
        outcomeHeadline,
        headlineEmphasis,
        effectPhrase,
        preparedBy,
        coverImage{ asset, alt, hotspot, crop }
      },
      _type == "proposalSituationSection" => {
        problemLine,
        cards[]{ _key, icon, title, quote }
      },
      _type == "proposalOutcomesSection" => { heading, cards[]{ _key, title, body } },
      _type == "proposalPhasesSection" => {
        heading,
        intro,
        phases[]{ _key, name, summary, weeks },
        questionsHeading,
        questions[]{ _key, question, answer }
      },
      _type == "proposalProofSection" => {
        eyebrow,
        heading,
        projects[]{
          _key,
          note,
          project->{
            _id,
            title,
            "slug": slug.current,
            year,
            coverImage,
            videoUrl,
            "clientName": client->name,
            "stats": sections[_type == "projectStatsSection" && enabled != false][0].items[]{
              _key,
              value,
              label
            }
          }
        },
        testimonials[]->{ _id, quote, author, role }
      },
      _type == "proposalPackagesSection" => {
        heading,
        intro,
        sameDayDiscount{ enabled, percent }
      },
      _type == "proposalAddOnsSection" => { heading, intro },
      _type == "proposalOfferSection" => { heading },
      _type == "proposalInvestmentSection" => { heading, title, intro },
      _type == "proposalSowSection" => { body },
      _type == "proposalScheduleSection" => { heading, excludedNote },
      _type == "proposalTermsSection" => { validityNote, changeOrderRule },
      _type == "proposalAcceptSection" => { prompt, checkboxLabel },
      _type == "proposalSignedSection" => { heading, nextSteps, kickoffUrl, kickoffLabel }
    }
  }
`)

/** Current proposal text for pre-v3 acceptance compatibility checks only. */
export const proposalByIdForLegacyAcceptanceQuery = defineQuery(`
  *[_type == "proposal" && _id == $id][0]{
    _id,
    clientDisplayName,
    clientLegalName,
    packages[]->{
      _id,
      name,
      scope,
      includedItems
    },
    addOns[]->{
      _id,
      name,
      line,
      scope
    },
    msa->{
      _id,
      version,
      effectiveDate,
      "pdfUrl": pdf.asset->url,
      body
    },
    sections[]{
      _key,
      _type,
      enabled,
      _type == "proposalSowSection" => { body }
    }
  }
`)

/** Projects for the local proposal preview. The notes are written in the preview, not here. */
export const previewProofProjectsQuery = defineQuery(`
  *[_type == "project" && slug.current in $slugs && hidden != true]{
    _id,
    title,
    "slug": slug.current,
    year,
    coverImage,
    videoUrl,
    "clientName": client->name,
    "stats": sections[_type == "projectStatsSection" && enabled != false][0].items[]{
      _key,
      value,
      label
    }
  }
`)
