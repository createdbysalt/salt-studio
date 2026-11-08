import {isTableAuthenticated, isValidTableSlug} from '@/app/(table)/table/auth'
import {ClientPortalLogin} from '@/components/ClientPortalLogin'
import {ClientPortalPage} from '@/components/ClientPortalPage'
import {
  getPrivatePortalOverlay,
  isSupabasePrivateMetadataEnabled,
} from '@/lib/onboarding/private-portal'
import {sanityFetch} from '@/sanity/lib/live'
import {
  clientPortalBySlugQuery,
  clientPortalShellBySlugQuery,
  clientPortalSlugsQuery,
} from '@/sanity/lib/queries'
import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import {notFound} from 'next/navigation'

type Props = {
  params: Promise<{slug: string}>
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {data} = await sanityFetch({query: clientPortalShellBySlugQuery, params, stega: false})
  return {
    title: data?.name ?? 'Your project',
    robots: {index: false, follow: false},
  }
}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: clientPortalSlugsQuery,
    stega: false,
    perspective: 'published',
  })
  return data.filter((item): item is {slug: string} => Boolean(item.slug))
}

export default async function ProjectSlugRoute({params}: Props) {
  const {slug} = await params
  if (!isValidTableSlug(slug)) {
    notFound()
  }

  const {data: shell} = await sanityFetch({
    query: clientPortalShellBySlugQuery,
    params,
    stega: false,
  })
  const draft = (await draftMode()).isEnabled

  if (!shell?._id && !draft) {
    notFound()
  }

  if (shell && shell.enabled === false && !draft) {
    notFound()
  }

  if (!shell) {
    return <main className="min-h-svh bg-background" />
  }

  const authenticated = await isTableAuthenticated(slug)
  if (!authenticated) {
    return <ClientPortalLogin slug={slug} name={shell.name || 'Your project'} />
  }

  const {data} = await sanityFetch({query: clientPortalBySlugQuery, params, stega: false})
  if (!data) {
    return <main className="min-h-svh bg-background" />
  }

  const privateOverlay = await getPrivatePortalOverlay(data._id)
  const privateMode = isSupabasePrivateMetadataEnabled()
  if (privateMode && !privateOverlay) {
    return <main className="min-h-svh bg-background" />
  }

  const publicPrivateFields = privateMode
    ? {
        sharedFolderUrl: null,
        brandingFolderUrl: null,
        mediaFolderUrl: null,
        previewUrl: null,
        productionUrl: null,
        whatsappGroupUrl: null,
      }
    : {}

  const mergedData = privateOverlay
    ? ({
        ...data,
        ...publicPrivateFields,
        ...privateOverlay,
        checklist: (privateOverlay.checklist ?? data.checklist) as typeof data.checklist,
      } as typeof data)
    : data

  return <ClientPortalPage data={mergedData} />
}
