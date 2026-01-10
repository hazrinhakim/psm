'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

type SonnerVariant = 'default' | 'success' | 'info' | 'warning' | 'error'

type SonnerNotifierProps = {
  message: string
  title?: string
  variant?: SonnerVariant
  toastId?: string
}

export function SonnerNotifier({
  message,
  title,
  variant = 'default',
  toastId,
}: SonnerNotifierProps) {
  useEffect(() => {
    if (!message) {
      return
    }

    const options = title ? { description: message, id: toastId } : { id: toastId }
    const content = title ?? message

    if (variant === 'success') {
      toast.success(content, options)
      return
    }
    if (variant === 'info') {
      toast.info(content, options)
      return
    }
    if (variant === 'warning') {
      toast.warning(content, options)
      return
    }
    if (variant === 'error') {
      toast.error(content, options)
      return
    }

    toast(content, options)
  }, [message, title, toastId, variant])

  return null
}
