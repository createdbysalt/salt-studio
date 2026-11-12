'use client'

import {EASE, gsap, prefersReducedMotion} from '@/components/motion/gsap'
import {SidePanelClose} from '@/components/SidePanelClose'
import {buildProposalPdf, type PdfBlock} from '@/lib/proposal/documentPdf'
import {useGSAP} from '@gsap/react'
import {useCallback, useEffect, useId, useRef, useState, type ReactNode} from 'react'
import {createPortal} from 'react-dom'

/**
 * Opens a paper drawer from the right, the same slide as About.
 * Scope of work and terms both use it.
 */
export function ProposalScopePanel({
  label,
  title,
  dismissLabel,
  closeLabel,
  appearance = 'pill',
  downloadName = null,
  downloadNote = null,
  pdfUrl = null,
  children,
}: {
  label: string
  title: string
  dismissLabel: string
  closeLabel: string
  appearance?: 'pill' | 'inline' | 'text'
  /** File name for the PDF of this open document. Omitted on scope lists. */
  downloadName?: string | null
  downloadNote?: string | null
  /** A lawyer's PDF, when one is already attached. Otherwise the open page is saved. */
  pdfUrl?: string | null
  children: ReactNode
}) {
  const titleId = useId()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [present, setPresent] = useState(false)
  const [interactive, setInteractive] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const openRef = useRef(open)

  const close = useCallback(() => setOpen(false), [])

  const download = useCallback(() => {
    if (!downloadName) return
    if (pdfUrl && saveHostedPdf(pdfUrl, downloadName)) return
    const panel = panelRef.current
    if (!panel) return
    const bytes = buildProposalPdf(blocksFromPanel(panel, title, downloadNote))
    // Copy into a plain ArrayBuffer-backed view so Blob's typing accepts it.
    const blob = new Blob([new Uint8Array(bytes)], {type: 'application/pdf'})
    const url = URL.createObjectURL(blob)
    saveFile(url, downloadName)
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, [downloadName, downloadNote, pdfUrl, title])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    if (open) setPresent(true)
  }, [open])

  useGSAP(
    () => {
      if (!present) return
      const backdrop = backdropRef.current
      const panel = panelRef.current
      if (!backdrop || !panel) return

      const reduced = prefersReducedMotion()
      gsap.killTweensOf([backdrop, panel])

      if (open) {
        gsap.set(panel, {xPercent: 100})
        gsap.set(backdrop, {opacity: 0})
        setInteractive(true)
        const revealEls = gsap.utils.toArray<HTMLElement>('[data-scope-reveal]', panel)
        const tl = gsap.timeline()
        tl.to(backdrop, {opacity: 1, duration: reduced ? 0.01 : 0.55, ease: EASE.outCubic}, 0)
        tl.to(panel, {xPercent: 0, duration: reduced ? 0.01 : 1.05, ease: 'expo.out'}, 0)
        if (!reduced && revealEls.length) {
          gsap.set(revealEls, {opacity: 0, y: 18})
          tl.to(
            revealEls,
            {opacity: 1, y: 0, duration: 0.65, stagger: 0.07, ease: EASE.outCubic},
            0.28,
          )
        }
        return () => {
          tl.kill()
        }
      }

      setInteractive(false)
      const tl = gsap.timeline({
        onComplete: () => {
          if (!openRef.current) setPresent(false)
        },
      })
      tl.to(panel, {xPercent: 100, duration: reduced ? 0.01 : 0.7, ease: 'power3.in'}, 0)
      tl.to(backdrop, {opacity: 0, duration: reduced ? 0.01 : 0.45, ease: EASE.outCubic}, 0)
      return () => {
        tl.kill()
      }
    },
    {scope: rootRef, dependencies: [present, open]},
  )

  useEffect(() => {
    if (!present) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [present, close])

  const {lead, last} = titleLines(title)

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setOpen(true)
        }}
        className={
          appearance === 'inline'
            ? 'cursor-pointer font-[inherit] text-[inherit] leading-[inherit] underline decoration-[#08090a]/50 underline-offset-[3px] hover:decoration-[#08090a]'
            : appearance === 'text'
              ? 'group relative z-[1] mt-auto block w-full cursor-pointer self-end pt-5 text-right text-[0.95rem] font-medium tracking-[-0.02em]'
              : 'inline-flex cursor-pointer items-center rounded-full border border-[#08090a] px-5 py-3 text-[0.95rem] font-medium tracking-[-0.02em] transition-colors duration-300 hover:bg-[#08090a] hover:text-white'
        }
      >
        {label}
        {appearance === 'text' ? (
          <span
            aria-hidden="true"
            className="ml-2 inline-block transition-transform duration-300 ease-out group-hover:translate-x-1"
          >
            →
          </span>
        ) : null}
      </button>
      {mounted && present
        ? createPortal(
            <div
              ref={rootRef}
              className={`fixed inset-0 z-[180] ${interactive ? '' : 'pointer-events-none'}`}
              aria-hidden={!interactive}
            >
              <button
                ref={backdropRef}
                type="button"
                aria-label={dismissLabel}
                tabIndex={interactive ? 0 : -1}
                onClick={close}
                className="absolute inset-0 bg-black/70 opacity-0 backdrop-blur-[6px] supports-[backdrop-filter]:bg-black/55"
              />
              <aside
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="absolute inset-y-0 right-0 flex w-full max-w-[min(100vw,52rem)] flex-col bg-[#f3f3f3] text-[#08090a] shadow-[-24px_0_80px_rgba(0,0,0,0.35)] will-change-transform"
              >
                <SidePanelClose open={open && present} onClose={close} ariaLabel={closeLabel} />
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-7 pt-12 pb-16 md:px-10">
                  <h2
                    id={titleId}
                    data-scope-reveal
                    aria-label={downloadName ? title : undefined}
                    className="max-w-[min(10em,100%)] text-[clamp(2.4rem,5vw,4rem)] font-normal leading-[0.95] tracking-[-0.05em]"
                  >
                    {downloadName ? (
                      <>
                        {lead ? <span className="block">{lead}</span> : null}
                        <span className="inline-flex items-center gap-4 whitespace-nowrap">
                          {last}
                          <button
                            type="button"
                            onClick={download}
                            aria-label={`Download ${title} as a PDF`}
                            className="inline-flex shrink-0 items-center rounded-sm bg-[#08090a] px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase leading-none tracking-label text-white"
                          >
                            Download PDF
                          </button>
                        </span>
                      </>
                    ) : (
                      title
                    )}
                  </h2>
                  <div data-scope-reveal data-proposal-document className="mt-5">
                    {children}
                  </div>
                </div>
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

function titleLines(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean)
  const last = words.length > 1 ? words[words.length - 1] : title.trim()
  return {lead: words.length > 1 ? words.slice(0, -1).join(' ') : '', last}
}

function saveHostedPdf(pdfUrl: string, filename: string) {
  try {
    const url = new URL(pdfUrl)
    url.searchParams.set('dl', filename)
    saveFile(url.toString(), filename)
    return true
  } catch {
    return false
  }
}

function saveFile(href: string, filename: string) {
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.download = filename
  anchor.rel = 'noreferrer'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
}

function blocksFromPanel(panel: HTMLElement, title: string, note: string | null): PdfBlock[] {
  const blocks: PdfBlock[] = [
    {kind: 'kicker', text: 'Salt Studio'},
    {kind: 'title', text: title},
  ]
  if (note?.trim()) blocks.push({kind: 'note', text: note.trim()})
  const root = panel.querySelector('[data-proposal-document]')
  if (root) collectBlocks(root, blocks)
  return blocks
}

function collectBlocks(node: Element, blocks: PdfBlock[]) {
  for (const child of node.children) {
    const tag = child.tagName
    if (tag === 'UL' || tag === 'OL') {
      let index = 1
      for (const item of child.children) {
        if (item.tagName !== 'LI') continue
        const text = visibleText(item)
        if (text) blocks.push({kind: 'bullet', text, marker: tag === 'OL' ? `${index}.` : '•'})
        index += 1
      }
      continue
    }
    if (tag === 'P') {
      const text = visibleText(child)
      if (text) blocks.push({kind: 'paragraph', text})
      continue
    }
    if (tag === 'H2' || tag === 'H3' || tag === 'H4') {
      const text = visibleText(child)
      if (text) blocks.push({kind: 'heading', text})
      continue
    }
    if (child.children.length > 0) collectBlocks(child, blocks)
    else {
      const text = visibleText(child)
      if (text) blocks.push({kind: 'paragraph', text})
    }
  }
}

function visibleText(node: Element) {
  return node.textContent?.replace(/\s+/g, ' ').trim() ?? ''
}
