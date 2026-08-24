import {isTableAuthenticated, isValidTableSlug} from '@/app/(table)/table/auth'
import {ClientPortalLogin} from '@/components/ClientPortalLogin'
import {ClientPortalPage} from '@/components/ClientPortalPage'
import {sanityFetch} from '@/sanity/lib/live'
import {clientPortalBySlugQuery, clientPortalSlugsQuery} from '@/sanity/lib/queries'
import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import {notFound} from 'next/navigation'

type Props = {
  params: Promise<{slug: string}>
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {data} = await sanityFetch({query: clientPortalBySlugQuery, params, stega: false})
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

  const {data} = await sanityFetch({query: clientPortalBySlugQuery, params, stega: false})
  const draft = (await draftMode()).isEnabled

  if (!data?._id && !draft) {
    notFound()
  }

  if (data && data.enabled === false && !draft) {
    notFound()
  }

  if (!data) {
    return <main className="min-h-svh bg-background" />
  }

  const authenticated = await isTableAuthenticated(slug)
  if (!authenticated) {
    return <ClientPortalLogin slug={slug} name={data.name || 'Your project'} />
  }

  return <ClientPortalPage data={data} />
}
