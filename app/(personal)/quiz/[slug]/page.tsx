import {DynamicQuizFlow} from '@/components/DynamicQuizFlow'
import {sanityFetch} from '@/sanity/lib/live'
import {quizBySlugQuery, quizSlugsQuery} from '@/sanity/lib/queries'
import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import {notFound} from 'next/navigation'

/**
 * Service quiz funnels — one Sanity `quiz` document per service, reached via
 * each service's fit-check link. Like /quiz (the Salt Score), these are
 * noindex while the funnel is launch-gated; visitors arrive through the site,
 * not through search.
 */

type Props = {
  params: Promise<{slug: string}>
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {data} = await sanityFetch({query: quizBySlugQuery, params, stega: false})
  return {
    title: data?.title ?? 'Quiz',
    description: data?.introBody ?? data?.introHeadline ?? undefined,
    robots: {index: false, follow: false},
  }
}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: quizSlugsQuery,
    stega: false,
    perspective: 'published',
  })
  return data.filter((item): item is {slug: string} => Boolean(item.slug))
}

export default async function QuizSlugRoute({params}: Props) {
  const {data} = await sanityFetch({query: quizBySlugQuery, params})
  if (!data?._id && !(await draftMode()).isEnabled) {
    notFound()
  }
  if (!data) {
    // Draft mode with no document yet — nothing to render while it's created.
    return <main className="min-h-svh bg-background" />
  }
  return (
    <main className="min-h-svh bg-background">
      <DynamicQuizFlow quiz={data} />
    </main>
  )
}
