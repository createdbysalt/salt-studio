'use client'

import {useEffect, useId, useRef, useState, type KeyboardEvent} from 'react'

type ContactSelectProps = {
  name: string
  label: string
  options: string[]
  placeholder?: string
  required?: boolean
  error?: boolean
  /** Underline field (contact page) vs boxed (embed). */
  variant?: 'underline' | 'boxed'
  value?: string
  onChange?: (value: string) => void
}

/**
 * Custom select for contact — native menus can’t match Salt Studio type/surface.
 */
export function ContactSelect({
  name,
  label,
  options,
  placeholder = 'Select an option',
  required,
  error,
  variant = 'underline',
  value: valueProp,
  onChange,
}: ContactSelectProps) {
  const [open, setOpen] = useState(false)
  const [uncontrolled, setUncontrolled] = useState('')
  const value = valueProp ?? uncontrolled
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const triggerId = useId()

  useEffect(() => {
    if (!open) return

    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selectedLabel = value || placeholder
  const underline = variant === 'underline'

  const pick = (option: string) => {
    if (valueProp === undefined) setUncontrolled(option)
    onChange?.(option)
    setOpen(false)
    setActiveIndex(-1)
  }

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex(value ? Math.max(0, options.indexOf(value)) : 0)
    }
  }

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => Math.min(options.length - 1, (i < 0 ? -1 : i) + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => Math.max(0, (i < 0 ? options.length : i) - 1))
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      pick(options[activeIndex])
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(options.length - 1)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} required={required} />

      <button
        id={triggerId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
        className={
          underline
            ? `flex min-h-12 w-full items-center justify-between gap-3 border-0 border-b bg-transparent px-0 py-3 text-left font-sans text-base transition-colors duration-200 focus:outline-none focus:ring-0 sm:min-h-0 sm:py-2.5 sm:text-[0.9375rem] ${
                error
                  ? 'border-error'
                  : open
                    ? 'border-accent'
                    : 'border-foreground/15 hover:border-foreground/40'
              } ${value ? 'text-foreground' : 'text-foreground/40'}`
            : `flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border bg-surface px-3.5 py-3 text-left font-sans text-base transition-colors duration-200 focus:outline-none focus:ring-0 sm:min-h-0 sm:py-2.5 sm:text-[0.9375rem] ${
                error ? 'border-error' : open ? 'border-accent' : 'border-foreground/15'
              } ${value ? 'text-foreground' : 'text-foreground/40'}`
        }
      >
        <span className="min-w-0 truncate">{selectedLabel}</span>
        <span
          aria-hidden="true"
          className={`shrink-0 text-foreground/40 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        >
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={triggerId}
          tabIndex={-1}
          onKeyDown={onListKeyDown}
          className="absolute left-0 right-0 z-40 mt-1 max-h-[min(16rem,50dvh)] overflow-auto rounded-lg border border-foreground/15 bg-surface py-1 shadow-[0_12px_40px_rgba(0,0,0,0.08)] focus:outline-none"
        >
          {options.map((option, index) => {
            const selected = option === value
            const active = index === activeIndex
            return (
              <li key={option} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => pick(option)}
                  className={`flex min-h-11 w-full items-center px-3 py-3 text-left font-sans text-[0.9375rem] transition-colors duration-150 sm:min-h-0 sm:py-2.5 sm:text-[0.875rem] ${
                    selected
                      ? 'bg-foreground text-background'
                      : active
                        ? 'bg-foreground/[0.06] text-foreground'
                        : 'text-foreground/70 hover:bg-foreground/[0.06] hover:text-foreground'
                  }`}
                >
                  {option}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
