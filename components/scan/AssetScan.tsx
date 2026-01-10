'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import QrScanner from 'qr-scanner'

export function AssetScan() {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const workerReadyRef = useRef(false)
  const router = useRouter()
  const pathname = usePathname()

  const scanBasePath = useMemo(() => {
    if (!pathname) {
      return '/scan'
    }
    if (pathname.endsWith('/scan')) {
      return pathname
    }
    return pathname.replace(/\/$/, '')
  }, [pathname])

  const stopCamera = useCallback(() => {
    scannerRef.current?.stop()
    setCameraActive(false)
  }, [])

  const goToResult = useCallback(
    (value: string) => {
      stopCamera()
      router.push(`${scanBasePath}/result?code=${encodeURIComponent(value)}`)
    },
    [router, scanBasePath, stopCamera]
  )

  const handleScan = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus(null)
    setLoading(true)

    const value = code.trim()
    if (!value) {
      setStatus('Enter a QR code value or asset ID.')
      toast.info('Enter a QR code value or asset ID.')
      setLoading(false)
      return
    }

    goToResult(value)
    setLoading(false)
  }

  const startCamera = useCallback(async () => {
    if (cameraActive) {
      return
    }
    setStatus(null)
    if (!videoRef.current) {
      setStatus('Camera preview is not ready.')
      return
    }

    const hasCamera = await QrScanner.hasCamera()
    if (!hasCamera) {
      setStatus('No camera detected on this device.')
      toast.info('No camera detected on this device.')
      return
    }

    if (!workerReadyRef.current) {
      QrScanner.WORKER_PATH = '/qr-scanner-worker.min.js'
      workerReadyRef.current = true
    }

    if (!scannerRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        result => {
          const value =
            typeof result === 'string' ? result.trim() : result?.data?.trim()
          if (value) {
            goToResult(value)
          }
        },
        {
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
          onDecodeError: () => {},
        }
      )
    }

    try {
      await scannerRef.current.start()
      setCameraActive(true)
      setStatus('Scanning...')
    } catch (error) {
      setStatus('Camera access was blocked. Please allow permission.')
      toast.error('Camera access was blocked. Please allow permission.')
      stopCamera()
    }
  }, [cameraActive, goToResult, stopCamera])

  useEffect(() => {
    return () => {
      stopCamera()
      scannerRef.current?.destroy()
      scannerRef.current = null
    }
  }, [stopCamera])

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Scan Asset QR</CardTitle>
          <p className="text-sm text-muted-foreground">
            Use your camera on mobile/tablet or enter a QR value manually.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            <div className="space-y-3 rounded-xl border bg-muted/40 p-3">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                />
                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                    Camera preview
                  </div>
                )}
                <div className="pointer-events-none absolute inset-4 rounded-xl border border-dashed border-white/70" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" onClick={startCamera} disabled={cameraActive}>
                  {cameraActive ? 'Camera Active' : 'Start Camera'}
                </Button>
                {cameraActive && (
                  <Button type="button" variant="outline" onClick={stopCamera}>
                    Stop
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Allow camera access, then align the QR inside the frame.
              </p>
            </div>

            <form onSubmit={handleScan} className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 space-y-2">
                <Label htmlFor="scan-code">QR code / Asset ID</Label>
                <Input
                  id="scan-code"
                  value={code}
                  onChange={event => setCode(event.target.value)}
                  placeholder="AST-1001"
                />
              </div>
              <Button type="submit" disabled={loading} className="self-end">
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </form>
            {status && (
              <p className="text-sm text-muted-foreground">{status}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
