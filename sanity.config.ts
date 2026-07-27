'use client'

/**
 * This config is used to set up Sanity Studio that's mounted on the `app/studio/[[...index]]/page.tsx` route
 */
import {dataset, projectId, studioUrl} from '@/sanity/lib/api'
import {
  saltDeskStructure,
  saltSingletonTypes,
  plusCreateIconPlugin,
} from '@/sanity/plugins/deskStructure'
import {helpTool, viewSiteTool} from '@/sanity/plugins/navbarActions'
import {pageBuilderTool} from '@/sanity/plugins/pageBuilder'
import * as resolve from '@/sanity/plugins/resolve'
import {singletonPlugin} from '@/sanity/plugins/settings'
import {StudioLogo} from '@/sanity/plugins/studioComponents'
import {saltStudioTheme} from '@/sanity/plugins/studioTheme'
import callToAction from '@/sanity/schemas/documents/callToAction'
import client from '@/sanity/schemas/documents/client'
import {artDepartment, camera, lens, light, rigging} from '@/sanity/schemas/documents/equipment'
import legalPage from '@/sanity/schemas/documents/legalPage'
import location from '@/sanity/schemas/documents/location'
import page from '@/sanity/schemas/documents/page'
import partnerStudio from '@/sanity/schemas/documents/partnerStudio'
import project from '@/sanity/schemas/documents/project'
import rentalPage from '@/sanity/schemas/documents/rentalPage'
import service from '@/sanity/schemas/documents/service'
import teamMember from '@/sanity/schemas/documents/teamMember'
import testimonial from '@/sanity/schemas/documents/testimonial'
import workCategory from '@/sanity/schemas/documents/workCategory'
import contactForm from '@/sanity/schemas/objects/contactForm'
import duration from '@/sanity/schemas/objects/duration'
import faq from '@/sanity/schemas/objects/faq'
import hero from '@/sanity/schemas/objects/hero'
import logoCarousel from '@/sanity/schemas/objects/logoCarousel'
import milestone from '@/sanity/schemas/objects/milestone'
import moduleTile from '@/sanity/schemas/objects/moduleTile'
import {navChild, navItem} from '@/sanity/schemas/objects/navItem'
import {homeSection} from '@/sanity/schemas/objects/pageSection'
import {
  projectGalleryPhoto,
  projectGalleryRowOne,
  projectGalleryRowTwo,
  projectGalleryVideo,
} from '@/sanity/schemas/objects/projectGallery'
import specRow from '@/sanity/schemas/objects/specRow'
import testimonials from '@/sanity/schemas/objects/testimonials'
import timeline from '@/sanity/schemas/objects/timeline'
import {
  capAgencyBrandsSection,
  capCreativeSection,
  capHeroSection,
  capHowWeWorkSection,
  capModuleTilesSection,
  capPostSection,
  capProductionSection,
  capWhereWeWorkSection,
  capWhyModularSection,
  ctaSection,
} from '@/sanity/schemas/sections/capabilitiesSections'
import {
  contactDirectSection,
  contactFormSection,
  contactHeroSection,
} from '@/sanity/schemas/sections/contactSections'
import {
  studioCrewSection,
  studioHeroSection,
  studioLisbonSection,
  studioSpecsSection,
} from '@/sanity/schemas/sections/studioSections'
import capabilitiesPage from '@/sanity/schemas/singletons/capabilitiesPage'
import contactPage from '@/sanity/schemas/singletons/contactPage'
import developerSettings from '@/sanity/schemas/singletons/developerSettings'
import errorPage from '@/sanity/schemas/singletons/errorPage'
import home from '@/sanity/schemas/singletons/home'
import notFoundPage from '@/sanity/schemas/singletons/notFoundPage'
import settings from '@/sanity/schemas/singletons/settings'
import studioPage from '@/sanity/schemas/singletons/studioPage'
import workPage from '@/sanity/schemas/singletons/workPage'
import {defineConfig} from 'sanity'
import {unsplashImageAsset} from 'sanity-plugin-asset-source-unsplash'
import {media} from 'sanity-plugin-media'
import {presentationTool} from 'sanity/presentation'
import {structureTool} from 'sanity/structure'

const title =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE || 'Next.js Personal Website with Sanity.io'

// Environment-aware preview URL for Presentation tool
// Uses VERCEL_URL for preview deployments, falls back to localhost for local dev
const previewUrl =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000'

export default defineConfig({
  basePath: studioUrl,
  projectId: projectId || '',
  dataset: dataset || '',
  title,

  // Salt Studio custom theme and branding
  theme: saltStudioTheme,
  studio: {
    components: {
      logo: StudioLogo,
    },
  },

  // Custom tools (appear in toolbar alongside Presentation, Structure, Media)
  tools: [helpTool(), viewSiteTool()],

  schema: {
    // Quick-create templates for Dynamic Content → Rental (like Project types).
    templates: (prev) => [
      ...prev,
      {
        id: 'rentalPage-studio',
        title: 'Studio space rental',
        schemaType: 'rentalPage',
        value: {kind: 'studio', title: 'Studio rental'},
      },
      {
        id: 'rentalPage-podcast',
        title: 'Podcast room rental',
        schemaType: 'rentalPage',
        value: {kind: 'podcast', title: 'Podcast rental'},
      },
      {
        id: 'rentalPage-gear',
        title: 'Gear list rental',
        schemaType: 'rentalPage',
        value: {
          kind: 'gear',
          title: 'Gear rental',
          gearHeading: 'Studio curated gear.',
          gearIntro: 'Take your shoot even further with the same gear our creative team relies on.',
        },
      },
      {
        id: 'rentalPage-custom',
        title: 'Custom rental page',
        schemaType: 'rentalPage',
        value: {kind: 'custom', title: 'New rental'},
      },
    ],
    // If you want more content types, you can add them to this array
    types: [
      // Singletons
      home,
      settings,
      developerSettings,
      notFoundPage,
      errorPage,
      workPage,
      capabilitiesPage,
      studioPage,
      contactPage,
      // Documents
      callToAction,
      legalPage,
      page,
      project,
      rentalPage,
      location,
      teamMember,
      partnerStudio,
      workCategory,
      client,
      service,
      camera,
      lens,
      light,
      rigging,
      artDepartment,
      testimonial,
      // Objects
      contactForm,
      duration,
      faq,
      hero,
      logoCarousel,
      milestone,
      moduleTile,
      navItem,
      navChild,
      projectGalleryPhoto,
      projectGalleryVideo,
      projectGalleryRowOne,
      projectGalleryRowTwo,
      specRow,
      testimonials,
      timeline,
      homeSection,
      // Capabilities page sections (MFI-style sections array)
      capHeroSection,
      capWhyModularSection,
      capHowWeWorkSection,
      capWhereWeWorkSection,
      capModuleTilesSection,
      capCreativeSection,
      capProductionSection,
      capPostSection,
      capAgencyBrandsSection,
      ctaSection,
      // Studio page sections
      studioHeroSection,
      studioSpecsSection,
      studioLisbonSection,
      studioCrewSection,
      // Contact page sections
      contactHeroSection,
      contactDirectSection,
      contactFormSection,
    ],
  },
  plugins: [
    // Presentation first — this is what clients land on when they log in
    // Shows live preview with inline editing, much better UX than Structure tool
    presentationTool({
      resolve,
      previewUrl: {
        origin: previewUrl,
        previewMode: {enable: '/api/draft-mode/enable'},
      },
    }),
    // Visual Page Builder (advanced example)
    pageBuilderTool(),
    structureTool({
      structure: saltDeskStructure,
    }),
    // Structure pane create buttons use + instead of each type’s schema icon
    plusCreateIconPlugin(),
    // Configures the global "new document" button, and document actions, to suit the Settings document singleton
    singletonPlugin([...saltSingletonTypes]),
    // Enhanced media library with tags and organization
    media(),
    // Add an image asset source for Unsplash
    unsplashImageAsset(),
  ],

  // Disable paid features (confusing for clients on free/Team plans)
  releases: {enabled: false},
  scheduledDrafts: {enabled: false},
  tasks: {enabled: false},
})
