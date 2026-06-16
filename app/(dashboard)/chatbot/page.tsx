import { AIChatbot } from '@/components/AIChatbot'

export const dynamic = 'force-dynamic'

export default function ChatbotPage() {
  return (
    <div className="mx-auto flex h-[calc(100svh-9rem)] w-full flex-col overflow-hidden py-2">
      <div className="space-y-2 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          ICAMS AI Assistant
        </h1>
        <p className="text-sm text-muted-foreground">
          Ask questions about ICT asset problems, maintenance requests, system usage, or reporting procedures in ICAMS.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <AIChatbot />
      </div>
    </div>
  )
}
