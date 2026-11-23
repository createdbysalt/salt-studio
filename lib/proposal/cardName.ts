import {stegaClean} from 'next-sanity'

/**
 * The label on an Investment card and a pick-list row.
 * A blank card name falls back to the add-on name. Scope, the statement,
 * and the quote keep the name.
 */
export function addOnCardLabel(
  cardName: string | null | undefined,
  name: string | null | undefined,
) {
  const card = stegaClean(cardName ?? '').trim()
  if (card) return card
  return stegaClean(name ?? '').trim()
}
