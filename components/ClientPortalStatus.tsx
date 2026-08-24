'use client'

import {toggleChecklistItem} from '@/app/(table)/table/actions'
import {createContext, useContext, useMemo, useState, useTransition, type ReactNode} from 'react'

export type PortalChecklistItem = {
  _key: string
  categoryKey: string
  title?: string | null
  description?: string | null
  required?: boolean | null
  link?: string | null
  linkLabel?: string | null
  done?: boolean | null
}

export type PortalChecklistGroup = {
  _key: string
  title?: string | null
  description?: string | null
  needsDrive?: boolean
  folderUrl?: string | null
  folderLabel?: string
  items: PortalChecklistItem[]
}

type PortalStatus = {
  groups: PortalChecklistGroup[]
  formItems: PortalChecklistItem[]
  done: Record<string, boolean>
  pendingKey: string | null
  error: string | null
  currentPhase: number
  toggle: (item: PortalChecklistItem) => void
}

const PortalStatusContext = createContext<PortalStatus | null>(null)

export function itemDoneKey(item: PortalChecklistItem) {
  return `${item.categoryKey}:${item._key}`
}

export function isGroupComplete(group: PortalChecklistGroup, done: Record<string, boolean>) {
  return group.items.every((item) => done[itemDoneKey(item)])
}

export function firstIncompleteGroupKey(
  groups: PortalChecklistGroup[],
  done: Record<string, boolean>,
) {
  return groups.find((group) => !isGroupComplete(group, done))?._key ?? ''
}

function initialDoneMap(groups: PortalChecklistGroup[], extraItems: PortalChecklistItem[]) {
  const next: Record<string, boolean> = {}
  for (const group of groups) {
    for (const item of group.items) {
      next[itemDoneKey(item)] = Boolean(item.done)
    }
  }
  for (const item of extraItems) {
    next[itemDoneKey(item)] = Boolean(item.done)
  }
  return next
}

function requiredItemsDone(group: PortalChecklistGroup | undefined, done: Record<string, boolean>) {
  if (!group) return true
  return group.items
    .filter((item) => item.required !== false)
    .every((item) => done[itemDoneKey(item)])
}

export function deriveCurrentPhase(groups: PortalChecklistGroup[], done: Record<string, boolean>) {
  const start = groups.find((group) => group._key === 'start')
  const branding = groups.find((group) => group._key === 'branding')
  const photos = groups.find((group) => group._key === 'media')

  if (!requiredItemsDone(start, done)) return 0
  if (!requiredItemsDone(branding, done) || !requiredItemsDone(photos, done)) return 1
  return 2
}

export function ClientPortalStatusProvider({
  slug,
  groups,
  formItems = [],
  phaseOverride = null,
  children,
}: {
  slug: string
  groups: PortalChecklistGroup[]
  formItems?: PortalChecklistItem[]
  phaseOverride?: number | null
  children: ReactNode
}) {
  const [done, setDone] = useState(() => initialDoneMap(groups, formItems))
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const currentPhase = useMemo(
    () => (phaseOverride != null ? phaseOverride : deriveCurrentPhase(groups, done)),
    [done, groups, phaseOverride],
  )

  const toggle = (item: PortalChecklistItem) => {
    const key = itemDoneKey(item)
    const next = !done[key]
    setDone((prev) => ({...prev, [key]: next}))
    setPendingKey(key)
    setError(null)
    startTransition(async () => {
      const result = await toggleChecklistItem({
        slug,
        categoryKey: item.categoryKey,
        itemKey: item._key,
        done: next,
      })
      if (!result.ok) {
        setDone((prev) => ({...prev, [key]: !next}))
        setError(result.error)
      }
      setPendingKey(null)
    })
  }

  return (
    <PortalStatusContext.Provider
      value={{groups, formItems, done, pendingKey, error, currentPhase, toggle}}
    >
      {children}
    </PortalStatusContext.Provider>
  )
}

export function usePortalStatus() {
  const value = useContext(PortalStatusContext)
  if (!value) {
    throw new Error('usePortalStatus must be used inside ClientPortalStatusProvider')
  }
  return value
}
