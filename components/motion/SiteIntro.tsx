'use client'

import {usePathname} from 'next/navigation'
import {useEffect} from 'react'
import {EASE, gsap} from './gsap'
import {
  abortIntroForRouteChange,
  claimIntroPlay,
  clearIntroBootDom,
  emitIntroPhase,
  finishIntroPlay,
  getIntroState,
  INTRO_OVERLAY_ID,
  revealIntroChrome,
  setActiveIntroTimeline,
  skipIntroPlay,
} from './intro'

/**
 * Home intro — TinyWins choreography, Salt-tuned.
 *
 * Runs imperatively (DOM + GSAP on document.body) so React Strict Mode
 * remounts cannot kill the timeline mid-flight.
 *
 * Timing:
 *  0.0s   Ink + filled letters
 *  0.9s   White wipe DOWN — putty reaction as it hits the mark
 *  1.45s  Mark flies to nav (throw + soft settle)
 *  2.1s   Overlay clears → empty paper
 *  then   nav swipe → hero type → project strip
 */
export function SiteIntro() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/') {
      abortIntroForRouteChange()
      return
    }

    // Already mid-flight from a prior mount (Strict Mode) — leave it alone.
    if (document.getElementById(INTRO_OVERLAY_ID)) {
      return
    }

    if (!claimIntroPlay()) {
      // Don't abort a live timeline — only release waiters when we truly skip.
      if (getIntroState() !== 'playing') {
        skipIntroPlay()
      }
      return
    }

    document.documentElement.dataset.intro = 'playing'
    document.documentElement.style.overflow = 'hidden'
    window.scrollTo(0, 0)

    const overlay = buildOverlay()
    document.body.appendChild(overlay.root)

    // Clear the pre-hydration boot cover only after the real overlay is mounted
    // so there is never a frame of bare page between the two.
    clearIntroBootDom()

    const tl = runIntro(overlay)
    setActiveIntroTimeline(tl)

    // Critical: do NOT kill the timeline or remove the overlay on cleanup.
    // Strict Mode remounts must not abort the ~5.5s sequence.
  }, [pathname])

  return null
}

type Overlay = {
  root: HTMLDivElement
  black: HTMLDivElement
  wipe: HTMLDivElement
  mark: HTMLDivElement
  markLight: HTMLDivElement
  markDark: HTMLDivElement
}

function buildOverlay(): Overlay {
  const root = document.createElement('div')
  root.id = INTRO_OVERLAY_ID
  root.setAttribute('aria-hidden', 'true')
  root.setAttribute('data-site-intro', '')
  root.style.cssText = 'position:fixed;inset:0;z-index:200;pointer-events:none;overflow:hidden'

  const black = document.createElement('div')
  black.style.cssText = 'position:absolute;inset:0;background:#08090a'

  const wipe = document.createElement('div')
  wipe.style.cssText = 'position:absolute;inset:0;background:#ffffff;will-change:transform'

  const mark = document.createElement('div')
  mark.setAttribute('data-intro-mark', '')
  mark.style.cssText = 'position:absolute;left:50%;top:50%;will-change:transform;color:#eaeaea'

  const markDark = document.createElement('div')
  markDark.setAttribute('aria-hidden', 'true')
  markDark.style.cssText = 'color:#08090a'
  markDark.innerHTML = WORDMARK_SVG

  const markLight = document.createElement('div')
  markLight.style.cssText = 'position:absolute;inset:0;color:#eaeaea'
  markLight.innerHTML = WORDMARK_SVG

  mark.append(markDark, markLight)
  root.append(black, wipe, mark)

  return {root, black, wipe, mark, markLight, markDark}
}

function measureFly(mark: HTMLElement) {
  const navLogo = document.querySelector<HTMLElement>('[data-site-logo]')
  if (!navLogo) return null

  // The pill is parked off-left for the later swipe-in. Measure against its
  // final x:0 seat so the mark doesn’t overshoot into the left gutter.
  const navPill = document.querySelector<HTMLElement>('[data-nav-pill]')
  const pillX = navPill ? Number(gsap.getProperty(navPill, 'x')) || 0 : 0
  const pillY = navPill ? Number(gsap.getProperty(navPill, 'y')) || 0 : 0
  if (navPill) gsap.set(navPill, {x: 0, y: 0})

  // Temporarily reveal for accurate layout (autoAlpha may have visibility:hidden).
  const prevVis = navLogo.style.visibility
  const prevOp = navLogo.style.opacity
  navLogo.style.visibility = 'visible'
  navLogo.style.opacity = '0'

  // Drop residual putty scaleX/scaleY so the fly uses a clean uniform scale.
  gsap.set(mark, {scaleX: 1, scaleY: 1, rotation: 0})

  const from = mark.getBoundingClientRect()
  const to = navLogo.getBoundingClientRect()

  navLogo.style.visibility = prevVis
  navLogo.style.opacity = prevOp
  if (navPill) gsap.set(navPill, {x: pillX, y: pillY})

  if (from.width < 1 || to.width < 1) return null

  return {
    x: to.left + to.width / 2 - (from.left + from.width / 2),
    y: to.top + to.height / 2 - (from.top + from.height / 2),
    scale: to.width / from.width,
  }
}

function runIntro(overlay: Overlay) {
  const {root, black, wipe, mark, markLight, markDark} = overlay
  const lightPaths = gsap.utils.toArray<SVGPathElement>(markLight.querySelectorAll('path'))
  const darkPaths = gsap.utils.toArray<SVGPathElement>(markDark.querySelectorAll('path'))

  const navLogo = document.querySelector<HTMLElement>('[data-site-logo]')
  const navPill = document.querySelector<HTMLElement>('[data-nav-pill]')
  const navLinks = gsap.utils.toArray<HTMLElement>('[data-nav-links] a, [data-nav-links] button')
  const navToggle = document.querySelector<HTMLElement>('[data-menu-toggle]')
  const navCta = document.querySelector<HTMLElement>('[data-nav-cta]')

  gsap.set(root, {autoAlpha: 1})
  gsap.set(black, {autoAlpha: 1})
  gsap.set(wipe, {yPercent: -101, autoAlpha: 1})
  gsap.set(mark, {
    autoAlpha: 1,
    xPercent: -50,
    yPercent: -50,
    x: 0,
    y: 0,
    scale: 1,
    transformOrigin: '50% 50%',
  })
  gsap.set(markLight, {autoAlpha: 1})
  gsap.set(markDark, {autoAlpha: 0})

  // Filled letters — clip wipe per path (not outline stroke).
  if (lightPaths.length) {
    gsap.set(lightPaths, {
      fill: 'currentColor',
      stroke: 'none',
      clipPath: 'inset(0 100% 0 0)',
    })
  }
  if (darkPaths.length) {
    gsap.set(darkPaths, {
      fill: 'currentColor',
      stroke: 'none',
      clipPath: 'inset(0 0% 0 0)',
    })
  }

  // Hide chrome as units — children ride along inside the pill.
  // Parked off-left for a L→R swipe reveal.
  if (navPill) gsap.set(navPill, {autoAlpha: 0, x: -56, y: 0})
  if (navCta) gsap.set(navCta, {autoAlpha: 0, x: -56, y: 0})
  if (navLogo) gsap.set(navLogo, {autoAlpha: 1})
  if (navToggle) gsap.set(navToggle, {autoAlpha: 1})
  if (navLinks.length) gsap.set(navLinks, {autoAlpha: 1, y: 0})

  let flyX = 0
  let flyY = 0
  let flyScale = 1

  const lockPaper = () => {
    // Kill the pre-hydration ink cover — it sits at z-199 under this overlay.
    // When the white wipe faded, that boot layer was the black flash.
    clearIntroBootDom()
    document.documentElement.style.setProperty('background-color', '#ffffff', 'important')
    document.body.style.setProperty('background-color', '#ffffff', 'important')
    // Opaque paper on the overlay itself so nothing underneath can show through.
    root.style.backgroundColor = '#ffffff'
  }

  const unlockPaper = () => {
    document.documentElement.style.removeProperty('background-color')
    document.body.style.removeProperty('background-color')
  }

  const finish = () => {
    finishIntroPlay()
    emitIntroPhase('done')
    clearIntroBootDom()
    delete document.documentElement.dataset.intro
    document.documentElement.style.overflow = ''
    unlockPaper()
    root.remove()
    revealIntroChrome()
    window.dispatchEvent(new Event('resize'))
    setActiveIntroTimeline(null)
  }

  const tl = gsap.timeline({onComplete: finish})

  // 1 — Ink: each filled letter wipes in
  if (lightPaths.length) {
    tl.to(
      lightPaths,
      {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.38,
        stagger: 0.07,
        ease: 'power3.inOut',
      },
      0.08,
    )
  }

  // Brief hold, then white arrives — putty is the wipe's impact, not a pause.
  const WIPE = 0.9
  tl.to({}, {duration: WIPE}, 0)

  // 2 — White wipe DOWN + dark mark swap
  const WIPE_DUR = 0.48
  tl.to(wipe, {yPercent: 0, duration: WIPE_DUR, ease: 'power2.inOut'}, WIPE)
  tl.to(markDark, {autoAlpha: 1, duration: 0.14, ease: 'power2.out'}, WIPE + 0.08)
  tl.to(markLight, {autoAlpha: 0, duration: 0.16, ease: 'power2.in'}, WIPE + 0.1)

  // Putty reaction as the wipe edge hits the mark (continuous with the wipe)
  tl.to(
    mark,
    {
      keyframes: [
        {scaleX: 1.07, scaleY: 0.9, rotation: -1.5, duration: 0.07},
        {scaleX: 0.93, scaleY: 1.08, rotation: 2.1, duration: 0.08},
        {scaleX: 1.05, scaleY: 0.95, rotation: -1.3, duration: 0.08},
        {scaleX: 0.97, scaleY: 1.04, rotation: 0.9, duration: 0.08},
        {scaleX: 1.015, scaleY: 0.99, rotation: -0.25, duration: 0.09},
        {scaleX: 1, scaleY: 1, rotation: 0, duration: 0.09},
      ],
      ease: 'none',
      transformOrigin: '50% 50%',
    },
    WIPE + 0.14,
  )

  // Ink gone + paper locked before any later reveal
  tl.set(black, {autoAlpha: 0, display: 'none'}, WIPE + WIPE_DUR)
  tl.add(() => {
    black.remove()
    lockPaper()
  }, WIPE + WIPE_DUR)

  // 3 — Fly to nav: throw out → soft arc land (not a linear slide)
  const FLY_DUR = 0.62
  const FLY = WIPE + WIPE_DUR + 0.08
  tl.call(
    () => {
      const fly = measureFly(mark)
      if (!fly) return
      flyX = fly.x
      flyY = fly.y
      flyScale = fly.scale
    },
    undefined,
    FLY,
  )

  // Clear putty scaleX/Y so the uniform scale tween reads cleanly.
  tl.set(mark, {scaleX: 1, scaleY: 1, rotation: 0}, FLY)

  const throwDur = FLY_DUR * 0.38
  const landDur = FLY_DUR * 0.62
  // Midpoint lifts slightly so the path arcs instead of sliding on a line.
  tl.to(
    mark,
    {
      x: () => flyX * 0.42,
      y: () => flyY * 0.28 - 36,
      scale: () => 1 + (flyScale - 1) * 0.35,
      rotation: () => (flyX <= 0 ? 3.2 : -3.2),
      duration: throwDur,
      ease: 'power2.in',
      force3D: true,
    },
    FLY,
  )
  tl.to(
    mark,
    {
      x: () => flyX,
      y: () => flyY,
      scale: () => flyScale,
      rotation: 0,
      duration: landDur,
      ease: 'power3.out',
      force3D: true,
    },
    FLY + throwDur,
  )

  // 4 — Land on paper, clear the loader veil → empty white beat
  const LAND = FLY + FLY_DUR
  tl.add(() => {
    clearIntroBootDom()
    lockPaper()
  }, LAND)
  tl.to(mark, {autoAlpha: 0, duration: 0.12, ease: 'power2.in'}, LAND)
  tl.to(root, {autoAlpha: 0, duration: 0.28, ease: 'power2.out'}, LAND + 0.06)

  // 5 — Empty paper, then staged page chrome (all after the loader)
  //     empty → nav pill + Book CTA → hero type → project strip
  // Keep the blank beat short — long gaps read as “nothing is happening.”
  const NAV = LAND + 0.22
  tl.add(() => {
    emitIntroPhase('nav')
    window.dispatchEvent(new Event('resize'))
  }, NAV)

  if (navPill) {
    tl.to(navPill, {autoAlpha: 1, x: 0, duration: 0.5, ease: EASE.outQuint}, NAV)
  }
  if (navCta) {
    tl.to(navCta, {autoAlpha: 1, x: 0, duration: 0.5, ease: EASE.outQuint}, NAV + 0.06)
  }

  // Start type while nav is still settling so the page never idles empty.
  const HERO = NAV + 0.2
  tl.add(() => emitIntroPhase('hero'), HERO)

  const PROJECTS = HERO + 0.4
  tl.add(() => emitIntroPhase('projects'), PROJECTS)

  return tl
}

/** Inline Salt wordmark — same paths as SaltWordmark.tsx (oversized for intro). */
const WORDMARK_SVG = `<svg viewBox="0 0 555.03 339.25" fill="currentColor" role="img" aria-label="Salt Studio" style="height:clamp(5rem,14vw,7.5rem);width:auto;display:block">
<path d="M118.58,313.17c10.86-10.29,19.26-22.45,25.19-36.46,5.93-14.03,8.9-29.15,8.92-46.08.02-13.86-2.08-25.93-6.3-36.65-4.22-10.72-11.4-20.12-21.53-28.55-10.14-8.41-23.93-16-41.39-22.86-10.23-4.1-18.12-8.42-23.67-12.85-5.55-4.42-9.51-9.55-11.89-15.31-2.37-5.75-3.56-12.8-3.55-21.06.02-11.74,2.63-20.87,7.84-27.09,5.21-6.23,12.4-8.25,21.58-6.35,7.23,1.49,13.4,5.01,18.51,10.35,5.11,5.35,9.16,12.17,12.15,20.44,2.99,8.28,4.74,17.56,5.26,28,13.41.27,26.82.64,40.22,1.09-1.21-18.21-4.85-34.81-10.92-50.4-6.07-15.58-14.48-29.21-25.22-40.93-10.75-11.69-23.88-20.38-39.4-25.23-14.64-4.57-27.25-4.4-37.84,1.24-10.59,5.62-18.68,15.87-24.25,30.7-5.58,14.82-8.38,33.45-8.41,55.19-.03,20.39,2.16,37.55,6.55,51.03,4.39,13.5,11.48,24.54,21.26,32.9,9.78,8.38,22.69,15.49,38.74,21.12,11.64,4.02,20.45,7.95,26.45,11.98,5.99,4.05,10.04,8.49,12.16,13.48,2.11,5,3.16,10.93,3.15,17.91,0,7.54-1.25,14.07-3.73,19.7-2.48,5.64-6.06,10.2-10.74,13.71-4.68,3.5-10.37,5.99-17.08,7.35-8.12,1.66-14.95.8-20.51-2.76-5.55-3.56-9.96-9.73-13.21-18.54-3.26-8.8-5.4-19.93-6.44-33.24-13.5,2.39-27,4.85-40.5,7.4.85,25.9,4.52,47.93,11.03,65.34,6.5,17.44,15.58,29.46,27.21,36.08,11.64,6.65,25.57,7.01,41.81,1.98,14.83-4.59,27.67-12.37,38.53-22.65Z"/>
<path d="M181.19,298.81c4.61-19.53,9.22-38.49,13.83-56.86l72.26-12.23c4.57,13.78,9.14,26.98,13.71,39.61l41.83-12.36c-22.52-50.78-45.02-114.97-67.5-192.56l-47.62-14.2c-22.68,73.56-45.37,160.52-68.08,260.89l41.56-12.28ZM231.45,108.4c8.25,30.53,16.51,59.16,24.76,85.89l-49.75,3.22c8.33-31.6,16.66-61.31,24.99-89.11Z"/>
<path d="M442.48,221.61l.02-18.27-108.79,20.51c7.4,5.38,14.81,10.22,22.21,14.52l.18-143.91-40.21-11.99-.23,176.61,126.81-37.46Z"/>
<path d="M498.6,205.03l.07-55.78,56.35,10.77v-6.23s-152.89-45.6-152.89-45.6l-.03,22.61,56.09,10.72-.1,75.48,40.5-11.97Z"/>
</svg>`
