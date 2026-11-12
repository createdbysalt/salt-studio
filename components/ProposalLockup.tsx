'use client'

import {SaltWordmark} from '@/components/SaltWordmark'
import {CONTACT_WHATSAPP_HREF} from '@/lib/contactMenu'
import Image from 'next/image'
import {useCallback, useEffect, useRef, useState, type MouseEvent} from 'react'

/**
 * Salt × client, fixed at the top left of a proposal, with Accept & Sign
 * on the right. The two plates match in size and stay frosted. A glass circle stays at the
 * bottom right and opens WhatsApp. ProposalPage renders this beside the rail.
 *
 * Over a photo or a black band the chip switches to white type on a light
 * frost, the same surface read the site nav uses for the wordmark.
 */
export function ProposalLockup({
  client,
  logoUrl,
  logoAlt,
  acceptHref,
}: {
  client: string
  logoUrl?: string
  logoAlt?: string
  acceptHref: string
}) {
  const chip = useRef<HTMLDivElement>(null)
  const accept = useRef<HTMLAnchorElement>(null)
  const contact = useRef<HTMLAnchorElement>(null)
  const [onColor, setOnColor] = useState(false)
  const [contactOverDark, setContactOverDark] = useState(false)

  const syncPlates = useCallback(() => {
    const chipNode = chip.current
    const acceptNode = accept.current
    if (!chipNode) return
    // Below md the two plates are not side by side, so they must not be
    // locked to a shared size. Clear the inline sizes and let them be.
    if (window.innerWidth < 768 || !acceptNode) {
      chipNode.style.width = ''
      chipNode.style.height = ''
      if (acceptNode) {
        acceptNode.style.width = ''
        acceptNode.style.height = ''
      }
      return
    }
    chipNode.style.width = 'max-content'
    chipNode.style.height = ''
    acceptNode.style.width = 'max-content'
    acceptNode.style.height = ''
    const chipBox = chipNode.getBoundingClientRect()
    const acceptBox = acceptNode.getBoundingClientRect()
    const width = Math.ceil(Math.max(chipBox.width, acceptBox.width))
    const height = Math.ceil(Math.max(chipBox.height, acceptBox.height))
    chipNode.style.width = `${width}px`
    chipNode.style.height = `${height}px`
    acceptNode.style.width = `${width}px`
    acceptNode.style.height = `${height}px`
  }, [])

  const setChip = useCallback(
    (node: HTMLDivElement | null) => {
      chip.current = node
      syncPlates()
    },
    [syncPlates],
  )
  const setAccept = useCallback(
    (node: HTMLAnchorElement | null) => {
      accept.current = node
      syncPlates()
    },
    [syncPlates],
  )

  useEffect(() => {
    const read = () => {
      const node = chip.current
      setOnColor(node ? lockupOnColor(node) : false)
      const button = contact.current
      setContactOverDark(button ? surfaceIsDark(button) : false)
    }

    // Both reads hit-test a point and then resolve styles for every element
    // under it. Running that straight out of the scroll handler meant a
    // layout flush in the middle of a scroll, interleaved with the other
    // handlers writing styles. Deferring to a frame keeps the reads batched
    // after layout has settled, and caps them at one pass per frame.
    let queued = 0
    const update = () => {
      if (queued) return
      queued = requestAnimationFrame(() => {
        queued = 0
        read()
      })
    }

    read()
    syncPlates()
    window.addEventListener('scroll', update, {passive: true})
    window.addEventListener('resize', update)
    window.addEventListener('resize', syncPlates)
    document.fonts.ready.then(syncPlates).catch(() => {})
    return () => {
      if (queued) cancelAnimationFrame(queued)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      window.removeEventListener('resize', syncPlates)
    }
  }, [syncPlates])

  const plate = 'bg-[rgba(0,0,0,0.06)] backdrop-blur-[42px]'
  const chipPlate = onColor ? 'bg-[rgba(255,255,255,0.10)] text-white backdrop-blur-[42px]' : plate
  const action =
    'pointer-events-auto rounded-sm px-3 py-2 font-mono text-[12px] font-medium uppercase tracking-[0.08em] transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-current'

  const scrollToAccept = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      const id = acceptHref.replace('#', '')
      const node = document.getElementById(id)
      if (!node) return
      event.preventDefault()
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      node.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'start'})
      history.pushState(null, '', `#${id}`)
    },
    [acceptHref],
  )

  const contactPlate = contactOverDark
    ? 'bg-[rgba(234,234,234,0.92)] text-ink'
    : 'bg-[rgba(0,0,0,0.12)] text-ink'

  return (
    <>
      <div className="pointer-events-none fixed top-5 right-[max(3.5rem,var(--spacing-gutter))] left-[max(3.5rem,var(--spacing-gutter))] z-30 md:right-[max(4.5rem,var(--spacing-gutter))] md:left-[max(4.5rem,var(--spacing-gutter))]">
        {/* Below md the Accept and Sign plate sits at the bottom instead,
            so the client lockup is alone up here and reads better centered. */}
        <div className="flex items-stretch justify-center md:justify-between">
          <div data-proposal-enter="lockup" className="pointer-events-none flex">
            <div
              ref={setChip}
              className={`flex h-full items-center gap-3 rounded-sm px-3 py-2 transition-colors duration-300 ${chipPlate}`}
            >
              <SaltWordmark className="h-[22px] w-auto" />
              <span
                aria-hidden="true"
                className={`font-mono text-[12px] ${onColor ? 'text-white/70' : 'text-muted-foreground'}`}
              >
                ×
              </span>
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={logoAlt || client}
                  width={180}
                  height={72}
                  className={`h-[22px] w-auto object-contain ${onColor ? 'brightness-0 invert' : ''}`}
                />
              ) : (
                <p className="mb-0 shrink-0 whitespace-nowrap font-mono text-[12px] font-medium uppercase tracking-[0.08em]">
                  {client}
                </p>
              )}
            </div>
          </div>
          <a
            ref={setAccept}
            href={acceptHref}
            data-proposal-enter="chrome"
            className={`${action} ${chipPlate} hidden h-full items-center justify-center gap-2 md:inline-flex`}
            onClick={scrollToAccept}
          >
            <span
              aria-hidden
              className="inline-block size-[7px] shrink-0 rounded-full bg-accent lg:size-[6px]"
            />
            Accept & Sign
          </a>
        </div>
      </div>

      {/* On a phone the two plates would collide, so this one sits small at
          the bottom, opposite the contact button. */}
      <a
        href={acceptHref}
        data-proposal-enter="chrome"
        className={`pointer-events-auto fixed bottom-4 left-4 z-30 inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_30px_rgba(40,30,10,0.12)] backdrop-blur-[42px] transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-current md:hidden ${contactPlate}`}
        onClick={scrollToAccept}
      >
        <span aria-hidden className="inline-block size-[6px] shrink-0 rounded-full bg-accent" />
        Accept &amp; Sign
      </a>
      <a
        ref={contact}
        href={CONTACT_WHATSAPP_HREF}
        target="_blank"
        rel="noreferrer"
        aria-label="Contact on WhatsApp"
        data-proposal-enter="chrome"
        className={`pointer-events-auto fixed bottom-4 right-4 z-30 flex size-11 items-center justify-center rounded-full md:bottom-2 md:right-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_30px_rgba(40,30,10,0.12)] backdrop-blur-[42px] transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-current ${contactPlate}`}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px]" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </>
  )
}

/** Same read as the site nav: photos, video, and dark paint flip the mark to white. */
function lockupOnColor(node: HTMLElement) {
  const rect = node.getBoundingClientRect()
  const x = Math.min(window.innerWidth - 1, Math.max(0, rect.left + rect.width / 2))
  const y = Math.min(window.innerHeight - 1, Math.max(0, rect.top + rect.height / 2))

  for (const el of document.elementsFromPoint(x, y)) {
    if (!(el instanceof HTMLElement)) continue
    if (node.contains(el) || el.closest('[data-proposal-enter]')) continue
    if (el instanceof HTMLImageElement || el instanceof HTMLVideoElement) return true

    const style = getComputedStyle(el)
    if (style.pointerEvents === 'none') continue

    const parsed = parseCssColor(style.backgroundColor)
    if (parsed && parsed.a >= 0.45) return relativeLuminance(parsed) < 0.62
    if (style.backgroundImage && style.backgroundImage !== 'none') return true
    if (el.dataset.theme === 'dark') return true
  }

  return false
}

function parseCssColor(value: string): {r: number; g: number; b: number; a: number} | null {
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'transparent') return null
  const match = trimmed.match(
    /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)/i,
  )
  if (!match) return null
  const alphaRaw = match[4]
  let a = 1
  if (alphaRaw !== undefined) {
    a = alphaRaw.endsWith('%') ? Number(alphaRaw.slice(0, -1)) / 100 : Number(alphaRaw)
  }
  return {r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), a}
}

function relativeLuminance({r, g, b}: {r: number; g: number; b: number}) {
  const toLinear = (channel: number) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function surfaceIsDark(node: HTMLElement) {
  const rect = node.getBoundingClientRect()
  const x = Math.min(window.innerWidth - 1, Math.max(0, rect.left + rect.width / 2))
  const y = Math.min(window.innerHeight - 1, Math.max(0, rect.top + rect.height / 2))
  for (const el of document.elementsFromPoint(x, y)) {
    if (!(el instanceof HTMLElement) || el === node || node.contains(el)) continue
    const color = getComputedStyle(el).backgroundColor
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
    if (!match) continue
    const alpha = match[4] === undefined ? 1 : Number(match[4])
    if (alpha < 0.45) continue
    const luminance =
      (0.2126 * Number(match[1]) + 0.7152 * Number(match[2]) + 0.0722 * Number(match[3])) / 255
    return luminance < 0.45
  }
  return false
}
