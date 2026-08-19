import {
  CaseIcon,
  ClipboardIcon,
  CodeBlockIcon,
  CogIcon,
  DocumentsIcon,
  FolderIcon,
  HelpCircleIcon,
  HomeIcon,
  RocketIcon,
  SearchIcon,
  StarIcon,
  TagIcon,
  UsersIcon,
  WarningOutlineIcon,
  WrenchIcon,
} from '@sanity/icons'
import type {ComponentType} from 'react'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'

/** Fixed document IDs for singleton page editors */
export const SINGLETON_DOCUMENT_IDS = {
  home: 'home',
  servicesPage: 'servicesPage',
  aboutPage: 'aboutPage',
  workPage: 'workPage',
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

export const saltDeskStructure: StructureResolver = (S) => {
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
            title: 'Services',
            schemaType: 'servicesPage',
            documentId: SINGLETON_DOCUMENT_IDS.servicesPage,
            icon: DocumentsIcon,
          }),
          singletonEditor(S, {
            title: 'About',
            schemaType: 'aboutPage',
            documentId: SINGLETON_DOCUMENT_IDS.aboutPage,
            icon: DocumentsIcon,
          }),
          singletonEditor(S, {
            title: 'Work',
            schemaType: 'workPage',
            documentId: SINGLETON_DOCUMENT_IDS.workPage,
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
          S.documentTypeListItem('capability').title('Capabilities').icon(CodeBlockIcon),
          S.documentTypeListItem('service').title('Services').icon(WrenchIcon),
          // ─── People ───
          S.divider().title('People'),
          S.documentTypeListItem('person').title('People').icon(UsersIcon),
          S.documentTypeListItem('client').title('Clients').icon(CaseIcon),
          S.documentTypeListItem('testimonial').title('Testimonials').icon(StarIcon),
          // ─── Global ───
          S.divider().title('Global'),
          S.documentTypeListItem('callToAction').title('CTAs').icon(RocketIcon),
          // ─── Pages ───
          S.divider().title('Pages'),
          S.documentTypeListItem('page').title('Pages'),
          // ─── Utilities ───
          S.divider().title('Utilities'),
          S.documentTypeListItem('legalPage').title('Legal Pages'),
        ]),
    )

  /** A quizSubmission list filtered to one pipeline status. */
  const submissionsByStatus = (title: string, status: string) =>
    S.listItem()
      .id(`submissions-${status}`)
      .title(title)
      .icon(ClipboardIcon)
      .child(
        S.documentList()
          .id(`submissions-${status}`)
          .title(title)
          .schemaType('quizSubmission')
          .filter('_type == "quizSubmission" && coalesce(status, "new") == $status')
          .params({status})
          .defaultOrdering([{field: 'submittedAt', direction: 'desc'}]),
      )

  const leads = S.listItem()
    .id('leads')
    .title('Leads')
    .icon(UsersIcon)
    .child(
      S.list()
        .title('Leads')
        .items([
          S.documentTypeListItem('quiz').title('Quizzes').icon(HelpCircleIcon),
          S.divider().title('Pipeline'),
          S.documentTypeListItem('quizSubmission').title('All Submissions').icon(ClipboardIcon),
          submissionsByStatus('New', 'new'),
          submissionsByStatus('Contacted', 'contacted'),
          submissionsByStatus('Call Booked', 'call-booked'),
          submissionsByStatus('Won', 'won'),
          submissionsByStatus('Lost', 'lost'),
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

  return S.list().title('Content').items([corePages, dynamicContent, leads, settings])
}

export const saltSingletonTypes = [
  'home',
  'servicesPage',
  'aboutPage',
  'workPage',
  'contactPage',
  'notFoundPage',
  'errorPage',
  'settings',
  'developerSettings',
] as const
