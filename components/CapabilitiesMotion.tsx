'use client'

import {motion, useReducedMotion} from 'motion/react'
import type {ReactNode} from 'react'

const EASE = [0.22, 1, 0.36, 1] as const

type CapRevealProps = {
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
 * Quiet enter animation for Capabilities — fade + short rise.
 * Honors prefers-reduced-motion.
 */
export function CapReveal({
  children,
  className = '',
  delay = 0,
  y = 14,
  immediate = false,
}: CapRevealProps) {
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

type CapStaggerProps = {
  children: ReactNode
  className?: string
}

/** Parent for staggered children (module tiles). */
export function CapStagger({children, className = ''}: CapStaggerProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <ul className={className}>{children}</ul>
  }

  return (
    <motion.ul
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{once: true, margin: '-4% 0px', amount: 0.08}}
      variants={{
        hidden: {},
        show: {
          transition: {staggerChildren: 0.028, delayChildren: 0.04},
        },
      }}
    >
      {children}
    </motion.ul>
  )
}

type CapStaggerItemProps = {
  children: ReactNode
  className?: string
}

export function CapStaggerItem({children, className = ''}: CapStaggerItemProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <li className={className}>{children}</li>
  }

  return (
    <motion.li
      className={className}
      variants={{
        hidden: {opacity: 0, y: 10},
        show: {
          opacity: 1,
          y: 0,
          transition: {duration: 0.45, ease: EASE},
        },
      }}
    >
      {children}
    </motion.li>
  )
}
