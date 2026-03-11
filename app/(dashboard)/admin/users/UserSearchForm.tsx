"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

type UserSearchFormProps = {
  query: string
}

export function UserSearchForm({ query }: UserSearchFormProps) {
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
      className="flex w-full flex-col gap-3 sm:flex-row sm:items-center animate-in fade-in slide-in-from-bottom-2 duration-700"
      onSubmit={event => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const value = String(formData.get("q") ?? "").trim()
        if (value === query) {
          return
        }
        setPending(true)
        const target = value ? `?q=${encodeURIComponent(value)}` : "?"
        router.push(target)
      }}
    >
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          placeholder="Search users by name, email, or role..."
          defaultValue={query}
          className="h-10 rounded-full border-muted pl-11 pr-4 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 transition-all bg-white"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          className="h-10 gap-2 bg-black hover:bg-stone-600 shadow-md hover:shadow-lg transition-all duration-200 px-6"
          disabled={pending || isClearing}
        >
          {pending ? <Spinner /> : <Search className="h-4 w-4" />}
          Search
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 border-2 hover:bg-gray-100 transition-colors px-6"
          disabled={pending || isClearing}
          onClick={() => {
            if (!query) {
              return
            }
            const input = formRef.current?.querySelector<HTMLInputElement>(
              "input[name='q']"
            )
            if (input) {
              input.value = ""
            }
            startClear(() => {
              router.push("?")
            })
          }}
        >
          {isClearing ? <Spinner className="mr-2" /> : null}
          Clear
        </Button>
      </div>
    </form>
  )
}
