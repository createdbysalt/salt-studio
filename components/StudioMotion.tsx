'use client'

import {motion, useReducedMotion} from 'motion/react'
import type {ReactNode} from 'react'

const EASE = [0.22, 1, 0.36, 1] as const

type StudioImageRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

/** Soft fade + scale settle for media. */
export function StudioImageReveal({children, className = '', delay = 0}: StudioImageRevealProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{opacity: 0, scale: 1.03}}
      whileInView={{opacity: 1, scale: 1}}
      viewport={{once: true, margin: '-4% 0px', amount: 0.2}}
      transition={{duration: 0.9, delay, ease: EASE}}
    >
      {children}
    </motion.div>
  )
}

type StudioLineProps = {
  children: ReactNode
  className?: string
  delay?: number
  immediate?: boolean
}

/** Single headline line — quiet rise. */
export function StudioLine({
  children,
  className = '',
  delay = 0,
  immediate = false,
}: StudioLineProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <span className={className}>{children}</span>
  }

  const animate = {opacity: 1, y: 0}

  return (
    <motion.span
      className={`block ${className}`}
      initial={{opacity: 0, y: 14}}
      {...(immediate
        ? {animate}
        : {
            whileInView: animate,
            viewport: {once: true, amount: 0.4},
          })}
      transition={{duration: 0.65, delay, ease: EASE}}
    >
      {children}
    </motion.span>
  )
}
