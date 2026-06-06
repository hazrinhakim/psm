"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"

import { Button } from "@/components/ui/button"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
}

const DISMISS_KEY = "icams-pwa-install-dismissed"

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isHidden, setIsHidden] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const standaloneMatch = window.matchMedia("(display-mode: standalone)")
    const navigatorWithStandalone = window.navigator as Navigator & {
      standalone?: boolean
    }
    const isStandalone =
      standaloneMatch.matches || navigatorWithStandalone.standalone === true

    const dismissed = window.sessionStorage.getItem(DISMISS_KEY) === "true"

    if (isStandalone || dismissed) {
      return
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
      setIsHidden(false)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      )
    }
  }, [])

  async function handleInstall() {
    if (!installEvent) {
      return
    }

    await installEvent.prompt()
    const result = await installEvent.userChoice

    if (result.outcome === "accepted") {
      setInstallEvent(null)
      setIsHidden(true)
      return
    }

    window.sessionStorage.setItem(DISMISS_KEY, "true")
    setIsHidden(true)
  }

  function handleDismiss() {
    window.sessionStorage.setItem(DISMISS_KEY, "true")
    setIsHidden(true)
  }

  if (isHidden || !installEvent) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-border/80 bg-card/95 p-4 shadow-2xl backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-primary/12 p-2 text-primary">
            <Download className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Pasang ICAMS</p>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              Tambah aplikasi ini ke peranti untuk akses lebih pantas dan mod
              skrin penuh.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="-mr-1 -mt-1"
            onClick={handleDismiss}
            aria-label="Tutup cadangan pemasangan"
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="mt-4 flex gap-2">
          <Button type="button" className="flex-1" onClick={handleInstall}>
            Pasang App
          </Button>
          <Button type="button" variant="outline" onClick={handleDismiss}>
            Nanti
          </Button>
        </div>
      </div>
    </div>
  )
}
