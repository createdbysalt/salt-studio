/**
 * Sets up the Presentation Resolver API,
 * see https://www.sanity.io/docs/presentation-resolver-api for more information.
 */

import {resolveHref} from '@/sanity/lib/utils'
import {defineDocuments, defineLocations} from 'sanity/presentation'

export const mainDocuments = defineDocuments([
  {
    route: '/',
    filter: `_type == "home"`,
  },
  {
    route: '/work',
    filter: `_type == "workPage"`,
  },
  {
    route: '/work/:slug',
    filter: `_type == "workCategory" && slug.current == $slug`,
  },
  {
    route: '/about',
    filter: `_type == "aboutPage"`,
  },
  {
    route: '/contact',
    filter: `_type == "contactPage"`,
  },
  {
    route: '/projects/:slug',
    filter: `_type == "project" && slug.current == $slug`,
  },
  {
    route: '/legal/:slug',
    filter: `_type == "legalPage" && slug.current == $slug`,
  },
  {
    route: '/quiz/:slug',
    filter: `_type == "quiz" && slug.current == $slug`,
  },
  {
    route: '/:slug',
    filter: `_type in ["person", "page"] && slug.current == $slug`,
  },
])

export const locations = {
  settings: defineLocations({
    message: 'This document is used on all pages',
    tone: 'caution',
  }),
  home: defineLocations({
    message: 'This document is used to render the front page',
    tone: 'positive',
    locations: [{title: 'Home', href: resolveHref('home')!}],
  }),
  project: defineLocations({
    select: {title: 'title', slug: 'slug.current'},
    resolve: (doc) => {
      const href = resolveHref('project', doc?.slug)
      return {locations: href ? [{title: doc?.title || 'Untitled', href}] : []}
    },
  }),
  person: defineLocations({
    select: {title: 'name', slug: 'slug.current'},
    resolve: (doc) => {
      const href = resolveHref('person', doc?.slug)
      return {locations: href ? [{title: doc?.title || 'Untitled', href}] : []}
    },
  }),
  page: defineLocations({
    select: {title: 'title', slug: 'slug.current'},
    resolve: (doc) => {
      const href = resolveHref('page', doc?.slug)
      return {locations: href ? [{title: doc?.title || 'Untitled', href}] : []}
    },
  }),
  legalPage: defineLocations({
    select: {title: 'title.en', slug: 'slug.current', pageType: 'pageType'},
    resolve: (doc) => {
      const href = resolveHref('legalPage', doc?.slug)
      return {
        locations: href ? [{title: doc?.title || doc?.pageType || 'Legal Page', href}] : [],
      }
    },
  }),
  notFoundPage: defineLocations({
    message: 'This document defines the 404 page content',
    tone: 'caution',
  }),
  servicesPage: defineLocations({
    message: 'Capabilities page',
    tone: 'positive',
    locations: [{title: 'Capabilities', href: resolveHref('servicesPage')!}],
  }),
  service: defineLocations({
    message: 'This service powers the homepage “How we can help” band',
    tone: 'positive',
    locations: [{title: 'Home', href: resolveHref('home')!}],
  }),
  aboutPage: defineLocations({
    message: 'About page — hidden on the live site until published',
    tone: 'positive',
    locations: [{title: 'About', href: resolveHref('aboutPage')!}],
  }),
  workPage: defineLocations({
    message: 'Work index page',
    tone: 'positive',
    locations: [{title: 'Work', href: resolveHref('workPage')!}],
  }),
  contactPage: defineLocations({
    message: 'Contact page',
    tone: 'positive',
    locations: [{title: 'Contact', href: resolveHref('contactPage')!}],
  }),
  quiz: defineLocations({
    select: {title: 'title', slug: 'slug.current'},
    resolve: (doc) => {
      const href = resolveHref('quiz', doc?.slug)
      return {locations: href ? [{title: doc?.title || 'Untitled quiz', href}] : []}
    },
  }),
  workCategory: defineLocations({
    select: {title: 'filterLabel', slug: 'slug.current'},
    resolve: (doc) => {
      const href = resolveHref('workCategory', doc?.slug)
      return {locations: href ? [{title: doc?.title || 'Work category', href}] : []}
    },
  }),
}
