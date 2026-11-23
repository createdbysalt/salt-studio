import {ProposalScopeCopy} from '@/components/ProposalScopeCopy'
import type {PortableTextBlock} from 'next-sanity'

const partTitleClass = 'text-[1.85rem] font-medium leading-[1.05] tracking-[-0.04em]'

/**
 * The statement inside the scope overlay.
 * The selected package comes first. Each picked add-on follows, in proposal
 * order, and drops out when it is unpicked. Scope headings share the card
 * scope renderer. The part name is a separate heading so the PDF can tell a
 * package from a section inside it.
 */
export function ProposalSowStatement({
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
    <div className="max-w-[40rem]">
      {packageName ? (
        <h3 data-sow-part className={`${partTitleClass} mb-4`}>
          {packageName}
        </h3>
      ) : null}
      <ProposalScopeCopy blocks={packageScope} items={packageItems} />
      {addOns.map((addOn) => (
        <div key={addOn.name} className="mt-14">
          {addOn.name ? (
            <h3 data-sow-part className={`${partTitleClass} mb-4`}>
              {addOn.name}
            </h3>
          ) : null}
          <ProposalScopeCopy blocks={addOn.scope} items={addOn.line ? [addOn.line] : []} />
        </div>
      ))}
      {standing.length > 0 ? (
        <div className="mt-14">
          <ProposalScopeCopy blocks={standing} />
        </div>
      ) : null}
    </div>
  )
}
