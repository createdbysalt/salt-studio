import {
  BulbOutlineIcon,
  CaseIcon,
  CogIcon,
  ColorWheelIcon,
  ComponentIcon,
  DocumentsIcon,
  EarthGlobeIcon,
  FolderIcon,
  HomeIcon,
  ImageIcon,
  MasterDetailIcon,
  PinIcon,
  RocketIcon,
  SearchIcon,
  SparklesIcon,
  StarIcon,
  TagIcon,
  UsersIcon,
  WarningOutlineIcon,
  WrenchIcon,
} from '@sanity/icons'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import type {ComponentType} from 'react'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'

/** Fixed document IDs for singleton page editors */
export const SINGLETON_DOCUMENT_IDS = {
  home: 'home',
  workPage: 'workPage',
  capabilitiesPage: 'capabilitiesPage',
  studioPage: 'studioPage',
  contactPage: 'contactPage',
  settings: 'settings',
  developerSettings: 'developerSettings',
  notFoundPage: 'notFoundPage',
  errorPage: 'errorPage',
} as const

/**
 * Force the Structure pane “create” control to use Sanity’s default + icon
 * instead of each document type’s schema icon. Global “Create” keeps type icons.
 */
export const plusCreateIconPlugin = () => ({
  name: 'plusCreateIconPlugin',
  document: {
    newDocumentOptions: (prev, {creationContext}: {creationContext: {type: string}}) => {
      if (creationContext.type !== 'structure') return prev
      return prev.map((item) => ({...item, icon: undefined}))
    },
  },
})

function singletonEditor(
  S: StructureBuilder,
  options: {
    title: string
    schemaType: string
    documentId: string
    icon?: ComponentType
  },
) {
  return S.listItem()
    .title(options.title)
    .icon(options.icon)
    .child(
      S.editor()
        .id(options.documentId)
        .schemaType(options.schemaType)
        .documentId(options.documentId),
    )
}

export const saltDeskStructure: StructureResolver = (S, context) => {
  const corePages = S.listItem()
    .title('Core Pages')
    .icon(DocumentsIcon)
    .child(
      S.list()
        .title('Core Pages')
        .items([
          singletonEditor(S, {
            title: 'Home',
            schemaType: 'home',
            documentId: SINGLETON_DOCUMENT_IDS.home,
            icon: HomeIcon,
          }),
          singletonEditor(S, {
            title: 'Work',
            schemaType: 'workPage',
            documentId: SINGLETON_DOCUMENT_IDS.workPage,
            icon: DocumentsIcon,
          }),
          singletonEditor(S, {
            title: 'Capabilities',
            schemaType: 'capabilitiesPage',
            documentId: SINGLETON_DOCUMENT_IDS.capabilitiesPage,
            icon: SparklesIcon,
          }),
          singletonEditor(S, {
            title: 'Studio',
            schemaType: 'studioPage',
            documentId: SINGLETON_DOCUMENT_IDS.studioPage,
            icon: DocumentsIcon,
          }),
          singletonEditor(S, {
            title: 'Contact',
            schemaType: 'contactPage',
            documentId: SINGLETON_DOCUMENT_IDS.contactPage,
            icon: DocumentsIcon,
          }),
          S.listItem()
            .title('Utilities Pages')
            .icon(WarningOutlineIcon)
            .child(
              S.list()
                .title('Utilities Pages')
                .items([
                  singletonEditor(S, {
                    title: 'Signal Lost (404)',
                    schemaType: 'notFoundPage',
                    documentId: SINGLETON_DOCUMENT_IDS.notFoundPage,
                    icon: SearchIcon,
                  }),
                  singletonEditor(S, {
                    title: 'Error (500)',
                    schemaType: 'errorPage',
                    documentId: SINGLETON_DOCUMENT_IDS.errorPage,
                    icon: WarningOutlineIcon,
                  }),
                ]),
            ),
        ]),
    )

  const equipment = S.listItem()
    .title('Equipment')
    .icon(ImageIcon)
    .child(
      S.list()
        .title('Equipment')
        .items([
          S.documentTypeListItem('camera').title('Cameras').icon(ImageIcon),
          S.documentTypeListItem('lens').title('Lenses').icon(ColorWheelIcon),
          S.documentTypeListItem('light').title('Lights').icon(BulbOutlineIcon),
          S.documentTypeListItem('rigging').title('Rigging').icon(WrenchIcon),
          S.documentTypeListItem('artDepartment').title('Art Department').icon(MasterDetailIcon),
        ]),
    )

  const serviceByDept = (title: string, value: string) =>
    S.listItem()
      .title(title)
      .icon(ComponentIcon)
      .child(
        S.documentList()
          .title(title)
          .schemaType('service')
          .filter('_type == "service" && department == $dept')
          .params({dept: value})
          .defaultOrdering([{field: 'sortOrder', direction: 'asc'}]),
      )

  const services = S.listItem()
    .title('Services')
    .icon(ComponentIcon)
    .child(
      S.list()
        .title('Services')
        .items([
          S.documentTypeListItem('service').title('All Services').icon(ComponentIcon),
          S.divider(),
          serviceByDept('Pre-Production', 'pre-production'),
          serviceByDept('Production', 'production'),
          serviceByDept('Post', 'post'),
        ]),
    )

  const dynamicContent = S.listItem()
    .id('dynamicContent')
    .title('Dynamic Content')
    .icon(FolderIcon)
    .child(
      S.list()
        .title('Dynamic Content')
        .items([
          // ─── Work ───
          S.divider().title('Work'),
          S.documentTypeListItem('project').title('Projects'),
          S.documentTypeListItem('workCategory').title('Work Categories').icon(TagIcon),
          services,
          equipment,
          // ─── People ───
          S.divider().title('People'),
          S.documentTypeListItem('client').title('Clients').icon(CaseIcon),
          S.documentTypeListItem('testimonial').title('Testimonials').icon(StarIcon),
          orderableDocumentListDeskItem({
            type: 'teamMember',
            title: 'Team',
            icon: UsersIcon,
            S,
            context,
          }),
          orderableDocumentListDeskItem({
            type: 'partnerStudio',
            title: 'Partner Studios',
            icon: EarthGlobeIcon,
            S,
            context,
          }),
          // ─── Studio / Rentals ───
          S.divider().title('Studio'),
          orderableDocumentListDeskItem({
            type: 'location',
            title: 'Locations',
            icon: PinIcon,
            S,
            context,
          }),
          // URL: /edit/structure/dynamicContent;rental — creatable like Projects
          S.listItem()
            .id('rental')
            .title('Rental')
            .icon(RocketIcon)
            .schemaType('rentalPage')
            .child(
              S.documentTypeList('rentalPage')
                .title('Rental')
                .filter('_type == "rentalPage"')
                .apiVersion('2025-02-27')
                .defaultOrdering([{field: 'title', direction: 'asc'}])
                .initialValueTemplates([
                  S.initialValueTemplateItem('rentalPage-studio'),
                  S.initialValueTemplateItem('rentalPage-podcast'),
                  S.initialValueTemplateItem('rentalPage-gear'),
                  S.initialValueTemplateItem('rentalPage-custom'),
                ]),
            ),
          // ─── Global ───
          S.divider().title('Global'),
          S.documentTypeListItem('callToAction').title('CTAs').icon(RocketIcon),
          // ─── Utilities ───
          S.divider().title('Utilities'),
          S.documentTypeListItem('legalPage').title('Legal Pages'),
        ]),
    )

  const settings = S.listItem()
    .title('Settings')
    .icon(CogIcon)
    .child(
      S.list()
        .title('Settings')
        .items([
          singletonEditor(S, {
            title: 'Site Settings',
            schemaType: 'settings',
            documentId: SINGLETON_DOCUMENT_IDS.settings,
            icon: CogIcon,
          }),
          singletonEditor(S, {
            title: 'Developer Settings',
            schemaType: 'developerSettings',
            documentId: SINGLETON_DOCUMENT_IDS.developerSettings,
            icon: CogIcon,
          }),
        ]),
    )

  return S.list().title('Content').items([corePages, dynamicContent, settings])
}

export const saltSingletonTypes = [
  'home',
  'workPage',
  'capabilitiesPage',
  'studioPage',
  'contactPage',
  'notFoundPage',
  'errorPage',
  'settings',
  'developerSettings',
] as const
