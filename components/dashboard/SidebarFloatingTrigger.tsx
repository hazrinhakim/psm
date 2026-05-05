'use client'

import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'

export function SidebarFloatingTrigger() {
  const { toggleSidebar, state } = useSidebar()
  const isOpen = state === 'expanded'

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleSidebar}
      className="h-10 w-10 rounded-full border-border bg-background/90 shadow-md backdrop-blur hover:bg-background"
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      <span className="relative flex h-4 w-4 items-center justify-center">
        <span
          className={`absolute h-0.5 w-4 rounded-full bg-current transition-all duration-200 ${
            isOpen ? 'translate-y-0 rotate-45' : '-translate-y-1.5 rotate-0'
          }`}
        />
        <span
          className={`absolute h-0.5 w-4 rounded-full bg-current transition-all duration-200 ${
            isOpen ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <span
          className={`absolute h-0.5 w-4 rounded-full bg-current transition-all duration-200 ${
            isOpen ? 'translate-y-0 -rotate-45' : 'translate-y-1.5 rotate-0'
          }`}
        />
      </span>
    </Button>
  )
}
