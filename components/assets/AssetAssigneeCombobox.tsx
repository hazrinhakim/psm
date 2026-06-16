'use client'

import { useMemo, useRef, useState } from 'react'
import { Check, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

type AssetAssigneeComboboxProps = {
  id: string
  name: string
  options: string[]
  placeholder?: string
  defaultValue?: string
}

export function AssetAssigneeCombobox({
  id,
  name,
  options,
  placeholder = 'Search signed-in user',
  defaultValue = '',
}: AssetAssigneeComboboxProps) {
  const [query, setQuery] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return options.slice(0, 8)
    }

    return options
      .filter(option => option.toLowerCase().includes(normalizedQuery))
      .slice(0, 8)
  }, [options, query])

  function clearCloseTimeout() {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  return (
    <div className="relative">
      <input type="hidden" id={id} name={name} value={query} readOnly />

      <Search className="pointer-events-none absolute left-4 top-[22px] z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={event => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          clearCloseTimeout()
          setOpen(true)
        }}
        onBlur={() => {
          closeTimeoutRef.current = setTimeout(() => {
            setOpen(false)
          }, 120)
        }}
        placeholder={placeholder}
        className="h-11 rounded-full pl-10 pr-10"
        autoComplete="off"
      />

      {query ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-[22px] z-10 h-7 w-7 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
          onMouseDown={event => event.preventDefault()}
          onClick={() => {
            clearCloseTimeout()
            setQuery('')
            setOpen(true)
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}

      {open ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-3xl border bg-popover text-popover-foreground shadow-md">
          <ScrollArea className="max-h-64">
            <div className="p-2">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start rounded-2xl px-3 font-normal text-muted-foreground"
                onMouseDown={event => event.preventDefault()}
                onClick={() => {
                  clearCloseTimeout()
                  setQuery('')
                  setOpen(false)
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Clear assignment
              </Button>

              {filteredOptions.length === 0 ? (
                <p className="px-3 py-3 text-sm text-muted-foreground">
                  No matching registered user.
                </p>
              ) : (
                filteredOptions.map(option => {
                  const isSelected =
                    option.toLowerCase() === query.trim().toLowerCase()

                  return (
                    <Button
                      key={option}
                      type="button"
                      variant="ghost"
                      className="w-full justify-start rounded-2xl px-3 font-normal"
                      onMouseDown={event => event.preventDefault()}
                      onClick={() => {
                        clearCloseTimeout()
                        setQuery(option)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <span className="truncate">{option}</span>
                    </Button>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>
      ) : null}
    </div>
  )
}
