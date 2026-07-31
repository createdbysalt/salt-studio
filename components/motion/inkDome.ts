/**
 * Shared paper→ink dome scrub used by Legal, Capabilities, and the homepage
 * type-beat bridge. Mobile/tablet get a longer scroll + laggy scrub so touch
 * momentum doesn’t whip the dome across in a flick.
 */
import {gsap} from '@/components/motion/gsap'

export const INK = '#08090a'
export const PAPER = '#ffffff'

/** Trigger height — longer on small viewports = less sensitive scrub. */
export const INK_DOME_TRIGGER_CLASS = 'relative h-[200vh] md:h-[190vh] lg:h-[180vh]'

const SCRUB_TOUCH = 1.45
const SCRUB_DESKTOP = 0.55

type BindInkDomeScrubOptions = {
  trigger: HTMLElement
  ink: HTMLElement
  onCovered: (covered: boolean) => void
}

/**
 * Parks the dome below the fold, scrubs it up to full cover, and reports when
 * ink owns the frame (`progress > 0.9`). Returns a cleanup that reverts
 * matchMedia + kills tweens.
 */
export function bindInkDomeScrub({trigger, ink, onCovered}: BindInkDomeScrubOptions) {
  gsap.set(ink, {y: '50%', force3D: true})

  const mm = gsap.matchMedia()

  const play = (scrub: number) => {
    const tween = gsap.to(ink, {
      y: '-45%',
      ease: 'none',
      force3D: true,
      scrollTrigger: {
        trigger,
        start: 'top top',
        end: 'bottom bottom',
        scrub,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          onCovered(self.progress > 0.9)
        },
        onLeave: () => onCovered(true),
        onLeaveBack: () => onCovered(false),
      },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }

  mm.add('(max-width: 1023px)', () => play(SCRUB_TOUCH))
  mm.add('(min-width: 1024px)', () => play(SCRUB_DESKTOP))

  return () => {
    mm.revert()
  }
}
