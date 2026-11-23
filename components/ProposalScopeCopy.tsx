import {PortableText, stegaClean, type PortableTextBlock} from 'next-sanity'

/**
 * Section treatment for a package or add-on scope.
 * Headings such as "What you get" stay large. Paragraphs and bullets stay body.
 * The card scope panels and the statement of work both use this, so a package
 * scope reads the same way an add-on scope does.
 */
export const proposalScopeCopyClass =
  'max-w-[40rem] text-[1.0625rem] leading-relaxed [&_h3]:mt-10 [&_h3]:mb-3 [&_h3:first-child]:mt-2 [&_h3]:text-[1.5rem] [&_h3]:font-bold [&_h3]:leading-tight [&_h3]:tracking-[-0.03em] [&_h3+p]:mt-0 [&_h3+ul]:mt-0 [&_h3+ol]:mt-0 [&_li+li]:mt-1.5 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-4 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-[#8f8f8f]'

export function ProposalScopeCopy({
  blocks,
  items = [],
}: {
  blocks: PortableTextBlock[]
  items?: Array<string | null>
}) {
  const lines = items.map((item) => stegaClean(item ?? '').trim()).filter(Boolean)
  if (blocks.length === 0 && lines.length === 0) return null
  return (
    <div className={proposalScopeCopyClass}>
      {blocks.length > 0 ? (
        <PortableText value={blocks} />
      ) : (
        <ul>
          {lines.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
