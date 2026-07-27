'use client'

import {motion, useReducedMotion} from 'motion/react'
import type {ReactNode} from 'react'

const EASE = [0.22, 1, 0.36, 1] as const

type RevealProps = {
  children: ReactNode
  className?: string
  /** Extra delay in seconds */
  delay?: number
  /** Initial Y offset in px */
  y?: number
  /** Animate on mount instead of scroll */
  immediate?: boolean
}

/**
 * Quiet enter animation — fade + short rise.
 * Honors prefers-reduced-motion.
 */
export function Reveal({children, className = '', delay = 0, y = 14, immediate = false}: RevealProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  const initial = {opacity: 0, y}
  const animate = {opacity: 1, y: 0}

  return (
    <motion.div
      className={className}
      initial={initial}
      {...(immediate
        ? {animate}
        : {
            whileInView: animate,
            viewport: {once: true, margin: '-6% 0px -4% 0px', amount: 0.2},
          })}
      transition={{duration: 0.7, delay, ease: EASE}}
    >
      {children}
    </motion.div>
  )
}
