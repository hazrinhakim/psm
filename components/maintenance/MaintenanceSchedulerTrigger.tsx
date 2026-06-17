'use client'

import { useEffect } from 'react'

const STORAGE_KEY = 'icams-maintenance-scheduler-triggered-at'
const COOLDOWN_MS = 10 * 60 * 1000

export function MaintenanceSchedulerTrigger() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const lastTriggeredAt = Number(window.sessionStorage.getItem(STORAGE_KEY) ?? '0')
    if (Number.isFinite(lastTriggeredAt) && Date.now() - lastTriggeredAt < COOLDOWN_MS) {
      return
    }

    window.sessionStorage.setItem(STORAGE_KEY, String(Date.now()))

    void fetch('/api/maintenance/run-scheduler', {
      method: 'POST',
      credentials: 'same-origin',
    }).catch(() => {
      window.sessionStorage.removeItem(STORAGE_KEY)
    })
  }, [])

  return null
}
