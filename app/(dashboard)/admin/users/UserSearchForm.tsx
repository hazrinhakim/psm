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
      className="flex w-full flex-col gap-3 sm:flex-row sm:items-center"
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
          className="h-10 rounded-full pl-11 pr-4"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          className="h-10 gap-2 rounded-full px-6"
          disabled={pending || isClearing}
        >
          {pending ? <Spinner /> : <Search className="h-4 w-4" />}
          Search
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-full px-6"
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
