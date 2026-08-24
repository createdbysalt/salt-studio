import {isValidTableSlug} from '@/app/(table)/table/auth'
import {notFound, redirect} from 'next/navigation'

type Props = {
  params: Promise<{slug: string}>
}

export default async function TableSlugRedirect({params}: Props) {
  const {slug} = await params
  if (!isValidTableSlug(slug)) {
    notFound()
  }
  redirect(`/project/${slug}`)
}
