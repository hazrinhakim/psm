'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Position = {
  x: number
  y: number
}

const STORAGE_KEY = 'icams-ai-bubble-position'
const BUBBLE_SIZE = 56
const VIEWPORT_PADDING = 20
const DRAG_THRESHOLD = 8
const THROW_SENSITIVITY = 12

function getMovementBounds() {
  if (typeof window === 'undefined') {
    return {
      minX: VIEWPORT_PADDING,
      minY: VIEWPORT_PADDING,
      maxX: VIEWPORT_PADDING,
      maxY: VIEWPORT_PADDING,
    }
  }

const inset = 32
const topInset = inset
const rightInset = inset - 6
const bottomInset = inset
const leftInset = inset - 6

  return {
    minX: leftInset,
    minY: topInset,
    maxX: Math.max(leftInset, window.innerWidth - BUBBLE_SIZE - rightInset),
    maxY: Math.max(topInset, window.innerHeight - BUBBLE_SIZE - bottomInset),
  }
}

function clampPosition(position: Position) {
  if (typeof window === 'undefined') {
    return position
  }

  const bounds = getMovementBounds()

  return {
    x: Math.min(Math.max(position.x, bounds.minX), bounds.maxX),
    y: Math.min(Math.max(position.y, bounds.minY), bounds.maxY),
  }
}

function getDefaultPosition() {
  if (typeof window === 'undefined') {
    return { x: VIEWPORT_PADDING, y: VIEWPORT_PADDING }
  }

  const bounds = getMovementBounds()

  return {
    x: bounds.maxX,
    y: bounds.maxY,
  }
}

function snapToIntentCorner(
  position: Position,
  start: Position,
  end: Position
) {
  if (typeof window === 'undefined') {
    return position
  }

  const bounds = getMovementBounds()
  const deltaX = end.x - start.x
  const deltaY = end.y - start.y

  const horizontalSide =
    Math.abs(deltaX) >= THROW_SENSITIVITY
      ? deltaX > 0
        ? 'right'
        : 'left'
      : position.x > (bounds.minX + bounds.maxX) / 2
        ? 'right'
        : 'left'

  const verticalSide =
    Math.abs(deltaY) >= THROW_SENSITIVITY
      ? deltaY > 0
        ? 'bottom'
        : 'top'
      : position.y > (bounds.minY + bounds.maxY) / 2
        ? 'bottom'
        : 'top'

  return {
    x: horizontalSide === 'right' ? bounds.maxX : bounds.minX,
    y: verticalSide === 'bottom' ? bounds.maxY : bounds.minY,
  }
}

export function FloatingAiAssistant() {
  const router = useRouter()
  const pathname = usePathname()
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  const [dragging, setDragging] = useState(false)
  const pointerStartRef = useRef<Position>({ x: 0, y: 0 })
  const pointerCurrentRef = useRef<Position>({ x: 0, y: 0 })
  const dragOffsetRef = useRef<Position>({ x: 0, y: 0 })
  const isPointerDownRef = useRef(false)
  const hasDraggedRef = useRef(false)
  const pointerIdRef = useRef<number | null>(null)
  const isActive = pathname === '/chatbot'

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Position
        setPosition(clampPosition(parsed))
      } catch {
        setPosition(getDefaultPosition())
      }
    } else {
      setPosition(getDefaultPosition())
    }

    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleResize = () => {
      setPosition(current => clampPosition(current))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position))
  }, [mounted, position])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!isPointerDownRef.current) return

      const deltaX = event.clientX - pointerStartRef.current.x
      const deltaY = event.clientY - pointerStartRef.current.y
      const movedEnough = Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD

      if (!dragging && !movedEnough) {
        return
      }

      if (!dragging) {
        setDragging(true)
        hasDraggedRef.current = true
      }

      setPosition(
        clampPosition({
          x: event.clientX - dragOffsetRef.current.x,
          y: event.clientY - dragOffsetRef.current.y,
        })
      )
      pointerCurrentRef.current = {
        x: event.clientX,
        y: event.clientY,
      }
    }

    const handlePointerUp = () => {
      isPointerDownRef.current = false
      pointerIdRef.current = null

      if (dragging) {
        setDragging(false)
        setPosition(current =>
          snapToIntentCorner(
            current,
            pointerStartRef.current,
            pointerCurrentRef.current
          )
        )
      }

      window.setTimeout(() => {
        hasDraggedRef.current = false
      }, 0)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [dragging])

  if (!mounted) {
    return null
  }

  return (
    <div
      className="fixed z-40"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: dragging
          ? 'none'
          : 'left 560ms cubic-bezier(0.22, 1, 0.36, 1), top 560ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <Button
        variant={isActive ? 'default' : 'outline'}
        size="icon-lg"
        type="button"
        className={cn(
          'h-13 w-13 rounded-full border border-slate-700/80 bg-slate-900 text-white shadow-[0_10px_24px_-12px_rgba(15,23,42,0.65)] transition-[transform,background-color,border-color,box-shadow] duration-300 hover:scale-[1.03] hover:border-slate-700 hover:bg-slate-800 hover:text-white dark:border-white/10 dark:bg-slate-900 dark:hover:bg-slate-800',
          dragging && 'scale-110 cursor-grabbing shadow-[0_16px_32px_-10px_rgba(15,23,42,0.75)]'
        )}
        onPointerDown={event => {
          pointerIdRef.current = event.pointerId
          isPointerDownRef.current = true
          hasDraggedRef.current = false
          pointerStartRef.current = {
            x: event.clientX,
            y: event.clientY,
          }
          const rect = event.currentTarget.getBoundingClientRect()
          dragOffsetRef.current = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerUp={event => {
          if (pointerIdRef.current !== event.pointerId) return
          event.currentTarget.releasePointerCapture(event.pointerId)
        }}
        onClick={event => {
          if (hasDraggedRef.current) {
            event.preventDefault()
            return
          }

          router.push('/chatbot')
        }}
      >
        <span
          className={cn(
            'flex h-full w-full cursor-grab items-center justify-center rounded-full transition-transform duration-300',
            dragging && 'rotate-6'
          )}
          aria-label="AI Assistant"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]">
            <Bot className="h-6 w-6" />
          </span>
        </span>
      </Button>
    </div>
  )
}
