'use client'

import {useEffect} from 'react'
import {EASE, gsap, prefersReducedMotion} from './gsap'

const OVERLAY_ID = 'proposal-open'
const BOOT_ID = 'proposal-open-boot'
const INK = '#08090a'
const GRAY = '#f3f3f3'

/**
 * Opening for a private proposal. A gray field, the same gray as the
 * situation sheet, holds the line. The line fades in. The field then
 * wipes up and the page is already there underneath.
 * Appended to document.body so a Strict Mode remount cannot restart it.
 * ProposalLayout renders this. The boot cover in app/layout.tsx hides the
 * page until this overlay is mounted.
 */
function clearProposalCover() {
  document.getElementById(BOOT_ID)?.remove()
  document.getElementById(OVERLAY_ID)?.remove()
  document.documentElement.style.overflow = ''
}

export function ProposalOpen() {
  useEffect(() => {
    if (!window.location.pathname.startsWith('/p/')) return
    // The sign-in page is white. The gray opening belongs to the proposal itself.
    if (document.querySelector('[data-proposal-gate]')) {
      clearProposalCover()
      return
    }
    if (document.getElementById(OVERLAY_ID)) {
      document.getElementById(BOOT_ID)?.remove()
      return
    }

    const boot = document.getElementById(BOOT_ID)
    if (prefersReducedMotion()) {
      boot?.remove()
      return
    }

    document.documentElement.style.overflow = 'hidden'
    window.scrollTo(0, 0)

    const root = document.createElement('div')
    root.id = OVERLAY_ID
    root.setAttribute('role', 'presentation')
    root.style.cssText = 'position:fixed;inset:0;z-index:220;overflow:hidden;pointer-events:none'

    const field = document.createElement('div')
    field.style.cssText = `position:absolute;inset:0;background:${GRAY};color:${INK}`

    const stage = document.createElement('div')
    stage.style.cssText =
      'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(36rem,calc(100% - 2.5rem));text-align:center'

    const lines = ['We draw out the good', "that's already there."]
    for (const [index, text] of lines.entries()) {
      const line = document.createElement('p')
      line.textContent = text
      line.style.cssText = [
        'margin:0',
        'font-family:var(--font-sans)',
        'font-size:clamp(1.5rem,2.6vw,2rem)',
        'font-weight:500',
        'letter-spacing:-0.02em',
        'line-height:1.15',
        index === 0 ? '' : 'margin-top:0.12em',
      ].join(';')
      stage.append(line)
    }

    field.append(stage)
    root.append(field)
    document.body.appendChild(root)
    boot?.remove()

    gsap.set(stage, {autoAlpha: 0})

    gsap
      .timeline({
        onComplete: () => {
          root.remove()
          document.documentElement.style.overflow = ''
        },
      })
      .to(stage, {autoAlpha: 1, duration: 1.15, ease: 'power1.out'}, 0.2)
      .to(field, {yPercent: -101, duration: 0.75, ease: EASE.outQuint, force3D: true}, '+=0.55')
  }, [])

  return null
}
