"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

type QrClearButtonProps = {
  href: string
}

type QrDownloadButtonProps = {
  href: string
  label?: string
  size?: "default" | "sm" | "lg" | "xs" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function QrSearchButton({ disabled }: { disabled?: boolean }) {
  const [loading, setLoading] = useState(false)

  return (
    <Button
      type="submit"
      className="h-11 w-full rounded-full gap-2 sm:w-auto"
      disabled={disabled || loading}
      onClick={() => setLoading(true)}
    >
      {loading ? <Spinner /> : <Search className="h-4 w-4" />}
      Search
    </Button>
  )
}

export function QrClearButton({ href }: QrClearButtonProps) {
  const [loading, setLoading] = useState(false)

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full rounded-full sm:w-auto"
      disabled={loading}
      onClick={() => {
        setLoading(true)
        window.location.href = href
      }}
    >
      {loading ? <Spinner className="mr-2" /> : null}
      Clear
    </Button>
  )
}

export function QrGenerateButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={disabled || pending}>
      {pending ? (
        <>
          <Spinner className="mr-2" />
          Generating...
        </>
      ) : (
        "Generate QR Code"
      )}
    </Button>
  )
}

export function QrDownloadButton({
  href,
  label = "Download QR",
  size = "sm",
  variant = "outline",
}: QrDownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      disabled={loading}
      onClick={() => {
        setLoading(true)
        window.location.href = href
        window.setTimeout(() => setLoading(false), 1200)
      }}
    >
      {loading ? <Spinner className="mr-2" /> : null}
      {label}
    </Button>
  )
}

export function QrDeleteConfirmButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? (
        <>
          <Spinner className="mr-2" />
          Deleting...
        </>
      ) : (
        <>
          <Trash2 className="mr-2 h-4 w-4" />
          Confirm Delete
        </>
      )}
    </Button>
  )
}
