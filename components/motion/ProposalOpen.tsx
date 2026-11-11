'use client'

import {useEffect} from 'react'
import {EASE, gsap, prefersReducedMotion} from './gsap'

const OVERLAY_ID = 'proposal-open'
const BOOT_ID = 'proposal-open-boot'
const INK = '#08090a'
const PAPER = '#ffffff'

/**
 * Opening wipe for a private proposal. Ink holds the line, then paper
 * covers it and fades. The cover settles through that fade. The left
 * actions and the right rail fade in after the page is already there.
 * Appended to document.body so a Strict Mode remount cannot restart it.
 * ProposalLayout renders this. The boot cover in app/layout.tsx hides the
 * page until this overlay is mounted.
 */
export function ProposalOpen() {
  useEffect(() => {
    if (!window.location.pathname.startsWith('/p/')) return
    if (document.getElementById(OVERLAY_ID)) return

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
    root.style.cssText = 'position:fixed;inset:0;z-index:220'

    const ink = document.createElement('div')
    ink.style.cssText = `position:absolute;inset:0;background:${INK};color:#ffffff`

    const stage = document.createElement('div')
    stage.style.cssText =
      'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(36rem,calc(100% - 2.5rem));text-align:center'

    const lines = ['We draw out the good', "that's already there."]
    const words = lines.map((text, index) => {
      const mask = document.createElement('div')
      mask.className = 'mask-line'
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
      mask.append(line)
      stage.append(mask)
      return line
    })

    ink.append(stage)

    const paper = document.createElement('div')
    paper.style.cssText = `position:absolute;inset:0;background:${PAPER}`

    root.append(ink, paper)
    document.body.appendChild(root)
    boot?.remove()

    const cover = document.querySelector<HTMLElement>('[data-proposal-enter="cover"]')
    const lockup = document.querySelector<HTMLElement>('[data-proposal-enter="lockup"]')
    const chrome = Array.from(
      document.querySelectorAll<HTMLElement>('[data-proposal-enter="chrome"]'),
    )
    if (cover) gsap.set(cover, {autoAlpha: 0, y: 12})
    if (lockup) gsap.set(lockup, {autoAlpha: 0})
    if (chrome.length > 0) gsap.set(chrome, {autoAlpha: 0})

    gsap.set(words, {yPercent: 110})
    gsap.set(paper, {yPercent: 101, force3D: true})

    const timeline = gsap.timeline({
      onComplete: () => {
        root.remove()
        document.documentElement.style.overflow = ''
      },
    })
    timeline
      .to(words, {yPercent: 0, duration: 0.6, ease: EASE.outQuint, stagger: 0.05}, 0.06)
      .to(paper, {yPercent: 0, duration: 0.42, ease: EASE.outQuint, force3D: true}, 0.95)
      .set(ink, {autoAlpha: 0})
      .to(paper, {autoAlpha: 0, duration: 0.4, ease: EASE.outCubic})
    if (cover) {
      timeline.to(
        cover,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: EASE.outCubic,
          clearProps: 'opacity,visibility,transform',
        },
        '-=0.32',
      )
    }
    if (lockup) {
      timeline.to(
        lockup,
        {autoAlpha: 1, duration: 0.6, ease: EASE.outCubic, clearProps: 'opacity,visibility'},
        cover ? '<' : '-=0.32',
      )
    }
    if (chrome.length > 0) {
      timeline.to(
        chrome,
        {autoAlpha: 1, duration: 0.5, ease: EASE.outCubic, clearProps: 'opacity,visibility'},
        '-=0.22',
      )
    }
  }, [])

  return null
}
