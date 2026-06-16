'use client'

import * as React from 'react'
import {
  Bot,
  LoaderCircle,
  SendHorizonal,
  MonitorSmartphone,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'

type AssistantAssetOption = {
  id: string
  label: string
  subtitle?: string | null
}

type MaintenanceAiAssistantProps = {
  assets: AssistantAssetOption[]
}

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type AssistantResponsePayload = {
  answer?: string
  error?: string
}

function renderMessageContent(content: string) {
  const lines = content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())

  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        const normalizedLine = line.trim()

        if (!normalizedLine) {
          return <div key={`spacer-${index}`} className="h-2" />
        }

        const headingMatch = normalizedLine.match(/^#{1,6}\s*(.+)$/)
        if (headingMatch) {
          return (
            <h4 key={`heading-${index}`} className="text-sm font-semibold text-foreground">
              {headingMatch[1]}
            </h4>
          )
        }

        const bulletMatch = normalizedLine.match(/^[-*]\s+(.+)$/)
        if (bulletMatch) {
          return (
            <div key={`bullet-${index}`} className="flex items-start gap-2 text-sm leading-6 text-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
              <p>{bulletMatch[1]}</p>
            </div>
          )
        }

        const numberedMatch = normalizedLine.match(/^(\d+)\.\s+(.+)$/)
        if (numberedMatch) {
          return (
            <div key={`number-${index}`} className="flex items-start gap-2 text-sm leading-6 text-foreground">
              <span className="min-w-5 font-semibold text-muted-foreground">
                {numberedMatch[1]}.
              </span>
              <p>{numberedMatch[2]}</p>
            </div>
          )
        }

        return (
          <p key={`paragraph-${index}`} className="text-sm leading-6 text-foreground">
            {normalizedLine}
          </p>
        )
      })}
    </div>
  )
}

function getReadableAssistantError(raw?: string) {
  if (!raw) {
    return 'AI assistant tidak dapat memberi jawapan buat masa ini. Sila cuba sebentar lagi.'
  }

  const normalized = raw.toLowerCase()

  if (
    normalized.includes('503') ||
    normalized.includes('unavailable') ||
    normalized.includes('high demand')
  ) {
    return 'AI assistant sedang sibuk sekarang. Sila cuba semula sebentar lagi.'
  }

  if (normalized.includes('api key')) {
    return 'Konfigurasi AI assistant belum lengkap. Sila semak API key.'
  }

  return raw
}

export function MaintenanceAiAssistant({
  assets,
}: MaintenanceAiAssistantProps) {
  const [selectedAssetId, setSelectedAssetId] = React.useState<string>('none')
  const [message, setMessage] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: 'assistant-welcome',
      role: 'assistant',
      content:
        'Terangkan masalah aset yang anda hadapi. Saya akan bantu diagnosis awal dan cadangkan tindakan seterusnya.',
    },
  ])
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null)

  const selectedAsset = React.useMemo(
    () => assets.find(asset => asset.id === selectedAssetId) ?? null,
    [assets, selectedAssetId]
  )

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedMessage = message.trim()
    if (!trimmedMessage || loading) {
      return
    }

    const userEntry: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedMessage,
    }
    const nextConversation = [...messages.slice(-8), userEntry]

    setMessages(current => [...current, userEntry])
    setMessage('')
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/maintenance/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          assetId: selectedAssetId === 'none' ? '' : selectedAssetId,
          message: trimmedMessage,
          history: nextConversation.map(entry => ({
            role: entry.role,
            content: entry.content,
          })),
        }),
      })

      const payload = (await response.json().catch(() => null)) as AssistantResponsePayload | null

      if (!response.ok || !payload?.answer) {
        throw new Error(payload?.error ?? 'Unable to get assistant response.')
      }

      const answer = payload.answer

      setMessages(current => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: answer,
        },
      ])
    } catch (requestError) {
      setError(
        getReadableAssistantError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to get assistant response.'
        )
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Bot className="h-4 w-4 text-blue-600" />
            AI Troubleshooting Assistant
          </CardTitle>
          <CardDescription>
            Diagnosis awal yang ringkas sebelum anda teruskan kepada maintenance request.
          </CardDescription>
        </div>
        <div className="w-fit rounded-full border border-emerald-200/90 bg-emerald-100/50 px-3 py-1 text-xs font-medium text-emerald-700">
          Early troubleshooting only
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-border/70 bg-muted/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <MonitorSmartphone className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-semibold text-foreground">Asset context</p>
              </div>
              <div className="space-y-2">
                <Label>Select asset</Label>
                <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">General question only</SelectItem>
                    {assets.map(asset => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 rounded-2xl border border-border/70 bg-background p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    {selectedAsset ? 'Selected asset' : 'General question'}
                  </Badge>
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  {selectedAsset?.label ?? 'Tiada asset dipilih'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedAsset?.subtitle ??
                    'AI akan jawab secara umum jika tiada asset context dipilih.'}
                </p>
              </div>
            </div>
              <div className="flex items-start gap-2 rounded-2xl border border-amber-200/70 bg-amber-50/70 px-3 py-3 text-xs text-amber-800">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Gunakan AI untuk semakan awal. Jika isu berulang, kritikal, atau berisiko, terus eskalasi kepada admin atau juruteknik.
                </p>
              </div>
          </div>

          <div className="flex min-h-[560px] flex-col rounded-3xl border border-border/70 bg-white">
            <div className="border-b border-border/70 px-5 py-4">
              <p className="text-sm font-semibold text-foreground">Conversation</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Terangkan simptom, apa yang sudah dicuba, dan bila masalah mula berlaku.
              </p>
            </div>

            <ScrollArea className="flex-1 px-5 py-4">
              <div className="space-y-3 pr-1">
                {messages.map(entry => (
                  <div
                    key={entry.id}
                    className={
                      entry.role === 'assistant'
                        ? 'mr-8 rounded-3xl border border-border/70 bg-muted/20 p-4'
                        : 'ml-8 rounded-3xl border border-blue-200/70 bg-blue-50/60 p-4'
                    }
                  >
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {entry.role === 'assistant' ? 'AI assistant' : 'You'}
                    </p>
                    {renderMessageContent(entry.content)}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-border/70 px-5 py-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-2">
                  <Label>Problem description</Label>
                  <Textarea
                    value={message}
                    onChange={event => setMessage(event.target.value)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        const form = event.currentTarget.form
                        if (form) {
                          form.requestSubmit()
                        }
                      }
                    }}
                    placeholder="Contoh: Printer tidak detect paper walaupun tray penuh."
                    className="min-h-[120px] rounded-2xl"
                  />
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <div className="flex items-center justify-end">
                  <Button
                    type="submit"
                    disabled={loading || !message.trim()}
                    className="gap-2 rounded-full px-5"
                  >
                    {loading ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <SendHorizonal className="h-4 w-4" />
                    )}
                    Ask assistant
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div ref={messagesEndRef} />
      </CardContent>
    </Card>
  )
}
