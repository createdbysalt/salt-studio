'use client'

import {
  quoteSelection,
  selectionKey,
  type ProposalSelection,
  type QuoteInputs,
} from '@/lib/proposal/quote'
import {PortableText, stegaClean, type PortableTextBlock} from 'next-sanity'
import {useRouter} from 'next/navigation'
import {createContext, useContext, useRef, useState, type ReactNode} from 'react'

type Current = {packageId: string | null; addonIds: string[]}

type ProposalSelectionContextValue = {
  token: string
  kickoff: string | null
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
  inputs,
  packageId,
  addonIds,
  children,
}: {
  token: string
  kickoff: string | null
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
    router.replace(proposalChoiceHref(token, nextPackage, nextAddOns, kickoff), {scroll: false})
  }

  function readSelection() {
    return selectionRef.current
  }

  return (
    <ProposalSelectionContext.Provider
      value={{token, kickoff, inputs, selection, quote, choose, readSelection}}
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
) {
  const params = new URLSearchParams()
  if (packageId) params.set('package', packageId)
  for (const id of addonIds) params.append('addon', id)
  if (kickoff) params.set('kickoff', kickoff)
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
    <Statement
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

function Statement({
  packageName,
  packageScope,
  packageItems,
  addOns,
  standing,
}: {
  packageName: string
  packageScope: PortableTextBlock[]
  packageItems: Array<string | null>
  addOns: Array<{name: string; scope: PortableTextBlock[]; line: string}>
  standing: PortableTextBlock[]
}) {
  return (
    <div className="max-w-[40rem] text-[1.0625rem] leading-relaxed [&_h3]:mt-[1.25rem] [&_h3:first-child]:mt-0 [&_h3]:text-[1.0625rem] [&_h3]:font-medium [&_li+li]:mt-1.5 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-4 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-[#8f8f8f]">
      {packageName ? <h3 className="mt-0">{packageName}</h3> : null}
      <ScopeCopy blocks={packageScope} items={packageItems} />
      {addOns.map((addOn) => (
        <div key={addOn.name}>
          {addOn.name ? <h3>{addOn.name}</h3> : null}
          <ScopeCopy blocks={addOn.scope} items={addOn.line ? [addOn.line] : []} />
        </div>
      ))}
      {standing.length > 0 ? (
        <div className="mt-[1.25rem]">
          <PortableText value={standing} />
        </div>
      ) : null}
    </div>
  )
}

function ScopeCopy({blocks, items}: {blocks: PortableTextBlock[]; items: Array<string | null>}) {
  if (blocks.length > 0) return <PortableText value={blocks} />
  const lines = items.map((item) => line(item)).filter(Boolean)
  if (lines.length === 0) return null
  return (
    <ul>
      {lines.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function line(value: string | null | undefined) {
  return stegaClean(value ?? '').trim()
}
