'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function isModifiedEvent(event: MouseEvent) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey
}

function isSameOriginLink(target: HTMLElement) {
  const anchor = target.closest('a')
  if (!anchor || !anchor.href) {
    return null
  }
  if (anchor.target && anchor.target !== '_self') {
    return null
  }
  if (anchor.getAttribute('download') !== null) {
    return null
  }
  const url = new URL(anchor.href, window.location.href)
  if (url.origin !== window.location.origin) {
    return null
  }
  return url
}

export function RouteLoadingOverlay() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [active, setActive] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const clearTimer = () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedEvent(event)) {
        return
      }
      const target = event.target as HTMLElement | null
      if (!target) {
        return
      }
      const url = isSameOriginLink(target)
      if (!url) {
        return
      }
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return
      }
      clearTimer()
      setActive(true)
    }

    const handlePopState = () => {
      clearTimer()
      setActive(true)
    }

    document.addEventListener('click', handleClick)
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('click', handleClick)
      window.removeEventListener('popstate', handlePopState)
      clearTimer()
    }
  }, [])

  useEffect(() => {
    if (!active) {
      return
    }
    timeoutRef.current = window.setTimeout(() => {
      setActive(false)
      timeoutRef.current = null
    }, 250)
  }, [active, pathname, searchParams])

  if (!active) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/30 backdrop-blur-md">
      <div className="flex items-center justify-center rounded-full bg-background/70 p-4 shadow-sm backdrop-blur-sm">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted/60 border-t-foreground/80" />
      </div>
    </div>
  )
}
