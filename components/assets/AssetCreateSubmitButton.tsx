"use client"

import { useFormStatus } from "react-dom"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export function AssetCreateSubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 group"
      disabled={pending}
    >
      {pending ? (
        <>
          <Spinner className="mr-2" />
          Saving...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
          Save Asset
        </>
      )}
    </Button>
  )
}
