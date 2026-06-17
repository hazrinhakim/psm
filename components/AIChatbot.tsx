'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, CircleAlert, LoaderCircle, SendHorizonal, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type ChatMessage = {
  id: string
  role: 'user' | 'bot'
  content: string
}

type ChatbotApiResponse = {
  reply?: string
  error?: string
}

function getReadableChatbotError(raw?: string) {
  if (!raw) {
    return 'AI assistant is unavailable right now. Please try again in a moment.'
  }

  const normalized = raw.toLowerCase()

  if (
    normalized.includes('503') ||
    normalized.includes('unavailable') ||
    normalized.includes('high demand')
  ) {
    return 'AI assistant is currently busy due to high demand. Please try again in a moment.'
  }

  if (normalized.includes('unauthorized')) {
    return 'Your session has expired. Please sign in again and retry.'
  }

  if (normalized.includes('message is required')) {
    return 'Please enter a message before sending.'
  }

  if (normalized.includes('api key') || normalized.includes('not configured')) {
    return 'AI assistant is not configured properly on this deployment.'
  }

  return raw
}

function renderChatbotMessage(content: string) {
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

        const numberedMatch = normalizedLine.match(/^(\d+)\.\s+(.+)$/)
        if (numberedMatch) {
          return (
            <div
              key={`number-${index}`}
              className="flex items-start gap-2 text-sm leading-6 text-foreground"
            >
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

export function AIChatbot() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-message',
      role: 'bot',
      content:
        'Hello. I can help with ICT asset issues, maintenance request guidance, and ICAMS usage questions.',
    },
  ])
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedMessage = message.trim()
    if (!trimmedMessage || loading) {
      return
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedMessage,
    }

    setMessages(current => [...current, userMessage])
    setMessage('')
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ message: trimmedMessage }),
      })

      const payload = (await response.json().catch(() => null)) as ChatbotApiResponse | null

      if (!response.ok || !payload?.reply) {
        throw new Error(payload?.error ?? 'Failed to get AI response.')
      }

      const reply = payload.reply

      setMessages(current => [
        ...current,
        {
          id: `bot-${Date.now()}`,
          role: 'bot',
          content: reply,
        },
      ])
    } catch (requestError) {
      setError(
        getReadableChatbotError(
          requestError instanceof Error
            ? requestError.message
            : 'Failed to get AI response.'
        )
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="flex h-full w-full flex-col border-none shadow-none">
      <CardContent className="flex min-h-0 flex-1 flex-col px-3 sm:px-5 lg:px-8">
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-sm bg-muted/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-background/90 via-background/55 via-35% to-transparent backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_35%,transparent_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-background/90 via-background/55 via-35% to-transparent backdrop-blur-md [mask-image:linear-gradient(to_top,black_35%,transparent_100%)]" />

          <div className="h-full space-y-5 overflow-y-auto px-3 pt-12 pb-8 scroll-smooth sm:px-4">
            {messages.map(entry => (
              <div
                key={entry.id}
                className={
                  entry.role === 'bot'
                    ? 'mr-2 rounded-3xl border border-border/70 bg-background/85 p-4 backdrop-blur-sm sm:mr-8 dark:border-white/10 dark:bg-white/5'
                    : 'ml-2 rounded-3xl border border-sky-200/80 bg-sky-100/90 p-4 text-sky-950 backdrop-blur-sm sm:ml-8 dark:border-[rgba(56,189,248,0.28)] dark:bg-[rgba(14,116,144,0.28)] dark:text-sky-50'
                }
              >
                <div
                  className={
                    entry.role === 'bot'
                      ? 'mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'
                      : 'mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-[rgba(186,230,253,0.82)]'
                  }
                >
                  {entry.role === 'bot' ? (
                    <Bot className="h-3.5 w-3.5" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                  <span>{entry.role === 'bot' ? 'ICAMS AI' : 'You'}</span>
                </div>
                {renderChatbotMessage(entry.content)}
              </div>
            ))}

            {loading ? (
              <div className="mr-8 rounded-3xl border border-border/70 bg-background/85 p-4 backdrop-blur-sm">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Bot className="h-3.5 w-3.5" />
                  <span>ICAMS AI</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            ) : null}

            <div ref={endRef} />
          </div>
        </div>

        {error ? (
          <Alert variant="destructive" className="mt-3">
            <CircleAlert className="h-4 w-4" />
            <AlertTitle>Assistant error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-3 sm:flex-row">
          <Input
            value={message}
            onChange={event => setMessage(event.target.value)}
            placeholder="Ask about ICT assets, maintenance requests, or ICAMS usage"
            className="h-11 flex-1 rounded-full px-6"
          />
          <Button
            type="submit"
            disabled={loading || !message.trim()}
            className="h-11 w-full rounded-full px-5 sm:w-auto"
          >
            <SendHorizonal className="mr-2 h-4 w-4" />
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
