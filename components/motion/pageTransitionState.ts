/**
 * Shared flag for the vertical page wipe.
 * While true, route `loading.tsx` renders a solid destination fill instead of
 * the skeleton — the wipe itself is the loading state.
 */

let wiping = false

export function isPageWiping(): boolean {
  return wiping
}

export function setPageWiping(next: boolean): void {
  wiping = next
  if (typeof document !== 'undefined') {
    if (next) document.documentElement.dataset.pageWiping = ''
    else delete document.documentElement.dataset.pageWiping
  }
}
