import {ClientPortalChecklist} from '@/components/ClientPortalChecklist'
import {ClientPortalForms} from '@/components/ClientPortalForms'
import {ClientPortalStatusProvider} from '@/components/ClientPortalStatus'
import {LineReveal} from '@/components/motion/LineReveal'
import {TableNav, type TableNavSection} from '@/components/TableNav'
import {TableOverviewTimeline} from '@/components/TableOverviewTimeline'
import {CLIENT_GETTING_STARTED_OVERRIDES} from '@/lib/tally/church-forms'
import type {ClientPortalBySlugQueryResult} from '@/sanity.types'
import type {ReactNode} from 'react'

type Portal = NonNullable<ClientPortalBySlugQueryResult>
type Category = NonNullable<NonNullable<Portal['checklist']>[number]>
type Item = NonNullable<NonNullable<Category['items']>[number]>
type TickItem = Omit<Item, 'done'> & {done?: boolean | null}

function splitItems(items: Array<TickItem | null> | null | undefined) {
  const list = (items ?? []).filter((item): item is TickItem => Boolean(item?.title))
  return {
    required: list.filter((item) => item.required !== false),
    optional: list.filter((item) => item.required === false),
    all: list,
  }
}

function formatDueDate(value?: string | null) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function ActionLink({
  href,
  children,
  variant,
}: {
  href: string
  children: ReactNode
  variant: 'solid' | 'ghost'
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${variant === 'solid' ? 'btn-solid' : 'btn-ghost'} group`}
    >
      <span>{children}</span>
      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
    </a>
  )
}

function SectionIntro({
  title,
  dueAt,
  dueLabel = 'Due',
  description,
  descriptionStyle = 'body',
}: {
  title: string
  dueAt?: string | null
  dueLabel?: string
  description?: string | null
  descriptionStyle?: 'body' | 'label'
}) {
  const due = formatDueDate(dueAt)
  return (
    <div>
      <LineReveal as="h2" className="text-display">
        {title}
      </LineReveal>
      {due ? (
        <p className="mt-[16px] text-label text-muted-foreground">
          {dueLabel} {due}
        </p>
      ) : null}
      {description ? (
        <p
          className={`${
            descriptionStyle === 'label'
              ? 'text-label text-muted-foreground'
              : 'max-w-xl text-body text-secondary'
          } ${due ? 'mt-[16px]' : 'mt-[20px]'}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

function resolvePhaseOverride(
  phases: Array<{_key?: string | null; name?: string | null} | null> | null | undefined,
  activePhase?: string | null,
) {
  if (!activePhase) return null
  const index = (phases ?? []).findIndex(
    (phase) => phase?._key === activePhase || phase?.name === activePhase,
  )
  return index >= 0 ? index : null
}

function findLocalItem(local: Category[] | null | undefined, itemKey: string | undefined) {
  if (!itemKey) return null
  for (const category of local ?? []) {
    const item = (category.items ?? []).find((entry) => entry?._key === itemKey)
    if (item) return {category, item}
  }
  return null
}

function itemDone(
  local: Category[] | null | undefined,
  categoryKey: string | undefined,
  itemKey: string | undefined,
) {
  const match = findLocalItem(local, itemKey)
  if (match) return Boolean(match.item.done)
  if (!categoryKey || !itemKey) return false
  const category = (local ?? []).find((entry) => entry?._key === categoryKey)
  const item = (category?.items ?? []).find((entry) => entry?._key === itemKey)
  return Boolean(item?.done)
}

function mergeChecklist(source: Portal['checklistSource'], local: Portal['checklist']): Category[] {
  const localList = (local ?? []).filter((category): category is Category =>
    Boolean(category?.title),
  )
  const sourceList = (source?.categories ?? []).filter((category): category is Category =>
    Boolean(category?.title),
  )
  if (!sourceList.length) return localList

  const fromSource = sourceList.map((category) => ({
    ...category,
    items: (category.items ?? []).map((item) =>
      item
        ? {
            ...item,
            done: itemDone(localList, category._key, item._key),
          }
        : item,
    ),
  }))
  const extra = localList.filter(
    (category) => !sourceList.some((entry) => entry._key === category._key),
  )
  return [...fromSource, ...extra]
}

function withCategory(
  category: Category,
  item: TickItem,
  local?: Category[],
  slug?: string | null,
) {
  const stored = findLocalItem(local, item._key)
  const override = item._key === 'gs-form' && slug ? CLIENT_GETTING_STARTED_OVERRIDES[slug] : null
  return {
    _key: item._key,
    categoryKey: stored?.category._key ?? category._key,
    title: override?.title ?? item.title,
    description: override?.description ?? item.description,
    required: item.required,
    link: override?.link ?? item.link,
    linkLabel: item.linkLabel,
    done: Boolean(stored?.item.done ?? item.done),
  }
}

export function ClientPortalPage({data}: {data: Portal}) {
  const localChecklist = (data.checklist ?? []).filter((category): category is Category =>
    Boolean(category?.title),
  )
  const categories = mergeChecklist(data.checklistSource, data.checklist)
  const tableHref = data.slug ? `/project/${data.slug}` : '#'
  const forms = categories.find((category) => category._key === 'forms')
  const startItems = categories
    .flatMap((category) =>
      splitItems(category.items)
        .all.filter((item) => item._key === 'gs-form' || item._key === 'gs-kickoff')
        .map((item) => withCategory(category, item, localChecklist, data.slug)),
    )
    .filter((item, index, list) => list.findIndex((entry) => entry._key === item._key) === index)
  const startCategory = categories.find((category) =>
    splitItems(category.items).all.some((item) => item._key === 'gs-form'),
  )
  const brand = categories.find((category) => category._key === 'branding')
  const photos = categories.find((category) => category._key === 'media')
  const leftover = categories.filter(
    (category) =>
      category._key !== 'getting-started' &&
      category._key !== 'forms' &&
      category._key !== 'branding' &&
      category._key !== 'media' &&
      category._key !== 'intake',
  )
  const checklistGroups = [
    startItems.length
      ? {
          _key: 'start',
          title: startCategory?.title ?? 'Getting Started',
          description:
            startCategory?.description ?? 'The one intake form. Then tick it when it is sent.',
          items: startItems.filter((item) => item._key === 'gs-form'),
        }
      : null,
    brand
      ? {
          _key: brand._key,
          title: brand.title ?? 'Brand',
          description:
            brand.description ?? 'Upload these files to the Branding folder, then tick the item.',
          needsDrive: true,
          folderUrl: data.brandingFolderUrl || data.sharedFolderUrl,
          folderLabel: 'Open branding folder',
          items: splitItems(brand.items)
            .all.filter((item) => item._key !== 'gs-form')
            .map((item) => withCategory(brand, item, localChecklist, data.slug)),
        }
      : null,
    photos
      ? {
          _key: photos._key,
          title: photos.title ?? 'Photos',
          description:
            photos.description ??
            'Use a real camera if you can — phone photos are a last resort. We need mostly landscape shots that can fill a wide screen; a few portraits are fine. Please sort them into labeled folders in the Photos Drive (building, services, people, and so on). Staff, ministry, and crew photos can go on the forms or in this folder. Then tick the item off the list.',
          needsDrive: true,
          folderUrl: data.mediaFolderUrl || data.sharedFolderUrl,
          folderLabel: 'Open photos folder',
          items: splitItems(photos.items)
            .all.filter((item) => item._key !== 'gs-form')
            .map((item) => withCategory(photos, item, localChecklist, data.slug)),
        }
      : null,
    ...leftover.map((category) => ({
      _key: category._key,
      title: category.title,
      description: category.description,
      items: splitItems(category.items)
        .all.filter((item) => item._key !== 'gs-form' && item._key !== 'gs-kickoff')
        .map((item) => withCategory(category, item, localChecklist, data.slug)),
    })),
  ].filter((group): group is NonNullable<typeof group> => Boolean(group && group.items.length))
  const sourceFormItems = data.formsSource?.items
  const formList = (sourceFormItems?.length ? sourceFormItems : forms?.items) ?? []
  const formsCategory =
    forms ??
    ({
      _key: 'forms',
      title: data.formsSource?.heading ?? 'Forms',
      description: data.formsSource?.description,
      items: formList,
    } as Category)
  const formItems = splitItems(formList).all.map((item) =>
    withCategory(formsCategory, item, localChecklist, data.slug),
  )
  const showOverview = Boolean(data.hasOverview)
  const showChecklist = Boolean(data.hasChecklist)
  const showForms = Boolean(data.hasForms)
  const navSections = (
    [
      showOverview ? 'overview' : null,
      showChecklist ? 'checklist' : null,
      showForms ? 'forms' : null,
    ] as const
  ).filter((section): section is TableNavSection => Boolean(section))

  return (
    <main className="min-h-svh bg-background text-foreground">
      <TableNav homeHref={tableHref} sections={navSections} />
      <header data-theme="dark" data-table-hero className="bg-background text-foreground">
        <div className="px-[40px] pb-16 pt-28 sm:px-[56px] md:pb-24 md:pt-36 lg:px-[80px]">
          <p className="text-label text-muted-foreground">Website project</p>
          <h1 className="mt-4 text-display">{data.name}</h1>
          <p className="mt-6 max-w-xl text-body text-foreground/70">
            Here is how the project runs, then what we need from you.
          </p>
          {(data.sharedFolderUrl || data.previewUrl || data.productionUrl) && (
            <div className="mt-10 flex flex-wrap gap-3">
              {data.sharedFolderUrl ? (
                <ActionLink href={data.sharedFolderUrl} variant="ghost">
                  Open shared Drive
                </ActionLink>
              ) : null}
              {data.previewUrl ? (
                <ActionLink href={data.previewUrl} variant="ghost">
                  See the site
                </ActionLink>
              ) : null}
              {data.productionUrl ? (
                <ActionLink href={data.productionUrl} variant="ghost">
                  See the live site
                </ActionLink>
              ) : null}
            </div>
          )}
        </div>
      </header>

      <ClientPortalStatusProvider
        slug={data.slug ?? ''}
        groups={checklistGroups}
        formItems={formItems}
        phaseOverride={resolvePhaseOverride(data.projectPhases?.phases, data.activePhase)}
      >
        {showOverview ? (
          <div className="px-[40px] py-16 sm:px-[56px] md:py-24 lg:px-[80px]">
            <section id="overview" className="scroll-mt-28 py-[64px] md:py-[96px]">
              <SectionIntro
                title="Overview"
                dueAt={data.launchEstimate}
                dueLabel="Estimated launch"
                description="This is a target. If content or feedback comes in late, launch can move."
                descriptionStyle="label"
              />
              <TableOverviewTimeline
                heading={data.projectPhases?.heading}
                phases={data.projectPhases?.phases}
              />
            </section>
          </div>
        ) : null}

        {showChecklist ? (
          <section
            id="checklist"
            data-theme="dark"
            className="scroll-mt-28 bg-background text-foreground"
          >
            <div className="px-[40px] py-[64px] sm:px-[56px] md:py-[96px] lg:px-[80px]">
              <SectionIntro title="Checklist" dueAt={data.contentDue} />
              <ClientPortalChecklist driveUrl={data.sharedFolderUrl} />
            </div>
          </section>
        ) : null}

        {showForms ? (
          <div className="px-[40px] py-16 sm:px-[56px] md:py-24 lg:px-[80px]">
            <section id="forms" className="scroll-mt-28 py-[64px] md:py-[96px]">
              <SectionIntro
                title={data.formsSource?.heading?.trim() || 'Forms'}
                dueAt={data.contentDue}
                description={
                  data.formsSource?.description?.trim() ||
                  'These are public links. Send each one to the right people on staff so they can fill out their own area — bios, ministry details, photos, and the rest. When everyone has sent theirs, tick the form so we know it is done.'
                }
              />
              <ClientPortalForms />
            </section>
          </div>
        ) : null}
      </ClientPortalStatusProvider>
    </main>
  )
}
