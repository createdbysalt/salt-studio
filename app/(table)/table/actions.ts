'use server'

import {isTableAuthenticated, isValidTableSlug, tableAuthCookieName} from '@/app/(table)/table/auth'
import {apiVersion, dataset, projectId} from '@/sanity/lib/api'
import {sanityFetch} from '@/sanity/lib/live'
import {clientPortalAuthQuery} from '@/sanity/lib/queries'
import {writeToken} from '@/sanity/lib/write-token'
import {createClient, stegaClean} from 'next-sanity'
import {revalidatePath} from 'next/cache'
import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'

const KEY_PATTERN = /^[a-zA-Z0-9._-]+$/

const writeClient = writeToken
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      token: writeToken,
      useCdn: false,
    })
  : null

export async function authenticateTable(slug: string, formData: FormData) {
  if (!isValidTableSlug(slug)) {
    return {ok: false as const, error: 'That link is not valid.'}
  }

  const submitted = String(formData.get('password') ?? '')
  const {data} = await sanityFetch({
    query: clientPortalAuthQuery,
    params: {slug},
    stega: false,
  })

  const expected = stegaClean(data?.password ?? '')
  const enabled = data?.enabled !== false

  if (!data?._id || !enabled || !expected || submitted !== expected) {
    return {ok: false as const, error: 'That password is not right.'}
  }

  const cookieStore = await cookies()
  cookieStore.set(tableAuthCookieName(slug), '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: `/project/${slug}`,
    maxAge: 60 * 60 * 24 * 30,
  })

  redirect(`/project/${slug}`)
}

type ChecklistCategory = {
  _key?: string
  _type?: string
  title?: string
  items?: Array<{
    _key?: string
    _type?: string
    title?: string
    done?: boolean
  }>
}

function withChecklistTick(
  checklist: unknown,
  categoryKey: string,
  itemKey: string,
  done: boolean,
  title?: string,
) {
  const list = Array.isArray(checklist) ? checklist.map((entry) => ({...(entry as object)})) : []
  const categories = list as ChecklistCategory[]
  let category = categories.find((entry) => entry?._key === categoryKey)
  if (!category) {
    category = {
      _type: 'portalChecklistCategory',
      _key: categoryKey,
      title: title?.trim() || categoryKey,
      items: [],
    }
    categories.push(category)
  }

  const items = Array.isArray(category.items) ? category.items.map((item) => ({...item})) : []
  const index = items.findIndex((item) => item?._key === itemKey)
  if (index === -1) {
    items.push({
      _type: 'portalChecklistItem',
      _key: itemKey,
      title: title?.trim() || itemKey,
      done,
    })
  } else {
    items[index] = {...items[index], done}
  }

  const categoryIndex = categories.findIndex((entry) => entry?._key === categoryKey)
  categories[categoryIndex] = {...category, items}
  return categories
}

export async function toggleChecklistItem(input: {
  slug: string
  categoryKey: string
  itemKey: string
  done: boolean
  title?: string
}) {
  const {slug, categoryKey, itemKey, done, title} = input
  if (!isValidTableSlug(slug)) {
    return {ok: false as const, error: 'That link is not valid.'}
  }
  if (!KEY_PATTERN.test(categoryKey) || !KEY_PATTERN.test(itemKey)) {
    return {ok: false as const, error: 'That item is not valid.'}
  }
  if (!(await isTableAuthenticated(slug))) {
    return {ok: false as const, error: 'Sign in again to update the checklist.'}
  }
  if (!writeClient) {
    return {ok: false as const, error: 'Checklist saving is not available yet.'}
  }

  const {data} = await sanityFetch({
    query: clientPortalAuthQuery,
    params: {slug},
    stega: false,
  })
  if (!data?._id || data.enabled === false) {
    return {ok: false as const, error: 'That page is not available.'}
  }

  try {
    const document = await writeClient.getDocument(data._id)
    if (!document) {
      return {ok: false as const, error: 'That page is not available.'}
    }
    await writeClient
      .patch(data._id)
      .set({
        checklist: withChecklistTick(document.checklist, categoryKey, itemKey, done, title),
      })
      .commit({autoGenerateArrayKeys: false})
  } catch (error) {
    console.error('toggleChecklistItem failed', error)
    return {ok: false as const, error: 'Could not save that check.'}
  }

  revalidatePath(`/project/${slug}`)
  return {ok: true as const}
}
