/**
 * Home intro — shared constants + helpers.
 * Orchestrator: SiteIntro.tsx. Consumers wait via waitForIntroPhase(...).
 *
 * Phase order after the loader: nav → hero → projects → done.
 * Plays on every full load of `/` (and when returning to `/` via client nav).
 * Module-level lock survives React Strict Mode remounts within a single play.
 * Boot script sets __SALT_INTRO__ before hydration so waiters block early.
 */

export const INTRO_EVENT = 'salt:intro'
export const INTRO_BOOT_FLAG = '__SALT_INTRO__'
export const INTRO_BOOT_STYLE_ID = 'salt-intro-boot-style'
export const INTRO_BOOT_OVERLAY_ID = 'salt-intro-boot'
export const INTRO_OVERLAY_ID = 'salt-site-intro'

export type IntroPhase = 'nav' | 'hero' | 'projects' | 'done'

const PHASE_ORDER: IntroPhase[] = ['nav', 'hero', 'projects', 'done']

/** Opaque handle — avoid importing gsap types into this module. */
type IntroTimeline = {kill: () => void}

declare global {
  interface Window {
    __SALT_INTRO__?: boolean
  }
}

/** Module-level lock — survives React Strict Mode remounts. */
let introState: 'idle' | 'playing' | 'done' = 'idle'
let activeTimeline: IntroTimeline | null = null
/** Last emitted phase — late waiters (Strict Mode remount) must not hang. */
let lastPhase: IntroPhase | null = null

export function getIntroState() {
  return introState
}

function hasLiveIntroOverlay() {
  return typeof document !== 'undefined' && !!document.getElementById(INTRO_OVERLAY_ID)
}

/** Boot script armed the intro before React hydrated. */
export function wasIntroBooted(): boolean {
  return typeof window !== 'undefined' && window[INTRO_BOOT_FLAG] === true
}

/**
 * Claim the right to start the intro for this visit to `/`.
 * If Strict Mode remounted before the overlay existed, allow a re-claim.
 */
export function claimIntroPlay(): boolean {
  if (typeof window === 'undefined') return false

  if (introState === 'playing') {
    // Already mid-flight with a live overlay — remount should no-op.
    if (activeTimeline || hasLiveIntroOverlay()) return false
    // Orphaned claim (effect cleaned up before timeline started) — reclaim.
    return true
  }

  if (introState === 'done') return false
  if (window.location.pathname !== '/') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    introState = 'done'
    return false
  }

  introState = 'playing'
  lastPhase = null
  return true
}

export function setActiveIntroTimeline(tl: IntroTimeline | null) {
  activeTimeline = tl
}

export function killActiveIntroTimeline() {
  activeTimeline?.kill()
  activeTimeline = null
}

export function finishIntroPlay() {
  introState = 'done'
  activeTimeline = null
  if (typeof window !== 'undefined') {
    window[INTRO_BOOT_FLAG] = false
  }
}

/** True while the blocking intro overlay owns the first paint / hero wait. */
export function isIntroBlocking(): boolean {
  if (typeof window === 'undefined') return false
  if (introState === 'playing') return true
  if (introState === 'done') return false
  if (wasIntroBooted()) return true
  const phase = document.documentElement.dataset.intro
  return phase === 'pending' || phase === 'playing'
}

/** Home + motion allowed + not already finished this visit. */
export function shouldPlayIntro(): boolean {
  if (typeof window === 'undefined') return false
  if (introState === 'done' || introState === 'playing') return false
  if (window.location.pathname !== '/') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  return true
}

export function clearIntroBootDom(): void {
  document.getElementById(INTRO_BOOT_STYLE_ID)?.remove()
  // Remove every boot cover — Strict Mode / HMR can leave duplicates.
  document.querySelectorAll(`#${INTRO_BOOT_OVERLAY_ID}`).forEach((el) => el.remove())
}

export function emitIntroPhase(phase: IntroPhase): void {
  lastPhase = phase
  window.dispatchEvent(new CustomEvent(INTRO_EVENT, {detail: phase}))
}

/** Skip path — release waiters + clear boot without playing. */
export function skipIntroPlay(): void {
  introState = 'done'
  activeTimeline = null
  clearIntroBootDom()
  delete document.documentElement.dataset.intro
  document.documentElement.style.overflow = ''
  window[INTRO_BOOT_FLAG] = false
  revealIntroChrome()
  emitIntroPhase('done')
}

function phaseSatisfies(requested: IntroPhase, current: IntroPhase | null) {
  if (!current) return false
  return PHASE_ORDER.indexOf(current) >= PHASE_ORDER.indexOf(requested)
}

/** Resolves when SiteIntro reaches `phase` (or immediately if intro isn't blocking). */
export function waitForIntroPhase(phase: IntroPhase): Promise<void> {
  if (typeof window === 'undefined' || !isIntroBlocking()) {
    return Promise.resolve()
  }

  // Hero/done may have already fired while a Strict Mode remount was between
  // waiters — resolve immediately so the hero type never hangs hidden.
  if (phaseSatisfies(phase, lastPhase)) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    const onPhase = (event: Event) => {
      const detail = (event as CustomEvent<IntroPhase>).detail
      if (phaseSatisfies(phase, detail)) {
        window.removeEventListener(INTRO_EVENT, onPhase)
        resolve()
      }
    }
    window.addEventListener(INTRO_EVENT, onPhase)
  })
}

/** Force nav chrome visible — used on finish / skip. */
export function revealIntroChrome(): void {
  const navLogo = document.querySelector<HTMLElement>('[data-site-logo]')
  const navPill = document.querySelector<HTMLElement>('[data-nav-pill]')
  const navLinks = Array.from(
    document.querySelectorAll<HTMLElement>('[data-nav-links] a, [data-nav-links] button'),
  )
  const navToggle = document.querySelector<HTMLElement>('[data-menu-toggle]')
  const navCta = document.querySelector<HTMLElement>('[data-nav-cta]')

  const show = (el: HTMLElement | null) => {
    if (!el) return
    el.style.opacity = '1'
    el.style.visibility = 'visible'
    el.style.transform = ''
  }

  show(navLogo)
  show(navPill)
  show(navToggle)
  show(navCta)
  for (const link of navLinks) show(link)
}

/** Reset when leaving home so a later visit / reload can play again. */
export function abortIntroForRouteChange() {
  if (introState === 'playing') {
    killActiveIntroTimeline()
    document.getElementById(INTRO_OVERLAY_ID)?.remove()
    revealIntroChrome()
    emitIntroPhase('done')
  }
  clearIntroBootDom()
  delete document.documentElement.dataset.intro
  document.documentElement.style.overflow = ''
  window[INTRO_BOOT_FLAG] = false
  activeTimeline = null
  lastPhase = null
  introState = 'idle'
}
