'use client'

import { useState } from 'react'
import Link from 'next/link'
import { QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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

      <DialogContent className="left-0 top-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-background p-0 pt-0 sm:left-[50%] sm:top-[50%] sm:h-auto sm:w-[calc(100vw-1.5rem)] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[1.5rem] sm:border sm:p-0">
        <DialogHeader>
          <DialogTitle className="sr-only">Scan asset QR</DialogTitle>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-0">
          <AssetScan
            scanBasePath={`${basePath}/scan`}
            searchPath={`${basePath}/assets`}
            onScanSuccess={() => setOpen(false)}
          />
          <div className="px-4 pb-4 text-center text-xs text-muted-foreground sm:hidden">
            Jika preview kamera masih hitam pada telefon anda, buka scanner penuh di{' '}
            <Link
              href={`${basePath}/scan`}
              className="font-medium text-foreground underline underline-offset-4"
              onClick={() => setOpen(false)}
            >
              halaman scan
            </Link>
            .
          </div>
        </div>
      </DialogContent>

    </Dialog>
  )
}
