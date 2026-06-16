'use client'

import { useState } from 'react'
import { QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AssetScan } from '@/components/scan/AssetScan'

export function AssetScanDialogButton({ basePath }: { basePath: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 rounded-full gap-2">
          <QrCode className="h-4 w-4" />
          Scan QR
        </Button>
      </DialogTrigger>
      <DialogOverlay className="bg-black/50 backdrop-blur-xs" />

      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-md border-border bg-background pt-0">
        <DialogHeader>
          <DialogTitle className="sr-only">Scan asset QR</DialogTitle>
        </DialogHeader>
        <ScrollArea>
          <AssetScan
            scanBasePath={`${basePath}/scan`}
            searchPath={`${basePath}/assets`}
            onScanSuccess={() => setOpen(false)}
          />
        </ScrollArea>
      </DialogContent>

    </Dialog>
  )
}
