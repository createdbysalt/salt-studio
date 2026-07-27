'use client'

import {useCallback, useEffect, useRef, useState} from 'react'

const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#'

/** Hover scramble used on nav labels and CTAs. */
export function ScrambleText({text}: {text: string}) {
  const [display, setDisplay] = useState(text)
  const rootRef = useRef<HTMLSpanElement>(null)
  const frameRef = useRef<number | null>(null)
  const frameCountRef = useRef(0)
  const queueRef = useRef<
    Array<{from: string; to: string; start: number; end: number; char: string}>
  >([])

  useEffect(() => {
    setDisplay(text)
  }, [text])

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  const update = useCallback(() => {
    let output = ''
    let complete = 0
    const queue = queueRef.current
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i]
      if (frameCountRef.current >= item.end) {
        complete++
        output += item.to
      } else if (frameCountRef.current >= item.start) {
        if (!item.char || Math.random() < 0.28) {
          item.char = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        }
        output += item.to === ' ' ? ' ' : item.char
      } else {
        output += item.from
      }
    }
    setDisplay(output)
    if (complete < queue.length) {
      frameCountRef.current++
      frameRef.current = requestAnimationFrame(update)
    }
  }, [])

  const scramble = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    const queue: typeof queueRef.current = []
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      const start = Math.floor(Math.random() * 10)
      const end = start + 8 + Math.floor(Math.random() * 10)
      queue.push({from: ch, to: ch, start, end, char: ''})
    }
    queueRef.current = queue
    frameCountRef.current = 0
    update()
  }, [text, update])

  // When nested in `[data-scramble-hover]`, scramble on parent hover so a
  // multi-part control (e.g. "[ / ] Menu") animates as one.
  useEffect(() => {
    const el = rootRef.current
    const parent = el?.closest('[data-scramble-hover]')
    if (!parent) return
    parent.addEventListener('mouseenter', scramble)
    return () => parent.removeEventListener('mouseenter', scramble)
  }, [scramble])

  return (
    <span ref={rootRef} onMouseEnter={scramble} className="inline-block">
      {display}
    </span>
  )
}
