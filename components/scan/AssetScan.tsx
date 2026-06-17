'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { CardContent, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import QrScanner from 'qr-scanner'

export function AssetScan({
  scanBasePath,
  searchPath,
  onScanSuccess,
}: {
  scanBasePath?: string
  searchPath?: string
  onScanSuccess?: () => void
}) {
  const [cameraActive, setCameraActive] = useState(false)
  const [startingCamera, setStartingCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const workerReadyRef = useRef(false)
  const router = useRouter()
  const pathname = usePathname()

  const resolvedScanBasePath = useMemo(() => {
    if (scanBasePath) {
      return scanBasePath
    }
    if (!pathname) {
      return '/scan'
    }
    if (pathname.endsWith('/scan')) {
      return pathname
    }
    return pathname.replace(/\/$/, '')
  }, [pathname, scanBasePath])

  const stopCamera = useCallback(() => {
    scannerRef.current?.stop()
    setCameraActive(false)
  }, [])

  const goToResult = useCallback(
    (value: string) => {
      stopCamera()
      onScanSuccess?.()
      if (searchPath) {
        router.push(`${searchPath}?q=${encodeURIComponent(value)}`)
        return
      }
      router.push(
        `${resolvedScanBasePath}/result?code=${encodeURIComponent(value)}`
      )
    },
    [onScanSuccess, router, resolvedScanBasePath, searchPath, stopCamera]
  )

  const startCamera = useCallback(async () => {
    if (cameraActive || startingCamera) {
      return
    }
    if (!videoRef.current) {
      return
    }

    setStartingCamera(true)

    try {
      const hasCamera = await QrScanner.hasCamera()
      if (!hasCamera) {
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
            let raw = ''
            if (typeof result === 'string') {
              raw = result
            } else if (
              result &&
              typeof result === 'object' &&
              'data' in result
            ) {
              raw = String((result as { data?: unknown }).data ?? '')
            }
            const value = raw.trim()
            if (value) {
              goToResult(value)
            }
          },
          {
            preferredCamera: 'environment',
            highlightScanRegion: true,
            highlightCodeOutline: true,
            returnDetailedScanResult: true,
            maxScansPerSecond: 12,
            calculateScanRegion: video => {
              const smallestDimension = Math.min(
                video.videoWidth || video.clientWidth || 0,
                video.videoHeight || video.clientHeight || 0
              )
              const regionSize = Math.max(Math.floor(smallestDimension * 0.72), 220)

              return {
                x: Math.floor(((video.videoWidth || video.clientWidth) - regionSize) / 2),
                y: Math.floor(((video.videoHeight || video.clientHeight) - regionSize) / 2),
                width: regionSize,
                height: regionSize,
                downScaledWidth: 900,
                downScaledHeight: 900,
              }
            },
            onDecodeError: () => {},
          }
        )
      }

      await scannerRef.current.start()
      setCameraActive(true)
    } catch {
      toast.error('Camera access was blocked. Please allow permission.')
      stopCamera()
    } finally {
      setStartingCamera(false)
    }
  }, [cameraActive, goToResult, startingCamera, stopCamera])

  useEffect(() => {
    void startCamera()
  }, [startCamera])

  useEffect(() => {
    return () => {
      stopCamera()
      scannerRef.current?.destroy()
      scannerRef.current = null
    }
  }, [stopCamera])

  return (
    <div className="mx-auto w-full max-w-sm">
      <CardContent className="p-0">
        <div className="space-y-4 p-1 sm:p-4">
          <div className="space-y-1 px-1 sm:px-0">
            <CardTitle className="text-sm">Scan Asset QR</CardTitle>
            <p className="text-xs text-muted-foreground">
              Use your camera on mobile or tablet, then align the code inside
              the frame.
            </p>
          </div>

          <div className="relative aspect-square w-full overflow-hidden rounded-[1.4rem] bg-black">
            <video
              ref={videoRef}
              className="h-full w-full object-contain"
              muted
              playsInline
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                {startingCamera ? 'Starting camera...' : 'Camera preview'}
              </div>
            )}
            <div className="pointer-events-none absolute inset-4 rounded-[1.2rem] border border-dashed border-foreground/20" />
          </div>

          <div className="px-1 sm:px-0">
            <p className="text-xs text-muted-foreground">
              {cameraActive ? 'Camera is live' : startingCamera ? 'Starting camera...' : 'Camera preview'}
            </p>
          </div>
        </div>
      </CardContent>
    </div>
  )
}
