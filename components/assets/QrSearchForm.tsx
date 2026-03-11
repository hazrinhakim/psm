"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

type QrSearchFormProps = {
  basePath: string
  query: string
}

export function QrSearchForm({ basePath, query }: QrSearchFormProps) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [isClearing, startClear] = useTransition()
  const formRef = useRef<HTMLFormElement | null>(null)

  useEffect(() => {
    setPending(false)
  }, [query])

  return (
    <form
      ref={formRef}
      className="space-y-2"
      onSubmit={event => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const value = String(formData.get("q") ?? "").trim()
        if (value === query) {
          return
        }
        setPending(true)
        const target = value ? `${basePath}/qr?q=${encodeURIComponent(value)}` : `${basePath}/qr`
        router.push(target)
      }}
    >
      <Label htmlFor="qr-search">Search asset</Label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="qr-search"
            name="q"
            placeholder="Search by asset no, asset name or user name"
            defaultValue={query}
            className="h-11 rounded-full border-muted pl-11 pr-4 shadow-sm focus-visible:ring-2 focus-visible:ring-offset-0"
          />
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
          <Button
            type="submit"
            className="h-11 w-full rounded-full gap-2 sm:w-auto"
            disabled={pending || isClearing}
          >
            {pending ? <Spinner /> : <Search className="h-4 w-4" />}
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-full sm:w-auto"
            disabled={pending || isClearing}
            onClick={() => {
              if (!query) {
                return
              }
              const input = formRef.current?.querySelector<HTMLInputElement>("input[name='q']")
              if (input) {
                input.value = ""
              }
              startClear(() => {
                router.push(`${basePath}/qr`)
              })
            }}
          >
            {isClearing ? <Spinner className="mr-2" /> : null}
            Clear
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Search first to unlock the generate button.
      </p>
    </form>
  )
}
