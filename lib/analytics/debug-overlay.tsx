'use client'

import {useCallback, useEffect, useRef, useState} from 'react'

interface DebugEvent {
  id: number
  event: string
  data: Record<string, unknown>
  timestamp: Date
}

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const POSITION_STORAGE_KEY = 'analytics-debug-corner'
const ICON_SIZE = 44
const MARGIN = 16
const DRAG_THRESHOLD = 5 // px — below this, treat as click
const PANEL_WIDTH = 384 // w-96
const PANEL_MAX_HEIGHT = 400
const CORNERS: Corner[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

/**
 * Analytics Debug Overlay
 *
 * Shows real-time analytics events in development mode.
 * Magnetic draggable indicator: drag anywhere, releases snap to the
 * nearest screen corner. Click to toggle the event panel. Corner
 * persists in localStorage.
 *
 * Only renders in development — automatically removed in production builds.
 */
export function AnalyticsDebugOverlay() {
  const [events, setEvents] = useState<DebugEvent[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [eventCount, setEventCount] = useState(0)

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <DebugOverlayInner
      events={events}
      setEvents={setEvents}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      eventCount={eventCount}
      setEventCount={setEventCount}
    />
  )
}

function cornerToXY(corner: Corner): {x: number; y: number} {
  switch (corner) {
    case 'top-left':
      return {x: MARGIN, y: MARGIN}
    case 'top-right':
      return {x: window.innerWidth - ICON_SIZE - MARGIN, y: MARGIN}
    case 'bottom-left':
      return {x: MARGIN, y: window.innerHeight - ICON_SIZE - MARGIN}
    case 'bottom-right':
      return {
        x: window.innerWidth - ICON_SIZE - MARGIN,
        y: window.innerHeight - ICON_SIZE - MARGIN,
      }
  }
}

function nearestCorner(x: number, y: number): Corner {
  const centerX = x + ICON_SIZE / 2
  const centerY = y + ICON_SIZE / 2
  const isLeft = centerX < window.innerWidth / 2
  const isTop = centerY < window.innerHeight / 2
  if (isTop && isLeft) return 'top-left'
  if (isTop) return 'top-right'
  if (isLeft) return 'bottom-left'
  return 'bottom-right'
}

function DebugOverlayInner({
  events,
  setEvents,
  isOpen,
  setIsOpen,
  eventCount,
  setEventCount,
}: {
  events: DebugEvent[]
  setEvents: React.Dispatch<React.SetStateAction<DebugEvent[]>>
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  eventCount: number
  setEventCount: React.Dispatch<React.SetStateAction<number>>
}) {
  const [mounted, setMounted] = useState(false)
  const [corner, setCorner] = useState<Corner>('bottom-right')
  const [dragPosition, setDragPosition] = useState<{x: number; y: number} | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStateRef = useRef<{
    startPointerX: number
    startPointerY: number
    startX: number
    startY: number
    moved: boolean
  } | null>(null)

  // Restore saved corner on mount
  useEffect(() => {
    const saved = localStorage.getItem(POSITION_STORAGE_KEY)
    if (saved && CORNERS.includes(saved as Corner)) {
      setCorner(saved as Corner)
    }
    setMounted(true)
  }, [])

  // Force a re-render on resize so cornerToXY recomputes
  useEffect(() => {
    const handleResize = () => setCorner((c) => c) // trigger re-render
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const addEvent = useCallback(
    (data: Record<string, unknown>) => {
      const newEvent: DebugEvent = {
        id: Date.now() + Math.random(),
        event: (data.event as string) || 'unknown',
        data,
        timestamp: new Date(),
      }
      setEvents((prev) => [newEvent, ...prev].slice(0, 50))
      setEventCount((prev) => prev + 1)
    },
    [setEvents, setEventCount],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    window.dataLayer = window.dataLayer || []
    const originalPush = window.dataLayer.push.bind(window.dataLayer)

    window.dataLayer.push = function (...args: (Record<string, unknown> | unknown[])[]) {
      args.forEach((arg) => {
        if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
          addEvent(arg as Record<string, unknown>)
        }
      })
      return originalPush(...args)
    }

    window.dataLayer.forEach((item) => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        addEvent(item as Record<string, unknown>)
      }
    })

    return () => {
      window.dataLayer.push = originalPush
    }
  }, [addEvent])

  const clearEvents = () => {
    setEvents([])
    setEventCount(0)
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const current = cornerToXY(corner)
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStateRef.current = {
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startX: current.x,
      startY: current.y,
      moved: false,
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const state = dragStateRef.current
    if (!state) return
    const dx = e.clientX - state.startPointerX
    const dy = e.clientY - state.startPointerY
    if (!state.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
    state.moved = true
    if (!isDragging) setIsDragging(true)
    setDragPosition({x: state.startX + dx, y: state.startY + dy})
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const state = dragStateRef.current
    if (!state) return
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // pointer may already be released
    }
    dragStateRef.current = null

    if (state.moved && dragPosition) {
      // Snap to the nearest corner
      const snapped = nearestCorner(dragPosition.x, dragPosition.y)
      setCorner(snapped)
      localStorage.setItem(POSITION_STORAGE_KEY, snapped)
      setDragPosition(null)
      setIsDragging(false)
    } else {
      // It was a click, not a drag — toggle the panel
      setIsOpen((v) => !v)
    }
  }

  if (!mounted) return null

  const {x, y} = dragPosition ?? cornerToXY(corner)

  // Panel always opens from the settled corner, so use corner (not drag pos)
  // to decide flip direction
  const openLeft = corner === 'top-right' || corner === 'bottom-right'
  const openUp = corner === 'bottom-left' || corner === 'bottom-right'
  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    [openLeft ? 'right' : 'left']: ICON_SIZE + 8,
    [openUp ? 'bottom' : 'top']: 0,
    maxHeight: PANEL_MAX_HEIGHT,
  }

  return (
    <div
      className={`fixed z-[9999] font-mono text-xs ${
        isDragging ? '' : 'transition-[left,top] duration-200 ease-out'
      }`}
      style={{left: x, top: y, width: ICON_SIZE, height: ICON_SIZE}}
    >
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition-colors hover:bg-gray-50 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        title="Analytics Debug — drag to move, click to open"
        aria-label="Toggle analytics debug panel"
        style={{touchAction: 'none', userSelect: 'none'}}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
        {eventCount > 0 && (
          <span className="pointer-events-none absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-900 px-1 text-[9px] font-medium text-white">
            {eventCount > 99 ? '99+' : eventCount}
          </span>
        )}
      </button>

      {isOpen && !isDragging && (
        <div
          style={panelStyle}
          className={`w-96 overflow-hidden rounded-md border border-gray-200 bg-white text-gray-900 shadow-lg`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
            <span className="font-medium">dataLayer Events</span>
            <div className="flex gap-2">
              <button
                onClick={clearEvents}
                className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-600 hover:bg-gray-200"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-600 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto">
            {events.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No events yet. Interact with the page.
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="border-b border-gray-50 p-2 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{event.event}</span>
                    <span className="text-[10px] text-gray-400">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="mt-1 overflow-x-auto text-[10px] text-gray-500">
                    {JSON.stringify(
                      Object.fromEntries(Object.entries(event.data).filter(([k]) => k !== 'event')),
                      null,
                      2,
                    )}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
