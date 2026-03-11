"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { AssetScanDialogButton } from "@/components/assets/AssetScanDialogButton"

type AssetSearchFormProps = {
  basePath: string
  query: string
}

export function AssetSearchForm({ basePath, query }: AssetSearchFormProps) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [isClearing, startClear] = useTransition()

  return (
    <form
      method="get"
      className="flex w-full flex-col gap-3 sm:flex-row sm:items-center animate-in fade-in slide-in-from-bottom-2 duration-700"
      onSubmit={() => setPending(true)}
    >
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          placeholder="Search assets by name, ID, department, or user..."
          defaultValue={query}
          className="h-11 rounded-full border-2 border-gray-200 pl-11 pr-4 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 transition-all bg-white hover:border-gray-300"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          className="h-11 gap-2 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 shadow-md hover:shadow-lg transition-all duration-200 px-8 rounded-full group"
          disabled={pending || isClearing}
        >
          {pending ? <Spinner /> : <Search className="h-4 w-4 transition-transform group-hover:scale-110" />}
          Search
        </Button>
        <Button
          variant="outline"
          className="h-11 border-2 border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 px-8 rounded-full"
          type="button"
          disabled={pending || isClearing}
          onClick={() => {
            startClear(() => {
              router.push(`${basePath}/assets`)
            })
          }}
        >
          {isClearing ? (
            <>
              <Spinner className="mr-2" />
              Clearing...
            </>
          ) : (
            "Clear"
          )}
        </Button>
        <AssetScanDialogButton basePath={basePath} />
      </div>
    </form>
  )
}
