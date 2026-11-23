'use client'

import {ProposalSowStatement} from '@/components/ProposalSowStatement'
import {
  quoteSelection,
  selectionKey,
  type ProposalSelection,
  type QuoteInputs,
} from '@/lib/proposal/quote'
import type {PortableTextBlock} from 'next-sanity'
import {useRouter} from 'next/navigation'
import {createContext, useContext, useRef, useState, type ReactNode} from 'react'

type Current = {packageId: string | null; addonIds: string[]}

type ProposalSelectionContextValue = {
  token: string
  kickoff: string | null
  /** Dev preview only. Keeps `?groups=1` on the pick-list links. */
  groups: boolean
  inputs: QuoteInputs
  selection: ProposalSelection
  quote: ReturnType<typeof quoteSelection>
  choose: (packageId: string | null, addonIds: string[]) => void
  /** The selection the latest click wrote, including one that has not re-rendered yet. */
  readSelection: () => Current
}

const ProposalSelectionContext = createContext<ProposalSelectionContextValue | null>(null)

/**
 * One selection for the running total, the pay label, the posted form, and
 * the statement of work.
 *
 * The rows navigate with `router.replace`. On Next.js 16.2 a repeated
 * `addon` param and the single value that keeps only its last entry share a
 * segment cache key, so the server props stay on the previous selection.
 * This state is what those four read. Server props catch up when a
 * navigation actually commits, including the back button.
 */
export function ProposalSelectionProvider({
  token,
  kickoff,
  groups = false,
  inputs,
  packageId,
  addonIds,
  children,
}: {
  token: string
  kickoff: string | null
  groups?: boolean
  inputs: QuoteInputs
  packageId: string | null
  addonIds: string[]
  children: ReactNode
}) {
  const router = useRouter()
  const serverKey = `${selectionKey({packageId, addonIds, kickoffDate: kickoff})}|${kickoff ?? ''}`
  const [seenKey, setSeenKey] = useState(serverKey)
  const [current, setCurrent] = useState<Current>({packageId, addonIds})
  const selectionRef = useRef<Current>(current)
  let resolved = current
  if (serverKey !== seenKey) {
    const next = {packageId, addonIds}
    setSeenKey(serverKey)
    setCurrent(next)
    selectionRef.current = next
    resolved = next
  } else {
    selectionRef.current = resolved
  }

  const selection: ProposalSelection = {
    packageId: resolved.packageId,
    addonIds: resolved.addonIds,
    kickoffDate: kickoff,
  }
  const quote = quoteSelection(inputs, selection)

  function choose(nextPackage: string | null, nextAddOns: string[]) {
    const next = {packageId: nextPackage, addonIds: nextAddOns}
    selectionRef.current = next
    setCurrent(next)
    router.replace(proposalChoiceHref(token, nextPackage, nextAddOns, kickoff, groups), {
      scroll: false,
    })
  }

  function readSelection() {
    return selectionRef.current
  }

  return (
    <ProposalSelectionContext.Provider
      value={{token, kickoff, groups, inputs, selection, quote, choose, readSelection}}
    >
      {children}
    </ProposalSelectionContext.Provider>
  )
}

export function useProposalSelection() {
  const value = useContext(ProposalSelectionContext)
  if (!value) throw new Error('Proposal selection is missing its provider')
  return value
}

export function proposalChoiceHref(
  token: string,
  packageId: string | null,
  addonIds: string[],
  kickoff: string | null,
  groups = false,
) {
  const params = new URLSearchParams()
  if (packageId) params.set('package', packageId)
  for (const id of addonIds) params.append('addon', id)
  if (kickoff) params.set('kickoff', kickoff)
  if (groups) params.set('groups', '1')
  const query = params.toString()
  return `/p/${encodeURIComponent(token)}${query ? `?${query}` : ''}`
}

export type ProposalStatementPackage = {
  id: string
  name: string
  scope: PortableTextBlock[]
  items: Array<string | null>
}

export type ProposalStatementAddOn = {
  id: string
  name: string
  scope: PortableTextBlock[]
  line: string
}

/** The statement for the selection the total is using, not an earlier render. */
export function ProposalLiveStatement({
  packages,
  addOns,
  standing,
}: {
  packages: ProposalStatementPackage[]
  addOns: ProposalStatementAddOn[]
  standing: PortableTextBlock[]
}) {
  const {selection} = useProposalSelection()
  const selectedPackage = packages.find((item) => item.id === selection.packageId) ?? null
  const selectedAddOns = addOns.filter((item) => selection.addonIds.includes(item.id))
  return (
    <ProposalSowStatement
      packageName={selectedPackage?.name ?? ''}
      packageScope={selectedPackage?.scope ?? []}
      packageItems={selectedPackage?.items ?? []}
      addOns={selectedAddOns.map((addOn) => ({
        name: addOn.name,
        scope: addOn.scope,
        line: addOn.line,
      }))}
      standing={standing}
    />
  )
}
